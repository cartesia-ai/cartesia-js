/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Cartesia from "../../../index";

export interface GenerationRequest {
    /** The ID of the model to use for the generation. See [Models](/build-with-cartesia/models) for available models. */
    modelId: string;
    /** The transcript to generate speech for. This can be a string or an iterator over strings. */
    transcript?: unknown;
    voice: Cartesia.TtsRequestVoiceSpecifier;
    language?: Cartesia.SupportedLanguage;
    outputFormat: Cartesia.WebSocketRawOutputFormat;
    /**
     * The maximum duration of the audio in seconds. You do not usually need to specify this.
     * If the duration is not appropriate for the length of the transcript, the output audio may be truncated.
     */
    duration?: number;
    speed?: Cartesia.ModelSpeed;
    contextId?: Cartesia.ContextId;
    /**
     * Whether this input may be followed by more inputs.
     * If not specified, this defaults to `false`.
     */
    continue?: boolean;
    /**
     * The maximum time in milliseconds to buffer text before starting generation. Values between [0, 1000]ms are supported. Defaults to 0 (no buffering).
     *
     * When set, the model will buffer incoming text chunks until it's confident it has enough context to generate high-quality speech, or the buffer delay elapses, whichever comes first. Without this option set, the model will kick off generations immediately, ceding control of buffering to the user.
     *
     * Use this to balance responsiveness with higher quality speech generation, which often benefits from having more context.
     */
    maxBufferDelayMs?: number;
    /** Whether to flush the context. */
    flush?: boolean;
    /** Whether to return word-level timestamps. */
    addTimestamps?: boolean;
    /** Whether to return phoneme-level timestamps. */
    addPhonemeTimestamps?: boolean;
    /** Whether to use the original transcript for timestamps. */
    useOriginalTimestamps?: boolean;
}
