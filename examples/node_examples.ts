/**
 * Node.js examples for Cartesia JS SDK v3.x
 *
 * Run an example:
 *   pnpm i && CARTESIA_API_KEY=... pnpm tsn examples/node_examples.ts <functionName>
 */

import * as fs from 'fs';
import Cartesia, {
  APIError,
  NotFoundError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
} from '@cartesia/cartesia-js';

type PCMEncoding = 'pcm_s16le' | 'pcm_s32le' | 'pcm_f16le' | 'pcm_f32le' | 'pcm_mulaw' | 'pcm_alaw';

const AUDIO_CHUNK_MS = 100;

const BYTES_PER_SAMPLE: Record<PCMEncoding, number> = {
  pcm_s16le: 2,
  pcm_s32le: 4,
  pcm_f16le: 2,
  pcm_f32le: 4,
  pcm_mulaw: 1,
  pcm_alaw: 1,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function audioDurationMs(byteLength: number, sampleRate: number, encoding: PCMEncoding): number {
  const samples = byteLength / BYTES_PER_SAMPLE[encoding];
  return (samples / sampleRate) * 1000;
}

function audioChunkByteLength(sampleRate: number, encoding: PCMEncoding): number {
  return Math.round((sampleRate * AUDIO_CHUNK_MS) / 1000) * BYTES_PER_SAMPLE[encoding];
}

function createRealtimePacer(
  sampleRate: number,
  encoding: PCMEncoding,
): (byteLength: number) => Promise<void> {
  let startedAt: number | undefined;
  let scheduledAudioMs = 0;

  return async (byteLength: number) => {
    startedAt ??= Date.now();
    scheduledAudioMs += audioDurationMs(byteLength, sampleRate, encoding);

    const delayMs = startedAt + scheduledAudioMs - Date.now();
    if (delayMs > 0) await sleep(delayMs);
  };
}

function concatAudioBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  if (left.byteLength === 0) return right.slice();
  if (right.byteLength === 0) return left;

  const bytes = new Uint8Array(left.byteLength + right.byteLength);
  bytes.set(left);
  bytes.set(right, left.byteLength);
  return bytes;
}

async function sendRealtimeAudioChunks(
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
  sendRaw: (chunk: Uint8Array) => void,
  sampleRate: number,
  encoding: PCMEncoding,
): Promise<void> {
  const pace = createRealtimePacer(sampleRate, encoding);
  const chunkByteLength = audioChunkByteLength(sampleRate, encoding);
  let pending: Uint8Array<ArrayBufferLike> = new Uint8Array(0);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    pending = concatAudioBytes(pending, value);
    while (pending.byteLength >= chunkByteLength) {
      const chunk = pending.slice(0, chunkByteLength);
      pending = pending.slice(chunkByteLength);
      sendRaw(chunk);
      await pace(chunk.byteLength);
    }
  }

  if (pending.byteLength > 0) {
    sendRaw(pending);
    await pace(pending.byteLength);
  }
}

// =============================================================================
// Client Initialization
// =============================================================================

function createClient(): Cartesia {
  return new Cartesia({ apiKey: process.env['CARTESIA_API_KEY'] });
}

// =============================================================================
// TTS Generate (Bytes)
// =============================================================================

/** Use generate() to get a wav Response and write it to a file. */
async function ttsGenerateToFile(client: Cartesia): Promise<void> {
  const response = await client.tts.generate({
    model_id: 'sonic-latest',
    transcript: 'Hello, world!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'wav', encoding: 'pcm_f32le', sample_rate: 44100 },
    language: 'en',
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync('output.wav', buffer);
  console.log('Saved audio to output.wav');
  console.log('Play with: ffplay -f wav output.wav');
}

// =============================================================================
// TTS WebSocket
// =============================================================================

/** Basic WebSocket usage. */
async function ttsWebsocketBasic(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_basic_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    await ctx.push({ transcript: 'Hello, world!' });
    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        if (event.audio) file.write(event.audio);
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log(`Saved audio to ${filename}`);
    console.log(`Play with:\n  $ ffplay -f f32le -ar 44100 ${filename}`);
  } finally {
    file.end();
    ws.close();
  }
}

/** Streaming a transcript split into multiple parts, using continuations. */
async function ttsWebsocketContinuations(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_continuations_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    for (const part of ['The road ', 'goes ever ', 'on and ', 'on.']) {
      await ctx.push({ transcript: part });
    }
    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        if (event.audio) file.write(event.audio);
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log(`Saved audio to ${filename}`);
    console.log(`Play with:\n  $ ffplay -f f32le -ar 44100 ${filename}`);
  } finally {
    file.end();
    ws.close();
  }
}

