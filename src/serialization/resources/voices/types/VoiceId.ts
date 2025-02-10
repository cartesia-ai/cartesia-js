/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const VoiceId: core.serialization.Schema<serializers.VoiceId.Raw, Cartesia.VoiceId> =
    core.serialization.string();

export declare namespace VoiceId {
    export type Raw = string;
}
