// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Providers extends APIResource {
  /**
   * Link a telephony provider account. For Twilio, credentials are validated before
   * the provider is created. Each account SID + region combination can only be
   * linked once. For SIP trunks, configure a trunk with an inbound and/or outbound
   * configuration.
   *
   * @example
   * ```ts
   * const provider =
   *   await client.agents.phoneNumbers.providers.create({
   *     account_sid: 'account_sid',
   *     api_key_secret: 'api_key_secret',
   *     api_key_sid: 'api_key_sid',
   *     type: 'twilio',
   *   });
   * ```
   */
  create(body: ProviderCreateParams, options?: RequestOptions): APIPromise<ProviderCreateResponse> {
    return this._client.post('/agents/phone-numbers/providers', { body, ...options });
  }

  /**
   * Returns the details of a specific provider account.
   *
   * @example
   * ```ts
   * const provider =
   *   await client.agents.phoneNumbers.providers.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ProviderRetrieveResponse> {
    return this._client.get(path`/agents/phone-numbers/providers/${id}`, options);
  }

  /**
   * Update a provider. To ensure assigned numbers are reachable, Twilio credentials
   * are validated before saving. If the new credentials are invalid, the request
   * fails and returns a list of unreachable numbers currently assigned to agents.
   * For SIP trunks, omitted fields remain unchanged. Set `credentials` or
   * `destination_country` to `null` to clear that field. Send `[]` to clear an
   * inbound allowlist.
   *
   * @example
   * ```ts
   * const provider =
   *   await client.agents.phoneNumbers.providers.update('id', {
   *     api_key_secret: 'api_key_secret',
   *     api_key_sid: 'api_key_sid',
   *     type: 'twilio',
   *   });
   * ```
   */
  update(
    id: string,
    body: ProviderUpdateParams,
    options?: RequestOptions,
  ): APIPromise<ProviderUpdateResponse> {
    return this._client.patch(path`/agents/phone-numbers/providers/${id}`, { body, ...options });
  }

  /**
   * List telephony provider accounts linked to your account. Supports Twilio and SIP
   * Trunk providers.
   *
   * @example
   * ```ts
   * const providers =
   *   await client.agents.phoneNumbers.providers.list();
   * ```
   */
  list(
    query: ProviderListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProviderListResponse> {
    return this._client.get('/agents/phone-numbers/providers', { query, ...options });
  }

  /**
   * Delete a provider account
   *
   * @example
   * ```ts
   * await client.agents.phoneNumbers.providers.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/agents/phone-numbers/providers/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * A telephony provider account.
 */
export type ProviderCreateResponse =
  | ProviderCreateResponse.TwilioProviderResponse
  | ProviderCreateResponse.SipTrunkProviderResponse;

export namespace ProviderCreateResponse {
  /**
   * A linked Twilio account. The `api_key_sid` field is partially masked in
   * responses.
   */
  export interface TwilioProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * The Twilio account SID.
     */
    account_sid: string;

    /**
     * The Twilio API key SID (partially masked).
     */
    api_key_sid: string;

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region: 'us1' | 'ie1' | 'au1';

    /**
     * Always `"twilio"`.
     */
    type: 'twilio';

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;
  }

  /**
   * A linked SIP trunk provider.
   */
  export interface SipTrunkProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * Always `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    inbound?: SipTrunkProviderResponse.Inbound;

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    outbound?: SipTrunkProviderResponse.Outbound;
  }

  export namespace SipTrunkProviderResponse {
    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Inbound {
      /**
       * Source IP addresses or CIDR ranges allowed to send SIP traffic.
       */
      allowed_addresses: Array<string>;

      /**
       * Caller numbers allowed on inbound calls.
       */
      allowed_numbers: Array<string>;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';
    }

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Outbound {
      /**
       * Carrier host that receives Cartesia's SIP INVITE, as `host` or `host:port`. When
       * the port is omitted, Cartesia uses 5060 for `tcp` and 5061 for `tls`.
       */
      address: string;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';

      /**
       * Transport for outbound SIP signaling.
       */
      transport: 'tcp' | 'tls';

      /**
       * Two-letter ISO 3166-1 alpha-2 destination country code, or an empty string if
       * not set.
       */
      destination_country?: string;
    }
  }
}

/**
 * A telephony provider account.
 */
export type ProviderRetrieveResponse =
  | ProviderRetrieveResponse.TwilioProviderResponse
  | ProviderRetrieveResponse.SipTrunkProviderResponse;

export namespace ProviderRetrieveResponse {
  /**
   * A linked Twilio account. The `api_key_sid` field is partially masked in
   * responses.
   */
  export interface TwilioProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * The Twilio account SID.
     */
    account_sid: string;

    /**
     * The Twilio API key SID (partially masked).
     */
    api_key_sid: string;

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region: 'us1' | 'ie1' | 'au1';

    /**
     * Always `"twilio"`.
     */
    type: 'twilio';

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;
  }

  /**
   * A linked SIP trunk provider.
   */
  export interface SipTrunkProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * Always `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    inbound?: SipTrunkProviderResponse.Inbound;

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    outbound?: SipTrunkProviderResponse.Outbound;
  }

  export namespace SipTrunkProviderResponse {
    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Inbound {
      /**
       * Source IP addresses or CIDR ranges allowed to send SIP traffic.
       */
      allowed_addresses: Array<string>;

      /**
       * Caller numbers allowed on inbound calls.
       */
      allowed_numbers: Array<string>;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';
    }

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Outbound {
      /**
       * Carrier host that receives Cartesia's SIP INVITE, as `host` or `host:port`. When
       * the port is omitted, Cartesia uses 5060 for `tcp` and 5061 for `tls`.
       */
      address: string;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';

      /**
       * Transport for outbound SIP signaling.
       */
      transport: 'tcp' | 'tls';

      /**
       * Two-letter ISO 3166-1 alpha-2 destination country code, or an empty string if
       * not set.
       */
      destination_country?: string;
    }
  }
}