/** Demonstrates manual flushing to separate audio from different transcripts. */
async function ttsWebsocketFlushing(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const files: Map<number, fs.WriteStream> = new Map();

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    // 1. Send first transcript
    console.log('Sending first transcript...');
    await ctx.push({ transcript: 'Stay hungry, ' });

    // 2. Flush — forces all buffered audio for the first transcript to be generated.
    console.log('Flushing...');
    await ctx.flush();

    // 3. Send second transcript
    console.log('Sending second transcript...');
    await ctx.push({ transcript: 'stay foolish.' });

    await ctx.no_more_inputs();

    const ts = timestamp();

    for await (const event of ctx.receive()) {
      // Log every response, but redact audio data to avoid swamping the console.
      const loggable: Record<string, unknown> = { ...event };
      if (loggable['data']) loggable['data'] = '[...]';
      if (loggable['audio']) loggable['audio'] = '[...]';
      console.log('Event:', JSON.stringify(loggable));

      if (event.type === 'chunk' && event.audio) {
        const flushId = event.flush_id ?? 0;
        let file = files.get(flushId);
        if (file === undefined) {
          const name = `tts_flush_${flushId}_${ts}.pcm`;
          file = fs.createWriteStream(name);
          files.set(flushId, file);
        }
        file.write(event.audio);
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log('\nFinished. Play the generated audio files with:');
    for (const [flushId, f] of files) {
      console.log(`  Flush ID ${flushId}: ffplay -f f32le -ar 44100 ${f.path}`);
    }
  } finally {
    for (const f of files.values()) f.end();
    ws.close();
  }
}

/** Demonstrates changing emotion mid-stream using generation_config. */
async function ttsWebsocketEmotion(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_emotion_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    console.log('Sending neutral text...');
    await ctx.push({ transcript: 'Well maybe if you just ' });

    console.log('Sending angry text...');
    await ctx.push({
      transcript: 'loosen up a little!',
      generation_config: { emotion: 'angry' },
    });

    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        if (event.audio) file.write(event.audio);
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log(`Saved audio to ${filename}`);
    console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
  } finally {
    file.end();
    ws.close();
  }
}

/** Demonstrates changing speed mid-stream using generation_config. */
async function ttsWebsocketSpeed(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_speed_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    console.log('Sending normal speed text...');
    await ctx.push({ transcript: 'I am speaking at a normal pace. ' });

    console.log('Sending fast speed text...');
    await ctx.push({
      transcript: 'But now I am speaking much faster!',
      generation_config: { speed: 1.5 },
    });

    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        if (event.audio) file.write(event.audio);
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log(`Saved audio to ${filename}`);
    console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
  } finally {
    file.end();
    ws.close();
  }
}

/** Two contexts on one connection, received concurrently via Promise.all(). */
async function ttsWebsocketConcurrentContexts(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  try {
    const ctx1 = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    const ctx2 = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    // Send to both contexts before receiving.
    await ctx1.push({
      transcript:
        'Context one is speaking now. This is a longer transcript to ensure that ' +
        'audio chunks from both contexts are interleaved on the wire. ' +
        'The quick brown fox jumps over the lazy dog.',
    });
    await ctx1.no_more_inputs();

    await ctx2.push({
      transcript:
        'Context two has a different message. We want to verify that the routing ' +
        'logic correctly separates the audio streams. ' +
        'Pack my box with five dozen liquor jugs.',
    });
    await ctx2.no_more_inputs();

    const ts = timestamp();

    async function collect(ctx: { receive: typeof ctx1.receive }, filename: string): Promise<void> {
      const file = fs.createWriteStream(filename);
      for await (const event of ctx.receive()) {
        if (event.type === 'chunk' && event.audio) {
          file.write(event.audio);
        } else if (event.type === 'error') {
          throw new Error(`${event.title}: ${event.message}`);
        }
      }
      file.end();
    }

    const filename1 = `tts_concurrent_ctx1_${ts}.pcm`;
    const filename2 = `tts_concurrent_ctx2_${ts}.pcm`;

    await Promise.all([collect(ctx1, filename1), collect(ctx2, filename2)]);

    console.log(`Saved context 1 audio to ${filename1}`);
    console.log(`Saved context 2 audio to ${filename2}`);
    console.log('Play with:');
    console.log(`  ffplay -f f32le -ar 44100 ${filename1}`);
    console.log(`  ffplay -f f32le -ar 44100 ${filename2}`);
  } finally {
    ws.close();
  }
}

