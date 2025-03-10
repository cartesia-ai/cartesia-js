/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { MixVoiceSpecifier } from "./MixVoiceSpecifier";

export const MixVoicesRequest: core.serialization.ObjectSchema<
    serializers.MixVoicesRequest.Raw,
    Cartesia.MixVoicesRequest
> = core.serialization.object({
    voices: core.serialization.list(MixVoiceSpecifier),
});

export declare namespace MixVoicesRequest {
    export interface Raw {
        voices: MixVoiceSpecifier.Raw[];
    }
}
