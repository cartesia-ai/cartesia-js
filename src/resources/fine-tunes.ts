// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as VoicesAPI from './voices';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class FineTunes extends APIResource {
  /**
   * Create a new fine-tune
   */
  create(body: FineTuneCreateParams, options?: RequestOptions): APIPromise<FineTune> {
    return this._client.post('/fine-tunes/', { body, ...options });
  }

  /**
   * Retrieve a specific fine-tune by ID
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<FineTune> {
    return this._client.get(path`/fine-tunes/${id}`, options);
  }

  /**
   * Paginated list of all fine-tunes for the authenticated user
   */
  list(
    query: FineTuneListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<FineTuneListResponse> {
    return this._client.get('/fine-tunes/', { query, ...options });
  }

  /**
   * Delete a fine-tune
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/fine-tunes/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List all voices created from a fine-tune
   */
  listVoices(
    id: string,
    query: FineTuneListVoicesParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<FineTuneListVoicesResponse> {
    return this._client.get(path`/fine-tunes/${id}/voices`, { query, ...options });
  }
}

/**
 * Information about a fine-tune
 */
export interface FineTune {
  /**
   * Unique identifier for the fine-tune
   */
  id: string;

  /**
   * ID of the dataset used for fine-tuning
   */
  dataset: string;

  /**
   * Description of the fine-tune
   */
  description: string;

  /**
   * Language code of the fine-tune
   */
  language: string;

  /**
   * Base model identifier to fine-tune from
   */
  model_id: string;

  /**
   * Name of the fine-tune
   */
  name: string;

  /**
   * Current status of the fine-tune
   */
  status: 'created' | 'training' | 'completed' | 'failed';
}

/**
 * Paginated list of fine-tunes
 */
export interface FineTuneListResponse {
  /**
   * List of fine-tune objects
   */
  data: Array<FineTune>;

  /**
   * Whether there are more fine-tunes available
   */
  has_more: boolean;
}

/**
 * Paginated list of voices created from a fine-tune
 */
export interface FineTuneListVoicesResponse {
  /**
   * List of voice objects
   */
  data: Array<VoicesAPI.Voice>;

  /**
   * Whether there are more voices available
   */
  has_more: boolean;
}

export interface FineTuneCreateParams {
  /**
   * Dataset ID containing training files
   */
  dataset: string;

  /**
   * Description for the fine-tune
   */
  description: string;

  /**
   * Language code for the fine-tune
   */
  language: string;

  /**
   * Base model ID to fine-tune from
   */
  model_id: string;

  /**
   * Name for the new fine-tune
   */
  name: string;
}

export interface FineTuneListParams {
  /**
   * A cursor to use in pagination. `ending_before` is a fine-tune ID that defines
   * your place in the list. For example, if you make a /fine-tunes request and
   * receive 20 objects, starting with `fine_tune_abc123`, your subsequent call can
   * include `ending_before=fine_tune_abc123` to fetch the previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of fine-tunes to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * A cursor to use in pagination. `starting_after` is a fine-tune ID that defines
   * your place in the list. For example, if you make a /fine-tunes request and
   * receive 20 objects, ending with `fine_tune_abc123`, your subsequent call can
   * include `starting_after=fine_tune_abc123` to fetch the next page of the list.
   */
  starting_after?: string | null;
}

export interface FineTuneListVoicesParams {
  /**
   * A cursor to use in pagination. `ending_before` is a voice ID that defines your
   * place in the list. For example, if you make a fine-tune voices request and
   * receive 20 objects, starting with `voice_abc123`, your subsequent call can
   * include `ending_before=voice_abc123` to fetch the previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of voices to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * A cursor to use in pagination. `starting_after` is a voice ID that defines your
   * place in the list. For example, if you make a fine-tune voices request and
   * receive 20 objects, ending with `voice_abc123`, your subsequent call can include
   * `starting_after=voice_abc123` to fetch the next page of the list.
   */
  starting_after?: string | null;
}

export declare namespace FineTunes {
  export {
    type FineTune as FineTune,
    type FineTuneListResponse as FineTuneListResponse,
    type FineTuneListVoicesResponse as FineTuneListVoicesResponse,
    type FineTuneCreateParams as FineTuneCreateParams,
    type FineTuneListParams as FineTuneListParams,
    type FineTuneListVoicesParams as FineTuneListVoicesParams,
  };
}
