/**
 * Unit tests for TTSContextManager and TTSContext.
 *
 * Tests run against a real local ws server so the underlying socket actually
 * opens (avoiding flakiness from connection-refused timing). Server-sent
 * messages and close events are simulated by emitting directly on the platform
 * socket — this triggers the listeners that TTSWSBase has registered without
 * requiring real network round-trips.
 */

import { WebSocketServer, WebSocket as WS } from 'ws';
import type { AddressInfo } from 'net';
import { Cartesia } from '@cartesia/cartesia-js';
import { CartesiaError } from '@cartesia/cartesia-js/core/error';
import { type TTSContexts } from '@cartesia/cartesia-js/resources';
import { ReadyState } from '@cartesia/cartesia-js/internal/ws-adapter';
import { TTSContextManager } from '@cartesia/cartesia-js/lib/tts/ws/context-manager';

// ---- Local ws server -----------------------------------------------------

let server: WebSocketServer;
let serverPort: number;
const acceptedConnections: WS[] = [];

beforeAll(
  () =>
    new Promise<void>((resolve) => {
      server = new WebSocketServer({ port: 0 });
      server.on('connection', (socket) => {
        acceptedConnections.push(socket);
      });
      server.on('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
        resolve();
      });
    }),
);

afterAll(
  () =>
    new Promise<void>((resolve) => {
      for (const c of acceptedConnections) {
        try {
          c.terminate();
        } catch {}
      }
      acceptedConnections.length = 0;
      server.close(() => resolve());
    }),
);

// ---- Per-test manager tracking -------------------------------------------

const managers: TTSContexts.IManager[] = [];

afterEach(() => {
  for (const m of managers) {
    try {
      m.close();
    } catch {}
  }
  managers.length = 0;
});

function createTestManager(): TTSContexts.IManager {
  const client = new Cartesia({
    apiKey: 'test',
    baseURL: `http://127.0.0.1:${serverPort}`,
  });
  const manager = new TTSContextManager(client);
  // Suppress unhandled-rejection noise; tests that care will register their own.
  manager.on('error', () => {});
  managers.push(manager);
  return manager;
}

function platformSocket(manager: TTSContexts.IManager): WS {
  return (manager as any)._ws.socket.platformSocket;
}

function injectEvent(manager: TTSContexts.IManager, event: Record<string, unknown>) {
  platformSocket(manager).emit('message', Buffer.from(JSON.stringify(event)), false);
}

function emitSocketClose(manager: TTSContexts.IManager, code = 1006, reason = 'test') {
  platformSocket(manager).emit('close', code, Buffer.from(reason));
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---- Event factories -----------------------------------------------------

const CONTEXT_OPTIONS: TTSContexts.ContextParams = {
  model_id: 'sonic-3',
  voice: { id: 'test-voice', mode: 'id' as const },
  output_format: {
    container: 'raw' as const,
    encoding: 'pcm_f32le' as const,
    sample_rate: 44100 as const,
  },
};

function makeChunk(contextId: string, seq = 0): Record<string, unknown> {
  return {
    type: 'chunk',
    context_id: contextId,
    data: Buffer.from(`audio_${seq}`).toString('base64'),
    done: false,
    status_code: 200,
    step_time: 0,
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

function makeError(contextId: string, opts?: { done?: boolean }): Record<string, unknown> {
  return {
    type: 'error',
    context_id: contextId,
    done: opts?.done ?? true,
    title: 'test error',
    status_code: 400,
  };
}

// =========================================================================
// TTSContextManager
// =========================================================================

describe('TTSContextManager.context()', () => {
  test('uses the provided contextId', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'my-id' });
    expect(ctx.contextId).toBe('my-id');
    expect(ctx.isClosed).toBe(false);
  });

  test('auto-generates a contextId when none is provided', () => {
    const manager = createTestManager();
    const ctx = manager.context(CONTEXT_OPTIONS);
    expect(typeof ctx.contextId).toBe('string');
    expect(ctx.contextId.length).toBeGreaterThan(0);
  });

  test('throws on duplicate contextId', () => {
    const manager = createTestManager();
    manager.context({ ...CONTEXT_OPTIONS, context_id: 'dup' });
    expect(() => manager.context({ ...CONTEXT_OPTIONS, context_id: 'dup' })).toThrow(CartesiaError);
  });

  test('throws synchronously after manager.close()', () => {
    const manager = createTestManager();
    manager.close();
    expect(() => manager.context(CONTEXT_OPTIONS)).toThrow(CartesiaError);
  });

  test('tracks the new context in the internal map', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'tracked' });
    expect(manager.getContext('tracked')).toBe(ctx);
    expect(manager.listContexts()).toContain(ctx);
  });
});

