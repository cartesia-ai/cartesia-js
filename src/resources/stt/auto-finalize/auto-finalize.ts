// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as STTAPI from '../stt';
import { AutoFinalizeWS, type AutoFinalizeWSClientOptions, type AutoFinalizeWSParameters } from './ws';

export class AutoFinalize extends APIResource {
  /**
   * Realtime Speech-to-Text with user turn detection.
   *
   * This is the recommended STT method for building voice agents.
   *
   * Usage:
   *   - Send audio in chunks (e.g. 100 ms) using `ws.sendRaw()`
   *   - Send JSON commands using `ws.send()`
   *   - See [examples](https://github.com/cartesia-ai/cartesia-js/tree/main/examples) for reference
   *
   * Supports:
   *   - Streaming transcription
   *   - Native turn detection (`turn.start`, `turn.update`, `turn.end`)
   *   - Eager end-of-turn prediction (`turn.eager_end`, `turn.resume`)
   *   - Long-lived connections that reuse a live network connection for low latency
   *
   * See also:
   *   - [API Reference](https://docs.cartesia.ai/api-reference/stt/turns/websocket)
   *   - [Turn Events](https://docs.cartesia.ai/use-the-api/stt/turns/turns)
   *   - [Common Pitfalls](https://docs.cartesia.ai/use-the-api/stt/common-pitfalls)
   *   - [Concurrency Limits and Timeouts](https://docs.cartesia.ai/use-the-api/concurrency-limits-and-timeouts)
   */
  websocket(
    parameters: AutoFinalizeWSParameters,
    options?: AutoFinalizeWSClientOptions | null | undefined,
  ): AutoFinalizeWS {
    return new AutoFinalizeWS(this._client, parameters, options);
  }
}

/**
 * Fires once when the WebSocket connection is established. You do not need to wait
 * for this event before sending audio.
 */
export interface STTAutoFinalizeConnected {
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
 * Models that support realtime speech-to-text (auto finalize). This mode detects
 * when the user is speaking and emits turn events. See
 * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
 * all options.
 */
export type STTAutoFinalizeModel = 'ink-2' | (string & {});

/**
 * [PREVIEW] Fires when the model predicts that the user might be done speaking.
 */
export interface STTAutoFinalizeTurnEagerEnd {
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
export interface STTAutoFinalizeTurnEnd {
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
export interface STTAutoFinalizeTurnResume {
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
export interface STTAutoFinalizeTurnStart {
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
export interface STTAutoFinalizeTurnUpdate {
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

/**
 * Sent as a JSON-encoded WebSocket text frame to close the session cleanly. All
 * buffered audio will be processed by the model into events before the connection
 * closes.
 */
export interface STTAutoFinalizeWebsocketRequest {
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
export type STTAutoFinalizeWebsocketResponse =
  | STTAutoFinalizeConnected
  | STTAutoFinalizeTurnStart
  | STTAutoFinalizeTurnUpdate
  | STTAutoFinalizeTurnEagerEnd
  | STTAutoFinalizeTurnResume
  | STTAutoFinalizeTurnEnd
  | STTAPI.STTErrorResponse;

export interface AutoFinalizeWebsocketParams {
  /**
   * The encoding format for audio data sent to the STT WebSocket.
   */
  encoding: STTAPI.STTEncoding;

  /**
   * Models that support realtime speech-to-text (auto finalize). This mode detects
   * when the user is speaking and emits turn events. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * all options.
   */
  model: STTAutoFinalizeModel;

  /**
   * Sample rate in Hz.
   */
  sample_rate: number;
}

export declare namespace AutoFinalize {
  export {
    type STTAutoFinalizeConnected as STTAutoFinalizeConnected,
    type STTAutoFinalizeModel as STTAutoFinalizeModel,
    type STTAutoFinalizeTurnEagerEnd as STTAutoFinalizeTurnEagerEnd,
    type STTAutoFinalizeTurnEnd as STTAutoFinalizeTurnEnd,
    type STTAutoFinalizeTurnResume as STTAutoFinalizeTurnResume,
    type STTAutoFinalizeTurnStart as STTAutoFinalizeTurnStart,
    type STTAutoFinalizeTurnUpdate as STTAutoFinalizeTurnUpdate,
    type STTAutoFinalizeWebsocketRequest as STTAutoFinalizeWebsocketRequest,
    type STTAutoFinalizeWebsocketResponse as STTAutoFinalizeWebsocketResponse,
    type AutoFinalizeWebsocketParams as AutoFinalizeWebsocketParams,
  };
}
