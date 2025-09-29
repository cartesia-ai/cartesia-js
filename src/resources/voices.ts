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
   * Get Voice
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Voice> {
    return this._client.get(path`/voices/${id}`, options);
  }

  /**
   * Update the name, description, and gender of a voice. To set the gender back to
   * the default, set the gender to `null`. If gender is not specified, the gender
   * will not be updated.
   */
  update(id: string, body: VoiceUpdateParams, options?: RequestOptions): APIPromise<Voice> {
    return this._client.patch(path`/voices/${id}`, { body, ...options });
  }

  /**
   * List Voices
   */
  list(query: VoiceListParams, options?: RequestOptions): PagePromise<VoicesCursorIDPage, Voice> {
    return this._client.getAPIList('/voices/', CursorIDPage<Voice>, { query, ...options });
  }

  /**
   * Delete Voice
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
   */
  clone(body: VoiceCloneParams, options?: RequestOptions): APIPromise<VoiceMetadata> {
    return this._client.post(
      '/voices/clone',
      multipartFormRequestOptions({ body, ...options }, this._client),
    );
  }

  /**
   * Create a new voice from an existing voice localized to a new language and
   * dialect.
   */
  localize(body: VoiceLocalizeParams, options?: RequestOptions): APIPromise<VoiceMetadata> {
    return this._client.post('/voices/localize', { body, ...options });
  }
}

export type VoicesCursorIDPage = CursorIDPage<Voice>;

export type GenderPresentation = 'masculine' | 'feminine' | 'gender_neutral';

/**
 * The language that the given voice should speak the transcript in.
 *
 * Options: English (en), French (fr), German (de), Spanish (es), Portuguese (pt),
 * Chinese (zh), Japanese (ja), Hindi (hi), Italian (it), Korean (ko), Dutch (nl),
 * Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
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
  | 'tr';

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
   * Whether the current user is the owner of the voice.
   */
  is_owner: boolean;

  /**
   * Whether the voice is publicly accessible.
   */
  is_public: boolean;

  /**
   * The language that the given voice should speak the transcript in.
   *
   * Options: English (en), French (fr), German (de), Spanish (es), Portuguese (pt),
   * Chinese (zh), Japanese (ja), Hindi (hi), Italian (it), Korean (ko), Dutch (nl),
   * Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
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
   * Whether the current user has starred the voice. Only included when `expand`
   * includes `is_starred`.
   */
  is_starred?: boolean | null;
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
   * The language that the given voice should speak the transcript in.
   *
   * Options: English (en), French (fr), German (de), Spanish (es), Portuguese (pt),
   * Chinese (zh), Japanese (ja), Hindi (hi), Italian (it), Korean (ko), Dutch (nl),
   * Polish (pl), Russian (ru), Swedish (sv), Turkish (tr).
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
   * The gender presentation of the voices to return.
   */
  gender: GenderPresentation | null;

  /**
   * Additional fields to include in the response.
   */
  expand?: Array<'is_starred'> | null;

  /**
   * Whether to only return voices owned by the current user.
   */
  is_owner?: boolean | null;

  /**
   * Whether to only return starred voices.
   */
  is_starred?: boolean | null;

  /**
   * The number of Voices to return per page, ranging between 1 and 100.
   */
  limit?: number | null;
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
   * Whether to apply AI enhancements to the clip to reduce background noise. This is
   * not recommended unless the source clip is extremely low quality.
   */
  enhance?: boolean | null;

  /**
   * The language of the voice.
   */
  language?: SupportedLanguage;

  /**
   * The name of the voice.
   */
  name?: string;
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
    type VoiceLocalizeParams as VoiceLocalizeParams,
  };
}
