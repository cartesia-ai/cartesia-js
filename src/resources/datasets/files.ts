// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../core/pagination';
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
  ): PagePromise<FileListResponsesCursorIDPage, FileListResponse> {
    return this._client.getAPIList(path`/datasets/${id}/files`, CursorIDPage<FileListResponse>, {
      query,
      ...options,
    });
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

export type FileListResponsesCursorIDPage = CursorIDPage<FileListResponse>;

/**
 * File stored in a dataset
 */
export interface FileListResponse {
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

export interface FileListParams extends CursorIDPageParams {
  /**
   * The number of files to return per page, ranging between 1 and 100.
   */
  limit?: number | null;
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
    type FileListResponsesCursorIDPage as FileListResponsesCursorIDPage,
    type FileListParams as FileListParams,
    type FileDeleteParams as FileDeleteParams,
    type FileUploadParams as FileUploadParams,
  };
}
