// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as STTAPI from '../stt';
import * as TurnDetectingAPI from './turn-detecting';
import { Cartesia } from '../../../client';
import { EventEmitter } from '../../../core/EventEmitter';
import { CartesiaError } from '../../../core/error';

import type { RawWebSocketData, ReconnectingEvent, UnsentMessage } from '../../../internal/ws';
import { TurnDetectingWSParameters } from './ws-base';

export type TurnDetectingStreamMessage =
  | { type: 'connecting' | 'open' | 'closing' }
  | {
      type: 'close';
      code: number;
      reason: string;
      unsent: UnsentMessage<TurnDetectingAPI.STTTurnsWebsocketRequest>[];
    }
  | { type: 'reconnecting'; reconnect: ReconnectingEvent<TurnDetectingWSParameters> }
  | { type: 'reconnected' }
  | { type: 'message'; message: TurnDetectingAPI.STTTurnsWebsocketResponse }
  | { type: 'raw'; data: RawWebSocketData }
  | { type: 'error'; error: WebSocketError };

export class WebSocketError extends CartesiaError {
  /**
   * The error data that the API sent back in an error event.
   */
  error?: STTAPI.STTErrorResponse | undefined;

  constructor(message: string, event: STTAPI.STTErrorResponse | null) {
    super(message);

    this.error = event ?? undefined;
  }
}

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type WebSocketEvents = Simplify<
  {
    event: (event: TurnDetectingAPI.STTTurnsWebsocketResponse) => void;
    raw: (data: RawWebSocketData) => void;
    error: (error: WebSocketError) => void;
    close: (
      code: number,
      reason: string,
      unsent: UnsentMessage<TurnDetectingAPI.STTTurnsWebsocketRequest>[],
    ) => void;
    reconnecting: (event: ReconnectingEvent<TurnDetectingWSParameters>) => void;
    reconnected: () => void;
  } & {
    [EventType in Exclude<NonNullable<TurnDetectingAPI.STTTurnsWebsocketResponse['type']>, 'error'>]: (
      event: Extract<TurnDetectingAPI.STTTurnsWebsocketResponse, { type?: EventType }>,
    ) => unknown;
  }
>;

export abstract class TurnDetectingEmitter extends EventEmitter<WebSocketEvents> {
  /**
   * Send an event to the API.
   */
  abstract send(event: TurnDetectingAPI.STTTurnsWebsocketRequest): void;

  /**
   * Send raw data over the WebSocket without JSON serialization.
   */
  abstract sendRaw(data: RawWebSocketData): void;

  /**
   * Close the WebSocket connection.
   */
  abstract close(props?: { code: number; reason: string }): void;

  protected _onError(event: null, message: string, cause: any): void;
  protected _onError(event: STTAPI.STTErrorResponse, message?: string | undefined): void;
  protected _onError(event: STTAPI.STTErrorResponse | null, message?: string | undefined, cause?: any): void {
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

export function buildURL(client: Cartesia, parameters: Record<string, unknown>): URL {
  const { ...query } = parameters;
  const endpoint = '/stt/turns/websocket';
  const url = new URL(client.buildURL(endpoint, query, undefined));
  url.protocol = url.protocol === 'http:' || url.protocol === 'ws:' ? 'ws:' : 'wss:';
  return url;
}

function safeJSONStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
