// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as Shared from '../../shared';
import * as STTAPI from '../stt';

export class ManualFinalize extends APIResource {}

/**
 * Acknowledgment for the `close` command, sent after all buffered audio has been
 * processed and before the connection closes.
 */
export interface STTManualFinalizeDoneResponse {
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
export interface STTManualFinalizeFlushDoneResponse {
  /**
   * Unique identifier for this WebSocket connection.
   */
  request_id: string;

  /**
   * Event type identifier.
   */
  type: 'flush_done';
}

/**
 * Models that support realtime speech-to-text (manual finalize). This mode expects
 * you to send the `finalize` command to trigger transcription. See
 * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
 * all options.
 */
export type STTManualFinalizeModel = 'ink-2' | 'ink-whisper' | 'ink-whisper-2025-06-04';

/**
 * A transcript chunk.
 */
export interface STTManualFinalizeTranscriptResponse {
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
export type STTManualFinalizeWebsocketRequest = 'finalize' | 'close';

/**
 * Events emitted by the server. Each event has a `type` field that discriminates
 * between message variants.
 */
export type STTManualFinalizeWebsocketResponse =
  | STTManualFinalizeTranscriptResponse
  | STTManualFinalizeFlushDoneResponse
  | STTManualFinalizeDoneResponse
  | STTAPI.STTErrorResponse;

export interface ManualFinalizeWebsocketParams {
  /**
   * The encoding format for audio data sent to the STT WebSocket.
   */
  encoding: STTAPI.STTEncoding;

  /**
   * Models that support realtime speech-to-text (manual finalize). This mode expects
   * you to send the `finalize` command to trigger transcription. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/stt-models/latest) for
   * all options.
   */
  model: STTManualFinalizeModel;

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

export declare namespace ManualFinalize {
  export {
    type STTManualFinalizeDoneResponse as STTManualFinalizeDoneResponse,
    type STTManualFinalizeFlushDoneResponse as STTManualFinalizeFlushDoneResponse,
    type STTManualFinalizeModel as STTManualFinalizeModel,
    type STTManualFinalizeTranscriptResponse as STTManualFinalizeTranscriptResponse,
    type STTManualFinalizeWebsocketRequest as STTManualFinalizeWebsocketRequest,
    type STTManualFinalizeWebsocketResponse as STTManualFinalizeWebsocketResponse,
    type ManualFinalizeWebsocketParams as ManualFinalizeWebsocketParams,
  };
}
