// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ToolsAPI from './tools';
import * as AgentsAPI from './agents';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Tools extends APIResource {
  /**
   * Creates a shared webhook or client tool that can be attached to agents
   *
   * @example
   * ```ts
   * const tool = await client.agents.tools.create({
   *   api_schema: {
   *     url: 'https://api.example.com/customers/lookup',
   *     method: 'GET',
   *     query_params_schema: {
   *       properties: {
   *         phone_number: {
   *           type: 'string',
   *           dynamic_variable: 'system__caller_id',
   *         },
   *       },
   *     },
   *   },
   *   description:
   *     'Look up the caller to find their customer details.',
   *   execution_mode: 'immediate',
   *   name: 'lookup_customer',
   *   pre_tool_speech: 'auto',
   *   type: 'webhook',
   *   assignments: [
   *     {
   *       dynamic_variable: 'customer_name',
   *       value_path: 'customer.name',
   *     },
   *   ],
   * });
   * ```
   */
  create(body: ToolCreateParams, options?: RequestOptions): APIPromise<Tool> {
    return this._client.post('/v1/agents/tools', { body, ...options });
  }

  /**
   * Returns one shared tool. Expand `agents` to include agents that currently
   * reference it.
   *
   * @example
   * ```ts
   * const tool = await client.agents.tools.retrieve('x');
   * ```
   */
  retrieve(
    toolID: string,
    query: ToolRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Tool> {
    return this._client.get(path`/v1/agents/tools/${toolID}`, { query, ...options });
  }

  /**
   * Sparsely updates a tool.
   *
   * @example
   * ```ts
   * const tool = await client.agents.tools.update('x', {
   *   assignments: [
   *     {
   *       dynamic_variable: 'customer_name',
   *       value_path: 'customer.name',
   *     },
   *   ],
   * });
   * ```
   */
  update(toolID: string, body: ToolUpdateParams, options?: RequestOptions): APIPromise<Tool> {
    return this._client.patch(path`/v1/agents/tools/${toolID}`, { body, ...options });
  }

  /**
   * Returns shared webhook and client tools for your account
   *
   * @example
   * ```ts
   * const tools = await client.agents.tools.list();
   * ```
   */
  list(
    query: ToolListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ToolListResponse> {
    return this._client.get('/v1/agents/tools', { query, ...options });
  }

  /**
   * Deletes an unused tool. Detach the tool from current agent configurations first.
   *
   * @example
   * ```ts
   * await client.agents.tools.delete('x');
   * ```
   */
  delete(toolID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/v1/agents/tools/${toolID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type Tool = Tool.UnionMember0 | Tool.UnionMember1;

export namespace Tool {
  export interface UnionMember0 {
    /**
     * Unique identifier for the tool.
     */
    id: string;

    api_schema: UnionMember0.APISchema;

    /**
     * Configure how to extract values from successful JSON tool responses and assign
     * them to dynamic variables for this call.
     */
    assignments: Array<UnionMember0.Assignment>;

    /**
     * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
     * `2025-04-16T12:34:56.789Z`).
     */
    created_at: string;

    /**
     * What the tool does and when the agent should use it.
     */
    description: string;

    /**
     * Controls how the tool runs relative to the conversation. `immediate` runs it in
     * the current turn, while `async` lets the turn finish while the tool runs.
     */
    execution_mode: 'immediate' | 'async';

    /**
     * Name the agent uses to call the tool. Names are case-sensitive.
     */
    name: string;

    /**
     * Controls whether the agent speaks before using the tool. `auto` lets the agent
     * decide, `force` always makes the agent speak first, and `off` never asks it to.
     */
    pre_tool_speech: 'auto' | 'force' | 'off';

    /**
     * Maximum time to wait for the endpoint to respond. Defaults to 20 seconds.
     */
    response_timeout_secs: number;

    /**
     * Runs an HTTP request from Cartesia's servers.
     */
    type: 'webhook';

    /**
     * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
     * `2025-04-16T12:34:56.789Z`).
     */
    updated_at: string;

    /**
     * Managed agents that currently use this tool. Included when `expand[]=agents` is
     * requested.
     */
    agents?: Array<AgentsAPI.AgentSummary>;

    /**
     * Non-managed agents that currently use this tool. They block deletion and must be
     * updated outside the managed-agent API. Included when `expand[]=agents` is
     * requested.
     */
    unmanaged_agents?: Array<UnionMember0.UnmanagedAgent>;
  }

  export namespace UnionMember0 {
    export interface APISchema {
      /**
       * The HTTP method.
       */
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

      /**
       * The HTTPS endpoint to call. Use `{name}` for path parameters defined in
       * `path_params_schema`.
       */
      url: string;

      /**
       * Authentication sent in the `Authorization` header.
       */
      authentication?: APISchema.UnionMember0 | APISchema.UnionMember1;

      /**
       * Path parameters keyed by placeholder name.
       */
      path_params_schema?: { [key: string]: APISchema.PathParamsSchema };

      /**
       * Parameters sent in the request query string.
       */
      query_params_schema?: APISchema.QueryParamsSchema;

      /**
       * A value sent in the JSON request body.
       */
      request_body_schema?: ToolsAPI.WebhookBodyParam;

      /**
       * Headers sent with every request.
       */
      request_headers?: { [key: string]: string | APISchema.UnionMember1 | APISchema.UnionMember2 };
    }

    export namespace APISchema {
      /**
       * Sends an `Authorization` header using HTTP Basic authentication.
       */
      export interface UnionMember0 {
        mode: 'basic_auth';

        /**
         * A stored credential. `secret_value` is not returned.
         */
        password: UnionMember0.Password;

        /**
         * The username. It cannot contain a colon.
         */
        username: string;
      }

      export namespace UnionMember0 {
        /**
         * A stored credential. `secret_value` is not returned.
         */
        export interface Password {
          type: 'secret';

          /**
           * A label for this credential. Do not include the secret itself because this field
           * is stored as plain text.
           */
          secret_description?: string;
        }
      }

      /**
       * Sends an `Authorization` header using a bearer token.
       */
      export interface UnionMember1 {
        /**
         * A stored credential. `secret_value` is not returned.
         */
        token: UnionMember1.Token;

        mode: 'bearer';
      }

      export namespace UnionMember1 {
        /**
         * A stored credential. `secret_value` is not returned.
         */
        export interface Token {
          type: 'secret';

          /**
           * A label for this credential. Do not include the secret itself because this field
           * is stored as plain text.
           */
          secret_description?: string;
        }
      }

      /**
       * A value inserted into a URL path placeholder.
       */
      export interface PathParamsSchema {
        type: 'string' | 'integer' | 'number';

        /**
         * Fixed value to send with every request. It must match `type`. This parameter is
         * hidden from the model.
         */
        constant_value?: string | number | boolean;

        /**
         * What value the agent should provide.
         */
        description?: string;

        /**
         * Use this variable's current value when the tool runs. It must match `type`. This
         * parameter is hidden from the model. A missing or invalid value prevents the
         * request and returns a tool error.
         */
        dynamic_variable?: string;

        /**
         * Allowed values.
         */
        enum?: Array<string | number | boolean>;
      }

      /**
       * Parameters sent in the request query string.
       */
      export interface QueryParamsSchema {
        /**
         * Query parameters keyed by name.
         */
        properties: { [key: string]: QueryParamsSchema.Properties };

        /**
         * Names of parameters the model must provide. Other model parameters are optional.
         */
        required?: Array<string>;
      }

      export namespace QueryParamsSchema {
        /**
         * A value sent in the query string.
         */
        export interface Properties {
          type: 'string' | 'integer' | 'number' | 'boolean' | 'array';

          /**
           * Fixed value to send with every request. It must match `type`. This parameter is
           * hidden from the model.
           */
          constant_value?: string | number | boolean;

          /**
           * What value the agent should provide.
           */
          description?: string;

          /**
           * Use this variable's current value when the tool runs. It must match `type`. This
           * parameter is hidden from the model. A missing or invalid value prevents the
           * request and returns a tool error.
           */
          dynamic_variable?: string;

          /**
           * Allowed values.
           */
          enum?: Array<string | number | boolean>;

          /**
           * The array item type. Required when `type` is `array`.
           */
          items?: Properties.Items;
        }

        export namespace Properties {
          /**
           * The array item type. Required when `type` is `array`.
           */
          export interface Items {
            type: 'string' | 'integer' | 'number' | 'boolean';
          }
        }
      }

      /**
       * A stored credential. `secret_value` is not returned.
       */
      export interface UnionMember1 {
        type: 'secret';

        /**
         * A label for this credential. Do not include the secret itself because this field
         * is stored as plain text.
         */
        secret_description?: string;
      }

      /**
       * Fill this header from the variable's current value when the tool runs.
       */
      export interface UnionMember2 {
        /**
         * Variable to use as the header value.
         */
        name: string;

        type: 'dynamic_variable';
      }
    }

    /**
     * Extract a response value and assign it to a dynamic variable. Missing or null
     * values leave the variable unchanged. Objects and arrays are stored as JSON
     * strings.
     */
    export interface Assignment {
      /**
       * Custom variable to update. Names starting with `system__` or `secret__` are
       * reserved.
       */
      dynamic_variable: string;

      /**
       * Path to a value in the JSON response, such as `order.status`, `items[0].sku`, or
       * `[0].id`. For arrays, `.0` and `[0]` both select the first item. For objects,
       * `.0` selects the key `0`. Spaces in keys are preserved.
       */
      value_path: string;
    }

    /**
     * An agent using this tool.
     */
    export interface UnmanagedAgent {
      /**
       * The ID of the agent.
       */
      id: string;

      /**
       * The name of the agent.
       */
      name: string;
    }
  }

  export interface UnionMember1 {
    /**
     * Unique identifier for the tool.
     */
    id: string;

    /**
     * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
     * `2025-04-16T12:34:56.789Z`).
     */
    created_at: string;

    /**
     * What the tool does and when the agent should use it.
     */
    description: string;

    /**
     * Controls how the tool runs relative to the conversation. `immediate` runs it in
     * the current turn, while `async` lets the turn finish while the tool runs.
     */
    execution_mode: 'immediate' | 'async';

    /**
     * Whether the client application must return a result. When `false`, the tool call
     * is dispatched without waiting for a result.
     */
    expects_response: boolean;

    /**
     * Name the agent uses to call the tool. Names are case-sensitive.
     */
    name: string;

    /**
     * Parameters the agent can pass to the client function.
     */
    parameters: UnionMember1.Parameters;

    /**
     * Controls whether the agent speaks before using the tool. `auto` lets the agent
     * decide, `force` always makes the agent speak first, and `off` never asks it to.
     */
    pre_tool_speech: 'auto' | 'force' | 'off';

    /**
     * Maximum time to wait for the client application to return a result. Defaults to
     * 20 seconds.
     */
    response_timeout_secs: number;

    /**
     * Runs a function in the connected client application.
     */
    type: 'client';

    /**
     * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
     * `2025-04-16T12:34:56.789Z`).
     */
    updated_at: string;

    /**
     * Managed agents that currently use this tool. Included when `expand[]=agents` is
     * requested.
     */
    agents?: Array<AgentsAPI.AgentSummary>;

    /**
     * Non-managed agents that currently use this tool. They block deletion and must be
     * updated outside the managed-agent API. Included when `expand[]=agents` is
     * requested.
     */
    unmanaged_agents?: Array<UnionMember1.UnmanagedAgent>;
  }

  export namespace UnionMember1 {
    /**
     * Parameters the agent can pass to the client function.
     */
    export interface Parameters {
      /**
       * The parameters schema type. Always `object`.
       */
      type: 'object';

      /**
       * Parameters keyed by name.
       */
      properties?: { [key: string]: Parameters.Properties };

      /**
       * Names of parameters the agent must provide. Other parameters are optional.
       */
      required?: Array<string>;
    }

    export namespace Parameters {
      /**
       * One argument passed to your function.
       */
      export interface Properties {
        /**
         * The parameter's JSON type.
         */
        type: 'string' | 'integer' | 'number' | 'boolean' | 'array';

        /**
         * What value the agent should provide.
         */
        description?: string;

        /**
         * Allowed string values.
         */
        enum?: Array<string>;

        /**
         * The array item type. Required when `type` is `array`.
         */
        items?: Properties.Items;
      }

      export namespace Properties {
        /**
         * The array item type. Required when `type` is `array`.
         */
        export interface Items {
          type: 'string' | 'integer' | 'number' | 'boolean';
        }
      }
    }

    /**
     * An agent using this tool.
     */
    export interface UnmanagedAgent {
      /**
       * The ID of the agent.
       */
      id: string;

      /**
       * The name of the agent.
       */
      name: string;
    }
  }
}

/**
 * A value sent in the JSON request body.
 */
export interface WebhookBodyParam {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'object' | 'array';

  /**
   * Fixed value to send with every request. It must match `type`. This parameter is
   * hidden from the model.
   */
  constant_value?: string | number | boolean;

  /**
   * What value the agent should provide.
   */
  description?: string;

  /**
   * Use this variable's current value when the tool runs. It must match `type`. This
   * parameter is hidden from the model. A missing or invalid value prevents the
   * request and returns a tool error.
   */
  dynamic_variable?: string;

  /**
   * Allowed values.
   */
  enum?: Array<string | number | boolean>;

  /**
   * A value sent in the JSON request body.
   */
  items?: WebhookBodyParam;

  /**
   * Object properties keyed by name.
   */
  properties?: { [key: string]: WebhookBodyParam };

  /**
   * Names of properties the model must provide. Other model properties are optional.
   */
  required?: Array<string>;
}

export interface ToolListResponse {
  /**
   * The requested page of results.
   */
  data: Array<Tool>;

  /**
   * Whether more results are available after this page.
   */
  has_more: boolean;

  /**
   * An ID that can be passed as `starting_after` or `ending_before` to get the next
   * page of data.
   */
  next_page?: string | null;
}

export type ToolCreateParams = ToolCreateParams.Variant0 | ToolCreateParams.Variant1;

export declare namespace ToolCreateParams {
  export interface Variant0 {
    api_schema: Variant0.APISchema;

    /**
     * What the tool does and when the agent should use it.
     */
    description: string;

    /**
     * Controls how the tool runs relative to the conversation. `immediate` runs it in
     * the current turn, while `async` lets the turn finish while the tool runs.
     */
    execution_mode: 'immediate' | 'async';

    /**
     * Name the agent uses to call the tool. Names are case-sensitive.
     */
    name: string;

    /**
     * Controls whether the agent speaks before using the tool. `auto` lets the agent
     * decide, `force` always makes the agent speak first, and `off` never asks it to.
     */
    pre_tool_speech: 'auto' | 'force' | 'off';

    /**
     * Runs an HTTP request from Cartesia's servers.
     */
    type: 'webhook';

    /**
     * Configure how to extract values from successful JSON tool responses and assign
     * them to dynamic variables for this call.
     */
    assignments?: Array<Variant0.Assignment>;

    /**
     * Maximum time to wait for the endpoint to respond. Defaults to 20 seconds.
     */
    response_timeout_secs?: number;
  }

  export namespace Variant0 {
    export interface APISchema {
      /**
       * The HTTP method.
       */
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

      /**
       * The HTTPS endpoint to call. Use `{name}` for path parameters defined in
       * `path_params_schema`.
       */
      url: string;

      /**
       * Authentication sent in the `Authorization` header.
       */
      authentication?: APISchema.UnionMember0 | APISchema.UnionMember1;

      /**
       * Path parameters keyed by placeholder name.
       */
      path_params_schema?: { [key: string]: APISchema.PathParamsSchema };

      /**
       * Parameters sent in the request query string.
       */
      query_params_schema?: APISchema.QueryParamsSchema;

      /**
       * The schema for the JSON request body. The root must be an `object`. Only `POST`,
       * `PUT`, and `PATCH` requests can include a body.
       */
      request_body_schema?: unknown;

      /**
       * Headers sent with every request.
       */
      request_headers?: { [key: string]: string | APISchema.UnionMember1 | APISchema.UnionMember2 };
    }

    export namespace APISchema {
      /**
       * Sends an `Authorization` header using HTTP Basic authentication.
       */
      export interface UnionMember0 {
        mode: 'basic_auth';

        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        password: UnionMember0.Password;

        /**
         * The username. It cannot contain a colon.
         */
        username: string;
      }

      export namespace UnionMember0 {
        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        export interface Password {
          type: 'secret';

          /**
           * A label for this credential. Do not include the secret itself because this field
           * is stored as plain text.
           */
          secret_description?: string;

          /**
           * The secret to store, such as an API key. This field is write-only. Omit it on
           * update to keep the existing secret.
           */
          secret_value?: string;
        }
      }

      /**
       * Sends an `Authorization` header using a bearer token.
       */
      export interface UnionMember1 {
        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        token: UnionMember1.Token;

        mode: 'bearer';
      }

      export namespace UnionMember1 {
        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        export interface Token {
          type: 'secret';

          /**
           * A label for this credential. Do not include the secret itself because this field
           * is stored as plain text.
           */
          secret_description?: string;

          /**
           * The secret to store, such as an API key. This field is write-only. Omit it on
           * update to keep the existing secret.
           */
          secret_value?: string;
        }
      }

      /**
       * A value inserted into a URL path placeholder.
       */
      export interface PathParamsSchema {
        type: 'string' | 'integer' | 'number';

        /**
         * Fixed value to send with every request. It must match `type`. This parameter is
         * hidden from the model.
         */
        constant_value?: string | number | boolean;

        /**
         * What value the agent should provide.
         */
        description?: string;

        /**
         * Use this variable's current value when the tool runs. It must match `type`. This
         * parameter is hidden from the model. A missing or invalid value prevents the
         * request and returns a tool error.
         */
        dynamic_variable?: string;

        /**
         * Allowed values.
         */
        enum?: Array<string | number | boolean>;
      }

      /**
       * Parameters sent in the request query string.
       */
      export interface QueryParamsSchema {
        /**
         * Query parameters keyed by name.
         */
        properties: { [key: string]: QueryParamsSchema.Properties };

        /**
         * Names of parameters the model must provide. Other model parameters are optional.
         */
        required?: Array<string>;
      }

      export namespace QueryParamsSchema {
        /**
         * A value sent in the query string.
         */
        export interface Properties {
          type: 'string' | 'integer' | 'number' | 'boolean' | 'array';

          /**
           * Fixed value to send with every request. It must match `type`. This parameter is
           * hidden from the model.
           */
          constant_value?: string | number | boolean;

          /**
           * What value the agent should provide.
           */
          description?: string;

          /**
           * Use this variable's current value when the tool runs. It must match `type`. This
           * parameter is hidden from the model. A missing or invalid value prevents the
           * request and returns a tool error.
           */
          dynamic_variable?: string;

          /**
           * Allowed values.
           */
          enum?: Array<string | number | boolean>;

          /**
           * The array item type. Required when `type` is `array`.
           */
          items?: Properties.Items;
        }

        export namespace Properties {
          /**
           * The array item type. Required when `type` is `array`.
           */
          export interface Items {
            type: 'string' | 'integer' | 'number' | 'boolean';
          }
        }
      }

      /**
       * A secret credential. `secret_value` is write-only and is never returned.
       */
      export interface UnionMember1 {
        type: 'secret';

        /**
         * A label for this credential. Do not include the secret itself because this field
         * is stored as plain text.
         */
        secret_description?: string;

        /**
         * The secret to store, such as an API key. This field is write-only. Omit it on
         * update to keep the existing secret.
         */
        secret_value?: string;
      }

      /**
       * Fill this header from the variable's current value when the tool runs.
       */
      export interface UnionMember2 {
        /**
         * Variable to use as the header value.
         */
        name: string;

        type: 'dynamic_variable';
      }
    }

    /**
     * Extract a response value and assign it to a dynamic variable. Missing or null
     * values leave the variable unchanged. Objects and arrays are stored as JSON
     * strings.
     */
    export interface Assignment {
      /**
       * Custom variable to update. Names starting with `system__` or `secret__` are
       * reserved.
       */
      dynamic_variable: string;

      /**
       * Path to a value in the JSON response, such as `order.status`, `items[0].sku`, or
       * `[0].id`. For arrays, `.0` and `[0]` both select the first item. For objects,
       * `.0` selects the key `0`. Spaces in keys are preserved.
       */
      value_path: string;
    }
  }

  export interface Variant1 {
    /**
     * What the tool does and when the agent should use it.
     */
    description: string;

    /**
     * Controls how the tool runs relative to the conversation. `immediate` runs it in
     * the current turn, while `async` lets the turn finish while the tool runs.
     */
    execution_mode: 'immediate' | 'async';

    /**
     * Whether the client application must return a result. When `false`, the tool call
     * is dispatched without waiting for a result.
     */
    expects_response: boolean;

    /**
     * Name the agent uses to call the tool. Names are case-sensitive.
     */
    name: string;

    /**
     * Parameters the agent can pass to the client function.
     */
    parameters: Variant1.Parameters;

    /**
     * Controls whether the agent speaks before using the tool. `auto` lets the agent
     * decide, `force` always makes the agent speak first, and `off` never asks it to.
     */
    pre_tool_speech: 'auto' | 'force' | 'off';

    /**
     * Runs a function in the connected client application.
     */
    type: 'client';

    /**
     * Maximum time to wait for the client application to return a result. Defaults to
     * 20 seconds.
     */
    response_timeout_secs?: number;
  }

  export namespace Variant1 {
    /**
     * Parameters the agent can pass to the client function.
     */
    export interface Parameters {
      /**
       * The parameters schema type. Always `object`.
       */
      type: 'object';

      /**
       * Parameters keyed by name.
       */
      properties?: { [key: string]: Parameters.Properties };

      /**
       * Names of parameters the agent must provide. Other parameters are optional.
       */
      required?: Array<string>;
    }

    export namespace Parameters {
      /**
       * One argument passed to your function.
       */
      export interface Properties {
        /**
         * The parameter's JSON type.
         */
        type: 'string' | 'integer' | 'number' | 'boolean' | 'array';

        /**
         * What value the agent should provide.
         */
        description?: string;

        /**
         * Allowed string values.
         */
        enum?: Array<string>;

        /**
         * The array item type. Required when `type` is `array`.
         */
        items?: Properties.Items;
      }

      export namespace Properties {
        /**
         * The array item type. Required when `type` is `array`.
         */
        export interface Items {
          type: 'string' | 'integer' | 'number' | 'boolean';
        }
      }
    }
  }
}

export interface ToolRetrieveParams {
  expand?: Array<'agents'>;
}

export type ToolUpdateParams = ToolUpdateParams.Variant0 | ToolUpdateParams.Variant1;

export declare namespace ToolUpdateParams {
  export interface Variant0 {
    api_schema?: Variant0.APISchema;

    /**
     * Replace the response assignments. Omit to keep them, or use `null` or `[]` to
     * clear them.
     */
    assignments?: Array<Variant0.Assignment> | null;

    /**
     * What the tool does and when the agent should use it.
     */
    description?: string;

    /**
     * Controls how the tool runs relative to the conversation. `immediate` runs it in
     * the current turn, while `async` lets the turn finish while the tool runs.
     */
    execution_mode?: 'immediate' | 'async';

    /**
     * Name the agent uses to call the tool. Names are case-sensitive.
     */
    name?: string;

    /**
     * Controls whether the agent speaks before using the tool. `auto` lets the agent
     * decide, `force` always makes the agent speak first, and `off` never asks it to.
     */
    pre_tool_speech?: 'auto' | 'force' | 'off';

    /**
     * Maximum time to wait for the endpoint to respond. Defaults to 20 seconds.
     */
    response_timeout_secs?: number;
  }

  export namespace Variant0 {
    export interface APISchema {
      /**
       * Authentication sent in the `Authorization` header.
       */
      authentication?: APISchema.UnionMember0 | APISchema.UnionMember1 | null;

      /**
       * The HTTP method.
       */
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

      /**
       * Path parameters keyed by placeholder name.
       */
      path_params_schema?: { [key: string]: APISchema.PathParamsSchema } | null;

      /**
       * Parameters sent in the request query string.
       */
      query_params_schema?: APISchema.QueryParamsSchema | null;

      /**
       * The schema for the JSON request body. The root must be an `object`. Only `POST`,
       * `PUT`, and `PATCH` requests can include a body.
       */
      request_body_schema?: unknown;

      request_headers?: {
        [key: string]: string | APISchema.UnionMember1 | APISchema.UnionMember2 | null;
      } | null;

      /**
       * The HTTPS endpoint to call. Use `{name}` for path parameters defined in
       * `path_params_schema`.
       */
      url?: string;
    }

    export namespace APISchema {
      /**
       * Sends an `Authorization` header using HTTP Basic authentication.
       */
      export interface UnionMember0 {
        mode: 'basic_auth';

        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        password: UnionMember0.Password;

        /**
         * The username. It cannot contain a colon.
         */
        username: string;
      }

      export namespace UnionMember0 {
        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        export interface Password {
          type: 'secret';

          /**
           * A label for this credential. Do not include the secret itself because this field
           * is stored as plain text.
           */
          secret_description?: string;

          /**
           * The secret to store, such as an API key. This field is write-only. Omit it on
           * update to keep the existing secret.
           */
          secret_value?: string;
        }
      }

      /**
       * Sends an `Authorization` header using a bearer token.
       */
      export interface UnionMember1 {
        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        token: UnionMember1.Token;

        mode: 'bearer';
      }

      export namespace UnionMember1 {
        /**
         * A secret credential. `secret_value` is write-only and is never returned.
         */
        export interface Token {
          type: 'secret';

          /**
           * A label for this credential. Do not include the secret itself because this field
           * is stored as plain text.
           */
          secret_description?: string;

          /**
           * The secret to store, such as an API key. This field is write-only. Omit it on
           * update to keep the existing secret.
           */
          secret_value?: string;
        }
      }

      /**
       * A value inserted into a URL path placeholder.
       */
      export interface PathParamsSchema {
        type: 'string' | 'integer' | 'number';

        /**
         * Fixed value to send with every request. It must match `type`. This parameter is
         * hidden from the model.
         */
        constant_value?: string | number | boolean;

        /**
         * What value the agent should provide.
         */
        description?: string;

        /**
         * Use this variable's current value when the tool runs. It must match `type`. This
         * parameter is hidden from the model. A missing or invalid value prevents the
         * request and returns a tool error.
         */
        dynamic_variable?: string;

        /**
         * Allowed values.
         */
        enum?: Array<string | number | boolean>;
      }

      /**
       * Parameters sent in the request query string.
       */
      export interface QueryParamsSchema {
        /**
         * Query parameters keyed by name.
         */
        properties: { [key: string]: QueryParamsSchema.Properties };

        /**
         * Names of parameters the model must provide. Other model parameters are optional.
         */
        required?: Array<string>;
      }

      export namespace QueryParamsSchema {
        /**
         * A value sent in the query string.
         */
        export interface Properties {
          type: 'string' | 'integer' | 'number' | 'boolean' | 'array';

          /**
           * Fixed value to send with every request. It must match `type`. This parameter is
           * hidden from the model.
           */
          constant_value?: string | number | boolean;

          /**
           * What value the agent should provide.
           */
          description?: string;

          /**
           * Use this variable's current value when the tool runs. It must match `type`. This
           * parameter is hidden from the model. A missing or invalid value prevents the
           * request and returns a tool error.
           */
          dynamic_variable?: string;

          /**
           * Allowed values.
           */
          enum?: Array<string | number | boolean>;

          /**
           * The array item type. Required when `type` is `array`.
           */
          items?: Properties.Items;
        }

        export namespace Properties {
          /**
           * The array item type. Required when `type` is `array`.
           */
          export interface Items {
            type: 'string' | 'integer' | 'number' | 'boolean';
          }
        }
      }

      /**
       * A secret credential. `secret_value` is write-only and is never returned.
       */
      export interface UnionMember1 {
        type: 'secret';

        /**
         * A label for this credential. Do not include the secret itself because this field
         * is stored as plain text.
         */
        secret_description?: string;

        /**
         * The secret to store, such as an API key. This field is write-only. Omit it on
         * update to keep the existing secret.
         */
        secret_value?: string;
      }

      /**
       * Fill this header from the variable's current value when the tool runs.
       */
      export interface UnionMember2 {
        /**
         * Variable to use as the header value.
         */
        name: string;

        type: 'dynamic_variable';
      }
    }

    /**
     * Extract a response value and assign it to a dynamic variable. Missing or null
     * values leave the variable unchanged. Objects and arrays are stored as JSON
     * strings.
     */
    export interface Assignment {
      /**
       * Custom variable to update. Names starting with `system__` or `secret__` are
       * reserved.
       */
      dynamic_variable: string;

      /**
       * Path to a value in the JSON response, such as `order.status`, `items[0].sku`, or
       * `[0].id`. For arrays, `.0` and `[0]` both select the first item. For objects,
       * `.0` selects the key `0`. Spaces in keys are preserved.
       */
      value_path: string;
    }
  }

  export interface Variant1 {
    /**
     * What the tool does and when the agent should use it.
     */
    description?: string;

    /**
     * Controls how the tool runs relative to the conversation. `immediate` runs it in
     * the current turn, while `async` lets the turn finish while the tool runs.
     */
    execution_mode?: 'immediate' | 'async';

    /**
     * Whether the client application must return a result. When `false`, the tool call
     * is dispatched without waiting for a result.
     */
    expects_response?: boolean;

    /**
     * Name the agent uses to call the tool. Names are case-sensitive.
     */
    name?: string;

    /**
     * Parameters the agent can pass to the client function.
     */
    parameters?: Variant1.Parameters;

    /**
     * Controls whether the agent speaks before using the tool. `auto` lets the agent
     * decide, `force` always makes the agent speak first, and `off` never asks it to.
     */
    pre_tool_speech?: 'auto' | 'force' | 'off';

    /**
     * Maximum time to wait for the client application to return a result. Defaults to
     * 20 seconds.
     */
    response_timeout_secs?: number;
  }

  export namespace Variant1 {
    /**
     * Parameters the agent can pass to the client function.
     */
    export interface Parameters {
      /**
       * The parameters schema type. Always `object`.
       */
      type: 'object';

      /**
       * Parameters keyed by name.
       */
      properties?: { [key: string]: Parameters.Properties };

      /**
       * Names of parameters the agent must provide. Other parameters are optional.
       */
      required?: Array<string>;
    }

    export namespace Parameters {
      /**
       * One argument passed to your function.
       */
      export interface Properties {
        /**
         * The parameter's JSON type.
         */
        type: 'string' | 'integer' | 'number' | 'boolean' | 'array';

        /**
         * What value the agent should provide.
         */
        description?: string;

        /**
         * Allowed string values.
         */
        enum?: Array<string>;

        /**
         * The array item type. Required when `type` is `array`.
         */
        items?: Properties.Items;
      }

      export namespace Properties {
        /**
         * The array item type. Required when `type` is `array`.
         */
        export interface Items {
          type: 'string' | 'integer' | 'number' | 'boolean';
        }
      }
    }
  }
}

export interface ToolListParams {
  /**
   * Return only tools used by this agent.
   */
  agent_id?: string;

  /**
   * A cursor for pagination. Pass the ID of the first item from the previous page to
   * fetch the previous page.
   */
  ending_before?: string;

  /**
   * Related resources to include in each tool. `agents` lists the agents that use
   * it.
   */
  expand?: Array<'agents'>;

  /**
   * The maximum number of items to return, ranging between 1 and 100.
   */
  limit?: number;

  /**
   * A cursor for pagination. Pass the ID of the last item from the previous page to
   * fetch the next page.
   */
  starting_after?: string;

  /**
   * Return only tools of this type.
   */
  type?: 'webhook' | 'client';
}

export declare namespace Tools {
  export {
    type Tool as Tool,
    type WebhookBodyParam as WebhookBodyParam,
    type ToolListResponse as ToolListResponse,
    type ToolCreateParams as ToolCreateParams,
    type ToolRetrieveParams as ToolRetrieveParams,
    type ToolUpdateParams as ToolUpdateParams,
    type ToolListParams as ToolListParams,
  };
}
