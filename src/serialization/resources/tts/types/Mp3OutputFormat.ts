/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const Mp3OutputFormat: core.serialization.ObjectSchema<
    serializers.Mp3OutputFormat.Raw,
    Cartesia.Mp3OutputFormat
> = core.serialization.object({
    sampleRate: core.serialization.property("sample_rate", core.serialization.number()),
    bitRate: core.serialization.property("bit_rate", core.serialization.number()),
});

export declare namespace Mp3OutputFormat {
    export interface Raw {
        sample_rate: number;
        bit_rate: number;
    }
}
