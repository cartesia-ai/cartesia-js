import type { Cartesia } from '../../../client';
import { CartesiaError } from '../../../core/error';
import { EventEmitter } from '../../../core/EventEmitter';
import { uuid4 } from '../../../internal/utils/uuid';
import type { ReconnectingEvent, UnsentMessage } from '../../../internal/ws';
import { ReadyState } from '../../../internal/ws-adapter';
import { WebSocketError } from '../../../resources/tts/internal-base';
import * as TTSAPI from '../../../resources/tts/tts';
import { TTSWS, type TTSWSClientOptions } from '../../../resources/tts/ws';
import { decodeBase64 } from '../utils';

type TTSContextEvents = {
  close: (code: number) => void;
};

// Note: ContextOptions is only exported for backward compatibility since it was included in src/resources/tts/index.ts
/** Accepted by {@link TTSContextManager.context} */
export type ContextOptions = {
  model_id: string;
  voice: TTSAPI.VoiceSpecifier;
  output_format: TTSAPI.GenerationRequest['output_format'];
  contextId?: string;
  /** Receive timeout in milliseconds. If set, {@link TTSTTSContext.receive} will close itself after this duration of inactivity. */
  timeout?: number;
};

type TTSContextManagerEvents = {
  error: (error: WebSocketError) => void;
  close: (code: number, reason: string, unsent: UnsentMessage<TTSAPI.WebsocketClientEvent>[]) => void;
  reconnecting: (event: ReconnectingEvent) => void;
  reconnected: () => void;
};

/**
 * Text-to-Speech with context management.
 *
 * Supports:
 * - Streaming
 * - Long-lived connections allow for lower latency by reusing a live network connection
 * - Timestamps
 * - Multiple TTS [contexts](https://docs.cartesia.ai/use-the-api/tts-websocket/contexts) over the same connection
 * - [Context flushing](https://docs.cartesia.ai/use-the-api/tts-websocket/context-flushing-and-flush-i-ds)
 * - [Transcript buffering](https://docs.cartesia.ai/use-the-api/tts-websocket/buffering)
 * - Event listeners
 */
export namespace TTSContexts {
  /**
   * Manages instances of {@link IContext}.
   */
  export interface IManager extends EventEmitter<TTSContextManagerEvents> {
    /**
     * Connect or reconnect the underlying WebSocket.
     *
     * You can call this method ahead of time to reduce latency for the first audio chunk.
     */
    connect(): Promise<IManager>;

    /**
     * Close all resources and cleans up all contexts created by {@link IManager.context}.
     */
    close(): void;

    /**
     * Creates a context. TTSContexts are short-lived and designed to generate audio for a single transcript.
     *
     * The transcript can broken up into chunks and streamed over time using continuations, which is useful if you're still in the middle of generating your transcript.
     *
     * See https://docs.cartesia.ai/use-the-api/tts-websocket/contexts for details.
     *
     * @param options.context_id - Must be unique per WebSocket connection if provided.
     *
     * @throws If an instance of {@link TTSTTSContext} exists with the same context ID: {@link CartesiaError}. Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context ID is a duplicate even if this method did not throw.
     */
    context(options: ContextOptions): IContext;

    getContext(contextId: string): IContext | undefined;

    listContexts(): IContext[];
  }
  /**
   * Contexts are short-lived and designed to generate audio for a single transcript.
   *
   * The transcript can broken up into chunks and streamed over time using continuations, which is useful if you're still in the middle of generating your transcript.
   *
   * See https://docs.cartesia.ai/use-the-api/tts-websocket/contexts for details.
   *
   * Created by {@link IManager.context}.
   */
  export interface IContext extends EventEmitter<TTSContextEvents> {
    readonly contextId: string;
    readonly isClosed: boolean;

    /**
     * Call this multiple times to stream transcript chunks, then call {@link IContext.end} to finish.
     *
     * @param request.continue If set to false, signal that the transcript is complete.
     * You do not need to call {@link IContext.end} if you send a request with `continue: false`.
     *
     * @throws If the context is closed: {@link CartesiaError}.
     * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context closed due to inactivity even if this method did not throw.
     */
    push(
      request: Omit<TTSAPI.GenerationRequest, 'model_id' | 'voice' | 'output_format' | 'context_id'>,
    ): void;

