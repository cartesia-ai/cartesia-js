// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ResultsAPI from './results';
import {
  ResultExportParams,
  ResultExportResponse,
  ResultListParams,
  ResultListResponse,
  ResultListResponsesCursorIDPage,
  Results,
} from './results';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Metrics extends APIResource {
  results: ResultsAPI.Results = new ResultsAPI.Results(this._client);

  /**
   * Create a new metric.
   */
  create(body: MetricCreateParams, options?: RequestOptions): APIPromise<Metric> {
    return this._client.post('/agents/metrics', { body, ...options });
  }

  /**
   * Get a metric by its ID.
   */
  retrieve(metricID: string, options?: RequestOptions): APIPromise<Metric> {
    return this._client.get(path`/agents/metrics/${metricID}`, options);
  }

  /**
   * List of all LLM-as-a-Judge metrics owned by your account.
   */
  list(
    query: MetricListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<MetricListResponse> {
    return this._client.get('/agents/metrics', { query, ...options });
  }

  /**
   * Add a metric to an agent. Once the metric is added, it will be run on all calls
   * made to the agent automatically from that point onwards.
   */
  addToAgent(metricID: string, params: MetricAddToAgentParams, options?: RequestOptions): APIPromise<void> {
    const { agent_id } = params;
    return this._client.post(path`/agents/${agent_id}/metrics/${metricID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Remove a metric from an agent. Once the metric is removed, it will no longer be
   * run on all calls made to the agent automatically from that point onwards.
   * Existing metric results will remain.
   */
  removeFromAgent(
    metricID: string,
    params: MetricRemoveFromAgentParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { agent_id } = params;
    return this._client.delete(path`/agents/${agent_id}/metrics/${metricID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface Metric {
  /**
   * The unique identifier for the metric.
   */
  id: string;

  /**
   * The timestamp when the metric was created.
   */
  created_at: string;

  /**
   * The name of the metric. This is a unique name that you can use to identify the
   * metric in the CLI.
   */
  name: string;

  /**
   * The prompt associated with the metric, detailing the task and evaluation
   * criteria.
   */
  prompt: string;

  /**
   * The display name of the metric, if available. This is the name that is displayed
   * in the Playground.
   */
  display_name?: string | null;
}

export interface MetricListResponse {
  /**
   * List of metrics.
   */
  data: Array<Metric>;

  /**
   * Whether there are more metrics to fetch (using `starting_after=id`, where id is
   * the ID of the last Metric in the current response).
   */
  has_more: boolean;

  /**
   * The ID of the last Metric in the current response as a cursor for the next page
   * of results.
   */
  next_page?: string | null;
}

export interface MetricCreateParams {
  /**
   * The name of the metric. This must be a unique name that only allows lower case
   * letters, numbers, and the characters \_, -, and .
   */
  name: string;

  /**
   * The prompt associated with the metric, detailing the task and evaluation
   * criteria.
   */
  prompt: string;

  /**
   * The display name of the metric.
   */
  display_name?: string | null;
}

export interface MetricListParams {
  /**
   * (Pagination option) The number of metrics to return per page, ranging between 1
   * and 100. The default page limit is 10.
   */
  limit?: number | null;

  /**
   * (Pagination option) The ID of the last Metric in the current response as a
   * cursor for the next page of results.
   */
  starting_after?: string | null;
}

export interface MetricAddToAgentParams {
  /**
   * The ID of the agent.
   */
  agent_id: string;
}

export interface MetricRemoveFromAgentParams {
  agent_id: string;
}

Metrics.Results = Results;

export declare namespace Metrics {
  export {
    type Metric as Metric,
    type MetricListResponse as MetricListResponse,
    type MetricCreateParams as MetricCreateParams,
    type MetricListParams as MetricListParams,
    type MetricAddToAgentParams as MetricAddToAgentParams,
    type MetricRemoveFromAgentParams as MetricRemoveFromAgentParams,
  };

  export {
    Results as Results,
    type ResultListResponse as ResultListResponse,
    type ResultExportResponse as ResultExportResponse,
    type ResultListResponsesCursorIDPage as ResultListResponsesCursorIDPage,
    type ResultListParams as ResultListParams,
    type ResultExportParams as ResultExportParams,
  };
}