/**
 * A telephony provider account.
 */
export type ProviderUpdateResponse =
  | ProviderUpdateResponse.TwilioProviderResponse
  | ProviderUpdateResponse.SipTrunkProviderResponse;

export namespace ProviderUpdateResponse {
  /**
   * A linked Twilio account. The `api_key_sid` field is partially masked in
   * responses.
   */
  export interface TwilioProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * The Twilio account SID.
     */
    account_sid: string;

    /**
     * The Twilio API key SID (partially masked).
     */
    api_key_sid: string;

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region: 'us1' | 'ie1' | 'au1';

    /**
     * Always `"twilio"`.
     */
    type: 'twilio';

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;
  }

  /**
   * A linked SIP trunk provider.
   */
  export interface SipTrunkProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * Always `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    inbound?: SipTrunkProviderResponse.Inbound;

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    outbound?: SipTrunkProviderResponse.Outbound;
  }

  export namespace SipTrunkProviderResponse {
    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Inbound {
      /**
       * Source IP addresses or CIDR ranges allowed to send SIP traffic.
       */
      allowed_addresses: Array<string>;

      /**
       * Caller numbers allowed on inbound calls.
       */
      allowed_numbers: Array<string>;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';
    }

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Outbound {
      /**
       * Carrier host that receives Cartesia's SIP INVITE, as `host` or `host:port`. When
       * the port is omitted, Cartesia uses 5060 for `tcp` and 5061 for `tls`.
       */
      address: string;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';

      /**
       * Transport for outbound SIP signaling.
       */
      transport: 'tcp' | 'tls';

      /**
       * Two-letter ISO 3166-1 alpha-2 destination country code, or an empty string if
       * not set.
       */
      destination_country?: string;
    }
  }
}

export type ProviderListResponse = Array<
  ProviderListResponse.TwilioProviderResponse | ProviderListResponse.SipTrunkProviderResponse
>;

export namespace ProviderListResponse {
  /**
   * A linked Twilio account. The `api_key_sid` field is partially masked in
   * responses.
   */
  export interface TwilioProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * The Twilio account SID.
     */
    account_sid: string;

    /**
     * The Twilio API key SID (partially masked).
     */
    api_key_sid: string;

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region: 'us1' | 'ie1' | 'au1';

    /**
     * Always `"twilio"`.
     */
    type: 'twilio';

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;
  }

  /**
   * A linked SIP trunk provider.
   */
  export interface SipTrunkProviderResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * Always `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    inbound?: SipTrunkProviderResponse.Inbound;

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    outbound?: SipTrunkProviderResponse.Outbound;
  }

  export namespace SipTrunkProviderResponse {
    /**
     * Inbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Inbound {
      /**
       * Source IP addresses or CIDR ranges allowed to send SIP traffic.
       */
      allowed_addresses: Array<string>;

      /**
       * Caller numbers allowed on inbound calls.
       */
      allowed_numbers: Array<string>;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';
    }

    /**
     * Outbound SIP configuration. Passwords are never returned; only the configured
     * username is exposed as `auth_username`.
     */
    export interface Outbound {
      /**
       * Carrier host that receives Cartesia's SIP INVITE, as `host` or `host:port`. When
       * the port is omitted, Cartesia uses 5060 for `tcp` and 5061 for `tls`.
       */
      address: string;

      /**
       * SIP username returned without the password.
       */
      auth_username: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption: 'disabled' | 'allowed' | 'required';

      /**
       * Transport for outbound SIP signaling.
       */
      transport: 'tcp' | 'tls';

      /**
       * Two-letter ISO 3166-1 alpha-2 destination country code, or an empty string if
       * not set.
       */
      destination_country?: string;
    }
  }
}