    /**
     * Signal that no more transcript chunks will be sent.
     *
     * You must call this method if you are relying on Cartesia to manage buffering (default behavior).
     *
     * See [Buffering](https://docs.cartesia.ai/use-the-api/tts-websocket/buffering) for details.
     *
     * @throws If the context is closed: {@link CartesiaError}.
     * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context closed due to inactivity even if this method did not throw.
     */
    end(): void;

    /**
     * Flushes the context. You should ignore this method unless you need flushes.
     *
     * Useful if you need to know when transcript chinks finished generating.
     * You will receive {@link TTSAPI.WebsocketResponse.FlushDone} once the transcript pushed to this context so far by {@link IContext.push} is done generating.
     *
     * See [Context Flushing and Flush IDs](https://docs.cartesia.ai/use-the-api/tts-websocket/context-flushing-and-flush-i-ds) for details.
     *
     * @throws If the context is closed: {@link CartesiaError}.
     * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context closed due to inactivity even if this method did not throw.
     */
    flush(): void;

    /**
     * Iterates over responses for this context.
     *
     * WebSocket responses are queued until this method is called for the first time.
     *
     * Completes when any of the following events occur:
     * - A {@link TTSAPI.WebsocketResponse.Done} event is received
     * - The context automatically closed due to inactivity
     * - The WebSocket connection was lost
     * - Timeout was reached
     *
     * Once complete, {@link IContext} will close and a new context must be created using {@link TTSContextManager.context}.
     */
    receive(): AsyncGenerator<TTSAPI.WebsocketResponse>;

    /**
     * Cancel this context to stop generating speech.
     */
    cancel(): void;
  }
}

class TTSContext extends EventEmitter<TTSContextEvents> implements TTSContexts.IContext {
  private _ws: TTSWS;
  private _send: (
    clientEvent: TTSAPI.WebsocketClientEvent,
    doNotInitConnection?: boolean,
  ) => CartesiaError | null;
  private _cleanup: () => void;
  private _modelId: string;
  private _voice: TTSAPI.VoiceSpecifier;
  private _outputFormat: TTSAPI.GenerationRequest['output_format'];
  private _timeout: number | undefined;
  private _isActive: boolean = true;
  private _queue: TTSAPI.WebsocketResponse[] | null = [];
  private _wakeOnEventListeners: ((val: 'event') => void)[] = [];
  readonly contextId: string;

  constructor(
    options: ContextOptions,
    ws: TTSWS,
    send: (clientEvent: TTSAPI.WebsocketClientEvent, doNotInitConnection?: boolean) => CartesiaError | null,
  ) {
    super();
    this._ws = ws;
    this._send = send;
    this._modelId = options.model_id;
    this._voice = { ...options.voice };
    this._outputFormat = { ...options.output_format };
    this.contextId = options.contextId || uuid4();
    this._timeout = options.timeout;

    const onClose = (code: number): void => {
      this._cleanup();
      this._emit('close', code);
    };

    const onEvent = (e: TTSAPI.WebsocketResponse): void => {
      if (e.context_id !== this.contextId) return;
      this._queue?.push(e);

      const resolves = this._wakeOnEventListeners;
      this._wakeOnEventListeners = [];
      for (const resolve of resolves) {
        resolve('event');
      }
    };

    const onReconnecting = (e: ReconnectingEvent): void => {
      this._cleanup();
      this._emit('close', e.closeCode);
    };

    ws.on('close', onClose);
    ws.on('event', onEvent);
    ws.on('reconnecting', onReconnecting);

    this._cleanup = () => {
      this._isActive = false;
      ws.off('close', onClose);
      ws.off('event', onEvent);
      ws.off('reconnecting', onReconnecting);

      const resolves = this._wakeOnEventListeners;
      this._wakeOnEventListeners = [];
      for (const resolve of resolves) {
        resolve('event');
      }
    };
  }

