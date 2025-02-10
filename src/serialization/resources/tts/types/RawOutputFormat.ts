/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { RawEncoding } from "./RawEncoding";

export const RawOutputFormat: core.serialization.ObjectSchema<
    serializers.RawOutputFormat.Raw,
    Cartesia.RawOutputFormat
> = core.serialization.object({
    encoding: RawEncoding,
    sampleRate: core.serialization.property("sample_rate", core.serialization.number()),
    bitRate: core.serialization.property("bit_rate", core.serialization.number().optional()),
});

export declare namespace RawOutputFormat {
    export interface Raw {
        encoding: RawEncoding.Raw;
        sample_rate: number;
        bit_rate?: number | null;
    }
}
