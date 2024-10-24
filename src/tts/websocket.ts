import Emittery from "emittery";
import { humanId } from "human-id";
import { WebSocket as PartySocketWebSocket } from "partysocket";
import { Client } from "../lib/client";
import { CARTESIA_VERSION, constructApiUrl } from "../lib/constants";
import type {
	ConnectionEventData,
	ContinueRequest,
	EmitteryCallbacks,
	StreamOptions,
	StreamRequest,
	WebSocketOptions,
	WordTimestamps,
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
	#container: string;
	#encoding: string;

	/**
	 * Create a new WebSocket client.
	 *
	 * @param args - Arguments to pass to the Client constructor.
	 */
	constructor(
		{ sampleRate, container, encoding }: WebSocketOptions,
		...args: ConstructorParameters<typeof Client>
	) {
		super(...args);

		this.#sampleRate = sampleRate;
		this.#container = container ?? "raw"; // Default to raw audio for backwards compatibility.
		this.#encoding = encoding ?? "pcm_f32le"; // Default to 32-bit floating point PCM for backwards compatibility.
	}

	/**
	 * Send a message over the WebSocket to start a stream.
	 *
	 * @param inputs - Generation parameters. Defined in the StreamRequest type.
	 * @param options - Options for the stream.
	 * @param options.timeout - The maximum time to wait for a chunk before cancelling the stream.
	 *                          If set to `0`, the stream will not time out.
	 * @returns A Source object that can be passed to a Player to play the audio.
	 * @returns An Emittery instance that emits messages from the WebSocket.
	 * @returns An abort function that can be called to cancel the stream.
	 */
	send(inputs: StreamRequest, { timeout = 0 }: StreamOptions = {}) {
		if (!this.#isConnected) {
			throw new Error("Not connected to WebSocket. Call .connect() first.");
		}

		if (!inputs.context_id) {
			inputs.context_id = this.#generateId();
		}
		if (!inputs.output_format) {
			inputs.output_format = {
				container: this.#container,
				encoding: this.#encoding,
				sample_rate: this.#sampleRate,
			};
		}

		// Send audio request.
		this.socket?.send(
			JSON.stringify({
				...inputs,
			}),
		);

		const emitter = new Emittery<{
			message: string;
			timestamps: WordTimestamps;
		}>();
		const source = new Source({
			sampleRate: this.#sampleRate,
			encoding: this.#encoding,
			container: this.#container,
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
			inputs.context_id,
			async ({ chunk, message, data }) => {
				emitter.emit("message", message);
				if (data.type === "timestamps") {
					emitter.emit("timestamps", data.word_timestamps);
					return;
				}
				if (isSentinel(chunk)) {
					await source.close();
					streamCompleteController.abort();
					return;
				}
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = setTimeout(streamCompleteController.abort, timeout);
				}
				if (!chunk) {
					return;
				}
				await source.enqueue(base64ToArray([chunk], this.#encoding));
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

		return {
			source,
			...getEmitteryCallbacks(emitter),
			stop: streamCompleteController.abort.bind(streamCompleteController),
		};
	}

	/**
	 * Continue a stream.
	 *
	 * @param inputs - Generation parameters. Defined in the StreamRequest type, but must include a `context_id` field. `continue` is set to true by default.
	 */
	continue(inputs: ContinueRequest) {
		if (!this.#isConnected) {
			throw new Error("Not connected to WebSocket. Call .connect() first.");
		}

		if (!inputs.context_id) {
			throw new Error("context_id is required to continue a context.");
		}
		if (!inputs.output_format) {
			inputs.output_format = {
				container: this.#container,
				encoding: this.#encoding,
				sample_rate: this.#sampleRate,
			};
		}

		// Send continue request.
		this.socket?.send(
			JSON.stringify({
				continue: true,
				...inputs,
			}),
		);
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
	async connect() {
		const emitter = new Emittery<ConnectionEventData>();
		this.socket = new PartySocketWebSocket(async () => {
			const url = constructApiUrl(this.baseUrl, "/tts/websocket", {
				websocket: true,
			});
			url.searchParams.set("api_key", await this.apiKey());
			url.searchParams.set("cartesia_version", CARTESIA_VERSION);
			return url.toString();
		});
		this.socket.binaryType = "arraybuffer";

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
