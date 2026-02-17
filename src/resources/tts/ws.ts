// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as WS from 'ws';
import { humanId } from 'human-id';
import { TTSEmitter, buildURL } from './internal-base';
import * as TTSAPI from './tts';
import type { Cartesia } from '../../client';

/**
 * Request parameters for context.generate(), same as GenerationRequest but without context_id.
 */
export type ContextGenerateRequest = Omit<TTSAPI.GenerationRequest, 'context_id'>;

/**
 * Options for creating a context, including the model, voice, and output format.
 */
import { WebSocketError } from './internal-base';

/**
 * Options for creating a context, including the model, voice, and output format.
 */
export interface ContextOptions {
  model_id: string;
  voice: TTSAPI.VoiceSpecifier;
  output_format: TTSAPI.GenerationRequest['output_format'];
  contextId?: string;
  /**
   * Whether to enable input buffering for LLM streaming resilience.
   * If true, short/empty inputs will be buffered until a speakable character is received.
   */
  bufferInputs?: boolean;
  /**
   * Whether to close the underlying WebSocket connection when the context ends.
   * This is useful for single-use contexts like those created by `client.tts.stream()`.
   */
  disconnectOnClose?: boolean;
}


/**
 * A context helper for managing WebSocket conversations with automatic context_id handling.
 */
export class TTSWSContext {
  private _ws: TTSWS;
  private _options: Omit<ContextOptions, 'contextId'>;
  readonly contextId: string;
  private _buffer: string = '';
  private _isBufferingEnabled: boolean;
  private _disconnectOnClose: boolean;
  /**
   * Maximum number of characters to buffer before forcing a flush.
   * This prevents memory issues if the input is an endless stream of non-speakable characters.
   */
  private static MAX_BUFFER_CHARS = 256;
  private _listeners = new Map<string, Map<Function, Function>>();

  constructor(ws: TTSWS, options: ContextOptions) {
    this._ws = ws;
    this._options = {
      model_id: options.model_id,
      voice: options.voice,
      output_format: options.output_format,
    };
    this.contextId = options.contextId ?? humanId({ separator: '-', capitalize: false });
    this._isBufferingEnabled = options.bufferInputs ?? false;
    this._disconnectOnClose = options.disconnectOnClose ?? false;
  }

  /**
   * Send a transcript chunk with continue: true.
   * Call this multiple times to stream transcript chunks, then call done() to finish.
   */
  async push(options: { transcript: string }) {
    let transcript = options.transcript;

    if (this._isBufferingEnabled) {
      if (!this._isSpeakable(transcript)) {
        this._buffer += transcript;
        if (this._buffer.length > TTSWSContext.MAX_BUFFER_CHARS) {
          // Buffer is full of non-speakable characters. Drop it to avoid sending invalid audio requests.
          this._buffer = '';
          return;
        } else {
          return;
        }
      } else {
        transcript = this._buffer + transcript;
        this._buffer = '';
      }
    }

    this._ws.send({
      model_id: this._options.model_id,
      voice: this._options.voice,
      output_format: this._options.output_format,
      transcript: transcript,
      context_id: this.contextId,
      continue: true,
    });
  }

  /**
   * Check if the text contains at least one letter or number.
   */
  private _isSpeakable(text: string): boolean {
    return /[\p{L}\p{N}]/u.test(text);
  }

