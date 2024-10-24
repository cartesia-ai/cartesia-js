import { Client } from "../lib/client";
import type { BytesRequest, WebSocketOptions } from "../types";
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

	/**
	 * Generate audio bytes from text.
	 *
	 * @param options - The options for the request.
	 * @returns {Promise<ArrayBuffer>} A promise that resolves to an ArrayBuffer containing the audio bytes.
	 */
	async bytes(options: BytesRequest): Promise<ArrayBuffer> {
		const response = await this._fetch("/tts/bytes", {
			method: "POST",
			body: JSON.stringify(options),
		});

		return response.arrayBuffer();
	}
}
