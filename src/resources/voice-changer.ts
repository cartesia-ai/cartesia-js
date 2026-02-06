// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as TTSAPI from './tts/tts';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

export class VoiceChanger extends APIResource {
  /**
   * Takes an audio file of speech, and returns an audio file of speech spoken with
   * the same intonation, but with a different voice.
   *
   * This endpoint is priced at 15 characters per second of input audio.
   */
  changeVoiceBytes(body: VoiceChangerChangeVoiceBytesParams, options?: RequestOptions): APIPromise<Response> {
    return this._client.post(
      '/voice-changer/bytes',
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([{ Accept: 'audio/wav' }, options?.headers]),
          __binaryResponse: true,
        },
        this._client,
      ),
    );
  }

  /**
   * Voice Changer (SSE)
   */
  changeVoiceSse(body: VoiceChangerChangeVoiceSseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      '/voice-changer/sse',
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }
}

export interface VoiceChangerChangeVoiceBytesParams {
  clip?: Uploadable;

  /**
   * Required for `mp3` containers.
   */
  'output_format[bit_rate]'?: number | null;

  'output_format[container]'?: TTSAPI.OutputFormatContainer;

  /**
   * Required for `raw` and `wav` containers.
   */
  'output_format[encoding]'?: TTSAPI.RawEncoding | null;

  'output_format[sample_rate]'?: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;

  'voice[id]'?: string;
}

export interface VoiceChangerChangeVoiceSseParams {
  clip?: Uploadable;

  /**
   * Required for `mp3` containers.
   */
  'output_format[bit_rate]'?: number | null;

  'output_format[container]'?: TTSAPI.OutputFormatContainer;

  /**
   * Required for `raw` and `wav` containers.
   */
  'output_format[encoding]'?: TTSAPI.RawEncoding | null;

  'output_format[sample_rate]'?: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;

  'voice[id]'?: string;
}

export declare namespace VoiceChanger {
  export {
    type VoiceChangerChangeVoiceBytesParams as VoiceChangerChangeVoiceBytesParams,
    type VoiceChangerChangeVoiceSseParams as VoiceChangerChangeVoiceSseParams,
  };
}
