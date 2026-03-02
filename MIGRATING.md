# Migrating from Cartesia JS SDK v2.x to v3.x

This guide covers the breaking changes and new patterns when upgrading from the Cartesia JS SDK v2.x to v3.x.

## Installation

```bash
npm install @cartesia/cartesia-js@3
```

For WebSocket support, also install the `ws` peer dependency:

```bash
npm install ws
```

## Quick Start: Drop-in Upgrade

If you want to upgrade with minimal code changes, import `CartesiaClient` instead of the default export. It accepts the same camelCase parameters as the v2.x SDK:

```typescript
// v2.x
import { CartesiaClient } from "@cartesia/cartesia-js";

// v3.x — same import, same API
import { CartesiaClient } from "@cartesia/cartesia-js";

const client = new CartesiaClient({ apiKey: "your-api-key" });
```

For the new snake_case API with full TypeScript types, use the `Cartesia` class:

```typescript
import Cartesia from "@cartesia/cartesia-js";

const client = new Cartesia({ apiKey: "your-api-key" });
```

## TTS Bytes (Batch Generation)

For backwards compatibility, `client.tts.bytes()` is included on the `CartesiaClient` class. The new `Cartesia` class uses `.tts.generate()` instead.

```typescript
// v2.x
const stream = await client.tts.bytes({
  modelId: "sonic-2",
  transcript: "Hello, world!",
  voice: { mode: "id", id: "voice-id" },
  outputFormat: { container: "wav", encoding: "pcm_f32le", sampleRate: 44100 },
});

const chunks = [];
for await (const chunk of stream) {
  chunks.push(chunk);
}
const audio = Buffer.concat(chunks);

// v3.x (new API)
const response = await client.tts.generate({
  model_id: "sonic-2",
  transcript: "Hello, world!",
  voice: { mode: "id", id: "voice-id" },
  output_format: { container: "wav", encoding: "pcm_f32le", sample_rate: 44100 },
});

const audio = Buffer.from(await response.arrayBuffer());
```

## TTS WebSocket

### Basic Usage

```typescript
// v2.x
const ws = client.tts.websocket({
  sampleRate: 44100,
  container: "raw",
  encoding: "pcm_f32le",
});

const { source } = await ws.send({
  modelId: "sonic-2",
  transcript: "Hello, world!",
  voice: { mode: "id", id: "voice-id" },
});

// Read audio from source
const buf = new Float32Array(4096);
while (true) {
  const n = await source.read(buf);
  if (n === 0) break;
  process(buf.subarray(0, n));
}

ws.disconnect();

// v3.x (new API)
const ws = await client.tts.websocket();

for await (const event of ws.generate({
  model_id: "sonic-2",
  transcript: "Hello, world!",
  voice: { mode: "id", id: "voice-id" },
  output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: 44100 },
})) {
  if (event.type === "chunk" && event.audio) {
    process(event.audio); // Buffer with decoded audio
  }
}

ws.close();
```

### Continuations (Streaming Multiple Transcripts)

```typescript
// v2.x
const ws = client.tts.websocket({ sampleRate: 44100 });
await ws.connect();

await ws.send({
  modelId: "sonic-2",
  transcript: "First part. ",
  voice: { mode: "id", id: "voice-id" },
  continue: true,
  contextId: "my-context",
});

await ws.continue({
  modelId: "sonic-2",
  transcript: "Second part.",
  voice: { mode: "id", id: "voice-id" },
  contextId: "my-context",
});

ws.disconnect();

// v3.x (new API)
const ws = await client.tts.websocket();

const ctx = ws.context({
  model_id: "sonic-2",
  voice: { mode: "id", id: "voice-id" },
  output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: 44100 },
});

await ctx.push({ transcript: "First part. " });
await ctx.push({ transcript: "Second part." });
await ctx.done();

for await (const event of ctx.receive()) {
  if (event.type === "chunk" && event.audio) {
    process(event.audio);
  }
}

ws.close();
```

### Flushing

```typescript
// v3.x (new API)
const ctx = ws.context({
  model_id: "sonic-2",
  voice: { mode: "id", id: "voice-id" },
  output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: 44100 },
});

await ctx.push({ transcript: "First sentence. " });
await ctx.flush(); // Force generation of buffered text
await ctx.push({ transcript: "Second sentence." });
await ctx.done();

for await (const event of ctx.receive()) {
  if (event.type === "chunk") {
    // event.flush_id indicates which flush the audio belongs to
    process(event.audio, event.flush_id);
  }
}
```

