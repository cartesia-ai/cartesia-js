/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { DatasetFile } from "./DatasetFile";

export const PaginatedDatasetFiles: core.serialization.ObjectSchema<
    serializers.PaginatedDatasetFiles.Raw,
    Cartesia.PaginatedDatasetFiles
> = core.serialization.object({
    data: core.serialization.list(DatasetFile),
    hasMore: core.serialization.property("has_more", core.serialization.boolean()),
});

export declare namespace PaginatedDatasetFiles {
    export interface Raw {
        data: DatasetFile.Raw[];
        has_more: boolean;
    }
}
