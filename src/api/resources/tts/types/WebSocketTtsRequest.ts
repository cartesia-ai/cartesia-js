/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Cartesia from "../../../index";

export interface WebSocketTtsRequest {
    /** The ID of the model to use for the generation. See [Models](/build-with-sonic/models) for available models. */
    modelId: string;
    outputFormat?: Cartesia.OutputFormat;
    transcript?: string;
    voice: Cartesia.TtsRequestVoiceSpecifier;
    duration?: number;
    language?: string;
    addTimestamps?: boolean;
    contextId?: string;
}
