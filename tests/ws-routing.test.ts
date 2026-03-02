/**
 * Tests for WebSocket multi-context routing.
 *
 * Ported from cartesia-python/tests/test_dispatcher.py. These unit tests
 * verify two key properties using a mock WebSocket (no API key required):
 *
 * 1. Events are buffered in per-context queues before receive() is called.
 * 2. A slow reader on one context does not block readers on other contexts.
 *
 * Additional tests cover correct routing by context_id and receive timeouts.
 */

import { TTSWS } from '@cartesia/cartesia-js/resources/tts/ws';
import { WebSocketTimeoutError } from '@cartesia/cartesia-js/resources/tts/internal-base';
import type { WebsocketResponse } from '@cartesia/cartesia-js/resources/tts/tts';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const CONTEXT_OPTIONS = {
  model_id: 'sonic-3',
  voice: { id: 'test-voice', mode: 'id' as const },
  output_format: { container: 'raw' as const, encoding: 'pcm_f32le' as const, sample_rate: 44100 as const },
};

/** Create a TTSWS whose underlying socket will fail to connect (that's fine —
 *  we inject messages by emitting directly on the socket). */
function createTestWS(): TTSWS {
  const fakeClient = { baseURL: 'http://127.0.0.1:1', token: 'test' } as any;
  const ws = new TTSWS(fakeClient);
  // Suppress connection‑error noise.
  ws.on('error', () => {});
  ws.connect().catch(() => {});
  return ws;
}

