import Emittery from "emittery";
import type { SourceEventData } from "../types";

export default class Source {
	#emitter = new Emittery<SourceEventData>();
	#buffer: Float32Array;
	#readIndex = 0;
	#writeIndex = 0;
	#closed = false;
	#sampleRate: number;

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
	constructor({ sampleRate }: { sampleRate: number }) {
		this.#sampleRate = sampleRate;
		this.#buffer = new Float32Array(1024); // Initial size, can be adjusted
	}

	get sampleRate() {
		return this.#sampleRate;
	}

	/**
	 * Append audio to the buffer.
	 *
	 * @param src The audio to append.
	 */
	async enqueue(src: Float32Array) {
		const requiredCapacity = this.#writeIndex + src.length;

		// Resize buffer if necessary
		if (requiredCapacity > this.#buffer.length) {
			let newCapacity = this.#buffer.length;
			while (newCapacity < requiredCapacity) {
				newCapacity *= 2; // Double the buffer size
			}

			const newBuffer = new Float32Array(newCapacity);
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
	async read(dst: Float32Array): Promise<number> {
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
