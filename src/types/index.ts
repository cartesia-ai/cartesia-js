import type Emittery from "emittery";

export interface ClientOptions {
	apiKey?: string;
	baseUrl?: string;
}

export type Sentinel = null;

export type Chunk = string | Sentinel;

export type StreamEventData = {
	chunk: {
		chunk: Chunk;
		chunks: Chunk[];
	};
	streamed: {
		chunks: Chunk[];
	};
	message: unknown;
	buffering: never;
	buffered: never;
	scheduled: {
		playbackEndsIn: number;
	};
};

export type ConnectionEventData = {
	open: never;
	close: never;
};

export type StreamRequest = {
	inputs: object;
	options: {
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
