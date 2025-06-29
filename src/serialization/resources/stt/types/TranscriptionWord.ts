/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const TranscriptionWord: core.serialization.ObjectSchema<
    serializers.TranscriptionWord.Raw,
    Cartesia.TranscriptionWord
> = core.serialization.object({
    word: core.serialization.string(),
    start: core.serialization.number(),
    end: core.serialization.number(),
});

export declare namespace TranscriptionWord {
    export interface Raw {
        word: string;
        start: number;
        end: number;
    }
}