/** WebSocket response type handling with timestamps. */
async function ttsWebsocketResponseHandling(client: Cartesia): Promise<void> {
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_response_handling_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
      add_timestamps: true,
    });

    await ctx.push({
      transcript: 'Hello, world!',
    });
    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        if (event.audio) file.write(event.audio);
      } else if (event.type === 'timestamps') {
        const wt = event.word_timestamps;
        if (wt) {
          console.log(`Words: ${wt.words}, Starts: ${wt.start}, Ends: ${wt.end}`);
        }
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log(`Saved audio to ${filename}`);
    console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
  } finally {
    file.end();
    ws.close();
  }
}

// =============================================================================
// TTS SSE
// =============================================================================

/** SSE streaming. */
async function ttsSSEBasic(client: Cartesia): Promise<void> {
  const stream = await client.tts.generateSSE({
    model_id: 'sonic-latest',
    transcript: 'Hello, world!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
    language: 'en',
  });

  const filename = `tts_sse_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    for await (const event of stream) {
      if (event.type === 'chunk') {
        file.write(Buffer.from(event.data, 'base64'));
      } else if (event.type === 'done') {
        break;
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }
  } finally {
    file.end();
  }

  console.log(`Saved audio to ${filename}`);
  console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
}

/** SSE streaming with timestamps. */
async function ttsSSEWithTimestamps(client: Cartesia): Promise<void> {
  const stream = await client.tts.generateSSE({
    model_id: 'sonic-latest',
    transcript: 'Hello, world!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
    language: 'en',
    add_timestamps: true,
  });

  const filename = `tts_sse_timestamps_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    for await (const event of stream) {
      if (event.type === 'timestamps') {
        const wt = event.word_timestamps;
        if (wt) {
          console.log(`Words: ${wt.words}, Starts: ${wt.start}, Ends: ${wt.end}`);
        }
      } else if (event.type === 'chunk') {
        file.write(Buffer.from(event.data, 'base64'));
      } else if (event.type === 'done') {
        break;
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }
  } finally {
    file.end();
  }

  console.log(`Saved audio to ${filename}`);
  console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
}

// =============================================================================
// Voices API
// =============================================================================

/** List voices with pagination via a `loadMore()` function. */
async function voicesList(client: Cartesia): Promise<void> {
  console.log('loading page 1...');

  let page = await client.voices.list();
  const voices = [...page.data];

  console.log('loaded', voices.length);

  for (let i = 2; i < 4; i++) {
    if (!page.hasNextPage()) break;

    console.log(`loading page ${i}...`);

    page = await page.getNextPage();
    voices.push(...page.data);

    console.log('loaded', voices.length);
  }

  console.log([voices[0], '...']);
}

/** Get a specific voice. */
async function voicesGet(client: Cartesia, args: string[]): Promise<void> {
  const voiceId = args[0] ?? '6ccbfb76-1fc6-48f7-b71d-91ac6298247b';
  const voice = await client.voices.get(voiceId);

  if ('embedding' in voice) {
    console.log({ ...voice, embedding: ['...'] });
  } else {
    console.log(voice);
  }
}

/** Clone a voice from an audio clip. */
async function voicesClone(client: Cartesia, args: string[]): Promise<void> {
  const [clipPath, language, ...nameParts] = args;
  if (!clipPath || !language) {
    console.error('Usage: voicesClone <path to audio file> <language> <name>');
    console.error(
      'See https://docs.cartesia.ai/build-with-cartesia/tts-models/latest for supported languages: en, fr, de, es, ...',
    );
    process.exit(1);
  }
  const clip = fs.createReadStream(clipPath);
  const voice = await client.voices.clone({
    clip,
    language,
    name: nameParts.length > 0 ? nameParts.join(' ') : 'My Voice',
  });
  console.log('Cloned voice:', voice.id);
}

/** Update a voice. */
async function voicesUpdate(client: Cartesia, args: string[]): Promise<void> {
  const [voiceId, ...nameParts] = args;
  if (!voiceId || nameParts.length === 0) {
    console.error('Usage: voicesUpdate <voiceId> <name>');
    process.exit(1);
  }
  const voice = await client.voices.update(voiceId, { name: nameParts.join(' ') });

  if ('embedding' in voice) {
    console.log({ ...voice, embedding: '[...]' });
  } else {
    console.log(voice);
  }
}

/** Delete a voice. */
async function voicesDelete(client: Cartesia, args: string[]): Promise<void> {
  const [voiceId] = args;
  if (!voiceId) {
    console.error('Usage: voicesDelete <voiceId>');
    process.exit(1);
  }
  await client.voices.delete(voiceId);
}

