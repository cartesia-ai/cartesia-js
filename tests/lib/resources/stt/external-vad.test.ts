/**
 * Tests for the ExternalVAD WebSocket resource.
 *
 * Use a fake client (no API key required) so that the underlying ws.WebSocket
 * fails to connect against a non-routable URL — we then inject events directly
 * on the socket via `platformSocket.emit(...)`.
 */

import Cartesia from '@cartesia/cartesia-js';
import { ExternalVADWS } from '@cartesia/cartesia-js/resources/stt/external-vad/ws';
import type { STTExternalVADWebsocketResponse } from '@cartesia/cartesia-js/resources/stt/external-vad';
import { NodeWebSocket } from '@cartesia/cartesia-js/internal/ws-adapter-node';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const DEFAULT_PARAMS = {
  encoding: 'pcm_s16le' as const,
  model: 'ink-whisper',
  sample_rate: 16000,
};

function createClient(): Cartesia {
  return new Cartesia({
    apiKey: 'test-api-key',
    baseURL: 'http://127.0.0.1:1',
  });
}

function createTestWS(
  parameters: Parameters<Cartesia['stt']['externalVAD']['websocket']>[0] = DEFAULT_PARAMS,
): ExternalVADWS {
  const client = createClient();
  const ws = client.stt.externalVAD.websocket(parameters);
  // Suppress connection-error noise from the unreachable URL.
  ws.on('error', () => {});
  return ws;
}

function platformSocket(ws: ExternalVADWS): InstanceType<typeof import('ws').WebSocket> {
  const socket = ws.socket;
  if (!(socket instanceof NodeWebSocket)) {
    throw new Error('expected NodeWebSocket in tests');
  }
  return socket.platformSocket;
}

function injectMessage(ws: ExternalVADWS, event: Record<string, unknown>) {
  platformSocket(ws).emit('message', Buffer.from(JSON.stringify(event)), false);
}

function injectBinary(ws: ExternalVADWS, data: Buffer) {
  platformSocket(ws).emit('message', data, true);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExternalVADWS URL construction', () => {
  test('uses the /stt/websocket endpoint with ws:// protocol on http baseURL', () => {
    const ws = createTestWS();
    expect(ws.url.pathname).toBe('/stt/websocket');
    expect(ws.url.protocol).toBe('ws:');
    ws.close();
  });

  test('uses wss:// protocol on https baseURL', () => {
    const client = new Cartesia({ apiKey: 'test', baseURL: 'https://example.invalid' });
    const ws = client.stt.externalVAD.websocket(DEFAULT_PARAMS);
    ws.on('error', () => {});
    expect(ws.url.protocol).toBe('wss:');
    ws.close();
  });

  test('includes required query parameters in the URL', () => {
    const ws = createTestWS({
      encoding: 'pcm_s16le',
      model: 'ink-whisper',
      sample_rate: 16000,
      language: 'en',
    });
    expect(ws.url.searchParams.get('encoding')).toBe('pcm_s16le');
    expect(ws.url.searchParams.get('model')).toBe('ink-whisper');
    expect(ws.url.searchParams.get('sample_rate')).toBe('16000');
    expect(ws.url.searchParams.get('language')).toBe('en');
    ws.close();
  });

  test('includes optional ink-whisper parameters when provided', () => {
    const ws = createTestWS({
      ...DEFAULT_PARAMS,
      max_silence_duration_secs: 1.5,
      min_volume: 0.05,
    });
    expect(ws.url.searchParams.get('max_silence_duration_secs')).toBe('1.5');
    expect(ws.url.searchParams.get('min_volume')).toBe('0.05');
    ws.close();
  });
});

describe('ExternalVADWS send', () => {
  test('send("finalize") writes the literal command string (no JSON-encoding)', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);

    const sent: unknown[] = [];
    jest.spyOn(socket, 'send').mockImplementation((data: any) => sent.push(data));
    // Force OPEN so send() bypasses the queue.
    Object.defineProperty(socket, 'readyState', { value: 1, configurable: true });

    ws.send('finalize');
    ws.send('close');

    expect(sent).toEqual(['finalize', 'close']);
    ws.close();
  });

  test('send while CONNECTING buffers the message in the send queue', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);

    const sent: unknown[] = [];
    jest.spyOn(socket, 'send').mockImplementation((data: any) => sent.push(data));
    // ws.WebSocket starts in CONNECTING (readyState 0); send should queue.
    ws.send('finalize');
    expect(sent).toEqual([]);

    // Flip to OPEN and emit 'open' — the queue should be flushed.
    Object.defineProperty(socket, 'readyState', { value: 1, configurable: true });
    socket.emit('open');

    expect(sent).toEqual(['finalize']);
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

