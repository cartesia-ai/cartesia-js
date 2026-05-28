/**
 * Tests for the AutoFinalize WebSocket resource.
 *
 * Use a fake client (no API key required) so that the underlying ws.WebSocket
 * fails to connect against a non-routable URL — we then inject events directly
 * on the socket via `platformSocket.emit(...)`.
 */

import Cartesia from '@cartesia/cartesia-js';
import { AutoFinalizeWS } from '@cartesia/cartesia-js/resources/stt/auto-finalize/ws';
import type { STTAutoFinalizeWebsocketResponse } from '@cartesia/cartesia-js/resources/stt/auto-finalize';
import { NodeWebSocket } from '@cartesia/cartesia-js/internal/ws-adapter-node';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const DEFAULT_PARAMS = {
  encoding: 'pcm_s16le' as const,
  model: 'ink-2',
  sample_rate: 16000,
};

function createClient(): Cartesia {
  return new Cartesia({
    apiKey: 'test-api-key',
    baseURL: 'http://127.0.0.1:1',
  });
}

function createTestWS(
  parameters: Parameters<Cartesia['stt']['autoFinalize']['websocket']>[0] = DEFAULT_PARAMS,
): AutoFinalizeWS {
  const client = createClient();
  const ws = client.stt.autoFinalize.websocket(parameters);
  // Suppress connection-error noise from the unreachable URL.
  ws.on('error', () => {});
  return ws;
}

function platformSocket(ws: AutoFinalizeWS): InstanceType<typeof import('ws').WebSocket> {
  const socket = ws.socket;
  if (!(socket instanceof NodeWebSocket)) {
    throw new Error('expected NodeWebSocket in tests');
  }
  return socket.platformSocket;
}

function injectMessage(ws: AutoFinalizeWS, event: Record<string, unknown>) {
  platformSocket(ws).emit('message', Buffer.from(JSON.stringify(event)), false);
}

function injectBinary(ws: AutoFinalizeWS, data: Buffer) {
  platformSocket(ws).emit('message', data, true);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AutoFinalizeWS URL construction', () => {
  test('uses the /stt/turns/websocket endpoint with ws:// protocol on http baseURL', () => {
    const ws = createTestWS();
    expect(ws.url.pathname).toBe('/stt/turns/websocket');
    expect(ws.url.protocol).toBe('ws:');
    ws.close();
  });

  test('uses wss:// protocol on https baseURL', () => {
    const client = new Cartesia({ apiKey: 'test', baseURL: 'https://example.invalid' });
    const ws = client.stt.autoFinalize.websocket(DEFAULT_PARAMS);
    ws.on('error', () => {});
    expect(ws.url.protocol).toBe('wss:');
    ws.close();
  });

  test('includes required query parameters in the URL', () => {
    const ws = createTestWS({
      encoding: 'pcm_s16le',
      model: 'ink-2',
      sample_rate: 16000,
    });
    expect(ws.url.searchParams.get('encoding')).toBe('pcm_s16le');
    expect(ws.url.searchParams.get('model')).toBe('ink-2');
    expect(ws.url.searchParams.get('sample_rate')).toBe('16000');
    ws.close();
  });
});

