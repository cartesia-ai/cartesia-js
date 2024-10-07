# Cartesia JavaScript Client

![NPM Version](https://img.shields.io/npm/v/%40cartesia%2Fcartesia-js?logo=npm)
[![Discord](https://badgen.net/badge/black/Cartesia/icon?icon=discord&label)](https://discord.gg/cartesia)

This client provides convenient access to [Cartesia's TTS models](https://cartesia.ai/). Sonic is the fastest text-to-speech model around—it can generate a second of audio in just 650ms, and it can stream out the first audio chunk in just 135ms. Alongside Sonic, we also offer an extensive prebuilt voice library for a variety of use cases.

The JavaScript client is a thin wrapper around the Cartesia API. You can view docs for the API at [docs.cartesia.ai](https://docs.cartesia.ai/).

- [Cartesia JavaScript Client](#cartesia-javascript-client)
	- [Installation](#installation)
	- [Usage](#usage)
		- [CRUD on Voices](#crud-on-voices)
		- [TTS over WebSocket](#tts-over-websocket)
			- [Input Streaming with Contexts](#input-streaming-with-contexts)
			- [Timestamps](#timestamps)
			- [Speed and emotion controls \[Alpha\]](#speed-and-emotion-controls-alpha)
		- [Multilingual TTS \[Alpha\]](#multilingual-tts-alpha)
		- [Playing audio in the browser](#playing-audio-in-the-browser)
	- [React](#react)


## Installation

```bash
# NPM
npm install @cartesia/cartesia-js
# Yarn
yarn add @cartesia/cartesia-js
# PNPM
pnpm add @cartesia/cartesia-js
# Bun
bun add @cartesia/cartesia-js
```

## Usage

### CRUD on Voices

```js
import Cartesia from "@cartesia/cartesia-js";

const cartesia = new Cartesia({
	apiKey: "your-api-key",
});

// List all voices.
const voices = await cartesia.voices.list();
console.log(voices);

// Get a voice.
const voice = await cartesia.voices.get("<voice-id>");
console.log(voice);

// Clone a voice from a file.
const clonedVoiceEmbedding = await cartesia.voices.clone({
	mode: "clip",
	clip: myFile, // Pass a File object or a Blob.
});

// Mix voices together.
const mixedVoiceEmbedding = await cartesia.voices.mix({
	voices: [{ id: "<voice-id-1>", weight: 0.6 }, { id: "<voice-id-2>", weight: 0.4 }],
});

// Localize a voice.
const localizedVoiceEmbedding = await cartesia.voices.localize({
	embedding: Array(192).fill(1.0),
	original_speaker_gender: "female",
	language: "es",
});

// Create a voice.
const newVoice = await cartesia.voices.create({
	name: "Tim",
	description: "A deep, resonant voice.",
	embedding: Array(192).fill(1.0),
});
console.log(newVoice);
```

### TTS over WebSocket

```js
import Cartesia from "@cartesia/cartesia-js";

const cartesia = new Cartesia({
	apiKey: "your-api-key",
});

// Initialize the WebSocket. Make sure the output format you specify is supported.
const websocket = cartesia.tts.websocket({
	container: "raw",
	encoding: "pcm_f32le",
	sampleRate: 44100
});

try {
	await websocket.connect();
} catch (error) {
	console.error(`Failed to connect to Cartesia: ${error}`);
}

// Create a stream.
const response = await websocket.send({
	model_id: "sonic-english",
	voice: {
		mode: "id",
		id: "a0e99841-438c-4a64-b679-ae501e7d6091",
	},
	transcript: "Hello, world!"
	// The WebSocket sets output_format on your behalf.
});

// Access the raw messages from the WebSocket.
response.on("message", (message) => {
	// Raw message.
	console.log("Received message:", message);
});

// You can also access messages using a for-await-of loop.
for await (const message of response.events('message')) {
	// Raw message.
	console.log("Received message:", message);
}
```

#### Input Streaming with Contexts

```js
const contextOptions = {
	context_id: "my-context",
	model_id: "sonic-english",
	voice: {
		mode: "id",
		id: "a0e99841-438c-4a64-b679-ae501e7d6091",
	},
}

// Initial request on the context uses websocket.send().
// This response object will aggregate the results of all the inputs sent on the context.
const response = await websocket.send({
	...contextOptions,
	transcript: "Hello, world!",
});

// Subsequent requests on the same context use websocket.continue().
await websocket.continue({
	...contextOptions,
	transcript: " How are you today?",
});
```

See the [input streaming docs](https://docs.cartesia.ai/reference/web-socket/stream-speech/working-with-web-sockets#input-streaming-with-contexts) for more information.

#### Timestamps

To receive timestamps in responses, set the `add_timestamps` field in the request object to `true`.

```js
const response = await websocket.send({
	model_id: "sonic-english",
	voice: {
		mode: "id",
		id: "a0e99841-438c-4a64-b679-ae501e7d6091",
	},
	transcript: "Hello, world!",
	add_timestamps: true,
});
```

You can then listen for timestamps on the returned response object.

```js
response.on("timestamps", (timestamps) => {
	console.log("Received timestamps for words:", timestamps.words);
	console.log("Words start at:", timestamps.start);
	console.log("Words end at:", timestamps.end);
});

// You can also access timestamps using a for-await-of loop.
for (await const timestamps of response.events('timestamps')) {
	console.log("Received timestamps for words:", timestamps.words);
	console.log("Words start at:", timestamps.start);
	console.log("Words end at:", timestamps.end);
}
```

#### Speed and emotion controls [Alpha]

The API has experimental support for speed and emotion controls that is not subject to semantic versioning and is subject to change without notice. You can control the speed and emotion of the synthesized speech by setting the `speed` and `emotion` fields under `voice.__experimental_controls` in the request object.

```js
const response = await websocket.send({
	model_id: "sonic-english",
	voice: {
		mode: "id",
		id: "a0e99841-438c-4a64-b679-ae501e7d6091",
		__experimental_controls: {
			speed: "fastest",
			emotion: ["sadness", "surprise:high"],
		},
	},
	transcript: "Hello, world!",
});
```

### Multilingual TTS [Alpha]

You can define the language of the text you want to synthesize by setting the `language` field in the request object. Make sure that you are using `model_id: "sonic-multilingual"` in the request object.

Supported languages are listed at [docs.cartesia.ai](https://docs.cartesia.ai/getting-started/available-models).

### Playing audio in the browser

(The `WebPlayer` class only supports playing audio in the browser and the raw PCM format with fp32le encoding.)

```js
// If you're using the client in the browser, you can control audio playback using our WebPlayer:
import { WebPlayer } from "@cartesia/cartesia-js";

console.log("Playing stream...");

// Create a Player object.
const player = new WebPlayer();

// Play the audio. (`response` includes a custom Source object that the Player can play.)
// The call resolves when the audio finishes playing.
await player.play(response.source);

console.log("Done playing.");
```

## React

We export a React hook that simplifies the process of using the TTS API. The hook manages the WebSocket connection and provides a simple interface for buffering, playing, pausing and restarting audio.

```jsx
import { useTTS } from '@cartesia/cartesia-js/react';

function TextToSpeech() {
	const tts = useTTS({
		apiKey: "your-api-key",
		sampleRate: 44100,
	})

	const [text, setText] = useState("");

	const handlePlay = async () => {
		// Begin buffering the audio.
		const response = await tts.buffer({
			model_id: "sonic-english",
			voice: {
        		mode: "id",
        		id: "a0e99841-438c-4a64-b679-ae501e7d6091",
        	},
			transcript: text,
		});

		// Immediately play the audio. (You can also buffer in advance and play later.)
		await tts.play();
	}

	return (
		<div>
			<input type="text" value={text} onChange={(event) => setText(event.target.value)} />
			<button onClick={handlePlay}>Play</button>

			<div>
				{tts.playbackStatus} | {tts.bufferStatus} | {tts.isWaiting}
			</div>
		</div>
	);
}
```
