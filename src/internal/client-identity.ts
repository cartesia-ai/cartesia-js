import { VERSION } from '../version';

const CLIENT_ID = 'cartesia-js';

/** Stable User-Agent for REST and Node WebSocket handshakes. */
export function getClientUserAgent(): string {
  return `Cartesia/JS ${VERSION}`;
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

/** Browser WebSocket cannot set custom headers; stamp identity via query param. */
export function appendBrowserWebSocketClientParam(url: URL): void {
  if (!url.searchParams.has('cartesia_client')) {
    url.searchParams.set('cartesia_client', getClientHeader());
  }
}
