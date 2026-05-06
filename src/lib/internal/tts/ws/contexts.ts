import type { TTSWSContexts } from '../../../tts/ws/contexts';
import type { Cartesia } from '../../../../client';
import { CartesiaError } from '../../../../core/error';
import { EventEmitter } from '../../../../core/EventEmitter';
import { uuid4 } from '../../../../internal/utils/uuid';
import type { ReconnectingEvent, UnsentMessage } from '../../../../internal/ws';
import { ReadyState } from '../../../../internal/ws-adapter';
import { WebSocketError } from '../../../../resources/tts/internal-base';
import type * as TTSAPI from '../../../../resources/tts/tts';
import { TTSWS, type TTSWSClientOptions } from '../../../../resources/tts/ws';
import { decodeBase64String } from '../../../utils';

class TTSWSContext implements TTSWSContexts.Context {
  private _ws: TTSWS;
  private _send: (clientEvent: TTSAPI.WebsocketClientEvent) => CartesiaError | null;
  private _cleanup: () => void;
  private readonly _generationParams: TTSWSContexts.ContextParams;
  private readonly _timeout: number | undefined;
  private _isActive: boolean = true;
  private _queue: TTSAPI.WebsocketResponse[] | null = [];
  private _wakeOnEventListeners: ((val: 'event') => void)[] = [];
  readonly contextId: string;

  constructor(
    {
      context_id,
      model_id,
      voice,
      output_format,
      language,
      add_phoneme_timestamps,
      add_timestamps,
      timeout,
    }: TTSWSContexts.ContextParams & { context_id: string },
    ws: TTSWS,
    send: (clientEvent: TTSAPI.WebsocketClientEvent) => CartesiaError | null,
    removeFromManager: () => void,
  ) {
    this._ws = ws;
    this._send = send;
    this.contextId = context_id;
    this._generationParams = {
      model_id,
      voice: { ...voice },
      output_format: { ...output_format },
      ...(language === undefined ? null : { language }),
      ...(add_phoneme_timestamps === undefined ? null : { add_phoneme_timestamps }),
      ...(add_timestamps === undefined ? null : { add_timestamps }),
    };
    this._timeout = timeout;

    const onClose = (): void => {
      this._cleanup();
    };

    const onEvent = (e: TTSAPI.WebsocketResponse): void => {
      if (e.context_id !== this.contextId) return;

      if (e.type === 'done' || (e.type === 'error' && e.done !== false)) {
        this._isActive = false;
      }

      this._queue?.push(e);

      const resolves = this._wakeOnEventListeners;
      this._wakeOnEventListeners = [];
      for (const resolve of resolves) {
        resolve('event');
      }
    };

    const onReconnecting = (): void => {
      this._cleanup();
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

      removeFromManager();
    };
  }

  push(request: TTSWSContexts.ContextPushRequest, extraProperties?: Record<string, unknown> | null) {
    if (this.isClosed) {
      throw new CartesiaError(`Cannot push to closed context (${this.contextId}).`);
    }

    const error = this._send({
      ...request,
      ...this._generationParams,
      context_id: this.contextId,
      continue: request.continue ?? true,
      ...extraProperties,
    });

    if (error !== null) {
      throw error satisfies CartesiaError;
    }
  }

  end() {
    if (this.isClosed) {
      return;
    }

    this._send({
      ...this._generationParams,
      transcript: '',
      continue: false,
      context_id: this.contextId,
    });
  }

  flush() {
    if (this.isClosed) {
      throw new CartesiaError(`Cannot flush closed context (${this.contextId}).`);
    }

    const error = this._send({
      ...this._generationParams,
      transcript: '',
      continue: true,
      flush: true,
      context_id: this.contextId,
    });

    if (error !== null) {
      throw error satisfies CartesiaError;
    }
  }

