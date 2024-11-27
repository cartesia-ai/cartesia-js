# Reference

## ApiStatus

<details><summary><code>client.apiStatus.<a href="/src/api/resources/apiStatus/client/Client.ts">get</a>() -> Cartesia.ApiInfo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.apiStatus.get();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ApiStatus.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Tts

<details><summary><code>client.tts.<a href="/src/api/resources/tts/client/Client.ts">bytes</a>({ ...params }) -> stream.Readable</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tts.bytes({
    modelId: "sonic-english",
    transcript: "Hello, world!",
    voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
    },
    language: "en",
    outputFormat: {
        container: "mp3",
        sampleRate: 44100,
        bitRate: 128000,
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.TtsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Tts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.tts.<a href="/src/api/resources/tts/client/Client.ts">sse</a>({ ...params }) -> core.Stream<Cartesia.WebSocketResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.tts.sse({
    modelId: "string",
    transcript: "string",
    voice: {
        mode: "id",
        id: "string",
        experimentalControls: {
            speed: 1.1,
            emotion: "anger:lowest",
        },
    },
    language: "en",
    outputFormat: {
        container: "raw",
    },
    duration: 1.1,
});
for await (const item of response) {
    console.log(item);
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.TtsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Tts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## VoiceChanger

<details><summary><code>client.voiceChanger.<a href="/src/api/resources/voiceChanger/client/Client.ts">bytes</a>(clip, { ...params }) -> stream.Readable</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Takes an audio file of speech, and returns an audio file of speech spoken with the same intonation, but with a different voice.

This endpoint is priced at 15 characters per second of input audio.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voiceChanger.bytes(fs.createReadStream("/path/to/your/file"), {
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    outputFormatContainer: "mp3",
    outputFormatSampleRate: 44100,
    outputFormatBitRate: 128000,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**clip:** `File | fs.ReadStream | Blob`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.VoiceChangerBytesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VoiceChanger.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voiceChanger.<a href="/src/api/resources/voiceChanger/client/Client.ts">sse</a>(clip, { ...params }) -> core.Stream<Cartesia.StreamingResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.voiceChanger.sse(fs.createReadStream("/path/to/your/file"), {
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    outputFormatContainer: "mp3",
    outputFormatSampleRate: 44100,
    outputFormatBitRate: 128000,
});
for await (const item of response) {
    console.log(item);
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**clip:** `File | fs.ReadStream | Blob`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.VoiceChangerSseRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VoiceChanger.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Voices

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">list</a>() -> Cartesia.Voice[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">create</a>({ ...params }) -> Cartesia.Voice</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.create({
    name: "string",
    description: "string",
    embedding: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
    ],
    language: "en",
    baseVoiceId: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.CreateVoiceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">delete</a>(id) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.delete("string");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `Cartesia.VoiceId`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">update</a>(id, { ...params }) -> Cartesia.Voice</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.update("string", {
    name: "string",
    description: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `Cartesia.VoiceId`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.UpdateVoiceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">get</a>(id) -> Cartesia.Voice</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.get("string");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `Cartesia.VoiceId`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">localize</a>({ ...params }) -> Cartesia.EmbeddingResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.localize({
    embedding: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
    ],
    language: "en",
    originalSpeakerGender: "male",
    dialect: "au",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.LocalizeVoiceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">mix</a>({ ...params }) -> Cartesia.EmbeddingResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.mix({
    voices: [
        {
            id: "string",
            weight: 1.1,
        },
    ],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.MixVoicesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">cloneFromClip</a>(clip, { ...params }) -> Cartesia.EmbeddingResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Clone a voice from a clip. The clip should be a 15-20 second recording of a person speaking with little to no background noise.

The endpoint will return an embedding that can either be used directly with text-to-speech endpoints or used to create a new voice.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.cloneFromClip(fs.createReadStream("/path/to/your/file"), {});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**clip:** `File | fs.ReadStream | Blob`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.CloneFromClipRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
