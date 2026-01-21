// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as CallsAPI from './calls';
import { AgentCall, AgentCallsCursorIDPage, AgentTranscript, CallListParams, Calls } from './calls';
import * as DeploymentsAPI from './deployments';
import { Deployment, DeploymentListResponse, Deployments } from './deployments';
import * as MetricsAPI from './metrics/metrics';
import {
  Metric,
  MetricAddToAgentParams,
  MetricCreateParams,
  MetricListParams,
  MetricListResponse,
  MetricRemoveFromAgentParams,
  Metrics,
} from './metrics/metrics';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Agents extends APIResource {
  calls: CallsAPI.Calls = new CallsAPI.Calls(this._client);
  metrics: MetricsAPI.Metrics = new MetricsAPI.Metrics(this._client);
  deployments: DeploymentsAPI.Deployments = new DeploymentsAPI.Deployments(this._client);

  /**
   * Returns the details of a specific agent. To create an agent, use the CLI or the
   * Playground for the best experience and integration with Github.
   */
  retrieve(agentID: string, options?: RequestOptions): APIPromise<AgentSummary> {
    return this._client.get(path`/agents/${agentID}`, options);
  }

  /**
   * Update Agent
   */
  update(agentID: string, body: AgentUpdateParams, options?: RequestOptions): APIPromise<AgentSummary> {
    return this._client.patch(path`/agents/${agentID}`, { body, ...options });
  }

  /**
   * Lists all agents associated with your account.
   */
  list(options?: RequestOptions): APIPromise<AgentListResponse> {
    return this._client.get('/agents', options);
  }

  /**
   * List the phone numbers associated with an agent. Currently, you can only have
   * one phone number per agent and these are provisioned by Cartesia.
   */
  listPhoneNumbers(agentID: string, options?: RequestOptions): APIPromise<AgentListPhoneNumbersResponse> {
    return this._client.get(path`/agents/${agentID}/phone-numbers`, options);
  }

  /**
   * List of public, Cartesia-provided agent templates to help you get started.
   */
  listTemplates(options?: RequestOptions): APIPromise<AgentListTemplatesResponse> {
    return this._client.get('/agents/templates', options);
  }

  /**
   * Delete Agent
   */
  remove(agentID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/agents/${agentID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * A summary of essential information about an agent.
 */
export interface AgentSummary {
  /**
   * The ID of the agent.
   */
  id: string;

  /**
   * The date and time when the agent was created.
   */
  created_at: string;

  /**
   * The number of deployments associated with the agent.
   */
  deployment_count: number;

  /**
   * Whether the agent has a text-to-agent run.
   */
  has_text_to_agent_run: boolean;

  /**
   * The unique name of the agent, which can be used to identify the agent in the
   * CLI.
   */
  name: string;

  /**
   * The language used for text-to-speech by the agent.
   */
  tts_language: string;

  /**
   * The text-to-speech voice used by the agent.
   */
  tts_voice: string;

  /**
   * The date and time when the agent was last updated.
   */
  updated_at: string;

  /**
   * The date and time when the agent was deleted, if applicable.
   */
  deleted_at?: string | null;

  /**
   * A brief description of the agent.
   */
  description?: string | null;

  /**
   * The branch of the Git repository used for deployment.
   */
  git_deploy_branch?: string | null;

  /**
   * The Git repository associated with the agent.
   */
  git_repository?: AgentSummary.GitRepository | null;

  /**
   * The phone numbers associated with the agent. Currently, you can only have one
   * phone number per agent.
   */
  phone_numbers?: Array<AgentSummary.PhoneNumber> | null;

  /**
   * The identifier for the webhook associated with the agent. Add or customize a
   * webhook to your agent to receive events when calls are made to your agent via
   * the Playground.
   */
  webhook_id?: string | null;
}

export namespace AgentSummary {
  /**
   * The Git repository associated with the agent.
   */
  export interface GitRepository {
    /**
     * The account name associated with the Git repository.
     */
    account: string;

    /**
     * The name of the Git repository.
     */
    name: string;

    /**
     * The provider of the Git repository, e.g., GitHub.
     */
    provider: string;
  }

  export interface PhoneNumber {
    /**
     * The ID of the phone number.
     */
    id: string;

    /**
     * The phone number with country code included.
     */
    number: string;
  }
}

export interface AgentListResponse {
  /**
   * The summaries of the agents.
   */
  summaries: Array<AgentSummary>;
}

export type AgentListPhoneNumbersResponse =
  Array<AgentListPhoneNumbersResponse.AgentListPhoneNumbersResponseItem>;

export namespace AgentListPhoneNumbersResponse {
  /**
   * A phone number that can be used to make calls to your agent.
   */
  export interface AgentListPhoneNumbersResponseItem {
    /**
     * The ID of the agent.
     */
    agent_id: string;

    /**
     * The UTC timestamp when the phone number was created.
     */
    created_at: string;

    /**
     * Whether the phone number is managed by Cartesia. As of now, this is always true
     * since Cartesia provisions phone numbers for you.
     */
    is_cartesia_managed: boolean;

    /**
     * The phone number.
     */
    number: string;

    /**
     * The UTC timestamp when the phone number was last updated.
     */
    updated_at: string;
  }
}

export interface AgentListTemplatesResponse {
  /**
   * List of agent templates.
   */
  templates: Array<AgentListTemplatesResponse.Template>;
}

export namespace AgentListTemplatesResponse {
  export interface Template {
    /**
     * The ID of the agent template.
     */
    id: string;

    /**
     * The UTC timestamp when the agent template was created.
     */
    created_at: string;

    /**
     * The name of the agent template.
     */
    name: string;

    /**
     * The ID of the owner of the agent template.
     */
    owner_id: string;

    /**
     * The URL of the Git repository associated with the agent template.
     */
    repo_url: string;

    /**
     * The root directory of the agent template.
     */
    root_dir: string;

    /**
     * The UTC timestamp when the agent template was last updated.
     */
    updated_at: string;

    /**
     * The dependencies of the agent template.
     */
    dependencies?: Array<string> | null;

    /**
     * The description of the agent template.
     */
    description?: string | null;

    /**
     * The required environment variables for the agent template.
     */
    required_env_vars?: Array<string> | null;
  }
}

export interface AgentUpdateParams {
  /**
   * The description of the agent.
   */
  description?: string | null;

  /**
   * The name of the agent.
   */
  name?: string | null;

  /**
   * The language to use for text-to-speech.
   */
  tts_language?: string | null;

  /**
   * The voice to use for text-to-speech.
   */
  tts_voice?: string | null;
}

Agents.Calls = Calls;
Agents.Metrics = Metrics;
Agents.Deployments = Deployments;

export declare namespace Agents {
  export {
    type AgentSummary as AgentSummary,
    type AgentListResponse as AgentListResponse,
    type AgentListPhoneNumbersResponse as AgentListPhoneNumbersResponse,
    type AgentListTemplatesResponse as AgentListTemplatesResponse,
    type AgentUpdateParams as AgentUpdateParams,
  };

  export {
    Calls as Calls,
    type AgentCall as AgentCall,
    type AgentTranscript as AgentTranscript,
    type AgentCallsCursorIDPage as AgentCallsCursorIDPage,
    type CallListParams as CallListParams,
  };

  export {
    Metrics as Metrics,
    type Metric as Metric,
    type MetricListResponse as MetricListResponse,
    type MetricCreateParams as MetricCreateParams,
    type MetricListParams as MetricListParams,
    type MetricAddToAgentParams as MetricAddToAgentParams,
    type MetricRemoveFromAgentParams as MetricRemoveFromAgentParams,
  };

  export {
    Deployments as Deployments,
    type Deployment as Deployment,
    type DeploymentListResponse as DeploymentListResponse,
  };
}
