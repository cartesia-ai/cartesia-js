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
import { TTSContextManager, type ContextOptions } from '@cartesia/cartesia-js/lib/tts/ws/context-manager';
import { ReadyState } from '@cartesia/cartesia-js/internal/ws-adapter';
import type { WebsocketResponse } from '@cartesia/cartesia-js/resources/tts/index';

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

const managers: TTSContextManager[] = [];

afterEach(() => {
  for (const m of managers) {
    try {
      m.close();
    } catch {}
  }
  managers.length = 0;
});

function createTestManager(): TTSContextManager {
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

function platformSocket(manager: TTSContextManager): WS {
  return (manager as any)._ws.socket.platformSocket;
}

function injectEvent(manager: TTSContextManager, event: Record<string, unknown>) {
  platformSocket(manager).emit('message', Buffer.from(JSON.stringify(event)), false);
}

function emitSocketClose(manager: TTSContextManager, code = 1006, reason = 'test') {
  platformSocket(manager).emit('close', code, Buffer.from(reason));
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---- Event factories -----------------------------------------------------

const CONTEXT_OPTIONS: Omit<ContextOptions, 'contextId'> = {
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
    error: 'test error',
    status_code: 400,
  };
}

// =========================================================================
// TTSContextManager
// =========================================================================

describe('TTSContextManager.context()', () => {
  test('uses the provided contextId', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'my-id' });
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
    manager.context({ ...CONTEXT_OPTIONS, contextId: 'dup' });
    expect(() => manager.context({ ...CONTEXT_OPTIONS, contextId: 'dup' })).toThrow(CartesiaError);
  });

  test('throws synchronously after manager.close()', () => {
    const manager = createTestManager();
    manager.close();
    expect(() => manager.context(CONTEXT_OPTIONS)).toThrow(CartesiaError);
  });

  test('tracks the new context in the internal map', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'tracked' });
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
    const a = manager.context({ ...CONTEXT_OPTIONS, contextId: 'a' });
    const b = manager.context({ ...CONTEXT_OPTIONS, contextId: 'b' });
    expect(manager.listContexts()).toHaveLength(2);
    expect(manager.listContexts()).toEqual(expect.arrayContaining([a, b]));
  });
});

describe('TTSContextManager context-map pruning', () => {
  test('removes a context from the map after a natural done close', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'pruned' });
    expect(manager.getContext('pruned')).toBe(ctx);

    injectEvent(manager, makeDone('pruned'));
    for await (const _e of ctx.receive()) {
      /* drain */
    }

    expect(manager.getContext('pruned')).toBeUndefined();
  });

  test('clears all contexts from the map when the ws closes', () => {
    const manager = createTestManager();
    manager.context({ ...CONTEXT_OPTIONS, contextId: 'a' });
    manager.context({ ...CONTEXT_OPTIONS, contextId: 'b' });
    expect(manager.listContexts()).toHaveLength(2);

    emitSocketClose(manager);
    expect(manager.listContexts()).toHaveLength(0);
  });

  test('a fresh context that reuses a previously-used id is preserved when the old context fires close late', async () => {
    // Identity check at ctx.on('close', ...) ensures we only delete our own entry.
    const manager = createTestManager();
    const oldCtx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'reused' });

    // Simulate the old context closing naturally.
    injectEvent(manager, makeDone('reused'));
    for await (const _e of oldCtx.receive()) {
      /* drain */
    }
    expect(manager.getContext('reused')).toBeUndefined();

    // Create a fresh context with the same id.
    const fresh = manager.context({ ...CONTEXT_OPTIONS, contextId: 'reused' });
    expect(manager.getContext('reused')).toBe(fresh);

    // If the old ctx were to emit close again (it won't, due to the
    // _isCloseEmitted guard), the identity check would protect `fresh`.
    // We can simulate by manually invoking the listener path:
    (oldCtx as any)._emit('close');
    expect(manager.getContext('reused')).toBe(fresh);
  });
});

// =========================================================================
// TTSContext
// =========================================================================

describe('TTSContext.push / end / flush — when closed', () => {
  test('push throws CartesiaError after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'p' });
    emitSocketClose(manager);
    expect(() => ctx.push({ transcript: 'hi' })).toThrow(CartesiaError);
  });

  test('end does nothing after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'e' });
    emitSocketClose(manager);
    expect(() => ctx.end()).not.toThrow();
  });

  test('flush throws CartesiaError after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'f' });
    emitSocketClose(manager);
    expect(() => ctx.flush()).toThrow(CartesiaError);
  });

  test('cancel does nothing after close', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'e' });
    emitSocketClose(manager);
    expect(() => ctx.cancel()).not.toThrow();
  });

  test('does not throw while context is active', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'active' });
    expect(() => ctx.push({ transcript: 'hi' })).not.toThrow();
    expect(() => ctx.flush()).not.toThrow();
    expect(() => ctx.end()).not.toThrow();
  });
});

