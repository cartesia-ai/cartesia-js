/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { Embedding } from "../../embedding/types/Embedding";
import { SupportedLanguage } from "../../tts/types/SupportedLanguage";

export const CreateVoiceRequest: core.serialization.ObjectSchema<
    serializers.CreateVoiceRequest.Raw,
    Cartesia.CreateVoiceRequest
> = core.serialization.object({
    name: core.serialization.string(),
    description: core.serialization.string(),
    embedding: Embedding,
    language: SupportedLanguage.optional(),
});

export declare namespace CreateVoiceRequest {
    export interface Raw {
        name: string;
        description: string;
        embedding: Embedding.Raw;
        language?: SupportedLanguage.Raw | null;
    }
}