describe('ExternalVADWS receive', () => {
  test('emits a parsed transcript event', () => {
    const ws = createTestWS();
    const received: STTExternalVADWebsocketResponse[] = [];
    ws.on('transcript', (e) => received.push(e));

    injectMessage(ws, {
      type: 'transcript',
      request_id: 'req-1',
      text: 'hello world',
      is_final: true,
      duration: 1.2,
    });

    expect(received).toEqual([
      { type: 'transcript', request_id: 'req-1', text: 'hello world', is_final: true, duration: 1.2 },
    ]);
    ws.close();
  });

  test('emits flush_done and done acknowledgments', () => {
    const ws = createTestWS();
    const flushEvents: unknown[] = [];
    const doneEvents: unknown[] = [];
    ws.on('flush_done', (e) => flushEvents.push(e));
    ws.on('done', (e) => doneEvents.push(e));

    injectMessage(ws, { type: 'flush_done', request_id: 'req-1' });
    injectMessage(ws, { type: 'done', request_id: 'req-1' });

    expect(flushEvents).toEqual([{ type: 'flush_done', request_id: 'req-1' }]);
    expect(doneEvents).toEqual([{ type: 'done', request_id: 'req-1' }]);
    ws.close();
  });

  test('routes a server error event to the error handler', () => {
    const ws = createTestWS();
    const errors: any[] = [];
    ws.on('error', (err) => errors.push(err));

    injectMessage(ws, {
      type: 'error',
      request_id: 'req-1',
      message: 'something went wrong',
      status_code: 400,
    });

    expect(errors.length).toBeGreaterThanOrEqual(1);
    const wsError = errors[errors.length - 1];
    expect(wsError.error).toMatchObject({
      type: 'error',
      message: 'something went wrong',
      status_code: 400,
    });
    ws.close();
  });

  test('emits raw for non-JSON text frames', () => {
    const ws = createTestWS();
    const rawEvents: unknown[] = [];
    ws.on('raw', (data) => rawEvents.push(data));

    platformSocket(ws).emit('message', Buffer.from('not json at all'), false);

    expect(rawEvents.length).toBe(1);
    ws.close();
  });

  test('emits raw for binary frames', () => {
    const ws = createTestWS();
    const rawEvents: unknown[] = [];
    ws.on('raw', (data) => rawEvents.push(data));

    const audio = Buffer.from([10, 20, 30, 40]);
    injectBinary(ws, audio);

    expect(rawEvents.length).toBe(1);
    ws.close();
  });

  test('emits a generic event for every server message regardless of type', () => {
    const ws = createTestWS();
    const events: STTExternalVADWebsocketResponse[] = [];
    ws.on('event', (e) => events.push(e));

    injectMessage(ws, { type: 'transcript', request_id: 'r', text: 'hi', is_final: false });
    injectMessage(ws, { type: 'flush_done', request_id: 'r' });
    injectMessage(ws, { type: 'done', request_id: 'r' });

    expect(events.map((e) => e.type)).toEqual(['transcript', 'flush_done', 'done']);
    ws.close();
  });
});

describe('ExternalVADWS stream() iterator', () => {
  test('yields injected messages and exits on close', async () => {
    const ws = createTestWS();
    const stream = ws.stream();

    // Inject before any reader is awaiting — events should buffer.
    injectMessage(ws, { type: 'transcript', request_id: 'r', text: 'one', is_final: true });
    injectMessage(ws, { type: 'transcript', request_id: 'r', text: 'two', is_final: true });
    injectMessage(ws, { type: 'done', request_id: 'r' });

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

    // Give the iterator a tick to drain, then close the socket to terminate.
    await sleep(10);
    platformSocket(ws).emit('close', 1000, Buffer.from('OK'));
    await consumePromise;

    expect(seen).toEqual(['transcript', 'transcript', 'done']);
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

    injectMessage(ws, { type: 'transcript', request_id: 'r', text: 'first', is_final: true });

    const seen: string[] = [];
    for await (const event of stream) {
      if (event.type === 'message') {
        seen.push(event.message.type);
        break; // triggers iterator.return()
      }
    }

    expect(seen).toEqual(['transcript']);
    // Socket should still be alive (CONNECTING/OPEN, not yet CLOSED).
    expect(platformSocket(ws).readyState).toBeLessThan(3);
    ws.close();
  });
});

describe('ExternalVADWS close', () => {
  test('emits close with the supplied code/reason and drains the send queue', async () => {
    const ws = createTestWS();
    const socket = platformSocket(ws);
    jest.spyOn(socket, 'send').mockImplementation(() => {});

    // Queue a message while CONNECTING.
    ws.send('finalize');

    let captured: { code: number; reason: string; unsent: unknown[] } | undefined;
    ws.on('close', (code, reason, unsent) => {
      captured = { code, reason, unsent };
    });

    ws.close({ code: 4000, reason: 'bye' });
    // Calling close() on a CONNECTING ws.WebSocket transitions it to CLOSING
    // but the 'close' event still fires on the underlying socket. Trigger it.
    socket.emit('close', 4000, Buffer.from('bye'));

    expect(captured).toEqual({
      code: 4000,
      reason: 'bye',
      unsent: [{ type: 'raw', data: 'finalize' }],
    });
  });
});
