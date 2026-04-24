import type * as WS from 'ws';
import { uuid4 } from '../../internal/utils/uuid';
import { TTSWSBase, type TTSWSBaseOptions } from '../../resources/tts/ws-base';
import { ReadyState, type WebSocketLike } from '../../internal/ws-adapter';
import { NodeWebSocket } from '../../internal/ws-adapter-node';
import { BrowserWebSocket } from '../../internal/ws-adapter-browser';
import * as TTSAPI from '../../resources/tts/tts';
import type { Cartesia } from '../../client';
import { CartesiaError } from '../../core/error';
import { WebSocketTimeoutError } from '../../resources/tts/internal-base';

let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}

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

/**
 * Resolves once the socket is open, rejects if it errors or closes first.
 */
function createWebSocketOpenPromise(socket: WebSocketLike): Promise<void> {
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

const TIMEOUT_STATUS_CODE = 408;

/**
 * Request parameters for {@link TTSWSContext.generate}, same as {@link TTSAPI.GenerationRequest} but without context_id and makes properties from {@link ContextOptions} optional (default to {@link ContextOptions} if not provided).
 */
export type ContextGenerateRequest = Omit<
  TTSAPI.GenerationRequest,
  'model_id' | 'voice' | 'output_format' | 'context_id'
> &
  Pick<Partial<TTSAPI.GenerationRequest>, 'model_id' | 'voice' | 'output_format'>;

/**
 * Options for creating a context, including the model, voice, and output format.
 */
export interface ContextOptions {
  model_id: string;
  voice: TTSAPI.VoiceSpecifier;
  output_format: TTSAPI.GenerationRequest['output_format'];
  contextId?: string;
  /** Receive timeout in milliseconds. If set, {@link TTSWSContext.receive} will throw {@link WebSocketTimeoutError} after this duration of inactivity. */
  timeout?: number;
}

interface ContextQueueEntry {
  queue: TTSAPI.WebsocketResponse[];
  resolve: (() => void) | null;
  receiveDidStart: boolean;
}

/**
 * Contexts are short-lived and designed to generate audio for a single transcript.
 *
 * The transcript can broken up into chunks and streamed over time using continuations, which is useful if you're still in the middle of generating your transcript.
 *
 * See https://docs.cartesia.ai/use-the-api/tts-websocket/contexts for details.
 *
 * Created by {@link TTSWS.context}.
 */
export class TTSWSContext {
  private _send: (e: TTSAPI.WebsocketClientEvent) => Promise<void>;
  private _getQueue: (contextId: string) => ContextQueueEntry | undefined;
  private _onDone: (contextId: string) => void;
  private _generate: (
    request: TTSAPI.GenerationRequest & { continue?: false },
  ) => AsyncGenerator<TTSAPI.WebsocketResponse>;
  private _options: Omit<ContextOptions, 'contextId' | 'timeout'>;
  private _timeout: number | undefined;
  readonly contextId: string;

  constructor(
    send: (e: TTSAPI.WebsocketClientEvent) => Promise<void>,
    getQueue: (contextId: string) => ContextQueueEntry | undefined,
    onDone: (contextId: string) => void,
    generate: (
      request: TTSAPI.GenerationRequest & { continue?: false },
    ) => AsyncGenerator<TTSAPI.WebsocketResponse>,
    options: ContextOptions,
  ) {
    this._send = send;
    this._getQueue = getQueue;
    this._onDone = onDone;
    this._generate = generate;
    this._options = {
      model_id: options.model_id,
      voice: { id: options.voice.id, mode: options.voice.mode },
      output_format: {
        container: options.output_format.container,
        encoding: options.output_format.encoding,
        sample_rate: options.output_format.sample_rate,
      },
    };
    this._timeout = options.timeout;
    this.contextId = options.contextId || uuid4();
  }

  /**
   * Send a transcript chunk with `continue: true`.
   * Call this multiple times to stream transcript chunks, then call `done()` to finish.
   * If flush is true, sends an additional flush request after the transcript.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async push(options: { transcript: string; flush?: boolean }) {
    await this._send({
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
   * Sends an empty transcript with `continue: false`.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async no_more_inputs() {
    await this._send({
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
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async send(request: ContextGenerateRequest) {
    await this._send({
      ...request,
      model_id: request.model_id ?? this._options.model_id,
      voice: request.voice ?? this._options.voice,
      output_format: request.output_format ?? this._options.output_format,
      context_id: this.contextId,
    });
  }

  /**
   * Flush any buffered audio for this context.
   * Sends an empty transcript with flush=true and continue=true.
   * This is always sent as a separate request per the API requirement.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async flush() {
    await this._send({
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
   * Iterate over responses for this context. Completes when a "done" event is received, the context automatically closed due to inactivity, or because the WebSocket connection was lost.
   * - After {@link receive} returns, {@link TTSWSContext} will close and a new context must be created using {@link TTSWS.context}.
   * - Cannot bed used alongside {@link generate}); choose one method or the other
   *
   * @param options.timeout - Override the context-level timeout (ms) for this receive call.
   *
   * @throws If `options.timeout` was provided and no messages was received in that time: {@link WebSocketTimeoutError}.
   */
  async *receive(options?: { timeout?: number }): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const timeout = options?.timeout ?? this._timeout;

    try {
      while (true) {
        const entry = this._getQueue(this.contextId);
        if (entry === undefined) {
          // Queue was removed
          return;
        }
        entry.receiveDidStart = true;
        const eventMessage = entry.queue.shift();

        if (eventMessage === undefined) {
          // Wait for the next event to be pushed into the queue.
          const waitPromise = new Promise<void>((r) => {
            entry.resolve = r;
          });

          if (timeout !== undefined) {
            let timer: ReturnType<typeof setTimeout> | null = null;
            const timeoutPromise = new Promise<'timeout'>((r) => {
              timer = setTimeout(() => r('timeout'), timeout);
            });

            const result = await Promise.race([waitPromise.then(() => 'event' as const), timeoutPromise]);

            if (timer !== null) {
              clearTimeout(timer);
            }

            if (result === 'timeout') {
              entry.resolve = null;
              throw new WebSocketTimeoutError(this.contextId, timeout);
            }
          } else {
            await waitPromise;
          }
        } else {
          yield eventMessage;
          // first done event wins
          if (
            eventMessage.type === 'done' ||
            (eventMessage.type === 'error' && eventMessage.done !== false)
          ) {
            return;
          }
        }
      }
    } finally {
      this._onDone(this.contextId);
    }
  }

  /**
   * Send a generation request and iterate over the responses.
   * - After {@link generate} finishes, {@link TTSWSContext} will close and a new context must be created using {@link TTSWS.context}.
   * - Cannot bed used alongside {@link receive}); choose one method or the other
   *
   * Use {@link send} with `continue: true` if you want to keep sending more transcript chunks to the same context.
   *
   * @throws If the WebSocket could not be connected or {@link TTSWSContext.receive} was already called: {@link CartesiaError}.
   */
  async *generate(
    request: ContextGenerateRequest & { continue?: false },
  ): AsyncGenerator<TTSAPI.WebsocketResponse> {
    yield* this._generate({
      ...request,
      model_id: request.model_id ?? this._options.model_id,
      voice: request.voice ?? this._options.voice,
      output_format: request.output_format ?? this._options.output_format,
      context_id: this.contextId,
    });
  }

  /**
   * Cancel this context to stop generating speech.
   */
  async cancel() {
    await this._send({ context_id: this.contextId, cancel: true });
  }
}

