// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as TTSAPI from './tts';
import { Cartesia } from '../../client';

import { EventEmitter } from '../../core/EventEmitter';
import { CartesiaError } from '../../core/error';
import { stringifyQuery } from '../../internal/utils';

export class WebSocketError extends CartesiaError {
  /**
   * The error data that the API sent back in an error event.
   */
  error?: TTSAPI.WebsocketResponse.Error | undefined;

  constructor(message: string, event: TTSAPI.WebsocketResponse.Error | null) {
    super(message);

    this.error = event ?? undefined;
  }
}

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type WebsocketEvents = Simplify<
  {
    event: (event: TTSAPI.WebsocketResponse) => void;
    error: (error: WebSocketError) => void;
  } & {
    [EventType in Exclude<NonNullable<TTSAPI.WebsocketResponse['type']>, 'error'>]: (
      event: Extract<TTSAPI.WebsocketResponse, { type?: EventType }>,
    ) => unknown;
  }
>;

export abstract class TTSEmitter extends EventEmitter<WebsocketEvents> {
  /**
   * Send an event to the API.
   */
  abstract send(event: TTSAPI.WebsocketClientEvent): void;

  /**
   * Close the websocket connection.
   */
  abstract close(props?: { code: number; reason: string }): void;

  protected _onError(event: null, message: string, cause: any): void;
  protected _onError(event: TTSAPI.WebsocketResponse.Error, message?: string | undefined): void;
  protected _onError(
    event: TTSAPI.WebsocketResponse.Error | null,
    message?: string | undefined,
    cause?: any,
  ): void {
    message = message ?? safeJSONStringify(event) ?? 'unknown error';

    if (!this._hasListener('error')) {
      const error = new WebSocketError(
        message +
          `\n\nTo resolve these unhandled rejection errors you should bind an \`error\` callback, e.g. \`ws.on('error', (error) => ...)\` `,
        event,
      );
      // @ts-ignore
      error.cause = cause;
      Promise.reject(error);
      return;
    }

    const error = new WebSocketError(message, event);
    // @ts-ignore
    error.cause = cause;

    this._emit('error', error);
  }
}

export function buildURL(client: Cartesia, query?: object | null): URL {
  const path = '/tts/websocket';
  const baseURL = client.baseURL;
  const url = new URL(baseURL + (baseURL.endsWith('/') ? path.slice(1) : path));
  if (query) {
    url.search = stringifyQuery(query);
  }
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
  return url;
}

function safeJSONStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
