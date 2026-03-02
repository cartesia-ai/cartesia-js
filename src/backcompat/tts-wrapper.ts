import WebSocket from 'ws';
import { Cartesia } from '../client';
import { BackCompatRequestOptions } from './types';
import { wrap } from './utils';
import { Readable } from 'stream';

// Define compatible interfaces to match the old SDK types for WebSocket
export interface BackCompatWebSocketOptions {
  container?: 'raw' | 'wav' | 'mp3';
  encoding?: 'pcm_f32le' | 'pcm_s16le' | 'pcm_alaw' | 'pcm_mulaw';
  sampleRate: number;
}

export type BackCompatTtsRequestVoiceSpecifier =
  | { mode: 'id'; id: string }
  | { mode: 'embedding'; embedding: number[] };

export interface BackCompatGenerationConfig {
  volume?: number;
  speed?: number;
  emotion?: string[]; // Simplified from strict union for backcompat flexibility
}

export interface BackCompatWebSocketTtsRequest {
  modelId: string;
  transcript: string;
  voice: BackCompatTtsRequestVoiceSpecifier;
  generationConfig?: BackCompatGenerationConfig;
  outputFormat?: {
    container?: 'raw' | 'wav' | 'mp3';
    encoding?: 'pcm_f32le' | 'pcm_s16le' | 'pcm_alaw' | 'pcm_mulaw';
    sampleRate?: number;
    bitRate?: number;
  };
  contextId?: string; // Backcompat might pass this in request?
  // Add other fields as needed
  continue?: boolean;
  duration?: number;
  addTimestamps?: boolean;
  addPhonemeTimestamps?: boolean;
}

export interface BackCompatTtsRequest {
  modelId: string;
  transcript: string;
  voice: BackCompatTtsRequestVoiceSpecifier;
  language?: string;
  outputFormat: {
    container: 'raw' | 'wav' | 'mp3';
    encoding?: 'pcm_f32le' | 'pcm_s16le' | 'pcm_alaw' | 'pcm_mulaw';
    sampleRate: number;
    bitRate?: number;
  };
  generationConfig?: BackCompatGenerationConfig;
  duration?: number;
  speed?: 'slow' | 'normal' | 'fast';
  pronunciationDictId?: string;
}

// Helper for generating UUIDs. Not cryptographically secure.
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class AudioSource {
  private buffers: Buffer[] = [];
  private waiter: ((val?: any) => void) | null = null;
  public isDone = false;

  push(data: Buffer) {
    this.buffers.push(data);
    if (this.waiter) {
      this.waiter();
      this.waiter = null;
    }
  }

  markDone() {
    this.isDone = true;
    if (this.waiter) {
      this.waiter();
      this.waiter = null;
    }
  }

  async read(outBuffer: Float32Array): Promise<number> {
    if (this.buffers.length === 0 && !this.isDone) {
      await new Promise<void>((resolve) => {
        this.waiter = resolve;
      });
    }

    if (this.buffers.length === 0 && this.isDone) {
      return 0;
    }

    let totalFloatsRead = 0;
    let outOffset = 0;
    const maxFloats = outBuffer.length;

    while (this.buffers.length > 0 && totalFloatsRead < maxFloats) {
      const buf = this.buffers[0] as Buffer; // ts not smart enough to check loop condition
      const floatsInBuf = buf.length / 4;
      const floatsNeeded = maxFloats - totalFloatsRead;

      const floatsToCopy = Math.min(floatsInBuf, floatsNeeded);
      const bytesToCopy = floatsToCopy * 4;

      // Copy to outBuffer.
      // Create a view on the buffer to read floats.

      // We need to ensure byteOffset is a multiple of 4.
      // If not, we must copy the buffer to a new one.
      let srcFloats: Float32Array;
      if (buf.byteOffset % 4 === 0) {
        srcFloats = new Float32Array(buf.buffer, buf.byteOffset, floatsInBuf);
      } else {
        const alignedBuf = new Uint8Array(buf);
        srcFloats = new Float32Array(alignedBuf.buffer, alignedBuf.byteOffset, floatsInBuf);
      }

      outBuffer.set(srcFloats.subarray(0, floatsToCopy), outOffset);

      totalFloatsRead += floatsToCopy;
      outOffset += floatsToCopy;

      if (floatsToCopy < floatsInBuf) {
        // We didn't use the whole buffer. Update it.
        this.buffers[0] = buf.subarray(bytesToCopy);
      } else {
        // We used the whole buffer. Remove it.
        this.buffers.shift();
      }
    }

    return totalFloatsRead;
  }
}

