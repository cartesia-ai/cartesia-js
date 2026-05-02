// TTS WS Implementation from v3.0.0. Kept for backward compatibility

/// <reference lib="dom" />

import type * as WS from 'ws';

let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}
import { uuid4 } from '../../../internal/utils/uuid';
import * as TTSAPI from '../../../resources/tts/tts';
import type { Cartesia } from '../../../client';
import { CartesiaError } from '../../../core/error';
import { EventEmitter } from '../../../core/EventEmitter';
import { buildURL, WebSocketError } from '../../../resources/tts/internal-base';
import { decodeBase64String } from '../../utils';
import type { TTSWSContexts, TTSContextsWSConnection } from './contexts';

type WebSocketResponseWithDecodedAudio =
  | Exclude<TTSAPI.WebsocketResponse, { type: 'chunk' }>
  | (TTSAPI.WebsocketResponse.Chunk & {
      /**
       * Decoded audio data as a Buffer.
       */
      audio: Uint8Array;
    });

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type WebsocketEvents = Simplify<
  {
    event: (event: WebSocketResponseWithDecodedAudio) => void;
    error: (error: WebSocketError) => void;
  } & {
    [EventType in Exclude<NonNullable<WebSocketResponseWithDecodedAudio['type']>, 'error'>]: (
      event: Extract<WebSocketResponseWithDecodedAudio, { type?: EventType }>,
    ) => unknown;
  }
>;

/**
 * @deprecated Thrown by {@link TTSWSContext_3_0.receive}, which is also deprecated.
 */
export class WebSocketTimeoutError_3_0 extends CartesiaError {
  readonly contextId: string;
  readonly timeoutMs: number;

  constructor(contextId: string, timeoutMs: number) {
    super(`Timed out waiting for response on context ${contextId} after ${timeoutMs}ms`);
    this.contextId = contextId;
    this.timeoutMs = timeoutMs;
  }
}

function safeJSONStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

// WebSocket readyState constants (same in both ws and native WebSocket)
const WS_CLOSING = 2;
const WS_CLOSED = 3;

/** Common WebSocket interface shared by both the `ws` package and the browser's native WebSocket. */
interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: string, listener: (event: any) => void): void;
  removeEventListener(type: string, listener: (event: any) => void): void;
}

/**
 * Default options to apply to all generation requests on the context.
 *
 * @deprecated Accepted by {@link TTSWS_3_0.context}, which is also deprecated.
 */
export type ContextOptions_3_0 = {
  model_id: string;
  voice: TTSAPI.VoiceSpecifier;
  output_format: TTSAPI.GenerationRequest['output_format'];
  contextId?: string;
  /**
   * How long to wait for events in milliseconds.
   *
   * If set, {@link TTSWSContext_3_0.receive } will throw {@link WebSocketError }
   * if no server events for the context were seen within the timeout.
   */
  timeout?: number;
};

/**
 * Request parameters for {@link TTSWSContext_3_0.generate}, same as {@link TTSAPI.GenerationRequest} but without context_id.
 *
 * @deprecated Accepted by {@link TTSWSContext_3_0.generate}, which is also deprecated.
 */
export type ContextGenerateRequest_3_0 = Omit<TTSAPI.GenerationRequest, 'context_id'>;

interface ContextQueueEntry {
  queue: TTSAPI.WebsocketResponse[];
  resolve: (() => void) | null;
}

/**
 * A context helper for managing WebSocket conversations with automatic context_id handling.
 *
 * @deprecated Returned by {@link TTSWS_3_0.context}, which is also deprecated.
 */
export class TTSWSContext_3_0 {
  private _ws: TTSWS_3_0;
  private _options: Omit<ContextOptions_3_0, 'contextId' | 'timeout'>;
  private _timeout: number | undefined;
  readonly contextId: string;

  constructor(ws: TTSWS_3_0, options: ContextOptions_3_0) {
    this._ws = ws;
    this._options = {
      model_id: options.model_id,
      voice: options.voice,
      output_format: options.output_format,
    };
    this._timeout = options.timeout;
    this.contextId = options.contextId ?? uuid4();
  }

  /**
   * Send a transcript chunk with continue: true.
   * Call this multiple times to stream transcript chunks, then call {@link TTSWSContext_3_0.no_more_inputs} to finish.
   * If flush is true, sends an additional flush request after the transcript.
   */
  async push(options: { transcript: string; flush?: boolean }) {
    await this._ws.send({
      model_id: this._options.model_id,
      voice: this._options.voice,
      output_format: this._options.output_format,
      transcript: options.transcript,
      context_id: this.contextId,
      continue: true,
    });

    if (options.flush) {
      await this.flush();
    }
  }

