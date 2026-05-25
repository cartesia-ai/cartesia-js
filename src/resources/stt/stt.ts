// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ExternalVADAPI from './external-vad/external-vad';
import {
  ExternalVAD,
  ExternalVADWebsocketParams,
  STTExternalVADDoneResponse,
  STTExternalVADFlushDoneResponse,
  STTExternalVADQueryParams,
  STTExternalVADTranscriptResponse,
  STTExternalVADWebsocketRequest,
  STTExternalVADWebsocketResponse,
  STTRealtimeExternalVADModel,
} from './external-vad/external-vad';
import * as TurnDetectingAPI from './turn-detecting/turn-detecting';
import {
  STTRealtimeTurnDetectingModel,
  STTTurnsCloseCommand,
  STTTurnsConnected,
  STTTurnsTurnEagerEnd,
  STTTurnsTurnEnd,
  STTTurnsTurnResume,
  STTTurnsTurnStart,
  STTTurnsTurnUpdate,
  STTTurnsWebsocketQueryParams,
  STTTurnsWebsocketRequest,
  STTTurnsWebsocketResponse,
  TurnDetecting,
  TurnDetectingWebsocketParams,
} from './turn-detecting/turn-detecting';
import { APIPromise } from '../../core/api-promise';
import { type Uploadable } from '../../core/uploads';
import { RequestOptions } from '../../internal/request-options';
import { multipartFormRequestOptions } from '../../internal/uploads';

export class STT extends APIResource {
  turnDetecting: TurnDetectingAPI.TurnDetecting = new TurnDetectingAPI.TurnDetecting(this._client);
  externalVAD: ExternalVADAPI.ExternalVAD = new ExternalVADAPI.ExternalVAD(this._client);

  /**
   * Transcribes audio files into text using Cartesia's Speech-to-Text API.
   *
   * Upload an audio file and receive a complete transcription response. Supports
   * arbitrarily long audio files with automatic intelligent chunking for longer
   * audio.
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
   * The duration of the input audio in seconds.
   */
  duration?: number | null;

  /**
   * The specified language of the input audio.
   */
  language?: string | null;

  /**
   * Word-level timestamps showing the start and end time of each word. Only included
   * when `[word]` is passed into `timestamp_granularities[]`.
   */
  words?: Array<STTTranscribeResponse.Word> | null;
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
   * Query param: The encoding format to process the audio as. If not specified, the
   * audio file will be decoded automatically.
   *
   * **Supported formats:**
   *
   * - `pcm_s16le` - 16-bit signed integer PCM, little-endian (recommended for best
   *   performance)
   * - `pcm_s32le` - 32-bit signed integer PCM, little-endian
   * - `pcm_f16le` - 16-bit floating point PCM, little-endian
   * - `pcm_f32le` - 32-bit floating point PCM, little-endian
   * - `pcm_mulaw` - 8-bit μ-law encoded PCM
   * - `pcm_alaw` - 8-bit A-law encoded PCM
   */
  encoding?: STTEncoding | null;

  /**
   * Query param: The sample rate of the audio in Hz.
   */
  sample_rate?: number | null;

  /**
   * Body param
   */
  file?: Uploadable;

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
    | 'yue'
    | null;

  /**
   * Body param: Models that support batch speech-to-text transcription. See
   * [the docs](https://docs.cartesia.ai/api-reference/stt/transcribe#body-model) for
   * all options.
   */
  model?: STTBatchModel;

  /**
   * Body param: The timestamp granularities to populate for this transcription.
   * Currently only `word` level timestamps are supported.
   */
  timestamp_granularities?: Array<'word'> | null;
}

STT.TurnDetecting = TurnDetecting;
STT.ExternalVAD = ExternalVAD;

export declare namespace STT {
  export {
    type STTBatchModel as STTBatchModel,
    type STTEncoding as STTEncoding,
    type STTErrorResponse as STTErrorResponse,
    type STTTranscribeResponse as STTTranscribeResponse,
    type STTTranscribeParams as STTTranscribeParams,
  };

  export {
    TurnDetecting as TurnDetecting,
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

  export {
    ExternalVAD as ExternalVAD,
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
