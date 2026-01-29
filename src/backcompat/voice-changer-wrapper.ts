import * as fs from 'fs';
import { Cartesia } from '../client';
import { type Uploadable } from '../core/uploads';
import { type RequestOptions as InternalRequestOptions } from '../internal/request-options';
import { Readable } from 'stream';
import { BackCompatRequestOptions } from './types';
import { wrap } from './errors';

export interface BackCompatVoiceChangerBytesRequest {
  voiceId: string;
  outputFormatContainer: 'raw' | 'wav' | 'mp3';
  outputFormatSampleRate: 8000 | 16000 | 22050 | 24000 | 44100 | 48000;
  outputFormatEncoding?: 'pcm_f32le' | 'pcm_s16le' | 'mulaw' | 'alaw';
  outputFormatBitRate?: 32000 | 64000 | 96000 | 128000 | 192000;
}

/** @deprecated Use the new SDK's voice changer methods on the {@link Cartesia} instance instead. */
export class VoiceChangerWrapper {
  private client: Cartesia;

  constructor(client: Cartesia) {
    this.client = client;
  }

  /** @deprecated Use {@link Cartesia.voiceChanger.changeVoiceBytes} instead. */
  async bytes(
    clip: File | fs.ReadStream | Blob,
    request: BackCompatVoiceChangerBytesRequest,
    requestOptions?: BackCompatRequestOptions,
  ): Promise<Readable> {
    const params: any = {
      clip: clip as Uploadable,
      'voice[id]': request.voiceId,
      'output_format[container]': request.outputFormatContainer,
      'output_format[sample_rate]': request.outputFormatSampleRate,
    };

    if (request.outputFormatEncoding) {
      params['output_format[encoding]'] = request.outputFormatEncoding;
    }
    if (request.outputFormatBitRate) {
      params['output_format[bit_rate]'] = request.outputFormatBitRate;
    }

    const options: InternalRequestOptions = {};
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

    const response = await wrap(
      this.client.voiceChanger.changeVoiceBytes(params, {
        ...options,
        __binaryResponse: true,
      } as any),
    );

    const responseAny = response as any;

    if (!responseAny.body) {
      throw new Error('Response body is null');
    }

    // @ts-ignore
    return Readable.fromWeb(responseAny.body);
  }
}
