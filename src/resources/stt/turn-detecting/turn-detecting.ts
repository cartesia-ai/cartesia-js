// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as STTAPI from '../stt';
import { TurnDetectingWS, type TurnDetectingWSClientOptions, type TurnDetectingWSParameters } from './ws';

export class TurnDetecting extends APIResource {
  /**
   * Realtime Speech-to-Text with user turn detection.
   *
   * This is the recommended STT method for building voice agents.
   *
   * The API is organized around **user turns** (human user starts talking, stops talking), not transcript segments. The model itself signals when a user turn begins and ends, so your agent reacts to events rather than running its own voice activity detection.
   *
   * Supports:
   *   - Streaming transcription
   *   - Native turn detection (`turn.start`, `turn.update`, `turn.end`)
   *   - Eager end-of-turn prediction (`turn.eager_end`, `turn.resume`)
   *   - Long-lived connections that reuse a live network connection for low latency
   *
   *
   * **All emitted text is final** — the model does not revise previous output. The `transcript` field is cumulative within a turn.
   *
   * See [the API docs](https://docs.cartesia.ai/api-reference/stt/turns/websocket) for all details.
   *
   * See [Turns](https://docs.cartesia.ai/use-the-api/stt/turns/turns) for details on handling turn events.
   */
  websocket(
    parameters: TurnDetectingWSParameters,
    options?: TurnDetectingWSClientOptions | null | undefined,
  ): TurnDetectingWS {
    return new TurnDetectingWS(this._client, parameters, options);
  }
}

/**
 * Models that support realtime speech-to-text with turn-detection. This mode
 * detects when the user is speaking and emits turn events. See
 * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
 * all options.
 */
export type STTRealtimeTurnDetectingModel = 'ink-2' | (string & {});

/**
 * Sent as a JSON-encoded WebSocket text frame to close the session cleanly. All
 * buffered audio will be processed by the model into events before the connection
 * closes.
 */
export interface STTTurnsCloseCommand {
  /**
   * Command type. Send this as a JSON-encoded WebSocket text frame to close the
   * session.
   */
  type: 'close';
}

/**
 * Fires once when the WebSocket connection is established. You do not need to wait
 * for this event before sending audio.
 */
export interface STTTurnsConnected {
  /**
   * Unique identifier for this connection.
   */
  request_id: string;

  /**
   * Event type identifier.
   */
  type: 'connected';
}

/**
 * [PREVIEW] Fires when the model predicts that the user might be done speaking.
 */
export interface STTTurnsTurnEagerEnd {
  /**
   * Unique identifier for this connection. Does not change between turns.
   */
  request_id: string;

  /**
   * Cumulative text for the current turn.
   */
  transcript: string;

  /**
   * Event type identifier.
   */
  type: 'turn.eager_end';
}

/**
 * Marks the end of a user turn.
 */
export interface STTTurnsTurnEnd {
  /**
   * Unique identifier for this connection. Does not change between turns.
   */
  request_id: string;

  /**
   * Definitive transcript for the completed turn.
   */
  transcript: string;

  /**
   * Event type identifier.
   */
  type: 'turn.end';
}

/**
 * [PREVIEW] Fires after `turn.eager_end` if the user turn has not actually ended.
 */
export interface STTTurnsTurnResume {
  /**
   * Unique identifier for this connection. Does not change between turns.
   */
  request_id: string;

  /**
   * Event type identifier.
   */
  type: 'turn.resume';
}

/**
 * Marks the start of a user turn. Fires quickly after the user begins speaking.
 * This event can be used to interrupt your agent to avoid talking over the user.
 */
export interface STTTurnsTurnStart {
  /**
   * Unique identifier for this connection. Does not change between turns.
   */
  request_id: string;

  /**
   * Event type identifier.
   */
  type: 'turn.start';
}

/**
 * Fires repeatedly as the model transcribes the current user turn.
 */
export interface STTTurnsTurnUpdate {
  /**
   * Unique identifier for this connection. Does not change between turns.
   */
  request_id: string;

  /**
   * Cumulative text for the current turn, i.e. the full text transcribed so far in
   * this turn, not a delta.
   */
  transcript: string;

  /**
   * Event type identifier.
   */
  type: 'turn.update';
}

export interface STTTurnsWebsocketQueryParams {
  /**
   * The encoding format for audio data sent to the STT WebSocket.
   */
  encoding: STTAPI.STTEncoding;

  /**
   * Models that support realtime speech-to-text with turn-detection. This mode
   * detects when the user is speaking and emits turn events. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * all options.
   */
  model: STTRealtimeTurnDetectingModel;

  /**
   * Sample rate in Hz.
   */
  sample_rate: number;
}

/**
 * Sent as a JSON-encoded WebSocket text frame to close the session cleanly. All
 * buffered audio will be processed by the model into events before the connection
 * closes.
 */
export interface STTTurnsWebsocketRequest {
  /**
   * Command type. Send this as a JSON-encoded WebSocket text frame to close the
   * session.
   */
  type: 'close';
}

/**
 * Events emitted by the server. Each event has a `type` field that discriminates
 * between message variants. All emitted text is final — the model does not revise
 * previous output. The `transcript` field is cumulative within a turn.
 */
export type STTTurnsWebsocketResponse =
  | STTTurnsConnected
  | STTTurnsTurnStart
  | STTTurnsTurnUpdate
  | STTTurnsTurnEagerEnd
  | STTTurnsTurnResume
  | STTTurnsTurnEnd
  | STTAPI.STTErrorResponse;

export interface TurnDetectingWebsocketParams {
  /**
   * The encoding format for audio data sent to the STT WebSocket.
   */
  encoding: STTAPI.STTEncoding;

  /**
   * Models that support realtime speech-to-text with turn-detection. This mode
   * detects when the user is speaking and emits turn events. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * all options.
   */
  model: STTRealtimeTurnDetectingModel;

  /**
   * Sample rate in Hz.
   */
  sample_rate: number;
}

export declare namespace TurnDetecting {
  export {
    type STTRealtimeTurnDetectingModel as STTRealtimeTurnDetectingModel,
    type STTTurnsCloseCommand as STTTurnsCloseCommand,
    type STTTurnsConnected as STTTurnsConnected,
    type STTTurnsTurnEagerEnd as STTTurnsTurnEagerEnd,
    type STTTurnsTurnEnd as STTTurnsTurnEnd,
    type STTTurnsTurnResume as STTTurnsTurnResume,
    type STTTurnsTurnStart as STTTurnsTurnStart,
    type STTTurnsTurnUpdate as STTTurnsTurnUpdate,
    type STTTurnsWebsocketQueryParams as STTTurnsWebsocketQueryParams,
    type STTTurnsWebsocketRequest as STTTurnsWebsocketRequest,
    type STTTurnsWebsocketResponse as STTTurnsWebsocketResponse,
    type TurnDetectingWebsocketParams as TurnDetectingWebsocketParams,
  };
}
