import type Source from "./source";
import { playAudioBuffer } from "./utils";

export default class Player {
	#context: AudioContext | null = null;
	#startNextPlaybackAt = 0;
	#bufferDuration: number;

	/**
	 * Create a new Player.
	 *
	 * @param options - Options for the Player.
	 * @param options.bufferDuration - The duration of the audio buffer to play.
	 */
	constructor({ bufferDuration }: { bufferDuration: number }) {
		this.#bufferDuration = bufferDuration;
	}

	async #playBuffer(buf: Float32Array, sampleRate: number) {
		if (!this.#context) {
			throw new Error("AudioContext not initialized.");
		}
		if (buf.length === 0) {
			return;
		}

		const startAt = this.#startNextPlaybackAt;
		const duration = buf.length / sampleRate;
		this.#startNextPlaybackAt =
			duration + Math.max(this.#context.currentTime, this.#startNextPlaybackAt);

		await playAudioBuffer(buf, this.#context, startAt, sampleRate);
	}

	/**
	 * Play audio from a source.
	 *
	 * @param source The source to play audio from.
	 * @returns A promise that resolves when the audio has finished playing.
	 */
	async play(source: Source) {
		this.#startNextPlaybackAt = 0;
		this.#context = new AudioContext({ sampleRate: source.sampleRate });
		const buffer = new Float32Array(
			source.durationToSampleCount(this.#bufferDuration),
		);

		const plays: Promise<void>[] = [];
		while (true) {
			const read = await source.read(buffer);
			// If we've reached the end of the source, then read < buffer.length.
			// In that case, we don't want to play the entire buffer, as that
			// will cause repeated audio.
			// So we set the buffer to the correct length.
			const playableAudio = buffer.subarray(0, read);
			plays.push(this.#playBuffer(playableAudio, source.sampleRate));

			if (read < buffer.length) {
				// No more audio to read.
				break;
			}
		}
		await Promise.all(plays);
	}

	/**
	 * Pause the audio.
	 *
	 * @returns A promise that resolves when the audio has been paused.
	 */
	async pause() {
		if (!this.#context) {
			throw new Error("AudioContext not initialized.");
		}
		await this.#context.suspend();
	}

	/**
	 * Resume the audio.
	 *
	 * @returns A promise that resolves when the audio has been resumed.
	 */
	async resume() {
		if (!this.#context) {
			throw new Error("AudioContext not initialized.");
		}
		await this.#context.resume();
	}

	/**
	 * Toggle the audio.
	 *
	 * @returns A promise that resolves when the audio has been toggled.
	 */
	async toggle() {
		if (!this.#context) {
			throw new Error("AudioContext not initialized.");
		}
		if (this.#context.state === "running") {
			await this.pause();
		} else {
			await this.resume();
		}
	}

	/**
	 * Stop the audio.
	 *
	 * @returns A promise that resolves when the audio has been stopped.
	 */
	async stop() {
		if (!this.#context) {
			throw new Error("AudioContext not initialized.");
		}
		await this.#context?.close();
	}
}