describe('TTSContextManager.connect()', () => {
  test('resolves once the underlying socket is OPEN', async () => {
    const manager = createTestManager();
    await expect(manager.connect()).resolves.toBe(manager);
    expect((manager as any)._ws.socket.readyState).toBe(ReadyState.OPEN);
  });

  test('throws synchronously after manager.close()', async () => {
    const manager = createTestManager();
    manager.close();
    await expect(manager.connect()).rejects.toThrow(CartesiaError);
  });

  test('returns immediately if socket is already OPEN (no replacement)', async () => {
    const manager = createTestManager();
    await manager.connect();
    const wsBefore = (manager as any)._ws;
    await manager.connect();
    expect((manager as any)._ws).toBe(wsBefore);
  });

  test('replaces _ws when the current socket has actually CLOSED', async () => {
    const manager = createTestManager();
    await manager.connect();
    const wsBefore = (manager as any)._ws;

    // Force a real close so readyState transitions to CLOSED.
    platformSocket(manager).terminate();
    // Wait for the close event to be processed.
    while ((manager as any)._ws.socket.readyState !== ReadyState.CLOSED) {
      await sleep(5);
    }

    await manager.connect();
    expect((manager as any)._ws).not.toBe(wsBefore);
    expect((manager as any)._ws.socket.readyState).toBe(ReadyState.OPEN);
  });
});

describe('TTSContextManager.close()', () => {
  test('marks the manager permanently closed', () => {
    const manager = createTestManager();
    manager.close();
    expect(() => manager.context(CONTEXT_OPTIONS)).toThrow(CartesiaError);
  });

  test('initiates close on the underlying ws', () => {
    const manager = createTestManager();
    manager.close();
    const state = (manager as any)._ws.socket.readyState;
    expect([ReadyState.CONNECTING, ReadyState.CLOSING, ReadyState.CLOSED]).toContain(state);
  });
});

describe('TTSContextManager.getContext / listContexts', () => {
  test('getContext returns undefined for an unknown id', () => {
    const manager = createTestManager();
    expect(manager.getContext('does-not-exist')).toBeUndefined();
  });

  test('listContexts is empty initially', () => {
    const manager = createTestManager();
    expect(manager.listContexts()).toEqual([]);
  });

  test('listContexts returns all currently tracked contexts', () => {
    const manager = createTestManager();
    const a = manager.context({ ...CONTEXT_OPTIONS, context_id: 'a' });
    const b = manager.context({ ...CONTEXT_OPTIONS, context_id: 'b' });
    expect(manager.listContexts()).toHaveLength(2);
    expect(manager.listContexts()).toEqual(expect.arrayContaining([a, b]));
  });
});

describe('TTSContextManager context-map pruning', () => {
  test('removes a context from the map after a natural done close', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'pruned' });
    expect(manager.getContext('pruned')).toBe(ctx);

    injectEvent(manager, makeDone('pruned'));
    for await (const _e of ctx.receive()) {
      /* drain */
    }

    expect(manager.getContext('pruned')).toBeUndefined();
  });

  test('clears all contexts from the map when the ws closes', () => {
    const manager = createTestManager();
    manager.context({ ...CONTEXT_OPTIONS, context_id: 'a' });
    manager.context({ ...CONTEXT_OPTIONS, context_id: 'b' });
    expect(manager.listContexts()).toHaveLength(2);

    emitSocketClose(manager);
    expect(manager.listContexts()).toHaveLength(0);
  });
});

// =========================================================================
// TTSContext
// =========================================================================

describe('TTSContext.push / end / flush — when closed', () => {
  test('push throws CartesiaError after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'p' });
    emitSocketClose(manager);
    expect(() => ctx.push({ transcript: 'hi' })).toThrow(CartesiaError);
  });

  test('end does nothing after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'e' });
    emitSocketClose(manager);
    expect(() => ctx.end()).not.toThrow();
  });

  test('flush throws CartesiaError after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'f' });
    emitSocketClose(manager);
    expect(() => ctx.flush()).toThrow(CartesiaError);
  });

  test('cancel does nothing after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'e' });
    emitSocketClose(manager);
    expect(() => ctx.cancel()).not.toThrow();
  });

  test('does not throw while context is active', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'active' });
    expect(() => ctx.push({ transcript: 'hi' })).not.toThrow();
    expect(() => ctx.flush()).not.toThrow();
    expect(() => ctx.end()).not.toThrow();
  });
});

