// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as VoicesAPI from './voices';
import { VoicesCursorIDPage } from './voices';
import { APIPromise } from '../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../core/pagination';
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
  ): PagePromise<FineTunesCursorIDPage, FineTune> {
    return this._client.getAPIList('/fine-tunes/', CursorIDPage<FineTune>, { query, ...options });
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
  ): PagePromise<VoicesCursorIDPage, VoicesAPI.Voice> {
    return this._client.getAPIList(path`/fine-tunes/${id}/voices`, CursorIDPage<VoicesAPI.Voice>, {
      query,
      ...options,
    });
  }
}

export type FineTunesCursorIDPage = CursorIDPage<FineTune>;

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

export interface FineTuneListParams extends CursorIDPageParams {
  /**
   * The number of fine-tunes to return per page, ranging between 1 and 100.
   */
  limit?: number | null;
}

export interface FineTuneListVoicesParams extends CursorIDPageParams {
  /**
   * The number of voices to return per page, ranging between 1 and 100.
   */
  limit?: number | null;
}

export declare namespace FineTunes {
  export {
    type FineTune as FineTune,
    type FineTunesCursorIDPage as FineTunesCursorIDPage,
    type FineTuneCreateParams as FineTuneCreateParams,
    type FineTuneListParams as FineTuneListParams,
    type FineTuneListVoicesParams as FineTuneListVoicesParams,
  };
}

export { type VoicesCursorIDPage };
