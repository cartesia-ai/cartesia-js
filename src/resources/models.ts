// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Models extends APIResource {
  /**
   * List callable Sonic (TTS) and Ink (STT) model ids.
   */
  list(
    query: ModelListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ListModelsResponse> {
    return this._client.get('/models', { query, ...options });
  }
}

export interface ListModelsResponse {
  /**
   * Callable public model ids for TTS and STT.
   */
  data: Array<ModelCatalogEntry>;
}

/**
 * Which speech API family the model belongs to.
 */
export type ModelCapability = 'tts' | 'stt';

export interface ModelCatalogEntry {
  /**
   * Value clients send as TTS `model_id` or STT `model`.
   */
  id: string;

  /**
   * Which speech API family the model belongs to.
   */
  capability: ModelCapability;

  /**
   * STT transport paths. Omitted on TTS rows.
   */
  modes?: Array<STTMode>;

  /**
   * Language codes supported by this TTS model. Omitted on STT rows.
   */
  supported_languages?: Array<string>;
}

/**
 * STT transport path (`batch` file upload or `stream` websocket).
 */
export type STTMode = 'batch' | 'stream';

export interface ModelListParams {
  /**
   * Filter to `tts` or `stt`. Omit to return both.
   */
  capability?: 'tts' | 'stt';
}

export declare namespace Models {
  export {
    type ListModelsResponse as ListModelsResponse,
    type ModelCapability as ModelCapability,
    type ModelCatalogEntry as ModelCatalogEntry,
    type STTMode as STTMode,
    type ModelListParams as ModelListParams,
  };
}
