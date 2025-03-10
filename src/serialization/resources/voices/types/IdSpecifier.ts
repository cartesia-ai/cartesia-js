/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { VoiceId } from "./VoiceId";
import { Weight } from "./Weight";

export const IdSpecifier: core.serialization.ObjectSchema<serializers.IdSpecifier.Raw, Cartesia.IdSpecifier> =
    core.serialization.object({
        id: VoiceId,
        weight: Weight,
    });

export declare namespace IdSpecifier {
    export interface Raw {
        id: VoiceId.Raw;
        weight: Weight.Raw;
    }
}
