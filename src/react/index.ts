import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CartesiaAudio, { type Chunk, type StreamEventData } from "../audio";
import { base64ToArray, bufferToWav } from "../audio/utils";
import { SAMPLE_RATE } from "../lib/constants";
import { pingServer } from "./utils";

export type UseAudioOptions = {
	apiKey: string | null;
	baseUrl?: string;
};

interface UseAudioReturn {
	stream: (options: object) => void;
	play: (bufferDuration?: number) => Promise<void>;
	download: () => Blob | null;
	isPlaying: boolean;
	isConnected: boolean;
	isStreamed: boolean;
	isBuffering: boolean;
	chunks: Chunk[];
	messages: StreamEventData["message"][];
}
/**
 * React hook to use the Cartesia audio API.
 */
export function useAudio({ apiKey, baseUrl }: UseAudioOptions): UseAudioReturn {
	if (typeof window === "undefined") {
		return {
			stream: () => {},
			play: async () => {},
			download: () => null,
			isConnected: false,
			isPlaying: false,
			isStreamed: false,
			isBuffering: false,
			chunks: [],
			messages: [],
		};
	}

	const audio = useMemo(() => {
		if (!apiKey) {
			return null;
		}
		const audio = new CartesiaAudio({ apiKey, baseUrl });
		return audio;
	}, [apiKey, baseUrl]);
	const streamReturn = useRef<ReturnType<CartesiaAudio["stream"]> | null>(null);
	const [isStreamed, setIsStreamed] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isBuffering, setIsBuffering] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [chunks, setChunks] = useState<Chunk[]>([]);
	const [messages, setMessages] = useState<StreamEventData["message"][]>([]);

	const latencyEndpoint = "https://api.cartesia.ai";

	const stream = useCallback(
		async (options: object) => {
			streamReturn.current = audio?.stream(options) ?? null;
			if (!streamReturn.current) {
				return;
			}
			setMessages([]);
			streamReturn.current.on(
				"chunk",
				({ chunks }: StreamEventData["chunk"]) => {
					setChunks(chunks);
				},
			);
			streamReturn.current.on(
				"message",
				(message: StreamEventData["message"]) => {
					setMessages((messages) => [...messages, message]);
				},
			);
			const { chunks } = await streamReturn.current.once("streamed");
			setChunks(chunks);
			setIsStreamed(true);
		},
		[audio],
	);

	const download = useCallback(() => {
		if (!isStreamed) {
			return null;
		}
		const audio = bufferToWav(SAMPLE_RATE, [base64ToArray(chunks)]);
		return new Blob([audio], { type: "audio/wav" });
	}, [isStreamed, chunks]);

	useEffect(() => {
		let cleanup: (() => void) | undefined = () => {};
		async function setupConnection() {
			try {
				const connection = await audio?.connect();
				if (!connection) {
					return;
				}
				setIsConnected(true);
				connection.on("open", () => {
					setIsConnected(true);
				});
				const unsubscribe = connection.on("close", () => {
					setIsConnected(false);
				});
				return () => {
					unsubscribe();
					audio?.disconnect();
				};
			} catch (e) {
				console.error(e);
			}
		}
		setupConnection().then((cleanupConnection) => {
			cleanup = cleanupConnection;
		});
		return () => cleanup?.();
	}, [audio]);

	const play = useCallback(async () => {
		if (isPlaying || !streamReturn.current) {
			return;
		}
		setIsPlaying(true);
		const ping = await pingServer(latencyEndpoint);
		let bufferingTimeout: ReturnType<typeof setTimeout> | null;

		let bufferDuration: number;
		if (ping < 300) {
			bufferDuration = 0; // No buffering for very low latency
		} else if (ping > 1500) {
			bufferDuration = 6; // Max buffering for very high latency (6 seconds)
		} else {
			bufferDuration = (ping / 1000) * 4; // Adjust buffer duration based on ping
		}

		streamReturn.current.once("buffering").then(() => {
			bufferingTimeout = setTimeout(() => {
				setIsBuffering(true);
			}, 250); // Delay for 250ms before showing buffering indicator
		});
		streamReturn.current.once("buffered").then(() => {
			if (bufferingTimeout) {
				clearTimeout(bufferingTimeout); // Clear the timeout if buffering completes before 500ms
			}
			setIsBuffering(false);
		});

		// Wait for the playback to finish before setting isPlaying to false
		streamReturn.current.once("scheduled").then((data) => {
			setTimeout(() => {
				setIsPlaying(false);
			}, data.playbackEndsIn);
		});

		await streamReturn.current?.play({ bufferDuration });
	}, [isPlaying]);

	// TODO:
	// - [] Pause and stop playback.
	// - [] Access the play and buffer cursors.
	// - [] Seek to a specific time.
	// These are probably best implemented by adding event listener
	// functionality to the base library.
	return {
		stream,
		play,
		download,
		isPlaying,
		isConnected,
		isStreamed,
		isBuffering,
		chunks,
		messages,
	};
}
