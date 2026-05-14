import { CartesiaError } from '../../../error';

export class WebSocketTimeoutError extends CartesiaError {
  readonly contextId: string;
  readonly timeoutMs: number;

  constructor(contextId: string, timeoutMs: number) {
    super(`Timed out waiting for response on context ${contextId} after ${timeoutMs}ms`);
    this.contextId = contextId;
    this.timeoutMs = timeoutMs;
  }
}
