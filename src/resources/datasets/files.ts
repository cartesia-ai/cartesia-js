// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { type Uploadable } from '../../core/uploads';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { multipartFormRequestOptions } from '../../internal/uploads';
import { path } from '../../internal/utils/path';

export class Files extends APIResource {
  /**
   * Paginated list of files in a dataset
   */
  list(
    id: string,
    query: FileListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<FileListResponse> {
    return this._client.get(path`/datasets/${id}/files`, { query, ...options });
  }

  /**
   * Remove a file from a dataset
   */
  delete(fileID: string, params: FileDeleteParams, options?: RequestOptions): APIPromise<void> {
    const { id } = params;
    return this._client.delete(path`/datasets/${id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Upload a new file to a dataset
   */
  upload(id: string, body: FileUploadParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      path`/datasets/${id}/files`,
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }
}

/**
 * Paginated list of files in a dataset
 */
export interface FileListResponse {
  /**
   * List of file objects
   */
  data: Array<FileListResponse.Data>;

  /**
   * Whether there are more files available
   */
  has_more: boolean;
}

export namespace FileListResponse {
  /**
   * File stored in a dataset
   */
  export interface Data {
    /**
     * Unique identifier for the file
     */
    id: string;

    /**
     * Timestamp when the file was created
     */
    created_at: string;

    /**
     * Original filename
     */
    filename: string;

    /**
     * Size of the file in bytes
     */
    size: number;
  }
}

export interface FileListParams {
  /**
   * A cursor to use in pagination. `ending_before` is a file ID that defines your
   * place in the list. For example, if you make a dataset files request and receive
   * 20 objects, starting with `file_abc123`, your subsequent call can include
   * `ending_before=file_abc123` to fetch the previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of files to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * A cursor to use in pagination. `starting_after` is a file ID that defines your
   * place in the list. For example, if you make a dataset files request and receive
   * 20 objects, ending with `file_abc123`, your subsequent call can include
   * `starting_after=file_abc123` to fetch the next page of the list.
   */
  starting_after?: string | null;
}

export interface FileDeleteParams {
  /**
   * ID of the dataset containing the file
   */
  id: string;
}

export interface FileUploadParams {
  file?: Uploadable;

  /**
   * Purpose of the file (e.g., fine_tune)
   */
  purpose?: string;
}

export declare namespace Files {
  export {
    type FileListResponse as FileListResponse,
    type FileListParams as FileListParams,
    type FileDeleteParams as FileDeleteParams,
    type FileUploadParams as FileUploadParams,
  };
}