export type ProviderCreateParams =
  | ProviderCreateParams.CreateTwilioProviderBody
  | ProviderCreateParams.CreateSipProviderBody;

export declare namespace ProviderCreateParams {
  export interface CreateTwilioProviderBody {
    /**
     * Your Twilio account SID.
     */
    account_sid: string;

    /**
     * The corresponding API key secret.
     */
    api_key_secret: string;

    /**
     * A Twilio API key SID.
     */
    api_key_sid: string;

    /**
     * Must be `"twilio"`.
     */
    type: 'twilio';

    /**
     * An optional human-readable label for the provider.
     */
    label?: string;

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region?: 'us1' | 'ie1' | 'au1';
  }

  export interface CreateSipProviderBody {
    /**
     * A human-readable label for the provider.
     */
    label: string;

    /**
     * Must be `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * Inbound SIP configuration for creating a trunk.
     */
    inbound?: CreateSipProviderBody.Inbound;

    /**
     * Outbound SIP configuration for creating a trunk.
     */
    outbound?: CreateSipProviderBody.Outbound;
  }

  export namespace CreateSipProviderBody {
    /**
     * Inbound SIP configuration for creating a trunk.
     */
    export interface Inbound {
      /**
       * Source IP addresses or CIDR ranges allowed to send SIP traffic.
       */
      allowed_addresses?: Array<string>;

      /**
       * Caller numbers allowed on inbound calls.
       */
      allowed_numbers?: Array<string>;

      /**
       * SIP digest authentication credentials.
       */
      credentials?: Inbound.Credentials;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption?: 'disabled' | 'allowed' | 'required';
    }

    export namespace Inbound {
      /**
       * SIP digest authentication credentials.
       */
      export interface Credentials {
        password: string;

        username: string;
      }
    }

    /**
     * Outbound SIP configuration for creating a trunk.
     */
    export interface Outbound {
      /**
       * Carrier host that receives Cartesia's SIP INVITE, as `host` or `host:port`,
       * without a `sip:` prefix. When the port is omitted, Cartesia uses 5060 for `tcp`
       * and 5061 for `tls`. Set `host:port` if your carrier listens elsewhere, for
       * example `sip.example.com:5067`.
       */
      address: string;

      /**
       * Transport for outbound SIP signaling.
       */
      transport: 'tcp' | 'tls';

      /**
       * SIP digest authentication credentials.
       */
      credentials?: Outbound.Credentials;

      /**
       * Two-letter country code for the country the call terminates in (e.g. `US`, `GB`,
       * `DE`). See
       * [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
       */
      destination_country?: string;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption?: 'disabled' | 'allowed' | 'required';
    }

    export namespace Outbound {
      /**
       * SIP digest authentication credentials.
       */
      export interface Credentials {
        password: string;

        username: string;
      }
    }
  }
}

