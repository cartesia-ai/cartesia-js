import { Tts } from "../api/resources/tts/client/Client";
import Websocket from "./Websocket";

export class StreamingTTSClient extends Tts {
    constructor(options: Tts.Options = {}) {
        super(options);
    }

    /**
     * Get a WebSocket client for streaming TTS.
     *
     * @param options - Options for the WebSocket client.
     * @returns A WebSocket client configured for streaming TTS.
     */
    websocket({
        sampleRate,
        container,
        encoding,
    }: {
        sampleRate: number;
        container?: string;
        encoding?: string;
    }): Websocket {
        return new Websocket({ sampleRate, container, encoding }, { cartesiaVersion: "2025-04-16", ...this._options });
    }
}
