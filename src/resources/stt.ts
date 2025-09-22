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
   *
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
   *
   * <Accordion title="Supported languages">
   *   - `en` (English)
   *   - `zh` (Chinese)
   *   - `de` (German)
   *   - `es` (Spanish)
   *   - `ru` (Russian)
   *   - `ko` (Korean)
   *   - `fr` (French)
   *   - `ja` (Japanese)
   *   - `pt` (Portuguese)
   *   - `tr` (Turkish)
   *   - `pl` (Polish)
   *   - `ca` (Catalan)
   *   - `nl` (Dutch)
   *   - `ar` (Arabic)
   *   - `sv` (Swedish)
   *   - `it` (Italian)
   *   - `id` (Indonesian)
   *   - `hi` (Hindi)
   *   - `fi` (Finnish)
   *   - `vi` (Vietnamese)
   *   - `he` (Hebrew)
   *   - `uk` (Ukrainian)
   *   - `el` (Greek)
   *   - `ms` (Malay)
   *   - `cs` (Czech)
   *   - `ro` (Romanian)
   *   - `da` (Danish)
   *   - `hu` (Hungarian)
   *   - `ta` (Tamil)
   *   - `no` (Norwegian)
   *   - `th` (Thai)
   *   - `ur` (Urdu)
   *   - `hr` (Croatian)
   *   - `bg` (Bulgarian)
   *   - `lt` (Lithuanian)
   *   - `la` (Latin)
   *   - `mi` (Maori)
   *   - `ml` (Malayalam)
   *   - `cy` (Welsh)
   *   - `sk` (Slovak)
   *   - `te` (Telugu)
   *   - `fa` (Persian)
   *   - `lv` (Latvian)
   *   - `bn` (Bengali)
   *   - `sr` (Serbian)
   *   - `az` (Azerbaijani)
   *   - `sl` (Slovenian)
   *   - `kn` (Kannada)
   *   - `et` (Estonian)
   *   - `mk` (Macedonian)
   *   - `br` (Breton)
   *   - `eu` (Basque)
   *   - `is` (Icelandic)
   *   - `hy` (Armenian)
   *   - `ne` (Nepali)
   *   - `mn` (Mongolian)
   *   - `bs` (Bosnian)
   *   - `kk` (Kazakh)
   *   - `sq` (Albanian)
   *   - `sw` (Swahili)
   *   - `gl` (Galician)
   *   - `mr` (Marathi)
   *   - `pa` (Punjabi)
   *   - `si` (Sinhala)
   *   - `km` (Khmer)
   *   - `sn` (Shona)
   *   - `yo` (Yoruba)
   *   - `so` (Somali)
   *   - `af` (Afrikaans)
   *   - `oc` (Occitan)
   *   - `ka` (Georgian)
   *   - `be` (Belarusian)
   *   - `tg` (Tajik)
   *   - `sd` (Sindhi)
   *   - `gu` (Gujarati)
   *   - `am` (Amharic)
   *   - `yi` (Yiddish)
   *   - `lo` (Lao)
   *   - `uz` (Uzbek)
   *   - `fo` (Faroese)
   *   - `ht` (Haitian Creole)
   *   - `ps` (Pashto)
   *   - `tk` (Turkmen)
   *   - `nn` (Nynorsk)
   *   - `mt` (Maltese)
   *   - `sa` (Sanskrit)
   *   - `lb` (Luxembourgish)
   *   - `my` (Myanmar)
   *   - `bo` (Tibetan)
   *   - `tl` (Tagalog)
   *   - `mg` (Malagasy)
   *   - `as` (Assamese)
   *   - `tt` (Tatar)
   *   - `haw` (Hawaiian)
   *   - `ln` (Lingala)
   *   - `ha` (Hausa)
   *   - `ba` (Bashkir)
   *   - `jw` (Javanese)
   *   - `su` (Sundanese)
   *   - `yue` (Cantonese)
   * </Accordion>
   */
  language?: string | null;

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
