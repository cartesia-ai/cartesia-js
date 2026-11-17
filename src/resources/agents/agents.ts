// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ModelsAPI from './models';
import { Model as ModelsAPIModel, ModelListParams, Models, ModelsCursorIDPage } from './models';
import * as SessionsAPI from './sessions';
import {
  SessionCreateWebrtcParams,
  SessionCreateWebrtcResponse,
  SessionCreateWebsocketParams,
  SessionCreateWebsocketResponse,
  Sessions,
} from './sessions';
import * as ToolsAPI from './tools';
import {
  Tool as ToolsAPITool,
  ToolCreateParams,
  ToolListParams,
  ToolListResponse,
  ToolRetrieveParams,
  ToolUpdateParams,
  Tools,
  WebhookBodyParam,
} from './tools';
import * as VersionsAPI from './versions';
import {
  Version as VersionsAPIVersion,
  VersionListParams,
  VersionRetrieveParams,
  Versions,
  VersionsCursorIDPage,
} from './versions';
import * as WebhooksAPI from './webhooks';
import {
  Webhook,
  WebhookCreateParams,
  WebhookDeleteResponse,
  WebhookListParams,
  WebhookListResponse,
  WebhookListResponsesCursorIDPage,
  WebhookRetrieveResponse,
  WebhookUpdateParams,
  WebhookUpdateResponse,
  Webhooks,
} from './webhooks';
import * as CallsAPI from './calls/calls';
import {
  AgentCall,
  AgentCallsCursorIDPage,
  AgentTranscript,
  CallBatch,
  CallCancelResponse,
  CallCreateParams,
  CallCreateResponse,
  CallListParams,
  CallLogsResponse,
  Calls,
} from './calls/calls';
import * as KnowledgeBaseAPI from './knowledge-base/knowledge-base';
import { KnowledgeBase } from './knowledge-base/knowledge-base';
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
import * as PhoneNumbersAPI from './phone-numbers/phone-numbers';
import {
  PhoneNumber,
  PhoneNumberImportParams,
  PhoneNumberListParams,
  PhoneNumberListResponse,
  PhoneNumberProvisionParams,
  PhoneNumberProvisionResponse,
  PhoneNumberProvisioningUsageResponse,
  PhoneNumberUpdateParams,
  PhoneNumbers,
} from './phone-numbers/phone-numbers';
import { APIPromise } from '../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../core/pagination';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Agents extends APIResource {
  models: ModelsAPI.Models = new ModelsAPI.Models(this._client);
  tools: ToolsAPI.Tools = new ToolsAPI.Tools(this._client);
  versions: VersionsAPI.Versions = new VersionsAPI.Versions(this._client);
  calls: CallsAPI.Calls = new CallsAPI.Calls(this._client);
  metrics: MetricsAPI.Metrics = new MetricsAPI.Metrics(this._client);
  webhooks: WebhooksAPI.Webhooks = new WebhooksAPI.Webhooks(this._client);
  phoneNumbers: PhoneNumbersAPI.PhoneNumbers = new PhoneNumbersAPI.PhoneNumbers(this._client);
  sessions: SessionsAPI.Sessions = new SessionsAPI.Sessions(this._client);
  knowledgeBase: KnowledgeBaseAPI.KnowledgeBase = new KnowledgeBaseAPI.KnowledgeBase(this._client);

  /**
   * Creates an agent and its initial configuration version
   *
   * @example
   * ```ts
   * const agent = await client.agents.create();
   * ```
   */
  create(body: AgentCreateParams, options?: RequestOptions): APIPromise<Agent> {
    return this._client.post('/v1/agents', { body, ...options });
  }

  /**
   * Returns the published agent with its complete normalized configuration
   *
   * @example
   * ```ts
   * const agent = await client.agents.retrieve('x');
   * ```
   */
  retrieve(agentID: string, options?: RequestOptions): APIPromise<Agent> {
    return this._client.get(path`/v1/agents/${agentID}`, options);
  }

  /**
   * Sparsely updates agent metadata or configuration. Configuration changes create a
   * new immutable version.
   *
   * @example
   * ```ts
   * const agent = await client.agents.update('x');
   * ```
   */
  update(agentID: string, body: AgentUpdateParams, options?: RequestOptions): APIPromise<Agent> {
    return this._client.patch(path`/v1/agents/${agentID}`, { body, ...options });
  }

  /**
   * Returns agent summaries for your account. Full configurations are omitted.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agentSummary of client.agents.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: AgentListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AgentSummariesCursorIDPage, AgentSummary> {
    return this._client.getAPIList('/v1/agents', CursorIDPage<AgentSummary>, { query, ...options });
  }

  /**
   * Deletes the agent. Future reads and new calls fail.
   *
   * @example
   * ```ts
   * await client.agents.delete('x');
   * ```
   */
  delete(agentID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/v1/agents/${agentID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type AgentSummariesCursorIDPage = CursorIDPage<AgentSummary>;

export interface Agent {
  /**
   * Unique identifier for the agent.
   */
  id: string;

  /**
   * Complete agent configuration.
   */
  config: Agent.Config;

  /**
   * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
   * `2025-04-16T12:34:56.789Z`).
   */
  created_at: string;

  /**
   * Description of the agent.
   */
  description: string | null;

  /**
   * Name shown for the agent.
   */
  name: string;

  /**
   * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
   * `2025-04-16T12:34:56.789Z`).
   */
  updated_at: string;

  version: Agent.Version;
}

export namespace Agent {
  /**
   * Complete agent configuration.
   */
  export interface Config {
    audio: Config.Audio;

    /**
     * Sample values for test calls, keyed by custom variable name. These are not used
     * in production. PATCH replaces the whole map; omit it to keep existing samples or
     * use `{}` to clear them.
     */
    dynamic_variable_placeholders: { [key: string]: string | number | boolean };

    /**
     * ID of the event webhook that receives events from this agent.
     */
    event_webhook_id: string | null;

    /**
     * Message the agent says first. Set to `null` to wait for the user to speak. All
     * `{{name}}` references must have values before the call starts.
     */
    initial_message: string | null;

    /**
     * Controls how the agent handles interruptions while `initial_message` plays.
     * `allow` lets the caller interrupt it, `ignore` plays it in full without
     * replying, and `respond_after` plays it in full, then replies. Defaults to
     * `allow`.
     */
    initial_message_interruptions: 'allow' | 'ignore' | 'respond_after';

    /**
     * Instructions that define the agent's behavior. Supports `{{name}}` references;
     * missing values leave the reference unchanged.
     */
    instructions: string;

    /**
     * Knowledge base documents attached to the agent.
     */
    knowledge_base_documents: Array<Config.KnowledgeBaseDocument>;

    /**
     * Knowledge base folders attached to the agent.
     */
    knowledge_base_folders: Array<Config.KnowledgeBaseFolder>;

    language: Config.Language;

    model: Config.Model;

    /**
     * When enabled, the prompt is optimized with Cartesia's voice guidelines.
     */
    prompt_optimization: boolean;

    /**
     * When enabled, starts generating an LLM response eagerly to reduce perceived
     * latency, before confirming that the user’s turn has ended. May increase LLM
     * costs.
     */
    speculative_generation: boolean;

    /**
     * Built-in tools available to the agent.
     */
    system_tools: Config.SystemTools;

    /**
     * Time zone for `{{system__time}}`, such as `America/New_York`. Defaults to `UTC`.
     */
    timezone: string;

    /**
     * Tools available to the agent.
     */
    tools: Array<Config.Tool>;

    turn: Config.Turn;
  }

  export namespace Config {
    export interface Audio {
      input: Audio.Input;

      output: Audio.Output;
    }

    export namespace Audio {
      export interface Input {
        /**
         * Words or phrases that the speech recognizer should prioritize.
         */
        keyterms: Array<string>;

        /**
         * Noise suppression applied to incoming audio. Use `off` to disable it, `auto` for
         * the default level, or `max` for stronger suppression.
         */
        noise_suppression: 'off' | 'auto' | 'max';
      }

      export interface Output {
        /**
         * Background audio played during the conversation.
         */
        background_sound: Output.BackgroundSound | null;

        /**
         * Text-to-speech emotion supported by the selected voice and model, such as
         * `calm`, `happy`, or `sad`.
         */
        emotion: string | null;

        /**
         * ID of the pronunciation dictionary used for agent speech.
         */
        pronunciation_dictionary_id: string | null;

        /**
         * Speech speed multiplier, from `0.6` to `1.5`. Set to `null` to use the default
         * speed.
         */
        speed: number | null;

        /**
         * ID of the voice used for agent speech.
         */
        voice_id: string;

        /**
         * Speech volume multiplier, from `0.5` to `2`. Set to `null` to use the default
         * volume.
         */
        volume: number | null;
      }

      export namespace Output {
        /**
         * Background audio played during the conversation.
         */
        export interface BackgroundSound {
          /**
           * ID of the audio file to play in the background.
           */
          file_id: string;

          /**
           * Background audio volume, from `0` to `2`.
           */
          volume: number;
        }
      }
    }

    export interface KnowledgeBaseDocument {
      /**
       * ID of a document from the Knowledge Base API.
       */
      id: string;
    }

    export interface KnowledgeBaseFolder {
      /**
       * ID of a folder from the Knowledge Base API.
       */
      id: string;
    }

    export interface Language {
      /**
       * Other languages the caller can switch to, in order. Each is a language, such as
       * fr, or a locale, such as es-MX. May repeat the primary.
       */
      additional: Array<string>;

      /**
       * Settings for each language, keyed by a language, such as es, or a locale, such
       * as es-MX. A preset applies whenever the agent speaks exactly its tag, the
       * primary included, so a preset for es doesn't apply to es-MX. presets.voice_id is
       * the voice the agent speaks the language with, and presets.normalization the
       * locale it uses to read the language's numbers, dates and currencies.
       * presets.voice_id is absent when the language uses the agent's voice, and
       * presets.normalization when it uses the language's own rules.
       */
      presets: { [key: string]: Language.Presets };

      /**
       * Primary language or locale for the conversation, such as en-US. Defaults to en.
       */
      primary: string;
    }

    export namespace Language {
      export interface Presets {
        normalization?: string;

        voice_id?: string;
      }
    }

    export interface Model {
      /**
       * Model ID from `GET /v1/agents/models`, or `custom_llm` to use the endpoint in
       * `custom_llm`.
       */
      id: string;

      /**
       * Fallback strategy: type auto uses Cartesia-managed fallback models in priority
       * order; the models and their order may change over time. Type explicit uses up to
       * three model IDs in the supplied order. Set fallback_strategy itself to null to
       * disable fallback. Fallback models use their own reasoning defaults. When
       * omitted, an agent keeps its current strategy; a new agent starts with auto, and
       * an agent created with or switched to custom_llm starts with none. Switching back
       * to a managed model restores auto. Fallback models are billed like any managed
       * model, including on an agent that uses custom_llm.
       */
      fallback_strategy: Model.Type | Model.UnionMember1 | null;

      /**
       * Maximum number of tokens the model can generate, from `1` to `4096`. Set to
       * `null` for no limit.
       */
      max_output_tokens: number | null;

      /**
       * Controls the randomness of model responses, from `0` to `1`.
       */
      temperature: number | null;

      /**
       * The customer-hosted completion endpoint. Present only when `id` is `custom_llm`.
       */
      custom_llm?: Model.CustomLlm;
    }

    export namespace Model {
      export interface Type {
        type: 'auto';
      }

      export interface UnionMember1 {
        ids: Array<string>;

        type: 'explicit';
      }

      /**
       * The customer-hosted completion endpoint. Present only when `id` is `custom_llm`.
       */
      export interface CustomLlm {
        /**
         * Optional model ID sent as `model` in requests to your endpoint. If unset, the
         * `model` field is omitted.
         */
        model_id: string | null;

        /**
         * Whether each request includes the call's dynamic variables in
         * `cartesia_extra_body.dynamic_variables`.
         */
        send_call_context: boolean;

        /**
         * The HTTPS base URL of the Chat Completions compatible API, such as
         * `https://api.example.com/v1`. Requests go to its `/chat/completions` path.
         */
        url: string;

        /**
         * The bearer token or Basic auth credential sent in the `Authorization` header.
         * Omit it if the endpoint needs none. For an API key sent in a different header,
         * such as `api-key`, add it to `request_headers` as a secret instead.
         */
        authentication?: CustomLlm.UnionMember0 | CustomLlm.UnionMember1 | null;

        /**
         * Headers included in each request. Secret values are never returned.
         */
        request_headers?: { [key: string]: string | CustomLlm.UnionMember1 };
      }

      export namespace CustomLlm {
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
      }
    }

    /**
     * Built-in tools available to the agent.
     */
    export interface SystemTools {
      /**
       * Configuration for ending the call. Set to `null` to disable this tool.
       */
      end_call: SystemTools.EndCall | null;

      /**
       * Configuration for sending DTMF tones. Set to `null` to disable this tool.
       */
      send_dtmf: SystemTools.SendDtmf | null;

      /**
       * Configuration for transferring the call. Set to `null` to disable this tool.
       */
      transfer_to_number: SystemTools.TransferToNumber | null;

      /**
       * Skip the agent's turn when the user asks for time to think or perform an action,
       * such as "Give me a second" or "Let me check". Existing check-in timing stays
       * unchanged unless `wait_timeout_secs` is configured. A configured timeout
       * temporarily changes the check-in timer; user speech or DTMF restores the
       * original timeout. Set this tool to `null` to disable it.
       */
      skip_turn?: SystemTools.SkipTurn | null;

      /**
       * Configuration for detecting voicemail, speaking a message, and ending the call.
       * Set to `null` to disable this tool.
       */
      voicemail_detection?: SystemTools.VoicemailDetection | null;
    }

    export namespace SystemTools {
      /**
       * Configuration for ending the call. Set to `null` to disable this tool.
       */
      export interface EndCall {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech: 'auto' | 'force' | 'off';
      }

      /**
       * Configuration for sending DTMF tones. Set to `null` to disable this tool.
       */
      export interface SendDtmf {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech: 'auto' | 'force' | 'off';
      }

      /**
       * Configuration for transferring the call. Set to `null` to disable this tool.
       */
      export interface TransferToNumber {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech: 'auto' | 'force' | 'off';

        /**
         * Destinations the agent can transfer calls to.
         */
        transfers: Array<TransferToNumber.Transfer>;
      }

      export namespace TransferToNumber {
        export interface Transfer {
          /**
           * When the agent should transfer the call to this destination.
           */
          condition: string;

          /**
           * Where to transfer the call.
           */
          destination: Transfer.UnionMember0 | Transfer.UnionMember1;
        }

        export namespace Transfer {
          export interface UnionMember0 {
            /**
             * An E.164 phone number or a variable such as `{{transfer_number}}`. The variable
             * must contain a valid E.164 number when the transfer runs.
             */
            phone_number: string;

            type: 'phone';
          }

          export interface UnionMember1 {
            /**
             * A SIP URI beginning with lowercase `sip:` or `sips:`, or a single dynamic
             * variable such as `{{sip_uri}}`. The variable must contain a valid SIP URI when
             * the transfer runs.
             */
            sip_uri: string;

            type: 'sip_uri';
          }
        }
      }

      /**
       * Skip the agent's turn when the user asks for time to think or perform an action,
       * such as "Give me a second" or "Let me check". Existing check-in timing stays
       * unchanged unless `wait_timeout_secs` is configured. A configured timeout
       * temporarily changes the check-in timer; user speech or DTMF restores the
       * original timeout. Set this tool to `null` to disable it.
       */
      export interface SkipTurn {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech: 'auto' | 'force' | 'off';

        /**
         * Temporary check-in timeout in seconds after skipping a turn. Set a longer
         * timeout to give the caller more time, `-1` to disable check-ins, or `null` to
         * keep normal timing. User speech or DTMF restores the original timeout. Requires
         * check-ins to be enabled. The inactivity end-call timer keeps running.
         */
        wait_timeout_secs?: number | null;
      }

      /**
       * Configuration for detecting voicemail, speaking a message, and ending the call.
       * Set to `null` to disable this tool.
       */
      export interface VoicemailDetection {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description: string | null;

        /**
         * Message spoken after voicemail is detected. Set to `null` for no configured
         * message.
         */
        message: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech: 'auto' | 'force' | 'off';
      }
    }

    export interface Tool {
      /**
       * ID of a tool from the Tools API.
       */
      id: string;
    }

    export interface Turn {
      /**
       * Seconds of inactivity before the agent checks in, from `5` to `60`. Defaults to
       * `8`. Set to `null` to disable check-ins. When enabled, it must be less than
       * `inactivity_end_call_secs`.
       */
      inactivity_check_in_secs: number | null;

      /**
       * Seconds of inactivity before the agent says a farewell message and ends the
       * call, from `20` to `240`. Defaults to `240`; cannot be `null`.
       */
      inactivity_end_call_secs: number;
    }
  }

  export interface Version {
    /**
     * Unique identifier for an immutable agent configuration version.
     */
    id: string;

    /**
     * Time when this version was created.
     */
    created_at: string;

    /**
     * ID of the user or API key that created this version. `null` when no creator was
     * recorded.
     */
    created_by: string | null;

    /**
     * Description supplied when this version was created. `null` if none was provided.
     */
    description: string | null;
  }
}

export interface AgentSummary {
  /**
   * Unique identifier for the agent.
   */
  id: string;

  /**
   * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
   * `2025-04-16T12:34:56.789Z`).
   */
  created_at: string;

  /**
   * Description of the agent.
   */
  description: string | null;

  /**
   * Name shown for the agent.
   */
  name: string;

  /**
   * An RFC 3339 / ISO 8601 date-time string with timezone (e.g.
   * `2025-04-16T12:34:56.789Z`).
   */
  updated_at: string;

  /**
   * Unique identifier for an immutable agent configuration version.
   */
  version_id: string;
}

export interface AgentCreateParams {
  config?: AgentCreateParams.Config;

  /**
   * Description of the agent.
   */
  description?: string | null;

  /**
   * Name shown for the agent. It does not need to be unique.
   */
  name?: string;
}

export namespace AgentCreateParams {
  export interface Config {
    audio?: Config.Audio;

    /**
     * Sample values for test calls, keyed by custom variable name. These are not used
     * in production. PATCH replaces the whole map; omit it to keep existing samples or
     * use `{}` to clear them.
     */
    dynamic_variable_placeholders?: { [key: string]: string | number | boolean };

    /**
     * ID of the event webhook that receives events from this agent.
     */
    event_webhook_id?: string | null;

    /**
     * Message the agent says first. Set to `null` to wait for the user to speak. All
     * `{{name}}` references must have values before the call starts.
     */
    initial_message?: string | null;

    /**
     * Controls how the agent handles interruptions while `initial_message` plays.
     * `allow` lets the caller interrupt it, `ignore` plays it in full without
     * replying, and `respond_after` plays it in full, then replies. Defaults to
     * `allow`.
     */
    initial_message_interruptions?: 'allow' | 'ignore' | 'respond_after';

    /**
     * Instructions that define the agent's behavior. Supports `{{name}}` references;
     * missing values leave the reference unchanged.
     */
    instructions?: string;

    /**
     * Knowledge base documents attached to the agent.
     */
    knowledge_base_documents?: Array<Config.KnowledgeBaseDocument>;

    /**
     * Knowledge base folders attached to the agent.
     */
    knowledge_base_folders?: Array<Config.KnowledgeBaseFolder>;

    language?: Config.Language;

    model?: Config.Model;

    /**
     * When enabled, the prompt is optimized with Cartesia's voice guidelines. Defaults
     * to `true`.
     */
    prompt_optimization?: boolean;

    /**
     * When enabled, starts generating an LLM response eagerly to reduce perceived
     * latency, before confirming that the user’s turn has ended. May increase LLM
     * costs. Defaults to `true`.
     */
    speculative_generation?: boolean;

    /**
     * Built-in tools available to the agent.
     */
    system_tools?: Config.SystemTools;

    /**
     * Time zone for `{{system__time}}`, such as `America/New_York`. Defaults to `UTC`.
     */
    timezone?: string;

    /**
     * Tools available to the agent.
     */
    tools?: Array<Config.Tool>;

    turn?: Config.Turn;
  }

  export namespace Config {
    export interface Audio {
      input?: Audio.Input;

      output?: Audio.Output;
    }

    export namespace Audio {
      export interface Input {
        asr_model?: 'auto' | 'ink-2' | 'ink-preview' | 'original';

        /**
         * Words or phrases that the speech recognizer should prioritize. At most 100
         * keyterms, totaling at most 1200 characters.
         */
        keyterms?: Array<string>;

        /**
         * Noise suppression applied to incoming audio. Use `off` to disable it, `auto` for
         * the default level, or `max` for stronger suppression.
         */
        noise_suppression?: 'off' | 'auto' | 'max';
      }

      export interface Output {
        /**
         * Background audio played during the conversation. Set to `null` to disable it.
         */
        background_sound?: Output.BackgroundSound | null;

        /**
         * Text-to-speech emotion supported by the selected voice and model, such as
         * `calm`, `happy`, or `sad`.
         */
        emotion?: string | null;

        /**
         * ID of the pronunciation dictionary used for agent speech.
         */
        pronunciation_dictionary_id?: string | null;

        /**
         * Speech speed multiplier, from `0.6` to `1.5`. Set to `null` to use the default
         * speed.
         */
        speed?: number | null;

        tts_model?: string | null;

        /**
         * ID of the voice used for agent speech.
         */
        voice_id?: string;

        /**
         * Speech volume multiplier, from `0.5` to `2`. Set to `null` to use the default
         * volume.
         */
        volume?: number | null;
      }

      export namespace Output {
        /**
         * Background audio played during the conversation. Set to `null` to disable it.
         */
        export interface BackgroundSound {
          /**
           * ID of the audio file to play in the background.
           */
          file_id: string;

          /**
           * Background audio volume, from `0` to `2`.
           */
          volume?: number;
        }
      }
    }

    export interface KnowledgeBaseDocument {
      /**
       * ID of a document from the Knowledge Base API.
       */
      id: string;
    }

    export interface KnowledgeBaseFolder {
      /**
       * ID of a folder from the Knowledge Base API.
       */
      id: string;
    }

    export interface Language {
      /**
       * Other languages the caller can switch to, in order. Each is a language, such as
       * fr, or a locale, such as es-MX. Omit to preserve the current list; [] clears it.
       * Each base language may appear only once, except that the primary may repeat
       * here.
       */
      additional?: Array<string>;

      /**
       * Settings for each language, keyed by a language, such as es, or a locale, such
       * as es-MX. A preset applies whenever the agent speaks exactly its tag, the
       * primary included, so a preset for es doesn't apply to es-MX. Keys need not be
       * the agent's languages. Omit to preserve the current presets; {} clears them. A
       * map you send replaces the current one.
       */
      presets?: { [key: string]: Language.Presets };

      /**
       * Primary language or locale, such as en-US. Null saves en. Supported values:
       * https://docs.cartesia.ai/api-reference/agents/create#body-config-language-primary-one-of-0
       */
      primary?: string | null;
    }

    export namespace Language {
      export interface Presets {
        /**
         * Locale the agent uses to read this language's numbers, dates and currencies,
         * such as en-IN. Omit to use the language's own rules.
         */
        normalization?: string;

        /**
         * ID of the voice the agent speaks this language with, instead of
         * audio.output.voice_id.
         */
        voice_id?: string;
      }
    }

    export interface Model {
      /**
       * Model ID from `GET /v1/agents/models`, or `custom_llm` to use the endpoint in
       * `custom_llm`.
       */
      id?: string;

      /**
       * The Chat Completions compatible endpoint the agent uses instead of a managed
       * model. A create or PATCH that sends it replaces the whole object.
       */
      custom_llm?: Model.CustomLlm;

      /**
       * Fallback strategy: type auto uses Cartesia-managed fallback models in priority
       * order; the models and their order may change over time. Type explicit uses up to
       * three model IDs in the supplied order. Set fallback_strategy itself to null to
       * disable fallback. Fallback models use their own reasoning defaults. When
       * omitted, an agent keeps its current strategy; a new agent starts with auto, and
       * an agent created with or switched to custom_llm starts with none. Switching back
       * to a managed model restores auto. Fallback models are billed like any managed
       * model, including on an agent that uses custom_llm.
       */
      fallback_strategy?: Model.Type | Model.UnionMember1 | null;

      /**
       * Maximum number of tokens the model can generate, from `1` to `4096`. Set to
       * `null` for no limit.
       */
      max_output_tokens?: number | null;

      /**
       * Controls the randomness of model responses, from `0` to `1`.
       */
      temperature?: number | null;
    }

    export namespace Model {
      /**
       * The Chat Completions compatible endpoint the agent uses instead of a managed
       * model. A create or PATCH that sends it replaces the whole object.
       */
      export interface CustomLlm {
        /**
         * The HTTPS base URL of the Chat Completions compatible API, such as
         * `https://api.example.com/v1`. Requests go to its `/chat/completions` path.
         */
        url: string;

        /**
         * The bearer token or Basic auth credential sent in the `Authorization` header.
         * Omit it if the endpoint needs none. For an API key sent in a different header,
         * such as `api-key`, add it to `request_headers` as a secret instead.
         */
        authentication?: CustomLlm.UnionMember0 | CustomLlm.UnionMember1 | null;

        /**
         * Optional model ID sent as `model` in requests to your endpoint. If unset, the
         * `model` field is omitted.
         */
        model_id?: string | null;

        /**
         * Headers included in each request. Secret values are never returned.
         */
        request_headers?: { [key: string]: string | CustomLlm.UnionMember1 };

        /**
         * Whether each request includes the call's dynamic variables in
         * `cartesia_extra_body.dynamic_variables`. Defaults to `false`.
         */
        send_call_context?: boolean;
      }

      export namespace CustomLlm {
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
      }

      export interface Type {
        type: 'auto';
      }

      export interface UnionMember1 {
        ids: Array<string>;

        type: 'explicit';
      }
    }

    /**
     * Built-in tools available to the agent.
     */
    export interface SystemTools {
      /**
       * Configuration for ending the call. Omit or set to `null` to disable this tool.
       */
      end_call?: SystemTools.EndCall | null;

      /**
       * Configuration for sending DTMF tones. Omit or set to `null` to disable this
       * tool.
       */
      send_dtmf?: SystemTools.SendDtmf | null;

      /**
       * Skip the agent's turn when the user asks for time to think or perform an action,
       * such as "Give me a second" or "Let me check". Existing check-in timing stays
       * unchanged unless `wait_timeout_secs` is configured. A configured timeout
       * temporarily changes the check-in timer; user speech or DTMF restores the
       * original timeout. Set this tool to `null` to disable it.
       */
      skip_turn?: SystemTools.SkipTurn | null;

      /**
       * Configuration for transferring the call. Omit or set to `null` to disable this
       * tool.
       */
      transfer_to_number?: SystemTools.TransferToNumber | null;

      /**
       * Configuration for detecting voicemail. Omit or set to `null` to disable this
       * tool.
       */
      voicemail_detection?: SystemTools.VoicemailDetection | null;
    }

    export namespace SystemTools {
      /**
       * Configuration for ending the call. Omit or set to `null` to disable this tool.
       */
      export interface EndCall {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }

      /**
       * Configuration for sending DTMF tones. Omit or set to `null` to disable this
       * tool.
       */
      export interface SendDtmf {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }

      /**
       * Skip the agent's turn when the user asks for time to think or perform an action,
       * such as "Give me a second" or "Let me check". Existing check-in timing stays
       * unchanged unless `wait_timeout_secs` is configured. A configured timeout
       * temporarily changes the check-in timer; user speech or DTMF restores the
       * original timeout. Set this tool to `null` to disable it.
       */
      export interface SkipTurn {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';

        /**
         * Temporary check-in timeout in seconds after skipping a turn. Set a longer
         * timeout to give the caller more time, `-1` to disable check-ins, or `null` to
         * keep normal timing. User speech or DTMF restores the original timeout. Requires
         * check-ins to be enabled. The inactivity end-call timer keeps running.
         */
        wait_timeout_secs?: number | null;
      }

      /**
       * Configuration for transferring the call. Omit or set to `null` to disable this
       * tool.
       */
      export interface TransferToNumber {
        /**
         * Destinations the agent can transfer calls to.
         */
        transfers: Array<TransferToNumber.Transfer>;

        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }

      export namespace TransferToNumber {
        export interface Transfer {
          /**
           * When the agent should transfer the call to this destination.
           */
          condition: string;

          /**
           * Where to transfer the call.
           */
          destination: Transfer.UnionMember0 | Transfer.UnionMember1;
        }

        export namespace Transfer {
          export interface UnionMember0 {
            /**
             * An E.164 phone number or a variable such as `{{transfer_number}}`. The variable
             * must contain a valid E.164 number when the transfer runs.
             */
            phone_number: string;

            type: 'phone';
          }

          export interface UnionMember1 {
            /**
             * A SIP URI beginning with lowercase `sip:` or `sips:`, or a single dynamic
             * variable such as `{{sip_uri}}`. The variable must contain a valid SIP URI when
             * the transfer runs.
             */
            sip_uri: string;

            type: 'sip_uri';
          }
        }
      }

      /**
       * Configuration for detecting voicemail. Omit or set to `null` to disable this
       * tool.
       */
      export interface VoicemailDetection {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Message spoken after voicemail is detected. Set to `null` for no configured
         * message.
         */
        message?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }
    }

    export interface Tool {
      /**
       * ID of a tool from the Tools API.
       */
      id: string;
    }

    export interface Turn {
      /**
       * Seconds of inactivity before the agent checks in, from `5` to `60`. Defaults to
       * `8`. Set to `null` to disable check-ins. When enabled, it must be less than
       * `inactivity_end_call_secs`.
       */
      inactivity_check_in_secs?: number | null;

      /**
       * Seconds of inactivity before the agent says a farewell message and ends the
       * call, from `20` to `240`. Defaults to `240`; cannot be `null`.
       */
      inactivity_end_call_secs?: number;
    }
  }
}

export interface AgentUpdateParams {
  config?: AgentUpdateParams.Config;

  /**
   * Description of the agent.
   */
  description?: string | null;

  /**
   * Name shown for the agent. It does not need to be unique.
   */
  name?: string;

  /**
   * Description to attach to the new configuration version. Allowed only when this
   * request changes `config`.
   */
  version_description?: string | null;
}

export namespace AgentUpdateParams {
  export interface Config {
    audio?: Config.Audio;

    /**
     * Sample values for test calls, keyed by custom variable name. These are not used
     * in production. PATCH replaces the whole map; omit it to keep existing samples or
     * use `{}` to clear them.
     */
    dynamic_variable_placeholders?: { [key: string]: string | number | boolean };

    /**
     * ID of the event webhook that receives events from this agent.
     */
    event_webhook_id?: string | null;

    /**
     * Message the agent says first. Set to `null` to wait for the user to speak. All
     * `{{name}}` references must have values before the call starts.
     */
    initial_message?: string | null;

    /**
     * Controls how the agent handles interruptions while `initial_message` plays.
     * `allow` lets the caller interrupt it, `ignore` plays it in full without
     * replying, and `respond_after` plays it in full, then replies. Defaults to
     * `allow`.
     */
    initial_message_interruptions?: 'allow' | 'ignore' | 'respond_after';

    /**
     * Instructions that define the agent's behavior. Supports `{{name}}` references;
     * missing values leave the reference unchanged.
     */
    instructions?: string;

    /**
     * Knowledge base documents attached to the agent.
     */
    knowledge_base_documents?: Array<Config.KnowledgeBaseDocument>;

    /**
     * Knowledge base folders attached to the agent.
     */
    knowledge_base_folders?: Array<Config.KnowledgeBaseFolder>;

    language?: Config.Language;

    model?: Config.Model;

    /**
     * When enabled, the prompt is optimized with Cartesia's voice guidelines. Defaults
     * to `true`.
     */
    prompt_optimization?: boolean;

    /**
     * When enabled, starts generating an LLM response eagerly to reduce perceived
     * latency, before confirming that the user’s turn has ended. May increase LLM
     * costs. Defaults to `true`.
     */
    speculative_generation?: boolean;

    /**
     * Built-in tools available to the agent.
     */
    system_tools?: Config.SystemTools;

    /**
     * Time zone for `{{system__time}}`, such as `America/New_York`. Defaults to `UTC`.
     */
    timezone?: string;

    /**
     * Tools available to the agent.
     */
    tools?: Array<Config.Tool>;

    turn?: Config.Turn;
  }

  export namespace Config {
    export interface Audio {
      input?: Audio.Input;

      output?: Audio.Output;
    }

    export namespace Audio {
      export interface Input {
        asr_model?: 'auto' | 'ink-2' | 'ink-preview' | 'original';

        /**
         * Words or phrases that the speech recognizer should prioritize. At most 100
         * keyterms, totaling at most 1200 characters.
         */
        keyterms?: Array<string>;

        /**
         * Noise suppression applied to incoming audio. Use `off` to disable it, `auto` for
         * the default level, or `max` for stronger suppression.
         */
        noise_suppression?: 'off' | 'auto' | 'max';
      }

      export interface Output {
        /**
         * Background audio played during the conversation. Set to `null` to disable it.
         */
        background_sound?: Output.BackgroundSound | null;

        /**
         * Text-to-speech emotion supported by the selected voice and model, such as
         * `calm`, `happy`, or `sad`.
         */
        emotion?: string | null;

        /**
         * ID of the pronunciation dictionary used for agent speech.
         */
        pronunciation_dictionary_id?: string | null;

        /**
         * Speech speed multiplier, from `0.6` to `1.5`. Set to `null` to use the default
         * speed.
         */
        speed?: number | null;

        tts_model?: string | null;

        /**
         * ID of the voice used for agent speech.
         */
        voice_id?: string;

        /**
         * Speech volume multiplier, from `0.5` to `2`. Set to `null` to use the default
         * volume.
         */
        volume?: number | null;
      }

      export namespace Output {
        /**
         * Background audio played during the conversation. Set to `null` to disable it.
         */
        export interface BackgroundSound {
          /**
           * ID of the audio file to play in the background.
           */
          file_id?: string;

          /**
           * Background audio volume, from `0` to `2`.
           */
          volume?: number;
        }
      }
    }

    export interface KnowledgeBaseDocument {
      /**
       * ID of a document from the Knowledge Base API.
       */
      id: string;
    }

    export interface KnowledgeBaseFolder {
      /**
       * ID of a folder from the Knowledge Base API.
       */
      id: string;
    }

    export interface Language {
      /**
       * Other languages the caller can switch to, in order. Each is a language, such as
       * fr, or a locale, such as es-MX. Omit to preserve the current list; [] clears it.
       * Each base language may appear only once, except that the primary may repeat
       * here.
       */
      additional?: Array<string>;

      /**
       * Settings for each language, keyed by a language, such as es, or a locale, such
       * as es-MX. A preset applies whenever the agent speaks exactly its tag, the
       * primary included, so a preset for es doesn't apply to es-MX. Keys need not be
       * the agent's languages. Omit to preserve the current presets; {} clears them. A
       * map you send replaces the current one.
       */
      presets?: { [key: string]: Language.Presets };

      /**
       * Primary language or locale, such as en-US. Null saves en. Supported values:
       * https://docs.cartesia.ai/api-reference/agents/create#body-config-language-primary-one-of-0
       */
      primary?: string | null;
    }

    export namespace Language {
      export interface Presets {
        /**
         * Locale the agent uses to read this language's numbers, dates and currencies,
         * such as en-IN. Omit to use the language's own rules.
         */
        normalization?: string;

        /**
         * ID of the voice the agent speaks this language with, instead of
         * audio.output.voice_id.
         */
        voice_id?: string;
      }
    }

    export interface Model {
      /**
       * Model ID from `GET /v1/agents/models`, or `custom_llm` to use the endpoint in
       * `custom_llm`.
       */
      id?: string;

      /**
       * The Chat Completions compatible endpoint the agent uses instead of a managed
       * model. A create or PATCH that sends it replaces the whole object.
       */
      custom_llm?: Model.CustomLlm;

      /**
       * Fallback strategy: type auto uses Cartesia-managed fallback models in priority
       * order; the models and their order may change over time. Type explicit uses up to
       * three model IDs in the supplied order. Set fallback_strategy itself to null to
       * disable fallback. Fallback models use their own reasoning defaults. When
       * omitted, an agent keeps its current strategy; a new agent starts with auto, and
       * an agent created with or switched to custom_llm starts with none. Switching back
       * to a managed model restores auto. Fallback models are billed like any managed
       * model, including on an agent that uses custom_llm.
       */
      fallback_strategy?: Model.Type | Model.UnionMember1 | null;

      /**
       * Maximum number of tokens the model can generate, from `1` to `4096`. Set to
       * `null` for no limit.
       */
      max_output_tokens?: number | null;

      /**
       * Controls the randomness of model responses, from `0` to `1`.
       */
      temperature?: number | null;
    }

    export namespace Model {
      /**
       * The Chat Completions compatible endpoint the agent uses instead of a managed
       * model. A create or PATCH that sends it replaces the whole object.
       */
      export interface CustomLlm {
        /**
         * The HTTPS base URL of the Chat Completions compatible API, such as
         * `https://api.example.com/v1`. Requests go to its `/chat/completions` path.
         */
        url: string;

        /**
         * The bearer token or Basic auth credential sent in the `Authorization` header.
         * Omit it if the endpoint needs none. For an API key sent in a different header,
         * such as `api-key`, add it to `request_headers` as a secret instead.
         */
        authentication?: CustomLlm.UnionMember0 | CustomLlm.UnionMember1 | null;

        /**
         * Optional model ID sent as `model` in requests to your endpoint. If unset, the
         * `model` field is omitted.
         */
        model_id?: string | null;

        /**
         * Headers included in each request. Secret values are never returned.
         */
        request_headers?: { [key: string]: string | CustomLlm.UnionMember1 };

        /**
         * Whether each request includes the call's dynamic variables in
         * `cartesia_extra_body.dynamic_variables`. Defaults to `false`.
         */
        send_call_context?: boolean;
      }

      export namespace CustomLlm {
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
      }

      export interface Type {
        type: 'auto';
      }

      export interface UnionMember1 {
        ids: Array<string>;

        type: 'explicit';
      }
    }

    /**
     * Built-in tools available to the agent.
     */
    export interface SystemTools {
      /**
       * Configuration for ending the call. Omit to keep the current setting or set to
       * `null` to disable this tool.
       */
      end_call?: SystemTools.EndCall | null;

      /**
       * Configuration for sending DTMF tones. Omit to keep the current setting or set to
       * `null` to disable this tool.
       */
      send_dtmf?: SystemTools.SendDtmf | null;

      /**
       * Skip the agent's turn when the user asks for time to think or perform an action,
       * such as "Give me a second" or "Let me check". Existing check-in timing stays
       * unchanged unless `wait_timeout_secs` is configured. A configured timeout
       * temporarily changes the check-in timer; user speech or DTMF restores the
       * original timeout. Set this tool to `null` to disable it.
       */
      skip_turn?: SystemTools.SkipTurn | null;

      /**
       * Configuration for transferring the call. Omit to keep the current setting or set
       * to `null` to disable this tool.
       */
      transfer_to_number?: SystemTools.TransferToNumber | null;

      /**
       * Configuration for detecting voicemail. Omit to keep the current setting or set
       * to `null` to disable this tool.
       */
      voicemail_detection?: SystemTools.VoicemailDetection | null;
    }

    export namespace SystemTools {
      /**
       * Configuration for ending the call. Omit to keep the current setting or set to
       * `null` to disable this tool.
       */
      export interface EndCall {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }

      /**
       * Configuration for sending DTMF tones. Omit to keep the current setting or set to
       * `null` to disable this tool.
       */
      export interface SendDtmf {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }

      /**
       * Skip the agent's turn when the user asks for time to think or perform an action,
       * such as "Give me a second" or "Let me check". Existing check-in timing stays
       * unchanged unless `wait_timeout_secs` is configured. A configured timeout
       * temporarily changes the check-in timer; user speech or DTMF restores the
       * original timeout. Set this tool to `null` to disable it.
       */
      export interface SkipTurn {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';

        /**
         * Temporary check-in timeout in seconds after skipping a turn. Set a longer
         * timeout to give the caller more time, `-1` to disable check-ins, or `null` to
         * keep normal timing. User speech or DTMF restores the original timeout. Requires
         * check-ins to be enabled. The inactivity end-call timer keeps running. Omit to
         * keep the current setting.
         */
        wait_timeout_secs?: number | null;
      }

      /**
       * Configuration for transferring the call. Omit to keep the current setting or set
       * to `null` to disable this tool.
       */
      export interface TransferToNumber {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';

        /**
         * Destinations the agent can transfer calls to.
         */
        transfers?: Array<TransferToNumber.Transfer>;
      }

      export namespace TransferToNumber {
        export interface Transfer {
          /**
           * When the agent should transfer the call to this destination.
           */
          condition: string;

          /**
           * Where to transfer the call.
           */
          destination: Transfer.UnionMember0 | Transfer.UnionMember1;
        }

        export namespace Transfer {
          export interface UnionMember0 {
            /**
             * An E.164 phone number or a variable such as `{{transfer_number}}`. The variable
             * must contain a valid E.164 number when the transfer runs.
             */
            phone_number: string;

            type: 'phone';
          }

          export interface UnionMember1 {
            /**
             * A SIP URI beginning with lowercase `sip:` or `sips:`, or a single dynamic
             * variable such as `{{sip_uri}}`. The variable must contain a valid SIP URI when
             * the transfer runs.
             */
            sip_uri: string;

            type: 'sip_uri';
          }
        }
      }

      /**
       * Configuration for detecting voicemail. Omit to keep the current setting or set
       * to `null` to disable this tool.
       */
      export interface VoicemailDetection {
        /**
         * What the tool does and when the agent should use it. Set to `null` to use the
         * default system-optimized description.
         */
        description?: string | null;

        /**
         * Message spoken after voicemail is detected. Set to `null` for no configured
         * message.
         */
        message?: string | null;

        /**
         * Controls whether the agent speaks before using the tool. `auto` lets the agent
         * decide, `force` always makes the agent speak first, and `off` never asks it to.
         */
        pre_tool_speech?: 'auto' | 'force' | 'off';
      }
    }

    export interface Tool {
      /**
       * ID of a tool from the Tools API.
       */
      id: string;
    }

    export interface Turn {
      /**
       * Seconds of inactivity before the agent checks in, from `5` to `60`. Defaults to
       * `8`. Set to `null` to disable check-ins. When enabled, it must be less than
       * `inactivity_end_call_secs`.
       */
      inactivity_check_in_secs?: number | null;

      /**
       * Seconds of inactivity before the agent says a farewell message and ends the
       * call, from `20` to `240`. Defaults to `240`; cannot be `null`.
       */
      inactivity_end_call_secs?: number;
    }
  }
}

export interface AgentListParams extends CursorIDPageParams {
  /**
   * The maximum number of items to return, ranging between 1 and 100.
   */
  limit?: number;

  /**
   * Search agents by name or description.
   */
  q?: string;
}

Agents.Models = Models;
Agents.Tools = Tools;
Agents.Versions = Versions;
Agents.Calls = Calls;
Agents.Metrics = Metrics;
Agents.Webhooks = Webhooks;
Agents.PhoneNumbers = PhoneNumbers;
Agents.Sessions = Sessions;
Agents.KnowledgeBase = KnowledgeBase;

export declare namespace Agents {
  export {
    type Agent as Agent,
    type AgentSummary as AgentSummary,
    type AgentSummariesCursorIDPage as AgentSummariesCursorIDPage,
    type AgentCreateParams as AgentCreateParams,
    type AgentUpdateParams as AgentUpdateParams,
    type AgentListParams as AgentListParams,
  };

  export {
    Models as Models,
    type ModelsAPIModel as Model,
    type ModelsCursorIDPage as ModelsCursorIDPage,
    type ModelListParams as ModelListParams,
  };

  export {
    Tools as Tools,
    type ToolsAPITool as Tool,
    type WebhookBodyParam as WebhookBodyParam,
    type ToolListResponse as ToolListResponse,
    type ToolCreateParams as ToolCreateParams,
    type ToolRetrieveParams as ToolRetrieveParams,
    type ToolUpdateParams as ToolUpdateParams,
    type ToolListParams as ToolListParams,
  };

  export {
    Versions as Versions,
    type VersionsAPIVersion as Version,
    type VersionsCursorIDPage as VersionsCursorIDPage,
    type VersionRetrieveParams as VersionRetrieveParams,
    type VersionListParams as VersionListParams,
  };

  export {
    Calls as Calls,
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
    Metrics as Metrics,
    type Metric as Metric,
    type MetricListResponse as MetricListResponse,
    type MetricCreateParams as MetricCreateParams,
    type MetricListParams as MetricListParams,
    type MetricAddToAgentParams as MetricAddToAgentParams,
    type MetricRemoveFromAgentParams as MetricRemoveFromAgentParams,
  };

  export {
    Webhooks as Webhooks,
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

  export {
    PhoneNumbers as PhoneNumbers,
    type PhoneNumber as PhoneNumber,
    type PhoneNumberListResponse as PhoneNumberListResponse,
    type PhoneNumberProvisionResponse as PhoneNumberProvisionResponse,
    type PhoneNumberProvisioningUsageResponse as PhoneNumberProvisioningUsageResponse,
    type PhoneNumberUpdateParams as PhoneNumberUpdateParams,
    type PhoneNumberListParams as PhoneNumberListParams,
    type PhoneNumberImportParams as PhoneNumberImportParams,
    type PhoneNumberProvisionParams as PhoneNumberProvisionParams,
  };

  export {
    Sessions as Sessions,
    type SessionCreateWebrtcResponse as SessionCreateWebrtcResponse,
    type SessionCreateWebsocketResponse as SessionCreateWebsocketResponse,
    type SessionCreateWebrtcParams as SessionCreateWebrtcParams,
    type SessionCreateWebsocketParams as SessionCreateWebsocketParams,
  };

  export { KnowledgeBase as KnowledgeBase };
}
