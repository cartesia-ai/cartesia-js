import base64 from "base64-js";
import type { Chunk, StreamEventData } from ".";
import { SAMPLE_RATE } from "../lib/constants";

/**
 * Get the duration of base64-encoded audio buffer(s) in seconds.
 *
 * @param b64 The base64-encoded audio buffer, or an array of base64-encoded
 * audio buffers.
 * @returns The duration of the buffer(s) in seconds.
 */
export function getBufferDuration(b64: Chunk[]) {
	const floats = base64ToArray(b64);
	return floats.length / SAMPLE_RATE;
}

/**
 * Convert base64-encoded audio buffer(s) to a Float32Array.
 *
 * @param b64 The base64-encoded audio buffer, or an array of base64-encoded
 * audio buffers.
 * @returns The audio buffer(s) as a Float32Array.
 */
export function base64ToArray(b64: Chunk[]): Float32Array {
	return filterSentinel(b64).reduce((acc, b) => {
		const floats = new Float32Array(base64.toByteArray(b).buffer);
		const newAcc = new Float32Array(acc.length + floats.length);
		newAcc.set(acc, 0);
		newAcc.set(floats, acc.length);
		return newAcc;
	}, new Float32Array(0));
}

/**
 * Schedule an audio buffer to play at a given time in the passed context.
 *
 * @param b64 The base64-encoded audio buffer to play.
 * @param context The audio context to play the buffer in.
 * @param maybeStartAt The time to start playing the buffer at, or null to play
 * immediately.
 * @param onEnded The callback to call when the buffer has finished playing.
 * @returns The duration of the buffer in seconds.
 */
export function playAudioBuffer(
	b64: Chunk[],
	context: AudioContext,
	maybeStartAt: number | null = null,
	onEnded: AudioScheduledSourceNode["onended"] = null,
) {
	const startAt = maybeStartAt ?? context.currentTime;

	const floats = base64ToArray(b64);
	const source = context.createBufferSource();
	const buffer = context.createBuffer(1, floats.length, SAMPLE_RATE);
	buffer.getChannelData(0).set(floats);
	source.buffer = buffer;
	source.connect(context.destination);
	source.start(startAt);
	source.onended = onEnded;

	return buffer.duration;
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
		chunk: Chunk;
		message: StreamEventData["message"];
	}) => void,
) {
	return (event: MessageEvent) => {
		const message = JSON.parse(event.data);
		if (message.context_id !== contextId) {
			return; // Ignore messages for other contexts.
		}
		let chunk: Chunk;
		if (message.done) {
			// Convert the done message to a sentinel value.
			chunk = getSentinel();
		} else {
			chunk = message.data;
		}
		handler({ chunk, message });
	};
}

export type Sentinel = null;

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
