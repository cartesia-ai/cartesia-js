import { Stt } from "../api/resources/stt/client/Client";
import SttWebsocket, { SttWebSocketOptions } from "./SttWebsocket";

export class StreamingSTTClient extends Stt {
    constructor(options: Stt.Options = {}) {
        super(options);
    }

    websocket(options: SttWebSocketOptions = {}): SttWebsocket {
        return new SttWebsocket(options, { cartesiaVersion: "2024-06-10", ...this._options });
    }
}