describe('TTSContext.receive() — basic semantics', () => {
  test('yields events buffered before receive() was called', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'buf' });

    injectEvent(manager, makeChunk('buf', 0));
    injectEvent(manager, makeChunk('buf', 1));
    injectEvent(manager, makeDone('buf'));

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events.map((e) => e.type)).toEqual(['chunk', 'chunk', 'done']);
  });

  test('terminates on done event and marks context closed', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'd' });

    injectEvent(manager, makeChunk('d', 0));
    injectEvent(manager, makeDone('d'));

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events.map((e) => e.type)).toEqual(['chunk', 'done']);
    expect(ctx.isClosed).toBe(true);

    // After the context has closed, the constructor-side listener is gone,
    // so trailing events are dropped rather than buffered for a future
    // receive() call.
    injectEvent(manager, makeChunk('d', 99));
    const trailing: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) trailing.push(e);
    expect(trailing).toHaveLength(0);
  });

  test('terminates on error event with done!=false', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'err' });

    injectEvent(manager, makeError('err'));

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('error');
    expect(ctx.isClosed).toBe(true);
  });

  test('continues past an error event with done==false', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'err-warn' });

    injectEvent(manager, makeError('err-warn', { done: false }));
    injectEvent(manager, makeChunk('err-warn', 0));
    injectEvent(manager, makeDone('err-warn'));

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events.map((e) => e.type)).toEqual(['error', 'chunk', 'done']);
  });

  test('yields an error on inactivity timeout (no thrown error)', async () => {
    const manager = createTestManager();
    const ctx = manager.context({
      ...CONTEXT_OPTIONS,
      context_id: 'timeout',
      timeout: 50,
    });

    let threw: unknown;
    const events: TTSContexts.WebSocketResponse[] = [];
    try {
      for await (const e of ctx.receive()) events.push(e);
    } catch (err) {
      threw = err;
    }

    expect(threw).toBeUndefined();
    expect(events.map((e) => e.type)).toEqual(['error']);
    expect(events.map((e) => e.context_id)).toEqual(['timeout']);
    expect(events.map((e) => e.done)).toEqual([true]);
    expect(events.map((e) => e.type === 'error' && e.error_code)).toEqual(['client_timeout']);
    expect(ctx.isClosed).toBe(true);
  });

  test('decodes audio for chunk events', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'audio' });

    injectEvent(manager, makeChunk('audio', 0));
    injectEvent(manager, makeDone('audio'));

    const chunks: TTSContexts.WebSocketResponse.Chunk[] = [];
    for await (const e of ctx.receive()) {
      if (e.type === 'chunk') chunks.push(e);
    }

    expect(chunks).toHaveLength(1);
    const chunk = chunks[0];
    if (chunk !== undefined) {
      expect(chunk.audio).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(chunk.audio!).toString()).toBe('audio_0');
    }
  });

  test('chunk with empty data has empty buffer on audio property', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'empty-audio' });

    injectEvent(manager, {
      type: 'chunk',
      context_id: 'empty-audio',
      data: '',
      done: false,
      status_code: 200,
      step_time: 0,
    });
    injectEvent(manager, makeDone('empty-audio'));

    const chunks: TTSContexts.WebSocketResponse.Chunk[] = [];
    for await (const e of ctx.receive()) {
      if (e.type === 'chunk') chunks.push(e);
    }
    expect(chunks[0]?.audio.length).toBe(0);
  });

  test('cleanup runs when consumer breaks early from for-await', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'early' });

    injectEvent(manager, makeChunk('early', 0));
    injectEvent(manager, makeChunk('early', 1));

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) {
      events.push(e);
      break; // exits early — for-await calls generator.return(), runs finally.
    }

    expect(events).toHaveLength(1);
    expect(ctx.isClosed).toBe(true);
    expect(manager.getContext(ctx.contextId)).toBeUndefined();
  });

  test('events for other contexts are filtered out (constructor-side)', async () => {
    // Buffered case: events for other contexts arrive before receive() runs.
    const manager = createTestManager();
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, context_id: 'A' });

    injectEvent(manager, makeChunk('A', 0));
    injectEvent(manager, makeChunk('OTHER', 0));
    injectEvent(manager, makeChunk('A', 1));
    injectEvent(manager, makeDone('A'));

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctxA.receive()) events.push(e);

    for (const e of events) expect((e as any).context_id).toBe('A');
    expect(events.map((e) => e.type)).toEqual(['chunk', 'chunk', 'done']);
  });
});

