// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { ClientOptions as WSClientOptions } from 'ws';
import { APIResource } from '../core/resource';
import * as TTSAPI from './tts';
import * as Shared from './shared';
import * as VoicesAPI from './voices';
import { APIPromise } from '../core/api-promise';
import { Stream } from '../core/streaming';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { TTSWS } from '../internal/lib/tts/ws';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

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

  /**
   * Text-to-Speech (WebSocket).
   *
   * Supports:
   * - Streaming
   * - Long-lived connections allow for lower latency by reusing a live network connection
   * - Timestamps
   * - Multiple TTS [contexts](https://docs.cartesia.ai/use-the-api/tts-websocket/contexts) over the same connection
   * - [Context flushing](https://docs.cartesia.ai/use-the-api/tts-websocket/context-flushing-and-flush-i-ds)
   * - [Transcript buffering](https://docs.cartesia.ai/use-the-api/tts-websocket/buffering)
   * - Event listeners
   *
   * @param options - WebSocket client options.
   */
  websocket(options?: WSClientOptions | undefined): Promise<TTSWS> {
    const ws = new TTSWS(this._client, options);
    return ws.connect();
  }

  /**
   * Make a raw Text-to-Speech (SSE) request without any response handling.
   *
   * @deprecated Use {@link TTS.generateSSE } for built-in event parsing and streaming.
   */
  generateSse(body: TTSGenerateSSEParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/tts/sse', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * Configure the various attributes of the generated speech. These are only for
 * `sonic-3` and have no effect on earlier models.
 *
 * See
 * [Volume, Speed, and Emotion in Sonic-3](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion)
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
   * Text-to-speech models. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest) for
   * all options.
   */
  model_id: TTSModel;

  output_format: RawOutputFormat;

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
   * [Volume, Speed, and Emotion in Sonic-3](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion)
   * for a guide on this option.
   */
  generation_config?: GenerationConfig;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](https://docs.cartesia.ai/build-with-cartesia/tts-models).
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

// Alias for backward compatibility
export namespace GenerationRequest {
  export type OutputFormat = RawOutputFormat;
}

/**
 * Infill models. See
 * [the docs](https://docs.cartesia.ai/api-reference/infill/bytes#body-model-id)
 * for all options.
 */
export type InfillModel = 'sonic-3' | 'sonic-3-2026-01-12' | 'sonic-3-2025-10-27' | (string & {});

/**
 * @deprecated Use `generation_config.speed` for sonic-3.
 */
export type ModelSpeed = 'slow' | 'normal' | 'fast';

export interface MP3OutputFormat {
  bit_rate: 32000 | 64000 | 96000 | 128000 | 192000;

  container: 'mp3';

  sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
}

export type OutputFormatContainer = 'raw' | 'wav' | 'mp3';

export type RawEncoding = 'pcm_f32le' | 'pcm_s16le' | 'pcm_mulaw' | 'pcm_alaw';

export interface RawOutputFormat {
  container: 'raw';

  encoding: RawEncoding;

  sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
}

/**
 * Text-to-speech models. See
 * [the docs](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest) for
 * all options.
 */
export type TTSModel =
  | 'sonic-3.5'
  | 'sonic-3'
  | 'sonic-3.5-2026-05-04'
  | 'sonic-3-2026-01-12'
  | 'sonic-3-2025-10-27'
  | 'sonic-latest'
  | (string & {});

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
    word_timestamps: Shared.WordTimestamps;

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
    phoneme_timestamps: Shared.PhonemeTimestamps;

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

export interface WAVOutputFormat {
  container: 'wav';

  encoding: RawEncoding;

  sample_rate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
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

    /**
     * Decoded audio data as a Buffer (base64-decodes {@link Chunk.data}).
     *
     * Set by the SDK on receipt; not returned by the API.
     */
    // FIXME: These generated types should match our OpenAPI spec exactly. Custom SDK code should export their own types as necessary.
    audio?: Uint8Array;
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
    word_timestamps?: Shared.WordTimestamps | null;
  }

  export interface Error {
    /**
     * Human-readable error message.
     */
    message: string;

    /**
     * An HTTP response status code.
     */
    status_code: number;

    /**
     * Human-readable error title.
     */
    title: string;

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
     * Whether generation is complete
     */
    done?: boolean;

    /**
     * Machine-readable error code.
     */
    error_code?: string;

    /**
     * A unique identifier for the network connection.
     */
    request_id?: string;
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
    phoneme_timestamps?: Shared.PhonemeTimestamps | null;
  }

  export namespace Timestamps {
    /** Alias for backward compatibility */
    export type WordTimestamps = TTSAPI.WordTimestamps;
  }

  export namespace PhonemeTimestamps {
    /** Alias for backward compatibility */
    export type PhonemeTimestamps = TTSAPI.PhonemeTimestamps;
  }
}

