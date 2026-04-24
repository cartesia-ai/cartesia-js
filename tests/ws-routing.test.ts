/**
 * Tests for the TTS WebSocket multi-context contract.
 *
 * These tests use a mock WebSocket (no API key needed) and focus on the
 * observable contract of {@link TTSWS} and {@link TTSWSContext}:
 *
 *  - Events injected by the server are buffered per-context and delivered
 *    in order to the context that owns them.
 *  - A slow reader on one context does not block readers on other contexts.
 *  - A server-sent `error` event completes `receive()` without throwing.
 *  - When the socket disconnects or reconnects, each live context receives
 *    an error event that terminates `receive()`, but any events that
 *    already arrived can still be drained first.
 *  - `receive()` and `generate()` are mutually exclusive on a single context.
 *  - Per-call and per-context receive timeouts are honored.
 */
import { TTSWS, type TTSWSClientOptions } from '@cartesia/cartesia-js/resources/tts/ws';
import { WebSocketTimeoutError } from '@cartesia/cartesia-js/resources/tts/internal-base';
import type { WebsocketResponse } from '@cartesia/cartesia-js/resources/tts/tts';
import { ReadyState } from '@cartesia/cartesia-js/internal/ws-adapter';
import EventEmitter from 'node:events';
import { NodeWebSocket } from '@cartesia/cartesia-js/internal/ws-adapter-node';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const CONTEXT_OPTIONS = {
  model_id: 'sonic-3',
  voice: { id: 'test-voice', mode: 'id' as const },
  output_format: { container: 'raw' as const, encoding: 'pcm_f32le' as const, sample_rate: 44100 as const },
};

const REQUEST = { ...CONTEXT_OPTIONS, transcript: 'test' };

/** In-memory stand-in for `ws.WebSocket`. Stays in OPEN so connect()/send()
 *  are no-ops, but is an EventEmitter so injectEvent() can push 'message' frames. */
class FakePlatformSocket extends EventEmitter {
  readyState: number = ReadyState.OPEN;
  send = jest.fn();
  close = jest.fn((code: number = 1000) => {
    this.readyState = ReadyState.CLOSED;
    // Mirror `ws` library: close() eventually emits 'close' on the emitter.
    queueMicrotask(() => this.emit('close', code, Buffer.from('')));
  });
}

class TestTTSWS extends TTSWS {
  protected override _createSocket(): NodeWebSocket {
    return new NodeWebSocket(new FakePlatformSocket() as any);
  }
}

function createTestWS(options?: TTSWSClientOptions): TTSWS {
  const fakeClient = {
    baseURL: 'http://127.0.0.1:1',
    token: 'test',
    buildURL(path: string, query: Record<string, unknown> | null | undefined): string {
      const url = new URL(
        this.baseURL + (this.baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path),
      );
      if (query && typeof query === 'object' && !Array.isArray(query)) {
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined) url.searchParams.set(key, String(value));
        }
      }
      return url.toString();
    },
  } as any;

  const ws = new TestTTSWS(fakeClient, options);
  // Silence unhandled rejections from server-sent error events; per-context
  // errors are asserted via receive() in the tests that exercise them.
  ws.on('error', () => {});
  void ws.connect(); // resolves immediately (fake socket is OPEN)
  return ws;
}

function injectEvent(ws: TTSWS, event: Record<string, unknown>) {
  if (ws.socket !== null && 'emit' in ws.socket.platformSocket) {
    ws.socket.platformSocket.emit('message', Buffer.from(JSON.stringify(event)), false);
  }
}

function makeChunk(contextId: string, seq: number): Record<string, unknown> {
  return {
    type: 'chunk',
    context_id: contextId,
    data: `audio_${seq}`,
    done: false,
    status_code: 200,
  };
}

function makeDone(contextId: string): Record<string, unknown> {
  return {
    type: 'done',
    context_id: contextId,
    done: true,
    status_code: 200,
  };
}

