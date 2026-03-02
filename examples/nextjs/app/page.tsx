"use client";

import { useRef, useState } from "react";
import Cartesia from "@cartesia/cartesia-js";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(false);

  async function speak() {
    setLoading(true);
    try {
      // 1. Get a short-lived token from our server
      const res = await fetch("/api/token", { method: "POST" });
      const { token } = await res.json();

      // 2. Use it to call TTS from the browser
      const client = new Cartesia({ token });
      const response = await client.tts.generate({
        model_id: "sonic-3",
        transcript: "Hello from Next.js! This audio was generated in the browser using a short-lived access token.",
        voice: { mode: "id", id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b" },
        output_format: { container: "wav", encoding: "pcm_s16le", sample_rate: 44100 },
      });

      // 3. Play it
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
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Cartesia TTS</h1>
      <button onClick={speak} disabled={loading}>
        {loading ? "Generating..." : "Speak"}
      </button>
      <audio ref={audioRef} controls style={{ display: "block", marginTop: "1rem" }} />
    </main>
  );
}
