/// <reference lib="dom" />

/**
 * Browser examples for Cartesia JS SDK v3.x
 *
 * These examples are designed for browser environments. They use browser APIs
 * like Blob, URL.createObjectURL, Audio, and the Web Audio API.
 *
 * To use in a project:
 *   npm install @cartesia/cartesia-js
 *
 * Note: Never embed API keys in client-side code. Use an access token from
 * your backend instead:
 *   const client = new Cartesia({ token: "<access-token>" });
 */

import Cartesia from '@cartesia/cartesia-js';

// =============================================================================
// Client Initialization
// =============================================================================

function createClient(token: string): Cartesia {
  // In a browser, use a short-lived access token from your backend,
  // not a raw API key.
  return new Cartesia({ token });
}

const AUDIO_CHUNK_MS = 100;
const AUDIO_CONTEXT_ENCODING = 'pcm_f32le';

function createFloat32AudioChunker(
  sampleRate: number,
  sendRaw: (chunk: ArrayBufferLike) => void,
): { append(samples: Float32Array): void; flush(): void } {
  const chunkSamples = Math.round((sampleRate * AUDIO_CHUNK_MS) / 1000);
  let pending = new Float32Array(0);

  const send = (samples: Float32Array) => {
    const chunk = new Float32Array(samples.length);
    chunk.set(samples);
    sendRaw(chunk.buffer);
  };

  return {
    append(samples: Float32Array) {
      const combined = new Float32Array(pending.length + samples.length);
      combined.set(pending);
      combined.set(samples, pending.length);

      let offset = 0;
      while (combined.length - offset >= chunkSamples) {
        send(combined.subarray(offset, offset + chunkSamples));
        offset += chunkSamples;
      }

      pending = combined.slice(offset);
    },

    flush() {
      if (pending.length === 0) return;
      send(pending);
      pending = new Float32Array(0);
    },
  };
}

// =============================================================================
// TTS Generate — Play with <audio> element
// =============================================================================

/** Generate a wav and play it using an <audio> element. */
async function ttsPlayAudio(client: Cartesia): Promise<void> {
  const response = await client.tts.generate({
    model_id: 'sonic-latest',
    transcript: 'Hello from the browser!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: ''mp3', encoding: 'pcm_s16le', sample_rate: 44100 },
    language: 'en',
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  await audio.play();
}

// =============================================================================
// TTS Generate — Download as file
// =============================================================================

/** Generate audio and trigger a file download in the browser. */
async function ttsDownloadFile(client: Cartesia): Promise<void> {
  const response = await client.tts.generate({
    model_id: 'sonic-latest',
    transcript: 'This audio will be downloaded as a file.',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: ''mp3', encoding: 'pcm_s16le', sample_rate: 44100 },
    language: 'en',
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'speech.wav';
  a.click();

  URL.revokeObjectURL(url);
}

// =============================================================================
// TTS WebSocket — Stream to Web Audio API
// =============================================================================

/** Stream audio from a WebSocket and play it in real-time with Web Audio API. */
async function ttsWebsocketStreamAudio(client: Cartesia): Promise<void> {
  const sampleRate = 44100;
  const audioCtx = new AudioContext({ sampleRate });

  const chunks: Float32Array[] = [];
  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error(err.message));

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: sampleRate },
      language: 'en',
    });

    await ctx.push({
      transcript: 'This is being streamed in real time from a WebSocket connection.',
    });
    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk' && event.audio) {
        // event.audio is a raw buffer of f32le samples
        const floats = new Float32Array(
          event.audio.buffer,
          event.audio.byteOffset,
          event.audio.byteLength / 4,
        );
        chunks.push(floats);
      } else if (event.type === 'error') {
        console.error(event.title, event.message);
      }
    }
  } finally {
    ws.close();
  }

  // Combine all chunks into a single AudioBuffer and play
  const totalSamples = chunks.reduce((sum, c) => sum + c.length, 0);
  const audioBuffer = audioCtx.createBuffer(1, totalSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  let offset = 0;
  for (const chunk of chunks) {
    channelData.set(chunk, offset);
    offset += chunk.length;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
}

// =============================================================================
// TTS WebSocket — Low-latency streaming playback
// =============================================================================

/** Play audio chunks as they arrive for lowest latency. */
async function ttsWebsocketLowLatency(client: Cartesia): Promise<void> {
  const sampleRate = 44100;
  const audioCtx = new AudioContext({ sampleRate });
  let nextStartTime = audioCtx.currentTime;

  const ws = await client.tts.websocket();
  ws.on('error', (err) => console.error(err.message));

  try {
    const ctx = ws.context({
      model_id: 'sonic-latest',
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: sampleRate },
      language: 'en',
    });

    await ctx.push({
      transcript: 'Low latency streaming. Each chunk plays as soon as it arrives.',
    });
    await ctx.no_more_inputs();

    for await (const event of ctx.receive()) {
      if (event.type === 'chunk' && event.audio) {
        const floats = new Float32Array(
          event.audio.buffer,
          event.audio.byteOffset,
          event.audio.byteLength / 4,
        );

        const audioBuffer = audioCtx.createBuffer(1, floats.length, sampleRate);
        audioBuffer.getChannelData(0).set(floats);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        // Schedule this chunk right after the previous one
        const startTime = Math.max(nextStartTime, audioCtx.currentTime);
        source.start(startTime);
        nextStartTime = startTime + audioBuffer.duration;
      } else if (event.type === 'error') {
        console.error(event.title, event.message);
      }
    }
  } finally {
    ws.close();
  }
}