describe('TTSContext.receive() — multi-context routing', () => {
  test('two contexts only see their own buffered events', async () => {
    const manager = createTestManager();
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, context_id: 'A' });
    const ctxB = manager.context({ ...CONTEXT_OPTIONS, context_id: 'B' });

    injectEvent(manager, makeChunk('A', 0));
    injectEvent(manager, makeChunk('B', 0));
    injectEvent(manager, makeChunk('A', 1));
    injectEvent(manager, makeChunk('B', 1));
    injectEvent(manager, makeDone('A'));
    injectEvent(manager, makeDone('B'));

    const aEvents: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctxA.receive()) aEvents.push(e);
    const bEvents: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctxB.receive()) bEvents.push(e);

    for (const e of aEvents) expect((e as any).context_id).toBe('A');
    for (const e of bEvents) expect((e as any).context_id).toBe('B');
    expect(aEvents).toHaveLength(3);
    expect(bEvents).toHaveLength(3);
  });

  test("concurrent receivers do not see each other's live events", async () => {
    // Regression test for the bug where receive()'s local onEvent forgot to
    // filter by context_id, causing both contexts to see each other's events.
    const manager = createTestManager();
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, context_id: 'A' });
    const ctxB = manager.context({ ...CONTEXT_OPTIONS, context_id: 'B' });

    const aResult: TTSContexts.WebSocketResponse[] = [];
    const bResult: TTSContexts.WebSocketResponse[] = [];
    const pa = (async () => {
      for await (const e of ctxA.receive()) aResult.push(e);
    })();
    const pb = (async () => {
      for await (const e of ctxB.receive()) bResult.push(e);
    })();

    // Allow both receivers to enter their await states.
    await sleep(10);

    // Inject events for both contexts.
    injectEvent(manager, makeChunk('A', 0));
    injectEvent(manager, makeChunk('B', 0));
    injectEvent(manager, makeChunk('A', 1));
    injectEvent(manager, makeDone('B'));
    injectEvent(manager, makeDone('A'));

    await Promise.all([pa, pb]);

    for (const e of aResult) expect((e as any).context_id).toBe('A');
    for (const e of bResult) expect((e as any).context_id).toBe('B');
    expect(aResult).toHaveLength(3);
    expect(bResult).toHaveLength(2);
  });

  test('a slow consumer does not block a fast consumer', async () => {
    const manager = createTestManager();
    const slow = manager.context({ ...CONTEXT_OPTIONS, context_id: 'slow' });
    const fast = manager.context({ ...CONTEXT_OPTIONS, context_id: 'fast' });

    const N = 20;
    for (let i = 0; i < N; i++) {
      injectEvent(manager, makeChunk('slow', i));
      injectEvent(manager, makeChunk('fast', i));
    }
    injectEvent(manager, makeDone('slow'));
    injectEvent(manager, makeDone('fast'));

    const SLOW_DELAY = 25; // ms per yield
    async function readSlow() {
      const out: TTSContexts.WebSocketResponse[] = [];
      for await (const e of slow.receive()) {
        if (e.type === 'chunk') out.push(e);
        await sleep(SLOW_DELAY);
      }
      return out;
    }

    let fastDuration = 0;
    async function readFast() {
      const out: TTSContexts.WebSocketResponse[] = [];
      const start = performance.now();
      for await (const e of fast.receive()) {
        if (e.type === 'chunk') out.push(e);
      }
      fastDuration = performance.now() - start;
      return out;
    }

    const [slowChunks, fastChunks] = await Promise.all([readSlow(), readFast()]);
    expect(slowChunks).toHaveLength(N);
    expect(fastChunks).toHaveLength(N);
    expect(fastDuration).toBeLessThan((N * SLOW_DELAY) / 2);
  });
});