  push(request: Omit<TTSAPI.GenerationRequest, 'model_id' | 'voice' | 'output_format' | 'context_id'>) {
    if (!this._isActive) {
      throw new CartesiaError(`Cannot push to closed context (${this.contextId}).`);
    }

    const error = this._send({
      model_id: this._modelId,
      voice: this._voice,
      output_format: this._outputFormat,
      context_id: this.contextId,
      ...request,
      continue: request.continue ?? true,
    });

    if (error !== null) {
      throw error satisfies CartesiaError;
    }
  }

  end() {
    if (!this._isActive) {
      throw new CartesiaError(`Cannot push to closed context (${this.contextId}).`);
    }

    const error = this._send({
      transcript: '',
      continue: false,
      model_id: this._modelId,
      voice: this._voice,
      output_format: this._outputFormat,
      context_id: this.contextId,
    });

    if (error !== null) {
      throw error satisfies CartesiaError;
    }
  }

  flush() {
    if (!this._isActive) {
      throw new CartesiaError(`Cannot push to closed context (${this.contextId}).`);
    }

    const error = this._send({
      transcript: '',
      continue: true,
      flush: true,
      model_id: this._modelId,
      voice: this._voice,
      output_format: this._outputFormat,
      context_id: this.contextId,
    });

    if (error !== null) {
      throw error satisfies CartesiaError;
    }
  }

  async *receive(): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const queue = this._queue ?? [];
    this._queue = null;

    const onEvent = (e: TTSAPI.WebsocketResponse): void => {
      queue?.push(e);
    };

    try {
      this._ws.on('event', onEvent);
      while (this._isActive || queue?.length > 0) {
        const eventMessage = queue.shift();
        if (eventMessage === undefined) {
          // Wait for the next event to be pushed into the queue
          let timer: ReturnType<typeof setTimeout> | null = null;

          const promises: Promise<'event' | 'timeout'>[] = [
            new Promise((r) => {
              this._wakeOnEventListeners.push(r);
            }),
          ];

          if (this._timeout !== undefined) {
            promises.push(
              new Promise((r) => {
                timer = setTimeout(() => r('timeout'), this._timeout);
              }),
            );
          }

          const result = await Promise.race(promises);
          if (timer !== null) {
            clearTimeout(timer);
          }
          if (result === 'timeout') {
            return;
          }
        } else {
          if (
            eventMessage.type === 'done' ||
            (eventMessage.type === 'error' && eventMessage.done !== false)
          ) {
            this._isActive = false;
          }
          // Decode audio for chunk events (mirrors Python SDK's .audio property)
          // and route events to per-context queues.
          if (eventMessage.type === 'chunk') {
            eventMessage.audio = eventMessage.data ? decodeBase64(eventMessage.data) : null;
          }
          yield eventMessage;
        }
      }
    } finally {
      this._ws.off('event', onEvent);
      this._cleanup();
    }
  }

  cancel() {
    this._send({ cancel: true, context_id: this.contextId }, true /* doNotInitConnection */);
    // rely on event listeners to trigger _cleanup()
  }

  get isClosed(): boolean {
    return !this._isActive;
  }
}

export class TTSContextManager extends EventEmitter<TTSContextManagerEvents> implements TTSContexts.IManager {
  private _client: Cartesia;
  private _wsOptions: TTSWSClientOptions | null | undefined;
  private _ws: TTSWS;
  private _contexts: Map<string, TTSContext> = new Map();
  private _permanentlyClosed: boolean = false;
  private _cleanupWSListeners: (() => void) | null = null;

  constructor(client: Cartesia, options?: TTSWSClientOptions | null | undefined) {
    super();
    this._client = client;
    this._wsOptions = options;
    this._ws = new TTSWS(client, undefined /* parameters */, options);
    this._initTTSWS();
  }

