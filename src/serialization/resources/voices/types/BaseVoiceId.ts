/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { VoiceId } from "./VoiceId";

export const BaseVoiceId: core.serialization.Schema<serializers.BaseVoiceId.Raw, Cartesia.BaseVoiceId> = VoiceId;

export declare namespace BaseVoiceId {
    export type Raw = VoiceId.Raw;
}
