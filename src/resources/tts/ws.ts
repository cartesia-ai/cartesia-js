// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type * as WS from 'ws';

let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}
import { uuid4 } from '../../internal/utils/uuid';
import { TTSEmitter, WebSocketTimeoutError, TTSStreamMessage, WebSocketError, buildURL } from './internal-base';
import { InternalEventEmitter } from '../../core/EventEmitter';
import { sleep } from '../../internal/utils/sleep';
import { isRecoverableClose, type ReconnectingEvent, type ReconnectingOverrides } from '../../internal/ws';
import * as TTSAPI from './tts';
import type { Cartesia } from '../../client';

/** Decode a base64 string to bytes. Works in both Node and browsers. */
function decodeBase64(data: string): Uint8Array {
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
 * Request parameters for context.generate(), same as GenerationRequest but without context_id.
 */
export type ContextGenerateRequest = Omit<TTSAPI.GenerationRequest, 'context_id'>;

/**
 * Options for creating a context, including the model, voice, and output format.
 */
export interface ContextOptions {
  model_id: string;
  voice: TTSAPI.VoiceSpecifier;
  output_format: TTSAPI.GenerationRequest['output_format'];
  contextId?: string;
  /** Receive timeout in milliseconds. If set, receive() will throw WebSocketTimeoutError after this duration of inactivity. */
  timeout?: number;
}

interface ContextQueueEntry {
  queue: TTSAPI.WebsocketResponse[];
  resolve: (() => void) | null;
}

/**
 * A context helper for managing WebSocket conversations with automatic context_id handling.
 */
export class TTSWSContext {
  private _ws: TTSWS;
  private _options: Omit<ContextOptions, 'contextId' | 'timeout'>;
  private _timeout: number | undefined;
  readonly contextId: string;

  constructor(ws: TTSWS, options: ContextOptions) {
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
   * Call this multiple times to stream transcript chunks, then call done() to finish.
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
   * The context_id is automatically set.
   */
  async send(request: ContextGenerateRequest) {
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
   * Completes when a "done" event is received.
   * Events for other contexts are properly routed to their queues, not dropped.
   *
   * @param options.timeout - Override the context-level timeout (ms) for this receive call.
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
              throw new WebSocketTimeoutError(this.contextId, timeout);
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
   * Note: this uses TTSWS.generate()'s own EventEmitter-based collection,
   * so the per-context queue is unregistered to avoid accumulating events
   * in both places.
   */
  async *generate(request: ContextGenerateRequest): AsyncGenerator<TTSAPI.WebsocketResponse> {
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

export interface TTSWSReconnectOptions {
  /**
   * Called before each reconnect attempt. Return an object with
   * `parameters` to override query parameters for the next connection.
   */
  onReconnecting(
    event: ReconnectingEvent<Record<string, unknown>>,
  ): ReconnectingOverrides<Record<string, unknown>> | void;

  /**
   * Maximum number of reconnection attempts. Default: 5.
   * Set to 0 to disable reconnection entirely.
   */
  maxRetries?: number;

  /**
   * Initial backoff delay in milliseconds. Default: 500.
   */
  initialDelay?: number;

  /**
   * Maximum backoff delay in milliseconds. Default: 8000.
   */
  maxDelay?: number;
}

export interface TTSWSClientOptions extends WS.ClientOptions {
  /**
   * Options for automatic reconnection on recoverable close codes.
   * Automatic reconnection is only enabled when this has a non-null value.
   */
  reconnect?: TTSWSReconnectOptions | null;
}

export class TTSWS extends TTSEmitter {
  url: URL;
  socket!: WebSocketLike;
  private client: Cartesia;
  private _ready: Promise<void>;
  private _wsOptions: WS.ClientOptions | undefined;
  private _contextQueues: Map<string, ContextQueueEntry> = new Map();

  constructor(
    client: Cartesia,
    parameters?: Record<string, unknown> | undefined,
    options?: TTSWSClientOptions | null | undefined,
  ) {
    super();
    this.client = client;
    this._wsOptions = options;
    this.url = buildURL(client, parameters);
    this._ready = Promise.resolve();
    this._initSocket(options);
  }

  private _initSocket(options?: WS.ClientOptions | undefined): void {
    if (_ws) {
      // Node: use ws package with custom headers for auth
      this.socket = new _ws.WebSocket(this.url, {
        ...options,
        headers: {
          'cartesia-version': '2025-11-04',
          ...this.authHeaders(),
          ...options?.headers,
        },
      });
    } else if (typeof WebSocket !== 'undefined') {
      // Browser: use native WebSocket with auth in URL query params
      const url = new URL(this.url.toString());
      url.searchParams.set('cartesia_version', '2025-11-04');
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
        if (event.type === 'chunk') {
          const chunk = event as TTSAPI.WebsocketResponse.Chunk;
          chunk.audio = chunk.data ? decodeBase64(chunk.data) as any : null;
        }

        // Always emit on EventEmitter for backwards compatibility and global listeners.
        this._emit('event', event);

        if (event.type === 'error') {
          this._onError(event);
        } else {
          // @ts-ignore TS isn't smart enough to get the relationship right here
          this._emit(event.type, event);
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

  async send(event: TTSAPI.WebsocketClientEvent) {
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
  async *generate(request: TTSAPI.GenerationRequest): AsyncGenerator<TTSAPI.WebsocketResponse> {
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
  context(options: ContextOptions): TTSWSContext {
    const ctx = new TTSWSContext(this, options);
    this._registerContext(ctx.contextId);
    return ctx;
  }

  close(props?: { code: number; reason: string }) {
    this._intentionallyClosed = true;
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

  /**
   * Returns an async iterator over WebSocket lifecycle and message events,
   * providing an alternative to the event-based `.on()` API.
   * The iterator will exit if the socket closes but exiting the iterator
   * does not close the socket.
   *
   * @example
   * ```ts
   * for await (const event of client.stream()) {
   *   switch (event.type) {
   *     case 'message':
   *       console.log('received:', event.message);
   *       break;
   *     case 'error':
   *       console.error(event.error);
   *       break;
   *     case 'close':
   *       console.log('connection closed');
   *       break;
   *   }
   * }
   * ```
   */
  stream(): AsyncIterableIterator<TTSStreamMessage> {
    return this[Symbol.asyncIterator]();
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<TTSStreamMessage> {
    // Two-queue async iterator: `queue` buffers incoming messages,
    // `resolvers` buffers waiting next() calls. A push wakes the
    // oldest next(); a next() drains the oldest message.
    const queue: TTSStreamMessage[] = [];
    const resolvers: (() => void)[] = [];
    let done = false;
    let currentSocket = this.socket;

    const push = (msg: TTSStreamMessage) => {
      queue.push(msg);
      resolvers.shift()?.();
    };

    const onEvent = (event: TTSAPI.WebsocketResponse) => {
      if (event.type === 'error') return; // handled by onEmitterError
      push({ type: 'message', message: event });
    };

    // All errors (API + socket) funnel through _onError → 'error' event
    const onEmitterError = (err: WebSocketError) => {
      push({ type: 'error', error: err });
    };

    const onOpen = () => {
      push({ type: 'open' });
    };

    const onReconnecting = (evt: ReconnectingEvent<Record<string, unknown>>) => {
      push({ type: 'reconnecting', reconnect: evt });
    };

    const onReconnected = () => {
      push({ type: 'reconnected' });
    };

    const flushResolvers = () => {
      for (let resolver = resolvers.shift(); resolver; resolver = resolvers.shift()) {
        resolver();
      }
    };

    const onClose = () => {
      // Mid-reconnect; the swap handler will rebind us to the new socket
      if (this._isReconnecting) return;
      push({ type: 'close' });
      done = true;
      flushResolvers();
      cleanup();
    };

    const onSocketSwap = (oldSocket: WS.WebSocket, newSocket: WS.WebSocket) => {
      oldSocket.off('open', onOpen);
      oldSocket.off('close', onClose);
      newSocket.on('open', onOpen);
      newSocket.on('close', onClose);
      currentSocket = newSocket;
    };

    const cleanup = () => {
      this.off('event', onEvent);
      this.off('error', onEmitterError);
      currentSocket.off('open', onOpen);
      currentSocket.off('close', onClose);
      this._internalEvents.off('socketSwap', onSocketSwap);
      this._internalEvents.off('reconnecting', onReconnecting);
      this._internalEvents.off('reconnected', onReconnected);
      this._internalEvents.off('close', onClose);
    };

    this.on('event', onEvent);
    this.on('error', onEmitterError);
    this.socket.on('open', onOpen);
    this.socket.on('close', onClose);
    this._internalEvents.on('socketSwap', onSocketSwap);
    this._internalEvents.on('reconnecting', onReconnecting);
    this._internalEvents.on('reconnected', onReconnected);
    this._internalEvents.on('close', onClose);

    if (this._isReconnecting) {
      // A reconnect is already in flight. The socket may be CLOSED but the
      // instance is still alive. Emit 'reconnecting' so the iterator stays
      // open and receives the upcoming reconnected/message events.
      push({
        type: 'reconnecting',
        reconnect: { attempt: 0, maxAttempts: 0, delay: 0, closeCode: 0, parameters: undefined },
      });
    } else {
      switch (this.socket.readyState) {
        case WS.WebSocket.CONNECTING:
          push({ type: 'connecting' });
          break;
        case WS.WebSocket.OPEN:
          push({ type: 'open' });
          break;
        case WS.WebSocket.CLOSING:
          push({ type: 'closing' });
          break;
        case WS.WebSocket.CLOSED:
          push({ type: 'close' });
          done = true;
          cleanup();
          break;
      }
    }

    const resolve = (res: (value: IteratorResult<TTSStreamMessage>) => void) => {
      if (queue.length > 0) {
        res({ value: queue.shift()!, done: false });
      } else if (done) {
        res({ value: undefined, done: true });
      } else {
        return false;
      }
      return true;
    };

    const next = (): Promise<IteratorResult<TTSStreamMessage>> =>
      new Promise((res) => {
        if (resolve(res)) return;
        resolvers.push(() => {
          resolve(res);
        });
      });

    return {
      next,
      return: (): Promise<IteratorReturnResult<undefined>> => {
        done = true;
        cleanup();
        flushResolvers();
        return Promise.resolve({ value: undefined, done: true });
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  private _connect(): WS.WebSocket {
    this.url = buildURL(this._client, this._parameters);

    const socket = new WS.WebSocket(this.url, {
      ...this._wsOptions,
      headers: {
        'cartesia-version': '2025-11-04',
        ...this._authHeaders(),
        ...this._wsOptions?.headers,
      },
    });

    socket.on('message', (wsEvent) => {
      const event = (() => {
        try {
          return JSON.parse(wsEvent.toString()) as TTSAPI.WebsocketResponse;
        } catch (err) {
          this._onError(null, 'could not parse websocket event', err);
          return null;
        }
      })();

      if (event) {
        this._emit('event', event);

        if (event.type === 'error') {
          this._onError(event);
        } else {
          // @ts-ignore TS isn't smart enough to get the relationship right here
          this._emit(event.type, event);
        }
      }
    });

    socket.on('error', (err) => {
      // Suppress transient errors during reconnection — the retry loop
      // already handles them and will surface a close if retries exhaust.
      if (this._isReconnecting) return;
      this._onError(null, err.message, err);
    });

    socket.on('open', () => {
      this._flushSendQueue();
    });

    socket.on('close', (code: number) => {
      // Ignore close events from superseded sockets — a stale socket's
      // late close must not kick off a second reconnect loop.
      if (socket !== this.socket) return;

      if (!this._canReconnect(code)) {
        if (!this._isReconnecting) {
          this._emit('close');
        }
        return;
      }

      this._reconnect(code);
    });

    return socket;
  }

  // Reconnect is opt-in via onReconnecting so callers can pass
  // state (e.g. session IDs) into the new connection.
  private _canReconnect(code: number): boolean {
    if (this._intentionallyClosed) return false;
    if (!this._reconnectOptions) return false;
    if (this._reconnectOptions.maxRetries === 0) return false;
    if (!this._reconnectOptions.onReconnecting) return false;
    return isRecoverableClose(code);
  }

  private async _reconnect(closeCode: number): Promise<void> {
    if (this._isReconnecting || !this._reconnectOptions) return;
    this._isReconnecting = true;

    const maxRetries = this._reconnectOptions.maxRetries ?? 5;
    const initialDelay = this._reconnectOptions.initialDelay ?? 500;
    const maxDelay = this._reconnectOptions.maxDelay ?? 8000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (!this._canReconnect(closeCode)) {
        this._isReconnecting = false;
        if (!this._intentionallyClosed) {
          this._onError(
            null,
            `WebSocket reconnect aborted: non-recoverable close code ${closeCode}`,
            undefined,
          );
        }
        this._emit('close');
        this._internalEvents._emit('close');
        return;
      }

      const baseDelay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
      // Jitter: rand [0.75, 1.0] to spread out connection attempts without over-delaying
      const jitter = 0.75 + Math.random() * 0.25;
      const actualDelay = Math.round(baseDelay * jitter);

      let reconnectingEvent: ReconnectingEvent<Record<string, unknown>> = {
        attempt,
        maxAttempts: maxRetries,
        delay: actualDelay,
        closeCode,
        parameters: this._parameters ? { ...this._parameters } : undefined,
      };

      let overrides: ReconnectingOverrides<Record<string, unknown>> | void;
      try {
        overrides = this._reconnectOptions.onReconnecting(reconnectingEvent);
      } catch (err) {
        this._isReconnecting = false;
        this._onError(null, 'onReconnecting callback threw', err);
        this._emit('close');
        this._internalEvents._emit('close');
        return;
      }

      if (overrides && 'abort' in overrides && overrides.abort) {
        this._isReconnecting = false;
        this._emit('close');
        this._internalEvents._emit('close');
        return;
      }

      if (overrides && 'parameters' in overrides) {
        this._parameters = overrides.parameters;
        reconnectingEvent = { ...reconnectingEvent, parameters: this._parameters };
      }

      try {
        this._emit('reconnecting', reconnectingEvent);
      } catch (err) {
        this._onError(null, 'onReconnecting callback threw', err);
      }
      this._internalEvents._emit('reconnecting', reconnectingEvent);

      if (!this._canReconnect(closeCode)) {
        this._isReconnecting = false;
        if (!this._intentionallyClosed) {
          this._onError(
            null,
            `WebSocket reconnect aborted: non-recoverable close code ${closeCode}`,
            undefined,
          );
        }
        this._emit('close');
        this._internalEvents._emit('close');
        return;
      }

      await sleep(actualDelay);

      if (!this._canReconnect(closeCode)) {
        this._isReconnecting = false;
        if (!this._intentionallyClosed) {
          this._onError(
            null,
            `WebSocket reconnect aborted: non-recoverable close code ${closeCode}`,
            undefined,
          );
        }
        this._emit('close');
        this._internalEvents._emit('close');
        return;
      }

      let closeCodePromise: Promise<number> | undefined;
      try {
        const oldSocket = this.socket;
        this.socket = this._connect();
        // Registered synchronously after _connect() and before any
        // await so the code is captured even when ws emits 'close'
        // in the same tick as 'error' (e.g. abortHandshake).
        closeCodePromise = new Promise<number>((resolve) => {
          this.socket.once('close', resolve);
        });

        await this._awaitOpen(this.socket);

        this._internalEvents._emit('socketSwap', oldSocket, this.socket);
        this._isReconnecting = false;
        this._flushSendQueue();
        this._emit('reconnected');
        this._internalEvents._emit('reconnected');
        return;
      } catch {
        if (closeCodePromise) {
          // ws may emit 'error' before 'close', so await the code
          // rather than reading it synchronously.
          closeCode = await closeCodePromise;
        }
      }
    }

    // All retries exhausted — surface an error so consumers can
    // distinguish retry failure from a clean close.
    this._isReconnecting = false;
    this._onError(
      null,
      `WebSocket reconnect failed after ${maxRetries} attempts (close code: ${closeCode})`,
      undefined,
    );
    this._emit('close');
    this._internalEvents._emit('close');
  }

  /**
   * Resolves once the socket is open, rejects if it errors or closes first
   */
  private _awaitOpen(socket: WS.WebSocket): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
        reject(new Error('socket closed before open'));
      };
      socket.once('open', onOpen);
      socket.once('error', onError);
      socket.once('close', onFail);
    });
  }

  private _flushSendQueue(): void {
    const pending = this._sendQueue.splice(0);
    for (let i = 0; i < pending.length; i++) {
      try {
        if (this.socket.readyState !== WS.WebSocket.OPEN) {
          // Avoid dropping messages by sending them out over a closing socket
          this._sendQueue.unshift(...pending.slice(i));
          return;
        } else {
          this.socket.send(pending[i]!);
        }
      } catch (err) {
        // Re-queue remaining for next open/reconnect
        this._sendQueue.unshift(...pending.slice(i));
        this._onError(null, 'could not send queued data', err);
        return;
      }
    }
  }

  private _authHeaders(): Record<string, string> {
    if (this._client.token) {
      return { Authorization: `Bearer ${this._client.token}` };
    }

    if (this._client.apiKey) {
      return { Authorization: `Bearer ${this._client.apiKey}` };
    }
    return {};
  }
}
