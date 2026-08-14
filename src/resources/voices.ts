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
   * Update the name, description, gender, and accent of a voice. To set the gender
   * back to the default, set the gender to `null`. If gender is not specified, the
   * gender will not be updated.
   *
   * @example
   * ```ts
   * const voice = await client.voices.update('id');
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
    // `expand` must go over the wire as `expand[]` (the API requires the bracketed
    // form). Query arrays serialize with `repeat` by default, so send the bracketed
    // key explicitly to preserve backwards compatibility.
    const { expand, ...restQuery } = query ?? {};
    return this._client.getAPIList('/voices', CursorIDPage<Voice>, {
      query: { ...restQuery, ...(expand != null ? { 'expand[]': expand } : {}) },
      ...options,
    });
  }

  /**
   * Delete Voice
   *
   * @example
   * ```ts
   * await client.voices.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/voices/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Clone a high similarity voice from an audio clip. Clones are more similar to the
   * source clip, but may reproduce background noise. For these, use an audio clip
   * about 5 seconds long.
   *
   * @example
   * ```ts
   * const voiceMetadata = await client.voices.clone({
   *   clip: fs.createReadStream('path/to/file'),
   *   language: 'en',
   *   name: 'name',
   * });
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
    // `expand` must go over the wire as `expand[]` (the API requires the bracketed
    // form). Query arrays serialize with `repeat` by default, so send the bracketed
    // key explicitly to preserve backwards compatibility.
    const { expand, ...restQuery } = query ?? {};
    return this._client.get(path`/voices/${id}`, {
      query: { ...restQuery, ...(expand != null ? { 'expand[]': expand } : {}) },
      ...options,
    });
  }

  /**
   * Returns the official catalog of supported accents. Use `id` as `Voice.accent`
   * and as `POST /voices/localize` `accent`. `name` is the human-readable display
   * name. `is_localizable` is true when localize can target the accent.
   *
   * @example
   * ```ts
   * const listAccentsResponse =
   *   await client.voices.listAccents();
   * ```
   */
  listAccents(options?: RequestOptions): APIPromise<ListAccentsResponse> {
    return this._client.get('/accents', options);
  }

  /**
   * Create a new voice from an existing voice localized to a new language and
   * dialect.
   *
   * @example
   * ```ts
   * const voiceMetadata = await client.voices.localize({
   *   accent: 'southern-us',
   *   name: 'name',
   *   voice_id: 'voice_id',
   * });
   * ```
   */
  localize(body: VoiceLocalizeParams, options?: RequestOptions): APIPromise<VoiceMetadata> {
    return this._client.post('/voices/localize', { body, ...options });
  }
}

export type VoicesCursorIDPage = CursorIDPage<Voice>;

/**
 * One accent in the public catalog returned by GET /accents.
 */
export interface Accent {
  /**
   * Catalog accent id from GET /accents (for example `southern-us` or `parisian`).
   * Display names are rejected on this API version.
   */
  id: VoiceAccent;

  /**
   * Whether this accent is the default for its `locale`.
   */
  is_locale_default: boolean;

  /**
   * Whether POST /voices/localize can target this accent.
   */
  is_localizable: boolean;

  /**
   * ISO 639-1 language subtag (for example `en`).
   */
  language: string;

  /**
   * Canonical locale for this accent (BCP-47, for example `en-US`).
   */
  locale: string;

  /**
   * Human-readable display name (for example `General American English`).
   */
  name: string;
}

export type Gender = 'male' | 'female';

export type GenderPresentation = 'masculine' | 'feminine' | 'gender_neutral';

export interface ListAccentsResponse {
  /**
   * Official accents, sorted by id.
   */
  accents: Array<Accent>;
}

/**
 * The dialect to localize to. Only supported for English (`en`), Spanish (`es`),
 * Portuguese (`pt`), and French (`fr`).
 */
export type LocalizeDialect = 'au' | 'in' | 'so' | 'uk' | 'us' | 'mx' | 'pe' | 'br' | 'eu' | 'ca';

/**
 * Target language to localize the voice to.
 *
 * Options: English (en), German (de), Spanish (es), French (fr), Japanese (ja),
 * Portuguese (pt), Chinese (zh), Hindi (hi), Italian (it), Korean (ko), Dutch
 * (nl), Polish (pl), Russian (ru), Swedish (sv), Turkish (tr), Arabic (ar), Hebrew
 * (he), Tamil (ta), Telugu (te), Thai (th).
 */
export type LocalizeTargetLanguage =
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
  | 'tr'
  | 'ar'
  | 'he'
  | 'ta'
  | 'te'
  | 'th';

/**
 * The language that the given voice should speak the transcript in. For valid
 * options, see [Models](https://docs.cartesia.ai/build-with-cartesia/tts-models).
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
  | 'pa'
  | 'or'
  | 'ur'
  | (string & {});

export interface Voice {
  /**
   * The ID of the voice.
   */
  id: string;

  /**
   * Who can use the resource. `private` means only the owner can use the resource.
   * `public` means everyone can use the resource.
   */
  access: 'private' | 'public';

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
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](https://docs.cartesia.ai/build-with-cartesia/tts-models).
   */
  language: SupportedLanguage;

  /**
   * Locales this voice can speak. The native/source locale is first
   * (`is_native: true`), followed by attached cross-lingual locales. Locale codes
   * are BCP-47 language-region tags (for example `en-US`, `es-MX`).
   */
  locales: Array<VoiceLocale>;

  /**
   * The display name of the voice. Does not include the tagline.
   */
  name: string;

  /**
   * A short descriptor for the voice (at most 32 characters). Empty string when
   * unset.
   */
  tagline: string;

  /**
   * When the resource is returned by the list endpoint. `owner` means the resource
   * appears for the owner only. `all` means the resource appears for all users.
   */
  visibility: 'owner' | 'all';

  /**
   * Catalog accent id from GET /accents (for example `southern-us` or `parisian`).
   * Display names are rejected on this API version.
   */
  accent?: VoiceAccent | null;

  /**
   * @deprecated Deprecated. Prefer `locales[].locale` (BCP-47). ISO 3166-1 alpha-2
   * country code when available (e.g. `US`, `GB`, `FR`).
   */
  country?: string | null;

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

/**
 * Catalog accent id from GET /accents (for example `southern-us` or `parisian`).
 * Display names are rejected on this API version.
 */
export type VoiceAccent =
  | 'abruzzo-italian'
  | 'african-american'
  | 'african-french'
  | 'arabic'
  | 'arabic-english'
  | 'australian'
  | 'bagheli'
  | 'belgian-french'
  | 'brazilian-portuguese'
  | 'british'
  | 'budapest'
  | 'bulgarian'
  | 'california'
  | 'camba'
  | 'campania'
  | 'canadian-english'
  | 'canadian-french'
  | 'castilian'
  | 'central-tamil'
  | 'central-thai'
  | 'central-vietnamese'
  | 'chilean'
  | 'colombian'
  | 'czech'
  | 'danish'
  | 'european-portuguese'
  | 'finnish'
  | 'general-american'
  | 'high-german'
  | 'hindi'
  | 'indian-english'
  | 'indian-urdu'
  | 'irish'
  | 'israeli'
  | 'istanbul'
  | 'italian'
  | 'jakarta'
  | 'japanese'
  | 'jessore'
  | 'khaleeji'
  | 'konkani'
  | 'korean'
  | 'kyiv'
  | 'malay'
  | 'mandarin'
  | 'manila'
  | 'mexican'
  | 'middle-eastern-arabic'
  | 'midwestern-american'
  | 'modern-standard-arabic'
  | 'moldovan'
  | 'new-york'
  | 'new-zealand'
  | 'north-kerala'
  | 'odia'
  | 'oslo'
  | 'parisian'
  | 'parsi'
  | 'peruvian'
  | 'polish'
  | 'powadhi'
  | 'randstad'
  | 'romanian'
  | 'russian'
  | 'singaporean'
  | 'slovak'
  | 'south-african'
  | 'southern-us'
  | 'southern-karnataka'
  | 'southern-vietnamese'
  | 'standard-japanese'
  | 'stockholm'
  | 'swiss-standard'
  | 'taiwanese-mandarin'
  | 'tbilisi'
  | 'telangana'
  | 'urdu'
  | 'thessaloniki'
  | 'zagreb';

/**
 * One locale a voice can speak, as a BCP-47 language-region tag plus whether it is
 * the voice's native/source locale.
 */
export interface VoiceLocale {
  /**
   * Whether this is the voice's native/source locale.
   */
  is_native: boolean;

  /**
   * The locale's BCP-47 language-region tag (e.g. `en-US`).
   */
  locale: string;
}

export interface VoiceMetadata {
  /**
   * The ID of the voice.
   */
  id: string;

  /**
   * Who can use the resource. `private` means only the owner can use the resource.
   * `public` means everyone can use the resource.
   */
  access: 'private' | 'public';

  /**
   * The date and time the voice was created.
   */
  created_at: string;

  /**
   * A description for the voice, typically longer than the tagline if both are
   * provided.
   */
  description: string;

  /**
   * The language that the given voice should speak the transcript in. For valid
   * options, see [Models](https://docs.cartesia.ai/build-with-cartesia/tts-models).
   */
  language: SupportedLanguage;

  /**
   * The name of the voice.
   */
  name: string;

  /**
   * A few words describing the voice.
   */
  tagline: string;

  /**
   * The ID of the user who owns the voice.
   */
  user_id: string;

  /**
   * When the resource is returned by the list endpoint. `owner` means the resource
   * appears for the owner only. `all` means the resource appears for all users.
   */
  visibility: 'owner' | 'all';
}

export interface VoiceUpdateParams {
  /**
   * Catalog accent id from GET /accents (for example `southern-us` or `parisian`).
   * Display names are rejected on this API version.
   */
  accent?: VoiceAccent | null;

  /**
   * The description of the voice.
   */
  description?: string;

  gender?: GenderPresentation | null;

  /**
   * The name of the voice.
   */
  name?: string;
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
  clip: Uploadable;

  /**
   * The language of the voice.
   */
  language: SupportedLanguage;

  /**
   * The name of the voice.
   */
  name: string;

  /**
   * Catalog accent id from GET /accents (for example `southern-us` or `parisian`).
   * Display names are rejected on this API version.
   */
  accent?: VoiceAccent | null;

  /**
   * Optional base voice ID that the cloned voice is derived from.
   */
  base_voice_id?: string | null;

  /**
   * A description for the voice.
   */
  description?: string | null;
}

export interface VoiceGetParams {
  /**
   * Additional fields to include in the response.
   */
  expand?: Array<'preview_file_url'> | null;
}

export interface VoiceLocalizeParams {
  /**
   * Catalog accent id from GET /accents (for example `southern-us` or `parisian`).
   * Display names are rejected on this API version.
   */
  accent: VoiceAccent;

  /**
   * The name of the new localized voice.
   */
  name: string;

  /**
   * The ID of the voice to localize.
   */
  voice_id: string;

  /**
   * The description of the new localized voice.
   */
  description?: string;

  /**
   * The dialect to localize to. Only supported for English (`en`), Spanish (`es`),
   * Portuguese (`pt`), and French (`fr`).
   */
  dialect?: LocalizeDialect | null;

  /**
   * Target language to localize the voice to.
   *
   * Options: English (en), German (de), Spanish (es), French (fr), Japanese (ja),
   * Portuguese (pt), Chinese (zh), Hindi (hi), Italian (it), Korean (ko), Dutch
   * (nl), Polish (pl), Russian (ru), Swedish (sv), Turkish (tr), Arabic (ar), Hebrew
   * (he), Tamil (ta), Telugu (te), Thai (th).
   */
  language?: LocalizeTargetLanguage;

  original_speaker_gender?: Gender;

  /**
   * Optional short tagline for the localized voice.
   */
  tagline?: string;
}

export declare namespace Voices {
  export {
    type Accent as Accent,
    type Gender as Gender,
    type GenderPresentation as GenderPresentation,
    type ListAccentsResponse as ListAccentsResponse,
    type LocalizeDialect as LocalizeDialect,
    type LocalizeTargetLanguage as LocalizeTargetLanguage,
    type SupportedLanguage as SupportedLanguage,
    type Voice as Voice,
    type VoiceAccent as VoiceAccent,
    type VoiceLocale as VoiceLocale,
    type VoiceMetadata as VoiceMetadata,
    type VoicesCursorIDPage as VoicesCursorIDPage,
    type VoiceUpdateParams as VoiceUpdateParams,
    type VoiceListParams as VoiceListParams,
    type VoiceCloneParams as VoiceCloneParams,
    type VoiceGetParams as VoiceGetParams,
    type VoiceLocalizeParams as VoiceLocalizeParams,
  };
}
