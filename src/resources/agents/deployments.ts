// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Deployments extends APIResource {
  /**
   * Get a deployment by its ID.
   */
  retrieve(deploymentID: string, options?: RequestOptions): APIPromise<Deployment> {
    return this._client.get(path`/agents/deployments/${deploymentID}`, options);
  }

  /**
   * List of all deployments associated with an agent.
   */
  list(agentID: string, options?: RequestOptions): APIPromise<DeploymentListResponse> {
    return this._client.get(path`/agents/${agentID}/deployments`, options);
  }
}

export interface Deployment {
  /**
   * The unique identifier for the deployment.
   */
  id: string;

  /**
   * The ID of the agent associated with this deployment.
   */
  agent_id: string;

  /**
   * The UTC timestamp when the build was completed.
   */
  build_completed_at: string;

  /**
   * Logs generated during the build process of the deployment.
   */
  build_logs: string;

  /**
   * The UTC timestamp when the build process started.
   */
  build_started_at: string;

  /**
   * The UTC timestamp when the deployment was created.
   */
  created_at: string;

  /**
   * The UTC timestamp when the deployment process was completed.
   */
  deployment_completed_at: string;

  /**
   * The UTC timestamp when the deployment process started.
   */
  deployment_started_at: string;

  /**
   * The ID of the environment variable collection associated with this deployment.
   */
  env_var_collection_id: string;

  /**
   * The commit hash of the Git repository for this deployment.
   */
  git_commit_hash: string;

  /**
   * True if this deployment is the live production deployment for its associated
   * `agent_id`. Only one deployment per agent can be live at a time.
   */
  is_live: boolean;

  /**
   * Marks that this deployment is the active deployment for its associated
   * `agent_id`. Only one deployment per agent can be pinned at a time. Deployments
   * can be pinned even if they are not live or failed.
   */
  is_pinned: boolean;

  /**
   * The ID of the source code file associated with this deployment.
   */
  source_code_file_id: string;

  /**
   * The current status of the deployment. It can be `queued`, `inactive`,
   * `deploy_error`, `skipped`, `build_error`, `building`, or `deployed`.
   */
  status: string;

  /**
   * The UTC timestamp when the deployment was last updated.
   */
  updated_at: string;

  /**
   * Any error that occurred during the build process.
   */
  build_error?: string | null;

  /**
   * Any error that occurred during the deployment process.
   */
  deployment_error?: string | null;
}

export type DeploymentListResponse = Array<Deployment>;

export declare namespace Deployments {
  export { type Deployment as Deployment, type DeploymentListResponse as DeploymentListResponse };
}
