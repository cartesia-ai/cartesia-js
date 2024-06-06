import Emittery from "emittery";
import { humanId } from "human-id";
import { WebSocket as PartySocketWebSocket } from "partysocket";
import { Client } from "../lib/client";
import { constructApiUrl } from "../lib/constants";
import type {
	ConnectionEventData,
	EmitteryCallbacks,
	StreamRequest,
	WebSocketOptions,
} from "../types";
import Source from "./source";
import {
	base64ToArray,
	createMessageHandlerForContextId,
	getEmitteryCallbacks,
	isSentinel,
} from "./utils";

export default class WebSocket extends Client {
	socket?: PartySocketWebSocket;
	#isConnected = false;
	#sampleRate: number;

	/**
	 * Create a new WebSocket client.
	 *
	 * @param args - Arguments to pass to the Client constructor.
	 */
	constructor(
		{ sampleRate }: WebSocketOptions,
		...args: ConstructorParameters<typeof Client>
	) {
		super(...args);

		this.#sampleRate = sampleRate;
	}

	/**
	 * Send a message over the WebSocket in order to start a stream.
	 *
	 * @param inputs - Stream options.
	 * @param options - Options for the stream.
	 * @param options.timeout - The maximum time to wait for a chunk before cancelling the stream.
	 * If `0`, the stream will not time out.
	 * @returns A Source object that can be passed to a Player to play the audio.
	 */
	send(
		inputs: StreamRequest["inputs"],
		{ timeout = 0 }: StreamRequest["options"] = {},
	) {
		if (!this.#isConnected) {
			throw new Error("Not connected to WebSocket. Call .connect() first.");
		}

		// Send audio request.
		const contextId = this.#generateId();
		this.socket?.send(
			JSON.stringify({
				context_id: contextId,
				...inputs,
				output_format: {
					container: "raw",
					encoding: "pcm_f32le",
					sample_rate: this.#sampleRate,
				},
			}),
		);

		const emitter = new Emittery<{
			message: string;
		}>();
		const source = new Source({
			sampleRate: this.#sampleRate,
		});
		// Used to signal that the stream is complete, either because the
		// WebSocket has closed, or because the stream has finished.
		const streamCompleteController = new AbortController();
		// Set a timeout.
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		if (timeout > 0) {
			timeoutId = setTimeout(streamCompleteController.abort, timeout);
		}
		const handleMessage = createMessageHandlerForContextId(
			contextId,
			async ({ chunk, message }) => {
				emitter.emit("message", message);
				if (isSentinel(chunk)) {
					await source.close();
					streamCompleteController.abort();
					return;
				}
				await source.enqueue(base64ToArray([chunk]));
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = setTimeout(streamCompleteController.abort, timeout);
				}
			},
		);
		this.socket?.addEventListener("message", handleMessage, {
			signal: streamCompleteController.signal,
		});
		this.socket?.addEventListener(
			"close",
			() => {
				streamCompleteController.abort();
			},
			{
				once: true,
			},
		);
		this.socket?.addEventListener(
			"error",
			() => {
				streamCompleteController.abort();
			},
			{
				once: true,
			},
		);
		streamCompleteController.signal.addEventListener("abort", () => {
			source.close();
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		});

		return { source, ...getEmitteryCallbacks(emitter) };
	}

	/**
	 * Generate a unique ID suitable for a streaming context.
	 *
	 * Not suitable for security purposes or as a primary key, since
	 * it lacks the amount of entropy required for those use cases.
	 *
	 * @returns A unique ID.
	 */
	#generateId() {
		return humanId({
			separator: "-",
			capitalize: false,
		});
	}

	/**
	 * Authenticate and connect to a Cartesia streaming WebSocket.
	 *
	 * @returns A promise that resolves when the WebSocket is connected.
	 * @throws {Error} If the WebSocket fails to connect.
	 */
	connect() {
		const url = constructApiUrl(this.baseUrl, "/tts/websocket", "ws");
		url.searchParams.set("api_key", this.apiKey);
		const emitter = new Emittery<ConnectionEventData>();
		this.socket = new PartySocketWebSocket(url.toString());
		this.socket.onopen = () => {
			this.#isConnected = true;
			emitter.emit("open");
		};
		this.socket.onclose = () => {
			this.#isConnected = false;
			emitter.emit("close");
		};

		return new Promise<EmitteryCallbacks<ConnectionEventData>>(
			(resolve, reject) => {
				this.socket?.addEventListener(
					"open",
					() => {
						resolve(getEmitteryCallbacks(emitter));
					},
					{
						once: true,
					},
				);

				const aborter = new AbortController();
				this.socket?.addEventListener(
					"error",
					() => {
						aborter.abort();
						reject(new Error("WebSocket failed to connect."));
					},
					{
						signal: aborter.signal,
					},
				);

				this.socket?.addEventListener(
					"close",
					() => {
						aborter.abort();
						reject(new Error("WebSocket closed before it could connect."));
					},
					{
						signal: aborter.signal,
					},
				);
			},
		);
	}

	/**
	 * Disconnect from the Cartesia streaming WebSocket.
	 */
	disconnect() {
		this.socket?.close();
	}
}
