import Emittery from "emittery";
import { humanId } from "human-id";
import { WebSocket } from "partysocket";
import { Client } from "../lib/client";
import { SAMPLE_RATE, constructWebsocketUrl } from "../lib/constants";
import {
	type EmitteryCallbacks,
	type Sentinel,
	createMessageHandlerForContextId,
	getBufferDuration,
	getEmitteryCallbacks,
	isComplete,
	isSentinel,
	playAudioBuffer,
} from "./utils";

export type Chunk = string | Sentinel;
export type StreamEventData = {
	chunk: {
		chunk: Chunk;
		chunks: Chunk[];
	};
	streamed: {
		chunks: Chunk[];
	};
	message: unknown;
	buffering: never;
	buffered: never;
	scheduled: {
		playbackEndsIn: number;
	};
};
export type ConnectionEventData = {
	open: never;
	close: never;
};
export type StreamRequest = {
	inputs: object;
	options: {
		timeout?: number;
	};
};

export default class extends Client {
	socket?: WebSocket;
	isConnected = false;

	/**
	 * Stream audio from a model.
	 *
	 * @param inputs - Stream options. Includes a `model` key and some `parameters`, which
	 * are model-specific and can be found in the model's documentation.
	 * @param options - Options for the stream.
	 * @param options.timeout - The maximum time to wait for a chunk before cancelling the stream.
	 * If `0`, the stream will not time out.
	 * @returns An object with a method `play` of type `(bufferDuration: number) => Promise<void>`
	 * that plays the audio as it arrives, with `bufferDuration` seconds of audio buffered before
	 * starting playback.
	 */
	stream(
		inputs: StreamRequest["inputs"],
		{ timeout = 0 }: StreamRequest["options"] = {},
	) {
		if (!this.isConnected) {
			throw new Error("Not connected to WebSocket. Call .connect() first.");
		}

		// Send audio request.
		const contextId = this.generateId();
		this.socket?.send(
			JSON.stringify({
				data: inputs,
				context_id: contextId,
			}),
		);

		// Used to signal that the stream is complete, either because the
		// WebSocket has closed, or because the stream has finished.
		const streamCompleteController = new AbortController();
		// Set a timeout.
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		if (timeout > 0) {
			timeoutId = setTimeout(streamCompleteController.abort, timeout);
		}
		// Array of base64-encoded audio chunks, representing directly sampled
		// audio data, i.e. floats in the range [-1, 1].
		const chunks: Chunk[] = [];
		// Used to dispatch events.
		const emitter = new Emittery<StreamEventData>();
		const handleMessage = createMessageHandlerForContextId(
			contextId,
			async ({ chunk, message }) => {
				chunks.push(chunk);
				await emitter.emit("chunk", {
					chunk,
					chunks,
				});
				await emitter.emit("message", message);
				if (isSentinel(chunk)) {
					await emitter.emit("streamed", {
						chunks,
					});
					streamCompleteController.abort();
				} else if (timeoutId) {
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
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			emitter.clearListeners();
		});

		const play = async ({ bufferDuration }: { bufferDuration: number }) => {
			const context = new AudioContext({
				sampleRate: SAMPLE_RATE,
			});

			let startNextPlaybackAt = 0;
			const playLatestChunk = (chunk: Chunk) => {
				if (isSentinel(chunk)) {
					return true; // Indicates that playback has finished.
				}
				startNextPlaybackAt =
					playAudioBuffer([chunk], context, startNextPlaybackAt) +
					Math.max(context.currentTime, startNextPlaybackAt);
				return false; // Indicates that playback has not finished.
			};

			const playChunks = (chunks: Chunk[]) => {
				startNextPlaybackAt += playAudioBuffer(
					chunks,
					context,
					startNextPlaybackAt,
				);

				if (isComplete(chunks)) {
					return;
				}
			};

			// tryStart tries to start playback if the buffer duration is
			// already satisfied or if all the chunks have arrived. If it is
			// not, it returns false, indicating that the caller should call
			// it again when more chunks arrive.
			const tryStart = async (chunks: Chunk[]) => {
				startNextPlaybackAt = context.currentTime;

				if (isComplete(chunks) || streamCompleteController.signal.aborted) {
					playChunks(chunks);
					return true; // Done playing.
				}

				if (getBufferDuration(chunks) > bufferDuration) {
					emitter.emit("buffered");
					// Play the initial chunks that we already have.
					playChunks(chunks);
					// If the stream is not complete, play new chunks as they
					// arrive.
					for await (const { chunk } of emitter.events("chunk")) {
						if (playLatestChunk(chunk)) {
							break;
						}
					}
					return true; // Done playing.
				}
				emitter.emit("buffering");
				return false; // Need to buffer more audio.
			};

			if (!(await tryStart(chunks))) {
				for await (const { chunks } of emitter.events("chunk")) {
					if (await tryStart(chunks)) {
						const playbackEndsIn =
							Math.max(0, startNextPlaybackAt - context.currentTime) * 1000;
						emitter.emit("scheduled", { playbackEndsIn });
						break;
					}
				}
			} else {
				const playbackEndsIn =
					Math.max(0, startNextPlaybackAt - context.currentTime) * 1000;
				emitter.emit("scheduled", { playbackEndsIn });
			}
		};

		return {
			play,
			...getEmitteryCallbacks(emitter),
		};
	}

	/**
	 * Generate a unique ID suitable for a streaming context.
	 *
	 * Not suitable for security purposes or as a primary key, since
	 * it lacks the amount of entropy required for those use cases.
	 *
	 * @returns A unique ID.
	 */
	generateId() {
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
		const url = constructWebsocketUrl(this.baseUrl);
		url.searchParams.set("api_key", this.apiKey);
		const emitter = new Emittery<ConnectionEventData>();
		this.socket = new WebSocket(url.toString());
		this.socket.onopen = () => {
			this.isConnected = true;
			emitter.emit("open");
		};
		this.socket.onclose = () => {
			this.isConnected = false;
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
