// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type * as WS from 'ws';
let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}
import { uuid4 } from '../../internal/utils/uuid';
import { WebSocketTimeoutError } from './internal-base';
import { TTSWSBase, type TTSWSBaseOptions } from './ws-base';
import { NodeWebSocket } from '../../internal/ws-adapter-node';
import { BrowserWebSocket } from '../../internal/ws-adapter-browser';
import type { WebSocketLike } from '../../internal/ws-adapter';
import { decodeBase64 } from '../../lib/ws';
import * as TTSAPI from './tts';
import type { Cartesia } from '../../client';

export type { TTSWSReconnectOptions } from './ws-base';

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

export interface TTSWSClientOptions extends WS.ClientOptions, TTSWSBaseOptions {}

export class TTSWS extends TTSWSBase {
  private _wsOptions: WS.ClientOptions | null | undefined;
  private _contextQueues: Map<string, ContextQueueEntry> = new Map();
  private _ready: Promise<void>;

  constructor(
    client: Cartesia,
    parameters?: Record<string, unknown> | undefined,
    options?: TTSWSClientOptions | null | undefined,
  ) {
    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    super(client, parameters, { reconnect, maxQueueSize });
    this._parameters = parameters;
    this._wsOptions = wsOptions;

    if (!_ws?.WebSocket && typeof WebSocket === 'undefined') {
      throw new Error(
        'TTSWS from "@cartesia/cartesia-js/resources/tts/ws" requires the "ws" package but it could not be loaded.',
      );
    }

    this._connectInitial();

    // Decode audio for chunk events (mirrors Python SDK's .audio property)
    // and route events to per-context queues. Registered on the emitter's
    // 'event' channel, which fires synchronously before typed events like
    // 'chunk', so consumers see the decoded payload.
    this.on('event', (event) => {
      if (event.type === 'chunk') {
        const chunk = event;
        chunk.audio = chunk.data ? decodeBase64(chunk.data) : null;
      }
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

    // Server-side context state is lost across a reconnect — wake any waiting
    // receive() calls so their generators can exit cleanly.
    this.on('reconnecting', () => {
      for (const entry of this._contextQueues.values()) {
        if (entry.resolve) {
          entry.resolve();
          entry.resolve = null;
        }
      }
      this._contextQueues.clear();
    });

    this._ready = this._awaitInitialOpen();
    // Avoid an unhandled-rejection crash when nobody awaits connect().
    this._ready.catch(() => {});
  }

  protected _createSocket(url: URL, authHeaders: Record<string, string>): WebSocketLike {
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
   * Resolves once the initial socket is open, rejects if it errors or closes first.
   */
  private _awaitInitialOpen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = this.socket!;
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
      socket.on('open', onOpen);
      socket.on('error', onError);
      socket.on('close', onFail);
    });
  }
}
