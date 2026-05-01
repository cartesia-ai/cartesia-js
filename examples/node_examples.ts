/**
 * Node.js examples for Cartesia JS SDK v3.x
 *
 * Run an example:
 *   CARTESIA_API_KEY=... npx ts-node examples/node_examples.ts <functionName>
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

/** Use generate() to get a wav Response and write it to a file. */
async function ttsGenerateToFile(client: Cartesia): Promise<void> {
  const response = await client.tts.generate({
    model_id: 'sonic-3',
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

/** Basic WebSocket usage with generate(). */
async function ttsWebsocketBasic(client: Cartesia): Promise<void> {
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_basic_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    await ws.connect();

    const ctx = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    ctx.push({ transcript: 'Hello, world!' });
    ctx.end();

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
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_continuations_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    await ws.connect();

    const ctx = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    for (const part of ['The road ', 'goes ever ', 'on and ', 'on.']) {
      ctx.push({ transcript: part });
    }
    ctx.end();

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
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const files: Map<number, fs.WriteStream> = new Map();

  try {
    const ctx = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    // 1. Send first transcript
    console.log('Sending first transcript...');
    ctx.push({ transcript: 'Stay hungry, ' });

    // 2. Flush — forces all buffered audio for the first transcript to be generated.
    console.log('Flushing...');
    ctx.flush();

    // 3. Send second transcript
    console.log('Sending second transcript...');
    ctx.push({ transcript: 'stay foolish.' });

    ctx.end();

    const ts = timestamp();

    for await (const event of ctx.receive()) {
      // Log every response, but redact audio data to avoid swamping the console.
      const loggable = { ...(event as any) };
      if (loggable.data) loggable.data = '[...]';
      if (loggable.audio) loggable.audio = '[...]';
      console.log('Event:', JSON.stringify(loggable));

      if (event.type === 'chunk' && event.audio) {
        const flushId = (event as any).flush_id ?? 0;
        if (!files.has(flushId)) {
          const name = `tts_flush_${flushId}_${ts}.pcm`;
          files.set(flushId, fs.createWriteStream(name));
        }
        files.get(flushId)!.write(event.audio);
      } else if (event.type === 'error') {
        throw new Error(`${event.title}: ${event.message}`);
      }
    }

    console.log('\nFinished. Play the generated audio files with:');
    for (const [flushId, f] of files) {
      console.log(`  Flush ID ${flushId}: ffplay -f f32le -ar 44100 ${(f as any).path}`);
    }
  } finally {
    for (const f of files.values()) f.end();
    ws.close();
  }
}

/** Demonstrates changing emotion mid-stream using generation_config. */
async function ttsWebsocketEmotion(client: Cartesia): Promise<void> {
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_emotion_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    await ws.connect();

    const ctx = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    console.log('Sending neutral text...');
    ctx.push({ transcript: 'Well maybe if you just ' });

    console.log('Sending angry text...');
    ctx.push({
      transcript: 'loosen up a little!',
      generation_config: { emotion: 'angry' },
    });

    ctx.end();

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
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_speed_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    await ws.connect();

    const ctx = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    console.log('Sending normal speed text...');
    ctx.push({ transcript: 'I am speaking at a normal pace. ' });

    console.log('Sending fast speed text...');
    ctx.push({
      transcript: 'But now I am speaking much faster!',
      generation_config: { speed: 1.5 },
    });

    ctx.end();

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
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  try {
    await ws.connect();

    const ctx1 = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    const ctx2 = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    // Send to both contexts before receiving.
    ctx1.push({
      transcript:
        'Context one is speaking now. This is a longer transcript to ensure that ' +
        'audio chunks from both contexts are interleaved on the wire. ' +
        'The quick brown fox jumps over the lazy dog.',
    });
    ctx1.end();

    ctx2.push({
      transcript:
        'Context two has a different message. We want to verify that the routing ' +
        'logic correctly separates the audio streams. ' +
        'Pack my box with five dozen liquor jugs.',
    });
    ctx2.end();

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

/**
 * Demonstrates using a single WebSocket connection (via generateWS) to manage
 * multiple contexts concurrently.
 *
 * We spawn separate tasks to push audio to 3 different contexts.
 * We use a single receiver loop to de-multiplex the responses to the correct files.
 */
async function ttsGenerateWSConcurrentContexts(client: Cartesia): Promise<void> {
  const conn = client.tts.generateWS();
  conn.on('error', (err) => console.error('WS error:', err.message));

  const allQuotes = [
    ['Ask not what your country can do for you, ', 'ask what you can do ', 'for your country.'],
    ['I have a dream ', 'that one day this nation ', 'will rise up.'],
    ["In the end, it's not the years in your life that count. ", "It's the life ", 'in your years.'],
  ];

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  // Sender task: pushes the parts of one quote, in order, to a single context_id.
  async function sendTranscript(ctxIndex: number): Promise<void> {
    const transcripts = allQuotes[ctxIndex]!;
    for (let partIdx = 0; partIdx < transcripts.length; partIdx++) {
      const part = transcripts[partIdx]!;
      console.log(`Sending '${part.trim()}' to context ${ctxIndex}`);
      conn.send({
        model_id: 'sonic-3',
        voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
        output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
        context_id: String(ctxIndex),
        transcript: part,
        language: 'en',
        continue: partIdx + 1 < transcripts.length,
      });
      // Small delay to simulate real-time input and interleave requests.
      await sleep(100);
    }
    console.log(`Finished sending to context ${ctxIndex}`);
  }

  const sendTasks = allQuotes.map((_, i) => sendTranscript(i));

  const files = new Map<number, fs.WriteStream>();
  const ts = timestamp();

  console.log('Starting receiver loop...');
  let doneCount = 0;

  try {
    for await (const event of conn) {
      if (event.type !== 'message') continue;
      const msg = event.message;

      if (msg.type === 'chunk') {
        const ctxIndex = Number(msg.context_id);
        if (!files.has(ctxIndex)) {
          const filename = `tts_concurrent_${ctxIndex}_${ts}.pcm`;
          files.set(ctxIndex, fs.createWriteStream(filename));
          console.log(`Created file for context ${ctxIndex}: ${filename}`);
        }
        files.get(ctxIndex)?.write(Buffer.from(msg.data, 'base64'));
      } else if (msg.type === 'done') {
        console.log(`Context ${msg.context_id} finished.`);
        doneCount++;
        if (doneCount === allQuotes.length) {
          console.log('All contexts finished.');
          break;
        }
      } else if (msg.type === 'error') {
        throw new Error(`${msg.title ?? 'error'}: ${msg.message ?? ''}`);
      }
    }

    await Promise.all(sendTasks);
  } finally {
    for (const f of files.values()) f.end();
    conn.close();
  }

  console.log('\nFinished.');
  console.log('You can play the generated audio files with these commands:');
  for (const [ctxIndex, f] of files) {
    console.log(`  Context ${ctxIndex}: ffplay -f f32le -ar 44100 ${(f as any).path}`);
  }
}

/** WebSocket response type handling with timestamps. */
async function ttsWebsocketResponseHandling(client: Cartesia): Promise<void> {
  const ws = client.tts.contextsWS();
  ws.on('error', (err) => console.error('WS error:', err.message));

  const filename = `tts_websocket_response_handling_${timestamp()}.pcm`;
  const file = fs.createWriteStream(filename);

  try {
    await ws.connect();

    const ctx = ws.context({
      model_id: 'sonic-3',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: 44100 },
      language: 'en',
    });

    ctx.push({
      transcript: 'Hello, world!',
      add_timestamps: true,
    });
    ctx.end();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk') {
        if (event.audio) file.write(event.audio);
      } else if (event.type === 'timestamps') {
        const wt = (event as any).word_timestamps;
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
    model_id: 'sonic-3',
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
    model_id: 'sonic-3',
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

/** List voices with pagination. */
async function voicesList(client: Cartesia): Promise<void> {
  for await (const voice of client.voices.list({ limit: 10 })) {
    console.log(voice.name);
  }
}

/** Get a specific voice. */
async function voicesGet(client: Cartesia): Promise<void> {
  const voice = await client.voices.get('6ccbfb76-1fc6-48f7-b71d-91ac6298247b');
  console.log(voice.name);
}

/** Clone a voice from an audio clip. */
async function voicesClone(client: Cartesia): Promise<void> {
  const clip = fs.createReadStream('sample.wav');
  const voice = await client.voices.clone({
    clip,
    name: 'My Voice',
    description: 'A custom voice',
    language: 'en',
  });
  console.log('Cloned voice:', voice.id);
}

/** Update a voice. */
async function voicesUpdate(client: Cartesia): Promise<void> {
  await client.voices.update('voice-id', {
    name: 'Updated Name',
    description: 'Updated description',
  });
}

/** Delete a voice. */
async function voicesDelete(client: Cartesia): Promise<void> {
  await client.voices.delete('voice-id');
}

// =============================================================================
// STT (Speech-to-Text)
// =============================================================================

/** Transcribe audio with word timestamps. */
async function sttTranscribe(client: Cartesia): Promise<void> {
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

/** Example of error handling with SDK exceptions. */
async function errorHandling(client: Cartesia): Promise<void> {
  try {
    await client.tts.generate({
      model_id: 'sonic-3',
      transcript: 'Hello, world!',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'wav', encoding: 'pcm_f32le', sample_rate: 44100 },
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

const examples: Record<string, (client: Cartesia) => Promise<void>> = {
  ttsGenerateToFile,
  ttsWebsocketBasic,
  ttsWebsocketContinuations,
  ttsWebsocketFlushing,
  ttsWebsocketEmotion,
  ttsWebsocketSpeed,
  ttsWebsocketConcurrentContexts,
  ttsGenerateWSConcurrentContexts,
  ttsWebsocketResponseHandling,
  ttsSSEBasic,
  ttsSSEWithTimestamps,
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
    console.log('Usage: npx ts-node examples/node_examples.ts <functionName>');
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