export class WebSocketWrapper {
  private client: Cartesia;
  private config: BackCompatWebSocketOptions;
  private socket: WebSocket | null = null;
  private sources: Map<string, AudioSource> = new Map();
  // Fallback source for messages without context_id or if we just want to capture everything (legacy behavior?)
  // The original test didn't use context_id explicitly in send() but expected a response source.
  // We'll map context_id to source.
  private defaultSource: AudioSource | null = null;

  constructor(client: Cartesia, config: BackCompatWebSocketOptions) {
    this.client = client;
    this.config = config;
  }

  async connect() {
    const baseURL = this.client.baseURL;
    // Construct WebSocket URL
    // baseURL is like https://api.cartesia.ai
    let urlStr = baseURL.replace(/^http/, 'ws');
    if (!urlStr.includes('/tts/websocket')) {
      if (urlStr.endsWith('/')) {
        urlStr += 'tts/websocket';
      } else {
        urlStr += '/tts/websocket';
      }
    }

    const url = new URL(urlStr);

    const headers: any = {
      'cartesia-version': '2025-11-04',
    };
    if (this.client.apiKey) {
      headers['Authorization'] = `Bearer ${this.client.apiKey}`;
    }

    this.socket = new WebSocket(url.toString(), {
      headers: headers,
    });

    return new Promise<void>((resolve, reject) => {
      this.socket!.on('open', () => {
        console.log('WebSocket connected.');
        resolve();
      });

      this.socket!.on('error', (err) => {
        console.error('WebSocket error:', err);
        reject(err);
      });

      this.socket!.on('message', (data) => {
        this.handleMessage(data);
      });

      this.socket!.on('close', () => {
        console.log('WebSocket closed.');
        this.sources.forEach((s) => {
          s.markDone();
        });
        if (this.defaultSource) this.defaultSource.markDone();
      });
    });
  }

