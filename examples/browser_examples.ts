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
    output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 44100 },
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
    output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 44100 },
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
// STT WebSocket — Turn Detecting
// =============================================================================

/**
 * Realtime STT with turn detection — recommended for voice agents.
 *
 * Captures microphone audio and prints turn events as the user speaks.
 * Wire `stop` up to a button (or any UI control) to end the session
 * cleanly; this example stops itself after 30 seconds.
 */
async function sttTurnDetectingWebsocket(client: Cartesia): Promise<void> {
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

  const ws = client.stt.turnDetecting.websocket({
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
    for await (const event of ws.stream()) {
      if (event.type === 'message') {
        const m = event.message;
        if (m.type === 'turn.start') console.log('Turn started');
        else if (m.type === 'turn.update') console.log(`Turn (partial): ${m.transcript}`);
        else if (m.type === 'turn.end') console.log(`Turn (final):   ${m.transcript}`);
      } else if (event.type === 'error') {
        console.error('Error:', event.error.message);
      } else if (event.type === 'close') {
        break;
      }
    }
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
// STT WebSocket — External VAD
// =============================================================================

/**
 * Realtime STT with external VAD — recommended for push-to-talk apps.
 *
 * Captures microphone audio, then calls `finalize()` to ask the model for a
 * transcript of everything sent so far. In a real push-to-talk UI you would
 * call `finalize()` on button-up; this example fires it after 5 seconds.
 */
async function sttExternalVADWebsocket(client: Cartesia): Promise<void> {
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

  const ws = client.stt.externalVAD.websocket({
    model: 'ink-whisper',
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
  let transcript = '';

  try {
    for await (const event of ws.stream()) {
      if (event.type === 'message') {
        const m = event.message;
        if (m.type === 'transcript') {
          const tag = m.is_final ? 'final  ' : 'partial';
          console.log(`[${tag}] ${JSON.stringify(m.text)}`);
          if (m.is_final) transcript += m.text;
        } else if (m.type === 'flush_done') {
          console.log('flush_done');
        } else if (m.type === 'done') {
          console.log('done');
        }
      } else if (event.type === 'error') {
        console.error('Error:', event.error.message);
      } else if (event.type === 'close') {
        break;
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

  console.log(`Full transcript: ${JSON.stringify(transcript)}`);
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
  sttTurnDetectingWebsocket,
  sttExternalVADWebsocket,
};
