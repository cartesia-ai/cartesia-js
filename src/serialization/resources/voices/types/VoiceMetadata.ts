/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { VoiceId } from "./VoiceId";
import { SupportedLanguage } from "../../tts/types/SupportedLanguage";

export const VoiceMetadata: core.serialization.ObjectSchema<serializers.VoiceMetadata.Raw, Cartesia.VoiceMetadata> =
    core.serialization.object({
        id: VoiceId,
        userId: core.serialization.property("user_id", core.serialization.string()),
        isPublic: core.serialization.property("is_public", core.serialization.boolean()),
        name: core.serialization.string(),
        description: core.serialization.string(),
        createdAt: core.serialization.property("created_at", core.serialization.date()),
        language: SupportedLanguage,
    });

export declare namespace VoiceMetadata {
    interface Raw {
        id: VoiceId.Raw;
        user_id: string;
        is_public: boolean;
        name: string;
        description: string;
        created_at: string;
        language: SupportedLanguage.Raw;
    }
}