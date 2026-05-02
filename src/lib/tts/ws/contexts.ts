import type { WebSocketError } from '../../../resources/tts/internal-base';
import type { EventEmitter } from '../../../core/EventEmitter';
import type * as TTSAPI from '../../../resources/tts/tts';
import type { ReconnectingEvent, UnsentMessage } from '../../../internal/ws';

/**
 * Text-to-Speech (WebSocket) with client-side context management.
 *
 * Supports:
 * - Streaming
 * - Long-lived connections allow for lower latency by reusing a live network connection
 * - Timestamps
 * - Multiple TTS [contexts](https://docs.cartesia.ai/use-the-api/tts-websocket/contexts) over the same connection
 * - [Context flushing](https://docs.cartesia.ai/use-the-api/tts-websocket/context-flushing-and-flush-i-ds)
 * - [Transcript buffering](https://docs.cartesia.ai/use-the-api/tts-websocket/buffering)
 * - Event listeners
 */
export namespace TTSWSContexts {
  export type WebSocketResponse =
    | WebSocketResponse.Chunk
    | WebSocketResponse.FlushDone
    | WebSocketResponse.Done
    | WebSocketResponse.Timestamps
    | WebSocketResponse.Error
    | WebSocketResponse.PhonemeTimestamps;

  /** Messages yielded by {@link ContextInterface.receive} */
  export namespace WebSocketResponse {
    export type Chunk = TTSAPI.WebsocketResponse.Chunk & {
      /**
       * Decoded audio data as a Buffer.
       */
      audio: Uint8Array;
    };
    export type FlushDone = TTSAPI.WebsocketResponse.FlushDone;
    export type Done = TTSAPI.WebsocketResponse.Done;
    export type Timestamps = TTSAPI.WebsocketResponse.Timestamps;
    export type Error = TTSAPI.WebsocketResponse.Error;
    export type PhonemeTimestamps = TTSAPI.WebsocketResponse.PhonemeTimestamps;
  }

  /**
   * Events emitted by {@link WSConnectionInterface}
   */
  export type WSConnectionEvents = {
    error: (error: WebSocketError) => void;
    close: (code: number, reason: string, unsent: UnsentMessage<TTSAPI.WebsocketClientEvent>[]) => void;
    reconnecting: (event: ReconnectingEvent) => void;
    reconnected: () => void;
  };

  /** Accepted by {@link WSConnectionInterface.context} */
  export type ContextParams = Pick<
    TTSAPI.GenerationRequest,
    'model_id' | 'voice' | 'output_format' | 'add_phoneme_timestamps' | 'add_timestamps' | 'language'
  > & {
    /**
     * A unique identifier for the context. You can use any unique identifier, like a
     * UUID or human ID.
     *
     * If not set, one will be generated for you.
     */
    context_id?: string | null;

    /**
     * How long to wait for events in milliseconds.
     *
     * If set, {@link TTSWSContext.receive} will yield {@link TTSAPI.WebsocketResponse.Error.error_code} `"client_timeout"`
     * and return early if no server events for the context were seen within the timeout.
     */
    timeout?: number;
  };

  /**
   * A generation request accepted by {@link ContextInterface.push}.
   */
  export type ContextPushRequest = Omit<
    TTSAPI.GenerationRequest,
    | 'context_id'
    | 'model_id'
    | 'voice'
    | 'output_format'
    | 'add_phoneme_timestamps'
    | 'add_timestamps'
    | 'language'
  >;

  /**
   * Manages instances of {@link ContextInterface}.
   */
  export interface WSConnectionInterface extends EventEmitter<WSConnectionEvents> {
    /**
     * Connect or reconnect the underlying WebSocket.
     *
     * You can call this method ahead of time to reduce latency for the first audio chunk.
     */
    connect(): Promise<WSConnectionInterface>;

    /**
     * Close all resources and cleans up all contexts created by {@link WSConnectionInterface.context}.
     */
    close(): void;

