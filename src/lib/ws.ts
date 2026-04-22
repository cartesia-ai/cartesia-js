/** Decode a base64 string to bytes. Works in both Node and browsers. */
export function decodeBase64(data: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(data, 'base64');
  }
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// WebSocket readyState constants (same values in both `ws` and native WebSocket).
export const WS_CONNECTING = 0;
export const WS_OPEN = 1;
export const WS_CLOSING = 2;
export const WS_CLOSED = 3;

// WebSocket CloseEvent codes
export const WS_ABNORMAL_CLOSURE_CODE = 1006;

interface WebSocketLikeOpenEvent {
  type: string;
  target: WebSocketLike;
}

interface WebSocketLikeErrorEvent {
  error: unknown;
  message: string;
  type: string;
  target: WebSocketLike;
}

interface WebSocketLikeCloseEvent {
  wasClean: boolean;
  code: number;
  reason: string;
  type: string;
  target: WebSocketLike;
}

interface WebSocketLikeMessageEvent {
  data: string | Buffer | ArrayBuffer | Buffer[];
  type: string;
  target: WebSocketLike;
}

interface WebSocketLikeEventMap {
  open: WebSocketLikeOpenEvent;
  error: WebSocketLikeErrorEvent;
  close: WebSocketLikeCloseEvent;
  message: WebSocketLikeMessageEvent;
}

/** Common WebSocket interface shared by both the `ws` package and the browser's native WebSocket. */
export interface WebSocketLike {
  readyState: number;
  send(data: SharedArrayBuffer | ArrayBufferView | ArrayBuffer | Blob | string): void;
  close(code?: number, reason?: string): void;
  addEventListener<K extends keyof WebSocketLikeEventMap>(
    type: K,
    listener: (this: WebSocketLike, ev: WebSocketLikeEventMap[K]) => any,
  ): void;
  removeEventListener<K extends keyof WebSocketLikeEventMap>(
    type: K,
    listener:
      | ((event: WebSocketLikeEventMap[K]) => void)
      | { handleEvent(event: WebSocketLikeEventMap[K]): void },
  ): void;
}
