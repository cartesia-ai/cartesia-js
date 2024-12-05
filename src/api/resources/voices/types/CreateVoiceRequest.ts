/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Cartesia from "../../../index";

export interface CreateVoiceRequest {
    /** The name of the voice. */
    name: string;
    /** The description of the voice. */
    description: string;
    embedding: Cartesia.Embedding;
    language?: Cartesia.SupportedLanguage;
    baseVoiceId?: Cartesia.BaseVoiceId;
}