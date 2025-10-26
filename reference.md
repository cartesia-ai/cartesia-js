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

## Auth

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">accessToken</a>({ ...params }) -> Cartesia.TokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a new Access Token for the client. These tokens are short-lived and should be used to make requests to the API from authenticated clients.

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
await client.auth.accessToken({
    grants: {
        tts: true,
        stt: true,
    },
    expiresIn: 60,
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

**request:** `Cartesia.TokenRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Auth.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Infill

<details><summary><code>client.infill.<a href="/src/api/resources/infill/client/Client.ts">bytes</a>(leftAudio, rightAudio, { ...params }) -> stream.Readable</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generate audio that smoothly connects two existing audio segments. This is useful for inserting new speech between existing speech segments while maintaining natural transitions.

**The cost is 1 credit per character of the infill text plus a fixed cost of 300 credits.**

Infilling is only available on `sonic-2` at this time.

At least one of `left_audio` or `right_audio` must be provided.

As with all generative models, there's some inherent variability, but here's some tips we recommend to get the best results from infill:

- Use longer infill transcripts
    - This gives the model more flexibility to adapt to the rest of the audio
- Target natural pauses in the audio when deciding where to clip
    - This means you don't need word-level timestamps to be as precise
- Clip right up to the start and end of the audio segment you want infilled, keeping as much silence in the left/right audio segments as possible
    - This helps the model generate more natural transitions
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
await client.infill.bytes(fs.createReadStream("/path/to/your/file"), fs.createReadStream("/path/to/your/file"), {
    modelId: "sonic-2",
    language: "en",
    transcript: "middle segment",
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    outputFormatContainer: "mp3",
    outputFormatSampleRate: 44100,
    outputFormatBitRate: 128000,
    voiceExperimentalControlsSpeed: "slowest",
    voiceExperimentalControlsEmotion: ["surprise:high", "curiosity:high"],
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

**leftAudio:** `File | fs.ReadStream | Blob`

</dd>
</dl>

<dl>
<dd>

**rightAudio:** `File | fs.ReadStream | Blob`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.InfillBytesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Infill.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Stt

<details><summary><code>client.stt.<a href="/src/api/resources/stt/client/Client.ts">transcribe</a>(file, { ...params }) -> Cartesia.TranscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Transcribes audio files into text using Cartesia's Speech-to-Text API.

Upload an audio file and receive a complete transcription response. Supports arbitrarily long audio files with automatic intelligent chunking for longer audio.

**Supported audio formats:** flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm

**Response format:** Returns JSON with transcribed text, duration, and language. Include `timestamp_granularities: ["word"]` to get word-level timestamps.

**Pricing:** Batch transcription is priced at **1 credit per 2 seconds** of audio processed.

<Note>
For migrating from the OpenAI SDK, see our [OpenAI Whisper to Cartesia Ink Migration Guide](/api-reference/stt/migrate-from-open-ai).
</Note>
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
await client.stt.transcribe(fs.createReadStream("/path/to/your/file"), {
    model: "ink-whisper",
    language: "en",
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

**file:** `File | fs.ReadStream | Blob`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.TranscriptionRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Stt.RequestOptions`

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
    modelId: "sonic-2",
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
    modelId: "sonic-2",
    transcript: "Hello, world!",
    voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
    },
    language: "en",
    outputFormat: {
        container: "raw",
        sampleRate: 44100,
        encoding: "pcm_f32le",
    },
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

**request:** `Cartesia.TtssseRequest`

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

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">clone</a>(clip, { ...params }) -> Cartesia.VoiceMetadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Clone a voice from an audio clip. This endpoint has two modes, stability and similarity.

Similarity mode clones are more similar to the source clip, but may reproduce background noise. For these, use an audio clip about 5 seconds long.

Stability mode clones are more stable, but may not sound as similar to the source clip. For these, use an audio clip 10-20 seconds long.

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
await client.voices.clone(fs.createReadStream("/path/to/your/file"), {
    name: "A high-stability cloned voice",
    description: "Copied from Cartesia docs",
    mode: "stability",
    language: "en",
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

**request:** `Cartesia.CloneVoiceRequest`

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
await client.voices.delete("id");
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
await client.voices.update("id", {
    name: "name",
    description: "description",
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
await client.voices.get("id");
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

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">localize</a>({ ...params }) -> Cartesia.VoiceMetadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new voice from an existing voice localized to a new language and dialect.

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
await client.voices.localize({
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    name: "Sarah Peninsular Spanish",
    description: "Sarah Voice in Peninsular Spanish",
    language: "es",
    originalSpeakerGender: "female",
    dialect: "pe",
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
            id: "id",
            weight: 1.1,
        },
        {
            id: "id",
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

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">create</a>({ ...params }) -> Cartesia.VoiceMetadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create voice from raw features. If you'd like to clone a voice from an audio file, please use Clone Voice instead.

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
await client.voices.create({
    name: "My Custom Voice",
    description: "A custom voice created through the API",
    embedding: [],
    language: "en",
    baseVoiceId: "123e4567-e89b-12d3-a456-426614174000",
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
