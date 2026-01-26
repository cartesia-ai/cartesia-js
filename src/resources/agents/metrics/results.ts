// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as CallsAPI from '../calls';
import { APIPromise } from '../../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../../core/pagination';
import { type Uploadable } from '../../../core/uploads';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';

export class Results extends APIResource {
  /**
   * Paginated list of metric results. Filter results using the query parameters,
   */
  list(
    query: ResultListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ResultListResponsesCursorIDPage, ResultListResponse> {
    return this._client.getAPIList('/agents/metrics/results', CursorIDPage<ResultListResponse>, {
      query,
      ...options,
    });
  }

  /**
   * Export metric results to a CSV file. This endpoint streams at most 100k results
   * as the CSV file directly to the client. Use the optional filters to narrow down
   * the results to export.
   */
  export(query: ResultExportParams | null | undefined = {}, options?: RequestOptions): APIPromise<string> {
    return this._client.get('/agents/metrics/results/export', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'text/csv' }, options?.headers]),
    });
  }
}

export type ResultListResponsesCursorIDPage = CursorIDPage<ResultListResponse>;

export interface ResultListResponse {
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

export type ResultExportResponse = Uploadable;

export interface ResultListParams extends CursorIDPageParams {
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
   * Filter metric results created before or at this ISO 8601 date/time (e.g.
   * 2024-04-30T23:59:59Z).
   */
  end_date?: string | null;

  /**
   * The number of metric results to return per page, ranging between 1 and 100.
   */
  limit?: number | null;

  /**
   * The ID of the metric.
   */
  metric_id?: string | null;

  /**
   * Filter metric results created at or after this ISO 8601 date/time (e.g.
   * 2024-04-01T00:00:00Z).
   */
  start_date?: string | null;
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
   * Filter metric results created before or at this ISO 8601 date/time (e.g.
   * 2024-04-30T23:59:59Z).
   */
  end_date?: string | null;

  /**
   * The ID of the metric.
   */
  metric_id?: string | null;

  /**
   * Filter metric results created at or after this ISO 8601 date/time (e.g.
   * 2024-04-01T00:00:00Z).
   */
  start_date?: string | null;
}

export declare namespace Results {
  export {
    type ResultListResponse as ResultListResponse,
    type ResultExportResponse as ResultExportResponse,
    type ResultListResponsesCursorIDPage as ResultListResponsesCursorIDPage,
    type ResultListParams as ResultListParams,
    type ResultExportParams as ResultExportParams,
  };
}
