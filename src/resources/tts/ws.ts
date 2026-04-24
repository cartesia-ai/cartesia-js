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
import { ReadyState } from '../../internal/ws-adapter';
import { NodeWebSocket } from '../../internal/ws-adapter-node';
import { BrowserWebSocket } from '../../internal/ws-adapter-browser';
import { createWebSocketOpenPromise, decodeBase64 } from '../../lib/ws';
import * as TTSAPI from './tts';
import type { Cartesia } from '../../client';
import { APIError, CartesiaError } from '../../core/error';

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
  isGenerateFunctionActive: boolean;
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
    this.contextId = options.contextId || uuid4();
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
        if (entry === undefined) {
          // Queue was removed (context unregistered by reconnect, cancel, or generate), stop.
          return;
        }

        const eventMessage = entry.queue.shift();
        if (eventMessage !== undefined) {
          yield eventMessage;
          if (eventMessage.type === 'done') {
            return;
          }
          if (eventMessage.type === 'error') {
            throw APIError.generate(
              eventMessage.status_code,
              eventMessage,
              undefined /* message */,
              undefined /* headers */,
            );
          }
        } else {
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
   * This function captures events for the context until it returns (do not use in parallel with TTSWSContext.receive).
   */
  async *generate(request: ContextGenerateRequest): AsyncGenerator<TTSAPI.WebsocketResponse> {
    yield* this._ws.generate({
      ...request,
      context_id: this.contextId,
    });
  }

  /**
   * Cancel this context to stop generating speech.
   */
  async cancel() {
    await this._ws.cancelContext(this.contextId);
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
      if (event.type === 'chunk') {
        const chunk = event;
        chunk.audio = chunk.data ? decodeBase64(chunk.data) : null;
      }
      const ctxId = 'context_id' in event ? event.context_id : null;
      const entry = ctxId ? this._contextQueues.get(ctxId) : undefined;
      // ignore events while generate() is consuming them
      if (entry !== undefined && !entry.isGenerateFunctionActive) {
        entry.queue.push(event);
        if (entry.resolve) {
          entry.resolve();
          entry.resolve = null;
        }
      }
    });

    const unregisterAllContexts = () => {
      for (const entry of this._contextQueues.values()) {
        if (entry.resolve) {
          entry.resolve();
          entry.resolve = null;
        }
      }
      this._contextQueues.clear();
    };

    // contexts are lost on socket close (even if we reconnect later)
    this.on('close', unregisterAllContexts);
    // contexts are lost on reconnects
    this.on('reconnecting', unregisterAllContexts);
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
   */
  override async send(event: TTSAPI.WebsocketClientEvent): Promise<void> {
    if ('cancel' in event && event.cancel) {
      this._unregisterContext(event.context_id);
      // no need to cancel if the socket closed since the context is already gone
      if (this.socket?.readyState === ReadyState.OPEN || this.socket?.readyState === ReadyState.CONNECTING) {
        super.send(event);
      }
      return;
    }
    // generation request
    await this.connect();
    // FIXME: update aysyncapi.yml to require context_id
    const eventWithDefaults = {
      ...event,
      context_id: event.context_id || uuid4(),
      ...('continue' in event && event.continue && !event.context_id ? { continue: false } : null),
    };
    this._registerContext(eventWithDefaults.context_id);
    super.send(eventWithDefaults);
  }

  /**
   * Send a generation request and iterate over the responses.
   *
   * This function captures events for the context until it returns (do not use in parallel with TTSWSContext.receive).
   */
  async *generate(request: TTSAPI.GenerationRequest): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const context_id: string = request.context_id || uuid4();
    const queue: TTSAPI.WebsocketResponse[] = [];
    let done = false;
    let resolve: (() => void) | null = null;

    const onEvent = (event: TTSAPI.WebsocketResponse) => {
      if ('context_id' in event && event.context_id !== context_id) {
        return;
      }
      queue.push(event);
      resolve?.();
    };

    const onDisconnect = () => {
      // server state is lost on reconnect, so reused context_ids point at a new server-side context
      this.off('event', onEvent);
      done = true;
      resolve?.();
    };

    const contextEntry = this._contextQueues.get(context_id);
    if (contextEntry !== undefined) {
      if (contextEntry.isGenerateFunctionActive) {
        throw new CartesiaError(
          `generate() is still running for this context (${context_id}). Use TTSWSContext.send and TTSWSContext.receive to queue multiple GenerationRequests.`,
        );
      }
      contextEntry.isGenerateFunctionActive = true;
    }
    try {
      this.once('close', onDisconnect);
      this.once('reconnecting', onDisconnect);
      this.on('event', onEvent);
      await this.send({ ...request, context_id });

      while (true) {
        const eventMessage = queue.shift();
        if (eventMessage !== undefined) {
          yield eventMessage;
          if (eventMessage.type === 'done') {
            done = true;
          } else if (eventMessage.type === 'error') {
            done = true;
            throw APIError.generate(
              eventMessage.status_code,
              eventMessage,
              undefined /* message */,
              undefined /* headers */,
            );
          }
        } else if (!done) {
          await new Promise<void>((r) => {
            resolve = r;
          });
        } else {
          return;
        }
      }
    } finally {
      this.off('event', onEvent);
      this.off('reconnecting', onDisconnect);
      this.off('close', onDisconnect);

      if (contextEntry !== undefined) {
        contextEntry.isGenerateFunctionActive = false;
        contextEntry.resolve?.();
        contextEntry.resolve = null;
      }
    }
  }

  /**
   * Cancel a context to stop generating speech for it.
   */
  async cancelContext(contextId: string): Promise<void> {
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

  /**
   * Wait for the WebSocket connection to be ready.
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

  /** Register a per-context queue. Called by context(). */
  _registerContext(contextId: string): void {
    if (!this._contextQueues.has(contextId)) {
      this._contextQueues.set(contextId, { queue: [], resolve: null, isGenerateFunctionActive: false });
    }
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
}