  private handleMessage(data: WebSocket.Data) {
    try {
      const str = data.toString();
      const msg = JSON.parse(str);

      const contextId = msg.context_id;
      let source = contextId ? this.sources.get(contextId) : this.defaultSource;

      // If we received a message for a context we don't know about, and we have a default source, use it
      if (!source && this.defaultSource) {
        source = this.defaultSource;
      }

      if (msg.type === 'chunk' && msg.data) {
        const audioData = Buffer.from(msg.data, 'base64');
        if (source) source.push(audioData);
      } else if (msg.type === 'done') {
        if (source) source.markDone();
      } else if (msg.type === 'error') {
        console.error('Server error:', msg);
        if (source) source.markDone(); // Fail the stream?
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  }

  async send(request: BackCompatWebSocketTtsRequest) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }

    // Ensure request has a context_id so we can route the response
    const contextId = request.contextId || uuidv4();

    const source = new AudioSource();
    this.sources.set(contextId, source);
    // Also set as default source if none exists, for compatibility with simple tests
    if (!this.defaultSource) {
      this.defaultSource = source;
    }

    // Construct payload
    const payload: any = {
      model_id: request.modelId,
      transcript: request.transcript,
      voice: request.voice,
      context_id: contextId,
    };

    // Output Format
    if (request.outputFormat) {
      payload.output_format = {
        container: request.outputFormat.container,
        encoding: request.outputFormat.encoding,
        sample_rate: request.outputFormat.sampleRate,
        bit_rate: request.outputFormat.bitRate,
      };
    } else if (this.config) {
      payload.output_format = {
        container: this.config.container,
        encoding: this.config.encoding,
        sample_rate: this.config.sampleRate,
      };
    }

    // Generation Config
    if (request.generationConfig) {
      payload.generation_config = request.generationConfig;
    }

    // Other fields
    if (request.continue !== undefined) payload.continue = request.continue;
    if (request.duration !== undefined) payload.duration = request.duration;
    if (request.addTimestamps !== undefined) payload.add_timestamps = request.addTimestamps;
    if (request.addPhonemeTimestamps !== undefined)
      payload.add_phoneme_timestamps = request.addPhonemeTimestamps;

    this.socket.send(JSON.stringify(payload));

    return {
      source: source,
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export interface BackCompatTtsGenerateOptions {
  modelId?: string;
  outputFormat?: {
    container: 'raw' | 'wav' | 'mp3';
    encoding?: 'pcm_f32le' | 'pcm_s16le' | 'pcm_alaw' | 'pcm_mulaw';
    sampleRate: number;
    bitRate?: number;
  };
  language?: string;
  generationConfig?: BackCompatGenerationConfig;
  speed?: 'slow' | 'normal' | 'fast';
  pronunciationDictId?: string;
}

/** @deprecated Use the new SDK's tts methods on the {@link Cartesia} instance instead. */
export class TTSWrapper {
  private client: Cartesia;

  constructor(client: Cartesia) {
    this.client = client;
  }

  /** @deprecated Use {@link Cartesia.tts.websocket} instead. */
  websocket(config: BackCompatWebSocketOptions) {
    return new WebSocketWrapper(this.client, config);
  }

  /**
   * Generate speech from text.
   * @param transcript The text to convert to speech
   * @param voiceId The voice ID to use
   * @param options Generation options
   * @param signal Optional abort signal
   * @param _source Optional source identifier (e.g., "playground_tts") - for tracking purposes
   * @deprecated Use {@link Cartesia.tts.generate} instead.
   */
  async generate(
    transcript: string,
    voiceId: string,
    options?: BackCompatTtsGenerateOptions,
    signal?: AbortSignal,
    _source?: string,
  ): Promise<Readable> {
    const params: any = {
      model_id: options?.modelId ?? 'sonic-2',
      transcript,
      voice: { mode: 'id', id: voiceId },
    };

    if (options?.outputFormat) {
      params.output_format = {
        container: options.outputFormat.container,
        encoding: options.outputFormat.encoding,
        sample_rate: options.outputFormat.sampleRate,
        bit_rate: options.outputFormat.bitRate,
      };
    } else {
      // Default output format
      params.output_format = {
        container: 'wav',
        encoding: 'pcm_s16le',
        sample_rate: 44100,
      };
    }

    if (options?.language) {
      params.language = options.language;
    }
    if (options?.generationConfig) {
      params.generation_config = options.generationConfig;
    }
    if (options?.speed) {
      params.speed = options.speed;
    }
    if (options?.pronunciationDictId) {
      params.pronunciation_dict_id = options.pronunciationDictId;
    }

    const requestOptions: any = {};
    if (signal) {
      requestOptions.signal = signal;
    }

    const response = await wrap(this.client.tts.generate(params, requestOptions));
    if (!response.body) {
      throw new Error('Response body is null');
    }

    return Readable.fromWeb(response.body);
  }

  /** @deprecated Use {@link Cartesia.tts.generate} instead. */
  async bytes(request: BackCompatTtsRequest, requestOptions?: BackCompatRequestOptions): Promise<Readable> {
    const params: any = {
      model_id: request.modelId,
      transcript: request.transcript,
      voice: request.voice,
      generation_config: request.generationConfig,
      duration: request.duration,
      language: request.language,
      speed: request.speed,
      pronunciation_dict_id: request.pronunciationDictId,
    };

    if (request.outputFormat) {
      params.output_format = {
        container: request.outputFormat.container,
        encoding: request.outputFormat.encoding,
        sample_rate: request.outputFormat.sampleRate,
        bit_rate: request.outputFormat.bitRate,
      };
    }

    const options: any = {};
    if (requestOptions) {
      if (requestOptions.timeoutInSeconds) {
        options.timeout = requestOptions.timeoutInSeconds * 1000;
      }
      if (requestOptions.maxRetries !== undefined) {
        options.maxRetries = requestOptions.maxRetries;
      }
      options.headers = requestOptions.headers;
      options.signal = requestOptions.abortSignal;
    }

    const response = await wrap(this.client.tts.generate(params, options));
    if (!response.body) {
      throw new Error('Response body is null');
    }

    return Readable.fromWeb(response.body);
  }
}
