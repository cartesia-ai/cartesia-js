/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { Speed } from "./Speed";
import { Emotion } from "./Emotion";

export const Controls: core.serialization.ObjectSchema<serializers.Controls.Raw, Cartesia.Controls> =
    core.serialization.object({
        speed: Speed,
        emotion: core.serialization.list(Emotion),
    });

export declare namespace Controls {
    export interface Raw {
        speed: Speed.Raw;
        emotion: Emotion.Raw[];
    }
}
