import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CartesiaAudio, { type Chunk, type StreamEventData } from "../audio";

export type UseAudioOptions = {
	apiKey: string | null;
	baseUrl?: string;
};

interface UseAudioReturn {
	stream: (options: object) => void;
	play: (bufferDuration?: number) => Promise<void>;
	isPlaying: boolean;
	isConnected: boolean;
	chunks: Chunk[];
	messages: StreamEventData["message"][];
}
/**
 * React hook to use the Cartesia audio API.
 */
export function useAudio({ apiKey, baseUrl }: UseAudioOptions): UseAudioReturn {
	if (typeof window === "undefined" || !apiKey) {
		return {
			stream: () => {},
			play: async () => {},
			isConnected: false,
			isPlaying: false,
			chunks: [],
			messages: [],
		};
	}

	const audio = useMemo(() => {
		const audio = new CartesiaAudio({ apiKey, baseUrl });
		return audio;
	}, [apiKey, baseUrl]);
	const streamReturn = useRef<ReturnType<CartesiaAudio["stream"]> | null>(null);
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
		},
		[audio],
	);

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
	return { stream, play, isPlaying, isConnected, chunks, messages };
}
