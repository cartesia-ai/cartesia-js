// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as InfillAPI from './infill';
import * as TTSAPI from './tts';
import * as VoicesAPI from './voices';

export class MyWebsocket extends APIResource {}

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

export declare namespace MyWebsocket {
  export { type WebsocketClientEvent as WebsocketClientEvent, type WebsocketResponse as WebsocketResponse };
}
