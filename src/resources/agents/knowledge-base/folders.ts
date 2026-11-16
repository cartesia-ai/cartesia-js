// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as FoldersAPI from './folders';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Folders extends APIResource {
  /**
   * Create a [knowledge base](/line/knowledge-base) folder
   *
   * @example
   * ```ts
   * const folder =
   *   await client.agents.knowledgeBase.folders.create({
   *     name: 'x',
   *   });
   * ```
   */
  create(body: FolderCreateParams, options?: RequestOptions): APIPromise<Folder> {
    return this._client.post('/agents/folders', { body, ...options });
  }

  /**
   * Returns the details of a single [knowledge base](/line/knowledge-base) folder,
   * including its documents and agents that have access to it
   *
   * @example
   * ```ts
   * const folder =
   *   await client.agents.knowledgeBase.folders.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Folder> {
    return this._client.get(path`/agents/folders/${id}`, options);
  }

  /**
   * Update a [knowledge base](/line/knowledge-base) folder's name, parent,
   * documents, or agents
   *
   * @example
   * ```ts
   * const folder =
   *   await client.agents.knowledgeBase.folders.update('id');
   * ```
   */
  update(id: string, params: FolderUpdateParams, options?: RequestOptions): APIPromise<Folder> {
    const { force, ...body } = params;
    return this._client.patch(path`/agents/folders/${id}`, { query: { force }, body, ...options });
  }

  /**
   * List [knowledge base](/line/knowledge-base) folders
   *
   * @example
   * ```ts
   * const folders =
   *   await client.agents.knowledgeBase.folders.list();
   * ```
   */
  list(
    query: FolderListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<FolderListResponse> {
    return this._client.get('/agents/folders', { query, ...options });
  }

  /**
   * Delete a [knowledge base](/line/knowledge-base) folder
   *
   * @example
   * ```ts
   * await client.agents.knowledgeBase.folders.delete('id');
   * ```
   */
  delete(
    id: string,
    params: FolderDeleteParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    const { force } = params ?? {};
    return this._client.delete(path`/agents/folders/${id}`, {
      query: { force },
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface Folder {
  /**
   * The ID of the folder.
   */
  id: string;

  /**
   * Agents that have access to this folder.
   */
  agents: Array<Folder.Agent>;

  /**
   * When the folder was created.
   */
  created_at: string;

  /**
   * Documents inside this folder.
   */
  documents: Array<Folder.Document>;

  /**
   * The folder's name.
   */
  name: string;

  /**
   * The ID of the parent folder, or `null` for top-level folders.
   */
  parent_id: string | null;
}

export namespace Folder {
  /**
   * An agent that has access to this folder.
   */
  export interface Agent {
    /**
     * The ID of the agent.
     */
    id: string;

    /**
     * The name of the agent.
     */
    name: string;
  }

  /**
   * A document summary as returned inside a folder. Does not include the document
   * `content`.
   */
  export interface Document {
    /**
     * The ID of the document.
     */
    id: string;

    /**
     * Agents linked to this document directly, not through a folder.
     */
    agents: Array<Document.Agent>;

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

  export namespace Document {
    /**
     * An agent that has access to this folder.
     */
    export interface Agent {
      /**
       * The ID of the agent.
       */
      id: string;

      /**
       * The name of the agent.
       */
      name: string;
    }
  }
}

export interface FolderListResponse {
  /**
   * The paginated list of top-level folders matching the request.
   */
  data: Array<FolderListResponse.Data>;

  /**
   * Whether more results are available after this page.
   */
  has_more: boolean;

  /**
   * An ID that can be passed as `starting_after` or `ending_before` to get the next
   * page.
   */
  next_page?: string | null;

  /**
   * Documents at the root, outside any folder. Listed on the first page of top-level
   * folders only.
   */
  root_documents?: Array<FolderListResponse.RootDocument>;
}

export namespace FolderListResponse {
  /**
   * A folder with its nested subfolders.
   */
  export interface Data extends FoldersAPI.Folder {
    /**
     * Nested subfolders, up to the requested `depth`. Each child has the same shape as
     * this object, including its own `children`.
     */
    children: Array<FoldersAPI.Folder>;
  }

  /**
   * A document summary as returned inside a folder. Does not include the document
   * `content`.
   */
  export interface RootDocument {
    /**
     * The ID of the document.
     */
    id: string;

    /**
     * Agents linked to this document directly, not through a folder.
     */
    agents: Array<RootDocument.Agent>;

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

  export namespace RootDocument {
    /**
     * An agent that has access to this folder.
     */
    export interface Agent {
      /**
       * The ID of the agent.
       */
      id: string;

      /**
       * The name of the agent.
       */
      name: string;
    }
  }
}

export interface FolderCreateParams {
  /**
   * A human-readable name for the folder. Must be unique among siblings.
   */
  name: string;

  /**
   * ID of the parent folder. Omit or pass `null` to create a top-level folder.
   * Folders can be nested at most three levels deep.
   */
  parent_id?: string | null;
}

export interface FolderUpdateParams {
  /**
   * Query param: Delete the documents left out of `documents` even if agents can
   * search them. Agents linked to them stop using them.
   */
  force?: 'true' | 'false';

  /**
   * Body param: The complete set of agents that have access to this folder. Agents
   * not in the list have their access revoked. Pass an empty array to revoke access
   * for all agents.
   */
  agents?: Array<FolderUpdateParams.Agent>;

  /**
   * Body param: The complete set of documents that should be in this folder.
   * Documents not in the list are deleted. Pass an empty array to delete all
   * documents in the folder.
   */
  documents?: Array<FolderUpdateParams.Document>;

  /**
   * Body param: A new name for the folder. Must be unique among siblings.
   */
  name?: string;

  /**
   * Body param: Move the folder under a new parent, or `null` to move it to the top
   * level. Cannot create a circular reference.
   */
  parent_id?: string | null;
}

export namespace FolderUpdateParams {
  export interface Agent {
    id: string;
  }

  export interface Document {
    id: string;
  }
}

export interface FolderListParams {
  /**
   * How many levels of nested children to include in the response, between 1 and 3.
   * Defaults to 3.
   */
  depth?: number;

  /**
   * A cursor for pagination. Pass the ID of the first folder from the previous page
   * to fetch the previous page.
   */
  ending_before?: string;

  /**
   * The number of folders to return per page, ranging between 1 and 100. Defaults
   * to 10. Pagination applies to the top-level folders in the response; nested
   * children do not count against this limit.
   */
  limit?: number;

  /**
   * Filter to folders with these parent IDs. Repeat the parameter to pass multiple
   * values (e.g., `?parent_ids[]=folder_abc&parent_ids[]=null`). Pass the literal
   * string `null` to include top-level folders. Defaults to `[null]` (top-level
   * folders only).
   */
  parent_ids?: Array<string>;

  /**
   * A cursor for pagination. Pass the ID of the last folder from the previous page
   * to fetch the next page.
   */
  starting_after?: string;
}

export interface FolderDeleteParams {
  /**
   * Delete the folder even if it has subfolders or agents can search it. Its
   * subfolders and documents are deleted too, and agents linked to any of them stop
   * using them.
   */
  force?: 'true' | 'false';
}

export declare namespace Folders {
  export {
    type Folder as Folder,
    type FolderListResponse as FolderListResponse,
    type FolderCreateParams as FolderCreateParams,
    type FolderUpdateParams as FolderUpdateParams,
    type FolderListParams as FolderListParams,
    type FolderDeleteParams as FolderDeleteParams,
  };
}
