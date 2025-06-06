/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const TokenGrant: core.serialization.ObjectSchema<serializers.TokenGrant.Raw, Cartesia.TokenGrant> =
    core.serialization.object({
        tts: core.serialization.boolean(),
    });

export declare namespace TokenGrant {
    export interface Raw {
        tts: boolean;
    }
}
