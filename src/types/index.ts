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

export type VoiceOptions =
	| {
			mode: "id";
			id: string;
	  }
	| {
			mode: "embedding";
			embedding: number[];
	  };

export type StreamRequest = {
	model_id: string;
	transcript: string;
	voice: VoiceOptions;
	output_format?: {
		container?: string;
		encoding?: string;
		sample_rate?: number;
	};
	context_id?: string;
	continue?: boolean;
	duration?: number;
	language?: string;
	options?: {
		timeout?: number;
	};
};

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

export type EncodingInfo = {
	arrayType:
		| Float32ArrayConstructor
		| Int16ArrayConstructor
		| Uint8ArrayConstructor;
	bytesPerElement: number;
};

export const EncodingMap: Record<Encoding, EncodingInfo> = {
	pcm_f32le: { arrayType: Float32Array, bytesPerElement: 4 },
	pcm_s16le: { arrayType: Int16Array, bytesPerElement: 2 },
	pcm_alaw: { arrayType: Uint8Array, bytesPerElement: 1 },
	pcm_mulaw: { arrayType: Uint8Array, bytesPerElement: 1 },
};