export interface TTSWSClientOptions extends WS.ClientOptions, TTSWSBaseOptions {}

export class TTSWS extends TTSWSBase<NodeWebSocket | BrowserWebSocket> {
  private _wsOptions: WS.ClientOptions | null | undefined;
  private _contextQueues: Map<string, ContextQueueEntry> = new Map();

  constructor(client: Cartesia, options?: TTSWSClientOptions | null | undefined) {
    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    super(client, undefined /* parameters */, { reconnect, maxQueueSize });
    this._wsOptions = wsOptions;

    if (!_ws?.WebSocket && typeof WebSocket === 'undefined') {
      throw new CartesiaError(
        'TTSWS from "@cartesia/cartesia-js/resources/tts/ws" requires the "ws" package but it could not be loaded.',
      );
    }

    // Decode audio for chunk events (mirrors Python SDK's .audio property)
    // and route events to per-context queues. Registered on the emitter's
    // 'event' channel, which fires synchronously before typed events like
    // 'chunk', so consumers see the decoded payload.
    this.on('event', (event) => {
      if (event.context_id === undefined) return;
      const entry = this._contextQueues.get(event.context_id);
      if (entry === undefined) return;

      if (event.type === 'chunk') {
        event.audio = event.data ? decodeBase64(event.data) : null;
      }

      entry.queue.push(event);
      entry.resolve?.();
      entry.resolve = null;
    });

    // contexts are lost on socket close (even if we reconnect later)
    this.on('close', (code, reason) => {
      for (const [context_id, entry] of Array.from(this._contextQueues.entries())) {
        entry.queue.push({
          type: 'error',
          context_id,
          done: true,
          error: `Context lost due to WebSocket disconnecting (${code}): ${reason}`,
          status_code: TIMEOUT_STATUS_CODE,
        });
        entry.resolve?.();
        entry.resolve = null;
      }
    });
    // contexts are lost on reconnects
    this.on('reconnecting', () => {
      for (const [context_id, entry] of Array.from(this._contextQueues.entries())) {
        entry.queue.push({
          type: 'error',
          context_id,
          done: true,
          error: `Context lost due to WebSocket reconnecting (${this._lastCloseCode}): ${this._lastCloseReason}`,
          status_code: TIMEOUT_STATUS_CODE,
        });
        entry.resolve?.();
        entry.resolve = null;
      }
    });
  }

