# JavaScript Client for Cartesia

Usage:

```javascript
import Cartesia from "cartesia";

const cartesia = new Cartesia();

try {
	await cartesia.audio.connect();
} catch (error) {
	console.error(`Failed to connect to Cartesia: ${error}`);
}

const stream = await cartesia.audio.stream({
	model: "echo_tts_v0.0.6",
	options: {
		transcript: "Hello, world!",
		chunk_time: 0.1,
	},
});

console.log(`Created stream ${stream.id}.`);

stream.on("chunk", ({ chunk, chunks }) => {
	console.log("Received chunk:", chunk);
});

stream.on("message", ({ message }) => {
	// Raw message.
	console.log("Received message:", message);
});

console.log("Playing stream...");
await stream.play();
console.log("Done playing.");
```
