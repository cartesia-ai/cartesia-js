/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Cartesia from "../../../index";

export interface WebSocketFlushDoneResponse extends Cartesia.WebSocketBaseResponse {
    flushId: Cartesia.FlushId;
    flushDone: boolean;
}