describe('TTSContext.receive() — basic semantics', () => {
  test('yields events buffered before receive() was called', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'buf' });

    injectEvent(manager, makeChunk('buf', 0));
    injectEvent(manager, makeChunk('buf', 1));
    injectEvent(manager, makeDone('buf'));

    const events: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events.map((e) => e.type)).toEqual(['chunk', 'chunk', 'done']);
  });

  test('terminates on done event and marks context closed', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'd' });

    injectEvent(manager, makeChunk('d', 0));
    injectEvent(manager, makeDone('d'));

    const events: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events.map((e) => e.type)).toEqual(['chunk', 'done']);
    expect(ctx.isClosed).toBe(true);

    // After the context has closed, the constructor-side listener is gone,
    // so trailing events are dropped rather than buffered for a future
    // receive() call.
    injectEvent(manager, makeChunk('d', 99));
    const trailing: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) trailing.push(e);
    expect(trailing).toHaveLength(0);
  });

  test('terminates on error event with done!=false', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'err' });

    injectEvent(manager, makeError('err'));

    const events: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('error');
    expect(ctx.isClosed).toBe(true);
  });

  test('continues past an error event with done==false', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'err-warn' });

    injectEvent(manager, makeError('err-warn', { done: false }));
    injectEvent(manager, makeChunk('err-warn', 0));
    injectEvent(manager, makeDone('err-warn'));

    const events: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) events.push(e);

    expect(events.map((e) => e.type)).toEqual(['error', 'chunk', 'done']);
  });

  test('yields an error on inactivity timeout (no thrown error)', async () => {
    const manager = createTestManager();
    const ctx = manager.context({
      ...CONTEXT_OPTIONS,
      contextId: 'timeout',
      timeout: 50,
    });

    let threw: unknown;
    const events: WebsocketResponse[] = [];
    try {
      for await (const e of ctx.receive()) events.push(e);
    } catch (err) {
      threw = err;
    }

    expect(threw).toBeUndefined();
    expect(events.map((e) => e.type)).toEqual(['error']);
    expect(events.map((e) => e.context_id)).toEqual(['timeout']);
    expect(events.map((e) => e.done)).toEqual([true]);
    expect(ctx.isClosed).toBe(true);
  });

  test('decodes audio for chunk events', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'audio' });

    injectEvent(manager, makeChunk('audio', 0));
    injectEvent(manager, makeDone('audio'));

    const chunks: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) {
      if (e.type === 'chunk') chunks.push(e);
    }

    expect(chunks).toHaveLength(1);
    const chunk = chunks[0]! as WebsocketResponse.Chunk;
    expect(chunk.audio).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(chunk.audio!).toString()).toBe('audio_0');
  });

  test('chunk with empty data has audio=null', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'empty-audio' });

    injectEvent(manager, {
      type: 'chunk',
      context_id: 'empty-audio',
      data: '',
      done: false,
      status_code: 200,
      step_time: 0,
    });
    injectEvent(manager, makeDone('empty-audio'));

    const chunks: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) {
      if (e.type === 'chunk') chunks.push(e);
    }
    expect((chunks[0] as any).audio).toBeNull();
  });

  test('cleanup runs when consumer breaks early from for-await', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'early' });

    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    injectEvent(manager, makeChunk('early', 0));
    injectEvent(manager, makeChunk('early', 1));

    const events: WebsocketResponse[] = [];
    for await (const e of ctx.receive()) {
      events.push(e);
      break; // exits early — for-await calls generator.return(), runs finally.
    }

    expect(events).toHaveLength(1);
    expect(closeCount).toBe(1);
    expect(ctx.isClosed).toBe(true);
  });

  test('events for other contexts are filtered out (constructor-side)', async () => {
    // Buffered case: events for other contexts arrive before receive() runs.
    const manager = createTestManager();
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, contextId: 'A' });

    injectEvent(manager, makeChunk('A', 0));
    injectEvent(manager, makeChunk('OTHER', 0));
    injectEvent(manager, makeChunk('A', 1));
    injectEvent(manager, makeDone('A'));

    const events: WebsocketResponse[] = [];
    for await (const e of ctxA.receive()) events.push(e);

    for (const e of events) expect((e as any).context_id).toBe('A');
    expect(events.map((e) => e.type)).toEqual(['chunk', 'chunk', 'done']);
  });
});

