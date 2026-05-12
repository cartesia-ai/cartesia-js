// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as TTSAPI from './tts';
import { APIPromise } from '../core/api-promise';
import { Stream } from '../core/streaming';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

export class VoiceChanger extends APIResource {
  /**
   * Voice Changer (Bytes).
   *
   * Takes an audio file of speech, and returns an audio file of speech spoken with
   * the same intonation, but with a different voice.
   *
   * This endpoint is priced at 15 characters per second of input audio.
   */
  generate(body: VoiceChangerGenerateParams, options?: RequestOptions): APIPromise<Response> {
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
  generateSSE(
    body: VoiceChangerGenerateSSEParams,
    options?: RequestOptions,
  ): APIPromise<Stream<VoiceChangerSSEEvent>> {
    return this._client.post(
      '/voice-changer/sse',
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
          stream: true,
        },
        this._client,
      ),
    ) as APIPromise<Stream<VoiceChangerSSEEvent>>;
  }

  /**
   * Alias of {@link VoiceChanger.generate } for backward compatibility.
   */
  changeVoiceBytes(...args: Parameters<VoiceChanger['generate']>): ReturnType<VoiceChanger['generate']> {
    return this.generate(...args);
  }

  /**
   * Make a raw Voice Changer (SSE) request without any response handling.
   *
   * @deprecated Use {@link VoiceChanger.generateSSE } for built-in event parsing and streaming.
   */
  changeVoiceSse(body: VoiceChangerGenerateSSEParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      '/voice-changer/sse',
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }
}

/**
 * An event emitted by the Voice Changer SSE stream.
 */
export type VoiceChangerSSEEvent =
  | VoiceChangerSSEEvent.VoiceChangerSSEChunk
  | VoiceChangerSSEEvent.VoiceChangerSSEDone
  | VoiceChangerSSEEvent.VoiceChangerSSEError;

export namespace VoiceChangerSSEEvent {
  /**
   * Audio data chunk.
   */
  export interface VoiceChangerSSEChunk {
    /**
     * Base64-encoded audio data.
     */
    data: string;

    /**
     * Whether this is the final event for the request. Always `false` for chunk
     * events.
     */
    done: false;

    /**
     * The sample rate of the audio in Hz.
     */
    sample_rate: number;

    /**
     * HTTP-style status code. Always `206` for chunk events.
     */
    status_code: 206;

    /**
     * Server-side processing time for this chunk in milliseconds.
     */
    step_time: number;
  }

  /**
   * Generation completion signal. Final event in the stream.
   */
  export interface VoiceChangerSSEDone {
    /**
     * Whether generation is complete. Always `true` for done events.
     */
    done: true;

    /**
     * HTTP-style status code. Always `200` for done events.
     */
    status_code: 200;
  }

  /**
   * Error information for the Voice Changer SSE request.
   */
  export interface VoiceChangerSSEError {
    /**
     * Whether generation is complete. Always `true` for error events.
     */
    done: true;

    /**
     * Human-readable error message.
     */
    message: string;

    /**
     * Unique identifier for this request.
     */
    request_id: string;

    /**
     * An HTTP response status code.
     */
    status_code: number;

    /**
     * Human-readable error title.
     */
    title: string;

    /**
     * Event type identifier.
     */
    type: 'error';

    /**
     * URL to relevant documentation.
     */
    doc_url?: string | null;

    /**
     * Machine-readable error code.
     */
    error_code?: string | null;
  }
}

export interface VoiceChangerGenerateParams {
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

export interface VoiceChangerGenerateSSEParams {
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

/** Type alias for backward compatibility */
export type VoiceChangerChangeVoiceBytesParams = VoiceChangerGenerateParams;

/** Type alias for backward compatibility */
export type VoiceChangerChangeVoiceSseParams = VoiceChangerGenerateSSEParams;

export declare namespace VoiceChanger {
  export {
    type VoiceChangerSSEEvent as VoiceChangerSSEEvent,
    type VoiceChangerChangeVoiceBytesParams as VoiceChangerChangeVoiceBytesParams,
    type VoiceChangerChangeVoiceSseParams as VoiceChangerChangeVoiceSseParams,
    type VoiceChangerGenerateParams as VoiceChangerGenerateParams,
    type VoiceChangerGenerateSSEParams as VoiceChangerGenerateSSEParams,
  };
}
