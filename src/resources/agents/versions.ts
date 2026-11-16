// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { CursorIDPage, type CursorIDPageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Versions extends APIResource {
  /**
   * Returns one immutable configuration snapshot. To restore it, pass its `config`
   * to `PATCH /v1/agents/{agent_id}`. Restoring creates a new version and does not
   * change existing history.
   *
   * @example
   * ```ts
   * const version = await client.agents.versions.retrieve('x', {
   *   agent_id: 'x',
   * });
   * ```
   */
  retrieve(versionID: string, params: VersionRetrieveParams, options?: RequestOptions): APIPromise<Version> {
    const { agent_id } = params;
    return this._client.get(path`/v1/agents/${agent_id}/versions/${versionID}`, options);
  }

  /**
   * Returns the agent's configuration history, ordered from newest to oldest. Each
   * version is an immutable snapshot of the complete configuration.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const version of client.agents.versions.list(
   *   'x',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(
    agentID: string,
    query: VersionListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<VersionsCursorIDPage, Version> {
    return this._client.getAPIList(path`/v1/agents/${agentID}/versions`, CursorIDPage<Version>, {
      query,
      ...options,
    });
  }
}

export type VersionsCursorIDPage = CursorIDPage<Version>;

/**
 * An immutable snapshot of an agent's configuration.
 */
export interface Version {
  /**
   * Unique identifier for an immutable agent configuration version.
   */
  id: string;

  /**
   * Complete agent configuration.
   */
  config: Version.Config;

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

export namespace Version {
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
}

export interface VersionRetrieveParams {
  /**
   * Unique identifier for the agent.
   */
  agent_id: string;
}

export interface VersionListParams extends CursorIDPageParams {
  /**
   * The maximum number of items to return, ranging between 1 and 100.
   */
  limit?: number;
}

export declare namespace Versions {
  export {
    type Version as Version,
    type VersionsCursorIDPage as VersionsCursorIDPage,
    type VersionRetrieveParams as VersionRetrieveParams,
    type VersionListParams as VersionListParams,
  };
}
