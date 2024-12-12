# Cartesia TypeScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Fcartesia-ai%2Fcartesia-js)
[![npm shield](https://img.shields.io/npm/v/@cartesia/cartesia-js)](https://www.npmjs.com/package/@cartesia/cartesia-js)
[![Discord](https://badgen.net/badge/black/Cartesia/icon?icon=discord&label)](https://discord.gg/cartesia)

The Cartesia TypeScript library provides convenient access to the Cartesia API from TypeScript.

## Installation

```sh
npm i -s @cartesia/cartesia-js
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

### Instantiation

Instantiate and use the client with the following:

```typescript
import { CartesiaClient } from "@cartesia/cartesia-js";
import process from "node:process"
import fs from "node:fs"

// Set up the client.
const client = new CartesiaClient({ apiKey: process.env.CARTESIA_API_KEY });

// Call the TTS API's bytes endpoint, which returns binary audio data as an ArrayBuffer.
const response = await client.tts.bytes({
    modelId: "sonic-english",
    transcript: "Hello, world!",
    voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
    },
    language: "en",
    outputFormat: {
        container: "wav",
        sampleRate: 44100,
        encoding: "pcm_f32le",
    },
});

// Write the response to a file.
fs.writeFileSync("sonic.wav", new Uint8Array(response));
```

### TTS over WebSocket

```js
import { CartesiaClient } from "@cartesia/cartesia-js";
import process from "node:process"

const cartesia = new CartesiaClient({
    apiKey: process.env.CARTESIA_API_KEY,
});

// Initialize the WebSocket. Make sure the output format you specify is supported.
const websocket = cartesia.tts.websocket({
    container: "raw",
    encoding: "pcm_f32le",
    sampleRate: 44100,
});

try {
    await websocket.connect();
} catch (error) {
    console.error(`Failed to connect to Cartesia: ${error}`);
}

// Create a stream.
const response = await websocket.send({
    modelId: "sonic-english",
    voice: {
        mode: "id",
        id: "a0e99841-438c-4a64-b679-ae501e7d6091",
    },
    transcript: "Hello, world!",
    // The WebSocket sets output_format on your behalf.
});

// Access the raw messages from the WebSocket.
response.on("message", (message) => {
    // Raw message.
    console.log("Received message:", message);
});

// You can also access messages using a for-await-of loop.
for await (const message of response.events("message")) {
    // Raw message.
    console.log("Received message:", message);
}
```

#### Input Streaming with Contexts

```js
const contextOptions = {
    contextId: "my-context",
    modelId: "sonic-english",
    voice: {
        mode: "id",
        id: "a0e99841-438c-4a64-b679-ae501e7d6091",
    },
};

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

## Request And Response Types

The SDK exports all request and response types as TypeScript interfaces. Simply import them with the
following namespace:

```typescript
import { Cartesia } from "@cartesia/cartesia-js";

const request: Cartesia.VoiceChangerBytesRequest = {
    ...
};
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```typescript
import { CartesiaError } from "@cartesia/cartesia-js";

try {
    await client.tts.bytes(...);
} catch (err) {
    if (err instanceof CartesiaError) {
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.body);
    }
}
```

## Advanced

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retriable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retriable when any of the following HTTP status codes is returned:

-   [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
-   [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
-   [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```typescript
const response = await client.tts.bytes(..., {
    maxRetries: 0 // override maxRetries at the request level
});
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeoutInSeconds` option to configure this behavior.

```typescript
const response = await client.tts.bytes(..., {
    timeoutInSeconds: 30 // override timeout to 30s
});
```

### Aborting Requests

The SDK allows users to abort requests at any point by passing in an abort signal.

```typescript
const controller = new AbortController();
const response = await client.tts.bytes(..., {
    abortSignal: controller.signal
});
controller.abort(); // aborts the request
```

### Runtime Compatibility

The SDK defaults to `node-fetch` but will use the global fetch client if present. The SDK works in the following
runtimes:

-   Node.js 18+
-   Vercel
-   Cloudflare Workers
-   Deno v1.25+
-   Bun 1.0+
-   React Native

### Customizing Fetch Client

The SDK provides a way for your to customize the underlying HTTP client / Fetch function. If you're running in an
unsupported environment, this provides a way for you to break glass and ensure the SDK works.

```typescript
import { CartesiaClient } from "@cartesia/cartesia-js";

const client = new CartesiaClient({
    ...
    fetcher: // provide your implementation here
});
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
