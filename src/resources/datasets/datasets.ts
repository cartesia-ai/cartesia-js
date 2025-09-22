// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as FilesAPI from './files';
import { FileDeleteParams, FileListParams, FileListResponse, FileUploadParams, Files } from './files';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Datasets extends APIResource {
  files: FilesAPI.Files = new FilesAPI.Files(this._client);

  /**
   * Create a new dataset
   */
  create(body: DatasetCreateParams, options?: RequestOptions): APIPromise<Dataset> {
    return this._client.post('/datasets/', { body, ...options });
  }

  /**
   * Retrieve a specific dataset by ID
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Dataset> {
    return this._client.get(path`/datasets/${id}`, options);
  }

  /**
   * Update an existing dataset
   */
  update(id: string, body: DatasetUpdateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.patch(path`/datasets/${id}`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Paginated list of datasets
   */
  list(
    query: DatasetListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<DatasetListResponse> {
    return this._client.get('/datasets/', { query, ...options });
  }

  /**
   * Delete a dataset
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/datasets/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * A collection of files used for fine-tuning models
 */
export interface Dataset {
  /**
   * Unique identifier for the dataset
   */
  id: string;

  /**
   * Timestamp when the dataset was created
   */
  created_at: string;

  /**
   * Optional description of the dataset
   */
  description: string;

  /**
   * Name of the dataset
   */
  name: string;
}

/**
 * Paginated list of datasets
 */
export interface DatasetListResponse {
  /**
   * List of dataset objects
   */
  data: Array<Dataset>;

  /**
   * Whether there are more datasets available
   */
  has_more: boolean;
}

export interface DatasetCreateParams {
  /**
   * Optional description for the dataset
   */
  description: string;

  /**
   * Name for the new dataset
   */
  name: string;
}

export interface DatasetUpdateParams {
  /**
   * New description for the dataset
   */
  description: string;

  /**
   * New name for the dataset
   */
  name: string;
}

export interface DatasetListParams {
  /**
   * A cursor to use in pagination. `ending_before` is a Dataset ID that defines your
   * place in the list. For example, if you make a /datasets request and receive 20
   * objects, starting with `dataset_abc123`, your subsequent call can include
   * `ending_before=dataset_abc123` to fetch the previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of Datasets to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * A cursor to use in pagination. `starting_after` is a Dataset ID that defines
   * your place in the list. For example, if you make a /datasets request and receive
   * 20 objects, ending with `dataset_abc123`, your subsequent call can include
   * `starting_after=dataset_abc123` to fetch the next page of the list.
   */
  starting_after?: string | null;
}

Datasets.Files = Files;

export declare namespace Datasets {
  export {
    type Dataset as Dataset,
    type DatasetListResponse as DatasetListResponse,
    type DatasetCreateParams as DatasetCreateParams,
    type DatasetUpdateParams as DatasetUpdateParams,
    type DatasetListParams as DatasetListParams,
  };

  export {
    Files as Files,
    type FileListResponse as FileListResponse,
    type FileListParams as FileListParams,
    type FileDeleteParams as FileDeleteParams,
    type FileUploadParams as FileUploadParams,
  };
}
