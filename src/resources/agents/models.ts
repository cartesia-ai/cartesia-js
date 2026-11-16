// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Models extends APIResource {
  /**
   * Get an agent model
   *
   * @example
   * ```ts
   * const model = await client.agents.models.retrieve('x');
   * ```
   */
  retrieve(modelID: string, options?: RequestOptions): APIPromise<Model> {
    return this._client.get(path`/v1/agents/models/${modelID}`, options);
  }

  /**
   * Returns the LLMs available for Managed Agents, including latency and pricing
   * metadata
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const model of client.agents.models.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: ModelListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ModelsCursorIDPage, Model> {
    return this._client.getAPIList('/v1/agents/models', CursorIDPage<Model>, { query, ...options });
  }
}

export type ModelsCursorIDPage = CursorIDPage<Model>;

export interface Model {
  /**
   * Model ID used in agent configuration.
   */
  id: string;

  /**
   * Average response latency in milliseconds.
   */
  average_latency_ms: number | null;

  /**
   * Description of the model.
   */
  description: string | null;

  /**
   * Display name of the model.
   */
  display_name: string;

  /**
   * The model's fixed temperature, or null if temperature is adjustable.
   */
  fixed_temperature: number | null;

  pricing: Model.Pricing;

  /**
   * Company that provides the model.
   */
  provider: string;
}

export namespace Model {
  export interface Pricing {
    /**
     * Price in USD per one million tokens, represented as a decimal string.
     */
    cache_read_per_million_tokens: string;

    /**
     * Price in USD per one million tokens, represented as a decimal string.
     */
    cache_write_per_million_tokens: string;

    currency: 'USD';

    /**
     * Price in USD per one million tokens, represented as a decimal string.
     */
    input_per_million_tokens: string;

    /**
     * Price in USD per one million tokens, represented as a decimal string.
     */
    output_per_million_tokens: string;
  }
}

export interface ModelListParams extends CursorIDPageParams {
  /**
   * The maximum number of items to return, ranging between 1 and 100.
   */
  limit?: number;
}

export declare namespace Models {
  export {
    type Model as Model,
    type ModelsCursorIDPage as ModelsCursorIDPage,
    type ModelListParams as ModelListParams,
  };
}