  async *receive(): AsyncGenerator<TTSWSContexts.WebSocketResponse> {
    const queue = this._queue ?? [];
    this._queue = null;

    const onEvent = (e: TTSAPI.WebsocketResponse): void => {
      if (e.context_id !== this.contextId) return;
      queue.push(e);
    };

    try {
      this._ws.on('event', onEvent);
      while (this._isActive || queue.length > 0) {
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
            this._isActive = false;
            yield {
              type: 'error',
              done: true,
              context_id: this.contextId,
              title: 'Timeout',
              message: `Client-side timeout of ${this._timeout}ms reached with no events from the server.`,
              error_code: 'client_timeout',
            };
            return;
          }
        } else {
          // Decode audio for chunk events (mirrors Python SDK's .audio property)
          // and route events to per-context queues.
          if (eventMessage.type === 'chunk') {
            yield { ...eventMessage, audio: decodeBase64String(eventMessage.data) };
          } else {
            yield eventMessage;
          }
        }
      }
    } finally {
      this._ws.off('event', onEvent);
      this._cleanup();
    }
  }

  cancel() {
    if (this.isClosed) {
      return;
    }

    this._send({ cancel: true, context_id: this.contextId });
    // rely on event listeners to trigger _cleanup()
  }

  get isClosed(): boolean {
    return !this._isActive;
  }
}

export class TTSContextsWSConnection
  extends EventEmitter<TTSWSContexts.WSConnectionEvents>
  implements TTSWSContexts.WSConnection
{
  private _client: Cartesia;
  private _wsOptions: TTSWSClientOptions | null | undefined;
  private _ws: TTSWS;
  private _contexts: Map<string, TTSWSContext> = new Map();
  private _permanentlyClosed: boolean = false;
  private _cleanupWSListeners: (() => void) | null = null;

  constructor(
    client: Cartesia,
    parameters?: Record<string, unknown> | undefined,
    options?: TTSWSClientOptions | null | undefined,
  ) {
    super();
    this._client = client;
    this._wsOptions = options;
    this._ws = new TTSWS(client, parameters, options);
    this._initTTSWS();
  }

  private _initTTSWS(): void {
    const onError = (error: WebSocketError): void => {
      // ignore errors with a context ID since they are handled by TTSWSContext
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
   * Creates a context. TTSWSContexts are short-lived and designed to generate audio for a single transcript.
   *
   * The transcript can be broken up into chunks and streamed over time using continuations,
   * which is useful if you're still in the middle of generating your transcript.
   *
   * See [the API docs](https://docs.cartesia.ai/use-the-api/tts-websocket/contexts) for details.
   *
   * @param params.context_id - Must be unique per WebSocket connection if provided.
   *
   * @throws If an instance of {@link TTSWSContext} exists with the same context ID: {@link CartesiaError}.
   * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context ID is a duplicate even if this method did not throw.
   */
  context({ context_id, ...params }: TTSWSContexts.ContextParams) {
    const finalContextId = context_id || uuid4();

    if (this._contexts.has(finalContextId)) {
      throw new CartesiaError(
        `TTSContextsWSConnection cannot create context: Duplicate context ID ${finalContextId}`,
      );
    }

    // Synchronously validate that the manager is open and ensure _ws is at
    // minimum CONNECTING. This way the context captures a live ws and the
    // codegen send queue handles messages sent before the socket opens.
    this._prepareConnection();

    const ctx = new TTSWSContext(
      { ...params, context_id: finalContextId },
      this._ws,
      (clientEvent) => {
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
      },
      () => {
        if (this._contexts.get(ctx.contextId) === ctx) {
          this._contexts.delete(ctx.contextId);
        }
      },
    );

    // already checked that finalContextId is not in the set synchronously
    this._contexts.set(finalContextId, ctx);

    return ctx;
  }

  /**
   * Synchronously ensure the underlying ws is at minimum CONNECTING and
   * the manager is not permanently closed. Replaces _ws if it has already
   * closed; in that case any tracked contexts pointed at the old ws are
   * dropped from the map (their listeners on the old ws will still clean
   * them up when its close event fires).
   *
   * @throws If the context manager was closed: {@link CartesiaError}.
   */
  private _prepareConnection(): void {
    if (this._permanentlyClosed) {
      throw new CartesiaError('TTSContextsWSConnection cannot connect since it was closed.');
    }
    const state = this._ws.socket.readyState;
    if (state === ReadyState.OPEN || state === ReadyState.CONNECTING) {
      return;
    }
    // create a new TTSWS to force a reconnection
    this._contexts.clear();
    this._cleanupWSListeners?.();
    this._ws.close();
    this._ws = new TTSWS(this._client, undefined /* parameters */, this._wsOptions);
    this._initTTSWS();
  }

  /**
   * Wait for the WebSocket connection to be ready.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async connect() {
    this._prepareConnection();
    if (this._ws.socket.readyState === ReadyState.OPEN) {
      return this;
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
        reject(new CartesiaError(`TTSContextsWSConnection failed to connect (${code}): ${reason}`));
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
