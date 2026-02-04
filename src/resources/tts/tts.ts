// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type * as WS from 'ws';
import { APIResource } from '../../core/resource';
import * as TTSAPI from './tts';
import * as VoicesAPI from '../voices';
import { APIPromise } from '../../core/api-promise';
import { type Uploadable } from '../../core/uploads';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { TTSWS } from './ws';
import { multipartFormRequestOptions } from '../../internal/uploads';

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

  /**
   * Create a WebSocket connection for streaming TTS.
   * Returns a promise that resolves when the connection is open.
   */
  async websocket(options?: WS.ClientOptions): Promise<TTSWS> {
    const ws = new TTSWS(this._client, options);
    return ws.connect();
  }

  /**
   * Generate audio that smoothly connects two existing audio segments. This is
   * useful for inserting new speech between existing speech segments while
   * maintaining natural transitions.
   *
   * **The cost is 1 credit per character of the infill text plus a fixed cost of 300
   * credits.**
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
  infill(body: TTSInfillParams, options?: RequestOptions): APIPromise<Response> {
    return this._client.post(
      '/infill/bytes',
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
}

/**
 * Configure the various attributes of the generated speech. These are only for
 * `sonic-3` and have no effect on earlier models.
 *
 * See
 * [Volume, Speed, and Emotion in Sonic-3](/build-with-cartesia/sonic-3/volume-speed-emotion)
 * for a guide on this option.
 */
export interface GenerationConfig {
  /**
   * Guide the emotion of the generated speech.
   */
  emotion?:
    | 'neutral'
    | 'happy'
    | 'excited'
    | 'enthusiastic'
    | 'elated'
    | 'euphoric'
    | 'triumphant'
    | 'amazed'
    | 'surprised'
    | 'flirtatious'
    | 'curious'
    | 'content'
    | 'peaceful'
    | 'serene'
    | 'calm'
    | 'grateful'
    | 'affectionate'
    | 'trust'
    | 'sympathetic'
    | 'anticipation'
    | 'mysterious'
    | 'angry'
    | 'mad'
    | 'outraged'
    | 'frustrated'
    | 'agitated'
    | 'threatened'
    | 'disgusted'
    | 'contempt'
    | 'envious'
    | 'sarcastic'
    | 'ironic'
    | 'sad'
    | 'dejected'
    | 'melancholic'
    | 'disappointed'
    | 'hurt'
    | 'guilty'
    | 'bored'
    | 'tired'
    | 'rejected'
    | 'nostalgic'
    | 'wistful'
    | 'apologetic'
    | 'hesitant'
    | 'insecure'
    | 'confused'
    | 'resigned'
    | 'anxious'
    | 'panicked'
    | 'alarmed'
    | 'scared'
    | 'proud'
    | 'confident'
    | 'distant'
    | 'skeptical'
    | 'contemplative'
    | 'determined';

  /**
   * Adjust the speed of the generated speech between 0.6x and 1.5x the original
   * speed (default is 1.0x). Valid values are between [0.6, 1.5] inclusive.
   */
  speed?: number;

  /**
   * Adjust the volume of the generated speech between 0.5x and 2.0x the original
   * volume (default is 1.0x). Valid values are between [0.5, 2.0] inclusive.
   */
  volume?: number;
}

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
   * Whether to flush the context.
   */
  flush?: boolean | null;

  /**
   * Configure the various attributes of the generated speech. These are only for
   * `sonic-3` and have no effect on earlier models.
   *
   * See
   * [Volume, Speed, and Emotion in Sonic-3](/build-with-cartesia/sonic-3/volume-speed-emotion)
   * for a guide on this option.
   */
  generation_config?: GenerationConfig;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](/build-with-cartesia/tts-models).
   */
  language?: VoicesAPI.SupportedLanguage;

  /**
   * The maximum time in milliseconds to buffer text before starting generation.
   * Values between [0, 5000]ms are supported. Defaults to 3000ms.
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
   * The ID of a pronunciation dictionary to use for the generation. Pronunciation
   * dictionaries are supported by `sonic-3` models and newer.
   */
  pronunciation_dict_id?: string | null;

  /**
   * @deprecated Use `generation_config.speed` for sonic-3. Speed setting for the
   * model. Defaults to `normal`. This feature is experimental and may not work for
   * all voices. Influences the speed of the generated speech. Faster speeds may
   * reduce hallucination rate.
   */
  speed?: ModelSpeed;

  /**
   * Whether to use normalized timestamps (True) or original timestamps (False).
   */
  use_normalized_timestamps?: boolean | null;
}

export namespace GenerationRequest {
  export interface OutputFormat {
    container: 'raw';

