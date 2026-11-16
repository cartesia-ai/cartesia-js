// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Webhooks extends APIResource {
  /**
   * Register a webhook endpoint. Cartesia POSTs
   * [call events](/line/infrastructure/observability#webhooks) to its `url` for
   * every agent the webhook is attached to. Attach a webhook to an agent by setting
   * the agent's `webhook_id` with
   * [Update Agent](/api-reference/agents/agents/update).
   *
   * @example
   * ```ts
   * const webhook = await client.agents.webhooks.create({
   *   secret: 'secret',
   *   url: 'https://example.com',
   * });
   * ```
   */
  create(body: WebhookCreateParams, options?: RequestOptions): APIPromise<Webhook> {
    return this._client.post('/agents/webhooks', { body, ...options });
  }

  /**
   * Returns the details of a single webhook. The `secret` is omitted.
   *
   * @example
   * ```ts
   * const webhook = await client.agents.webhooks.retrieve(
   *   'webhook_id',
   * );
   * ```
   */
  retrieve(webhookID: string, options?: RequestOptions): APIPromise<WebhookRetrieveResponse> {
    return this._client.get(path`/agents/webhooks/${webhookID}`, options);
  }

  /**
   * Update a webhook's `url`, `secret`, or `display_name`. Omit `secret` to leave
   * the existing secret unchanged.
   *
   * @example
   * ```ts
   * const webhook = await client.agents.webhooks.update(
   *   'webhook_id',
   *   { url: 'https://example.com' },
   * );
   * ```
   */
  update(webhookID: string, body: WebhookUpdateParams, options?: RequestOptions): APIPromise<string> {
    return this._client.patch(path`/agents/webhooks/${webhookID}`, { body, ...options });
  }

  /**
   * List the webhooks in your organization. The `secret` is omitted.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const webhookListResponse of client.agents.webhooks.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: WebhookListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<WebhookListResponsesCursorIDPage, WebhookListResponse> {
    return this._client.getAPIList('/agents/webhooks', CursorIDPage<WebhookListResponse>, {
      query,
      ...options,
    });
  }

  /**
   * Delete a webhook. Detach it from any agents first by clearing their
   * `webhook_id`.
   *
   * @example
   * ```ts
   * const webhook = await client.agents.webhooks.delete(
   *   'webhook_id',
   * );
   * ```
   */
  delete(webhookID: string, options?: RequestOptions): APIPromise<string> {
    return this._client.delete(path`/agents/webhooks/${webhookID}`, options);
  }
}

export type WebhookListResponsesCursorIDPage = CursorIDPage<WebhookListResponse>;

/**
 * A webhook including its secret. The secret is only returned when the webhook is
 * created.
 */
export interface Webhook {
  /**
   * The ID of the webhook.
   */
  id: string;

  /**
   * When the webhook was created.
   */
  created_at: string;

  /**
   * The shared secret. Returned only on creation.
   */
  secret: string;

  /**
   * When the webhook was last updated.
   */
  updated_at: string;

  /**
   * The HTTPS endpoint call events are delivered to.
   */
  url: string;

  /**
   * The webhook's display name, or `null` if unset.
   */
  display_name?: string | null;
}

/**
 * A webhook without its secret, as returned by list and get.
 */
export interface WebhookRetrieveResponse {
  /**
   * The ID of the webhook.
   */
  id: string;

  /**
   * When the webhook was created.
   */
  created_at: string;

  /**
   * When the webhook was last updated.
   */
  updated_at: string;

  /**
   * The HTTPS endpoint call events are delivered to.
   */
  url: string;

  /**
   * The webhook's display name, or `null` if unset.
   */
  display_name?: string | null;
}

/**
 * The ID of the updated webhook.
 */
export type WebhookUpdateResponse = string;

/**
 * A webhook without its secret, as returned by list and get.
 */
export interface WebhookListResponse {
  /**
   * The ID of the webhook.
   */
  id: string;

  /**
   * When the webhook was created.
   */
  created_at: string;

  /**
   * When the webhook was last updated.
   */
  updated_at: string;

  /**
   * The HTTPS endpoint call events are delivered to.
   */
  url: string;

  /**
   * The webhook's display name, or `null` if unset.
   */
  display_name?: string | null;
}

/**
 * The ID of the deleted webhook.
 */
export type WebhookDeleteResponse = string;

export interface WebhookCreateParams {
  /**
   * A shared secret. Cartesia returns it in the `X-Webhook-Secret` header on every
   * delivery so your endpoint can verify the request.
   */
  secret: string;

  /**
   * The HTTPS endpoint Cartesia POSTs call events to.
   */
  url: string;

  /**
   * An optional name to identify the webhook.
   */
  display_name?: string;
}

export interface WebhookUpdateParams {
  /**
   * The HTTPS endpoint Cartesia POSTs call events to.
   */
  url: string;

  /**
   * An optional name to identify the webhook.
   */
  display_name?: string;

  /**
   * A new shared secret. Omit to leave the existing secret unchanged.
   */
  secret?: string;
}

export interface WebhookListParams extends CursorIDPageParams {
  /**
   * The number of webhooks to return per page, ranging between 1 and 100. Defaults
   * to 10.
   */
  limit?: number;
}

export declare namespace Webhooks {
  export {
    type Webhook as Webhook,
    type WebhookRetrieveResponse as WebhookRetrieveResponse,
    type WebhookUpdateResponse as WebhookUpdateResponse,
    type WebhookListResponse as WebhookListResponse,
    type WebhookDeleteResponse as WebhookDeleteResponse,
    type WebhookListResponsesCursorIDPage as WebhookListResponsesCursorIDPage,
    type WebhookCreateParams as WebhookCreateParams,
    type WebhookUpdateParams as WebhookUpdateParams,
    type WebhookListParams as WebhookListParams,
  };
}
