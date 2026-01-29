// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as FilesAPI from './files';
import {
  FileDeleteParams,
  FileListParams,
  FileListResponse,
  FileListResponsesCursorIDPage,
  FileUploadParams,
  Files,
} from './files';
import { APIPromise } from '../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../core/pagination';
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
  ): PagePromise<DatasetsCursorIDPage, Dataset> {
    return this._client.getAPIList('/datasets/', CursorIDPage<Dataset>, { query, ...options });
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

export type DatasetsCursorIDPage = CursorIDPage<Dataset>;

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

export interface DatasetListParams extends CursorIDPageParams {
  /**
   * The number of Datasets to return per page, ranging between 1 and 100.
   */
  limit?: number | null;
}

Datasets.Files = Files;

export declare namespace Datasets {
  export {
    type Dataset as Dataset,
    type DatasetsCursorIDPage as DatasetsCursorIDPage,
    type DatasetCreateParams as DatasetCreateParams,
    type DatasetUpdateParams as DatasetUpdateParams,
    type DatasetListParams as DatasetListParams,
  };

  export {
    Files as Files,
    type FileListResponse as FileListResponse,
    type FileListResponsesCursorIDPage as FileListResponsesCursorIDPage,
    type FileListParams as FileListParams,
    type FileDeleteParams as FileDeleteParams,
    type FileUploadParams as FileUploadParams,
  };
}