describe('TTSContext.receive() — multi-context routing', () => {
  test('two contexts only see their own buffered events', async () => {
    const manager = createTestManager();
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, contextId: 'A' });
    const ctxB = manager.context({ ...CONTEXT_OPTIONS, contextId: 'B' });

    injectEvent(manager, makeChunk('A', 0));
    injectEvent(manager, makeChunk('B', 0));
    injectEvent(manager, makeChunk('A', 1));
    injectEvent(manager, makeChunk('B', 1));
    injectEvent(manager, makeDone('A'));
    injectEvent(manager, makeDone('B'));

    const aEvents: WebsocketResponse[] = [];
    for await (const e of ctxA.receive()) aEvents.push(e);
    const bEvents: WebsocketResponse[] = [];
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
    const ctxA = manager.context({ ...CONTEXT_OPTIONS, contextId: 'A' });
    const ctxB = manager.context({ ...CONTEXT_OPTIONS, contextId: 'B' });

    const aResult: WebsocketResponse[] = [];
    const bResult: WebsocketResponse[] = [];
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
    const slow = manager.context({ ...CONTEXT_OPTIONS, contextId: 'slow' });
    const fast = manager.context({ ...CONTEXT_OPTIONS, contextId: 'fast' });

    const N = 20;
    for (let i = 0; i < N; i++) {
      injectEvent(manager, makeChunk('slow', i));
      injectEvent(manager, makeChunk('fast', i));
    }
    injectEvent(manager, makeDone('slow'));
    injectEvent(manager, makeDone('fast'));

    const SLOW_DELAY = 25; // ms per yield
    async function readSlow() {
      const out: WebsocketResponse[] = [];
      for await (const e of slow.receive()) {
        if (e.type === 'chunk') out.push(e);
        await sleep(SLOW_DELAY);
      }
      return out;
    }

    let fastDuration = 0;
    async function readFast() {
      const out: WebsocketResponse[] = [];
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

describe('TTSContext close emission', () => {
  test('emits "close" once when receive() completes via done', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'close-done' });
    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    injectEvent(manager, makeDone('close-done'));
    for await (const _e of ctx.receive()) {
      /* drain */
    }

    expect(closeCount).toBe(1);
    expect(ctx.isClosed).toBe(true);
  });

  test('emits "close" once when receive() completes via timeout', async () => {
    const manager = createTestManager();
    const ctx = manager.context({
      ...CONTEXT_OPTIONS,
      contextId: 'close-timeout',
      timeout: 30,
    });
    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    for await (const _e of ctx.receive()) {
      /* drain */
    }

    expect(closeCount).toBe(1);
    expect(ctx.isClosed).toBe(true);
  });

  test('emits "close" once when the underlying ws closes', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'close-ws' });
    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    emitSocketClose(manager);
    expect(closeCount).toBe(1);
    expect(ctx.isClosed).toBe(true);
  });

  test('emits "close" once when a reconnect starts', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'close-reconnect' });
    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    (manager as any)._ws._emit('reconnecting', {
      attempt: 1,
      maxAttempts: 5,
      delay: 0,
      closeCode: 1006,
    });

    expect(closeCount).toBe(1);
    expect(ctx.isClosed).toBe(true);
  });

  test('only fires once when ws close follows a done-driven close (idempotence guard)', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'idempotent-1' });
    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    injectEvent(manager, makeDone('idempotent-1'));
    for await (const _e of ctx.receive()) {
      /* drain */
    }
    expect(closeCount).toBe(1);

    // A subsequent ws close would re-enter cleanup; the guard prevents a 2nd emit.
    emitSocketClose(manager);
    expect(closeCount).toBe(1);
  });

  test('only fires once when ws close happens during an active receive()', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'race' });
    let closeCount = 0;
    ctx.on('close', () => closeCount++);

    const p = (async () => {
      for await (const _e of ctx.receive()) {
        /* drain */
      }
    })();
    await sleep(10); // let receive() enter the await

    // ws close runs cleanup. receive's finally would also try to run cleanup,
    // but the idempotence guard ensures close emits only once.
    emitSocketClose(manager);
    await p;

    expect(closeCount).toBe(1);
  });
});

describe('TTSContext.cancel()', () => {
  test('does not throw and does not synchronously close the context', () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'cancel-1' });
    expect(() => ctx.cancel()).not.toThrow();
    // Cancel relies on the server's response to actually close the context.
    expect(ctx.isClosed).toBe(false);
  });

  test('a server done after cancel closes the context', async () => {
    const manager = createTestManager();
    const ctx = manager.context({ ...CONTEXT_OPTIONS, contextId: 'cancel-2' });

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
      error: { context_id: 'some-ctx', type: 'error', error: 'oops', done: true, status_code: 400 },
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