  private _initTTSWS(): void {
    const onError = (error: WebSocketError): void => {
      // ignore errors with a context ID since they are handled by TTSContext
      if (error?.error?.context_id) return;

      this._emit('error', error);

      // if there are no error listeners, also create an unhandled promise rejection to make the error visible
      if (!this._hasListener('error')) {
        Promise.reject(error);
      }
    };

    const onClose = (
      code: number,
      reason: string,
      unsent: UnsentMessage<TTSAPI.WebsocketClientEvent>[],
    ): void => {
      // contexts are lost on socket close (even if we reconnect later)
      this._contexts.clear();
      this._emit('close', code, reason, unsent);
    };

    const onReconnecting = (e: ReconnectingEvent): void => {
      // contexts are lost on reconnects
      this._contexts.clear();
      this._emit('reconnecting', e);
    };

    const onReconnected = (): void => {
      this._emit('reconnected');
    };

    this._ws.on('error', onError);
    this._ws.on('close', onClose);
    this._ws.on('reconnecting', onReconnecting);
    this._ws.on('reconnected', onReconnected);

    this._cleanupWSListeners = () => {
      this._ws.off('error', onError);
      this._ws.off('close', onClose);
      this._ws.off('reconnecting', onReconnecting);
      this._ws.off('reconnected', onReconnected);
    };
  }

  /**
   * Creates a context. TTSContexts are short-lived and designed to generate audio for a single transcript.
   *
   * The transcript can broken up into chunks and streamed over time using continuations,
   * which is useful if you're still in the middle of generating your transcript.
   *
   * See https://docs.cartesia.ai/use-the-api/tts-websocket/contexts for details.
   *
   * @param options.context_id - Must be unique per WebSocket connection if provided.
   *
   * @throws If an instance of {@link TTSContext} exists with the same context ID: {@link CartesiaError}.
   * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context ID is a duplicate even if this method did not throw.
   */
  context(options: ContextOptions) {
    let isFirstSendCall = true;

    const ctx = new TTSContext(options, this._ws, (clientEvent, doNotInitConnection) => {
      if (isFirstSendCall && !doNotInitConnection) {
        try {
          void this.connect();
        } catch (e) {
          if (e instanceof CartesiaError) {
            return e;
          }
          throw e;
        }
      }
      isFirstSendCall = false;

      let error: CartesiaError | null = null;
      const onSendError = (e: WebSocketError) => {
        // we are only trying to capture an error in sending the message
        // not server-sent errors
        if (e.error === undefined) {
          error = e;
        }
      };

      // this funny error listener dance is necessary to avoid modifying generated code
      // there's currently no other way to directly get an error from the send method
      this._ws.on('error', onSendError);
      try {
        this._ws.send(clientEvent);
      } finally {
        // send doesn't throw errors, but just in case that changes i'm using a finally block
        this._ws.off('error', onSendError);
      }

      return error;
    });

    if (this._contexts.has(ctx.contextId)) {
      throw new CartesiaError(
        `TTSContextManager cannot create context: Duplicate context ID ${ctx.contextId}`,
      );
    }
    this._contexts.set(ctx.contextId, ctx);
    return ctx;
  }

  /**
   * Wait for the WebSocket connection to be ready.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async connect() {
    if (this._permanentlyClosed) {
      throw new CartesiaError('TTSContextManager cannot connect since it was closed.');
    }
    if (this._ws.socket.readyState === ReadyState.OPEN) {
      return this;
    }

    if (this._ws.socket.readyState !== ReadyState.CONNECTING) {
      // create a new TTSWS to force a reconnection
      this._cleanupWSListeners?.();
      this._ws.close();
      this._ws = new TTSWS(this._client, undefined /* parameters */, this._wsOptions);
      this._initTTSWS();
    }

    const socket = this._ws.socket;

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        socket.off('open', onOpen);
        socket.off('error', onError);
        socket.off('close', onFail);
      };
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onError = (err: WebSocketError) => {
        cleanup();
        reject(err);
      };
      const onFail = (code: number, reason: string) => {
        cleanup();
        reason = reason || 'unknown reason';
        reject(new CartesiaError(`TTSContextManager failed to connect (${code}): ${reason}`));
      };
      socket.once('open', onOpen);
      socket.once('error', onError);
      socket.once('close', onFail);
    });

    return this;
  }

  close() {
    this._permanentlyClosed = true;
    this._ws.close();
  }

  getContext(contextId: string) {
    return this._contexts.get(contextId);
  }

  listContexts() {
    return Array.from(this._contexts.values());
  }
}
