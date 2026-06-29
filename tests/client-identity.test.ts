import {
  appendBrowserWebSocketClientParam,
  getClientHeader,
  getClientRequestHeaders,
  getClientUserAgent,
} from '@cartesia/cartesia-js/internal/client-identity';
import { VERSION } from '@cartesia/cartesia-js/version';

describe('client identity', () => {
  test('getClientUserAgent uses stable Cartesia prefix', () => {
    expect(getClientUserAgent()).toBe(`Cartesia/JS ${VERSION}`);
  });

  test('getClientHeader uses stable client id', () => {
    expect(getClientHeader()).toBe(`cartesia-js/${VERSION}`);
  });

  test('getClientRequestHeaders includes User-Agent and X-Cartesia-Client', () => {
    expect(getClientRequestHeaders()).toEqual({
      'User-Agent': `Cartesia/JS ${VERSION}`,
      'X-Cartesia-Client': `cartesia-js/${VERSION}`,
    });
  });

  test('appendBrowserWebSocketClientParam sets cartesia_client query param', () => {
    const url = new URL('wss://api.cartesia.ai/stt/turns/websocket?model=ink');
    appendBrowserWebSocketClientParam(url);
    expect(url.searchParams.get('cartesia_client')).toBe(`cartesia-js/${VERSION}`);
  });

  test('appendBrowserWebSocketClientParam does not override existing value', () => {
    const url = new URL('wss://api.cartesia.ai/stt/turns/websocket?cartesia_client=custom');
    appendBrowserWebSocketClientParam(url);
    expect(url.searchParams.get('cartesia_client')).toBe('custom');
  });
});
