// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as Shared from '../../shared';
import * as STTAPI from '../stt';
import { ManualFinalizeWS, type ManualFinalizeWSParameters, type ManualFinalizeWSClientOptions } from './ws';

export class ManualFinalize extends APIResource {
  /**
   * Realtime speech-to-text without turn detection.
   *
   * This is the recommended endpoint for "push-to-talk" apps.
   *
   * This API relies on the `finalize` command to trigger transcription. If you do not know when the user starts and stops speaking, consider using `auto finalize` instead.
   *
   * Basic usage:
   *   1. Connect to the WebSocket: `const ws = cartesia.stt.manualFinalize.websocket({ model, encoding, sample_rate })`
   *   2. Send audio in small chunks (e.g. 100ms) using `ws.sendRaw()`
   *   3. When the user is done speaking: `ws.send("finalize")`
   *   4. Receive transcripts (each message is a delta and is not cumulative)
   *   5. Repeat 2-4
   *   6. Finalize any buffered audio and close the session cleanly: `ws.send("close")`
   *   7. Receive the remaining transcript chunks
   *
   * See [the API docs](https://docs.cartesia.ai/api-reference/stt/stt) for all details.
   *
   * See [examples](https://github.com/cartesia-ai/cartesia-js/tree/main/examples) for an implementation references.
   */
  websocket(
    parameters: ManualFinalizeWSParameters,
    options?: ManualFinalizeWSClientOptions | null | undefined,
  ): ManualFinalizeWS {
    return new ManualFinalizeWS(this._client, parameters, options);
  }
}

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
export type STTManualFinalizeModel = 'ink-2' | 'ink-whisper' | 'ink-whisper-2025-06-04' | (string & {});

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
   * Key terms to improve the recall of specific words and phrases.
   *
   * Pass multiple values to boost multiple terms, up to 100 keyterms totaling 1200
   * characters. To boost one multi-word phrase, join the words with a space.
   *
   * See [Keyterm prompting](https://docs.cartesia.ai/use-the-api/stt/keyterms) for
   * details.
   */
  keyterms?: Array<string>;

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
