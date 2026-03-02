/**
 * Examples for Cartesia JS SDK v3.x
 *
 * Run an example:
 *   CARTESIA_API_KEY=... npx ts-node examples/examples.ts <functionName>
 */

import * as fs from 'fs';
import Cartesia, {
  APIError,
  NotFoundError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
} from '@cartesia/cartesia-js';

// =============================================================================
// Client Initialization
// =============================================================================

function createClient(): Cartesia {
  return new Cartesia({ apiKey: process.env['CARTESIA_API_KEY'] });
}

// =============================================================================
// TTS Generate (Bytes)
// =============================================================================

async function ttsGenerateToFile(client: Cartesia): Promise<void> {
  /** Use generate() to get a wav Response and write it to a file. */
  const response = await client.tts.generate({
    model_id: 'sonic-3',
    transcript: 'Hello, world!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'wav', encoding: 'pcm_f32le', sample_rate: 44100 },
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync('output.wav', buffer);
  console.log('Saved audio to output.wav');
  console.log('Play with: ffplay -f wav output.wav');
}

// =============================================================================
// TTS WebSocket
// =============================================================================

async function ttsWebsocketBasic(client: Cartesia): Promise<void> {
  /** Basic WebSocket usage with generate(). */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_basic_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  for await (const event of ws.generate({
    model_id: 'sonic-3',
    transcript: 'Hello, world!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
  })) {
    if (event.type === 'chunk') {
      if (event.audio) file.write(event.audio);
    }
  }

  file.end();
  ws.close();
  console.log(`Saved audio to ${filename}`);
  console.log(`Play with:\n  $ ffplay -f f32le -ar 44100 ${filename}`);
}

async function ttsWebsocketContinuations(client: Cartesia): Promise<void> {
  /** Streaming a transcript split into multiple parts, using continuations. */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const ctx = ws.context({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
  });

  for (const part of ['The road ', 'goes ever ', 'on and ', 'on.']) {
    await ctx.push({ transcript: part });
  }
  await ctx.done();

  const filename = `tts_websocket_continuations_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  for await (const event of ctx.receive()) {
    if (event.type === 'chunk') {
      if (event.audio) file.write(event.audio);
    }
  }

  file.end();
  ws.close();
  console.log(`Saved audio to ${filename}`);
  console.log(`Play with:\n  $ ffplay -f f32le -ar 44100 ${filename}`);
}

async function ttsWebsocketFlushing(client: Cartesia): Promise<void> {
  /** Demonstrates manual flushing to separate audio from different transcripts. */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const ctx = ws.context({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
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

  await ctx.done();

  const ts = timestamp();
  const files: Map<number, fs.WriteStream> = new Map();

  for await (const event of ctx.receive()) {
    // Log every response, but redact audio data to avoid swamping the console.
    const loggable = { ...(event as any) };
    if (loggable.data) loggable.data = '[...]';
    console.log('Event:', JSON.stringify(loggable));

    if (event.type === 'chunk' && event.audio) {
      const flushId = (event as any).flush_id ?? 0;
      if (!files.has(flushId)) {
        const name = `tts_flush_${flushId}_${ts}.pcm`;
        files.set(flushId, fs.createWriteStream(name));
      }
      files.get(flushId)!.write(event.audio);
    }
  }

  for (const f of files.values()) f.end();
  ws.close();

  console.log('\nFinished. Play the generated audio files with:');
  for (const [flushId, f] of files) {
    console.log(`  Flush ID ${flushId}: ffplay -f f32le -ar 44100 ${(f as any).path}`);
  }
}

async function ttsWebsocketEmotion(client: Cartesia): Promise<void> {
  /** Demonstrates changing emotion mid-stream using generation_config. */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const ctx = ws.context({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
  });

  console.log('Sending neutral text...');
  await ctx.push({ transcript: 'Well maybe if you just ' });

  console.log('Sending angry text...');
  await ctx.send({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
    transcript: 'loosen up a little!',
    continue: true,
    generation_config: { emotion: 'angry' },
  });

  await ctx.done();

  const filename = `tts_emotion_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  for await (const event of ctx.receive()) {
    if (event.type === 'chunk') {
      if (event.audio) file.write(event.audio);
    }
  }

  file.end();
  ws.close();
  console.log(`Saved audio to ${filename}`);
  console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
}

async function ttsWebsocketSpeed(client: Cartesia): Promise<void> {
  /** Demonstrates changing speed mid-stream using generation_config. */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const ctx = ws.context({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
  });

  console.log('Sending normal speed text...');
  await ctx.push({ transcript: 'I am speaking at a normal pace. ' });

  console.log('Sending fast speed text...');
  await ctx.send({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
    transcript: 'But now I am speaking much faster!',
    continue: true,
    generation_config: { speed: 1.5 },
  });

  await ctx.done();

  const filename = `tts_speed_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  for await (const event of ctx.receive()) {
    if (event.type === 'chunk') {
      if (event.audio) file.write(event.audio);
    }
  }

  file.end();
  ws.close();
  console.log(`Saved audio to ${filename}`);
  console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
}

async function ttsWebsocketConcurrentContexts(client: Cartesia): Promise<void> {
  /** Two contexts on one connection, received concurrently via Promise.all(). */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const ctx1 = ws.context({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
  });

  const ctx2 = ws.context({
    model_id: 'sonic-3',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
  });

  // Send to both contexts before receiving.
  await ctx1.push({
    transcript:
      'Context one is speaking now. This is a longer transcript to ensure that ' +
      'audio chunks from both contexts are interleaved on the wire. ' +
      'The quick brown fox jumps over the lazy dog.',
  });
  await ctx1.done();

  await ctx2.push({
    transcript:
      'Context two has a different message. We want to verify that the routing ' +
      'logic correctly separates the audio streams. ' +
      'Pack my box with five dozen liquor jugs.',
  });
  await ctx2.done();

  const ts = timestamp();

  async function collect(ctx: { receive: typeof ctx1.receive }, filename: string): Promise<void> {
    const file = fs.createWriteStream(filename);
    for await (const event of ctx.receive()) {
      if (event.type === 'chunk' && event.audio) {
        file.write(event.audio);
      }
    }
    file.end();
  }

  const filename1 = `tts_concurrent_ctx1_${ts}.pcm`;
  const filename2 = `tts_concurrent_ctx2_${ts}.pcm`;

  await Promise.all([collect(ctx1, filename1), collect(ctx2, filename2)]);

  ws.close();
  console.log(`Saved context 1 audio to ${filename1}`);
  console.log(`Saved context 2 audio to ${filename2}`);
  console.log('Play with:');
  console.log(`  ffplay -f f32le -ar 44100 ${filename1}`);
  console.log(`  ffplay -f f32le -ar 44100 ${filename2}`);
}

async function ttsWebsocketResponseHandling(client: Cartesia): Promise<void> {
  /** WebSocket response type handling with timestamps. */
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_response_handling_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  for await (const event of ws.generate({
    model_id: 'sonic-3',
    transcript: 'Hello, world!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
    add_timestamps: true,
  })) {
    if (event.type === 'chunk') {
      if (event.audio) file.write(event.audio);
    } else if (event.type === 'timestamps') {
      const wt = (event as any).word_timestamps;
      if (wt) {
        console.log(`Words: ${wt.words}, Starts: ${wt.start}, Ends: ${wt.end}`);
      }
    } else if (event.type === 'error') {
      throw new Error(JSON.stringify(event));
    }
  }

  file.end();
  ws.close();
  console.log(`Saved audio to ${filename}`);
  console.log(`Play with: ffplay -f f32le -ar 44100 ${filename}`);
}

// =============================================================================
// Voices API
// =============================================================================

async function voicesList(client: Cartesia): Promise<void> {
  /** List voices with pagination. */
  for await (const voice of client.voices.list({ limit: 10 })) {
    console.log(voice.name);
  }
}

async function voicesGet(client: Cartesia): Promise<void> {
  /** Get a specific voice. */
  const voice = await client.voices.get('6ccbfb76-1fc6-48f7-b71d-91ac6298247b');
  console.log(voice.name);
}

async function voicesClone(client: Cartesia): Promise<void> {
  /** Clone a voice from an audio clip. */
  const clip = fs.createReadStream('sample.wav');
  const voice = await client.voices.clone({
    clip,
    name: 'My Voice',
    description: 'A custom voice',
    language: 'en',
  });
  console.log('Cloned voice:', voice.id);
}

async function voicesUpdate(client: Cartesia): Promise<void> {
  /** Update a voice. */
  await client.voices.update('voice-id', {
    name: 'Updated Name',
    description: 'Updated description',
  });
}

async function voicesDelete(client: Cartesia): Promise<void> {
  /** Delete a voice. */
  await client.voices.delete('voice-id');
}

// =============================================================================
// STT (Speech-to-Text)
// =============================================================================

async function sttTranscribe(client: Cartesia): Promise<void> {
  /** Transcribe audio with word timestamps. */
  const file = fs.createReadStream('audio.wav');
  const response = await client.stt.transcribe({
    file,
    model: 'ink-whisper',
    language: 'en',
    timestamp_granularities: ['word'],
  });
  console.log(response.text);
  if (response.words) {
    for (const word of response.words) {
      console.log(`${word.word}: ${word.start}s - ${word.end}s`);
    }
  }
}

// =============================================================================
// Error Handling
// =============================================================================

async function errorHandling(client: Cartesia): Promise<void> {
  /** Example of error handling with SDK exceptions. */
  try {
    await client.tts.generate({
      model_id: 'sonic-3',
      transcript: 'Hello, world!',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'wav', encoding: 'pcm_f32le', sample_rate: 44100 },
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

const examples: Record<string, (client: Cartesia) => Promise<void>> = {
  ttsGenerateToFile,
  ttsWebsocketBasic,
  ttsWebsocketContinuations,
  ttsWebsocketFlushing,
  ttsWebsocketEmotion,
  ttsWebsocketSpeed,
  ttsWebsocketConcurrentContexts,
  ttsWebsocketResponseHandling,
  voicesList,
  voicesGet,
  voicesClone,
  voicesUpdate,
  voicesDelete,
  sttTranscribe,
  errorHandling,
};

async function main() {
  const name = process.argv[2];

  if (!name || !(name in examples)) {
    console.log('Usage: npx ts-node examples/examples.ts <functionName>');
    console.log(`Available: ${Object.keys(examples).join(', ')}`);
    process.exit(1);
  }

  if (!process.env['CARTESIA_API_KEY']) {
    console.error('Error: CARTESIA_API_KEY environment variable not set.');
    process.exit(1);
  }

  const client = createClient();
  try {
    await examples[name]!(client);
  } catch (e) {
    console.error(`Error: ${e}`);
    process.exit(1);
  }
}

main();