  /**
   * Signal that no more transcript chunks will be sent.
   * Sends an empty transcript with continue: false.
   */
  async no_more_inputs() {
    await this._ws.send({
      model_id: this._options.model_id,
      voice: this._options.voice,
      output_format: this._options.output_format,
      transcript: '',
      context_id: this.contextId,
      continue: false,
    });
  }

  /**
   * Send a generation request without waiting for responses.
   * Use this for streaming multiple transcript chunks.
   */
  async send(request: ContextGenerateRequest_3_0) {
    await this._ws.send({
      ...request,
      context_id: this.contextId,
    });
  }

  /**
   * Flush any buffered audio for this context.
   * Sends an empty transcript with flush=true and continue=true.
   * This is always sent as a separate request per the API requirement.
   */
  async flush() {
    await this._ws.send({
      model_id: this._options.model_id,
      voice: this._options.voice,
      output_format: this._options.output_format,
      transcript: '',
      context_id: this.contextId,
      continue: true,
      flush: true,
    });
  }

  /**
   * Iterate over responses for this context.
   * Completes when a {@link TTSAPI.WebsocketResponse.Done} event is received.
   * Events for other contexts are properly routed to their queues, not dropped.
   *
   * @param options.timeout - Override the context-level timeout (ms) for this receive call.
   *
   * @throws When a {@link TTSAPI.WebsocketResponse.Error} event is received: {@link Error}.
   * @throws When timeout is reached with no events: {@link WebSocketTimeoutError_3_0}.
   */
  async *receive(options?: { timeout?: number }): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const timeout = options?.timeout ?? this._timeout;

    try {
      while (true) {
        const entry = this._ws._getContextQueue(this.contextId);
        if (!entry) {
          // Queue was removed (context unregistered by reconnect or cancel), stop.
          return;
        }

        if (entry.queue.length > 0) {
          const event = entry.queue.shift()!;
          yield event;
          if (event.type === 'done') {
            return;
          }
          if (event.type === 'error') {
            throw new Error(JSON.stringify(event));
          }
        } else {
          // Wait for the next event to be pushed into the queue.
          const waitPromise = new Promise<void>((r) => {
            entry.resolve = r;
          });

          if (timeout !== undefined) {
            let timer: ReturnType<typeof setTimeout>;
            const timeoutPromise = new Promise<'timeout'>((r) => {
              timer = setTimeout(() => r('timeout'), timeout);
            });

            const result = await Promise.race([waitPromise.then(() => 'event' as const), timeoutPromise]);

            clearTimeout(timer!);

            if (result === 'timeout') {
              entry.resolve = null;
              throw new WebSocketTimeoutError_3_0(this.contextId, timeout);
            }
          } else {
            await waitPromise;
          }
        }
      }
    } finally {
      this._ws._unregisterContext(this.contextId);
    }
  }

  /**
   * Send a generation request and iterate over the responses.
   * The context_id is automatically set.
   *
   * Note: this uses {@link TTSWS_3_0.generate | TTSWS_3_0.generate's} own EventEmitter-based collection,
   * so the per-context queue is unregistered to avoid accumulating events
   * in both places.
   */
  async *generate(request: ContextGenerateRequest_3_0): AsyncGenerator<TTSAPI.WebsocketResponse> {
    // Unregister our queue — ws.generate() uses its own EventEmitter listener
    // and would cause events to accumulate in both places (memory leak).
    this._ws._unregisterContext(this.contextId);
    yield* this._ws.generate({
      ...request,
      context_id: this.contextId,
    });
  }

  /**
   * Cancel this context to stop generating speech.
   */
  async cancel() {
    // Unregister first so receive() unblocks immediately, even if
    // sending the cancel request to the server fails.
    this._ws._unregisterContext(this.contextId);
    try {
      await this._ws.cancelContext(this.contextId);
    } catch {
      // If the connection is dead, there's nothing to cancel server-side, so do nothing.
    }
  }
}

/**
 * Hack to make `pnpm fix` not remove these type imports.
 *
 * They're necessary for doc strings.
 */
undefined satisfies TTSWSContexts.ContextInterface | TTSContextsWSConnection | undefined;