  protected _createSocket(url: URL, authHeaders: Record<string, string>) {
    if (_ws?.WebSocket) {
      const ws = new _ws.WebSocket(url, {
        ...this._wsOptions,
        headers: {
          'cartesia-version': '2025-11-04',
          ...authHeaders,
          ...this._wsOptions?.headers,
        },
      });
      return new NodeWebSocket(ws);
    }
    // Browser: use native WebSocket with auth in URL query params.
    const browserUrl = new URL(url.toString());
    browserUrl.searchParams.set('cartesia_version', '2025-11-04');
    if (this._client.token) {
      browserUrl.searchParams.set('access_token', this._client.token);
    } else if (this._client.apiKey) {
      browserUrl.searchParams.set('api_key', this._client.apiKey);
    }
    const ws = new WebSocket(browserUrl.toString());
    // FIXME: BrowserWebSocket constructor does not accept WebSocket
    return new BrowserWebSocket(ws as any);
  }

  /**
   * Send a request without waiting for responses.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  override async send({ ...request }: TTSAPI.WebsocketClientEvent): Promise<void> {
    if ('cancel' in request && request.cancel) {
      // no need to cancel if the socket closed since the context is already gone
      if (this.socket?.readyState === ReadyState.OPEN || this.socket?.readyState === ReadyState.CONNECTING) {
        super.send(request);
      }
      return;
    }
    // generation request
    await this.connect();
    super.send(request);
  }

  /**
   * Send a generation request and iterate over the responses.
   * - `request.context_id` will close after {@link generate} finishes; a new context must be created for the next generation
   * - Cannot bed used alongside {@link TTSWSContext.receive}; choose one method or the other
   *
   * Use {@link send} with `request.continue = true` if you want to keep sending more transcript chunks to the same context.
   *
   * @throws If the WebSocket could not be connected or {@link TTSWSContext.receive} was already called: {@link CartesiaError}.
   */
  async *generate({
    ...request
  }: TTSAPI.GenerationRequest & { continue?: false }): AsyncGenerator<TTSAPI.WebsocketResponse> {
    if (this._contextQueues.get(request.context_id)?.receiveDidStart) {
      throw new CartesiaError(
        'Cannot generate since TTSWSContext.receive was already called (use one method or the other).',
      );
    }
    this._contextQueues.delete(request.context_id);

    const queue: TTSAPI.WebsocketResponse[] = [];
    let resolve: (() => void) | null = null;

    const onEvent = (event: TTSAPI.WebsocketResponse) => {
      if (event.context_id !== request.context_id) {
        return;
      }
      queue.push(event);
      resolve?.();
    };

    const onClose = (code: number, reason: string) => {
      queue.push({
        type: 'error',
        context_id: request.context_id,
        done: true,
        error: `Context lost due to WebSocket disconnecting (${code}): ${reason}`,
        status_code: TIMEOUT_STATUS_CODE,
      });
      resolve?.();
      resolve = null;
    };
    const onReconnect = () => {
      queue.push({
        type: 'error',
        context_id: request.context_id,
        done: true,
        error: 'Context lost due to WebSocket reconnecting',
        status_code: TIMEOUT_STATUS_CODE,
      });
      resolve?.();
      resolve = null;
    };

    try {
      this.once('close', onClose);
      this.once('reconnecting', onReconnect);
      this.on('event', onEvent);
      await this.send(request);

      while (true) {
        const eventMessage = queue.shift();
        if (eventMessage === undefined) {
          // Wait for the next event to be pushed into the queue.
          await new Promise<void>((r) => {
            resolve = r;
          });
        } else {
          yield eventMessage;
          // first done wins
          if (
            eventMessage.type === 'done' ||
            (eventMessage.type === 'error' && eventMessage.done !== false)
          ) {
            return;
          }
        }
      }
    } finally {
      this.off('event', onEvent);
      this.off('reconnecting', onReconnect);
      this.off('close', onClose);
    }
  }