/** Simulate a server‑sent message by emitting directly on the socket. */
function injectEvent(ws: TTSWS, event: Record<string, unknown>) {
  ws.socket.emit('message', Buffer.from(JSON.stringify(event)), false);
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

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WebSocket multi-context routing', () => {
  test('events are buffered in context queue before receive() is called', async () => {
    const ws = createTestWS();
    const NUM_CHUNKS = 50;
    const CTX_ID = 'buffer-test';

    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: CTX_ID });

    // Push many messages before anyone calls receive().
    for (let i = 0; i < NUM_CHUNKS; i++) {
      injectEvent(ws, makeChunk(CTX_ID, i));
    }
    injectEvent(ws, makeDone(CTX_ID));

    // All messages should already be sitting in the context queue.
    const entry = ws._getContextQueue(CTX_ID);
    expect(entry).toBeDefined();
    expect(entry!.queue.length).toBe(NUM_CHUNKS + 1); // chunks + done

    // Now consume via receive() — everything should already be available.
    const chunks: WebsocketResponse[] = [];
    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        chunks.push(event);
      }
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

    // Each context should only see its own events.
    const ctx1Events: WebsocketResponse[] = [];
    for await (const event of ctx1.receive()) {
      ctx1Events.push(event);
    }

    const ctx2Events: WebsocketResponse[] = [];
    for await (const event of ctx2.receive()) {
      ctx2Events.push(event);
    }

    expect(ctx1Events.filter((e) => e.type === 'chunk').length).toBe(2);
    expect(ctx1Events[ctx1Events.length - 1]!.type).toBe('done');

    expect(ctx2Events.filter((e) => e.type === 'chunk').length).toBe(2);
    expect(ctx2Events[ctx2Events.length - 1]!.type).toBe('done');

    // Verify context_ids are correct.
    for (const event of ctx1Events) {
      expect((event as any).context_id).toBe('ctx-1');
    }
    for (const event of ctx2Events) {
      expect((event as any).context_id).toBe('ctx-2');
    }

    ws.close();
  });

  test('slow reader does not block fast reader', async () => {
    const ws = createTestWS();
    const NUM_CHUNKS = 20;
    const SLOW_DELAY = 50; // ms per event for slow reader

    const ctxSlow = ws.context({ ...CONTEXT_OPTIONS, contextId: 'slow-ctx' });
    const ctxFast = ws.context({ ...CONTEXT_OPTIONS, contextId: 'fast-ctx' });

    // Inject interleaved messages for both contexts.
    for (let i = 0; i < NUM_CHUNKS; i++) {
      injectEvent(ws, makeChunk('slow-ctx', i));
      injectEvent(ws, makeChunk('fast-ctx', i));
    }
    injectEvent(ws, makeDone('slow-ctx'));
    injectEvent(ws, makeDone('fast-ctx'));

    // Slow reader: sleeps between every event.
    async function slowCollect(): Promise<WebsocketResponse[]> {
      const chunks: WebsocketResponse[] = [];
      for await (const event of ctxSlow.receive()) {
        if (event.type === 'chunk') chunks.push(event);
        await sleep(SLOW_DELAY);
      }
      return chunks;
    }

    // Fast reader: no delays.
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

    // The fast reader should finish nearly instantly (all events already queued).
    // The slow reader needs at least NUM_CHUNKS * SLOW_DELAY ≈ 1000ms.
    const fastDuration = fastEnd - fastStart;
    const slowMinDuration = NUM_CHUNKS * SLOW_DELAY;

    expect(fastDuration).toBeLessThan(slowMinDuration / 2);

    ws.close();
  });

  test('context queue is cleaned up after receive() completes', async () => {
    const ws = createTestWS();

    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'cleanup-test' });

    expect(ws._getContextQueue('cleanup-test')).toBeDefined();

    injectEvent(ws, makeChunk('cleanup-test', 0));
    injectEvent(ws, makeDone('cleanup-test'));

    // Drain receive.
    for await (const _event of ctx.receive()) {
      // consume
    }

    // Queue should be cleaned up after done.
    expect(ws._getContextQueue('cleanup-test')).toBeUndefined();

    ws.close();
  });

  test('cancel() unregisters the context queue', async () => {
    const ws = createTestWS();

    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'cancel-test' });
    expect(ws._getContextQueue('cancel-test')).toBeDefined();

    await ctx.cancel();
    expect(ws._getContextQueue('cancel-test')).toBeUndefined();

    ws.close();
  });

  test('cancel() while receive() is waiting unblocks receive()', async () => {
    const ws = createTestWS();

    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'cancel-while-waiting' });

    // Start receiving (will block waiting for events).
    const events: WebsocketResponse[] = [];
    const receivePromise = (async () => {
      for await (const event of ctx.receive()) {
        events.push(event);
      }
    })();

    // Give receive() a tick to start waiting.
    await new Promise<void>((r) => setTimeout(r, 10));

    // Cancel should unblock receive().
    await ctx.cancel();

    // receive() should complete without hanging.
    await receivePromise;

    expect(events.length).toBe(0);
    expect(ws._getContextQueue('cancel-while-waiting')).toBeUndefined();

    ws.close();
  });

  test('generate() unregisters context queue to avoid memory leak', async () => {
    const ws = createTestWS();

    const ctx = ws.context({ ...CONTEXT_OPTIONS, contextId: 'gen-leak-test' });
    expect(ws._getContextQueue('gen-leak-test')).toBeDefined();

    // Calling generate() should immediately unregister the per-context queue
    // so events don't accumulate in both the queue and generate()'s local buffer.
    // We just need to start the generator to trigger the unregister — we don't
    // need to actually consume it (that would require a live connection).
    const gen = ctx.generate({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: 'test-voice' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 as const },
      transcript: 'test',
    });

    // Advance the generator to the first yield point (triggers unregister).
    // It will hang on send() since there's no connection, so race with a timeout.
    const step = Promise.race([gen.next(), new Promise<void>((r) => setTimeout(r, 50))]);
    await step;

    expect(ws._getContextQueue('gen-leak-test')).toBeUndefined();

    ws.close();
  });

  test('receive() with timeout throws WebSocketTimeoutError', async () => {
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
      for await (const event of ctx.receive()) {
        events.push(event);
      }
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeInstanceOf(WebSocketTimeoutError);
    // Should have received the one chunk before timing out.
    expect(events.length).toBe(1);
    expect(events[0]!.type).toBe('chunk');

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
      for await (const _event of ctx.receive({ timeout: 100 })) {
        // consume
      }
    } catch (err) {
      thrownError = err;
    }
    const elapsed = performance.now() - start;

    expect(thrownError).toBeInstanceOf(WebSocketTimeoutError);
    // Should have timed out after ~100ms, not 10s.
    expect(elapsed).toBeLessThan(1000);

    ws.close();
  });
});