// =============================================================================
// STT (Speech-to-Text)
// =============================================================================

/**
 * Transcribe an audio file with word timestamps.
 *
 * Pass a path to an audio file, or omit it to generate a sample WAV via TTS.
 */
async function sttTranscribe(client: Cartesia, args: string[]): Promise<void> {
  async function generateSampleWav(): Promise<[string, string]> {
    const transcript = 'The quick brown fox jumps over the lazy dog.';
    const language = 'en';
    console.log(`No audio file provided. Generating a sample for: ${JSON.stringify(transcript)}`);
    const response = await client.tts.generate({
      model_id: 'sonic-latest',
      transcript,
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 16000 },
      language: language,
    });
    const path = `stt_sample_${timestamp()}.wav`;
    fs.writeFileSync(path, Buffer.from(await response.arrayBuffer()));
    console.log(`Saved sample audio to ${path}`);
    return [path, language];
  }

  let [filePath, language] = args;
  if (!filePath) {
    [filePath, language] = await generateSampleWav();
  } else if (!language) {
    console.error('Usage: sttTranscribe <audio_file> <language_code>');
    console.error('Example: sttTranscribe my_audio.wav en');
    return process.exit(1);
  }

  const file = fs.createReadStream(filePath);
  const response = await client.stt.transcribe({
    file,
    model: 'ink-whisper',
    language,
    timestamp_granularities: ['word'],
  });
  console.log(response.text);
  if (response.words) {
    for (const word of response.words) {
      console.log(`${word.word}: ${word.start}s - ${word.end}s`);
    }
  }
}

/**
 * Realtime STT with turn detection: recommended for voice agents.
 *
 * Generates test audio via TTS and pipes it into the STT WebSocket in
 * real-time 100 ms chunks, then prints turn events.
 */
async function sttAutoFinalizeWebsocket(client: Cartesia, args: string[]): Promise<void> {
  const input = args.length > 0 ? args.join(' ') : 'The quick brown fox jumps over the lazy dog.';
  const encoding = 'pcm_s16le';
  const sampleRate = 16000;

  console.log(`Generating audio for: ${JSON.stringify(input)}`);

  const ws = client.stt.autoFinalize.websocket({
    model: 'ink-2',
    encoding,
    sample_rate: sampleRate,
  });
  ws.on('error', (err) => console.error('WS error:', err.message));

  const sender = (async () => {
    const ttsResponse = await client.tts.generate({
      model_id: 'sonic-latest',
      transcript: input,
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding, sample_rate: sampleRate },
      language: 'en',
    });
    if (!ttsResponse.body) throw new Error('TTS response had no body');
    await sendRealtimeAudioChunks(
      ttsResponse.body.getReader(),
      (chunk) => ws.sendRaw(chunk),
      sampleRate,
      encoding,
    );
    // Tells the server to process any buffered audio, then close the socket.
    ws.send({ type: 'close' });
  })();

  // Concatenate transcripts from all turn.end events to get the full transcript
  // Do not strip or add whitespace!
  let fullTranscript = '';

  for await (const event of ws.stream()) {
    if (event.type === 'message') {
      const m = event.message;
      switch (m.type) {
        case 'connected':
          console.log(`connected      | request_id=${m.request_id}`);
          break;
        case 'turn.start':
          console.log('turn.start     |');
          break;
        case 'turn.update':
          console.log(`turn.update    | ${m.transcript}`);
          break;
        case 'turn.eager_end':
          console.log(`turn.eager_end | ${m.transcript}`);
          break;
        case 'turn.resume':
          console.log('turn.resume    |');
          break;
        case 'turn.end':
          console.log(`turn.end       | ${m.transcript}`);
          fullTranscript += m.transcript;
          break;
      }
    } else if (event.type === 'error') {
      console.error(`error        | ${event.error.message}`);
    }
  }

  await sender;
  console.log(`Full transcript: ${JSON.stringify(fullTranscript)}`);
}

/**
 * Realtime STT (Manual Finalize): recommended for push-to-talk apps.
 *
 * Generates test audio via TTS, pipes it into the STT WebSocket in real-time
 * 100 ms chunks, then sends `finalize` to trigger transcription of the
 * buffered audio.
 */