describe('AutoFinalizeWS send', () => {
  test('send({ type: "close" }) JSON-encodes the command', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);

    const sent: unknown[] = [];
    jest.spyOn(socket, 'send').mockImplementation((data: any) => sent.push(data));
    Object.defineProperty(socket, 'readyState', { value: 1, configurable: true });

    ws.send({ type: 'close' });

    expect(sent).toEqual([JSON.stringify({ type: 'close' })]);
    ws.close();
  });

  test('send while CONNECTING buffers the message and flushes on open', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);

    const sent: unknown[] = [];
    jest.spyOn(socket, 'send').mockImplementation((data: any) => sent.push(data));
    // ws.WebSocket starts in CONNECTING (readyState 0); send should queue.
    ws.send({ type: 'close' });
    expect(sent).toEqual([]);

    Object.defineProperty(socket, 'readyState', { value: 1, configurable: true });
    socket.emit('open');

    expect(sent).toEqual([JSON.stringify({ type: 'close' })]);
    ws.close();
  });

  test('sendRaw transmits binary audio bytes verbatim', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);

    const sent: unknown[] = [];
    jest.spyOn(socket, 'send').mockImplementation((data: any) => sent.push(data));
    Object.defineProperty(socket, 'readyState', { value: 1, configurable: true });

    const audio = new Uint8Array([1, 2, 3, 4, 5]);
    ws.sendRaw(audio);

    expect(sent.length).toBe(1);
    expect(sent[0]).toBe(audio);
    ws.close();
  });
});

describe('AutoFinalizeWS receive', () => {
  test('emits a connected event when the server announces the session', () => {
    const ws = createTestWS();
    const received: STTAutoFinalizeWebsocketResponse[] = [];
    ws.on('connected', (e) => received.push(e));

    injectMessage(ws, { type: 'connected', request_id: 'req-1' });

    expect(received).toEqual([{ type: 'connected', request_id: 'req-1' }]);
    ws.close();
  });

  test('emits turn.start, turn.update, turn.end events with the right transcripts', () => {
    const ws = createTestWS();
    const starts: unknown[] = [];
    const updates: unknown[] = [];
    const ends: unknown[] = [];
    ws.on('turn.start', (e) => starts.push(e));
    ws.on('turn.update', (e) => updates.push(e));
    ws.on('turn.end', (e) => ends.push(e));

    injectMessage(ws, { type: 'turn.start', request_id: 'req-1' });
    injectMessage(ws, { type: 'turn.update', request_id: 'req-1', transcript: 'hello' });
    injectMessage(ws, { type: 'turn.update', request_id: 'req-1', transcript: 'hello world' });
    injectMessage(ws, { type: 'turn.end', request_id: 'req-1', transcript: 'hello world.' });

    expect(starts).toEqual([{ type: 'turn.start', request_id: 'req-1' }]);
    expect(updates).toEqual([
      { type: 'turn.update', request_id: 'req-1', transcript: 'hello' },
      { type: 'turn.update', request_id: 'req-1', transcript: 'hello world' },
    ]);
    expect(ends).toEqual([{ type: 'turn.end', request_id: 'req-1', transcript: 'hello world.' }]);
    ws.close();
  });

  test('emits turn.eager_end and turn.resume preview events', () => {
    const ws = createTestWS();
    const eager: unknown[] = [];
    const resume: unknown[] = [];
    ws.on('turn.eager_end', (e) => eager.push(e));
    ws.on('turn.resume', (e) => resume.push(e));

    injectMessage(ws, { type: 'turn.eager_end', request_id: 'r', transcript: 'maybe done' });
    injectMessage(ws, { type: 'turn.resume', request_id: 'r' });

    expect(eager).toEqual([{ type: 'turn.eager_end', request_id: 'r', transcript: 'maybe done' }]);
    expect(resume).toEqual([{ type: 'turn.resume', request_id: 'r' }]);
    ws.close();
  });

  test('routes a server error event to the error handler', () => {
    const ws = createTestWS();
    const errors: any[] = [];
    ws.on('error', (err) => errors.push(err));

    injectMessage(ws, {
      type: 'error',
      request_id: 'req-1',
      message: 'bad audio format',
      status_code: 400,
    });

    expect(errors.length).toBeGreaterThanOrEqual(1);
    const wsError = errors[errors.length - 1];
    expect(wsError.error).toMatchObject({
      type: 'error',
      message: 'bad audio format',
      status_code: 400,
    });
    ws.close();
  });

  test('emits raw for non-JSON text frames', () => {
    const ws = createTestWS();
    const rawEvents: unknown[] = [];
    ws.on('raw', (data) => rawEvents.push(data));

    platformSocket(ws).emit('message', Buffer.from('definitely not json'), false);

    expect(rawEvents.length).toBe(1);
    ws.close();
  });

  test('emits raw for binary frames', () => {
    const ws = createTestWS();
    const rawEvents: unknown[] = [];
    ws.on('raw', (data) => rawEvents.push(data));

    injectBinary(ws, Buffer.from([10, 20, 30]));

    expect(rawEvents.length).toBe(1);
    ws.close();
  });

  test('emits a generic event for every server message regardless of type', () => {
    const ws = createTestWS();
    const events: STTAutoFinalizeWebsocketResponse[] = [];
    ws.on('event', (e) => events.push(e));

    injectMessage(ws, { type: 'connected', request_id: 'r' });
    injectMessage(ws, { type: 'turn.start', request_id: 'r' });
    injectMessage(ws, { type: 'turn.end', request_id: 'r', transcript: 'done' });

    expect(events.map((e) => e.type)).toEqual(['connected', 'turn.start', 'turn.end']);
    ws.close();
  });
});

