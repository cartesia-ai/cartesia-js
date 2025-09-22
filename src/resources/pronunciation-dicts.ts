// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
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
  ): APIPromise<PronunciationDictListResponse> {
    return this._client.get('/pronunciation-dicts/', { query, ...options });
  }

  /**
   * Delete a pronunciation dictionary
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/pronunciation-dicts/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Pin a pronunciation dictionary for the authenticated user
   */
  pin(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/pronunciation-dicts/${id}/pin`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Unpin a pronunciation dictionary for the authenticated user
   */
  unpin(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/pronunciation-dicts/${id}/unpin`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

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

/**
 * Paginated list of pronunciation dictionaries
 */
export interface PronunciationDictListResponse {
  /**
   * List of pronunciation dictionary objects
   */
  data: Array<PronunciationDict>;

  /**
   * Whether there are more dictionaries available
   */
  has_more: boolean;
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

export interface PronunciationDictListParams {
  /**
   * A cursor to use in pagination. `ending_before` is a dictionary ID that defines
   * your place in the list. For example, if you make a request and receive 20
   * objects, starting with `dict_abc123`, your subsequent call can include
   * `ending_before=dict_abc123` to fetch the previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of dictionaries to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * A cursor to use in pagination. `starting_after` is a dictionary ID that defines
   * your place in the list. For example, if you make a request and receive 20
   * objects, ending with `dict_abc123`, your subsequent call can include
   * `starting_after=dict_abc123` to fetch the next page of the list.
   */
  starting_after?: string | null;
}

export declare namespace PronunciationDicts {
  export {
    type PronunciationDict as PronunciationDict,
    type PronunciationDictItem as PronunciationDictItem,
    type PronunciationDictListResponse as PronunciationDictListResponse,
    type PronunciationDictCreateParams as PronunciationDictCreateParams,
    type PronunciationDictUpdateParams as PronunciationDictUpdateParams,
    type PronunciationDictListParams as PronunciationDictListParams,
  };
}
