// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as BatchesAPI from './batches';
import { BatchCreateParams, BatchListParams, Batches } from './batches';
import { APIPromise } from '../../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../../core/pagination';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Calls extends APIResource {
  batches: BatchesAPI.Batches = new BatchesAPI.Batches(this._client);

  /**
   * Create Outbound Call
   *
   * @example
   * ```ts
   * const call = await client.agents.calls.create({
   *   agent_id: 'agent_id',
   *   from_number_id: 'from_number_id',
   *   outbound_calls: [{ to_number: 'to_number' }],
   * });
   * ```
   */
  create(body: CallCreateParams, options?: RequestOptions): APIPromise<CallCreateResponse> {
    return this._client.post('/agents/calls', { body, ...options });
  }

  /**
   * Get Call
   *
   * @example
   * ```ts
   * const agentCall = await client.agents.calls.retrieve(
   *   'call_id',
   * );
   * ```
   */
  retrieve(callID: string, options?: RequestOptions): APIPromise<AgentCall> {
    return this._client.get(path`/agents/calls/${callID}`, options);
  }

  /**
   * Lists calls sorted by start time in descending order for a specific agent.
   * `agent_id` is required and if you want to include `transcript` in the response,
   * add `expand=transcript` to the request. This endpoint is paginated.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agentCall of client.agents.calls.list({
   *   agent_id: 'agent_id',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(query: CallListParams, options?: RequestOptions): PagePromise<AgentCallsCursorIDPage, AgentCall> {
    return this._client.getAPIList('/agents/calls', CursorIDPage<AgentCall>, { query, ...options });
  }

  /**
   * Deletes the sensitive data for a call, including the transcript, audio
   * recordings, and logs. The call record is retained with non-sensitive operational
   * metadata; deleted fields are omitted from subsequent API responses, and
   * `redacted_at` marks when deletion occurred. Deletion cannot be undone.
   *
   * Only completed or failed calls can be deleted. Cancel an active call first via
   * `POST /agents/calls/{call_id}/cancel`.
   *
   * @example
   * ```ts
   * const agentCall = await client.agents.calls.delete(
   *   'call_id',
   * );
   * ```
   */
  delete(callID: string, options?: RequestOptions): APIPromise<AgentCall> {
    return this._client.delete(path`/agents/calls/${callID}`, options);
  }

  /**
   * Terminates an active call. Only calls in the `started` status can be cancelled;
   * the call ends with end reason `api_cancelled`.
   *
   * Cancelling ends the call but does not delete its data. To delete a call's
   * sensitive data after it ends, use `DELETE /agents/calls/{call_id}`.
   *
   * @example
   * ```ts
   * const response = await client.agents.calls.cancel(
   *   'call_id',
   * );
   * ```
   */
  cancel(callID: string, options?: RequestOptions): APIPromise<CallCancelResponse> {
    return this._client.post(path`/agents/calls/${callID}/cancel`, options);
  }

  /**
   * The downloaded audio file is in .wav format. This endpoint streams the audio
   * file content (WAV format) to the client.
   *
   * @example
   * ```ts
   * const response = await client.agents.calls.downloadAudio(
   *   'call_id',
   * );
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  downloadAudio(callID: string, options?: RequestOptions): APIPromise<Response> {
    return this._client.get(path`/agents/calls/${callID}/audio`, {
      ...options,
      headers: buildHeaders([{ Accept: 'audio/wav' }, options?.headers]),
      __binaryResponse: true,
    });
  }

  /**
   * Get Call Runtime Logs
   *
   * @example
   * ```ts
   * const response = await client.agents.calls.logs('call_id');
   * ```
   */
  logs(callID: string, options?: RequestOptions): APIPromise<CallLogsResponse> {
    return this._client.get(path`/agents/calls/${callID}/logs`, options);
  }
}

export type AgentCallsCursorIDPage = CursorIDPage<AgentCall>;

export type CallBatchesCursorIDPage = CursorIDPage<CallBatch>;

export interface AgentCall {
  /**
   * The unique identifier for the agent call.
   */
  id: string;

  /**
   * The identifier of the agent associated with the call.
   */
  agent_id: string;

  /**
   * The status of the agent call.
   */
  status: 'active' | 'completed' | 'failed' | 'cancelled';

  /**
   * The deployment identifier associated with the call.
   */
  deployment_id?: string | null;

  /**
   * The end time of the agent call.
   */
  end_time?: string | null;

  /**
   * The error message, if any, associated with the call.
   */
  error_message?: string | null;

  /**
   * The start time of the agent call.
   */
  start_time?: string | null;

  /**
   * A summary of the agent call. This is a brief summary of the call that is
   * generated by Cartesia.
   */
  summary?: string | null;

  /**
   * The telephony parameters associated with the call when the call is made via
   * phone.
   */
  telephony_params?: AgentCall.TelephonyParams | null;

  /**
   * The transcript of the agent call.
   */
  transcript?: Array<AgentTranscript> | null;
}

