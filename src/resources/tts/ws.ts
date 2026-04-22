// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type * as WS from 'ws';
let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}
import { uuid4 } from '../../internal/utils/uuid';
import {
  TTSEmitter,
  WebSocketTimeoutError,
  TTSStreamMessage,
  WebSocketError,
  buildURL,
} from './internal-base';
import { InternalEventEmitter } from '../../core/EventEmitter';
import { sleep } from '../../internal/utils/sleep';
import {
  WS_ABNORMAL_CLOSURE_CODE,
  WS_CLOSED,
  WS_CLOSING,
  WS_CONNECTING,
  WS_OPEN,
  WebSocketLike,
  decodeBase64,
} from '../../lib/ws';
import {
  flattenRawData,
  isRecoverableClose,
  SendQueue,
  type RawWebSocketData,
  type ReconnectingEvent,
  type ReconnectingOverrides,
  type UnsentMessage,
} from '../../internal/ws';
import * as TTSAPI from './tts';
import type { Cartesia } from '../../client';

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
    this._ws.send({
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
    this._ws.send({
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
    this._ws.send({
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
    this._ws.send({
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

  /**
   * Maximum size of the outgoing message queue in bytes.
   * Messages queued while the socket is connecting or reconnecting are held
   * in memory up to this limit. Once the limit is reached, new messages are
   * discarded and an `error` event is emitted.
   * Default: 1 MB
   */
  maxQueueSize?: number;
}

export class TTSWS extends TTSEmitter {
  url: URL;
  socket: WebSocketLike;

  private _client: Cartesia;
  private _parameters: Record<string, unknown> | null | undefined;
  private _wsOptions: WS.ClientOptions | null | undefined;
  private _reconnectOptions: TTSWSReconnectOptions | null;
  private _ready: Promise<void>;
  private _contextQueues: Map<string, ContextQueueEntry> = new Map();
  private _sendQueue: SendQueue<TTSAPI.WebsocketClientEvent>;
  private _isReconnecting: boolean = false;
  private _intentionallyClosed = false;
  private _closeCode: number = 1000;
  private _closeReason: string = 'OK';
  private _lastCloseCode: number = 1006;
  private _lastCloseReason: string = '';

  // Necessary to keep the public event interface clean while we manage reconnecting
  private _internalEvents = new InternalEventEmitter<{
    socketSwap: (oldSocket: WebSocketLike, newSocket: WebSocketLike) => void;
    reconnecting: (event: ReconnectingEvent<Record<string, unknown>>) => void;
    reconnected: () => void;
    close: (code: number, reason: string, unsent: UnsentMessage<TTSAPI.WebsocketClientEvent>[]) => void;
  }>();

  constructor(
    client: Cartesia,
    parameters?: Record<string, unknown> | undefined,
    options?: TTSWSClientOptions | null | undefined,
  ) {
    super();
    this.url = buildURL(client, parameters ?? {});
    this._client = client;
    this._parameters = parameters;
    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    this._wsOptions = wsOptions;
    this._reconnectOptions = reconnect ?? null;
    this._sendQueue = new SendQueue<TTSAPI.WebsocketClientEvent>(maxQueueSize);
    this.socket = this._connect();
    this._ready = this._awaitOpen(this.socket);
    // Avoid an unhandled-rejection crash when nobody awaits connect().
    this._ready.catch(() => {});
  }

  send(event: TTSAPI.WebsocketClientEvent) {
    if (this._isReconnecting || this.socket.readyState === WS_CONNECTING) {
      if (!this._sendQueue.enqueue(event)) {
        this._onError(null, 'send queue is full, message discarded', undefined);
      }
      return;
    }
    if (this.socket.readyState !== WS_OPEN) {
      this._onError(null, 'cannot send on a closed WebSocket', undefined);
      return;
    }
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
      this.send(request);

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
    this.send({ cancel: true, context_id: contextId });
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

  sendRaw(data: RawWebSocketData) {
    if (this._isReconnecting || this.socket.readyState === WS_CONNECTING) {
      if (!this._sendQueue.enqueueRaw(data)) {
        this._onError(null, 'send queue is full, message discarded', undefined);
      }
      return;
    }
    if (this.socket.readyState !== WS_OPEN) {
      this._onError(null, 'cannot send on a closed WebSocket', undefined);
      return;
    }
    try {
      this.socket.send(flattenRawData(data));
    } catch (err) {
      this._onError(null, 'could not send data', err);
    }
  }

  close(props?: { code: number; reason: string }) {
    this._intentionallyClosed = true;
    this._closeCode = props?.code ?? 1000;
    this._closeReason = props?.reason ?? 'OK';
    try {
      this.socket.close(this._closeCode, this._closeReason);
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

    const onRaw = (data: RawWebSocketData) => {
      push({ type: 'raw', data });
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

    const onClose = (code: number, reason: string, unsent: UnsentMessage<TTSAPI.WebsocketClientEvent>[]) => {
      push({ type: 'close', code, reason, unsent });
      done = true;
      flushResolvers();
      cleanup();
    };

    const onSocketSwap = (oldSocket: WebSocketLike, newSocket: WebSocketLike) => {
      oldSocket.removeEventListener('open', onOpen);
      newSocket.addEventListener('open', onOpen);
      currentSocket = newSocket;
    };

    const cleanup = () => {
      this.off('event', onEvent);
      this.off('raw', onRaw);
      this.off('error', onEmitterError);
      currentSocket.removeEventListener('open', onOpen);
      this._internalEvents.off('close', onClose);
      this._internalEvents.off('socketSwap', onSocketSwap);
      this._internalEvents.off('reconnecting', onReconnecting);
      this._internalEvents.off('reconnected', onReconnected);
    };

    this.on('event', onEvent);
    this.on('raw', onRaw);
    this.on('error', onEmitterError);
    this.socket.addEventListener('open', onOpen);
    this._internalEvents.on('close', onClose);
    this._internalEvents.on('socketSwap', onSocketSwap);
    this._internalEvents.on('reconnecting', onReconnecting);
    this._internalEvents.on('reconnected', onReconnected);

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
        case WS_CONNECTING:
          push({ type: 'connecting' });
          break;
        case WS_OPEN:
          push({ type: 'open' });
          break;
        case WS_CLOSING:
          push({ type: 'closing' });
          break;
        case WS_CLOSED:
          push({
            type: 'close',
            code: this._lastCloseCode,
            reason: this._lastCloseReason,
            unsent: this._sendQueue.drain(),
          });
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

  /**
   * Create a new underlying socket and wire its event listeners.
   * Uses the `ws` package in Node (auth via headers) and the native
   * WebSocket in browsers (auth via query string).
   */
  private _connect(): WebSocketLike {
    this.url = buildURL(this._client, this._parameters ?? {});

    let socket: WebSocketLike;
    if (_ws) {
      // Node: use ws package with custom headers for auth.
      socket = new _ws.WebSocket(this.url, {
        ...this._wsOptions,
        headers: {
          'cartesia-version': '2025-11-04',
          ...this._authHeaders(),
          ...this._wsOptions?.headers,
        },
      });
    } else if (typeof WebSocket !== 'undefined') {
      // Browser: use native WebSocket with auth in URL query params.
      const url = new URL(this.url.toString());
      url.searchParams.set('cartesia_version', '2025-11-04');
      if (this._client.token) {
        url.searchParams.set('access_token', this._client.token);
      } else if (this._client.apiKey) {
        url.searchParams.set('api_key', this._client.apiKey);
      }
      socket = new WebSocket(url.toString());
    } else {
      throw new Error(
        'The "ws" peer dependency is required for WebSocket support in Node.js. Install it with: npm install ws',
      );
    }

    socket.addEventListener('message', (msgEvent) => {
      // Binary frames are emitted as 'raw' for consumers that want them.
      if (typeof msgEvent.data !== 'string') {
        this._emit('raw', msgEvent.data);
        return;
      }

      let event: TTSAPI.WebsocketResponse;
      try {
        event = JSON.parse(msgEvent.data);
      } catch {
        this._emit('raw', msgEvent.data);
        return;
      }

      // Decode audio for chunk events (mirrors Python SDK's .audio property).
      if (event.type === 'chunk') {
        const chunk = event;
        chunk.audio = chunk.data ? decodeBase64(chunk.data) : null;
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
      const ctxId = 'context_id' in event ? event.context_id : null;
      if (ctxId && this._contextQueues.has(ctxId)) {
        const entry = this._contextQueues.get(ctxId)!;
        entry.queue.push(event);
        if (entry.resolve) {
          entry.resolve();
          entry.resolve = null;
        }
      }
    });

    socket.addEventListener('error', (err) => {
      // Suppress transient errors during reconnection — the retry loop
      // already handles them and will surface a close if retries exhaust.
      if (this._isReconnecting) return;
      const errorMessage =
        typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ?
          err.message
        : null;
      this._onError(null, errorMessage || 'WebSocket error', err);
    });

    socket.addEventListener('open', () => {
      this._flushSendQueue();
    });

    socket.addEventListener('close', (event) => {
      // Ignore close events from superseded sockets — a stale socket's
      // late close must not kick off a second reconnect loop.
      if (socket !== this.socket) return;

      const code =
        typeof event === 'object' && event !== null && 'code' in event && typeof event.code === 'number' ?
          event.code
        : WS_ABNORMAL_CLOSURE_CODE;
      const reason =
        typeof event === 'object' && event !== null && 'reason' in event && typeof event.reason === 'string' ?
          event.reason
        : '';
      if (!this._intentionallyClosed && this._canReconnect(code)) {
        this._reconnect(code);
      } else if (!this._isReconnecting) {
        this._emitPermanentClose(code, reason);
      }
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

    // Server-side context state is lost across a reconnect — wake any waiting
    // receive() calls so their generators can exit cleanly.
    for (const entry of this._contextQueues.values()) {
      if (entry.resolve) {
        entry.resolve();
        entry.resolve = null;
      }
    }
    this._contextQueues.clear();

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
        this._emitPermanentClose(
          this._intentionallyClosed ? this._closeCode : closeCode,
          this._intentionallyClosed ? this._closeReason : 'reconnect aborted',
        );
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
        this._emitPermanentClose(closeCode, 'onReconnecting callback threw');
        return;
      }

      if (overrides && 'abort' in overrides && overrides.abort) {
        this._isReconnecting = false;
        this._emitPermanentClose(closeCode, 'reconnect aborted by handler');
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
        this._emitPermanentClose(
          this._intentionallyClosed ? this._closeCode : closeCode,
          this._intentionallyClosed ? this._closeReason : 'reconnect aborted',
        );
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
        this._emitPermanentClose(
          this._intentionallyClosed ? this._closeCode : closeCode,
          this._intentionallyClosed ? this._closeReason : 'reconnect aborted',
        );
        return;
      }

      let closeCodePromise: Promise<number> | undefined;
      try {
        const oldSocket = this.socket;
        this.socket = this._connect();
        // Registered synchronously after _connect() and before any
        // await so the code is captured even when the socket emits 'close'
        // in the same tick as 'error' (e.g. abortHandshake).
        closeCodePromise = new Promise<number>((resolve) => {
          const handler = (evt: unknown) => {
            this.socket.removeEventListener('close', handler);
            resolve(
              typeof evt === 'object' && evt !== null && 'code' in evt && typeof evt.code === 'number' ?
                evt.code
              : WS_ABNORMAL_CLOSURE_CODE,
            );
          };
          this.socket.addEventListener('close', handler);
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
          // The socket may emit 'error' before 'close', so await the code
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
    this._emitPermanentClose(closeCode, `reconnect failed after ${maxRetries} attempts`);
  }

  /**
   * Resolves once the socket is open, rejects if it errors or closes first.
   */
  private _awaitOpen(socket: WebSocketLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
        socket.removeEventListener('close', onFail);
      };
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onError = (err: unknown) => {
        cleanup();
        reject(err);
      };
      const onFail = () => {
        cleanup();
        reject(new Error('socket closed before open'));
      };
      socket.addEventListener('open', onOpen);
      socket.addEventListener('error', onError);
      socket.addEventListener('close', onFail);
    });
  }

  private _flushSendQueue(): void {
    try {
      this._sendQueue.flush((data) =>
        this.socket.send(typeof data === 'string' ? data : flattenRawData(data)),
      );
    } catch (err) {
      this._onError(null, 'could not send queued data', err);
    }
  }

  /**
   * Emits the public `close` event with unsent messages and the internal
   * `close` event used by the async iterator.
   */
  private _emitPermanentClose(code: number, reason: string): void {
    this._lastCloseCode = code;
    this._lastCloseReason = reason;
    const unsent = this._sendQueue.drain();
    // Internal close fires first so the async iterator is guaranteed to
    // terminate even if a public 'close' listener throws.
    this._internalEvents._emit('close', code, reason, unsent);
    this._emit('close', code, reason, unsent);
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