async function sttManualFinalizeWebsocket(client: Cartesia, args: string[]): Promise<void> {
  const input =
    args.length > 0 ?
      args.join(' ')
    : 'The quick brown fox jumps over the lazy dog. Sandy sells seashells on the sea shore.';
  const encoding = 'pcm_s16le';
  const sampleRate = 16000;

  console.log(`Generating audio for: ${JSON.stringify(input)}`);

  const ws = client.stt.manualFinalize.websocket({
    model: 'ink-2',
    encoding,
    sample_rate: sampleRate,
  });
  ws.on('error', (err) => console.error('WS error:', err.message));

  const generateAudioAndPushToSTT = async (utterance: string): Promise<void> => {
    const ttsResponse = await client.tts.generate({
      model_id: 'sonic-latest',
      transcript: utterance,
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding, sample_rate: sampleRate },
      language: 'en',
    });
    if (!ttsResponse.body) throw new Error('TTS response had no body');
    await sendRealtimeAudioChunks(
      ttsResponse.body.getReader(),
      (chunk) => ws.sendRaw(chunk),
      sampleRate,
      encoding,
    );
    // Triggers transcription of buffered audio.
    ws.send('finalize');
  };

  const sender = (async () => {
    // Split transcript on fullstops to simulate multiple user utterances
    // In reality, you would run voice activity detection (VAD) on the user audio stream
    // to decide when to send the "finalize" command
    for (const utterance of input.split('.').filter((u) => /\w/g.exec(u))) {
      await generateAudioAndPushToSTT(utterance);
    }

    // Flushes remaining audio, sends a `done` ack, then closes the socket.
    ws.send('close');
  })();

  // Transcript chunks are deltas — concatenate is_final chunks to build the
  // full transcript. Do not add or strip whitespace between them.
  let fullTranscript = '';

  for await (const event of ws.stream()) {
    if (event.type === 'message') {
      const m = event.message;
      switch (m.type) {
        case 'transcript': {
          if (m.is_final) {
            console.log(`transcript | ${m.text}`);
            fullTranscript += m.text;
          }
          break;
        }
        case 'flush_done': {
          console.log('flush_done |');
          break;
        }
        case 'done': {
          console.log('done       |');
          break;
        }
      }
    } else if (event.type === 'error') {
      console.error(`error    | ${event.error.message}`);
    }
  }

  await sender;
  console.log(`Full transcript: ${JSON.stringify(fullTranscript)}`);
}

// =============================================================================
// Error Handling
// =============================================================================

/** Example of error handling with SDK exceptions. */
async function errorHandling(client: Cartesia): Promise<void> {
  try {
    await client.tts.generate({
      model_id: 'sonic-latest',
      transcript: 'Hello, world!',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: null as any, // bad request
      language: 'en',
    });
  } catch (e) {
    if (e instanceof BadRequestError) {
      console.log(`Bad request: ${e.message}`);
    } else if (e instanceof AuthenticationError) {
      console.log(`Auth failed: ${e.message}`);
    } else if (e instanceof NotFoundError) {
      console.log(`Not found: ${e.message}`);
    } else if (e instanceof RateLimitError) {
      console.log(`Rate limited: ${e.message}`);
    } else if (e instanceof APIError) {
      console.log(`API error: ${e.message}`);
    } else {
      throw e;
    }
  }
}

// =============================================================================
// Runner
// =============================================================================

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

const examples: Record<string, (client: Cartesia, args: string[]) => Promise<void>> = {
  ttsGenerateToFile,
  ttsWebsocketBasic,
  ttsWebsocketContinuations,
  ttsWebsocketFlushing,
  ttsWebsocketEmotion,
  ttsWebsocketSpeed,
  ttsWebsocketConcurrentContexts,
  ttsWebsocketResponseHandling,
  ttsSSEBasic,
  ttsSSEWithTimestamps,
  voicesList,
  voicesGet,
  voicesClone,
  voicesUpdate,
  voicesDelete,
  sttTranscribe,
  sttAutoFinalizeWebsocket,
  sttManualFinalizeWebsocket,
  errorHandling,
};

async function main() {
  if (!process.env['CARTESIA_API_KEY']) {
    console.error('Error: CARTESIA_API_KEY environment variable not set.');
    process.exit(1);
  }

  const name = process.argv[2];
  if (!name) {
    console.log('Usage: npx ts-node examples/node_examples.ts <functionName>');
    console.log(`Available: ${Object.keys(examples).join(', ')}`);
    process.exit(1);
  }

  const exampleFunc = examples[name];

  if (exampleFunc === undefined) {
    console.log(`Unknown function: ${name}`);
    console.log(`Available: ${Object.keys(examples).join(', ')}`);
    process.exit(1);
  }

  const client = createClient();
  try {
    await exampleFunc(client, process.argv.slice(3));
  } catch (e) {
    console.error(`Error: ${e}`);
    process.exit(1);
  }
}

main();
