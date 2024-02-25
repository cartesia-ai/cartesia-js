import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CartesiaAudio, { type Chunk, type StreamEventData } from "../audio";

interface UseAudioOptions {
	apiKey: string;
	baseUrl?: string;
}

interface UseAudioReturn {
	stream: (options: object) => void;
	play: (bufferDuration?: number) => Promise<void>;
	isPlaying: boolean;
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
		async function initialize() {
			try {
				await audio?.connect();
			} catch (e) {
				console.error(e);
			}
			return () => {
				audio?.disconnect();
			};
		}
		initialize();
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
	return { stream, play, isPlaying, chunks, messages };
}