  /**
   * Signal that no more transcript chunks will be sent.
   * Sends an empty transcript with continue: false.
   */
  async done() {
    // Flush any remaining buffer if it's speakable
    if (this._buffer && this._isSpeakable(this._buffer)) {
      this._ws.send({
        model_id: this._options.model_id,
        voice: this._options.voice,
        output_format: this._options.output_format,
        transcript: this._buffer,
        context_id: this.contextId,
        continue: true,
      });
    }
    this._buffer = '';

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
   * Stop the stream and close the context.
   * This handles flushing any pending buffer and sending the final message.
   */
  async end() {
    await this.done();
    // Cleanup listeners
    for (const [event, eventMap] of this._listeners) {
      for (const [, wrapped] of eventMap) {
        this._ws.off(event as any, wrapped);
      }
    }
    this._listeners.clear();

    if (this._disconnectOnClose) {
      this._ws.close();
    }
  }

  /**
   * Send a generation request without waiting for responses.
   * Use this for streaming multiple transcript chunks.
   * The context_id is automatically set.
   */
  send(request: ContextGenerateRequest) {
    this._ws.send({
      ...request,
      model_id: request.model_id ?? this._options.model_id,
      voice: request.voice ?? this._options.voice,
      output_format: request.output_format ?? this._options.output_format,
      context_id: this.contextId,
    });
  }

  /**
   * Add a listener for a specific event type, filtered by this context's ID.
   */
  on(event: string, listener: (...args: any[]) => void): this {
    const wrapped = (...args: any[]) => {
      const e = args[0];
      // Check context_id if it exists on the event object
      if (e && typeof e === 'object' && 'context_id' in e && e.context_id !== this.contextId) {
        return;
      }
      // Check for nested context_id in WebSocketError
      if (e instanceof WebSocketError) {
        const errorEvent = e.error;
        if (errorEvent && 'context_id' in errorEvent && errorEvent.context_id !== this.contextId) {
          return;
        }
      }
      listener(...args);
    };

    let eventMap = this._listeners.get(event);
    if (!eventMap) {
      eventMap = new Map();
      this._listeners.set(event, eventMap);
    }
    eventMap.set(listener, wrapped);

    this._ws.on(event as any, wrapped);
    return this;
  }

  /**
   * Add a one-time listener for a specific event type, filtered by this context's ID.
   */
  once(event: string, listener: (...args: any[]) => void): this {
    const wrapped = (...args: any[]) => {
      const e = args[0];
      if (e && typeof e === 'object' && 'context_id' in e && e.context_id !== this.contextId) {
        return;
      }
      // Check for nested context_id in WebSocketError
      if (e instanceof WebSocketError) {
        const errorEvent = e.error;
        if (errorEvent && 'context_id' in errorEvent && errorEvent.context_id !== this.contextId) {
          return;
        }
      }
      this.off(event, listener);
      listener(...args);
    };

    let eventMap = this._listeners.get(event);
    if (!eventMap) {
      eventMap = new Map();
      this._listeners.set(event, eventMap);
    }
    eventMap.set(listener, wrapped);

    this._ws.on(event as any, wrapped);
    return this;
  }

  /**
   * Remove a listener.
   */
  off(event: string, listener: (...args: any[]) => void): this {
    const eventMap = this._listeners.get(event);
    if (eventMap) {
      const wrapped = eventMap.get(listener);
      if (wrapped) {
        this._ws.off(event as any, wrapped);
        eventMap.delete(listener);
        if (eventMap.size === 0) {
          this._listeners.delete(event);
        }
      }
    }
    return this;
  }

  /**
   * Iterate over responses for this context.
   * Completes when a "done" event is received.
   */
  async *receive(): AsyncGenerator<TTSAPI.WebsocketResponse> {
    const queue: TTSAPI.WebsocketResponse[] = [];
    let done = false;
    let error: Error | null = null;
    let resolve: (() => void) | null = null;

    const onEvent = (event: TTSAPI.WebsocketResponse) => {
      // Filter by context_id
      if ('context_id' in event && event.context_id !== this.contextId) {
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

    this._ws.on('event', onEvent);

    try {
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
      this._ws.off('event', onEvent);
    }
  }

  /**
   * Send a generation request and iterate over the responses.
   * The context_id is automatically set.
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
  cancel() {
    this._ws.cancelContext(this.contextId);
  }
}

export class TTSWS extends TTSEmitter {
  url: URL;
  socket: WS.WebSocket;
  private client: Cartesia;
  private _ready: Promise<void>;

  constructor(client: Cartesia, options?: WS.ClientOptions | undefined) {
    super();
    this.client = client;
    this.url = buildURL(client);
    this.socket = new WS.WebSocket(this.url, {
      ...options,
      headers: {
        'cartesia-version': '2025-11-04',
        ...this.authHeaders(),
        ...options?.headers,
      },
    });

    this._ready = new Promise((resolve, reject) => {
      this.socket.once('open', () => resolve());
      this.socket.once('error', (err: Error) => reject(err));
    });

    this.socket.on('message', (wsEvent: any) => {
      const event = (() => {
        try {
          return JSON.parse(wsEvent.toString()) as TTSAPI.WebsocketResponse;
        } catch (err) {
          this._onError(null, 'could not parse websocket event', err);
          return null;
        }
      })();

      if (event) {
        // Normalize audio data: if 'data' is present but 'audio' is missing, copy 'data' to 'audio'.
        // This handles cases where certain encodings return audio in 'data' field.
        if (
          event.type === 'chunk' &&
          'data' in event &&
          !('audio' in event) &&
          typeof (event as any).data === 'string'
        ) {
          (event as any).audio = (event as any).data;
        }

        this._emit('event', event);

        if (event.type === 'error') {
          this._onError(event);
        } else {
          // @ts-ignore TS isn't smart enough to get the relationship right here
          this._emit(event.type, event);
        }
      }
    });

    this.socket.on('error', (err: Error) => {
      this._onError(null, err.message, err);
    });
  }

  send(event: TTSAPI.WebsocketClientEvent) {
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
    const contextId = request.context_id;
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
  cancelContext(contextId: string) {
    this.send({ cancel: true, context_id: contextId });
  }

  /**
   * Create a new context with the given options.
   */
  context(options: ContextOptions): TTSWSContext {
    return new TTSWSContext(this, options);
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
