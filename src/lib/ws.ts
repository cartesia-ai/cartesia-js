import type { RawWebSocketData, UnsentMessage } from '../internal/ws';

const hasBuffer = typeof Buffer !== 'undefined';

function utf8ByteLength(s: string): number {
  return hasBuffer ? Buffer.byteLength(s, 'utf8') : new TextEncoder().encode(s).byteLength;
}

function concatBufferList(list: Buffer[]): Buffer | Uint8Array {
  if (hasBuffer) return Buffer.concat(list);
  let total = 0;
  for (const b of list) total += b.byteLength;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of list) {
    out.set(b, offset);
    offset += b.byteLength;
  }
  return out;
}

function copyArrayBufferView(v: ArrayBufferView): ArrayBufferLike {
  return v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength);
}

export function flattenRawData(data: RawWebSocketData): Exclude<RawWebSocketData, Buffer[]> {
  // `Buffer[]` only arrives from the `ws` package on Node; browsers never deliver it.
  if (Array.isArray(data)) return concatBufferList(data);
  return data;
}

function snapshotRawData(data: RawWebSocketData): Exclude<RawWebSocketData, Buffer[]> {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return concatBufferList(data);
  if (ArrayBuffer.isView(data)) return copyArrayBufferView(data);
  return data.slice(0);
}

function rawByteLength(data: Exclude<RawWebSocketData, Buffer[]>): number {
  if (typeof data === 'string') return utf8ByteLength(data);
  if ('byteLength' in data) return data.byteLength;
  return 0;
}

type QueueEntry =
  | { kind: 'json'; data: string; byteLength: number }
  | { kind: 'raw'; data: Exclude<RawWebSocketData, Buffer[]>; byteLength: number };

export class SendQueue<T = unknown> {
  private _queue: QueueEntry[] = [];
  private _bytes: number = 0;
  private _maxBytes: number;

  constructor(maxBytes: number = 1_048_576) {
    this._maxBytes = maxBytes;
  }

  enqueue(event: T): boolean {
    const data = JSON.stringify(event);
    const byteLength = utf8ByteLength(data);
    if (this._bytes + byteLength > this._maxBytes) {
      return false;
    }
    this._queue.push({ kind: 'json', data, byteLength });
    this._bytes += byteLength;
    return true;
  }

  enqueueRaw(data: RawWebSocketData): boolean {
    const snapshot = snapshotRawData(data);
    const byteLength = rawByteLength(snapshot);
    if (this._bytes + byteLength > this._maxBytes) {
      return false;
    }
    this._queue.push({ kind: 'raw', data: snapshot, byteLength });
    this._bytes += byteLength;
    return true;
  }

  flush(send: (data: string | RawWebSocketData) => void): void {
    const pending = this._queue.splice(0);
    this._bytes = 0;
    for (let i = 0; i < pending.length; i++) {
      try {
        send(pending[i]!.data);
      } catch (err) {
        const remaining = pending.slice(i);
        this._queue = remaining.concat(this._queue);
        this._bytes = this._queue.reduce((sum, item) => sum + item.byteLength, 0);
        throw err;
      }
    }
  }

  drain(): UnsentMessage<T>[] {
    const unsent = this._queue.map((entry): UnsentMessage<T> => {
      if (entry.kind === 'raw') return { type: 'raw', data: entry.data };
      return { type: 'message', message: JSON.parse(entry.data) };
    });
    this._queue = [];
    this._bytes = 0;
    return unsent;
  }
}

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
  send(data: SharedArrayBuffer | ArrayBufferView | BufferSource | Blob | string): void;
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
