// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TTSAPI from './tts';
import * as VoicesAPI from '../voices';
import { APIPromise } from '../../core/api-promise';
import { Stream } from '../../core/streaming';
import { type Uploadable } from '../../core/uploads';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { multipartFormRequestOptions } from '../../internal/uploads';

export class TTS extends APIResource {
  /**
   * Text-to-Speech (Bytes).
   *
   * The simplest way to stream generated audio.
   *
   * See
   * [Compare TTS Endpoints](https://docs.cartesia.ai/use-the-api/compare-tts-endpoints)
   * for details.
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
   * Text-to-Speech (SSE).
   *
   * Supports:
   *
   * - Streaming
   * - Timestamps
   * - context_id without transcript buffering
   *
   * See
   * [Compare TTS Endpoints](https://docs.cartesia.ai/use-the-api/compare-tts-endpoints)
   * for details.
   */
  generateSSE(body: TTSGenerateSSEParams, options?: RequestOptions): APIPromise<Stream<TTSSSEEvent>> {
    return this._client.post('/tts/sse', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<TTSSSEEvent>>;
  }

  /**
   * Infill (Bytes).
   *
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
   * A unique identifier for the context. You can use any unique identifier, like a
   * UUID or human ID.
   */
  context_id: string;

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
   * @deprecated Use `generation_config.speed` for sonic-3.
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
 * @deprecated Use `generation_config.speed` for sonic-3.
 */
export type ModelSpeed = 'slow' | 'normal' | 'fast';

export type OutputFormatContainer = 'raw' | 'wav' | 'mp3';

/**
 * Phoneme-level timing information.
 */
export interface PhonemeTimestamps {
  /**
   * End times in seconds for each phoneme.
   */
  end: Array<number>;

  /**
   * List of phonemes in order.
   */
  phonemes: Array<string>;

  /**
   * Start times in seconds for each phoneme.
   */
  start: Array<number>;
}

export type RawEncoding = 'pcm_f32le' | 'pcm_s16le' | 'pcm_mulaw' | 'pcm_alaw';

export interface RawOutputFormat {
  encoding: RawEncoding;

  sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
}

/**
 * An event emitted by the TTS SSE stream.
 */
export type TTSSSEEvent =
  | TTSSSEEvent.TTSSSEChunkEvent
  | TTSSSEEvent.TTSSSETimestampsEvent
  | TTSSSEEvent.TTSSSEPhonemeTimestampsEvent
  | TTSSSEEvent.TTSSSEDoneEvent
  | TTSSSEEvent.TTSSSEErrorEvent;

export namespace TTSSSEEvent {
  /**
   * Audio data chunk.
   */
  export interface TTSSSEChunkEvent {
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
     * HTTP-style status code.
     */
    status_code: number;

    /**
     * Server-side processing time for this chunk in milliseconds.
     */
    step_time: number;

    /**
     * Event type identifier.
     */
    type: 'chunk';

    /**
     * The context ID echoed back from the request, if one was provided.
     */
    context_id?: string | null;
  }

  /**
   * Word-level timing information.
   */
  export interface TTSSSETimestampsEvent {
    /**
     * Whether this is the final event for the request. Always `false` for timestamps
     * events.
     */
    done: false;

    /**
     * HTTP-style status code.
     */
    status_code: number;

    /**
     * Event type identifier.
     */
    type: 'timestamps';

    /**
     * Word-level timing information.
     */
    word_timestamps: TTSAPI.WordTimestamps;

    /**
     * The context ID echoed back from the request, if one was provided.
     */
    context_id?: string | null;
  }

  /**
   * Phoneme-level timing information.
   */
  export interface TTSSSEPhonemeTimestampsEvent {
    /**
     * Whether this is the final event for the request. Always `false` for
     * phoneme_timestamps events.
     */
    done: false;

    /**
     * Phoneme-level timing information.
     */
    phoneme_timestamps: TTSAPI.PhonemeTimestamps;

    /**
     * HTTP-style status code.
     */
    status_code: number;

    /**
     * Event type identifier.
     */
    type: 'phoneme_timestamps';

    /**
     * The context ID echoed back from the request, if one was provided.
     */
    context_id?: string | null;
  }

  /**
   * Generation completion signal. Final event in the stream.
   */
  export interface TTSSSEDoneEvent {
    /**
     * Whether generation is complete. Always `true` for done events.
     */
    done: true;

    /**
     * HTTP-style status code.
     */
    status_code: number;

    /**
     * Event type identifier.
     */
    type: 'done';

    /**
     * The context ID echoed back from the request, if one was provided.
     */
    context_id?: string | null;
  }

  /**
   * Error information for the TTS SSE request.
   */
  export interface TTSSSEErrorEvent {
    /**
     * Whether generation is complete.
     */
    done: boolean;

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
    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     */
    context_id: string;

    /**
     * Base64-encoded audio data
     */
    data: string;

    /**
     * Whether this is the final chunk for this context
     */
    done: boolean;

    /**
     * HTTP-style status code
     */
    status_code: number;

    /**
     * Server-side processing time for this chunk in milliseconds
     */
    step_time: number;

    type: 'chunk';

    /**
     * An identifier corresponding to the number of flush commands that have been sent
     * for this context. Starts at 1.
     *
     * This can be used to map chunks of audio to certain transcript submissions.
     */
    flush_id?: number | null;
  }

  export interface FlushDone {
    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     */
    context_id: string;

    /**
     * Whether generation is complete
     */
    done: boolean;

    /**
     * Whether the flush is complete
     */
    flush_done: boolean;

    /**
     * An identifier corresponding to the number of flush commands that have been sent
     * for this context. Starts at 1.
     *
     * This can be used to map chunks of audio to certain transcript submissions.
     */
    flush_id: number;

    /**
     * HTTP-style status code
     */
    status_code: number;

    type: 'flush_done';
  }

  export interface Done {
    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     */
    context_id: string;

    /**
     * Whether generation is complete. Always `true` for done events.
     */
    done: true;

    /**
     * HTTP-style status code
     */
    status_code: number;

    type: 'done';
  }

  export interface Timestamps {
    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     */
    context_id: string;

    /**
     * Whether generation is complete
     */
    done: boolean;

    /**
     * HTTP-style status code
     */
    status_code: number;

    type: 'timestamps';

    /**
     * An identifier corresponding to the number of flush commands that have been sent
     * for this context. Starts at 1.
     *
     * This can be used to map chunks of audio to certain transcript submissions.
     */
    flush_id?: number | null;

    /**
     * Word-level timing information.
     */
    word_timestamps?: TTSAPI.WordTimestamps | null;
  }

  export interface Error {
    /**
     * Whether generation is complete
     */
    done: boolean;

    type: 'error';

    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     */
    context_id?: string;

    /**
     * URL to relevant documentation
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
     * A unique identifier for the network connection.
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

  export interface PhonemeTimestamps {
    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     */
    context_id: string;

    /**
     * Whether generation is complete
     */
    done: boolean;

    /**
     * HTTP-style status code
     */
    status_code: number;

    type: 'phoneme_timestamps';

    /**
     * An identifier corresponding to the number of flush commands that have been sent
     * for this context. Starts at 1.
     *
     * This can be used to map chunks of audio to certain transcript submissions.
     */
    flush_id?: number | null;

    /**
     * Phoneme-level timing information.
     */
    phoneme_timestamps?: TTSAPI.PhonemeTimestamps | null;
  }
}

/**
 * Word-level timing information.
 */
export interface WordTimestamps {
  /**
   * End times in seconds for each word.
   */
  end: Array<number>;

  /**
   * Start times in seconds for each word.
   */
  start: Array<number>;

  /**
   * List of words in order.
   */
  words: Array<string>;
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
   * @deprecated Use `generation_config.speed` for sonic-3.
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

export interface TTSGenerateSSEParams {
  /**
   * The ID of the model to use for the generation. See
   * [Models](/build-with-cartesia/tts-models) for available models.
   */
  model_id: string;

  output_format: TTSGenerateSSEParams.OutputFormat;

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
   * @deprecated Use `generation_config.speed` for sonic-3.
   */
  speed?: ModelSpeed;

  /**
   * Whether to use normalized timestamps (True) or original timestamps (False).
   */
  use_normalized_timestamps?: boolean | null;
}

export namespace TTSGenerateSSEParams {
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

  output_format?:
    | TTSInfillParams.RawOutputFormat
    | TTSInfillParams.WavOutputFormat
    | TTSInfillParams.MP3OutputFormat;

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

export namespace TTSInfillParams {
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

export declare namespace TTS {
  export {
    type GenerationConfig as GenerationConfig,
    type GenerationRequest as GenerationRequest,
    type ModelSpeed as ModelSpeed,
    type OutputFormatContainer as OutputFormatContainer,
    type PhonemeTimestamps as PhonemeTimestamps,
    type RawEncoding as RawEncoding,
    type RawOutputFormat as RawOutputFormat,
    type TTSSSEEvent as TTSSSEEvent,
    type VoiceSpecifier as VoiceSpecifier,
    type WebsocketClientEvent as WebsocketClientEvent,
    type WebsocketResponse as WebsocketResponse,
    type WordTimestamps as WordTimestamps,
    type TTSGenerateParams as TTSGenerateParams,
    type TTSGenerateSSEParams as TTSGenerateSSEParams,
    type TTSInfillParams as TTSInfillParams,
  };
}
