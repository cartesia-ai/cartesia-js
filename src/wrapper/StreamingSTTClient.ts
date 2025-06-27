import { Stt } from "../api/resources/stt/client/Client";
import SttWebsocket, { SttWebSocketOptions, TranscriptionResult } from "./SttWebsocket";

export class StreamingSTTClient extends Stt {
    constructor(options: Stt.Options = {}) {
        super(options);
    }

    /**
     * Create a WebSocket connection for real-time speech transcription.
     *
     * @param options - Configuration options for the STT WebSocket
     * @param options.model - ID of the model to use for transcription (required)
     * @param options.language - The language of the input audio in ISO-639-1 format (defaults to "en")
     * @param options.encoding - The encoding format of the audio data (required). Must be one of: "pcm_s16le", "pcm_s32le", "pcm_f16le", "pcm_f32le", "pcm_mulaw", "pcm_alaw"
     * @param options.sampleRate - The sample rate of the audio in Hz (required)
     * @param options.minVolume - Volume threshold for voice activity detection (0.0-1.0)
     * @param options.maxSilenceDurationSecs - Maximum duration of silence before endpointing
     * @returns SttWebsocket instance for STT operations
     */
    websocket(options: SttWebSocketOptions): SttWebsocket {
        return new SttWebsocket(options, { cartesiaVersion: "2024-06-10", ...this._options });
    }

    /**
     * Transcribe audio chunks using WebSocket with automatic connection management.
     *
     * @param audioChunks - Iterator of audio chunks as ArrayBuffer
     * @param options - Configuration options for the STT WebSocket
     * @returns AsyncGenerator yielding transcription results
     */
    async* transcribe(
        audioChunks: AsyncIterable<ArrayBuffer>,
        options: SttWebSocketOptions
    ): AsyncGenerator<TranscriptionResult, void, unknown> {
        const ws = this.websocket(options);
        
        try {
            // Set up message handling
            const resultQueue: TranscriptionResult[] = [];
            let isComplete = false;
            let error: Error | null = null;

            await ws.onMessage((result) => {
                if (result.type === "error") {
                    error = new Error(result.message || "STT error occurred");
                } else if (result.type === "done") {
                    isComplete = true;
                }
                resultQueue.push(result);
            });

            // Send audio chunks
            const sendAudio = async () => {
                try {
                    for await (const chunk of audioChunks) {
                        await ws.send(chunk);
                    }
                    // Finalize and close session
                    await ws.finalize();
                    await ws.done();
                } catch (e) {
                    error = e instanceof Error ? e : new Error(String(e));
                }
            };

            // Start sending audio in background
            const sendPromise = sendAudio();

            // Yield results as they come in
            while (!isComplete && !error) {
                if (resultQueue.length > 0) {
                    const result = resultQueue.shift()!;
                    yield result;
                    
                    if (result.type === "done") {
                        break;
                    }
                } else {
                    // Small delay to avoid busy waiting
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            // Wait for sending to complete and handle any errors
            await sendPromise;
            
            if (error) {
                throw error;
            }

            // Yield any remaining results
            while (resultQueue.length > 0) {
                yield resultQueue.shift()!;
            }

        } finally {
            ws.disconnect();
        }
    }
}
