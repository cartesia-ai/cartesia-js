// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TTSAPI from '../tts';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Sessions extends APIResource {
  /**
   * Creates a WebRTC session on your trusted server and returns credentials for the
   * browser to join. Authenticate this request with an API key; access tokens,
   * including returned session tokens, cannot create sessions.
   *
   * @example
   * ```ts
   * const response = await client.agents.sessions.createWebrtc(
   *   'x',
   * );
   * ```
   */
  createWebrtc(
    agentID: string,
    body: SessionCreateWebrtcParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<SessionCreateWebrtcResponse> {
    return this._client.post(path`/v1/agents/webrtc/${agentID}/sessions`, { body, ...options });
  }

  /**
   * Creates a call-bound WebSocket session on your trusted server and returns a
   * session token for the browser to connect. Authenticate this request with an API
   * key; access tokens, including returned session tokens, cannot create sessions.
   *
   * @example
   * ```ts
   * const response =
   *   await client.agents.sessions.createWebsocket('x');
   * ```
   */
  createWebsocket(
    agentID: string,
    body: SessionCreateWebsocketParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<SessionCreateWebsocketResponse> {
    return this._client.post(path`/v1/agents/websocket/${agentID}/sessions`, { body, ...options });
  }
}

export interface SessionCreateWebrtcResponse {
  /**
   * Short-lived LiveKit participant token for the browser connection. Do not log it.
   */
  token: string;

  /**
   * ID of the pre-created call.
   */
  call_id: string;

  /**
   * Connection deadline. Create a new session if the browser does not join before
   * this time.
   */
  expires_at: string;

  /**
   * LiveKit room the browser joins.
   */
  room: string;

  /**
   * LiveKit server URL the browser connects to.
   */
  url: string;
}

export interface SessionCreateWebsocketResponse {
  /**
   * Opaque, short-lived, single-use session token. Do not inspect or log it.
   */
  token: string;

  /**
   * ID of the pre-created call. The `session_ready` event returns the same value.
   */
  call_id: string;

  /**
   * Connection deadline, currently four minutes after creation. Use this timestamp
   * rather than calculating the deadline.
   */
  expires_at: string;

  /**
   * WebSocket URL for this agent. Append the returned session token as the
   * `access_token` query parameter.
   */
  url: string;
}

export interface SessionCreateWebrtcParams {
  /**
   * Per-call overrides using the same field structure as agent configuration.
   * Omitted fields use the agent's published configuration.
   */
  config_overrides?: SessionCreateWebrtcParams.ConfigOverrides;

  /**
   * Trusted values that Cartesia stores on the call and supplies to the agent.
   */
  dynamic_variables?: { [key: string]: string | number | boolean };
}

export namespace SessionCreateWebrtcParams {
  /**
   * Per-call overrides using the same field structure as agent configuration.
   * Omitted fields use the agent's published configuration.
   */
  export interface ConfigOverrides {
    audio?: ConfigOverrides.Audio;

    /**
     * Message spoken when the call begins. Set to `null` to wait for the caller to
     * speak first.
     */
    initial_message?: string | null;

    /**
     * Instructions that define the agent's behavior for this call.
     */
    instructions?: string;

    language?: ConfigOverrides.Language;
  }

  export namespace ConfigOverrides {
    export interface Audio {
      output?: Audio.Output;
    }

    export namespace Audio {
      export interface Output {
        /**
         * The primary emotions are `neutral`, `calm`, `angry`, `content`, `sad`, `scared`.
         * For more options, see
         * [Prompting Sonic-3](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion#emotion-controls-beta).
         */
        emotion?: TTSAPI.Emotion | null;

        /**
         * Speech speed multiplier from `0.6` to `1.5`. Set to `null` to use the default
         * speed.
         */
        speed?: number | null;

        /**
         * ID of the voice used for agent speech during this call.
         */
        voice_id?: string;
      }
    }

    export interface Language {
      /**
       * Primary language used for this call. Omit to inherit the published language or
       * set to `null` to use English (`en`).
       */
      primary?:
        | 'en'
        | 'fr'
        | 'de'
        | 'es'
        | 'pt'
        | 'zh'
        | 'ja'
        | 'hi'
        | 'it'
        | 'ko'
        | 'nl'
        | 'pl'
        | 'ru'
        | 'sv'
        | 'tr'
        | 'tl'
        | 'bg'
        | 'ro'
        | 'ar'
        | 'cs'
        | 'el'
        | 'fi'
        | 'hr'
        | 'ms'
        | 'sk'
        | 'da'
        | 'ta'
        | 'uk'
        | 'hu'
        | 'no'
        | 'vi'
        | 'bn'
        | 'th'
        | 'he'
        | 'ka'
        | 'id'
        | 'te'
        | 'gu'
        | 'kn'
        | 'ml'
        | 'mr'
        | 'pa'
        | 'or'
        | 'ur'
        | 'bg-BG'
        | 'bn-IN'
        | 'cs-CZ'
        | 'da-DK'
        | 'de-DE'
        | 'el-GR'
        | 'en-AU'
        | 'en-CA'
        | 'en-GB'
        | 'en-IE'
        | 'en-IN'
        | 'en-NZ'
        | 'en-SG'
        | 'en-US'
        | 'en-ZA'
        | 'es-ES'
        | 'es-MX'
        | 'es-US'
        | 'fi-FI'
        | 'fr-CA'
        | 'fr-FR'
        | 'gu-IN'
        | 'he-IL'
        | 'hi-IN'
        | 'hr-HR'
        | 'hu-HU'
        | 'id-ID'
        | 'it-IT'
        | 'ja-JP'
        | 'ka-GE'
        | 'kn-IN'
        | 'ko-KR'
        | 'ml-IN'
        | 'mr-IN'
        | 'ms-MY'
        | 'nl-BE'
        | 'nl-NL'
        | 'no-NO'
        | 'or-IN'
        | 'pa-IN'
        | 'pl-PL'
        | 'pt-BR'
        | 'pt-PT'
        | 'ro-RO'
        | 'ru-RU'
        | 'sk-SK'
        | 'sv-SE'
        | 'ta-IN'
        | 'te-IN'
        | 'th-TH'
        | 'tl-PH'
        | 'tr-TR'
        | 'uk-UA'
        | 'ur-IN'
        | 'vi-VN'
        | 'zh-CN'
        | null;
    }
  }
}

export interface SessionCreateWebsocketParams {
  /**
   * Per-call overrides using the same field structure as agent configuration.
   * Omitted fields use the agent's published configuration.
   */
  config_overrides?: SessionCreateWebsocketParams.ConfigOverrides;

  /**
   * Trusted values that Cartesia stores on the call and supplies to the agent.
   */
  dynamic_variables?: { [key: string]: string | number | boolean };
}

export namespace SessionCreateWebsocketParams {
  /**
   * Per-call overrides using the same field structure as agent configuration.
   * Omitted fields use the agent's published configuration.
   */
  export interface ConfigOverrides {
    audio?: ConfigOverrides.Audio;

    /**
     * Message spoken when the call begins. Set to `null` to wait for the caller to
     * speak first.
     */
    initial_message?: string | null;

    /**
     * Instructions that define the agent's behavior for this call.
     */
    instructions?: string;

    language?: ConfigOverrides.Language;
  }

  export namespace ConfigOverrides {
    export interface Audio {
      output?: Audio.Output;
    }

    export namespace Audio {
      export interface Output {
        /**
         * The primary emotions are `neutral`, `calm`, `angry`, `content`, `sad`, `scared`.
         * For more options, see
         * [Prompting Sonic-3](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion#emotion-controls-beta).
         */
        emotion?: TTSAPI.Emotion | null;

        /**
         * Speech speed multiplier from `0.6` to `1.5`. Set to `null` to use the default
         * speed.
         */
        speed?: number | null;

        /**
         * ID of the voice used for agent speech during this call.
         */
        voice_id?: string;
      }
    }

    export interface Language {
      /**
       * Primary language used for this call. Omit to inherit the published language or
       * set to `null` to use English (`en`).
       */
      primary?:
        | 'en'
        | 'fr'
        | 'de'
        | 'es'
        | 'pt'
        | 'zh'
        | 'ja'
        | 'hi'
        | 'it'
        | 'ko'
        | 'nl'
        | 'pl'
        | 'ru'
        | 'sv'
        | 'tr'
        | 'tl'
        | 'bg'
        | 'ro'
        | 'ar'
        | 'cs'
        | 'el'
        | 'fi'
        | 'hr'
        | 'ms'
        | 'sk'
        | 'da'
        | 'ta'
        | 'uk'
        | 'hu'
        | 'no'
        | 'vi'
        | 'bn'
        | 'th'
        | 'he'
        | 'ka'
        | 'id'
        | 'te'
        | 'gu'
        | 'kn'
        | 'ml'
        | 'mr'
        | 'pa'
        | 'or'
        | 'ur'
        | 'bg-BG'
        | 'bn-IN'
        | 'cs-CZ'
        | 'da-DK'
        | 'de-DE'
        | 'el-GR'
        | 'en-AU'
        | 'en-CA'
        | 'en-GB'
        | 'en-IE'
        | 'en-IN'
        | 'en-NZ'
        | 'en-SG'
        | 'en-US'
        | 'en-ZA'
        | 'es-ES'
        | 'es-MX'
        | 'es-US'
        | 'fi-FI'
        | 'fr-CA'
        | 'fr-FR'
        | 'gu-IN'
        | 'he-IL'
        | 'hi-IN'
        | 'hr-HR'
        | 'hu-HU'
        | 'id-ID'
        | 'it-IT'
        | 'ja-JP'
        | 'ka-GE'
        | 'kn-IN'
        | 'ko-KR'
        | 'ml-IN'
        | 'mr-IN'
        | 'ms-MY'
        | 'nl-BE'
        | 'nl-NL'
        | 'no-NO'
        | 'or-IN'
        | 'pa-IN'
        | 'pl-PL'
        | 'pt-BR'
        | 'pt-PT'
        | 'ro-RO'
        | 'ru-RU'
        | 'sk-SK'
        | 'sv-SE'
        | 'ta-IN'
        | 'te-IN'
        | 'th-TH'
        | 'tl-PH'
        | 'tr-TR'
        | 'uk-UA'
        | 'ur-IN'
        | 'vi-VN'
        | 'zh-CN'
        | null;
    }
  }
}

export declare namespace Sessions {
  export {
    type SessionCreateWebrtcResponse as SessionCreateWebrtcResponse,
    type SessionCreateWebsocketResponse as SessionCreateWebsocketResponse,
    type SessionCreateWebrtcParams as SessionCreateWebrtcParams,
    type SessionCreateWebsocketParams as SessionCreateWebsocketParams,
  };
}
