import type Emittery from "emittery";

export interface ClientOptions {
	apiKey?: string;
	baseUrl?: string;
}

export type Sentinel = null;

export type Chunk = string | Sentinel;

export type ConnectionEventData = {
	open: never;
	close: never;
};

export type VoiceSpecifier =
	| {
			mode: "id";
			id: string;
	  }
	| {
			mode: "embedding";
			embedding: number[];
	  };

export type Emotion =
	| "anger"
	| "sadness"
	| "positivity"
	| "curiosity"
	| "surprise";
export type Intensity = "lowest" | "low" | "high" | "highest";
export type EmotionControl = Emotion | `${Emotion}:${Intensity}`;

export type VoiceOptions = VoiceSpecifier & {
	__experimental_controls?: {
		speed?: "slowest" | "slow" | "normal" | "fast" | "fastest";
		emotion?: EmotionControl[];
	};
};

export type StreamRequest = {
	model_id: string;
	transcript: string;
	voice: VoiceOptions;
	output_format?: {
		container: string;
		encoding: string;
		sample_rate: number;
	};
	context_id?: string;
	continue?: boolean;
	duration?: number;
	language?: string;
	add_timestamps?: boolean;
};

export type StreamOptions = {
	timeout?: number;
};

export type WebSocketBaseResponse = {
	context_id: string;
	status_code: number;
	done: boolean;
};

export type WordTimestamps = {
	words: string[];
	start: number[];
	end: number[];
};

export type WebSocketTimestampsResponse = WebSocketBaseResponse & {
	type: "timestamps";
	word_timestamps: WordTimestamps;
};

export type WebSocketChunkResponse = WebSocketBaseResponse & {
	type: "chunk";
	data: string;
	step_time: number;
};

export type WebSocketErrorResponse = WebSocketBaseResponse & {
	type: "error";
	error: string;
};

export type WebSocketResponse =
	| WebSocketTimestampsResponse
	| WebSocketChunkResponse
	| WebSocketErrorResponse;

export type EmitteryCallbacks<T> = {
	on: Emittery<T>["on"];
	off: Emittery<T>["off"];
	once: Emittery<T>["once"];
	events: Emittery<T>["events"];
};

export type CloneOptions =
	| {
			mode: "url";
			link: string;
	  }
	| {
			mode: "clip";
			clip: Blob;
	  };

export type Voice = {
	id: string;
	name: string;
	description: string;
	embedding: number[];
	is_public: boolean;
	user_id: string;
	created_at: string;
};

export type CreateVoice = Pick<Voice, "name" | "description" | "embedding"> &
	Partial<Omit<Voice, "name" | "description" | "embedding">>;

export type UpdateVoice = Partial<
	Pick<Voice, "name" | "description" | "embedding">
>;

export type CloneResponse = {
	embedding: number[];
};

export type WebSocketOptions = {
	container?: string;
	encoding?: string;
	sampleRate: number;
};

export type SourceEventData = {
	enqueue: never;
	close: never;
	wait: never;
	read: never;
};

export type TypedArray = Float32Array | Int16Array | Uint8Array;

export type Encoding = "pcm_f32le" | "pcm_s16le" | "pcm_alaw" | "pcm_mulaw";
