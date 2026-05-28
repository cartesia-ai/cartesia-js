// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as AutoFinalizeAPI from './auto-finalize/auto-finalize';
import {
  AutoFinalize,
  AutoFinalizeWebsocketParams,
  STTAutoFinalizeConnected,
  STTAutoFinalizeModel,
  STTAutoFinalizeTurnEagerEnd,
  STTAutoFinalizeTurnEnd,
  STTAutoFinalizeTurnResume,
  STTAutoFinalizeTurnStart,
  STTAutoFinalizeTurnUpdate,
  STTAutoFinalizeWebsocketRequest,
  STTAutoFinalizeWebsocketResponse,
} from './auto-finalize/auto-finalize';
import * as ManualFinalizeAPI from './manual-finalize/manual-finalize';
import {
  ManualFinalize,
  ManualFinalizeWebsocketParams,
  STTManualFinalizeDoneResponse,
  STTManualFinalizeFlushDoneResponse,
  STTManualFinalizeModel,
  STTManualFinalizeTranscriptResponse,
  STTManualFinalizeWebsocketRequest,
  STTManualFinalizeWebsocketResponse,
} from './manual-finalize/manual-finalize';
import { APIPromise } from '../../core/api-promise';
import { type Uploadable } from '../../core/uploads';
import { RequestOptions } from '../../internal/request-options';
import { multipartFormRequestOptions } from '../../internal/uploads';

export class STT extends APIResource {
  autoFinalize: AutoFinalizeAPI.AutoFinalize = new AutoFinalizeAPI.AutoFinalize(this._client);
  manualFinalize: ManualFinalizeAPI.ManualFinalize = new ManualFinalizeAPI.ManualFinalize(this._client);

  /**
   * Transcribes audio files into text.
   *
   * **Supported audio formats:** flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav,
   * webm
   *
   * See [the API docs](https://docs.cartesia.ai/api-reference/stt/transcribe) for
   * details.
   */
  transcribe(params: STTTranscribeParams, options?: RequestOptions): APIPromise<STTTranscribeResponse> {
    const { encoding, sample_rate, ...body } = params;
    return this._client.post(
      '/stt',
      multipartFormRequestOptions({ query: { encoding, sample_rate }, body, ...options }, this._client),
    );
  }
}

/**
 * Models that support batch speech-to-text transcription. See
 * [the docs](https://docs.cartesia.ai/api-reference/stt/transcribe#body-model) for
 * all options.
 */
export type STTBatchModel = 'ink-whisper' | 'ink-whisper-2025-06-04' | (string & {});

/**
 * The encoding format for audio data sent to the STT WebSocket.
 */
export type STTEncoding = 'pcm_s16le' | 'pcm_s32le' | 'pcm_f16le' | 'pcm_f32le' | 'pcm_mulaw' | 'pcm_alaw';

/**
 * Error information for STT WebSocket connections.
 */
export interface STTErrorResponse {
  /**
   * Event type identifier.
   */
  type: 'error';

  /**
   * URL to relevant documentation.
   */
  doc_url?: string;

  /**
   * Machine-readable error code.
   */
  error_code?: string;

  /**
   * Human-readable error message.
   */
  message?: string;

  /**
   * Unique identifier for this WebSocket connection.
   */
  request_id?: string;

  /**
   * An HTTP response status code.
   */
  status_code?: number;

  /**
   * Human-readable error title.
   */
  title?: string;
}

export interface STTTranscribeResponse {
  /**
   * The transcribed text.
   */
  text: string;

  /**
   * The message type. Always `transcript` for a batch transcription response.
   */
  type: 'transcript';

  /**
   * The duration of the input audio in seconds.
   */
  duration?: number;

  /**
   * @deprecated Not used for batch transcription.
   */
  is_final?: boolean;

  /**
   * The specified language of the input audio.
   */
  language?: string;

  /**
   * Unique identifier for this transcription request.
   */
  request_id?: string;

  /**
   * Word-level timestamps showing the start and end time of each word. Only included
   * when `[word]` is passed into `timestamp_granularities[]`.
   */
  words?: Array<STTTranscribeResponse.Word>;
}

