/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Cartesia from "../../../index";

export interface TtsRequestEmbeddingSpecifier {
    mode: "embedding";
    embedding: Cartesia.Embedding;
    experimentalControls?: Cartesia.Controls;
}