export namespace AgentCall {
  /**
   * The telephony parameters associated with the call when the call is made via
   * phone.
   */
  export interface TelephonyParams {
    /**
     * The phone number of the agent.
     */
    from: string;

    /**
     * The phone number of the caller.
     */
    to: string;
  }
}

export interface AgentTranscript {
  /**
   * The end timestamp in seconds relative to the start of the call.
   */
  end_timestamp: number;

  /**
   * The role of the participant in the conversation. Roles are `user`, `assistant`,
   * or `system`. `assistant` is the agent. `system` is used to indicate logs during
   * the conversation such as `log_event` or `log_metric`.
   */
  role: string;

  /**
   * The start timestamp in seconds relative to the start of the call.
   */
  start_timestamp: number;

  /**
   * The reason for why the assistant turn ended. This could be `call_ended`,
   * `interrupted`, or `tts_completed`.
   */
  end_reason?: string | null;

  /**
   * The log event from user code.
   */
  log_event?: AgentTranscript.LogEvent | null;

  /**
   * The log metric from user code.
   */
  log_metric?: AgentTranscript.LogMetric | null;

  /**
   * The text content of the transcript. This is the text that was spoken by the user
   * or the agent.
   */
  text?: string | null;

  /**
   * The chunks of text at a more granular level in the transcript with timestamps
   * relative to the start of the call.
   */
  text_chunks?: Array<AgentTranscript.TextChunk> | null;

  /**
   * The tool calls made during the turn.
   */
  tool_calls?: Array<AgentTranscript.ToolCall> | null;

  /**
   * The time to first byte in seconds from the agent for text-to-speech.
   */
  tts_ttfb?: number | null;

  /**
   * The VAD buffer time in milliseconds.
   */
  vad_buffer_ms?: number | null;
}

export namespace AgentTranscript {
  /**
   * The log event from user code.
   */
  export interface LogEvent {
    /**
     * The event name.
     */
    event: string;

    /**
     * Additional metadata associated with the event.
     */
    metadata: { [key: string]: string };

    /**
     * The timestamp when the event was received relative to the start of the call.
     */
    timestamp: number;
  }

  /**
   * The log metric from user code.
   */
  export interface LogMetric {
    /**
     * The name of the metric.
     */
    name: string;

    /**
     * The timestamp when the metric was received relative to the start of the call.
     */
    timestamp: number;

    /**
     * The value of the metric.
     */
    value: number;
  }

  export interface TextChunk {
    /**
     * The starting timestamp of the text chunk in seconds relative to the start of the
     * call.
     */
    start_timestamp: number;

    /**
     * The text content of the chunk.
     */
    text: string;
  }

  export interface ToolCall {
    /**
     * The unique identifier for the tool call.
     */
    id: string;

    /**
     * The arguments passed to the tool.
     */
    arguments: { [key: string]: string };

    /**
     * The name of the tool that was called.
     */
    name: string;
  }
}

export interface CallBatch {
  /**
   * The unique identifier for the batch.
   */
  id: string;

  /**
   * The identifier of the agent that handles the batch's calls.
   */
  agent_id: string;

  /**
   * When the batch was created.
   */
  created_at: string;

  /**
   * The identifier of the phone number the batch dials from.
   */
  from_number_id: string;

  /**
   * When the batch was last updated.
   */
  last_updated_at: string;

  /**
   * The batch's label.
   */
  name: string;

  /**
   * The region that handles the batch.
   */
  region: 'US' | 'EU' | 'APAC';

  /**
   * Number of times the batch has been retried. `0` until the first retry.
   */
  retry_count: number;

  /**
   * The batch's lifecycle status, derived at read time from dispatch progress.
   *
   * | Status        | Meaning                                    |
   * | ------------- | ------------------------------------------ |
   * | `pending`     | No calls dispatched yet                    |
   * | `in_progress` | Some calls dispatched, not all             |
   * | `completed`   | All recipients dispatched                  |
   * | `failed`      | All recipients failed before dialing       |
   * | `cancelled`   | Cancelled before every call was dispatched |
   */
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

  /**
   * Maximum number of calls from this batch dialed concurrently.
   */
  target_concurrency_limit: number;

  /**
   * Recipients handed to the dialer so far, including those that failed before a
   * call could be placed.
   */
  total_calls_dispatched: number;

  /**
   * Recipients whose latest call attempt reached a terminal state (completed or
   * failed), including pre-dial failures.
   */
  total_calls_finished: number;

  /**
   * Total recipients queued in the batch.
   */
  total_calls_scheduled: number;

  /**
   * The actual dispatch time, in RFC3339 UTC format. The batch may stay unadmitted
   * in the queue due to scheduling or unavailable concurrency.
   */
  admitted_at?: string;

  /**
   * The batch's recipients. Returned only on `GET /agents/calls/batches/{batch_id}`.
   */
  recipients?: Array<CallBatch.Recipient>;

