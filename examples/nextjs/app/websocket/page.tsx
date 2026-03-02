"use client";

import { useState } from "react";
import Cartesia from "@cartesia/cartesia-js";

const SAMPLE_RATE = 44100;

export default function WebSocketExample() {
  const [loading, setLoading] = useState(false);

  async function speak() {
    setLoading(true);
    try {
      // 1. Get a short-lived token from our server
      const res = await fetch("/api/token", { method: "POST" });
      const { token } = await res.json();

      // 2. Connect via WebSocket from the browser
      const client = new Cartesia({ token });
      const ws = await client.tts.websocket();

      // 3. Stream audio and play each chunk as it arrives
      const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      let nextStartTime = audioCtx.currentTime;

      for await (const event of ws.generate({
        model_id: "sonic-3",
        transcript:
          "Hello from a WebSocket! Each audio chunk is played the moment it arrives, giving you the lowest possible latency.",
        voice: { mode: "id", id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b" },
        output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: SAMPLE_RATE },
      })) {
        if (event.type === "chunk" && event.audio) {
          // event.audio is a Uint8Array of f32le samples
          const aligned = new ArrayBuffer(event.audio.byteLength);
          new Uint8Array(aligned).set(event.audio);
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
      }

      ws.close();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Cartesia TTS — WebSocket Streaming</h1>
      <p>
        Uses the SDK&apos;s WebSocket API directly from the browser.
        Audio plays as each chunk arrives for lowest latency.
      </p>
      <button onClick={speak} disabled={loading}>
        {loading ? "Streaming..." : "Speak"}
      </button>
      <p style={{ marginTop: "1rem" }}>
        <a href="/">← Back to HTTP examples</a>
      </p>
    </main>
  );
}
