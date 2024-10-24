import Emittery from "emittery";
import type { Encoding, SourceEventData, TypedArray } from "../types";

type EncodingInfo = {
	arrayType:
		| Float32ArrayConstructor
		| Int16ArrayConstructor
		| Uint8ArrayConstructor;
	bytesPerElement: number;
};

export const ENCODING_MAP: Record<Encoding, EncodingInfo> = {
	pcm_f32le: { arrayType: Float32Array, bytesPerElement: 4 },
	pcm_s16le: { arrayType: Int16Array, bytesPerElement: 2 },
	pcm_alaw: { arrayType: Uint8Array, bytesPerElement: 1 },
	pcm_mulaw: { arrayType: Uint8Array, bytesPerElement: 1 },
};

export default class Source {
	#emitter = new Emittery<SourceEventData>();
	#buffer: TypedArray;
	#readIndex = 0;
	#writeIndex = 0;
	#closed = false;
	#sampleRate: number;
	#encoding: Encoding;
	#container: string;

	on = this.#emitter.on.bind(this.#emitter);
	once = this.#emitter.once.bind(this.#emitter);
	events = this.#emitter.events.bind(this.#emitter);
	off = this.#emitter.off.bind(this.#emitter);

	/**
	 * Create a new Source.
	 *
	 * @param options - Options for the Source.
	 * @param options.sampleRate - The sample rate of the audio.
	 */
	constructor({
		sampleRate,
		encoding,
		container,
	}: { sampleRate: number; encoding: string; container: string }) {
		this.#sampleRate = sampleRate;
		this.#encoding = encoding as Encoding;
		this.#container = container;
		this.#buffer = this.#createBuffer(1024); // Initial size, can be adjusted
	}

	get sampleRate() {
		return this.#sampleRate;
	}

	get encoding() {
		return this.#encoding;
	}

	get container() {
		return this.#container;
	}

	/**
	 * Create a new buffer for the source.
	 *
	 * @param size - The size of the buffer to create.
	 * @returns The new buffer as a TypedArray based on the encoding.
	 */
	#createBuffer(size: number): TypedArray {
		const { arrayType: ArrayType } = ENCODING_MAP[this.#encoding];
		return new ArrayType(size);
	}

	/**
	 * Append audio to the buffer.
	 *
	 * @param src The audio to append.
	 */
	async enqueue(src: TypedArray) {
		const requiredCapacity = this.#writeIndex + src.length;

		// Resize buffer if necessary
		if (requiredCapacity > this.#buffer.length) {
			let newCapacity = this.#buffer.length;
			while (newCapacity < requiredCapacity) {
				newCapacity *= 2; // Double the buffer size
			}

			const newBuffer = this.#createBuffer(newCapacity);
			newBuffer.set(this.#buffer);
			this.#buffer = newBuffer;
		}

		// Append the audio to the buffer.
		this.#buffer.set(src, this.#writeIndex);
		this.#writeIndex += src.length;
		await this.#emitter.emit("enqueue");
	}

	/**
	 * Read audio from the buffer.
	 *
	 * @param dst The buffer to read the audio into.
	 * @returns The number of samples read. If the source is closed, this will be
	 * less than the length of the provided buffer.
	 */
	async read(dst: TypedArray): Promise<number> {
		// Read the buffer into the provided buffer.
		const targetReadIndex = this.#readIndex + dst.length;

		while (!this.#closed && targetReadIndex > this.#writeIndex) {
			// Wait for more audio to be enqueued.
			await this.#emitter.emit("wait");
			await Promise.race([
				this.#emitter.once("enqueue"),
				this.#emitter.once("close"),
			]);
			await this.#emitter.emit("read");
		}

		const read = Math.min(dst.length, this.#writeIndex - this.#readIndex);
		dst.set(this.#buffer.subarray(this.#readIndex, this.#readIndex + read));
		this.#readIndex += read;
		return read;
	}

	/**
	 * Seek in the buffer.
	 *
	 * @param offset The offset to seek to.
	 * @param whence The position to seek from.
	 * @returns The new position in the buffer.
	 * @throws {Error} If the seek is invalid.
	 */
	async seek(
		offset: number,
		whence: "start" | "current" | "end",
	): Promise<number> {
		let position = this.#readIndex;
		switch (whence) {
			case "start":
				position = offset;
				break;
			case "current":
				position += offset;
				break;
			case "end":
				position = this.#writeIndex + offset;
				break;
			default:
				throw new Error(`Invalid seek mode: ${whence}`);
		}

		if (position < 0 || position > this.#writeIndex) {
			throw new Error("Seek out of bounds");
		}

		this.#readIndex = position;
		return position;
	}

	/**
	 * Get the number of samples in a given duration.
	 *
	 * @param durationSecs The duration in seconds.
	 * @returns The number of samples.
	 */
	durationToSampleCount(durationSecs: number) {
		return Math.trunc(durationSecs * this.#sampleRate);
	}

	get buffer() {
		return this.#buffer;
	}

	get readIndex() {
		return this.#readIndex;
	}

	get writeIndex() {
		return this.#writeIndex;
	}

	/**
	 * Close the source. This signals that no more audio will be enqueued.
	 *
	 * This will emit a "close" event.
	 *
	 * @returns A promise that resolves when the source is closed.
	 */
	async close() {
		this.#closed = true;
		await this.#emitter.emit("close");
		this.#emitter.clearListeners();
	}
}
