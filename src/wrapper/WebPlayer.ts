import type Source from "./source";
import { playAudioBuffer } from "./utils";

export class WebPlayer {
    #context: AudioContext | null = null;
    #startNextPlaybackAt = 0;
    #bufferDuration: number;

    #onStateChange?: (state: "running" | "suspended" | "closed") => void;

      /**
       * Create a new Player.
       *
       * @param options - Options for the Player.
       * @param options.bufferDuration - The size of each chunk (in samples or seconds)
       *   to be read from the source.
       * @param options.onStateChange - An optional callback for when the audio context state changes.
       */
      constructor({
        bufferDuration,
        onStateChange,
      }: {
        bufferDuration: number;
        onStateChange?: (state: "running" | "suspended" | "closed") => void;
      }) {
        this.#bufferDuration = bufferDuration;
        this.#onStateChange = onStateChange;
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
        this.#startNextPlaybackAt = duration + Math.max(this.#context.currentTime, this.#startNextPlaybackAt);

        await playAudioBuffer(buf, this.#context, startAt, sampleRate);
    }

      /**
       * Initialize the AudioContext if not already created,
       * or resume it if it was closed.
       */
      #initContext(sampleRate: number) {
        if (!this.context || this.context.state === "closed") {
          this.context = new AudioContext({ sampleRate });
          if (this.#onStateChange) {
            this.context.addEventListener("statechange", () => {
              this.#onStateChange?.(this.context!.state);
            });
          }
        }
      }
    /**
     * Play audio from a source.
     *
     * @param source The source to play audio from.
     * @returns A promise that resolves when the audio has finished playing.
     */
    async play(source: Source) {
        this.#startNextPlaybackAt = 0;
        this.#initContext(source.sampleRate);
        const buffer = new Float32Array(source.durationToSampleCount(this.#bufferDuration));

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
