import { CartesiaError } from '../core/error';
import { ReadyState, type WebSocketLike } from '../internal/ws-adapter';

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

/**
 * Resolves once the socket is open, rejects if it errors or closes first.
 */
export function createWebSocketOpenPromise(socket: WebSocketLike): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (socket.readyState === ReadyState.OPEN) {
      resolve();
      return;
    }
    if (socket.readyState !== ReadyState.CONNECTING) {
      reject(new CartesiaError('socket not connecting'));
      return;
    }

    const cleanup = () => {
      socket.off('open', onOpen);
      socket.off('error', onError);
      socket.off('close', onFail);
    };
    const onOpen = () => {
      cleanup();
      resolve();
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onFail = () => {
      cleanup();
      reject(new CartesiaError('socket closed before open'));
    };
    socket.once('open', onOpen);
    socket.once('error', onError);
    socket.once('close', onFail);
  });
}