/**
 * Represents a single Text-to-Speech WebSocket connection.
 *
 * @deprecated This class is no longer maintained and kept for backward compatibility.
 * Use {@link TTSContextsWSConnection } instead.
 *
 * Note: {@link TTSContextsWSConnection.context } returns {@link TTSWSContexts.ContextInterface},
 * which does not throw errors in {@link TTSWSContexts.ContextInterface.receive},
 * but does throw errors in {@link TTSWSContexts.ContextInterface.push}
 * and {@link TTSWSContexts.ContextInterface.flush} when the context has already been cleaned up by the client.
 */
export class TTSWS_3_0 extends EventEmitter<WebsocketEvents> {
  url: URL;
  socket!: WebSocketLike;
  private client: Cartesia;
  private _ready: Promise<void>;
  private _wsOptions: WS.ClientOptions | undefined;
  private _contextQueues: Map<string, ContextQueueEntry> = new Map();

  constructor(client: Cartesia, options?: WS.ClientOptions | undefined) {
    super();
    this.client = client;
    this._wsOptions = options;
    this.url = buildURL(client, {} /* parameters */);
    this._ready = Promise.resolve();
    this._initSocket(options);
  }

  private _initSocket(options?: WS.ClientOptions | undefined): void {
    if (_ws) {
      // Node: use ws package with custom headers for auth
      this.socket = new _ws.WebSocket(this.url, {
        ...options,
        headers: {
          'cartesia-version': '2026-03-01',
          ...this.authHeaders(),
          ...options?.headers,
        },
      });
    } else if (typeof WebSocket !== 'undefined') {
      // Browser: use native WebSocket with auth in URL query params
      const url = new URL(this.url.toString());
      url.searchParams.set('cartesia_version', '2026-03-01');
      const authToken = this.client.token || this.client.apiKey;
      if (authToken) {
        url.searchParams.set('api_key', authToken);
      }
      this.socket = new WebSocket(url.toString());
    } else {
      throw new Error(
        'The "ws" peer dependency is required for WebSocket support in Node.js. Install it with: npm install ws',
      );
    }

    // Use addEventListener — works with both ws and native WebSocket.
    this._ready = new Promise((resolve, reject) => {
      const onOpen = () => {
        this.socket.removeEventListener('error', onError);
        resolve();
      };
      const onError = (err: any) => {
        this.socket.removeEventListener('open', onOpen);
        reject(err);
      };
      this.socket.addEventListener('open', onOpen);
      this.socket.addEventListener('error', onError);
    });

    this.socket.addEventListener('message', (msgEvent: any) => {
      // With addEventListener, both ws and native WebSocket wrap data in a MessageEvent.
      const raw = msgEvent.data;
      const event = (() => {
        try {
          return JSON.parse(typeof raw === 'string' ? raw : raw.toString()) as TTSAPI.WebsocketResponse;
        } catch (err) {
          this._onError(null, 'could not parse websocket event', err);
          return null;
        }
      })();

      if (event) {
        // Decode audio for chunk events (mirrors Python SDK's .audio property).
        const transformedEvent: WebSocketResponseWithDecodedAudio =
          event.type === 'chunk' ? { ...event, audio: decodeBase64String(event.data) } : event;

        this._emit('event', transformedEvent);
        if (transformedEvent.type === 'error') {
          this._onError(transformedEvent);
        } else {
          // @ts-ignore TS isn't smart enough to get the relationship right here
          this._emit(transformedEvent.type, transformedEvent);
        }

        // Route to per-context queue if registered.
        const ctxId = 'context_id' in event ? (event as any).context_id : null;
        if (ctxId && this._contextQueues.has(ctxId)) {
          const entry = this._contextQueues.get(ctxId)!;
          entry.queue.push(event);
          if (entry.resolve) {
            entry.resolve();
            entry.resolve = null;
          }
        }
      }
    });

    this.socket.addEventListener('error', (err: any) => {
      this._onError(null, err.message || 'WebSocket error', err);
    });
  }

  protected _onError(event: null, message: string, cause: any): void;
  protected _onError(event: TTSAPI.WebsocketResponse.Error, message?: string | undefined): void;
  protected _onError(
    event: TTSAPI.WebsocketResponse.Error | null,
    message?: string | undefined,
    cause?: any,
  ): void {
    message = message ?? safeJSONStringify(event) ?? 'unknown error';

    if (!this._hasListener('error')) {
      const error = new WebSocketError(
        message +
          `\n\nTo resolve these unhandled rejection errors you should bind an \`error\` callback, e.g. \`ws.on('error', (error) => ...)\` `,
        event,
      );
      // @ts-ignore
      error.cause = cause;
      Promise.reject(error);
      return;
    }

    const error = new WebSocketError(message, event);
    // @ts-ignore
    error.cause = cause;

    this._emit('error', error);
  }