## Voices API

### Listing Voices

```typescript
// v2.x — returns full array
const voices = await client.voices.list();
console.log(voices[0].createdAt); // camelCase

// v3.x (new API) — async pagination
for await (const voice of client.voices.list()) {
  console.log(voice.created_at); // snake_case
}

// v3.x (CartesiaClient backcompat) — returns full array, camelCase
const voices = await client.voices.list();
console.log(voices[0].createdAt); // camelCase, same as v2.x
```

### Cloning Voices

```typescript
// v2.x
const voice = await client.voices.clone(clip, {
  name: "My Voice",
  description: "A custom voice",
  language: "en",
  mode: "similarity",
});

// v3.x (new API)
const voice = await client.voices.clone({
  clip: clip,
  name: "My Voice",
  description: "A custom voice",
  language: "en",
});
```

### Creating Voices

**Breaking Change:** v3.x no longer supports creating voices from raw embeddings. Use `clone()` with an audio clip instead.

### Mixing Voices

**Breaking Change:** v3.x no longer supports creating voices by mixing.

## Response and Request Field Names

The `CartesiaClient` class uses camelCase, as it did in v2.x.

Moving forward, the `Cartesia` class returns snake_case fields matching the HTTP and Websockets APIs. This is to minimize confusion when comparing SDK code with the API reference.

| CartesiaClient (camelCase) | Cartesia (snake_case) |
|---|---|
| `voice.createdAt` | `voice.created_at` |
| `voice.isPublic` | `voice.is_public` |
| `voice.isOwner` | `voice.is_owner` |
| `voice.userId` | `voice.user_id` |
| `voice.previewFileUrl` | `voice.preview_file_url` |

| CartesiaClient (camelCase) | Cartesia (snake_case) |
|---|---|
| `modelId` | `model_id` |
| `outputFormat` | `output_format` |
| `sampleRate` | `sample_rate` |
| `bitRate` | `bit_rate` |
| `generationConfig` | `generation_config` |
| `pronunciationDictId` | `pronunciation_dict_id` |
| `addTimestamps` | `add_timestamps` |
| `contextId` | `context_id` |

## Error Handling

```typescript
// v2.x
import { CartesiaError, CartesiaTimeoutError } from "@cartesia/cartesia-js";

try {
  await client.tts.bytes({ ... });
} catch (e) {
  if (e instanceof CartesiaTimeoutError) {
    console.log("Timed out");
  } else if (e instanceof CartesiaError) {
    console.log(e.statusCode, e.body);
  }
}

// v3.x (new API)
import {
  APIError,
  BadRequestError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  APIConnectionTimeoutError,
} from "@cartesia/cartesia-js";

try {
  await client.tts.generate({ ... });
} catch (e) {
  if (e instanceof BadRequestError) {
    console.log("Bad request:", e.message);
  } else if (e instanceof AuthenticationError) {
    console.log("Auth failed:", e.message);
  } else if (e instanceof RateLimitError) {
    console.log("Rate limited:", e.message);
  } else if (e instanceof APIConnectionTimeoutError) {
    console.log("Timed out:", e.message);
  } else if (e instanceof APIError) {
    console.log("API error:", e.status, e.message);
  }
}
```

## Summary of Breaking Changes

| Feature | v2.x | v3.x |
|---------|------|------|
| Voice creation from embedding | `client.voices.create(...)` | Removed — use `client.voices.clone(clip)` |
| Voice mixing | `client.voices.mix(...)` | Removed |
| WebSocket streaming | `ws.send()` returns `{ source }` | `ws.generate()` returns async iterator |

## Changes for migrating from deprecated `CartesiaClient` to `Cartesia`

| Feature | CartesiaClient | Cartesia |
|---------|------|------|
| TTS batch method | `client.tts.bytes(...)` | `client.tts.generate(...)` |
| Parameter naming | camelCase (`modelId`) | snake_case (`model_id`) |
| Response naming | camelCase (`createdAt`) | snake_case (`created_at`) |
| WebSocket connect | `ws = client.tts.websocket({...}); await ws.connect()` | `ws = await client.tts.websocket()` |
| WebSocket single generation | `ws.send({transcript, ...})` returns `{ source }` | `ws.generate({transcript, ...})` returns async iterator |
| WebSocket continuations | `ws.send({..., continue: true})`  then `ws.continue({...})` | `ctx = ws.context({...})` then `ctx.push({transcript})` and `ctx.done()` |
| WebSocket disconnect | `ws.disconnect()` | `ws.close()` |
