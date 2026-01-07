// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

export class Stt extends APIResource {
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
   * **Response format:** Returns JSON with transcribed text, duration, and language.
   * Include `timestamp_granularities: ["word"]` to get word-level timestamps.
   * **Pricing:** Batch transcription is priced at **1 credit per 2 seconds** of
   * audio processed.
   *
   * <Note>
   * For migrating from the OpenAI SDK, see our [OpenAI Whisper to Cartesia Ink Migration Guide](/api-reference/stt/migrate-from-open-ai).
   * </Note>
   */
  transcribe(params: SttTranscribeParams, options?: RequestOptions): APIPromise<SttTranscribeResponse> {
    const { encoding, sample_rate, ...body } = params;
    return this._client.post(
      '/stt',
      multipartFormRequestOptions({ query: { encoding, sample_rate }, body, ...options }, this._client),
    );
  }
}

export interface SttTranscribeResponse {
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
  words?: Array<SttTranscribeResponse.Word> | null;
}

export namespace SttTranscribeResponse {
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

export interface SttTranscribeParams {
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
  encoding?: 'pcm_s16le' | 'pcm_s32le' | 'pcm_f16le' | 'pcm_f32le' | 'pcm_mulaw' | 'pcm_alaw' | null;

  /**
   * Query param: The sample rate of the audio in Hz.
   */
  sample_rate?: number | null;

  /**
   * Body param:
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
   * Body param: ID of the model to use for transcription. Use `ink-whisper` for the
   * latest Cartesia Whisper model.
   */
  model?: string;

  /**
   * Body param: The timestamp granularities to populate for this transcription.
   * Currently only `word` level timestamps are supported.
   */
  timestamp_granularities?: Array<'word'> | null;
}

export declare namespace Stt {
  export {
    type SttTranscribeResponse as SttTranscribeResponse,
    type SttTranscribeParams as SttTranscribeParams,
  };
}