// =============================================================================
// STT Transcribe — Batch transcription with word timestamps
// =============================================================================

/**
 * Transcribe an audio file with word timestamps.
 *
 * Pass a `File` (e.g. the user's selection from an <input type="file">), or omit
 * it to generate a sample WAV via TTS.
 */
async function sttTranscribeFile(client: Cartesia, file?: File, language = 'en'): Promise<void> {
  async function generateSampleFile(): Promise<File> {
    const transcript = 'The quick brown fox jumps over the lazy dog.';
    console.log(`No audio file provided. Generating a sample for: ${JSON.stringify(transcript)}`);
    const response = await client.tts.generate({
      model_id: 'sonic-latest',
      transcript,
      voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
      output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 16000 },
      language: 'en',
    });
    const blob = await response.blob();
    return new File([blob], 'stt_sample.wav', { type: 'audio/wav' });
  }

  const audioFile = file ?? (await generateSampleFile());

  const response = await client.stt.transcribe({
    file: audioFile,
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

// =============================================================================
// STT WebSocket: (Auto Finalize)
// =============================================================================

/**
 * Realtime STT with turn detection: recommended for voice agents.
 *
 * Captures microphone audio and prints turn events as the user speaks.
 * Wire `stop` up to a button (or any UI control) to end the session
 * cleanly; this example stops itself after 30 seconds.
 */
async function sttAutoFinalizeWebsocket(client: Cartesia): Promise<void> {
  const audioCtx = new AudioContext();

  // AudioWorklet that forwards mono Float32 frames to the main thread.
  const workletSource = `
    class PCMCapture extends AudioWorkletProcessor {
      process(inputs) {
        const ch = inputs[0]?.[0];
        if (ch) this.port.postMessage(ch);
        return true;
      }
    }
    registerProcessor('pcm-capture', PCMCapture);
  `;
  const workletURL = URL.createObjectURL(new Blob([workletSource], { type: 'application/javascript' }));
  await audioCtx.audioWorklet.addModule(workletURL);
  URL.revokeObjectURL(workletURL);

  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(mediaStream);
  const capture = new AudioWorkletNode(audioCtx, 'pcm-capture');

  const ws = client.stt.autoFinalize.websocket({
    model: 'ink-2',
    encoding: AUDIO_CONTEXT_ENCODING,
    sample_rate: audioCtx.sampleRate,
  });
  ws.on('error', (err) => console.error(err.message));

  const audioChunks = createFloat32AudioChunker(audioCtx.sampleRate, (chunk) => ws.sendRaw(chunk));
  let stopped = false;

  capture.port.onmessage = (e) => {
    if (stopped) return;
    const floats: Float32Array = e.data;
    audioChunks.append(floats);
  };
  source.connect(capture);

  // Sends a graceful close so the server finalizes buffered audio first.
  const stop = () => {
    if (stopped) return;
    stopped = true;
    audioChunks.flush();
    ws.send({ type: 'close' });
  };
  const stopTimer = setTimeout(stop, 30_000);

  try {
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

    console.log(`Full transcript: ${JSON.stringify(fullTranscript)}`);
  } finally {
    stopped = true;
    clearTimeout(stopTimer);
    source.disconnect();
    capture.disconnect();
    mediaStream.getTracks().forEach((t) => t.stop());
    await audioCtx.close();
  }
}

// =============================================================================
// STT WebSocket (Manual Finalize)
// =============================================================================

/**
 * Realtime STT (Manual Finalize): recommended for push-to-talk apps.
 *
 * Captures microphone audio, then calls `finalize()` to ask the model for a
 * transcript of everything sent so far. In a real push-to-talk UI you would
 * call `finalize()` on button-up; this example fires it after 5 seconds.
 */
async function sttManualFinalizeWebsocket(client: Cartesia): Promise<void> {
  const audioCtx = new AudioContext();

  const workletSource = `
    class PCMCapture extends AudioWorkletProcessor {
      process(inputs) {
        const ch = inputs[0]?.[0];
        if (ch) this.port.postMessage(ch);
        return true;
      }
    }
    registerProcessor('pcm-capture', PCMCapture);
  `;
  const workletURL = URL.createObjectURL(new Blob([workletSource], { type: 'application/javascript' }));
  await audioCtx.audioWorklet.addModule(workletURL);
  URL.revokeObjectURL(workletURL);

  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(mediaStream);
  const capture = new AudioWorkletNode(audioCtx, 'pcm-capture');

  const ws = client.stt.manualFinalize.websocket({
    model: 'ink-2',
    encoding: AUDIO_CONTEXT_ENCODING,
    sample_rate: audioCtx.sampleRate,
  });
  ws.on('error', (err) => console.error(err.message));

  const audioChunks = createFloat32AudioChunker(audioCtx.sampleRate, (chunk) => ws.sendRaw(chunk));
  let closed = false;

  capture.port.onmessage = (e) => {
    if (closed) return;
    const floats: Float32Array = e.data;
    audioChunks.append(floats);
  };
  source.connect(capture);

  // Push-to-talk: simulate "release button" after 5s, then close after 10s.
  const finalizeTimer = setTimeout(() => {
    audioChunks.flush();
    ws.send('finalize');
  }, 5_000);
  const closeTimer = setTimeout(() => {
    if (closed) return;
    closed = true;
    audioChunks.flush();
    ws.send('close');
  }, 10_000);

  // Transcript chunks are deltas — concatenate is_final chunks to build the
  // full transcript. Do not add or strip whitespace between them.
  let fullTranscript = '';

  try {
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
  } finally {
    closed = true;
    clearTimeout(finalizeTimer);
    clearTimeout(closeTimer);
    source.disconnect();
    capture.disconnect();
    mediaStream.getTracks().forEach((t) => t.stop());
    await audioCtx.close();
  }

  console.log(`Full transcript: ${JSON.stringify(fullTranscript)}`);
}

// =============================================================================
// Exports
// =============================================================================

export {
  createClient,
  ttsPlayAudio,
  ttsDownloadFile,
  ttsWebsocketStreamAudio,
  ttsWebsocketLowLatency,
  sttTranscribeFile,
  sttAutoFinalizeWebsocket,
  sttManualFinalizeWebsocket,
};
