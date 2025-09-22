// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

export class Infill extends APIResource {
  /**
   * Generate audio that smoothly connects two existing audio segments. This is
   * useful for inserting new speech between existing speech segments while
   * maintaining natural transitions.
   *
   * **The cost is 1 credit per character of the infill text plus a fixed cost of 300
   * credits.**
   *
   * Infilling is only available on `sonic-2` at this time.
   *
   * At least one of `left_audio` or `right_audio` must be provided.
   *
   * As with all generative models, there's some inherent variability, but here's
   * some tips we recommend to get the best results from infill:
   *
   * - Use longer infill transcripts
   *   - This gives the model more flexibility to adapt to the rest of the audio
   * - Target natural pauses in the audio when deciding where to clip
   *   - This means you don't need word-level timestamps to be as precise
   * - Clip right up to the start and end of the audio segment you want infilled,
   *   keeping as much silence in the left/right audio segments as possible
   *   - This helps the model generate more natural transitions
   */
  create(body: InfillCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      '/infill/bytes',
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }
}

export type OutputFormatContainer = 'raw' | 'wav' | 'mp3';

export type RawEncoding = 'pcm_f32le' | 'pcm_s16le' | 'pcm_mulaw' | 'pcm_alaw';

export interface InfillCreateParams {
  /**
   * The language of the transcript
   */
  language?: string;

  left_audio?: Uploadable;

  /**
   * The ID of the model to use for generating audio
   */
  model_id?: string;

  /**
   * Required for `mp3` containers.
   */
  'output_format[bit_rate]'?: number | null;

  /**
   * The format of the output audio
   */
  'output_format[container]'?: OutputFormatContainer;

  /**
   * Required for `raw` and `wav` containers.
   */
  'output_format[encoding]'?: RawEncoding | null;

  /**
   * The sample rate of the output audio
   */
  'output_format[sample_rate]'?: number;

  right_audio?: Uploadable;

  /**
   * The infill text to generate
   */
  transcript?: string;

  /**
   * The ID of the voice to use for generating audio
   */
  voice_id?: string;
}

export declare namespace Infill {
  export {
    type OutputFormatContainer as OutputFormatContainer,
    type RawEncoding as RawEncoding,
    type InfillCreateParams as InfillCreateParams,
  };
}
