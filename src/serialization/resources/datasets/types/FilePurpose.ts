/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";

export const FilePurpose: core.serialization.Schema<serializers.FilePurpose.Raw, Cartesia.FilePurpose> =
    core.serialization.enum_(["fine_tune"]);

export declare namespace FilePurpose {
    type Raw = "fine_tune";
}