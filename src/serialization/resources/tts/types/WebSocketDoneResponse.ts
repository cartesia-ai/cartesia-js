/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as Cartesia from "../../../../api/index";
import * as core from "../../../../core";
import { WebSocketBaseResponse } from "./WebSocketBaseResponse";

export const WebSocketDoneResponse: core.serialization.ObjectSchema<
    serializers.WebSocketDoneResponse.Raw,
    Cartesia.WebSocketDoneResponse
> = core.serialization.object({}).extend(WebSocketBaseResponse);

export declare namespace WebSocketDoneResponse {
    interface Raw extends WebSocketBaseResponse.Raw {}
}