export namespace STTTranscribeResponse {
  export interface Word {
    /**
     * End time of the word in seconds.
     */
    end: number;

    /**
     * Start time of the word in seconds.
     */
    start: number;

    /**
     * The transcribed word.
     */
    word: string;
  }
}

export interface STTTranscribeParams {
  /**
   * Body param
   */
  file: Uploadable;

  /**
   * Body param: Models that support batch speech-to-text transcription. See
   * [the docs](https://docs.cartesia.ai/api-reference/stt/transcribe#body-model) for
   * all options.
   */
  model: STTBatchModel;

  /**
   * Query param: The encoding format for audio data sent to the STT WebSocket.
   */
  encoding?: STTEncoding | null;

  /**
   * Query param: The sample rate of the audio in Hz.
   */
  sample_rate?: number | null;

  /**
   * Body param: The language of the input audio in ISO-639-1 format. Defaults to
   * `en`.
   */
  language?:
    | 'en'
    | 'zh'
    | 'de'
    | 'es'
    | 'ru'
    | 'ko'
    | 'fr'
    | 'ja'
    | 'pt'
    | 'tr'
    | 'pl'
    | 'ca'
    | 'nl'
    | 'ar'
    | 'sv'
    | 'it'
    | 'id'
    | 'hi'
    | 'fi'
    | 'vi'
    | 'he'
    | 'uk'
    | 'el'
    | 'ms'
    | 'cs'
    | 'ro'
    | 'da'
    | 'hu'
    | 'ta'
    | 'no'
    | 'th'
    | 'ur'
    | 'hr'
    | 'bg'
    | 'lt'
    | 'la'
    | 'mi'
    | 'ml'
    | 'cy'
    | 'sk'
    | 'te'
    | 'fa'
    | 'lv'
    | 'bn'
    | 'sr'
    | 'az'
    | 'sl'
    | 'kn'
    | 'et'
    | 'mk'
    | 'br'
    | 'eu'
    | 'is'
    | 'hy'
    | 'ne'
    | 'mn'
    | 'bs'
    | 'kk'
    | 'sq'
    | 'sw'
    | 'gl'
    | 'mr'
    | 'pa'
    | 'si'
    | 'km'
    | 'sn'
    | 'yo'
    | 'so'
    | 'af'
    | 'oc'
    | 'ka'
    | 'be'
    | 'tg'
    | 'sd'
    | 'gu'
    | 'am'
    | 'yi'
    | 'lo'
    | 'uz'
    | 'fo'
    | 'ht'
    | 'ps'
    | 'tk'
    | 'nn'
    | 'mt'
    | 'sa'
    | 'lb'
    | 'my'
    | 'bo'
    | 'tl'
    | 'mg'
    | 'as'
    | 'tt'
    | 'haw'
    | 'ln'
    | 'ha'
    | 'ba'
    | 'jw'
    | 'su'
    | 'yue';

  /**
   * Body param: The timestamp granularities to populate for this transcription.
   * Currently only `word` level timestamps are supported.
   */
  timestamp_granularities?: Array<'word'>;
}

STT.AutoFinalize = AutoFinalize;
STT.ManualFinalize = ManualFinalize;

export declare namespace STT {
  export {
    type STTBatchModel as STTBatchModel,
    type STTEncoding as STTEncoding,
    type STTErrorResponse as STTErrorResponse,
    type STTTranscribeResponse as STTTranscribeResponse,
    type STTTranscribeParams as STTTranscribeParams,
  };

  export {
    AutoFinalize as AutoFinalize,
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

  export {
    ManualFinalize as ManualFinalize,
    type STTManualFinalizeDoneResponse as STTManualFinalizeDoneResponse,
    type STTManualFinalizeFlushDoneResponse as STTManualFinalizeFlushDoneResponse,
    type STTManualFinalizeModel as STTManualFinalizeModel,
    type STTManualFinalizeTranscriptResponse as STTManualFinalizeTranscriptResponse,
    type STTManualFinalizeWebsocketRequest as STTManualFinalizeWebsocketRequest,
    type STTManualFinalizeWebsocketResponse as STTManualFinalizeWebsocketResponse,
    type ManualFinalizeWebsocketParams as ManualFinalizeWebsocketParams,
  };
}
