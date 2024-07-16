import base64 from "base64-js";
import type Emittery from "emittery";
import type {
	Chunk,
	EmitteryCallbacks,
	Encoding,
	Sentinel,
	TypedArray,
	WebSocketResponse,
} from "../types";
import { ENCODING_MAP } from "./source";

/**
 * Convert base64-encoded audio buffer(s) to a TypedArray.
 *
 * @param b64 The base64-encoded audio buffer, or an array of base64-encoded
 * audio buffers.
 * @param encoding The encoding of the audio buffer(s).
 * @returns The audio buffer(s) as a TypedArray.
 */
export function base64ToArray(b64: Chunk[], encoding: string): TypedArray {
	const byteArrays = filterSentinel(b64).map((b) => base64.toByteArray(b));

	const { arrayType: ArrayType, bytesPerElement } =
		ENCODING_MAP[encoding as Encoding];

	const totalLength = byteArrays.reduce(
		(acc, arr) => acc + arr.length / bytesPerElement,
		0,
	);
	const result = new ArrayType(totalLength);

	let offset = 0;
	for (const arr of byteArrays) {
		const floats = new ArrayType(arr.buffer);
		result.set(floats, offset);
		offset += floats.length;
	}

	return result;
}

/**
 * Schedule an audio buffer to play at a given time in the passed context.
 *
 * @param floats The audio buffer to play.
 * @param context The audio context to play the buffer in.
 * @param startAt The time to start playing the buffer at.
 * @param sampleRate The sample rate of the audio.
 * @returns A promise that resolves when the audio has finished playing.
 */
export function playAudioBuffer(
	floats: Float32Array,
	context: AudioContext,
	startAt: number,
	sampleRate: number,
) {
	const source = context.createBufferSource();
	const buffer = context.createBuffer(1, floats.length, sampleRate);
	buffer.getChannelData(0).set(floats);
	source.buffer = buffer;
	source.connect(context.destination);
	source.start(startAt);

	return new Promise<void>((resolve) => {
		source.onended = () => {
			resolve();
		};
	});
}

/**
 * Unwraps a chunk of audio data from a message event and calls the
 * handler with it if the context ID matches.
 *
 * @param contextId The context ID to listen for.
 * @param handler The handler to call with the chunk of audio data.
 * @returns A message event handler.
 */
export function createMessageHandlerForContextId(
	contextId: string,
	handler: ({
		chunk,
		message,
	}: {
		chunk?: Chunk;
		message: string;
		data: WebSocketResponse;
	}) => void,
) {
	return (event: MessageEvent) => {
		if (typeof event.data !== "string") {
			return; // Ignore non-string messages.
		}
		const message: WebSocketResponse = JSON.parse(event.data);
		if (message.context_id !== contextId) {
			return; // Ignore messages for other contexts.
		}
		let chunk: Chunk | undefined;
		if (message.done) {
			// Convert the done message to a sentinel value.
			chunk = getSentinel();
		} else if (message.type === "chunk") {
			chunk = message.data;
		}
		handler({ chunk, message: event.data, data: message });
	};
}

/**
 * Get a sentinel value that indicates the end of a stream.
 * @returns A sentinel value to indicate the end of a stream.
 */
export function getSentinel(): Sentinel {
	return null;
}

/**
 * Check if a chunk is a sentinel value (i.e. null).
 *
 * @param chunk
 * @returns Whether the chunk is a sentinel value.
 */
export function isSentinel(x: unknown): x is Sentinel {
	return x === getSentinel();
}

/**
 * Filter out null values from a collection.
 *
 * @param collection The collection to filter.
 * @returns The collection with null values removed.
 */
export function filterSentinel<T>(collection: T[]): Exclude<T, Sentinel>[] {
	return collection.filter(
		(x): x is Exclude<T, ReturnType<typeof getSentinel>> => !isSentinel(x),
	);
}

/**
 * Check if an array of chunks is complete by testing if the last chunk is a sentinel
 * value (i.e. null).
 * @param chunk
 * @returns Whether the array of chunks is complete.
 */
export function isComplete(chunks: Chunk[]) {
	return isSentinel(chunks[chunks.length - 1]);
}

/**
 * Get user-facing emitter callbacks for an Emittery instance.
 * @param emitter The Emittery instance to get callbacks for.
 * @returns User-facing emitter callbacks.
 */
export function getEmitteryCallbacks<T>(
	emitter: Emittery<T>,
): EmitteryCallbacks<T> {
	return {
		on: emitter.on.bind(emitter),
		off: emitter.off.bind(emitter),
		once: emitter.once.bind(emitter),
		events: emitter.events.bind(emitter),
	};
}
