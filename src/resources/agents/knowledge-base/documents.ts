// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../../core/pagination';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Documents extends APIResource {
  /**
   * Upload a document into a [knowledge base](/line/knowledge-base) folder
   *
   * @example
   * ```ts
   * const document =
   *   await client.agents.knowledgeBase.documents.create();
   * ```
   */
  create(body: DocumentCreateParams, options?: RequestOptions): APIPromise<Document> {
    return this._client.post('/agents/documents', { body, ...options });
  }

  /**
   * Returns the details of a single [knowledge base](/line/knowledge-base) document,
   * including its full content.
   *
   * @example
   * ```ts
   * const document =
   *   await client.agents.knowledgeBase.documents.retrieve(
   *     'document_id',
   *   );
   * ```
   */
  retrieve(documentID: string, options?: RequestOptions): APIPromise<Document> {
    return this._client.get(path`/agents/documents/${documentID}`, options);
  }

  /**
   * Update a [knowledge base](/line/knowledge-base) document's name, content,
   * metadata, or folder
   *
   * @example
   * ```ts
   * const document =
   *   await client.agents.knowledgeBase.documents.update(
   *     'document_id',
   *   );
   * ```
   */
  update(documentID: string, body: DocumentUpdateParams, options?: RequestOptions): APIPromise<Document> {
    return this._client.patch(path`/agents/documents/${documentID}`, { body, ...options });
  }

  /**
   * List all [knowledge base](/line/knowledge-base) documents in your organization
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const document of client.agents.knowledgeBase.documents.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: DocumentListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<DocumentsCursorIDPage, Document> {
    return this._client.getAPIList('/agents/documents', CursorIDPage<Document>, { query, ...options });
  }

  /**
   * Delete a [knowledge base](/line/knowledge-base) document.
   *
   * @example
   * ```ts
   * await client.agents.knowledgeBase.documents.delete(
   *   'document_id',
   * );
   * ```
   */
  delete(
    documentID: string,
    params: DocumentDeleteParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    const { force } = params ?? {};
    return this._client.delete(path`/agents/documents/${documentID}`, {
      query: { force },
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Upload up to 100 [knowledge base](/line/knowledge-base) documents in a single
   * request
   *
   * @example
   * ```ts
   * const documents =
   *   await client.agents.knowledgeBase.documents.createBulk({
   *     documents: [{}],
   *   });
   * ```
   */
  createBulk(
    body: DocumentCreateBulkParams,
    options?: RequestOptions,
  ): APIPromise<DocumentCreateBulkResponse> {
    return this._client.post('/agents/documents/bulk', { body, ...options });
  }

  /**
   * Retry processing a [knowledge base](/line/knowledge-base) document that failed.
   * Documents that are processing or ready are returned unchanged.
   *
   * @example
   * ```ts
   * const document =
   *   await client.agents.knowledgeBase.documents.retry(
   *     'document_id',
   *   );
   * ```
   */
  retry(documentID: string, options?: RequestOptions): APIPromise<Document> {
    return this._client.post(path`/agents/documents/${documentID}/retry`, options);
  }
}

export type DocumentsCursorIDPage = CursorIDPage<Document>;

export interface Document {
  /**
   * The ID of the document.
   */
  id: string;

  /**
   * The full document text.
   */
  content: string;

  /**
   * When the document was uploaded.
   */
  created_at: string;

  /**
   * Why processing failed. `null` unless `status` is `failed`.
   */
  error: string | null;

  /**
   * User-defined string-keyed metadata.
   */
  metadata: { [key: string]: string };

  /**
   * The document's display name, or `null` if unnamed.
   */
  name: string | null;

  /**
   * Processing state of the document.
   */
  status: 'processing' | 'ready' | 'failed';
}

export type DocumentCreateBulkResponse = Array<Document>;

export interface DocumentCreateParams {
  /**
   * The document text. Maximum 1 MB.
   */
  content?: string;

  /**
   * A file uploaded with purpose `knowledge_base_document`, instead of `content`.
   * Its text is extracted in the background.
   */
  file_id?: string;

  /**
   * The folder to upload the document into. Omit or `null` to file it at the root.
   */
  folder_id?: string | null;

  /**
   * User-defined string-keyed metadata. Used to filter retrieval at query time.
   */
  metadata?: { [key: string]: string };

  /**
   * An optional display name for the document. Defaults to the file's name for a
   * file.
   */
  name?: string | null;
}

export interface DocumentUpdateParams {
  /**
   * New document text. Maximum 1 MB. Updating this property triggers re-indexing of
   * the document.
   */
  content?: string;

  /**
   * Move the document to a different folder.
   */
  folder_id?: string | null;

  /**
   * Replacement metadata map. Updating this property triggers re-indexing of the
   * document.
   */
  metadata?: { [key: string]: string };

  /**
   * New display name. Pass `null` to clear.
   */
  name?: string | null;
}

export interface DocumentListParams extends CursorIDPageParams {
  /**
   * The number of documents to return per page, ranging between 1 and 100. Defaults
   * to 10.
   */
  limit?: number;
}

export interface DocumentDeleteParams {
  /**
   * Delete the document even if agents can search it. Agents linked to it stop using
   * it.
   */
  force?: 'true' | 'false';
}

export interface DocumentCreateBulkParams {
  /**
   * The documents to upload. Up to 100 per request.
   */
  documents: Array<DocumentCreateBulkParams.Document>;
}

export namespace DocumentCreateBulkParams {
  /**
   * Provide exactly one of `content` or `file_id`.
   */
  export interface Document {
    /**
     * The document text. Maximum 1 MB.
     */
    content?: string;

    /**
     * A file uploaded with purpose `knowledge_base_document`, instead of `content`.
     * Its text is extracted in the background.
     */
    file_id?: string;

    /**
     * The folder to upload the document into. Omit or `null` to file it at the root.
     */
    folder_id?: string | null;

    /**
     * User-defined string-keyed metadata. Used to filter retrieval at query time.
     */
    metadata?: { [key: string]: string };

    /**
     * An optional display name for the document. Defaults to the file's name for a
     * file.
     */
    name?: string | null;
  }
}

export declare namespace Documents {
  export {
    type Document as Document,
    type DocumentCreateBulkResponse as DocumentCreateBulkResponse,
    type DocumentsCursorIDPage as DocumentsCursorIDPage,
    type DocumentCreateParams as DocumentCreateParams,
    type DocumentUpdateParams as DocumentUpdateParams,
    type DocumentListParams as DocumentListParams,
    type DocumentDeleteParams as DocumentDeleteParams,
    type DocumentCreateBulkParams as DocumentCreateBulkParams,
  };
}
