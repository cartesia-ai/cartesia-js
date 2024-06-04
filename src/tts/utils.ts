import base64 from "base64-js";
import type Emittery from "emittery";
import { SAMPLE_RATE } from "../lib/constants";
import type {
	Chunk,
	EmitteryCallbacks,
	Sentinel,
	StreamEventData,
} from "../types";

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

/**
 * Converts a base64-encoded audio buffer to a WAV file.
 * Source: https://gist.github.com/Daninet/22edc59cf2aee0b9a90c18e553e49297
 * @param b64 The base64-encoded audio buffer to convert to a WAV file.
 */
export function bufferToWav(
	sampleRate: number,
	channelBuffers: Float32Array[],
) {
	const totalSamples = channelBuffers[0].length * channelBuffers.length;

	const buffer = new ArrayBuffer(44 + totalSamples * 2);
	const view = new DataView(buffer);

	const writeString = (view: DataView, offset: number, string: string) => {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	};

	/* RIFF identifier */
	writeString(view, 0, "RIFF");
	/* RIFF chunk length */
	view.setUint32(4, 36 + totalSamples * 2, true);
	/* RIFF type */
	writeString(view, 8, "WAVE");
	/* format chunk identifier */
	writeString(view, 12, "fmt ");
	/* format chunk length */
	view.setUint32(16, 16, true);
	/* sample format (raw) */
	view.setUint16(20, 1, true);
	/* channel count */
	view.setUint16(22, channelBuffers.length, true);
	/* sample rate */
	view.setUint32(24, sampleRate, true);
	/* byte rate (sample rate * block align) */
	view.setUint32(28, sampleRate * 4, true);
	/* block align (channel count * bytes per sample) */
	view.setUint16(32, channelBuffers.length * 2, true);
	/* bits per sample */
	view.setUint16(34, 16, true);
	/* data chunk identifier */
	writeString(view, 36, "data");
	/* data chunk length */
	view.setUint32(40, totalSamples * 2, true);

	let offset = 44;
	for (let i = 0; i < channelBuffers[0].length; i++) {
		for (let channel = 0; channel < channelBuffers.length; channel++) {
			const s = Math.max(-1, Math.min(1, channelBuffers[channel][i]));
			view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
			offset += 2;
		}
	}

	return buffer;
}