export type ProviderUpdateParams =
  | ProviderUpdateParams.UpdateTwilioProviderBody
  | ProviderUpdateParams.UpdateSipTrunkProviderBody;

export declare namespace ProviderUpdateParams {
  export interface UpdateTwilioProviderBody {
    /**
     * New API key secret.
     */
    api_key_secret: string;

    /**
     * New Twilio API key SID.
     */
    api_key_sid: string;

    /**
     * Must be `"twilio"`.
     */
    type: 'twilio';

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region?: 'us1' | 'ie1' | 'au1';
  }

  export interface UpdateSipTrunkProviderBody {
    /**
     * Must be `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * Inbound SIP configuration for updating a trunk. Omitted fields remain unchanged.
     * Send `[]` to clear an allowlist.
     */
    inbound?: UpdateSipTrunkProviderBody.Inbound;

    /**
     * A new human-readable label for the provider. Omit to leave unchanged.
     */
    label?: string;

    /**
     * Outbound SIP configuration for updating a trunk. `address` and `transport` are
     * immutable on an existing outbound trunk, but required when adding outbound to an
     * inbound-only provider.
     */
    outbound?: UpdateSipTrunkProviderBody.Outbound;
  }

  export namespace UpdateSipTrunkProviderBody {
    /**
     * Inbound SIP configuration for updating a trunk. Omitted fields remain unchanged.
     * Send `[]` to clear an allowlist.
     */
    export interface Inbound {
      /**
       * Source IP addresses or CIDR ranges allowed to send SIP traffic.
       */
      allowed_addresses?: Array<string>;

      /**
       * Caller numbers allowed on inbound calls.
       */
      allowed_numbers?: Array<string>;

      /**
       * SIP digest authentication credentials for an update. The username is required
       * when credentials are provided. Omit the password to keep the stored secret, or
       * send `null` to clear the credentials.
       */
      credentials?: Inbound.Credentials | null;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption?: 'disabled' | 'allowed' | 'required';
    }

    export namespace Inbound {
      /**
       * SIP digest authentication credentials for an update. The username is required
       * when credentials are provided. Omit the password to keep the stored secret, or
       * send `null` to clear the credentials.
       */
      export interface Credentials {
        username: string;

        password?: string;
      }
    }

    /**
     * Outbound SIP configuration for updating a trunk. `address` and `transport` are
     * immutable on an existing outbound trunk, but required when adding outbound to an
     * inbound-only provider.
     */
    export interface Outbound {
      /**
       * Required only when adding outbound to an inbound-only provider.
       */
      address?: string;

      /**
       * SIP digest authentication credentials for an update. The username is required
       * when credentials are provided. Omit the password to keep the stored secret, or
       * send `null` to clear the credentials.
       */
      credentials?: Outbound.Credentials | null;

      /**
       * Send `null` to clear.
       */
      destination_country?: string | null;

      /**
       * SRTP policy for call audio. `disabled` does not negotiate encryption, `allowed`
       * uses encryption when available, and `required` rejects calls that cannot use
       * encryption.
       */
      media_encryption?: 'disabled' | 'allowed' | 'required';

      /**
       * Transport for outbound SIP signaling.
       */
      transport?: 'tcp' | 'tls';
    }

    export namespace Outbound {
      /**
       * SIP digest authentication credentials for an update. The username is required
       * when credentials are provided. Omit the password to keep the stored secret, or
       * send `null` to clear the credentials.
       */
      export interface Credentials {
        username: string;

        password?: string;
      }
    }
  }
}

export interface ProviderListParams {
  /**
   * Filter by account SID (Twilio providers only).
   */
  account_sid?: string;

  /**
   * Filter by provider type.
   */
  type?: 'twilio' | 'sip_trunk';
}

export declare namespace Providers {
  export {
    type ProviderCreateResponse as ProviderCreateResponse,
    type ProviderRetrieveResponse as ProviderRetrieveResponse,
    type ProviderUpdateResponse as ProviderUpdateResponse,
    type ProviderListResponse as ProviderListResponse,
    type ProviderCreateParams as ProviderCreateParams,
    type ProviderUpdateParams as ProviderUpdateParams,
    type ProviderListParams as ProviderListParams,
  };
}
