import base64 from "base64-js";
import type Emittery from "emittery";
import type { OutputFormat, RawEncoding, WebSocketResponse, WebSocketTtsRequest } from "../api";

export type EmitteryCallbacks<T> = {
    on: Emittery<T>["on"];
    off: Emittery<T>["off"];
    once: Emittery<T>["once"];
    events: Emittery<T>["events"];
};

export type ConnectionEventData = {
    open: never;
    close: never;
};

export type SourceEventData = {
    enqueue: never;
    close: never;
    wait: never;
    read: never;
};

export type TypedArray = Float32Array | Int16Array | Uint8Array;

export type Sentinel = null;

export type Chunk = string | Sentinel;

export type WebSocketOptions = {
    container?: string;
    encoding?: string;
    sampleRate: number;
};

export type Language = "en" | "es" | "fr" | "de" | "ja" | "zh" | "pt" | (string & {});

export type EncodingInfo = {
    arrayType: Float32ArrayConstructor | Int16ArrayConstructor | Uint8ArrayConstructor;
    bytesPerElement: number;
};

export const ENCODING_MAP: Record<RawEncoding, EncodingInfo> = {
    pcm_f32le: { arrayType: Float32Array, bytesPerElement: 4 },
    pcm_s16le: { arrayType: Int16Array, bytesPerElement: 2 },
    pcm_alaw: { arrayType: Uint8Array, bytesPerElement: 1 },
    pcm_mulaw: { arrayType: Uint8Array, bytesPerElement: 1 },
};

/**
 * Resolve the output format for a WebSocket request.
 *
 * @param container - The container type for the output.
 * @param encoding - The encoding of the audio.
 * @param sampleRate - The sample rate of the audio.
 * @returns The output format for the WebSocket request.
 */
export function resolveOutputFormat(
    container: "raw" | "wav" | "mp3",
    encoding: RawEncoding,
    sampleRate: number
): OutputFormat {
    switch (container) {
        case "wav":
            return {
                container: "wav",
                encoding,
                sampleRate,
            } as OutputFormat.Wav;
        case "raw":
            return {
                container: "raw",
                encoding,
                sampleRate,
            } as OutputFormat.Raw;
        case "mp3":
            return {
                container: "mp3",
                encoding,
                sampleRate,
                bitRate: 128,
            } as OutputFormat.Mp3;
        default:
            throw new Error(`Unsupported container type: ${container}`);
    }
}

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

    const { arrayType: ArrayType, bytesPerElement } = ENCODING_MAP[encoding as RawEncoding];

    const totalLength = byteArrays.reduce((acc, arr) => acc + arr.length / bytesPerElement, 0);
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
export function playAudioBuffer(floats: Float32Array, context: AudioContext, startAt: number, sampleRate: number) {
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
    handler: ({ chunk, message }: { chunk?: Chunk; message: string; data: WebSocketResponse }) => void
) {
    return (event: MessageEvent) => {
        if (typeof event.data !== "string") {
            return; // Ignore non-string messages.
        }
        const message = JSON.parse(event.data);
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
    return collection.filter((x): x is Exclude<T, ReturnType<typeof getSentinel>> => !isSentinel(x));
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
export function getEmitteryCallbacks<T>(emitter: Emittery<T>): EmitteryCallbacks<T> {
    return {
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        once: emitter.once.bind(emitter),
        events: emitter.events.bind(emitter),
    };
}
