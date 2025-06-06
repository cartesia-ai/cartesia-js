/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { Voice } from "../types/Voice";

export const Response: core.serialization.Schema<serializers.voices.list.Response.Raw, Cartesia.Voice[]> =
    core.serialization.list(Voice);

export declare namespace Response {
    export type Raw = Voice.Raw[];
}
