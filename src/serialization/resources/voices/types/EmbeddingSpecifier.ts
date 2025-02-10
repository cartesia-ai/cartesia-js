/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { Embedding } from "../../embedding/types/Embedding";
import { Weight } from "./Weight";

export const EmbeddingSpecifier: core.serialization.ObjectSchema<
    serializers.EmbeddingSpecifier.Raw,
    Cartesia.EmbeddingSpecifier
> = core.serialization.object({
    embedding: Embedding,
    weight: Weight,
});

export declare namespace EmbeddingSpecifier {
    export interface Raw {
        embedding: Embedding.Raw;
        weight: Weight.Raw;
    }
}