export interface TTSGenerateParams {
  /**
   * Text-to-speech models. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest) for
   * all options.
   */
  model_id: TTSModel;

  output_format: RawOutputFormat | WAVOutputFormat | MP3OutputFormat;

  transcript: string;

  voice: VoiceSpecifier;

  /**
   * Configure the various attributes of the generated speech. These are only for
   * `sonic-3` and have no effect on earlier models.
   *
   * See
   * [Volume, Speed, and Emotion in Sonic-3](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion)
   * for a guide on this option.
   */
  generation_config?: GenerationConfig;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](https://docs.cartesia.ai/build-with-cartesia/tts-models).
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

export interface TTSGenerateSSEParams {
  /**
   * Text-to-speech models. See
   * [the docs](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest) for
   * all options.
   */
  model_id: TTSModel;

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
   * [Volume, Speed, and Emotion in Sonic-3](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion)
   * for a guide on this option.
   */
  generation_config?: GenerationConfig;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](https://docs.cartesia.ai/build-with-cartesia/tts-models).
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
   * Infill models. See
   * [the docs](https://docs.cartesia.ai/api-reference/infill/bytes#body-model-id)
   * for all options.
   */
  model_id?: InfillModel;

  output_format?: RawOutputFormat | WAVOutputFormat | MP3OutputFormat;

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

export namespace TTSGenerateParams {
  /** Type alias for backward compatibility */
  export type RawOutputFormat = TTSAPI.RawOutputFormat;
  /** Type alias for backward compatibility */
  export type WavOutputFormat = TTSAPI.WAVOutputFormat;
  /** Type alias for backward compatibility */
  export type MP3OutputFormat = TTSAPI.MP3OutputFormat;
}

export namespace TTSInfillParams {
  /** Type alias for backward compatibility */
  export type RawOutputFormat = TTSAPI.RawOutputFormat;
  /** Type alias for backward compatibility */
  export type WavOutputFormat = TTSAPI.WAVOutputFormat;
  /** Type alias for backward compatibility */
  export type MP3OutputFormat = TTSAPI.MP3OutputFormat;
}

/** Type alias for backward compatibility */
export type TTSGenerateSseParams = TTSGenerateSSEParams;
/** Type alias for backward compatibility */
export type PhonemeTimestamps = Shared.PhonemeTimestamps;
/** Type alias for backward compatibility */
export type WordTimestamps = Shared.WordTimestamps;

export declare namespace TTS {
  export {
    type GenerationConfig as GenerationConfig,
    type GenerationRequest as GenerationRequest,
    type InfillModel as InfillModel,
    type ModelSpeed as ModelSpeed,
    type MP3OutputFormat as MP3OutputFormat,
    type OutputFormatContainer as OutputFormatContainer,
    type RawEncoding as RawEncoding,
    type RawOutputFormat as RawOutputFormat,
    type TTSModel as TTSModel,
    type TTSSSEEvent as TTSSSEEvent,
    type VoiceSpecifier as VoiceSpecifier,
    type WAVOutputFormat as WAVOutputFormat,
    type WebsocketClientEvent as WebsocketClientEvent,
    type WebsocketResponse as WebsocketResponse,
    type TTSGenerateParams as TTSGenerateParams,
    type TTSGenerateSseParams as TTSGenerateSseParams,
    type TTSGenerateSSEParams as TTSGenerateSSEParams,
    type TTSInfillParams as TTSInfillParams,
    type PhonemeTimestamps as PhonemeTimestamps,
    type WordTimestamps as WordTimestamps,
  };
}