    /**
     * Creates a context.
     *
     * {@link ContextInterface} is short-lived and designed to generate audio for a single transcript.
     *
     * The transcript can broken up into chunks and streamed over time using continuations,
     * which is useful if you're still in the middle of generating your transcript.
     *
     * See [the API docs](https://docs.cartesia.ai/use-the-api/tts-websocket/contexts) for details.
     *
     * @param params.context_id - Must be unique per WebSocket connection if provided.
     *
     * @throws If an instance of {@link ContextInterface} exists with the same context ID: {@link CartesiaError}.
     * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context ID is a duplicate even if this method did not throw.
     */
    context(params: ContextParams): ContextInterface;

    /**
     * Gets the context returned by {@link WSConnectionInterface.context}.
     *
     * @returns The context, unless it was cleaned up.
     * Contexts are cleaned up once {@link WSConnectionInterface} emits 'close' or 'reconnecting';
     * or when {@link ContextInterface.receive} returns.
     */
    getContext(contextId: string): ContextInterface | undefined;

    /**
     * Lists all contexts.
     *
     * Contexts are cleaned up and removed from this list once {@link WSConnectionInterface} emits 'close' or 'reconnecting';
     * or when {@link ContextInterface.receive} returns.
     *
     * Open contexts are guaranteed to be returned.
     */
    listContexts(): ContextInterface[];
  }
  /**
   * Contexts are short-lived and designed to generate audio for a single transcript.
   *
   * The transcript can broken up into chunks and streamed over time using continuations,
   * which is useful if you're still in the middle of generating your transcript.
   *
   * See [the API docs](https://docs.cartesia.ai/use-the-api/tts-websocket/contexts) for details.
   *
   * Created by {@link WSConnectionInterface.context}.
   */
  export interface ContextInterface {
    readonly contextId: string;
    /**
     * If true, {@link ContextInterface.push} and {@link ContextInterface.flush} will throw.
     * Once a context is closed, a new one must be created to generated more audio.
     */
    readonly isClosed: boolean;

    /**
     * Call this multiple times to stream transcript chunks, then call {@link ContextInterface.end} to finish.
     *
     * @param request The generation request to add to the context.
     * @param request.continue If set to false, signal that the transcript is complete.
     * You do not need to call {@link ContextInterface.end} if you send a request with `continue: false`.
     * @param extraProperties Properties to add to {@link request}.
     * This can be useful if you'd like to override properties or leverage new API capabilities without updating this SDK.
     *
     * @throws If the context is closed: {@link CartesiaError}.
     * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context closed due to inactivity even if this method did not throw.
     */
    push(request: ContextPushRequest, extraProperties?: Record<string, unknown> | null): void;

    /**
     * Signal that no more transcript chunks will be sent.
     *
     * You must call this method if you are relying on Cartesia to manage buffering (default behavior).
     *
     * See [Buffering](https://docs.cartesia.ai/use-the-api/tts-websocket/buffering) for details.
     */
    end(): void;

    /**
     * Flushes the context. You should ignore this method unless you need flushes.
     *
     * Useful if you need to know when transcript chunks finished generating.
     * You will receive {@link TTSAPI.WebsocketResponse.FlushDone} once the transcript pushed to this context so far by {@link ContextInterface.push} is done generating.
     *
     * See [Context Flushing and Flush IDs](https://docs.cartesia.ai/use-the-api/tts-websocket/context-flushing-and-flush-i-ds) for details.
     *
     * @throws If the context is closed: {@link CartesiaError}.
     * Note that a {@link TTSAPI.WebsocketResponse.Error} event may be sent by the server if the context closed due to inactivity even if this method did not throw.
     */
    flush(): void;

    /**
     * Iterates over responses for this context.
     *
     * WebSocket responses are queued until this method is called for the first time.
     *
     * Completes when any of the following events occur:
     * - A {@link TTSAPI.WebsocketResponse.Done} event is received
     * - A terminal {@link TTSAPI.WebsocketResponse.Error} event is received
     * - The context automatically closed due to inactivity
     * - The WebSocket connection was lost
     * - Timeout was reached: will yield {@link TTSAPI.WebsocketResponse.Error.error_code} `"client_timeout"` and return
     *
     * Once complete, {@link ContextInterface} will close and a new context must be created using {@link TTSContextsWSConnection.context}.
     */
    receive(): AsyncGenerator<TTSWSContexts.WebSocketResponse>;

    /**
     * Cancel this context to stop generating speech.
     */
    cancel(): void;
  }
}
