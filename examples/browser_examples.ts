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

// =============================================================================
// TTS Generate — Play with <audio> element
// =============================================================================

async function ttsPlayAudio(client: Cartesia): Promise<void> {
  /** Generate a wav and play it using an <audio> element. */
  const response = await client.tts.generate({
    model_id: 'sonic-3',
    transcript: 'Hello from the browser!',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 44100 },
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

async function ttsDownloadFile(client: Cartesia): Promise<void> {
  /** Generate audio and trigger a file download in the browser. */
  const response = await client.tts.generate({
    model_id: 'sonic-3',
    transcript: 'This audio will be downloaded as a file.',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 44100 },
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

async function ttsWebsocketStreamAudio(client: Cartesia): Promise<void> {
  /** Stream audio from a WebSocket and play it in real-time with Web Audio API. */
  const sampleRate = 44100;
  const audioCtx = new AudioContext({ sampleRate });

  const ws = await client.tts.websocket();

  const chunks: Float32Array[] = [];

  for await (const event of ws.generate({
    model_id: 'sonic-3',
    transcript: 'This is being streamed in real time from a WebSocket connection.',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: sampleRate },
  })) {
    if (event.type === 'chunk' && event.audio) {
      // event.audio is a raw buffer of f32le samples
      const floats = new Float32Array(
        event.audio.buffer,
        event.audio.byteOffset,
        event.audio.byteLength / 4,
      );
      chunks.push(floats);
    }
  }

  ws.close();

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

async function ttsWebsocketLowLatency(client: Cartesia): Promise<void> {
  /** Play audio chunks as they arrive for lowest latency. */
  const sampleRate = 44100;
  const audioCtx = new AudioContext({ sampleRate });
  let nextStartTime = audioCtx.currentTime;

  const ws = await client.tts.websocket();

  for await (const event of ws.generate({
    model_id: 'sonic-3',
    transcript: 'Low latency streaming. Each chunk plays as soon as it arrives.',
    voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
    output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: sampleRate },
  })) {
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
    }
  }

  ws.close();
}

// =============================================================================
// Voices — Display in a list
// =============================================================================

async function voicesListToDOM(client: Cartesia): Promise<void> {
  /** Fetch voices and display them in a <ul> element. */
  const ul = document.createElement('ul');

  for await (const voice of client.voices.list({ limit: 20 })) {
    const li = document.createElement('li');
    li.textContent = `${voice.name} (${voice.language})`;
    ul.appendChild(li);
  }

  document.body.appendChild(ul);
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
  voicesListToDOM,
};
