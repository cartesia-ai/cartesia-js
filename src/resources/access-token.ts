// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class AccessToken extends APIResource {
  /**
   * Generates a new Access Token for the client. These tokens are short-lived and
   * should be used to make requests to the API from authenticated clients.
   */
  create(body: AccessTokenCreateParams, options?: RequestOptions): APIPromise<AccessTokenCreateResponse> {
    return this._client.post('/access-token', { body, ...options });
  }
}

export interface AccessTokenCreateResponse {
  /**
   * The generated Access Token.
   */
  token: string;
}

export interface AccessTokenCreateParams {
  /**
   * The number of seconds the token will be valid for since the time of generation.
   * The maximum is 1 hour (3600 seconds).
   */
  expires_in?: number | null;

  /**
   * The permissions to be granted via the token. Both TTS and STT grants are
   * optional - specify only the capabilities you need.
   */
  grants?: AccessTokenCreateParams.Grants | null;
}

export namespace AccessTokenCreateParams {
  /**
   * The permissions to be granted via the token. Both TTS and STT grants are
   * optional - specify only the capabilities you need.
   */
  export interface Grants {
    /**
     * The `agent` grant allows the token to be used to access the Agent websocket
     * calling [endpoint](/line/integrations/web-calls#connection).
     */
    agent?: boolean | null;

    /**
     * The `stt` grant allows the token to be used to access any STT endpoint.
     */
    stt?: boolean | null;

    /**
     * The `tts` grant allows the token to be used to access any TTS endpoint.
     */
    tts?: boolean | null;
  }
}

export declare namespace AccessToken {
  export {
    type AccessTokenCreateResponse as AccessTokenCreateResponse,
    type AccessTokenCreateParams as AccessTokenCreateParams,
  };
}
