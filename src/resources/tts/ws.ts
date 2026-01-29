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
export interface ContextOptions {
  model_id: string;
  voice: TTSAPI.VoiceSpecifier;
  output_format: TTSAPI.GenerationRequest['output_format'];
  contextId?: string;
}

/**
 * A context helper for managing WebSocket conversations with automatic context_id handling.
 */
export class TTSWSContext {
  private _ws: TTSWS;
  private _options: Omit<ContextOptions, 'contextId'>;
  readonly contextId: string;

  constructor(ws: TTSWS, options: ContextOptions) {
    this._ws = ws;
    this._options = {
      model_id: options.model_id,
      voice: options.voice,
      output_format: options.output_format,
    };
    this.contextId = options.contextId ?? humanId({ separator: '-', capitalize: false });
  }

  /**
   * Send a transcript chunk with continue: true.
   * Call this multiple times to stream transcript chunks, then call done() to finish.
   */
  async push(options: { transcript: string }) {
    this._ws.send({
      model_id: this._options.model_id,
      voice: this._options.voice,
      output_format: this._options.output_format,
      transcript: options.transcript,
      context_id: this.contextId,
      continue: true,
    });
  }

  /**
   * Signal that no more transcript chunks will be sent.
   * Sends an empty transcript with continue: false.
   */
  async done() {
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
  send(request: ContextGenerateRequest) {
    this._ws.send({
      ...request,
      context_id: this.contextId,
    });
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
        'cartesia-version': '2025-04-16',
        ...this.authHeaders(),
        ...options?.headers,
      },
    });

    this._ready = new Promise((resolve, reject) => {
      this.socket.once('open', () => resolve());
      this.socket.once('error', (err) => reject(err));
    });

    this.socket.on('message', (wsEvent) => {
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

    this.socket.on('error', (err) => {
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
