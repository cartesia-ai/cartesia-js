// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as DocumentsAPI from './documents';
import {
  Document,
  DocumentCreateBulkParams,
  DocumentCreateBulkResponse,
  DocumentCreateParams,
  DocumentDeleteParams,
  DocumentListParams,
  DocumentUpdateParams,
  Documents,
  DocumentsCursorIDPage,
} from './documents';
import * as FoldersAPI from './folders';
import {
  Folder,
  FolderCreateParams,
  FolderDeleteParams,
  FolderListParams,
  FolderListResponse,
  FolderUpdateParams,
  Folders,
} from './folders';

export class KnowledgeBase extends APIResource {
  folders: FoldersAPI.Folders = new FoldersAPI.Folders(this._client);
  documents: DocumentsAPI.Documents = new DocumentsAPI.Documents(this._client);
}

KnowledgeBase.Folders = Folders;
KnowledgeBase.Documents = Documents;

export declare namespace KnowledgeBase {
  export {
    Folders as Folders,
    type Folder as Folder,
    type FolderListResponse as FolderListResponse,
    type FolderCreateParams as FolderCreateParams,
    type FolderUpdateParams as FolderUpdateParams,
    type FolderListParams as FolderListParams,
    type FolderDeleteParams as FolderDeleteParams,
  };

  export {
    Documents as Documents,
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
