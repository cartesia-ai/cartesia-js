# JavaScript Client for Cartesia

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

```javascript
import Cartesia from "@cartesia/cartesia-js";

const cartesia = new Cartesia();

try {
	await cartesia.audio.connect();
} catch (error) {
	console.error(`Failed to connect to Cartesia: ${error}`);
}

const stream = await cartesia.audio.stream({
	model: "upbeat-moon",
	options: {
		transcript: "Hello, world!",
		chunk_time: 0.1,
	},
});

console.log(`Created stream ${stream.id}.`);

stream.on("chunk", ({ chunk, chunks }) => {
	console.log("Received chunk:", chunk);
	console.log("All chunks:", chunks);
});

stream.on("message", ({ message }) => {
	// Raw message.
	console.log("Received message:", message);
});

// If you're using the client in the browser, you can play the stream like this:
console.log("Playing stream...");
await stream.play();
console.log("Done playing.");
```
