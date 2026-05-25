// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as STTAPI from '../stt';
import * as ExternalVADAPI from './external-vad';
import { Cartesia } from '../../../client';
import { EventEmitter } from '../../../core/EventEmitter';
import { CartesiaError } from '../../../core/error';

import type { RawWebSocketData, ReconnectingEvent, UnsentMessage } from '../../../internal/ws';
import { ExternalVADWSParameters } from './ws-base';

export type ExternalVADStreamMessage =
  | { type: 'connecting' | 'open' | 'closing' }
  | {
      type: 'close';
      code: number;
      reason: string;
      unsent: UnsentMessage<ExternalVADAPI.STTExternalVADWebsocketRequest>[];
    }
  | { type: 'reconnecting'; reconnect: ReconnectingEvent<ExternalVADWSParameters> }
  | { type: 'reconnected' }
  | { type: 'message'; message: ExternalVADAPI.STTExternalVADWebsocketResponse }
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
    event: (event: ExternalVADAPI.STTExternalVADWebsocketResponse) => void;
    raw: (data: RawWebSocketData) => void;
    error: (error: WebSocketError) => void;
    close: (
      code: number,
      reason: string,
      unsent: UnsentMessage<ExternalVADAPI.STTExternalVADWebsocketRequest>[],
    ) => void;
    reconnecting: (event: ReconnectingEvent<ExternalVADWSParameters>) => void;
    reconnected: () => void;
  } & {
    [EventType in Exclude<NonNullable<ExternalVADAPI.STTExternalVADWebsocketResponse['type']>, 'error'>]: (
      event: Extract<ExternalVADAPI.STTExternalVADWebsocketResponse, { type?: EventType }>,
    ) => unknown;
  }
>;

export abstract class ExternalVADEmitter extends EventEmitter<WebSocketEvents> {
  /**
   * Send an event to the API.
   */
  abstract send(event: ExternalVADAPI.STTExternalVADWebsocketRequest): void;

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
  const endpoint = '/stt/websocket';
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
