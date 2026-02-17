// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as TTSAPI from './tts';
import { Cartesia } from '../../client';

import { EventEmitter } from '../../core/EventEmitter';
import { CartesiaError } from '../../core/error';

export class WebSocketError extends CartesiaError {
  /**
   * The error data that the API sent back in an error event.
   */
  error?: TTSAPI.WebsocketResponse.Error | undefined;

  constructor(message: string, event: TTSAPI.WebsocketResponse.Error | null) {
    // Try to extract a useful message from the event
    if (event) {
      let extraInfo = '';
      const rawEvent = event as any;
      if (typeof rawEvent.error === 'string') {
        extraInfo = rawEvent.error;
      } else if (rawEvent.error && typeof rawEvent.error === 'object') {
        extraInfo = JSON.stringify(rawEvent.error);
      } else if ('message' in rawEvent && typeof rawEvent.message === 'string') {
        extraInfo = rawEvent.message;
      }

      if (extraInfo) {
        message = `${extraInfo} | ${message}`;
      }
    }

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

export function buildURL(client: Cartesia): URL {
  const path = '/tts/websocket';
  const baseURL = client.baseURL;
  const url = new URL(baseURL + (baseURL.endsWith('/') ? path.slice(1) : path));
  url.protocol = 'wss';
  return url;
}

function safeJSONStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
