# Cartesia JavaScript Client

![NPM Version](https://img.shields.io/npm/v/%40cartesia%2Fcartesia-js?logo=npm)
[![Discord](https://badgen.net/badge/black/Cartesia/icon?icon=discord&label)](https://discord.gg/ZVxavqHB9X)

This client provides convenient access to [Cartesia's TTS models](https://cartesia.ai/). Sonic is the fastest text-to-speech model around—it can generate a second of audio in just 650ms, and it can stream out the first audio chunk in just 135ms. Alongside Sonic, we also offer an extensive prebuilt voice library for a variety of use cases.

The full API documentation can be found on docs.cartesia.ai.


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

// Create a voice.
const newVoice = await cartesia.voices.create({
	name: "Tim",
	description: "A deep, resonant voice.",
	embedding: Array(192).fill(1.0),
});
console.log(newVoice);

// Clone a voice from a URL.
const clonedVoice = await cartesia.voices.clone({
	mode: "url",
	url: "https://youtu.be/AdtLxlttrHg?si=07OLmDPg__0IN14f&t=6",
});

// Clone a voice from a file.
const clonedVoice = await cartesia.voices.clone({
	mode: "clip",
	clip: myFile, // Pass a File object or a Blob.
});
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
		mode: "embedding",
		embedding: Array(192).fill(1.0),
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

#### Multilingual TTS [Alpha]

You can define the language of the text you want to synthesize by setting the `language` field in the request object. Make sure that you are using `model_id: "sonic-multilingual"` in the request object.

Supported languages are available at [docs.cartesia.ai](https://docs.cartesia.ai/getting-started/available-models).

#### Playing audio in the browser

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
				mode: "embedding",
				embedding: Array(192).fill(1.0),
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