function makeError(contextId: string, error: string = 'server error'): Record<string, unknown> {
  return {
    type: 'error',
    context_id: contextId,
    error,
    done: true,
    status_code: 500,
  };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WebSocket multi-context routing', () => {
  test('events injected before receive() are delivered in order', async () => {
    const ws = createTestWS();
    const NUM_CHUNKS = 50;
    const CTX_ID = 'buffer-test';

    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: CTX_ID });

    // Push many messages before anyone calls receive().
    for (let i = 0; i < NUM_CHUNKS; i++) {
      injectEvent(ws, makeChunk(CTX_ID, i));
    }
    injectEvent(ws, makeDone(CTX_ID));

    const chunks: WebsocketResponse[] = [];
    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') chunks.push(event);
    }
    expect(chunks.length).toBe(NUM_CHUNKS);

    ws.close();
  });

  test('events are routed to the correct context', async () => {
    const ws = createTestWS();

    const ctx1 = ws.context({ ...CONTEXT_OPTIONS, contextId: 'ctx-1' });
    const ctx2 = ws.context({ ...CONTEXT_OPTIONS, contextId: 'ctx-2' });

    // Inject interleaved messages for both contexts.
    injectEvent(ws, makeChunk('ctx-1', 0));
    injectEvent(ws, makeChunk('ctx-2', 0));
    injectEvent(ws, makeChunk('ctx-1', 1));
    injectEvent(ws, makeChunk('ctx-2', 1));
    injectEvent(ws, makeDone('ctx-1'));
    injectEvent(ws, makeDone('ctx-2'));

    const ctx1Events: WebsocketResponse[] = [];
    for await (const event of ctx1.receive()) ctx1Events.push(event);

    const ctx2Events: WebsocketResponse[] = [];
    for await (const event of ctx2.receive()) ctx2Events.push(event);

    expect(ctx1Events.filter((e) => e.type === 'chunk').length).toBe(2);
    expect(ctx1Events[ctx1Events.length - 1]?.type).toBe('done');
    expect(ctx2Events.filter((e) => e.type === 'chunk').length).toBe(2);
    expect(ctx2Events[ctx2Events.length - 1]?.type).toBe('done');

    for (const event of ctx1Events) expect(event.context_id).toBe('ctx-1');
    for (const event of ctx2Events) expect(event.context_id).toBe('ctx-2');

    ws.close();
  });

  test('slow reader does not block fast reader', async () => {
    const ws = createTestWS();
    const NUM_CHUNKS = 20;
    const SLOW_DELAY = 50; // ms per event for slow reader

    const ctxSlow = ws.context({ ...CONTEXT_OPTIONS, contextId: 'slow-ctx' });
    const ctxFast = ws.context({ ...CONTEXT_OPTIONS, contextId: 'fast-ctx' });

    for (let i = 0; i < NUM_CHUNKS; i++) {
      injectEvent(ws, makeChunk('slow-ctx', i));
      injectEvent(ws, makeChunk('fast-ctx', i));
    }
    injectEvent(ws, makeDone('slow-ctx'));
    injectEvent(ws, makeDone('fast-ctx'));

    async function slowCollect(): Promise<WebsocketResponse[]> {
      const chunks: WebsocketResponse[] = [];
      for await (const event of ctxSlow.receive()) {
        if (event.type === 'chunk') chunks.push(event);
        await sleep(SLOW_DELAY);
      }
      return chunks;
    }

    let fastStart = 0;
    let fastEnd = 0;
    async function fastCollect(): Promise<WebsocketResponse[]> {
      fastStart = performance.now();
      const chunks: WebsocketResponse[] = [];
      for await (const event of ctxFast.receive()) {
        if (event.type === 'chunk') chunks.push(event);
      }
      fastEnd = performance.now();
      return chunks;
    }

    const [slowChunks, fastChunks] = await Promise.all([slowCollect(), fastCollect()]);

    expect(slowChunks.length).toBe(NUM_CHUNKS);
    expect(fastChunks.length).toBe(NUM_CHUNKS);

    // Fast reader finishes nearly instantly; slow reader needs ≈ NUM_CHUNKS * SLOW_DELAY.
    const fastDuration = fastEnd - fastStart;
    const slowMinDuration = NUM_CHUNKS * SLOW_DELAY;
    expect(fastDuration).toBeLessThan(slowMinDuration / 2);

    ws.close();
  });

  test('a server-sent error event ends receive() without throwing', async () => {
    const ws = createTestWS();
    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'err-evt' });

    injectEvent(ws, makeChunk('err-evt', 0));
    injectEvent(ws, makeError('err-evt', 'bad thing'));
    // Events queued after a done-like error should not be yielded.
    injectEvent(ws, makeChunk('err-evt', 1));

    const events: WebsocketResponse[] = [];
    for await (const event of ctx.receive()) events.push(event);

    expect(events.map((e) => e.type)).toEqual(['chunk', 'error']);

    ws.close();
  });

  test('explicit close() delivers an error event to every live context, prior events still flow', async () => {
    const ws = createTestWS();
    const ctxA = ws.context({ ...CONTEXT_OPTIONS, contextId: 'close-a' });
    const ctxB = ws.context({ ...CONTEXT_OPTIONS, contextId: 'close-b' });

    injectEvent(ws, makeChunk('close-a', 0));
    injectEvent(ws, makeChunk('close-b', 0));

    ws.close();

    const eventsA: WebsocketResponse[] = [];
    for await (const event of ctxA.receive()) eventsA.push(event);

    const eventsB: WebsocketResponse[] = [];
    for await (const event of ctxB.receive()) eventsB.push(event);

    expect(eventsA.map((e) => e.type)).toEqual(['chunk', 'error']);
    expect(eventsB.map((e) => e.type)).toEqual(['chunk', 'error']);
  });

  test("'reconnecting' delivers an error event to every live context, prior events still flow", async () => {
    const ws = createTestWS({
      reconnect: { maxRetries: 5, initialDelay: 1, maxDelay: 5 },
    });

    const ctxA = ws.context({ ...CONTEXT_OPTIONS, contextId: 'recon-a' });
    const ctxB = ws.context({ ...CONTEXT_OPTIONS, contextId: 'recon-b' });

    injectEvent(ws, makeChunk('recon-a', 0));
    injectEvent(ws, makeChunk('recon-b', 0));

    // Recoverable close triggers the SDK's reconnect flow — which emits 'reconnecting',
    // then creates a fresh (fake-OPEN) socket via TestTTSWS._createSocket.
    ws.socket?.platformSocket.close(1006);

    // Wait past initialDelay + jitter for the full reconnect cycle.
    await sleep(50);

    const eventsA: WebsocketResponse[] = [];
    for await (const event of ctxA.receive()) eventsA.push(event);

    const eventsB: WebsocketResponse[] = [];
    for await (const event of ctxB.receive()) eventsB.push(event);

    expect(eventsA.map((e) => e.type)).toEqual(['chunk', 'error']);
    expect(eventsB.map((e) => e.type)).toEqual(['chunk', 'error']);

    ws.close();
  });

  test('cancel() does not end receive() on its own; pending events still reach the consumer', async () => {
    const ws = createTestWS();
    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'cancelled' });

    injectEvent(ws, makeChunk('cancelled', 0));
    await ctx.cancel();

    // Until the server sends done/error in response to the cancel, receive() keeps waiting.
    // The already-queued chunk is still deliverable.
    injectEvent(ws, makeDone('cancelled'));

    const events: WebsocketResponse[] = [];
    for await (const event of ctx.receive()) events.push(event);

    expect(events.map((e) => e.type)).toEqual(['chunk', 'done']);

    ws.close();
  });

  test('receive() with per-context timeout throws WebSocketTimeoutError', async () => {
    const ws = createTestWS();
    const ctx = ws.context({
      ...CONTEXT_OPTIONS,
      contextId: 'timeout-test',
      timeout: 100,
    });

    // Inject one chunk but no done event — receive will wait and timeout.
    injectEvent(ws, makeChunk('timeout-test', 0));

    const events: WebsocketResponse[] = [];
    let thrownError: unknown;
    try {
      for await (const event of ctx.receive()) events.push(event);
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeInstanceOf(WebSocketTimeoutError);
    expect(events.length).toBe(1);
    expect(events[0]?.type).toBe('chunk');

    ws.close();
  });

  test('receive() per-call timeout overrides context timeout', async () => {
    const ws = createTestWS();
    const ctx = ws.context({
      ...CONTEXT_OPTIONS,
      contextId: 'timeout-override',
      timeout: 10_000, // very long default
    });

    injectEvent(ws, makeChunk('timeout-override', 0));

    const start = performance.now();
    let thrownError: unknown;
    try {
      for await (const _event of ctx.receive({ timeout: 100 })) void _event;
    } catch (err) {
      thrownError = err;
    }
    const elapsed = performance.now() - start;

    expect(thrownError).toBeInstanceOf(WebSocketTimeoutError);
    // Should have timed out after ~100ms, not 10s.
    expect(elapsed).toBeLessThan(1000);

    ws.close();
  });

  test('generate() throws if receive() is already in progress on the same context', async () => {
    const ws = createTestWS();
    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'recv-then-gen' });

    // Start receive waiting on an empty queue — this marks the context as in-use.
    const receivePromise = (async () => {
      const events: WebsocketResponse[] = [];
      for await (const event of ctx.receive()) events.push(event);
      return events;
    })();
    await sleep(10);

    const gen = ctx.generate(REQUEST);
    await expect(gen.next()).rejects.toThrow();

    // Unblock receive so the test can finish.
    injectEvent(ws, makeDone('recv-then-gen'));
    await receivePromise;

    ws.close();
  });

  test('receive() yields nothing after generate() completes on the same context', async () => {
    const ws = createTestWS();
    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'gen-then-recv' });

    const genDone = (async () => {
      for await (const _ of ctx.generate(REQUEST)) void _;
    })();
    await sleep(10);
    injectEvent(ws, makeDone('gen-then-recv'));
    await genDone;

    // Context is finished — receive() returns immediately without yielding anything.
    const events: WebsocketResponse[] = [];
    for await (const event of ctx.receive()) events.push(event);
    expect(events.length).toBe(0);

    ws.close();
  });

  test('generate() delivers only events for its context', async () => {
    const ws = createTestWS();
    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'gen-only' });

    const gen = ctx.generate(REQUEST);
    const events: WebsocketResponse[] = [];
    const collect = (async () => {
      for await (const e of gen) events.push(e);
    })();
    await sleep(10);

    injectEvent(ws, makeChunk('gen-only', 0));
    injectEvent(ws, makeChunk('other-ctx', 0)); // should be ignored
    injectEvent(ws, makeChunk('gen-only', 1));
    injectEvent(ws, makeDone('gen-only'));

    await collect;

    expect(events.map((e) => e.type)).toEqual(['chunk', 'chunk', 'done']);
    for (const e of events) expect(e.context_id).toBe('gen-only');

    ws.close();
  });

  test('a context ID can be reused after receive() completes', async () => {
    const ws = createTestWS();

    const ctx1 = ws.context({ ...CONTEXT_OPTIONS, contextId: 'reuse-id' });
    injectEvent(ws, makeChunk('reuse-id', 0));
    injectEvent(ws, makeDone('reuse-id'));

    for await (const _ of ctx1.receive()) void _;

    // Previous queue was cleaned up, so the same ID is available again.
    const ctx2 = ws.context({ ...CONTEXT_OPTIONS, contextId: 'reuse-id' });
    expect(ctx2.contextId).toBe('reuse-id');

    ws.close();
  });

  test('creating a context with a duplicate live ID throws', async () => {
    const ws = createTestWS();
    ws.context({ ...CONTEXT_OPTIONS, contextId: 'dup' });
    expect(() => ws.context({ ...CONTEXT_OPTIONS, contextId: 'dup' })).toThrow(/Duplicate context ID/);

    ws.close();
  });

  test('connect() throws after explicit close()', async () => {
    const ws = createTestWS();
    ws.close();
    await expect(ws.connect()).rejects.toThrow(/cannot connect since it was closed/);
  });
});
