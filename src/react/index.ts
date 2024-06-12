import type { UnsubscribeFunction } from "emittery";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cartesia } from "../lib";
import Player from "../tts/player";
import type Source from "../tts/source";
import type WebSocket from "../tts/websocket";
import { pingServer } from "./utils";

export type UseTTSOptions = {
	apiKey: string | null;
	baseUrl?: string;
	sampleRate: number;
};

export type PlaybackStatus = "inactive" | "playing" | "paused" | "finished";
export type BufferStatus = "inactive" | "buffering" | "buffered";

export type Metrics = {
	modelLatency: number | null;
};

export interface UseTTSReturn {
	buffer: (options: object) => Promise<void>;
	play: (bufferDuration?: number) => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	toggle: () => Promise<void>;
	source: Source | null;
	playbackStatus: PlaybackStatus;
	bufferStatus: BufferStatus;
	isWaiting: boolean;
	isConnected: boolean;
	metrics: Metrics;
}

const PING_INTERVAL = 5000;
const DEFAULT_BUFFER_DURATION = 0.01;

type Message = {
	step_time: number;
};

/**
 * React hook to use the Cartesia audio API.
 */
export function useTTS({
	apiKey,
	baseUrl,
	sampleRate,
}: UseTTSOptions): UseTTSReturn {
	if (typeof window === "undefined") {
		return {
			buffer: async () => {},
			play: async () => {},
			pause: async () => {},
			resume: async () => {},
			toggle: async () => {},
			playbackStatus: "inactive",
			bufferStatus: "inactive",
			isWaiting: false,
			source: null,
			isConnected: false,
			metrics: {
				modelLatency: null,
			},
		};
	}

	const websocket = useMemo(() => {
		if (!apiKey) {
			return null;
		}
		const cartesia = new Cartesia({ apiKey, baseUrl });
		baseUrl = baseUrl ?? cartesia.baseUrl;
		return cartesia.tts.websocket({ sampleRate });
	}, [apiKey, baseUrl, sampleRate]);
	const websocketReturn = useRef<ReturnType<WebSocket["send"]> | null>(null);
	const player = useRef<Player | null>(null);
	const [playbackStatus, setPlaybackStatus] =
		useState<PlaybackStatus>("inactive");
	const [bufferStatus, setBufferStatus] = useState<BufferStatus>("inactive");
	const [isWaiting, setIsWaiting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [bufferDuration, setBufferDuration] = useState<number | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

	const buffer = useCallback(
		async (options: object) => {
			websocketReturn.current?.stop(); // Abort the previous request if it exists.

			setMessages([]);
			setBufferStatus("buffering");
			websocketReturn.current = websocket?.send(options) ?? null;
			if (!websocketReturn.current) {
				return;
			}
			const unsubscribe = websocketReturn.current.on("message", (message) => {
				setMessages((messages) => [...messages, JSON.parse(message)]);
			});
			await websocketReturn.current.source.once("close");
			setBufferStatus("buffered");
			unsubscribe();
		},
		[websocket],
	);

	const metrics = useMemo(() => {
		// Model Latency is the first step time
		if (messages.length === 0) {
			return {
				modelLatency: null,
			};
		}
		const modelLatency = messages[0].step_time ?? null;
		return {
			modelLatency: Math.trunc(modelLatency),
		};
	}, [messages]);

	useEffect(() => {
		let cleanup: (() => void) | undefined = () => {};
		async function setupConnection() {
			try {
				const connection = await websocket?.connect();
				if (!connection) {
					return;
				}
				const unsubscribes = <UnsubscribeFunction[]>[];
				// The await ensures that the connection is open, so we already know that we are connected.
				setIsConnected(true);
				// If the WebSocket is the kind that automatically reconnects, we need an additional
				// listener for the open event to update the connection status.
				unsubscribes.push(
					connection.on("open", () => {
						setIsConnected(true);
					}),
				);
				unsubscribes.push(
					connection.on("close", () => {
						setIsConnected(false);
					}),
				);
				const intervalId = setInterval(() => {
					if (baseUrl) {
						pingServer(new URL(baseUrl).origin).then((ping) => {
							let bufferDuration: number;
							if (ping < 300) {
								bufferDuration = 0.01; // No buffering for very low latency
							} else if (ping > 1500) {
								bufferDuration = 6; // Max buffering for very high latency (6 seconds)
							} else {
								bufferDuration = (ping / 1000) * 4; // Adjust buffer duration based on ping
							}
							setBufferDuration(bufferDuration);
						});
					}
				}, PING_INTERVAL);
				return () => {
					for (const unsubscribe of unsubscribes) {
						unsubscribe();
					}
					clearInterval(intervalId);
					websocket?.disconnect();
				};
			} catch (e) {
				console.error(e);
			}
		}
		setupConnection().then((cleanupConnection) => {
			cleanup = cleanupConnection;
		});
		return () => cleanup?.();
	}, [websocket, baseUrl]);

	const play = useCallback(async () => {
		if (playbackStatus === "playing" || !websocketReturn.current) {
			return;
		}
		if (player.current) {
			// Stop the current player if it exists.
			await player.current.stop();
		}

		setPlaybackStatus("playing");

		const unsubscribes = [];
		unsubscribes.push(
			websocketReturn.current.source.on("wait", () => {
				setIsWaiting(true);
			}),
		);
		unsubscribes.push(
			websocketReturn.current.source.on("read", () => {
				setIsWaiting(false);
			}),
		);

		player.current = new Player({
			bufferDuration: bufferDuration ?? DEFAULT_BUFFER_DURATION,
		});
		// Wait for the playback to finish before setting isPlaying to false.
		await player.current.play(websocketReturn.current.source);

		for (const unsubscribe of unsubscribes) {
			// Deregister the event listeners (.on()) that we registered above to avoid memory leaks.
			unsubscribe();
		}

		setPlaybackStatus("finished");
	}, [playbackStatus, bufferDuration]);

	const pause = useCallback(async () => {
		await player.current?.pause();
		setPlaybackStatus("paused");
	}, []);

	const resume = useCallback(async () => {
		await player.current?.resume();
		setPlaybackStatus("playing");
	}, []);

	const toggle = useCallback(async () => {
		await player.current?.toggle();
		setPlaybackStatus((status) => {
			if (status === "playing") {
				return "paused";
			}
			if (status === "paused") {
				return "playing";
			}
			return status;
		});
	}, []);

	return {
		buffer,
		play,
		pause,
		source: websocketReturn.current?.source ?? null,
		resume,
		toggle,
		playbackStatus,
		bufferStatus,
		isWaiting,
		isConnected,
		metrics,
	};
}
