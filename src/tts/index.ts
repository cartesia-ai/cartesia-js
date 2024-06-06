import { Client } from "../lib/client";
import type { WebSocketOptions } from "../types";
import WebSocket from "./websocket";

export default class TTS extends Client {
	/**
	 * Get a WebSocket client for streaming audio from the TTS API.
	 *
	 * @returns {WebSocket} A Cartesia WebSocket client.
	 */
	websocket(options: WebSocketOptions): WebSocket {
		return new WebSocket(options, {
			apiKey: this.apiKey,
			baseUrl: this.baseUrl,
		});
	}
}
