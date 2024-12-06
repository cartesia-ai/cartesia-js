import * as core from "../core";
import * as environments from "../environments";
import * as serializers from "../serialization";
import Emittery from "emittery";
import { humanId } from "human-id";
import { ReconnectingWebSocket, Options } from "../core/websocket";
import type { RawEncoding, WebSocketStreamOptions, WebSocketTtsRequest, WordTimestamps } from "../api";
import {
    base64ToArray,
    resolveOutputFormat,
    ConnectionEventData,
    createMessageHandlerForContextId,
    getEmitteryCallbacks,
    isSentinel,
    WebSocketOptions,
    EmitteryCallbacks,
} from "./utils";
import { Tts } from "../api/resources/tts/client/Client";
import Source from "./source";
import qs from "qs";

export default class Websocket {
    socket?: ReconnectingWebSocket;
    #isConnected = false;
    #sampleRate: number;
    #container: string;
    #encoding: string;

    constructor({ sampleRate, container, encoding }: WebSocketOptions, private readonly options: Tts.Options) {
        this.#sampleRate = sampleRate;
        this.#container = container ?? "raw";
        this.#encoding = encoding ?? "pcm_f32le";
    }

    /**
     * Send a message over the WebSocket to start a stream.
     *
     * @param inputs - Generation parameters. Defined in the StreamRequest type.
     * @param options - Options for the stream.
     * @param options.timeout - The maximum time to wait for a chunk before cancelling the stream.
     *                          If set to `0`, the stream will not time out.
     * @returns A Source object that can be passed to a Player to play the audio.
     * @returns An Emittery instance that emits messages from the WebSocket.
     */
    async send(
        inputs: WebSocketTtsRequest,
        { timeout = 0 }: WebSocketStreamOptions = {}
    ): Promise<
        EmitteryCallbacks<{
            message: string;
            timestamps: WordTimestamps;
        }> & { source: Source; stop: unknown }
    > {
        if (!this.#isConnected) {
            throw new Error("Not connected to WebSocket. Call .connect() first.");
        }

        if (!inputs.contextId) {
            inputs.contextId = this.#generateId();
        }
        if (!inputs.outputFormat) {
            inputs.outputFormat = resolveOutputFormat(
                this.#container as "raw" | "wav" | "mp3",
                this.#encoding as RawEncoding,
                this.#sampleRate
            );
        }

        this.socket?.send(
            JSON.stringify(serializers.WebSocketTtsRequest.jsonOrThrow(inputs, { unrecognizedObjectKeys: "strip" }))
        );

        const emitter = new Emittery<{
            message: string;
            timestamps: WordTimestamps;
        }>();
        const source = new Source({
            sampleRate: this.#sampleRate,
            encoding: this.#encoding,
            container: this.#container,
        });
        // Used to signal that the stream is complete, either because the
        // WebSocket has closed, or because the stream has finished.
        const streamCompleteController = new AbortController();
        // Set a timeout.
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        if (timeout > 0) {
            timeoutId = setTimeout(streamCompleteController.abort, timeout);
        }
        const handleMessage = createMessageHandlerForContextId(inputs.contextId, async ({ chunk, message, data }) => {
            emitter.emit("message", message);
            if (data.type === "timestamps" && data.wordTimestamps) {
                emitter.emit("timestamps", data.wordTimestamps);
                return;
            }
            if (isSentinel(chunk)) {
                await source.close();
                streamCompleteController.abort();
                return;
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(streamCompleteController.abort, timeout);
            }
            if (!chunk) {
                return;
            }
            await source.enqueue(base64ToArray([chunk], this.#encoding));
        });
        this.socket?.addEventListener("message", handleMessage);
        this.socket?.addEventListener("close", () => {
            streamCompleteController.abort();
        });
        this.socket?.addEventListener("error", () => {
            streamCompleteController.abort();
        });
        streamCompleteController.signal.addEventListener("abort", () => {
            source.close();
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            emitter.clearListeners();
        });

        return {
            source,
            ...getEmitteryCallbacks(emitter),
            stop: streamCompleteController.abort.bind(streamCompleteController),
        };
    }

    continue(inputs: WebSocketTtsRequest) {
        if (!this.#isConnected) {
            throw new Error("Not connected to WebSocket. Call .connect() first.");
        }

        if (!inputs.contextId) {
            throw new Error("context_id is required to continue a context.");
        }
        if (!inputs.outputFormat) {
            inputs.outputFormat = resolveOutputFormat(
                this.#container as "raw" | "wav" | "mp3",
                this.#encoding as RawEncoding,
                this.#sampleRate
            );
        }

        this.socket?.send(
            JSON.stringify({
                continue: true,
                ...serializers.WebSocketTtsRequest.jsonOrThrow(inputs, { unrecognizedObjectKeys: "strip" }),
            })
        );
    }

    /**
     * Generate a unique ID suitable for a streaming context.
     *
     * Not suitable for security purposes or as a primary key, since
     * it lacks the amount of entropy required for those use cases.
     *
     * @returns A unique ID.
     */
    #generateId() {
        return humanId({
            separator: "-",
            capitalize: false,
        });
    }

    /**
     * Authenticate and connect to a Cartesia streaming WebSocket.
     *
     * @returns A promise that resolves when the WebSocket is connected.
     * @throws {Error} If the WebSocket fails to connect.
     */
    async connect(options: Options = {}) {
        if (this.#isConnected) {
            throw new Error("WebSocket is already connected.");
        }

        const emitter = new Emittery<ConnectionEventData>();
        this.socket = new ReconnectingWebSocket(
            async () => {
                const baseUrl = (
                    (await core.Supplier.get(this.options.environment)) ?? environments.CartesiaEnvironment.Production
                ).replace(/^https?:\/\//, "");
                const params = {
                    api_key: this.options.apiKey,
                    cartesia_version: this.options.cartesiaVersion,
                };
                return `wss://${baseUrl}/tts/websocket${qs.stringify(params, { addQueryPrefix: true })}`;
            },
            undefined,
            options
        );
        this.socket!.reconnect();

        this.socket!.onopen = () => {
            this.#isConnected = true;
            emitter.emit("open");
        };
        this.socket!.onclose = () => {
            this.#isConnected = false;
            emitter.emit("close");
        };

        return new Promise<EmitteryCallbacks<ConnectionEventData>>((resolve, reject) => {
            this.socket?.addEventListener("open", () => {
                resolve(getEmitteryCallbacks(emitter));
            });

            const aborter = new AbortController();
            this.socket?.addEventListener("error", () => {
                aborter.abort();
                reject(new Error("WebSocket failed to connect."));
            });

            this.socket?.addEventListener("close", () => {
                aborter.abort();
                reject(new Error("WebSocket closed before it could connect."));
            });
        });
    }

    /**
     * Disconnect from the Cartesia streaming WebSocket.
     */
    disconnect() {
        this.socket?.close();
    }
}
