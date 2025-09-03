# Cartesia TypeScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Fcartesia-ai%2Fcartesia-js)
[![npm shield](https://img.shields.io/npm/v/@cartesia/cartesia-js)](https://www.npmjs.com/package/@cartesia/cartesia-js)

The Cartesia TypeScript library provides convenient access to the Cartesia APIs from TypeScript.

## Installation

```sh
npm i -s @cartesia/cartesia-js
```

## Reference

A full reference for this library is available [here](https://github.com/cartesia-ai/cartesia-js/blob/HEAD/./reference.md).

## Usage

Instantiate and use the client with the following:

```typescript
import { CartesiaClient } from "@cartesia/cartesia-js";

const client = new CartesiaClient({ token: "YOUR_TOKEN" });
await client.agents.createMetric({
    name: "evaluate-user-satisfaction",
    displayName: "Evaluate User Satisfaction",
    prompt: "Task:\nEvaluate how engaged and satisfied the user is with the conversation. Engagement may be shown through active interest in the agent\u2019s products/services, expressing that the agent was helpful, or indicating they would want to interact again.\n\nDecision Logic:\n- If the user shows strong engagement (asks detailed follow-up questions, expresses high interest, compliments the agent, or states they would use the service/agent again) \u2192 classify as HIGH_SATISFACTION\n- If the user shows some engagement (asks a few relevant questions, shows mild interest, or gives neutral feedback) \u2192 classify as MEDIUM_SATISFACTION\n- If the user shows little or no engagement (short answers, off-topic responses, disinterest, no signs of satisfaction) \u2192 classify as LOW_SATISFACTION\n\nNotes:\n- Engagement can be verbal (explicit statements of interest) or behavioral (asking more about features, prices, benefits, or next steps).\n- Expressions of satisfaction, gratitude, or willingness to call again count as positive engagement.\n- Ignore scripted greetings or polite closings unless they contain genuine feedback.\n\nReturn:\nOnly output the exact category name as a string: HIGH_SATISFACTION, MEDIUM_SATISFACTION, or LOW_SATISFACTION.\n",
});
```

## Speech-to-Text (STT)

```typescript
import { CartesiaClient } from "@cartesia/cartesia-js";
import fs from "node:fs";

async function streamingSTTExample() {
    const client = new CartesiaClient({
        apiKey: process.env.CARTESIA_API_KEY,
    });

    // Create websocket connection with endpointing parameters
    const sttWs = client.stt.websocket({
        model: "ink-whisper",
        language: "en", // Language of your audio
        encoding: "pcm_s16le", // Audio encoding format (required)
        sampleRate: 16000, // Audio sample rate (required)
        minVolume: 0.1, // Volume threshold for voice activity detection (0.0-1.0)
        maxSilenceDurationSecs: 2.0, // Maximum silence duration before endpointing
    });

    // Concurrent audio sending
    async function sendAudio() {
        try {
            const audioBuffer = fs.readFileSync("audio.wav");
            const chunkSize = 3200; // ~200ms chunks for more realistic streaming

            console.log("Starting audio stream...");

            for (let i = 0; i < audioBuffer.length; i += chunkSize) {
                const chunk = audioBuffer.subarray(i, i + chunkSize);
                const arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

                await sttWs.send(arrayBuffer);
                console.log(`Sent chunk ${Math.floor(i / chunkSize) + 1}`);

                // Simulate real-time audio capture delay
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            await sttWs.finalize();
            console.log("Audio streaming completed");
        } catch (error) {
            console.error("Error sending audio:", error);
        }
    }

    // Concurrent transcript receiving with word-level timestamps
    async function receiveTranscripts(): Promise<string> {
        return new Promise((resolve) => {
            let fullTranscript = "";

            sttWs.onMessage((result) => {
                if (result.type === "transcript") {
                    const status = result.isFinal ? "FINAL" : "INTERIM";
                    console.log(`[${status}] "${result.text}"`);

                    // Handle word-level timestamps if available
                    if (result.words && result.words.length > 0) {
                        console.log("Word-level timestamps:");
                        result.words.forEach((word) => {
                            console.log(`  "${word.word}": ${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s`);
                        });
                    }

                    if (result.isFinal) {
                        fullTranscript += `${result.text} `;
                    }
                } else if (result.type === "flush_done") {
                    console.log("Flush completed - sending done command");
                    sttWs.done().catch(console.error);
                } else if (result.type === "done") {
                    console.log("Transcription completed");
                    resolve(fullTranscript.trim());
                } else if (result.type === "error") {
                    console.error(`Error: ${result.message}`);
                    resolve("");
                }
            });
        });
    }

    try {
        console.log("Starting STT processing...");

        // Run audio sending and transcript receiving concurrently
        const [, finalTranscript] = await Promise.all([sendAudio(), receiveTranscripts()]);

        console.log(`\nFinal transcript: ${finalTranscript}`);

        // Clean up
        sttWs.disconnect();

        return finalTranscript;
    } catch (error) {
        console.error("STT processing error:", error);
        sttWs.disconnect();
        throw error;
    }
}

// Run the example
streamingSTTExample().catch(console.error);
```

## Request And Response Types

The SDK exports all request and response types as TypeScript interfaces. Simply import them with the
following namespace:

```typescript
import { Cartesia } from "@cartesia/cartesia-js";

const request: Cartesia.ListCallsRequest = {
    ...
};
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```typescript
import { CartesiaError } from "@cartesia/cartesia-js";

try {
    await client.agents.createMetric(...);
} catch (err) {
    if (err instanceof CartesiaError) {
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.body);
        console.log(err.rawResponse);
    }
}
```

## Binary Response

You can consume binary data from endpoints using the `BinaryResponse` type which lets you choose how to consume the data:

```typescript
const response = await client.agents.downloadCallAudio(...);
const stream: ReadableStream<Uint8Array> = response.stream();
// const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
// const blob: Blob = response.blob();
// const bytes: Uint8Array = response.bytes();
// You can only use the response body once, so you must choose one of the above methods.
// If you want to check if the response body has been used, you can use the following property.
const bodyUsed = response.bodyUsed;
```

<details>
<summary>Save binary response to a file</summary>

<blockquote>
<details>
<summary>Node.js</summary>

<blockquote>
<details>
<summary>ReadableStream (most-efficient)</summary>

```ts
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const response = await client.agents.downloadCallAudio(...);

const stream = response.stream();
const nodeStream = Readable.fromWeb(stream);
const writeStream = createWriteStream('path/to/file');

await pipeline(nodeStream, writeStream);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>ArrayBuffer</summary>

```ts
import { writeFile } from 'fs/promises';

const response = await client.agents.downloadCallAudio(...);

const arrayBuffer = await response.arrayBuffer();
await writeFile('path/to/file', Buffer.from(arrayBuffer));
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Blob</summary>

```ts
import { writeFile } from 'fs/promises';

const response = await client.agents.downloadCallAudio(...);

const blob = await response.blob();
const arrayBuffer = await blob.arrayBuffer();
await writeFile('output.bin', Buffer.from(arrayBuffer));
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Bytes (UIntArray8)</summary>

```ts
import { writeFile } from 'fs/promises';

const response = await client.agents.downloadCallAudio(...);

const bytes = await response.bytes();
await writeFile('path/to/file', bytes);
```

</details>
</blockquote>

</details>
</blockquote>

<blockquote>
<details>
<summary>Bun</summary>

<blockquote>
<details>
<summary>ReadableStream (most-efficient)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const stream = response.stream();
await Bun.write('path/to/file', stream);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>ArrayBuffer</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const arrayBuffer = await response.arrayBuffer();
await Bun.write('path/to/file', arrayBuffer);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Blob</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const blob = await response.blob();
await Bun.write('path/to/file', blob);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Bytes (UIntArray8)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const bytes = await response.bytes();
await Bun.write('path/to/file', bytes);
```

</details>
</blockquote>

</details>
</blockquote>

<blockquote>
<details>
<summary>Deno</summary>

<blockquote>
<details>
<summary>ReadableStream (most-efficient)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const stream = response.stream();
const file = await Deno.open('path/to/file', { write: true, create: true });
await stream.pipeTo(file.writable);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>ArrayBuffer</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const arrayBuffer = await response.arrayBuffer();
await Deno.writeFile('path/to/file', new Uint8Array(arrayBuffer));
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Blob</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const blob = await response.blob();
const arrayBuffer = await blob.arrayBuffer();
await Deno.writeFile('path/to/file', new Uint8Array(arrayBuffer));
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Bytes (UIntArray8)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const bytes = await response.bytes();
await Deno.writeFile('path/to/file', bytes);
```

</details>
</blockquote>

</details>
</blockquote>

<blockquote>
<details>
<summary>Browser</summary>

<blockquote>
<details>
<summary>Blob (most-efficient)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const blob = await response.blob();
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>ReadableStream</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const stream = response.stream();
const reader = stream.getReader();
const chunks = [];

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
}

const blob = new Blob(chunks);
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>ArrayBuffer</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const arrayBuffer = await response.arrayBuffer();
const blob = new Blob([arrayBuffer]);
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Bytes (UIntArray8)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const bytes = await response.bytes();
const blob = new Blob([bytes]);
const url = URL.createObjectURL(blob);

// trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
URL.revokeObjectURL(url);
```

</details>
</blockquote>

</details>
</blockquote>

</details>
</blockquote>

<details>
<summary>Convert binary response to text</summary>

<blockquote>
<details>
<summary>ReadableStream</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const stream = response.stream();
const text = await new Response(stream).text();
```

</details>
</blockquote>

<blockquote>
<details>
<summary>ArrayBuffer</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const arrayBuffer = await response.arrayBuffer();
const text = new TextDecoder().decode(arrayBuffer);
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Blob</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const blob = await response.blob();
const text = await blob.text();
```

</details>
</blockquote>

<blockquote>
<details>
<summary>Bytes (UIntArray8)</summary>

```ts
const response = await client.agents.downloadCallAudio(...);

const bytes = await response.bytes();
const text = new TextDecoder().decode(bytes);
```

</details>
</blockquote>

</details>

## Pagination

List endpoints are paginated. The SDK provides an iterator so that you can simply loop over the items:

```typescript
import { CartesiaClient } from "@cartesia/cartesia-js";

const client = new CartesiaClient({ token: "YOUR_TOKEN" });
const response = await client.agents.listCalls({
    agentId: "agent_id",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.agents.listCalls({
    agentId: "agent_id",
});
while (page.hasNextPage()) {
    page = page.getNextPage();
}
```

## Advanced

### Additional Headers

If you would like to send additional headers as part of the request, use the `headers` request option.

```typescript
const response = await client.agents.createMetric(..., {
    headers: {
        'X-Custom-Header': 'custom value'
    }
});
```

### Additional Query String Parameters

If you would like to send additional query string parameters as part of the request, use the `queryParams` request option.

```typescript
const response = await client.agents.createMetric(..., {
    queryParams: {
        'customQueryParamKey': 'custom query param value'
    }
});
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```typescript
const response = await client.agents.createMetric(..., {
    maxRetries: 0 // override maxRetries at the request level
});
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeoutInSeconds` option to configure this behavior.

```typescript
const response = await client.agents.createMetric(..., {
    timeoutInSeconds: 30 // override timeout to 30s
});
```

### Aborting Requests

The SDK allows users to abort requests at any point by passing in an abort signal.

```typescript
const controller = new AbortController();
const response = await client.agents.createMetric(..., {
    abortSignal: controller.signal
});
controller.abort(); // aborts the request
```

### Access Raw Response Data

The SDK provides access to raw response data, including headers, through the `.withRawResponse()` method.
The `.withRawResponse()` method returns a promise that results to an object with a `data` and a `rawResponse` property.

```typescript
const { data, rawResponse } = await client.agents.createMetric(...).withRawResponse();

console.log(data);
console.log(rawResponse.headers['X-My-Header']);
```

### Runtime Compatibility

The SDK works in the following runtimes:

- Node.js 18+
- Vercel
- Cloudflare Workers
- Deno v1.25+
- Bun 1.0+
- React Native

### Customizing Fetch Client

The SDK provides a way for you to customize the underlying HTTP client / Fetch function. If you're running in an
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
