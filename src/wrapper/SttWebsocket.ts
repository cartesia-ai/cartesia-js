import * as core from "../core";
import * as environments from "../environments";
import { ReconnectingWebSocket, Options } from "../core/websocket";
import { Stt } from "../api/resources/stt/client/Client";
import * as Cartesia from "../api/index";
import { SttEncoding } from "../api/resources/stt/types/SttEncoding";

export interface SttWebSocketOptions {
    model?: string;
    language?: string;
    encoding: SttEncoding;
    sampleRate: number;
    minVolume?: number;
    maxSilenceDurationSecs?: number;
}

export interface TranscriptionResult {
    type: "transcript" | "flush_done" | "done" | "error";
    requestId: string;
    text?: string;
    isFinal?: boolean;
    duration?: number;
    language?: string;
    words?: Cartesia.TranscriptionWord[];
    message?: string;
}

export default class SttWebsocket {
    socket?: ReconnectingWebSocket;
    #isConnected = false;
    #model: string;
    #language?: string;
    #encoding: SttEncoding;
    #sampleRate: number;
    #minVolume?: number;
    #maxSilenceDurationSecs?: number;
    #connectionPromise?: Promise<void>;

    constructor(
        {
            model = "ink-whisper",
            language = "en",
            encoding,
            sampleRate,
            minVolume,
            maxSilenceDurationSecs,
        }: SttWebSocketOptions,
        private readonly options: Stt.Options
    ) {
        if (!model) {
            throw new Error("model parameter is required");
        }
        if (!encoding) {
            throw new Error("encoding parameter is required");
        }
        if (!sampleRate) {
            throw new Error("sampleRate parameter is required");
        }
        
        this.#model = model;
        this.#language = language;
        this.#encoding = encoding;
        this.#sampleRate = sampleRate;
        this.#minVolume = minVolume;
        this.#maxSilenceDurationSecs = maxSilenceDurationSecs;
    }

    async #ensureConnected(): Promise<void> {
        if (this.#isConnected) return;
        
        if (!this.#connectionPromise) {
            this.#connectionPromise = this.connect();
        }
        
        await this.#connectionPromise;
    }

    async send(audioData: ArrayBuffer): Promise<void> {
        await this.#ensureConnected();
        this.socket?.send(audioData);
    }

    async finalize(): Promise<void> {
        await this.#ensureConnected();
        this.socket?.send("finalize");
    }

    async done(): Promise<void> {
        await this.#ensureConnected();
        this.socket?.send("done");
    }

    async onMessage(callback: (result: TranscriptionResult) => void): Promise<void> {
        await this.#ensureConnected();

        if (!this.socket) {
            throw new Error("WebSocket failed to initialize after connection attempt.");
        }

        this.socket.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);
                const result: TranscriptionResult = {
                    type: data.type,
                    requestId: data.request_id || "",
                };

                // Handle different message types according to stt.yml spec
                if (data.type === "transcript") {
                    result.text = data.text || "";
                    result.isFinal = data.is_final || false;
                    result.duration = data.duration;
                    result.language = data.language;
                    // Include word-level timestamps if available
                    if (data.words) {
                        result.words = data.words;
                    }
                } else if (data.type === "flush_done") {
                    // Acknowledgment for finalize command
                    // Only requestId is needed for flush_done
                } else if (data.type === "done") {
                    // Acknowledgment for done command - session complete
                    // Only requestId is needed for done
                } else if (data.type === "error") {
                    result.message = data.message;
                }

                callback(result);
            } catch (error) {
                callback({
                    type: "error",
                    requestId: "",
                    message: `Failed to parse message: ${error}`,
                });
            }
        });
    }

    async connect(connectOptions: Options = {}): Promise<void> {
        if (this.#isConnected) {
            throw new Error("WebSocket is already connected.");
        }

        this.socket = new ReconnectingWebSocket(
            async () => {
                const baseUrl = (
                    (await core.Supplier.get(this.options.environment)) ?? environments.CartesiaEnvironment.Production
                ).replace(/^https?:\/\//, "");

                const params: Record<string, string> = {
                    model: this.#model,
                    cartesia_version: this.options.cartesiaVersion || "2024-06-10",
                    encoding: this.#encoding,
                    sample_rate: this.#sampleRate.toString(),
                };

                if (this.#language) params.language = this.#language;
                if (this.#minVolume !== undefined) params.min_volume = this.#minVolume.toString();
                if (this.#maxSilenceDurationSecs !== undefined) params.max_silence_duration_secs = this.#maxSilenceDurationSecs.toString();

                const apiKey = await core.Supplier.get(this.options.apiKey);
                if (apiKey) {
                    params.api_key = apiKey;
                } else if (connectOptions.accessToken) {
                    params.access_token = connectOptions.accessToken;
                }

                const queryString = Object.keys(params)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                    .join('&');

                return `wss://${baseUrl}/stt/websocket?${queryString}`;
            },
            undefined,
            connectOptions
        );

        return new Promise<void>((resolve, reject) => {
            this.socket!.onopen = () => {
                this.#isConnected = true;
                resolve();
            };

            this.socket!.onclose = () => {
                this.#isConnected = false;
            };

            this.socket!.onerror = () => {
                reject(new Error("WebSocket failed to connect."));
            };

            this.socket!.reconnect();
        });
    }

    disconnect(): void {
        this.socket?.close();
        this.#isConnected = false;
    }
} 
