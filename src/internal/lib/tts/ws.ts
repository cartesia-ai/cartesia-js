// FIXME: Simplify API and use generated WS code as-is in v4

import type * as WS from 'ws';
import type { Cartesia } from '../../../client';
import { uuid4 } from '../../utils/uuid';
import type * as TTSAPI from '../../../resources/tts';
import type * as VoicesAPI from '../../../resources/voices';
import { buildURL, TTSEmitter } from '../../../resources/tts/internal-base';
import { decodeBase64String } from '../../../lib';
import { WebSocketTimeoutError } from './websocket-timeout-error';

let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
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
 * Request parameters for {@link TTSWSContext.generate}
 */
export type ContextGenerateRequest = Pick<TTSAPI.GenerationRequest, 'transcript'> &
  Partial<Omit<TTSAPI.GenerationRequest, 'context_id' | 'transcript'>>;

/**
 * Options for creating a context, including the model, voice, and output format.
 */
export interface ContextOptions {
  /**
   * A unique identifier for the context. You can use any unique identifier, like a
   * UUID or human ID.
   */
  contextId?: string | undefined;

  /**
   * The ID of the model to use for the generation. See
   * [Models](/build-with-cartesia/tts-models) for available models.
   */
  model_id: string;

  output_format: TTSAPI.RawOutputFormat;

  voice: TTSAPI.VoiceSpecifier;

  /**
   * Whether to return phoneme-level timestamps. If `false` (default), no phoneme
   * timestamps will be produced. If `true`, the server will return timestamp events
   * containing phoneme-level timing information.
   */
  add_phoneme_timestamps?: boolean | null;

  /**
   * Whether to return word-level timestamps. If `false` (default), no word
   * timestamps will be produced at all. If `true`, the server will return timestamp
   * events containing word-level timing information.
   */
  add_timestamps?: boolean | null;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](/build-with-cartesia/tts-models).
   */
  language?: VoicesAPI.SupportedLanguage;

  /**
   * The maximum time in milliseconds to buffer text before starting generation.
   * Values between [0, 5000]ms are supported. Defaults to 3000ms.
   *
   * When set, the model will buffer incoming text chunks until it's confident it has
   * enough context to generate high-quality speech, or the buffer delay elapses,
   * whichever comes first. Without this option set, the model will kick off
   * generations immediately, ceding control of buffering to the user.
   *
   * Use this to balance responsiveness with higher quality speech generation, which
   * often benefits from having more context.
   */
  max_buffer_delay_ms?: number | null;

  /**
   * The ID of a pronunciation dictionary to use for the generation. Pronunciation
   * dictionaries are supported by `sonic-3` models and newer.
   */
  pronunciation_dict_id?: string | null;

  /**
   * Whether to use normalized timestamps (True) or original timestamps (False).
   */
  use_normalized_timestamps?: boolean | null;

  /** Receive timeout in milliseconds. If set, receive() will throw {@link WebSocketTimeoutError} after this duration of inactivity. */
  timeout?: number | undefined;
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
    this._timeout = options.timeout;
    this.contextId = options.contextId ?? uuid4();

    this._options = {
      model_id: options.model_id,
      output_format: options.output_format,
      voice: options.voice,
    };
    if (options.add_phoneme_timestamps !== undefined) {
      this._options.add_phoneme_timestamps = options.add_phoneme_timestamps;
    }
    if (options.add_timestamps !== undefined) {
      this._options.add_timestamps = options.add_timestamps;
    }
    if (options.language !== undefined) {
      this._options.language = options.language;
    }
    if (options.max_buffer_delay_ms !== undefined) {
      this._options.max_buffer_delay_ms = options.max_buffer_delay_ms;
    }
    if (options.pronunciation_dict_id !== undefined) {
      this._options.pronunciation_dict_id = options.pronunciation_dict_id;
    }
    if (options.use_normalized_timestamps !== undefined) {
      this._options.use_normalized_timestamps = options.use_normalized_timestamps;
    }
  }

  /**
   * Send a transcript chunk with continue: true.
   * Call this multiple times to stream transcript chunks, then call done() to finish.
   * If flush is true, sends an additional flush request after the transcript.
   */
  async push(options: { transcript: string; generation_config?: TTSAPI.GenerationConfig; flush?: boolean }) {
    await this._ws.send({
      ...this._options,
      transcript: options.transcript,
      ...(options.generation_config === undefined ? null : { generation_config: options.generation_config }),
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
      ...this._options,
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
      ...this._options,
      ...(Object.fromEntries(
        Object.entries(request).filter(([k, v]) => v !== undefined),
      ) as ContextGenerateRequest),
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
      ...this._options,
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

        const event = entry.queue.shift();
        if (event !== undefined) {
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
      ...this._options,
      ...(Object.fromEntries(
        Object.entries(request).filter(([k, v]) => v !== undefined),
      ) as ContextGenerateRequest),
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

export class TTSWS extends TTSEmitter {
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
    this.url = buildURL(client);
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

      if (options?.headers?.['cartesia-version']) {
        // override cartesia version
        url.searchParams.set('cartesia_version', options.headers['cartesia-version']);
      } else if (url.searchParams.get('cartesia_version')) {
        // use current cartesia version
      } else {
        // set cartesia version
        url.searchParams.set('cartesia_version', '2025-11-04');
      }

      if (url.searchParams.get('access_token')) {
        // use current access token
      } else if (this.client.token) {
        // set access token
        url.searchParams.set('access_token', this.client.token);
      } else {
        // api key (insecure fallback)
        const [, overrideApiKey] = options?.headers?.['Authorization']?.trim().split(' ', 2) ?? [];
        if (overrideApiKey) {
          // override api key
          url.searchParams.set('api_key', overrideApiKey);
        } else if (url.searchParams.get('api_key')) {
          // use current api key
        } else if (this.client.apiKey) {
          // api key from client
          url.searchParams.set('api_key', this.client.apiKey);
        }
      }

      this.socket = new WebSocket(url);
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
      const event: TTSAPI.WebsocketResponse | null = (() => {
        try {
          return JSON.parse(typeof raw === 'string' ? raw : raw.toString());
        } catch (err) {
          this._onError(null, 'could not parse websocket event', err);
          return null;
        }
      })();

      if (event) {
        // Decode audio for chunk events (mirrors Python SDK's .audio property).
        if (event.type === 'chunk') {
          event.audio = decodeBase64String(event.data);
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
        const ctxId = event.context_id;
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
  async *generate(
    request: Omit<TTSAPI.GenerationRequest, 'context_id'> & { context_id?: string | null | undefined },
  ): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const contextId: string = request.context_id ?? uuid4();
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
      await this.send({ ...request, context_id: contextId });

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