describe('TTSContext.isClosed — set as soon as a terminal event is observed', () => {
  test('is false before any events arrive', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'fresh' });
    expect(ctx.isClosed).toBe(false);
  });

  test('flips to true synchronously on done event, before receive() runs', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'd-sync' });
    expect(ctx.isClosed).toBe(false);
    injectEvent(manager, makeDone('d-sync'));
    expect(ctx.isClosed).toBe(true);
  });

  test('flips to true synchronously on terminal error event, before receive() runs', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'err-sync' });
    expect(ctx.isClosed).toBe(false);
    injectEvent(manager, makeError('err-sync'));
    expect(ctx.isClosed).toBe(true);
  });

  test('stays open on non-terminal error event (done=false)', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'warn-sync' });
    injectEvent(manager, makeError('warn-sync', { done: false }));
    expect(ctx.isClosed).toBe(false);
  });

  test('stays open on chunk events', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'chunk-sync' });
    injectEvent(manager, makeChunk('chunk-sync', 0));
    injectEvent(manager, makeChunk('chunk-sync', 1));
    expect(ctx.isClosed).toBe(false);
  });

  test('done event for a different context does not close this one', () => {
    const manager = createTestManager();
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, context_id: 'A-iso' });
    manager.context({ ...CONTEXT_OPTIONS, context_id: 'B-iso' });
    injectEvent(manager, makeDone('B-iso'));
    expect(ctxA.isClosed).toBe(false);
  });

  test('is true mid-iteration after the done event has been observed', async () => {
    // Two chunks then done are buffered. We pull the first chunk and assert
    // isClosed is already true — the constructor-side listener saw the done
    // event before receive() yielded anything.
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'mid' });

    injectEvent(manager, makeChunk('mid', 0));
    injectEvent(manager, makeChunk('mid', 1));
    injectEvent(manager, makeDone('mid'));

    expect(ctx.isClosed).toBe(true);

    const events: TTSContexts.WebSocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);
    expect(events.map((e) => e.type)).toEqual(['chunk', 'chunk', 'done']);
    expect(ctx.isClosed).toBe(true);
  });
});

describe('TTSContext.cancel()', () => {
  test('does not throw and does not synchronously close the context', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'cancel-1' });
    expect(() => ctx.cancel()).not.toThrow();
    // Cancel relies on the server's response to actually close the context.
    expect(ctx.isClosed).toBe(false);
  });

  test('a server done after cancel closes the context', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, context_id: 'cancel-2' });

    ctx.cancel();
    injectEvent(manager, makeDone('cancel-2'));

    for await (const _e of ctx.receive()) {
      /* drain */
    }
    expect(ctx.isClosed).toBe(true);
  });
});

// =========================================================================
// TTSContextManager events
// =========================================================================

describe('TTSContextManager events', () => {
  test('emits "close" with code, reason, and unsent', () => {
    const manager = createTestManager();
    let received: { code: number; reason: string; unsent: any[] } | undefined;
    manager.on('close', (code, reason, unsent) => {
      received = { code, reason, unsent };
    });

    emitSocketClose(manager, 1011, 'server-fault');
    expect(received).toBeDefined();
    expect(received!.code).toBe(1011);
    expect(received!.reason).toBe('server-fault');
    expect(Array.isArray(received!.unsent)).toBe(true);
  });

  test('emits "reconnecting" and forwards the event payload', () => {
    const manager = createTestManager();
    let received: any;
    manager.on('reconnecting', (e) => {
      received = e;
    });

    const evt = { attempt: 2, maxAttempts: 5, delay: 100, closeCode: 1006 };
    (manager as any)._ws._emit('reconnecting', evt);
    expect(received).toEqual(evt);
  });

  test('emits "reconnected"', () => {
    const manager = createTestManager();
    let fired = false;
    manager.on('reconnected', () => {
      fired = true;
    });
    (manager as any)._ws._emit('reconnected');
    expect(fired).toBe(true);
  });

  test('per-context errors are filtered out (not surfaced to the manager)', () => {
    const manager = createTestManager();
    const errors: any[] = [];
    // The suppressing listener from createTestManager stays attached — both
    // listeners fire, but only this one records.
    manager.on('error', (e) => errors.push(e));

    (manager as any)._ws._emit('error', {
      message: 'context-scoped error',
      error: { context_id: 'some-ctx', type: 'error', title: 'oops', done: true, status_code: 400 },
    });

    expect(errors).toHaveLength(0);
  });

  test('non-context errors are surfaced to the manager', () => {
    const manager = createTestManager();
    const errors: any[] = [];
    manager.on('error', (e) => errors.push(e));

    (manager as any)._ws._emit('error', {
      message: 'transport error',
      error: undefined,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]!.message).toBe('transport error');
  });
});
