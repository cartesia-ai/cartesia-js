import Cartesia from '@cartesia/cartesia-js';
import {
  appendBrowserWebSocketClientParam,
  getClientHeader,
  getClientRequestHeaders,
  getClientUserAgent,
  getWebSocketConnectHeaders,
} from '@cartesia/cartesia-js/internal/client-identity';
import { VERSION } from '@cartesia/cartesia-js/version';

/** Canonical cartesia-js identity — every outbound surface must use these values. */
const CARTESIA_JS_CLIENT = {
  userAgent: `cartesia-js/${VERSION}`,
  clientHeader: `cartesia-js/${VERSION}`,
} as const;

function expectCartesiaJsHeaders(headers: Record<string, string>) {
  expect(headers['user-agent']).toBe(CARTESIA_JS_CLIENT.userAgent);
  expect(headers['x-cartesia-client']).toBe(CARTESIA_JS_CLIENT.clientHeader);
}

describe('cartesia-js client attribution by service', () => {
  test('documents expected client identity', () => {
    expect(getClientUserAgent()).toBe(CARTESIA_JS_CLIENT.userAgent);
    expect(getClientHeader()).toBe(CARTESIA_JS_CLIENT.clientHeader);
  });

  describe.each([
    { service: 'REST (any HTTP route)', path: '/tts/bytes', method: 'post' as const },
    { service: 'REST (voices)', path: '/voices', method: 'get' as const },
    { service: 'REST (STT transcribe)', path: '/stt', method: 'post' as const },
  ])('$service', ({ path, method }) => {
    test(`identifies as cartesia-js on ${path}`, async () => {
      const client = new Cartesia({ apiKey: 'test-api-key', baseURL: 'https://api.cartesia.ai/' });
      const { req } = await client.buildRequest({ path, method });
      expect(req.headers.get('user-agent')).toBe(CARTESIA_JS_CLIENT.userAgent);
      expect(req.headers.get('x-cartesia-client')).toBe(CARTESIA_JS_CLIENT.clientHeader);
    });
  });

  describe.each([
    { service: 'TTS WebSocket', path: '/tts/websocket' },
    { service: 'STT auto-finalize WebSocket', path: '/stt/turns/websocket' },
    { service: 'STT manual-finalize WebSocket', path: '/stt/websocket' },
  ])('$service ($path)', ({ path }) => {
    test('Node handshake sends cartesia-js headers', () => {
      const headers = getWebSocketConnectHeaders({ Authorization: 'Bearer test-api-key' });
      expectCartesiaJsHeaders(headers);
      expect(headers['cartesia-version']).toBe('2025-11-04');
      expect(headers['authorization']).toBe('Bearer test-api-key');
      expect(path).toMatch(/^\/(tts|stt)/);
    });

    test('browser handshake uses cartesia_client query param', () => {
      const url = new URL(`wss://api.cartesia.ai${path}?model=ink-2`);
      appendBrowserWebSocketClientParam(url);
      expect(url.searchParams.get('cartesia_client')).toBe(CARTESIA_JS_CLIENT.clientHeader);
    });
  });

  test('getClientRequestHeaders matches canonical identity', () => {
    expect(getClientRequestHeaders()).toEqual({
      'User-Agent': CARTESIA_JS_CLIENT.userAgent,
      'X-Cartesia-Client': CARTESIA_JS_CLIENT.clientHeader,
    });
  });
});
