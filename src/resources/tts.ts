// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as TTSAPI from './tts';
import * as InfillAPI from './infill';
import * as VoicesAPI from './voices';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';

export class TTS extends APIResource {
  /**
   * Text to Speech (Bytes)
   */
  generate(body: TTSGenerateParams, options?: RequestOptions): APIPromise<Response> {
    return this._client.post('/tts/bytes', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: 'audio/wav' }, options?.headers]),
      __binaryResponse: true,
    });
  }

  /**
   * Text to Speech (SSE)
   */
  generateSse(body: TTSGenerateSseParams, options?: RequestOptions): APIPromise<void> {
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

/**
 * Use this to generate speech for a transcript.
 */
export type WebsocketClientEvent =
  | WebsocketClientEvent.GenerationRequest
  | WebsocketClientEvent.CancelContextRequest;

export namespace WebsocketClientEvent {
  /**
   * Use this to generate speech for a transcript.
   */
  export interface GenerationRequest {
    /**
     * The ID of the model to use for the generation. See
     * [Models](/build-with-cartesia/tts-models) for available models.
     */
    model_id: string;

    output_format: GenerationRequest.OutputFormat;

    /**
     * The transcript to generate speech for.
     */
    transcript: string;

    voice: TTSAPI.VoiceSpecifier;

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
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;

    /**
     * Whether this input may be followed by more inputs. If not specified, this
     * defaults to `false`.
     */
    continue?: boolean | null;

    /**
     * The maximum duration of the audio in seconds. You do not usually need to specify
     * this. If the duration is not appropriate for the length of the transcript, the
     * output audio may be truncated.
     */
    duration?: number | null;

    /**
     * Whether to flush the context.
     */
    flush?: boolean | null;

    /**
     * The language that the given voice should speak the transcript in.
     *
     * Options: English (en), French (fr), German (de), Spanish (es), Portuguese (pt),
     * Chinese (zh), Japanese (ja), Hindi (hi), Italian (it), Korean (ko), Dutch (nl),
     * Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
     */
    language?: VoicesAPI.SupportedLanguage | null;

    /**
     * The maximum time in milliseconds to buffer text before starting generation.
     * Values between [0, 1000]ms are supported. Defaults to 0 (no buffering).
     *
     * When set, the model will buffer incoming text chunks until it's confident it has
     * enough context to generate high-quality speech, or the buffer delay elapses,
     * whichever comes first. Without this option set, the model will kick off
     * generations immediately, ceding control of buffering to the user.
     *
     * Use this to balance responsiveness with higher quality speech generation, which
     * often benefits from having more context.
     */
    max_buffer_delay_ms?: number | null;

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
    speed?: TTSAPI.ModelSpeed | null;

    /**
     * Whether to use normalized timestamps (True) or original timestamps (False).
     */
    use_normalized_timestamps?: boolean | null;
  }

  export namespace GenerationRequest {
    export interface OutputFormat {
      container: 'raw';

      encoding: InfillAPI.RawEncoding;

      sample_rate: number;
    }
  }

  /**
   * Use this to cancel a context, so that no more messages are generated for that
   * context.
   */
  export interface CancelContextRequest {
    /**
     * Whether to cancel the context, so that no more messages are generated for that
     * context.
     */
    cancel: true;

    /**
     * The ID of the context to cancel.
     */
    context_id: string;
  }
}

export type WebsocketResponse =
  | WebsocketResponse.Chunk
  | WebsocketResponse.FlushDone
  | WebsocketResponse.Done
  | WebsocketResponse.Timestamps
  | WebsocketResponse.Error
  | WebsocketResponse.PhonemeTimestamps;

export namespace WebsocketResponse {
  export interface Chunk {
    data: string;

    done: boolean;

    status_code: number;

    step_time: number;

    type: 'chunk';

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;
  }

  export interface FlushDone {
    done: boolean;

    status_code: number;

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;

    type?: 'flush_done';
  }

  export interface Done {
    done: boolean;

    status_code: number;

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;

    type?: 'done';
  }

  export interface Timestamps {
    done: boolean;

    status_code: number;

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;

    type?: 'timestamps';
  }

  export interface Error {
    done: boolean;

    status_code: number;

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;

    type?: 'error';
  }

  export interface PhonemeTimestamps {
    done: boolean;

    status_code: number;

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * Some customers use unique identifiers from their own systems (such as
     * conversation IDs) as context IDs.
     */
    context_id?: string | null;

    type?: 'phoneme_timestamps';
  }
}

export interface TTSGenerateParams {
  /**
   * The ID of the model to use for the generation. See
   * [Models](/build-with-cartesia/tts-models) for available models.
   */
  model_id: string;

  output_format:
    | TTSGenerateParams.RawOutputFormat
    | TTSGenerateParams.WavOutputFormat
    | TTSGenerateParams.MP3OutputFormat;

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
  generation_config?: TTSGenerateParams.GenerationConfig | null;

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

export namespace TTSGenerateParams {
  export interface RawOutputFormat extends TTSAPI.RawOutputFormat {
    container?: 'raw';
  }

  export interface WavOutputFormat extends TTSAPI.RawOutputFormat {
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

export interface TTSGenerateSseParams {
  /**
   * The ID of the model to use for the generation. See
   * [Models](/build-with-cartesia/tts-models) for available models.
   */
  model_id: string;

  output_format: TTSGenerateSseParams.OutputFormat;

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

export namespace TTSGenerateSseParams {
  export interface OutputFormat {
    container: 'raw';

    encoding: InfillAPI.RawEncoding;

    sample_rate: number;
  }
}

export declare namespace TTS {
  export {
    type ModelSpeed as ModelSpeed,
    type RawOutputFormat as RawOutputFormat,
    type VoiceSpecifier as VoiceSpecifier,
    type WebsocketClientEvent as WebsocketClientEvent,
    type WebsocketResponse as WebsocketResponse,
    type TTSGenerateParams as TTSGenerateParams,
    type TTSGenerateSseParams as TTSGenerateSseParams,
  };
}
