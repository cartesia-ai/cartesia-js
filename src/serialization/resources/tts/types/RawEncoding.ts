/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const RawEncoding: core.serialization.Schema<serializers.RawEncoding.Raw, Cartesia.RawEncoding> =
    core.serialization.enum_(["pcm_f32le", "pcm_s16le", "pcm_mulaw", "pcm_alaw"]);

export declare namespace RawEncoding {
    export type Raw = "pcm_f32le" | "pcm_s16le" | "pcm_mulaw" | "pcm_alaw";
}
