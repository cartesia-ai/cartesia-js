// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../core/pagination';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';
import { path } from '../internal/utils/path';

export class Voices extends APIResource {
  /**
   * Update the name, description, and gender of a voice. To set the gender back to
   * the default, set the gender to `null`. If gender is not specified, the gender
   * will not be updated.
   *
   * @example
   * ```ts
   * const voice = await client.voices.update('id', {
   *   description: 'description',
   *   name: 'name',
   * });
   * ```
   */
  update(id: string, body: VoiceUpdateParams, options?: RequestOptions): APIPromise<Voice> {
    return this._client.patch(path`/voices/${id}`, { body, ...options });
  }

  /**
   * List Voices
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const voice of client.voices.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: VoiceListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<VoicesCursorIDPage, Voice> {
    return this._client.getAPIList('/voices', CursorIDPage<Voice>, { query, ...options });
  }

  /**
   * Clone a high similarity voice from an audio clip. Clones are more similar to the
   * source clip, but may reproduce background noise. For these, use an audio clip
   * about 5 seconds long.
   *
   * @example
   * ```ts
   * const voiceMetadata = await client.voices.clone();
   * ```
   */
  clone(body: VoiceCloneParams, options?: RequestOptions): APIPromise<VoiceMetadata> {
    return this._client.post(
      '/voices/clone',
      multipartFormRequestOptions({ body, ...options }, this._client),
    );
  }

  /**
   * Get Voice
   *
   * @example
   * ```ts
   * const voice = await client.voices.get('id');
   * ```
   */
  get(
    id: string,
    query: VoiceGetParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Voice> {
    return this._client.get(path`/voices/${id}`, { query, ...options });
  }

  /**
   * Create a new voice from an existing voice localized to a new language and
   * dialect.
   *
   * @example
   * ```ts
   * const voiceMetadata = await client.voices.localize({
   *   description: 'description',
   *   language: 'en',
   *   name: 'name',
   *   original_speaker_gender: 'male',
   *   voice_id: 'voice_id',
   * });
   * ```
   */
  localize(body: VoiceLocalizeParams, options?: RequestOptions): APIPromise<VoiceMetadata> {
    return this._client.post('/voices/localize', { body, ...options });
  }

  /**
   * Delete Voice
   *
   * @example
   * ```ts
   * await client.voices.remove('id');
   * ```
   */
  remove(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/voices/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type VoicesCursorIDPage = CursorIDPage<Voice>;

export type GenderPresentation = 'masculine' | 'feminine' | 'gender_neutral';

/**
 * The language that the given voice should speak the transcript in. For valid
 * options, see [Models](/build-with-cartesia/tts-models).
 */
export type SupportedLanguage =
  | 'en'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt'
  | 'zh'
  | 'ja'
  | 'hi'
  | 'it'
  | 'ko'
  | 'nl'
  | 'pl'
  | 'ru'
  | 'sv'
  | 'tr'
  | 'tl'
  | 'bg'
  | 'ro'
  | 'ar'
  | 'cs'
  | 'el'
  | 'fi'
  | 'hr'
  | 'ms'
  | 'sk'
  | 'da'
  | 'ta'
  | 'uk'
  | 'hu'
  | 'no'
  | 'vi'
  | 'bn'
  | 'th'
  | 'he'
  | 'ka'
  | 'id'
  | 'te'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'pa';

export interface Voice {
  /**
   * The ID of the voice.
   */
  id: string;

  /**
   * The date and time the voice was created.
   */
  created_at: string;

  /**
   * The description of the voice.
   */
  description: string;

  /**
   * Whether your organization owns the voice.
   */
  is_owner: boolean;

  /**
   * Whether the voice is publicly accessible.
   */
  is_public: boolean;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](/build-with-cartesia/tts-models).
   */
  language: SupportedLanguage;

  /**
   * The name of the voice.
   */
  name: string;

  /**
   * The gender of the voice, if specified.
   */
  gender?: GenderPresentation | null;

  /**
   * A URL to download a preview audio file for this voice. Useful to avoid consuming
   * credits when looking for the right voice. The URL requires the same
   * Authorization header. Voice previews may be changed, moved, or deleted so you
   * should avoid storing the URL permanently. This property will be null if there's
   * no preview available. Only included when `expand[]` includes `preview_file_url`.
   */
  preview_file_url?: string | null;
}

export interface VoiceMetadata {
  /**
   * The ID of the voice.
   */
  id: string;

  /**
   * The date and time the voice was created.
   */
  created_at: string;

  /**
   * The description of the voice.
   */
  description: string;

  /**
   * Whether the voice is publicly accessible.
   */
  is_public: boolean;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](/build-with-cartesia/tts-models).
   */
  language: SupportedLanguage;

  /**
   * The name of the voice.
   */
  name: string;

  /**
   * The ID of the user who owns the voice.
   */
  user_id: string;
}

export interface VoiceUpdateParams {
  /**
   * The description of the voice.
   */
  description: string;

  /**
   * The name of the voice.
   */
  name: string;

  gender?: GenderPresentation | null;
}

export interface VoiceListParams extends CursorIDPageParams {
  /**
   * Additional fields to include in the response.
   */
  expand?: Array<'preview_file_url'> | null;

  /**
   * The gender presentation of the voices to return.
   */
  gender?: GenderPresentation | null;

  /**
   * Whether to only return voices owned your organization.
   */
  is_owner?: boolean | null;

  /**
   * The number of Voices to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * Query string to search for voices by name, description, or Voice ID.
   */
  q?: string | null;
}

export interface VoiceCloneParams {
  /**
   * Optional base voice ID that the cloned voice is derived from.
   */
  base_voice_id?: string | null;

  clip?: Uploadable;

  /**
   * A description for the voice.
   */
  description?: string | null;

  /**
   * The language of the voice.
   */
  language?: SupportedLanguage;

  /**
   * The name of the voice.
   */
  name?: string;
}

export interface VoiceGetParams {
  /**
   * Additional fields to include in the response.
   */
  expand?: Array<'preview_file_url'> | null;
}

export interface VoiceLocalizeParams {
  /**
   * The description of the new localized voice.
   */
  description: string;

  /**
   * Target language to localize the voice to.
   *
   * Options: English (en), German (de), Spanish (es), French (fr), Japanese (ja),
   * Portuguese (pt), Chinese (zh), Hindi (hi), Italian (it), Korean (ko), Dutch
   * (nl), Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
   */
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

  /**
   * The name of the new localized voice.
   */
  name: string;

  original_speaker_gender: 'male' | 'female';

  /**
   * The ID of the voice to localize.
   */
  voice_id: string;

  /**
   * The dialect to localize to. Only supported for English (`en`), Spanish (`es`),
   * Portuguese (`pt`), and French (`fr`).
   */
  dialect?: 'au' | 'in' | 'so' | 'uk' | 'us' | 'mx' | 'pe' | 'br' | 'eu' | 'ca' | null;
}

export declare namespace Voices {
  export {
    type GenderPresentation as GenderPresentation,
    type SupportedLanguage as SupportedLanguage,
    type Voice as Voice,
    type VoiceMetadata as VoiceMetadata,
    type VoicesCursorIDPage as VoicesCursorIDPage,
    type VoiceUpdateParams as VoiceUpdateParams,
    type VoiceListParams as VoiceListParams,
    type VoiceCloneParams as VoiceCloneParams,
    type VoiceGetParams as VoiceGetParams,
    type VoiceLocalizeParams as VoiceLocalizeParams,
  };
}