    encoding: TTSAPI.RawEncoding;

    sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
  }
}

/**
 * @deprecated Use `generation_config.speed` for sonic-3. Speed setting for the
 * model. Defaults to `normal`. This feature is experimental and may not work for
 * all voices. Influences the speed of the generated speech. Faster speeds may
 * reduce hallucination rate.
 */
export type ModelSpeed = 'slow' | 'normal' | 'fast';

export type OutputFormatContainer = 'raw' | 'wav' | 'mp3';

export type RawEncoding = 'pcm_f32le' | 'pcm_s16le' | 'pcm_mulaw' | 'pcm_alaw';

export interface RawOutputFormat {
  encoding: RawEncoding;

  sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
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
export type WebsocketClientEvent = GenerationRequest | WebsocketClientEvent.CancelContextRequest;

export namespace WebsocketClientEvent {
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

    type?: 'chunk';
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
   * Configure the various attributes of the generated speech. These are only for
   * `sonic-3` and have no effect on earlier models.
   *
   * See
   * [Volume, Speed, and Emotion in Sonic-3](/build-with-cartesia/sonic-3/volume-speed-emotion)
   * for a guide on this option.
   */
  generation_config?: GenerationConfig;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](/build-with-cartesia/tts-models).
   */
  language?: VoicesAPI.SupportedLanguage | null;

  /**
   * The ID of a pronunciation dictionary to use for the generation. Pronunciation
   * dictionaries are supported by `sonic-3` models and newer.
   */
  pronunciation_dict_id?: string | null;

  /**
   * Whether to save the generated audio file. When true, the response will include a
   * `Cartesia-File-ID` header.
   */
  save?: boolean | null;

  /**
   * @deprecated Use `generation_config.speed` for sonic-3. Speed setting for the
   * model. Defaults to `normal`. This feature is experimental and may not work for
   * all voices. Influences the speed of the generated speech. Faster speeds may
   * reduce hallucination rate.
   */
  speed?: ModelSpeed;
}

export namespace TTSGenerateParams {
  export interface RawOutputFormat extends TTSAPI.RawOutputFormat {
    container?: 'raw';
  }

  export interface WavOutputFormat extends TTSAPI.RawOutputFormat {
    container?: 'wav';
  }

  export interface MP3OutputFormat {
    bit_rate: 32000 | 64000 | 96000 | 128000 | 192000;

    sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;

    container?: 'mp3';
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
   * Configure the various attributes of the generated speech. These are only for
   * `sonic-3` and have no effect on earlier models.
   *
   * See
   * [Volume, Speed, and Emotion in Sonic-3](/build-with-cartesia/sonic-3/volume-speed-emotion)
   * for a guide on this option.
   */
  generation_config?: GenerationConfig;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](/build-with-cartesia/tts-models).
   */
  language?: VoicesAPI.SupportedLanguage;

  /**
   * The ID of a pronunciation dictionary to use for the generation. Pronunciation
   * dictionaries are supported by `sonic-3` models and newer.
   */
  pronunciation_dict_id?: string | null;

  /**
   * @deprecated Use `generation_config.speed` for sonic-3. Speed setting for the
   * model. Defaults to `normal`. This feature is experimental and may not work for
   * all voices. Influences the speed of the generated speech. Faster speeds may
   * reduce hallucination rate.
   */
  speed?: ModelSpeed;

  /**
   * Whether to use normalized timestamps (True) or original timestamps (False).
   */
  use_normalized_timestamps?: boolean | null;
}

export namespace TTSGenerateSseParams {
  export interface OutputFormat {
    container: 'raw';

    encoding: TTSAPI.RawEncoding;

    sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
  }
}

export interface TTSInfillParams {
  /**
   * The language of the transcript
   */
  language?: string;

  left_audio?: Uploadable;

  /**
   * The ID of the model to use for generating audio. Any model other than the first
   * `"sonic"` model is supported.
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
  'output_format[sample_rate]'?: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;

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

export declare namespace TTS {
  export {
    type GenerationConfig as GenerationConfig,
    type GenerationRequest as GenerationRequest,
    type ModelSpeed as ModelSpeed,
    type OutputFormatContainer as OutputFormatContainer,
    type RawEncoding as RawEncoding,
    type RawOutputFormat as RawOutputFormat,
    type VoiceSpecifier as VoiceSpecifier,
    type WebsocketClientEvent as WebsocketClientEvent,
    type WebsocketResponse as WebsocketResponse,
    type TTSGenerateParams as TTSGenerateParams,
    type TTSGenerateSseParams as TTSGenerateSseParams,
    type TTSInfillParams as TTSInfillParams,
  };
}
