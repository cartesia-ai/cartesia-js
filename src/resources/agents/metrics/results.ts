// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as CallsAPI from '../calls';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';

export class Results extends APIResource {
  /**
   * Paginated list of metric results. Filter results using the query parameters,
   */
  list(
    query: ResultListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ResultListResponse> {
    return this._client.get('/agents/metrics/results', { query, ...options });
  }

  /**
   * Export metric results to a CSV file. This endpoint is paginated with a default
   * of 10 results per page and maximum of 100 results per page. Information on
   * pagination can be found in the headers `x-has-more`, `x-limit`, and
   * `x-next-page`.
   */
  export(query: ResultExportParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/agents/metrics/results/export', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface ResultListResponse {
  /**
   * List of metric results.
   */
  data: Array<ResultListResponse.Data>;

  /**
   * Whether there are more metric results to fetch (using `starting_after=id`, where
   * id is the ID of the last MetricResult in the current response).
   */
  has_more: boolean;

  /**
   * The cursor for the next page of results.
   */
  next_page?: string | null;
}

export namespace ResultListResponse {
  export interface Data {
    /**
     * The unique identifier for the metric result.
     */
    id: string;

    /**
     * The identifier of the agent associated with the metric result.
     */
    agentId: string;

    /**
     * The identifier of the call associated with the metric result.
     */
    callId: string;

    /**
     * The UTC timestamp when the metric result was created.
     */
    createdAt: string;

    /**
     * The identifier of the deployment associated with the metric result.
     */
    deploymentId: string;

    /**
     * The identifier of the metric being measured.
     */
    metricId: string;

    /**
     * The name of the metric being measured.
     */
    metricName: string;

    /**
     * The raw result of the metric in a string format.
     */
    result: string;

    /**
     * The status of the metric result.
     */
    status: 'completed' | 'failed';

    /**
     * A summary of the transcript of the call.
     */
    summary: string;

    /**
     * The structured JSON result of the metric.
     */
    jsonResult?: { [key: string]: unknown } | null;

    /**
     * The identifier of the run associated with the metric result, if applicable.
     */
    runId?: string | null;

    /**
     * The transcript of the call.
     */
    transcript?: Array<CallsAPI.AgentTranscript> | null;

    /**
     * The value of the metric result.
     */
    value?: unknown;
  }
}

export interface ResultListParams {
  /**
   * The ID of the agent.
   */
  agent_id?: string | null;

  /**
   * The ID of the call.
   */
  call_id?: string | null;

  /**
   * The ID of the deployment.
   */
  deployment_id?: string | null;

  /**
   * A cursor to use in pagination. `ending_before` is a metric result ID that
   * defines your place in the list. For example, if you make a /metrics/results
   * request and receive 100 objects, starting with `metric_result_abc123`, your
   * subsequent call can include `ending_before=metric_result_abc123` to fetch the
   * previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of metric results to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * The ID of the metric.
   */
  metric_id?: string | null;

  /**
   * A cursor to use in pagination. `starting_after` is a metric result ID that
   * defines your place in the list. For example, if you make a /metrics/results
   * request and receive 100 objects, ending with `metric_result_abc123`, your
   * subsequent call can include `starting_after=metric_result_abc123` to fetch the
   * next page of the list.
   */
  starting_after?: string | null;
}

export interface ResultExportParams {
  /**
   * The ID of the agent.
   */
  agent_id?: string | null;

  /**
   * The ID of the call.
   */
  call_id?: string | null;

  /**
   * The ID of the deployment.
   */
  deployment_id?: string | null;

  /**
   * A cursor to use in pagination. `ending_before` is a metric result ID that
   * defines your place in the list. For example, if you make a /metrics/results
   * request and receive 100 objects, starting with `metric_result_abc123`, your
   * subsequent call can include `ending_before=metric_result_abc123` to fetch the
   * previous page of the list.
   */
  ending_before?: string | null;

  /**
   * The number of metric results to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * The ID of the metric.
   */
  metric_id?: string | null;

  /**
   * A cursor to use in pagination. `starting_after` is a metric result ID that
   * defines your place in the list. For example, if you make a /metrics/results
   * request and receive 100 objects, ending with `metric_result_abc123`, your
   * subsequent call can include `starting_after=metric_result_abc123` to fetch the
   * next page of the list.
   */
  starting_after?: string | null;
}

export declare namespace Results {
  export {
    type ResultListResponse as ResultListResponse,
    type ResultListParams as ResultListParams,
    type ResultExportParams as ResultExportParams,
  };
}
