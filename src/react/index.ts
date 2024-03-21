import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CartesiaAudio, { type Chunk, type StreamEventData } from "../audio";
import { base64ToArray, bufferToWav } from "../audio/utils";
import { SAMPLE_RATE } from "../lib/constants";

export type UseAudioOptions = {
	apiKey: string;
	baseUrl?: string;
};

interface UseAudioReturn {
	stream: (options: object) => void;
	play: (bufferDuration?: number) => Promise<void>;
	download: () => Blob | null;
	isPlaying: boolean;
	isConnected: boolean;
	isStreamed: boolean;
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
			chunks: [],
			messages: [],
		};
	}

	const audio = useMemo(() => {
		const audio = new CartesiaAudio({ apiKey, baseUrl });
		return audio;
	}, [apiKey, baseUrl]);
	const streamReturn = useRef<ReturnType<CartesiaAudio["stream"]> | null>(null);
	const [isStreamed, setIsStreamed] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [chunks, setChunks] = useState<Chunk[]>([]);
	const [messages, setMessages] = useState<StreamEventData["message"][]>([]);

	const stream = useCallback(
		(options: object) => {
			streamReturn.current = audio?.stream(options) ?? null;
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
			streamReturn.current.on("streamed", ({ chunks }) => {
				setIsStreamed(true);
				setChunks(chunks);
			});
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
				setIsConnected(true);
				const unsubscribe = connection.on("close", () => {
					setIsConnected(false);
				});
				return () => {
					unsubscribe();
					audio.disconnect();
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

	const play = useCallback(
		async (bufferDuration = 0) => {
			if (isPlaying || !streamReturn.current) {
				return;
			}
			setIsPlaying(true);
			await streamReturn.current?.play({ bufferDuration });
			setIsPlaying(false);
		},
		[isPlaying],
	);

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
		chunks,
		messages,
	};
}
