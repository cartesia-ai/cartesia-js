import * as fs from 'fs';
import { Cartesia } from '../client';
import { type Uploadable } from '../core/uploads';
import {
  type VoiceCloneParams,
  type SupportedLanguage,
  type GenderPresentation,
  type VoiceUpdateParams,
  type VoiceLocalizeParams,
  type VoiceListParams,
} from '../resources/voices';
import { type RequestOptions as InternalRequestOptions } from '../internal/request-options';
import { BackCompatRequestOptions } from './types';
import { wrap, snakeToCamel } from './utils';

export interface BackCompatVoice {
  id: string;
  createdAt: string;
  description: string;
  isOwner: boolean;
  isPublic: boolean;
  language: SupportedLanguage;
  name: string;
  gender?: GenderPresentation | null;
  previewFileUrl?: string | null;
}

export interface BackCompatVoiceMetadata {
  id: string;
  createdAt: string;
  description: string;
  isPublic: boolean;
  language: SupportedLanguage;
  name: string;
  userId: string;
}

export interface BackCompatVoiceListOptions {
  gender?: 'masculine' | 'feminine' | 'gender_neutral' | null;
  isOwner?: boolean | null;
  limit?: number | null;
  q?: string | null;
  expand?: Array<'preview_file_url'> | null;
}

export interface BackCompatCloneVoiceRequest {
  name: string;
  description?: string;
  language: string;
  mode: 'similarity' | 'stability';
  enhance?: boolean;
  baseVoiceId?: string;
}

export interface BackCompatUpdateVoiceRequest {
  name: string;
  description: string;
}

export interface BackCompatLocalizeVoiceRequest {
  voiceId: string;
  name: string;
  description: string;
  language:
    | 'en'
    | 'de'
    | 'es'
    | 'fr'
    | 'ja'
    | 'pt'
    | 'zh'
    | 'hi'
    | 'it'
    | 'ko'
    | 'nl'
    | 'pl'
    | 'ru'
    | 'sv'
    | 'tr';
  originalSpeakerGender: 'male' | 'female';
  dialect?: 'au' | 'in' | 'so' | 'uk' | 'us' | 'mx' | 'pe' | 'br' | 'eu' | 'ca';
}

/** @deprecated Use the new SDK's voices methods on the {@link Cartesia} instance instead. */
export class VoicesWrapper {
  private client: Cartesia;

  constructor(client: Cartesia) {
    this.client = client;
  }

  /** @deprecated Use {@link Cartesia.voices.clone} instead. */
  async clone(
    clip: File | fs.ReadStream | Blob,
    request: BackCompatCloneVoiceRequest,
    requestOptions?: BackCompatRequestOptions,
  ): Promise<BackCompatVoiceMetadata> {
    const params: VoiceCloneParams = {
      clip: clip as Uploadable,
      name: request.name,
      language: request.language as SupportedLanguage,
    };

    if (request.description !== undefined) {
      params.description = request.description;
    }
    if (request.baseVoiceId !== undefined) {
      params.base_voice_id = request.baseVoiceId;
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

    return wrap<any, BackCompatVoiceMetadata>(this.client.voices.clone(params, options));
  }

  /** @deprecated Use {@link Cartesia.voices.update} instead. */
  async update(
    id: string,
    request: BackCompatUpdateVoiceRequest,
    requestOptions?: BackCompatRequestOptions,
  ): Promise<BackCompatVoice> {
    const params: VoiceUpdateParams = {
      name: request.name,
      description: request.description,
    };

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

    return wrap<any, BackCompatVoice>(this.client.voices.update(id, params, options));
  }

  /** @deprecated Use {@link Cartesia.voices.localize} instead. */
  async localize(
    request: BackCompatLocalizeVoiceRequest,
    requestOptions?: BackCompatRequestOptions,
  ): Promise<BackCompatVoiceMetadata> {
    const params: VoiceLocalizeParams = {
      voice_id: request.voiceId,
      name: request.name,
      description: request.description,
      language: request.language as any,
      original_speaker_gender: request.originalSpeakerGender,
    };

    if (request.dialect) {
      params.dialect = request.dialect as any; // Cast dialect as list might vary slightly or be strict
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

    return wrap<any, BackCompatVoiceMetadata>(this.client.voices.localize(params, options));
  }

  /** @deprecated Use {@link Cartesia.voices.get} instead. */
  async get(id: string, requestOptions?: BackCompatRequestOptions): Promise<BackCompatVoice> {
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

    return wrap<any, BackCompatVoice>(this.client.voices.get(id, {}, options));
  }

  /** @deprecated Use {@link Cartesia.voices.list} instead. */
  async list(
    listOptions?: BackCompatVoiceListOptions,
    requestOptions?: BackCompatRequestOptions,
  ): Promise<BackCompatVoice[]> {
    const params: VoiceListParams = {};
    if (listOptions) {
      if (listOptions.gender !== undefined) params.gender = listOptions.gender;
      if (listOptions.isOwner !== undefined) params.is_owner = listOptions.isOwner;
      if (listOptions.limit !== undefined) params.limit = listOptions.limit;
      if (listOptions.q !== undefined) params.q = listOptions.q;
      if (listOptions.expand !== undefined) params.expand = listOptions.expand;
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

    // The new SDK returns a paginated result, we collect all pages
    const voices: BackCompatVoice[] = [];
    for await (const voice of this.client.voices.list(params, options)) {
      voices.push(snakeToCamel(voice) as BackCompatVoice);
    }
    return voices;
  }

  /** @deprecated Use {@link Cartesia.voices.delete} instead. */
  async delete(id: string, requestOptions?: BackCompatRequestOptions): Promise<void> {
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

    return wrap(this.client.voices.delete(id, options));
  }
}