describe('AutoFinalizeWS stream() iterator', () => {
  test('yields injected messages and exits on close', async () => {
    const ws = createTestWS();
    const stream = ws.stream();

    injectMessage(ws, { type: 'connected', request_id: 'r' });
    injectMessage(ws, { type: 'turn.start', request_id: 'r' });
    injectMessage(ws, { type: 'turn.update', request_id: 'r', transcript: 'hi' });
    injectMessage(ws, { type: 'turn.end', request_id: 'r', transcript: 'hi.' });

    const seen: string[] = [];
    const consumePromise = (async () => {
      for await (const event of stream) {
        if (event.type === 'message') {
          seen.push(event.message.type);
        } else if (event.type === 'close') {
          break;
        }
      }
    })();

    await sleep(10);
    platformSocket(ws).emit('close', 1000, Buffer.from('OK'));
    await consumePromise;

    expect(seen).toEqual(['connected', 'turn.start', 'turn.update', 'turn.end']);
  });

  test('yields close with the code and reason from the underlying socket', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);

    // Synchronously simulate a server-side close before the real (unreachable)
    // connection attempt fails — otherwise the failure would cache code 1006.
    socket.emit('close', 1011, Buffer.from('server crashed'));
    Object.defineProperty(socket, 'readyState', { value: 3, configurable: true });

    let closeEvent: { code: number; reason: string } | undefined;
    for await (const event of ws.stream()) {
      if (event.type === 'close') {
        closeEvent = { code: event.code, reason: event.reason };
        break;
      }
    }

    expect(closeEvent).toEqual({ code: 1011, reason: 'server crashed' });
  });

  test('return() exits the iterator without closing the underlying socket', async () => {
    const ws = createTestWS();
    const stream = ws.stream();

    injectMessage(ws, { type: 'turn.start', request_id: 'r' });

    const seen: string[] = [];
    for await (const event of stream) {
      if (event.type === 'message') {
        seen.push(event.message.type);
        break; // triggers iterator.return()
      }
    }

    expect(seen).toEqual(['turn.start']);
    expect(platformSocket(ws).readyState).toBeLessThan(3);
    ws.close();
  });
});

describe('AutoFinalizeWS close', () => {
  test('emits close with the supplied code/reason and drains the send queue', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);
    jest.spyOn(socket, 'send').mockImplementation(() => {});

    // Queue a message while CONNECTING.
    ws.send({ type: 'close' });

    let captured: { code: number; reason: string; unsent: unknown[] } | undefined;
    ws.on('close', (code, reason, unsent) => {
      captured = { code, reason, unsent };
    });

    ws.close({ code: 4000, reason: 'bye' });
    socket.emit('close', 4000, Buffer.from('bye'));

    expect(captured).toEqual({
      code: 4000,
      reason: 'bye',
      unsent: [{ type: 'message', message: { type: 'close' } }],
    });
  });
});
