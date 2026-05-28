'use client';

import { useRef, useState } from 'react';
import Cartesia from '@cartesia/cartesia-js';

const SAMPLE_RATE = 44100;
const BYTES_PER_SAMPLE = 4; // f32le

async function getToken(): Promise<string> {
  const res = await fetch('/api/token', { method: 'POST' });
  const { token } = await res.json();
  return token;
}

// =============================================================================
// Batch: waits for the full response, then plays via <audio> element
// =============================================================================

function BatchCartesiaTTSExample() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(false);

  async function speak() {
    setLoading(true);
    try {
      const client = new Cartesia({ token: await getToken() });
      const response = await client.tts.generate({
        model_id: 'sonic-latest',
        transcript: 'Hello! This audio was generated in one batch and then played.',
        voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
        output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: SAMPLE_RATE },
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = audioRef.current!;
      audio.src = url;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Batch</h2>
      <p>Waits for the full audio, then plays via an audio element.</p>
      <button onClick={speak} disabled={loading}>
        {loading ? 'Generating...' : 'Speak'}
      </button>
      <audio ref={audioRef} controls style={{ display: 'block', marginTop: '0.5rem' }} />
    </section>
  );
}

// =============================================================================
// Streaming: plays audio chunks as they arrive via Web Audio API
// =============================================================================

function StreamingCartesiaTTSExample() {
  const [loading, setLoading] = useState(false);

  async function speak() {
    setLoading(true);
    try {
      const client = new Cartesia({ token: await getToken() });
      const response = await client.tts.generate({
        model_id: 'sonic-latest',
        transcript: 'Hello! This audio is being streamed and played as chunks arrive.',
        voice: { mode: 'id', id: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b' },
        output_format: { container: 'raw', encoding: 'pcm_f32le', sample_rate: SAMPLE_RATE },
      });

      // Stream the response and play each chunk as it arrives.
      // We buffer incoming bytes so we only decode complete f32 samples —
      // getReader() can split chunks at arbitrary byte boundaries.
      const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      let nextStartTime = audioCtx.currentTime;
      const reader = response.body!.getReader();
      let leftover = new Uint8Array(0);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Prepend any leftover bytes from the previous chunk
        let bytes: Uint8Array;
        if (leftover.length > 0) {
          bytes = new Uint8Array(leftover.length + value.length);
          bytes.set(leftover);
          bytes.set(value, leftover.length);
        } else {
          bytes = value;
        }

        // Only decode complete samples, save the remainder
        const usableBytes = bytes.length - (bytes.length % BYTES_PER_SAMPLE);
        leftover = bytes.slice(usableBytes);

        if (usableBytes === 0) continue;

        // Copy to an aligned buffer so Float32Array doesn't throw on unaligned offset
        const aligned = new ArrayBuffer(usableBytes);
        new Uint8Array(aligned).set(bytes.subarray(0, usableBytes));
        const floats = new Float32Array(aligned);

        const buf = audioCtx.createBuffer(1, floats.length, SAMPLE_RATE);
        buf.getChannelData(0).set(floats);

        const source = audioCtx.createBufferSource();
        source.buffer = buf;
        source.connect(audioCtx.destination);

        const startTime = Math.max(nextStartTime, audioCtx.currentTime);
        source.start(startTime);
        nextStartTime = startTime + buf.duration;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Streaming</h2>
      <p>Plays audio chunks as they arrive via the Web Audio API.</p>
      <button onClick={speak} disabled={loading}>
        {loading ? 'Streaming...' : 'Speak'}
      </button>
    </section>
  );
}

// =============================================================================
// Transcribe: uploads an audio file and prints the transcript with timestamps
// =============================================================================

function TranscribeCartesiaSTTExample() {
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [words, setWords] = useState<Cartesia.STTTranscribeResponse.Word[]>([]);

  async function transcribe(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setTranscript('');
    setWords([]);
    try {
      const client = new Cartesia({ token: await getToken() });
      const response = await client.stt.transcribe({
        file,
        model: 'ink-whisper',
        language: 'en',
        timestamp_granularities: ['word'],
      });
      setTranscript(response.text);
      setWords(response.words ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Transcribe</h2>
      <p>Uploads an audio file and transcribes it with word-level timestamps.</p>
      <input type="file" accept="audio/*" onChange={transcribe} disabled={loading} />
      {loading && <p>Transcribing...</p>}
      {transcript && <p style={{ marginTop: '0.5rem' }}>{transcript}</p>}
      {words.length > 0 && (
        <ul>
          {words.map((w, i) => (
            <li key={i}>
              {w.word}: {w.start}s – {w.end}s
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Cartesia TTS + STT — Next.js Example</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
        <BatchCartesiaTTSExample />
        <StreamingCartesiaTTSExample />
        <TranscribeCartesiaSTTExample />
      </div>
    </main>
  );
}
