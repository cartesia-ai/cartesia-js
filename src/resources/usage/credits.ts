// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Credits extends APIResource {
  /**
   * Returns your credit usage over time, bucketed by the requested interval.
   */
  retrieve(
    query: CreditRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CreditRetrieveResponse> {
    return this._client.get('/usage/credits', { query, ...options });
  }
}

export interface CreditRetrieveResponse {
  /**
   * Without `group_by`, flat credit usage buckets in chronological order. With
   * `group_by`, one entry per dimension value; each item includes `id`, optional
   * `label`, and nested daily `buckets`. Empty usage periods are returned with
   * `credits: 0`.
   */
  data: Array<CreditRetrieveResponse.UsageCreditsBucket | CreditRetrieveResponse.UsageCreditsBreakdownSeries>;

  /**
   * Present when the request included `group_by`.
   */
  group_by?: 'capability' | 'model' | 'voice' | 'api_key';
}

export namespace CreditRetrieveResponse {
  /**
   * A single bucket of credit usage within a time window.
   */
  export interface UsageCreditsBucket {
    /**
     * Total credits consumed within the bucket.
     */
    credits: number;

    /**
     * RFC 3339 timestamp for the end of the usage bucket.
     */
    end_ts: string;

    /**
     * RFC 3339 timestamp for the start of the usage bucket.
     */
    start_ts: string;
  }

  /**
   * Credit usage for one value of the requested group-by dimension.
   */
  export interface UsageCreditsBreakdownSeries {
    /**
     * Identifier for the dimension value (capability id, model id, voice id, or API
     * key id / sentinel such as `playground` or `unnamed_key`).
     */
    id: string;

    /**
     * Daily credit buckets for this dimension value.
     */
    buckets: Array<UsageCreditsBreakdownSeries.Bucket>;

    /**
     * Human-readable label when available (voice name, API key description, etc.).
     */
    label?: string | null;
  }

  export namespace UsageCreditsBreakdownSeries {
    /**
     * A single bucket of credit usage within a time window.
     */
    export interface Bucket {
      /**
       * Total credits consumed within the bucket.
       */
      credits: number;

      /**
       * RFC 3339 timestamp for the end of the usage bucket.
       */
      end_ts: string;

      /**
       * RFC 3339 timestamp for the start of the usage bucket.
       */
      start_ts: string;
    }
  }
}

export interface CreditRetrieveParams {
  /**
   * Filter usage to a single API key. When set, only credits attributable to that
   * key are returned. Can be combined with `group_by` for other dimensions
   * (`capability`, `model`, `voice`), but not with `group_by=api_key`.
   */
  api_key_id?: string | null;

  /**
   * End of the time window, as an RFC 3339 datetime (with timezone). Rounded up to
   * the start of the next UTC day, unless already at midnight. `start_ts` to
   * `end_ts` cannot span more than a year.
   */
  end_ts?: string | null;

  /**
   * Break down credit usage by capability, model, voice, or API key. When `interval`
   * is set it must be `day`. Cannot be combined with `api_key_id` when
   * `group_by=api_key`.
   */
  group_by?: 'capability' | 'model' | 'voice' | 'api_key' | null;

  /**
   * Omit to receive a single bucket spanning from `start_ts` to `end_ts`. When
   * `group_by` is set, must be `day` if provided.
   */
  interval?: 'day' | 'week' | 'month' | null;

  /**
   * Start of the time window, as an RFC 3339 datetime (with timezone). Rounded down
   * to the start of the UTC day. `start_ts` to `end_ts` cannot span more than a
   * year.
   */
  start_ts?: string | null;
}

export declare namespace Credits {
  export {
    type CreditRetrieveResponse as CreditRetrieveResponse,
    type CreditRetrieveParams as CreditRetrieveParams,
  };
}