  /**
   * Send a TTS request.
   *
   * @param event The TTS request. context_id is made optional and nullable for backward compatibility,
   * but sending a request without context_id will cause an error to be emitted.
   */
  async send(
    event:
      | (Omit<TTSAPI.GenerationRequest, 'context_id'> & { context_id?: string | null })
      | TTSAPI.WebsocketClientEvent.CancelContextRequest,
  ) {
    await this._ensureConnected();
    try {
      this.socket.send(JSON.stringify(event));
    } catch (err) {
      this._onError(null, 'could not send data', err);
    }
  }

  /**
   * Send a generation request and iterate over the responses.
   */
  async *generate(
    request: Omit<TTSAPI.GenerationRequest, 'context_id'> & { context_id?: string | null },
  ): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const contextId = request.context_id ?? uuid4();
    request = { ...request, context_id: contextId };
    const queue: TTSAPI.WebsocketResponse[] = [];
    let done = false;
    let error: Error | null = null;
    let resolve: (() => void) | null = null;

    const onEvent = (event: TTSAPI.WebsocketResponse) => {
      // Filter by context_id if specified
      if (contextId && 'context_id' in event && event.context_id !== contextId) {
        return;
      }
      queue.push(event);
      if (event.type === 'done' || event.type === 'error') {
        done = true;
        if (event.type === 'error') {
          error = new Error(JSON.stringify(event));
        }
      }
      resolve?.();
    };

    this.on('event', onEvent);

    try {
      await this.send(request);

      while (!done || queue.length > 0) {
        if (queue.length > 0) {
          const event = queue.shift()!;
          yield event;
          if (event.type === 'done') {
            return;
          }
          if (event.type === 'error') {
            throw error;
          }
        } else {
          await new Promise<void>((r) => {
            resolve = r;
          });
        }
      }
    } finally {
      this.off('event', onEvent);
    }
  }

  /**
   * Cancel a context to stop generating speech for it.
   */
  async cancelContext(contextId: string) {
    await this.send({ cancel: true, context_id: contextId });
  }

  /**
   * Create a new context with the given options.
   * Registers a per-context event queue for proper multi-context routing.
   */
  context(options: ContextOptions_3_0): TTSWSContext_3_0 {
    const ctx = new TTSWSContext_3_0(this, options);
    this._registerContext(ctx.contextId);
    return ctx;
  }

  close(props?: { code: number; reason: string }) {
    try {
      this.socket.close(props?.code ?? 1000, props?.reason ?? 'OK');
    } catch (err) {
      this._onError(null, 'could not close the connection', err);
    }
  }

  /**
   * Wait for the WebSocket connection to be ready.
   */
  async connect(): Promise<this> {
    await this._ready;
    return this;
  }

  /** Register a per-context queue. Called by context(). */
  _registerContext(contextId: string): void {
    if (this._contextQueues.has(contextId)) {
      throw new Error(`Context ${contextId} is already registered`);
    }
    this._contextQueues.set(contextId, { queue: [], resolve: null });
  }

  /** Unregister a per-context queue. Called on context completion or cancellation. */
  _unregisterContext(contextId: string): void {
    const entry = this._contextQueues.get(contextId);
    if (entry?.resolve) {
      entry.resolve();
      entry.resolve = null;
    }
    this._contextQueues.delete(contextId);
  }

  /** Get the queue entry for a context, or undefined. */
  _getContextQueue(contextId: string): ContextQueueEntry | undefined {
    return this._contextQueues.get(contextId);
  }

  /**
   * Check if the connection is open; if closed, reconnect transparently.
   * Clears all context queues on reconnect since server-side state is lost.
   */
  private async _ensureConnected(): Promise<void> {
    const state = this.socket.readyState;
    if (state === WS_CLOSING || state === WS_CLOSED) {
      // Wake up any waiting receive() calls so they can exit cleanly.
      for (const [, entry] of this._contextQueues) {
        if (entry.resolve) {
          entry.resolve();
          entry.resolve = null;
        }
      }
      this._contextQueues.clear();

      // Create a fresh socket connection.
      this._initSocket(this._wsOptions);
      await this._ready;
    }
  }

  private authHeaders(): Record<string, string> {
    if (this.client.token) {
      return { Authorization: `Bearer ${this.client.token}` };
    }

    if (this.client.apiKey) {
      return { Authorization: `Bearer ${this.client.apiKey}` };
    }
    return {};
  }
}
