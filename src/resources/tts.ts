// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as TtsAPI from './tts';
import * as InfillAPI from './infill';
import * as VoicesAPI from './voices';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';

export class Tts extends APIResource {
  /**
   * Text to Speech (Bytes)
   */
  synthesizeBytes(body: TtSynthesizeBytesParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/tts/bytes', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Text to Speech (SSE)
   */
  synthesizeSse(body: TtSynthesizeSseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/tts/sse', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * > This feature is experimental and may not work for all voices.
 *
 * Speed setting for the model. Defaults to `normal`.
 *
 * Influences the speed of the generated speech. Faster speeds may reduce
 * hallucination rate.
 */
export type ModelSpeed = 'slow' | 'normal' | 'fast';

export interface RawOutputFormat {
  encoding: InfillAPI.RawEncoding;

  sample_rate: number;
}

export interface VoiceSpecifier {
  /**
   * The ID of the voice.
   */
  id: string;

  mode: 'id';
}

export interface TtSynthesizeBytesParams {
  /**
   * The ID of the model to use for the generation. See
   * [Models](/build-with-cartesia/tts-models) for available models.
   */
  model_id: string;

  output_format:
    | TtSynthesizeBytesParams.RawOutputFormat
    | TtSynthesizeBytesParams.WavOutputFormat
    | TtSynthesizeBytesParams.MP3OutputFormat;

  transcript: string;

  voice: VoiceSpecifier;

  /**
   * The maximum duration of the audio in seconds. You do not usually need to specify
   * this. If the duration is not appropriate for the length of the transcript, the
   * output audio may be truncated.
   */
  duration?: number | null;

  /**
   * Configure the various attributes of the generated speech. These controls are
   * only available for `sonic-3-preview` and will have no effect on earlier models.
   */
  generation_config?: TtSynthesizeBytesParams.GenerationConfig | null;

  /**
   * The language that the given voice should speak the transcript in.
   *
   * Options: English (en), French (fr), German (de), Spanish (es), Portuguese (pt),
   * Chinese (zh), Japanese (ja), Hindi (hi), Italian (it), Korean (ko), Dutch (nl),
   * Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
   */
  language?: VoicesAPI.SupportedLanguage | null;

  /**
   * A list of pronunciation dict IDs to use for the generation. This will be applied
   * in addition to the pinned pronunciation dict, which will be treated as the first
   * element of the list. If there are conflicts with dict items, the latest dict
   * will take precedence.
   */
  pronunciation_dict_ids?: Array<string> | null;

  /**
   * Whether to save the generated audio file. When true, the response will include a
   * `Cartesia-File-ID` header.
   */
  save?: boolean | null;

  /**
   * > This feature is experimental and may not work for all voices.
   *
   * Speed setting for the model. Defaults to `normal`.
   *
   * Influences the speed of the generated speech. Faster speeds may reduce
   * hallucination rate.
   */
  speed?: ModelSpeed | null;
}

export namespace TtSynthesizeBytesParams {
  export interface RawOutputFormat extends TtsAPI.RawOutputFormat {
    container?: 'raw';
  }

  export interface WavOutputFormat extends TtsAPI.RawOutputFormat {
    container?: 'wav';
  }

  export interface MP3OutputFormat {
    /**
     * The bit rate of the audio in bits per second. Supported bit rates are 32000,
     * 64000, 96000, 128000, 192000.
     */
    bit_rate: number;

    sample_rate: number;

    container?: 'mp3';
  }

  /**
   * Configure the various attributes of the generated speech. These controls are
   * only available for `sonic-3-preview` and will have no effect on earlier models.
   */
  export interface GenerationConfig {
    /**
     * These controls are **experimental** and subject to breaking changes.
     */
    experimental?: GenerationConfig.Experimental | null;

    /**
     * Adjust the speed of the generated speech between -1.0 (slower) and 1.0 (faster).
     * 0.0 is the default speed.
     */
    speed?: number | null;

    /**
     * Adjust the volume of the generated speech between -1.0 (softer) and 1.0
     * (louder). 0.0 is the default volume.
     */
    volume?: number | null;
  }

  export namespace GenerationConfig {
    /**
     * These controls are **experimental** and subject to breaking changes.
     */
    export interface Experimental {
      /**
       * Toggle accent localization: 0 (disabled, default) or 1 (enabled). When enabled,
       * the voice adapts to match the transcript language's accent while preserving
       * vocal characteristics. When disabled, maintains the original voice accent. For
       * more information, see
       * [Localize Voices](/build-with-sonic/capabilities/localize-voices).
       */
      accent_localization?: number | null;
    }
  }
}

export interface TtSynthesizeSseParams {
  /**
   * The ID of the model to use for the generation. See
   * [Models](/build-with-cartesia/tts-models) for available models.
   */
  model_id: string;

  output_format: TtSynthesizeSseParams.OutputFormat;

  transcript: string;

  voice: VoiceSpecifier;

  /**
   * Whether to return phoneme-level timestamps. If `false` (default), no phoneme
   * timestamps will be produced. If `true`, the server will return timestamp events
   * containing phoneme-level timing information.
   */
  add_phoneme_timestamps?: boolean | null;

  /**
   * Whether to return word-level timestamps. If `false` (default), no word
   * timestamps will be produced at all. If `true`, the server will return timestamp
   * events containing word-level timing information.
   */
  add_timestamps?: boolean | null;

  /**
   * Optional context ID for this request.
   */
  context_id?: string | null;

  /**
   * The maximum duration of the audio in seconds. You do not usually need to specify
   * this. If the duration is not appropriate for the length of the transcript, the
   * output audio may be truncated.
   */
  duration?: number | null;

  /**
   * The language that the given voice should speak the transcript in.
   *
   * Options: English (en), French (fr), German (de), Spanish (es), Portuguese (pt),
   * Chinese (zh), Japanese (ja), Hindi (hi), Italian (it), Korean (ko), Dutch (nl),
   * Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
   */
  language?: VoicesAPI.SupportedLanguage | null;

  /**
   * A list of pronunciation dict IDs to use for the generation. This will be applied
   * in addition to the pinned pronunciation dict, which will be treated as the first
   * element of the list. If there are conflicts with dict items, the latest dict
   * will take precedence.
   */
  pronunciation_dict_ids?: Array<string> | null;

  /**
   * > This feature is experimental and may not work for all voices.
   *
   * Speed setting for the model. Defaults to `normal`.
   *
   * Influences the speed of the generated speech. Faster speeds may reduce
   * hallucination rate.
   */
  speed?: ModelSpeed | null;

  /**
   * Whether to use normalized timestamps (True) or original timestamps (False).
   */
  use_normalized_timestamps?: boolean | null;
}

export namespace TtSynthesizeSseParams {
  export interface OutputFormat {
    container: 'raw';

    encoding: InfillAPI.RawEncoding;

    sample_rate: number;
  }
}

export declare namespace Tts {
  export {
    type ModelSpeed as ModelSpeed,
    type RawOutputFormat as RawOutputFormat,
    type VoiceSpecifier as VoiceSpecifier,
    type TtSynthesizeBytesParams as TtSynthesizeBytesParams,
    type TtSynthesizeSseParams as TtSynthesizeSseParams,
  };
}
