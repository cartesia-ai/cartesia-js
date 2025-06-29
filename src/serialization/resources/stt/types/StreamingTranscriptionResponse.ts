/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { TranscriptMessage } from "./TranscriptMessage";
import { FlushDoneMessage } from "./FlushDoneMessage";
import { DoneMessage } from "./DoneMessage";
import { ErrorMessage } from "./ErrorMessage";

export const StreamingTranscriptionResponse: core.serialization.Schema<
    serializers.StreamingTranscriptionResponse.Raw,
    Cartesia.StreamingTranscriptionResponse
> = core.serialization
    .union("type", {
        transcript: TranscriptMessage,
        flush_done: FlushDoneMessage,
        done: DoneMessage,
        error: ErrorMessage,
    })
    .transform<Cartesia.StreamingTranscriptionResponse>({
        transform: (value) => value,
        untransform: (value) => value,
    });

export declare namespace StreamingTranscriptionResponse {
    export type Raw =
        | StreamingTranscriptionResponse.Transcript
        | StreamingTranscriptionResponse.FlushDone
        | StreamingTranscriptionResponse.Done
        | StreamingTranscriptionResponse.Error;

    export interface Transcript extends TranscriptMessage.Raw {
        type: "transcript";
    }

    export interface FlushDone extends FlushDoneMessage.Raw {
        type: "flush_done";
    }

    export interface Done extends DoneMessage.Raw {
        type: "done";
    }

    export interface Error extends ErrorMessage.Raw {
        type: "error";
    }
}
