// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

export class Watermark extends APIResource {
  /**
   * Check audio for a Cartesia watermark. Requires a paid plan.
   */
  detect(body: WatermarkDetectParams, options?: RequestOptions): APIPromise<WatermarkDetectResponse> {
    return this._client.post(
      '/v1/watermark/detect',
      multipartFormRequestOptions({ body, ...options }, this._client),
    );
  }
}

export interface WatermarkDetectResponse {
  /**
   * Whether a Cartesia watermark was detected in the audio
   */
  detected: boolean;
}

export interface WatermarkDetectParams {
  /**
   * Audio file to check, between 5 seconds and 5 minutes long, up to 32 MiB.
   * Supported formats are FLAC, M4A, MP3, MP4, MPEG, MPGA, OGA, OGG, WAV, and WebM.
   */
  file: Uploadable;
}

export declare namespace Watermark {
  export {
    type WatermarkDetectResponse as WatermarkDetectResponse,
    type WatermarkDetectParams as WatermarkDetectParams,
  };
}
