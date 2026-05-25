// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as Shared from '../../shared';
import * as STTAPI from '../stt';
import { ExternalVADWS, type ExternalVADWSParameters, type ExternalVADWSClientOptions } from './ws';

export class ExternalVAD extends APIResource {
  /**
   * Realtime speech-to-text without turn detection.
   *
   * A bidirectional WebSocket connection for real-time speech transcription that works with external voice activity detection (VAD). It is the recommended endpoint for "push-to-talk" apps.
   *
   * This API relies on the `finalize` command to trigger transcription. If you do not know when the user starts and stops speaking, consider using the turn detecting method instead.
   *
   * Basic usage:
   * 1. Connect to the WebSocket with appropriate query parameters
   * 2. Send audio in small chunks (e.g. 100ms) as WebSocket binary messages
   * 3. Send `finalize` as a WebSocket text message when the user is done speaking
   * 4. Receive transcripts as JSON encoded WebSocket text messages (each message is a delta and is not cumulative)
   * 5. Repeat 2-4
   * 6. Send `close` as a WebSocket text message to finalize any buffered audio and close the session cleanly
   *
   * See [the API docs](https://docs.cartesia.ai/api-reference/stt/stt) for all details.
   */
  websocket(
    parameters: ExternalVADWSParameters,
    options?: ExternalVADWSClientOptions | null | undefined,
  ): ExternalVADWS {
    return new ExternalVADWS(this._client, parameters, options);
  }
}

/**
 * Acknowledgment for the `close` command, sent after all buffered audio has been
 * processed and before the connection closes.
 */
export interface STTExternalVADDoneResponse {
  /**
   * Unique identifier for this WebSocket connection.
   */
  request_id: string;

  /**
   * Event type identifier.
   */
  type: 'done';
}

/**
 * Acknowledgment that buffered audio has been processed in response to a
 * `finalize` command.
 */
export interface STTExternalVADFlushDoneResponse {
  /**
   * Unique identifier for this WebSocket connection.
   */
  request_id: string;

  /**
   * Event type identifier.
   */
  type: 'flush_done';
}

export interface STTExternalVADQueryParams {
  /**
   * The encoding format for audio data sent to the STT WebSocket.
   */
  encoding: STTAPI.STTEncoding;

  /**
   * Models that support realtime speech-to-text with external VAD (voice activity
   * detection). This mode expects you to send the `finalize` command to trigger
   * transcription. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * all options.
   */
  model: STTRealtimeExternalVADModel;

  /**
   * Sample rate in Hz.
   */
  sample_rate: number;

  /**
   * The language of the input audio in ISO-639-1 format. Defaults to `en`. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * current language support.
   */
  language?: 'en';

  /**
   * Used by `ink-whisper` models only. Maximum duration of silence (in seconds)
   * before the API automatically finalizes the transcript. Lower values finalize
   * more aggressively; higher values allow longer pauses within utterances.
   */
  max_silence_duration_secs?: number;

  /**
   * Used by `ink-whisper` models only. Controls what is considered silence for
   * automatic transcript finalization. Lower values pick up quiet audio; higher
   * values filter noisy audio more aggressively.
   */
  min_volume?: number;
}

/**
 * A transcript chunk.
 */
export interface STTExternalVADTranscriptResponse {
  /**
   * Whether `text` is finalized.
   */
  is_final: boolean;

  /**
   * Unique identifier for this WebSocket connection.
   */
  request_id: string;

  /**
   * Transcribed text. This is a delta from the last transcript chunk with
   * `"is_final": true`. To assemble the full transcript, concatenate all transcript
   * chunks where `"is_final": true`. Do not strip whitespace from `text` or add
   * whitespace between chunks as this will produce an incorrect transcript.
   */
  text: string;

  /**
   * Event type identifier.
   */
  type: 'transcript';

  /**
   * Duration of the audio that produced this chunk, in seconds.
   */
  duration?: number;

  /**
   * Detected language of the audio in ISO-639-1 format.
   */
  language?: string;

  /**
   * Word-level timing information for the transcript.
   */
  words?: Array<Shared.WordTimestamps>;
}

/**
 * Text commands sent to the server:
 *
 * - Send `finalize` as a text message when the user is done speaking to receive
 *   the transcript for any buffered audio
 * - Send `close` as a text message to flush remaining audio, close session, and
 *   receive a done acknowledgment
 *
 * Audio data is sent as raw binary messages.
 */
export type STTExternalVADWebsocketRequest = 'finalize' | 'close';

/**
 * Events emitted by the server. Each event has a `type` field that discriminates
 * between message variants.
 */
export type STTExternalVADWebsocketResponse =
  | STTExternalVADTranscriptResponse
  | STTExternalVADFlushDoneResponse
  | STTExternalVADDoneResponse
  | STTAPI.STTErrorResponse;

/**
 * Models that support realtime speech-to-text with external VAD (voice activity
 * detection). This mode expects you to send the `finalize` command to trigger
 * transcription. See
 * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
 * all options.
 */
export type STTRealtimeExternalVADModel = 'ink-2' | 'ink-whisper' | 'ink-whisper-2025-06-04';

export interface ExternalVADWebsocketParams {
  /**
   * The encoding format for audio data sent to the STT WebSocket.
   */
  encoding: STTAPI.STTEncoding;

  /**
   * Models that support realtime speech-to-text with external VAD (voice activity
   * detection). This mode expects you to send the `finalize` command to trigger
   * transcription. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * all options.
   */
  model: STTRealtimeExternalVADModel;

  /**
   * Sample rate in Hz.
   */
  sample_rate: number;

  /**
   * The language of the input audio in ISO-639-1 format. Defaults to `en`. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * current language support.
   */
  language?: 'en';

  /**
   * Used by `ink-whisper` models only. Maximum duration of silence (in seconds)
   * before the API automatically finalizes the transcript. Lower values finalize
   * more aggressively; higher values allow longer pauses within utterances.
   */
  max_silence_duration_secs?: number;

  /**
   * Used by `ink-whisper` models only. Controls what is considered silence for
   * automatic transcript finalization. Lower values pick up quiet audio; higher
   * values filter noisy audio more aggressively.
   */
  min_volume?: number;
}

export declare namespace ExternalVAD {
  export {
    type STTExternalVADDoneResponse as STTExternalVADDoneResponse,
    type STTExternalVADFlushDoneResponse as STTExternalVADFlushDoneResponse,
    type STTExternalVADQueryParams as STTExternalVADQueryParams,
    type STTExternalVADTranscriptResponse as STTExternalVADTranscriptResponse,
    type STTExternalVADWebsocketRequest as STTExternalVADWebsocketRequest,
    type STTExternalVADWebsocketResponse as STTExternalVADWebsocketResponse,
    type STTRealtimeExternalVADModel as STTRealtimeExternalVADModel,
    type ExternalVADWebsocketParams as ExternalVADWebsocketParams,
  };
}
