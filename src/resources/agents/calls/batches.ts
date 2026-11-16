// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as CallsAPI from './calls';
import { CallBatchesCursorIDPage } from './calls';
import { APIPromise } from '../../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../../core/pagination';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Batches extends APIResource {
  /**
   * Queues a batch of outbound calls. Calls are issued gradually, subject to the
   * organization's and the batch's concurrency limits.
   *
   * @example
   * ```ts
   * const callBatch = await client.agents.calls.batches.create({
   *   agent_id: 'agent_id',
   *   from_number_id: 'from_number_id',
   *   name: 'name',
   *   recipients: [{ to_number: 'to_number' }],
   * });
   * ```
   */
  create(body: BatchCreateParams, options?: RequestOptions): APIPromise<CallsAPI.CallBatch> {
    return this._client.post('/agents/calls/batches', { body, ...options });
  }

  /**
   * Retrieves a batch and the current status of each of its recipients.
   *
   * @example
   * ```ts
   * const callBatch =
   *   await client.agents.calls.batches.retrieve('batch_id');
   * ```
   */
  retrieve(batchID: string, options?: RequestOptions): APIPromise<CallsAPI.CallBatch> {
    return this._client.get(path`/agents/calls/batches/${batchID}`, options);
  }

  /**
   * List Call Batches
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const callBatch of client.agents.calls.batches.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: BatchListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<CallBatchesCursorIDPage, CallsAPI.CallBatch> {
    return this._client.getAPIList('/agents/calls/batches', CursorIDPage<CallsAPI.CallBatch>, {
      query,
      ...options,
    });
  }

  /**
   * Stops dialing the batch's queued calls. Calls already in flight are left to
   * finish. Idempotent.
   *
   * @example
   * ```ts
   * const callBatch = await client.agents.calls.batches.cancel(
   *   'batch_id',
   * );
   * ```
   */
  cancel(batchID: string, options?: RequestOptions): APIPromise<CallsAPI.CallBatch> {
    return this._client.post(path`/agents/calls/batches/${batchID}/cancel`, options);
  }

  /**
   * Re-queues the batch's recipients whose latest call attempt failed or went
   * unanswered, so the dispatcher dials them again. Recipients that successfully
   * completed their call are left untouched. A cancelled batch cannot be retried.
   *
   * @example
   * ```ts
   * const callBatch = await client.agents.calls.batches.retry(
   *   'batch_id',
   * );
   * ```
   */
  retry(batchID: string, options?: RequestOptions): APIPromise<CallsAPI.CallBatch> {
    return this._client.post(path`/agents/calls/batches/${batchID}/retry`, options);
  }
}

export interface BatchCreateParams {
  /**
   * The identifier of the agent that handles the batch's calls.
   */
  agent_id: string;

  /**
   * The identifier of the phone number to place calls from. The attached provider
   * handles outbound calling for this number.
   */
  from_number_id: string;

  /**
   * A label for the batch.
   */
  name: string;

  /**
   * Destinations and optional per-call dynamic variables
   */
  recipients: Array<BatchCreateParams.Recipient>;

  /**
   * Maximum call duration in minutes. Omit to use the default (480 minutes).
   */
  max_call_duration_minutes?: number;

  /**
   * The region from which the batch's outbound calls are dispatched. Valid only when
   * `from_number_id` is a SIP-trunk number; rejected for other telephony account
   * types. Omit to derive the region from the telephony account.
   */
  region?: 'US' | 'EU' | 'APAC';

  /**
   * Seconds to wait for the callee to answer before giving up. Omit to use the
   * default (60 seconds).
   */
  ringing_timeout_seconds?: number;

  /**
   * When to start dispatching the batch, as an RFC3339 timestamp with a timezone
   * offset (e.g. `2026-06-15T16:00:00Z`). Must be in the future and within 30 days.
   * Omit to dispatch immediately.
   */
  scheduled_at?: string;

  /**
   * Maximum number of calls from this batch to dial concurrently. Must not exceed
   * the organization's concurrency limit. Omit to default to half of the
   * organization's agent-call concurrency limit, leaving headroom for other calls.
   */
  target_concurrency_limit?: number;
}

export namespace BatchCreateParams {
  /**
   * Destination and dynamic variables for one outbound call
   */
  export interface Recipient {
    /**
     * Destination phone number for this outbound call, in E.164 format (e.g.,
     * `+14155559876`).
     */
    to_number: string;

    /**
     * Custom values for this call. Supply values for variables used in the welcome
     * message.
     *
     * Names are case-sensitive, up to 64 characters, and use letters, digits, or
     * underscores. Start with a letter or underscore; `system__` and `secret__`
     * prefixes are reserved. Limited to 16 KiB of UTF-8 JSON.
     */
    dynamic_variables?: { [key: string]: string | number | boolean };
  }
}

export interface BatchListParams extends CursorIDPageParams {
  /**
   * Filter to batches for this agent.
   */
  agent_id?: string | null;

  /**
   * (Pagination option) The number of batches to return per page, ranging between 1
   * and 100.
   */
  limit?: number | null;
}

export declare namespace Batches {
  export { type BatchCreateParams as BatchCreateParams, type BatchListParams as BatchListParams };
}

export { type CallBatchesCursorIDPage };
