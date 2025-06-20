/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const TranscriptMessage: core.serialization.ObjectSchema<
    serializers.TranscriptMessage.Raw,
    Cartesia.TranscriptMessage
> = core.serialization.object({
    requestId: core.serialization.property("request_id", core.serialization.string()),
    text: core.serialization.string(),
    isFinal: core.serialization.property("is_final", core.serialization.boolean()),
    duration: core.serialization.number().optional(),
    language: core.serialization.string().optional(),
});

export declare namespace TranscriptMessage {
    export interface Raw {
        request_id: string;
        text: string;
        is_final: boolean;
        duration?: number | null;
        language?: string | null;
    }
}
