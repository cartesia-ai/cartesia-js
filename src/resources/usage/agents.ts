// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Agents extends APIResource {
  /**
   * Returns your agent usage over time, bucketed by the requested interval.
   */
  retrieve(
    query: AgentRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<AgentRetrieveResponse> {
    return this._client.get('/usage/agents', { query, ...options });
  }
}

export interface AgentRetrieveResponse {
  /**
   * Agent usage buckets in chronological order. Buckets with no recorded activity
   * are returned with zero values.
   */
  data: Array<AgentRetrieveResponse.Data>;
}

export namespace AgentRetrieveResponse {
  /**
   * A single bucket of agent usage within a time window.
   */
  export interface Data {
    /**
     * Number of agent calls that started within the bucket.
     */
    calls: number;

    /**
     * Total cost in US cents accrued within the bucket.
     */
    cents: number;

    /**
     * RFC 3339 timestamp for the end of the usage bucket.
     */
    end_ts: string;

    /**
     * Total minutes of agent runtime within the bucket.
     */
    minutes: number;

    /**
     * RFC 3339 timestamp for the start of the usage bucket.
     */
    start_ts: string;
  }
}

export interface AgentRetrieveParams {
  /**
   * End of the time window, as an RFC 3339 datetime (with timezone). Rounded up to
   * the start of the next UTC day, unless already at midnight. `start_ts` to
   * `end_ts` cannot span more than a year. Must be strictly after `start_ts`.
   */
  end_ts?: string | null;

  /**
   * Omit to receive a single bucket spanning from `start_ts` to `end_ts`.
   */
  interval?: 'day' | 'week' | 'month' | null;

  /**
   * Start of the time window, as an RFC 3339 datetime (with timezone). Rounded down
   * to the start of the UTC day. `start_ts` to `end_ts` cannot span more than a
   * year.
   */
  start_ts?: string | null;
}

export declare namespace Agents {
  export {
    type AgentRetrieveResponse as AgentRetrieveResponse,
    type AgentRetrieveParams as AgentRetrieveParams,
  };
}
