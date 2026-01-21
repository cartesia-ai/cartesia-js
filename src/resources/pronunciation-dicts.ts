// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class PronunciationDicts extends APIResource {
  /**
   * Create a new pronunciation dictionary
   */
  create(body: PronunciationDictCreateParams, options?: RequestOptions): APIPromise<PronunciationDict> {
    return this._client.post('/pronunciation-dicts/', { body, ...options });
  }

  /**
   * Retrieve a specific pronunciation dictionary by ID
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<PronunciationDict> {
    return this._client.get(path`/pronunciation-dicts/${id}`, options);
  }

  /**
   * Update a pronunciation dictionary
   */
  update(
    id: string,
    body: PronunciationDictUpdateParams,
    options?: RequestOptions,
  ): APIPromise<PronunciationDict> {
    return this._client.patch(path`/pronunciation-dicts/${id}`, { body, ...options });
  }

  /**
   * List all pronunciation dictionaries for the authenticated user
   */
  list(
    query: PronunciationDictListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<PronunciationDictsCursorIDPage, PronunciationDict> {
    return this._client.getAPIList('/pronunciation-dicts/', CursorIDPage<PronunciationDict>, {
      query,
      ...options,
    });
  }

  /**
   * Delete a pronunciation dictionary
   */
  remove(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/pronunciation-dicts/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type PronunciationDictsCursorIDPage = CursorIDPage<PronunciationDict>;

/**
 * A dictionary of text-to-alias mappings
 */
export interface PronunciationDict {
  /**
   * Unique identifier for the pronunciation dictionary
   */
  id: string;

  /**
   * ISO 8601 timestamp of when the dictionary was created
   */
  created_at: string;

  /**
   * List of text-to-pronunciation mappings
   */
  items: Array<PronunciationDictItem>;

  /**
   * Name of the pronunciation dictionary
   */
  name: string;

  /**
   * ID of the user who owns this dictionary
   */
  owner_id: string;

  /**
   * Whether this dictionary is pinned for the user
   */
  pinned: boolean;
}

/**
 * A pronunciation dictionary item mapping text to a custom pronunciation
 */
export interface PronunciationDictItem {
  /**
   * A phonetic representation or text to be said in place of the original text
   */
  alias: string;

  /**
   * The original text to be replaced
   */
  text: string;
}

export interface PronunciationDictCreateParams {
  /**
   * Name for the new pronunciation dictionary
   */
  name: string;

  /**
   * Optional initial list of pronunciation mappings
   */
  items?: Array<PronunciationDictItem> | null;
}

export interface PronunciationDictUpdateParams {
  /**
   * Updated list of pronunciation mappings
   */
  items?: Array<PronunciationDictItem> | null;

  /**
   * New name for the pronunciation dictionary
   */
  name?: string | null;
}

export interface PronunciationDictListParams extends CursorIDPageParams {
  /**
   * The number of dictionaries to return per page, ranging between 1 and 100.
   */
  limit?: number | null;
}

export declare namespace PronunciationDicts {
  export {
    type PronunciationDict as PronunciationDict,
    type PronunciationDictItem as PronunciationDictItem,
    type PronunciationDictsCursorIDPage as PronunciationDictsCursorIDPage,
    type PronunciationDictCreateParams as PronunciationDictCreateParams,
    type PronunciationDictUpdateParams as PronunciationDictUpdateParams,
    type PronunciationDictListParams as PronunciationDictListParams,
  };
}