  /**
   * The scheduled dispatch time, in RFC3339 UTC format. Omitted for batches that
   * dispatch immediately.
   */
  scheduled_at?: string;
}

export namespace CallBatch {
  /**
   * One recipient within a batch and its current status. Returned only on batch
   * detail reads.
   */
  export interface Recipient {
    /**
     * The unique identifier for the recipient within the batch.
     */
    id: string;

    /**
     * When the recipient was queued.
     */
    created_at: string;

    /**
     * The recipient's current status. Before dispatch it reflects the queue state;
     * after dispatch it reflects the latest call attempt.
     *
     * | Status       | Meaning                                                                          |
     * | ------------ | -------------------------------------------------------------------------------- |
     * | `queued`     | Waiting for the dispatcher                                                       |
     * | `dispatched` | Handed to the dialer; no call attempt has connected or finished yet              |
     * | `started`    | Call connected and in progress                                                   |
     * | `completed`  | Call connected and ended successfully                                            |
     * | `failed`     | The call could not be placed (see `error_message`), or the latest attempt failed |
     * | `cancelled`  | Batch was cancelled before this recipient was dialed                             |
     */
    status: string;

    /**
     * Destination phone number, in E.164 format (e.g., `+14155559876`).
     */
    to_number: string;

    /**
     * The agent call ID, used to fetch per-call information via
     * [Get Call](/api-reference/agents/calls/get-call). Set once the call has been
     * dispatched.
     */
    agent_call_id?: string;

    /**
     * The reason why the call ended.
     */
    end_reason?:
      | 'agent_hangup'
      | 'voicemail_detected'
      | 'client_hangup'
      | 'api_cancelled'
      | 'max_duration'
      | 'call_inactivity'
      | 'client_inactivity'
      | 'client_disconnected'
      | 'dial_no_answer'
      | 'dial_busy'
      | 'dial_failed'
      | 'dial_timeout'
      | 'concurrency_limit'
      | 'agent_error'
      | 'network_error'
      | 'config_error'
      | 'error';

    /**
     * Why the request failed before a call could be placed. Returned in place of
     * `agent_call_id` when the recipient never reached a dial attempt.
     */
    error_message?: string;
  }
}

export interface CallCreateResponse {
  calls: Array<CallCreateResponse.Call>;
}

export namespace CallCreateResponse {
  export interface Call {
    /**
     * Destination phone number for this outbound call, in E.164 format (e.g.,
     * `+14155559876`).
     */
    number: string;

    /**
     * Agent call ID for tracking per-call information. This is absent when the request
     * fails before Cartesia creates the call record.
     */
    agent_call_id?: string;

    /**
     * Validation or dialing error for this destination. Other valid calls still
     * proceed.
     */
    error?: { [key: string]: unknown };
  }
}

export interface CallCancelResponse {
  /**
   * Always `true` when the cancel is confirmed.
   */
  cancelled: boolean;
}

/**
 * The runtime logs associated with a specific agent call.
 */
export interface CallLogsResponse {
  /**
   * The ID of the call.
   */
  call_id: string;

  /**
   * Runtime log lines recorded during the call.
   */
  logs: Array<string>;

  /**
   * The date and time when the logs were last updated.
   */
  updated_at: string;
}

export interface CallCreateParams {
  /**
   * Agent that handles the outbound calls.
   */
  agent_id: string;

  /**
   * Phone number ID to place calls from. The attached provider handles outbound
   * calling for this number.
   */
  from_number_id: string;

  /**
   * Destinations and optional per-call dynamic variables
   */
  outbound_calls: Array<CallCreateParams.OutboundCall>;

  /**
   * Optional maximum call duration in minutes.
   */
  max_call_duration_minutes?: number;

  /**
   * Seconds to wait for the callee to answer before giving up. Omit to use the
   * default (60 seconds).
   */
  ringing_timeout_seconds?: number;
}

export namespace CallCreateParams {
  /**
   * Destination and dynamic variables for one outbound call
   */
  export interface OutboundCall {
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

export interface CallListParams extends CursorIDPageParams {
  /**
   * The ID of the agent.
   */
  agent_id: string;

  /**
   * The fields to expand in the response. Currently, the only supported value is
   * `transcript`.
   */
  expand?: string | null;

  /**
   * (Pagination option) The number of calls to return per page, ranging between 1
   * and 100.
   */
  limit?: number | null;
}

Calls.Batches = Batches;

export declare namespace Calls {
  export {
    type AgentCall as AgentCall,
    type AgentTranscript as AgentTranscript,
    type CallBatch as CallBatch,
    type CallCreateResponse as CallCreateResponse,
    type CallCancelResponse as CallCancelResponse,
    type CallLogsResponse as CallLogsResponse,
    type AgentCallsCursorIDPage as AgentCallsCursorIDPage,
    type CallCreateParams as CallCreateParams,
    type CallListParams as CallListParams,
  };

  export {
    Batches as Batches,
    type BatchCreateParams as BatchCreateParams,
    type BatchListParams as BatchListParams,
  };
}