  /**
   * Cancel a context to stop generating speech for it.
   */
  async cancelContext(contextId: string): Promise<void> {
    await this.send({ cancel: true, context_id: contextId });
  }

  /**
   * Creates a context. Contexts are short-lived and designed to generate audio for a single transcript.
   *
   * The transcript can broken up into chunks and streamed over time using continuations, which is useful if you're still in the middle of generating your transcript.
   *
   * See https://docs.cartesia.ai/use-the-api/tts-websocket/contexts for details.
   *
   * @param options.context_id - Must be unique per WebSocket connection if provided.
   *
   * @throws If an instance of {@link TTSWSContext} exists with the same context ID: {@link CartesiaError}. Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context ID is a duplicate even if this method did not throw.
   */
  context(options: ContextOptions): TTSWSContext {
    const ctx = new TTSWSContext(
      (...args) => this.send(...args),
      (...args) => this._contextQueues.get(...args),
      (...args) => this._contextQueues.delete(...args),
      (...args) => this.generate(...args),
      options,
    );
    if (this._contextQueues.has(ctx.contextId)) {
      throw new CartesiaError(`Cannot create context: Duplicate context ID ${ctx.contextId}`);
    }
    this._contextQueues.set(ctx.contextId, { queue: [], resolve: null, receiveDidStart: false });
    return ctx;
  }

  /**
   * Wait for the WebSocket connection to be ready.
   *
   * @throws If the WebSocket could not be connected: {@link CartesiaError}.
   */
  async connect(): Promise<this> {
    if (this._intentionallyClosed) {
      throw new CartesiaError('TTS WebSocket cannot connect since it was closed.');
    }

    if (this.socket === null) {
      const socket = this._connect();
      this.socket = socket;
      await createWebSocketOpenPromise(socket);
    } else if (this.socket.readyState === ReadyState.CONNECTING) {
      await createWebSocketOpenPromise(this.socket);
    } else if (this.socket.readyState !== ReadyState.OPEN) {
      const reconnectPromiseDeps: { cleanup?: () => void } = {};

      const reconnectPromise = new Promise<void>((resolve, reject) => {
        const onReconnected = () => {
          this.off('close', onClose);
          resolve();
        };
        const onClose = (code: number, reason: string) => {
          this.off('reconnected', onReconnected);
          reject(new CartesiaError(`TTS WebSocket closed during reconnect (${code}): ${reason}`));
        };

        this.once('reconnected', onReconnected);
        this.once('close', onClose);

        reconnectPromiseDeps.cleanup = () => {
          this.off('reconnected', onReconnected);
          this.off('close', onClose);
          resolve();
        };
      });

      try {
        await this._reconnect(this._lastCloseCode);
      } catch (error) {
        reconnectPromiseDeps.cleanup?.();
        await reconnectPromise;
        throw error;
      }

      await reconnectPromise;
    }

    return this;
  }
}
