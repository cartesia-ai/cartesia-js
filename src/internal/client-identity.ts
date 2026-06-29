import { VERSION } from '../version';
import { buildHeaders, type HeadersLike } from './headers';

const CLIENT_ID = 'cartesia-js';

/** Stable User-Agent for REST and Node WebSocket handshakes. */
export function getClientUserAgent(): string {
  return getClientHeader();
}

/** Minification-proof client identifier for attribution in Datadog APM. */
export function getClientHeader(): string {
  return `${CLIENT_ID}/${VERSION}`;
}

/** Headers attached to every outbound Cartesia API request from this SDK. */
export function getClientRequestHeaders(): Record<string, string> {
  return {
    'User-Agent': getClientUserAgent(),
    'X-Cartesia-Client': getClientHeader(),
  };
}

/** Headers for Node WebSocket upgrade requests (TTS + STT). */
export function getWebSocketConnectHeaders(
  authHeaders: Record<string, string> = {},
  extraHeaders?: HeadersLike,
): Record<string, string> {
  return Object.fromEntries(
    buildHeaders([
      getClientRequestHeaders(),
      {
        'cartesia-version': '2025-11-04',
      },
      authHeaders,
      extraHeaders,
    ]).values.entries(),
  );
}

/** Browser WebSocket cannot set custom headers; stamp identity via query param. */
export function appendBrowserWebSocketClientParam(url: URL): void {
  if (!url.searchParams.has('cartesia_client')) {
    url.searchParams.set('cartesia_client', getClientHeader());
  }
}
