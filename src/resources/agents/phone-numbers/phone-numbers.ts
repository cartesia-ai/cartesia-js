// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ProvidersAPI from './providers';
import {
  ProviderCreateParams,
  ProviderCreateResponse,
  ProviderListParams,
  ProviderListResponse,
  ProviderRetrieveResponse,
  ProviderUpdateParams,
  ProviderUpdateResponse,
  Providers,
} from './providers';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class PhoneNumbers extends APIResource {
  providers: ProvidersAPI.Providers = new ProvidersAPI.Providers(this._client);

  /**
   * Returns the details of a specific phone number
   *
   * @example
   * ```ts
   * const phoneNumber =
   *   await client.agents.phoneNumbers.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<PhoneNumber> {
    return this._client.get(path`/agents/phone-numbers/${id}`, options);
  }

  /**
   * Update a phone number's label, agent assignment, or provider
   *
   * @example
   * ```ts
   * const phoneNumber = await client.agents.phoneNumbers.update(
   *   'id',
   * );
   * ```
   */
  update(id: string, body: PhoneNumberUpdateParams, options?: RequestOptions): APIPromise<PhoneNumber> {
    return this._client.patch(path`/agents/phone-numbers/${id}`, { body, ...options });
  }

  /**
   * List Phone Numbers
   *
   * @example
   * ```ts
   * const phoneNumbers =
   *   await client.agents.phoneNumbers.list();
   * ```
   */
  list(
    query: PhoneNumberListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PhoneNumberListResponse> {
    return this._client.get('/agents/phone-numbers', { query, ...options });
  }

  /**
   * Delete Phone Number
   *
   * @example
   * ```ts
   * await client.agents.phoneNumbers.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/agents/phone-numbers/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Import Phone Number
   *
   * @example
   * ```ts
   * const phoneNumber = await client.agents.phoneNumbers.import(
   *   {
   *     label: 'label',
   *     number: 'number',
   *     provider: { id: 'id' },
   *   },
   * );
   * ```
   */
  import(body: PhoneNumberImportParams, options?: RequestOptions): APIPromise<PhoneNumber> {
    return this._client.post('/agents/phone-numbers', { body, ...options });
  }

  /**
   * Provision a new Cartesia-managed US phone number
   *
   * @example
   * ```ts
   * const response = await client.agents.phoneNumbers.provision(
   *   { label: 'label' },
   * );
   * ```
   */
  provision(
    body: PhoneNumberProvisionParams,
    options?: RequestOptions,
  ): APIPromise<PhoneNumberProvisionResponse> {
    return this._client.post('/agents/phone-numbers/provision', { body, ...options });
  }

  /**
   * Returns Cartesia-managed phone number provisioning usage for the current month.
   * Active numbers and numbers deleted during the current month count toward usage.
   *
   * @example
   * ```ts
   * const response =
   *   await client.agents.phoneNumbers.provisioningUsage();
   * ```
   */
  provisioningUsage(options?: RequestOptions): APIPromise<PhoneNumberProvisioningUsageResponse> {
    return this._client.get('/agents/phone-numbers/provision', options);
  }
}

/**
 * A phone number with its provider and agent assignment details.
 */
export interface PhoneNumber {
  /**
   * Unique identifier for the phone number.
   */
  id: string;

  /**
   * The agent that answers inbound calls to this number, or `null` if unassigned
   */
  agent: PhoneNumber.Agent | null;

  /**
   * UTC timestamp when the phone number was created.
   */
  created_at: string;

  /**
   * The phone number in E.164 format (e.g. +14155551234).
   */
  number: string;

  /**
   * The telephony provider associated with a phone number. One of `Twilio`,
   * `Cartesia`, or `SIP Trunk`, determined by the `type` field. For SIP trunk
   * numbers, `inbound` and `outbound` are not returned here — use
   * `GET /agents/phone-numbers/providers/{id}` to retrieve them.
   */
  provider:
    | PhoneNumber.TwilioProviderResponse
    | PhoneNumber.CartesiaProviderResponse
    | PhoneNumber.SipTrunkEmbeddedResponse;

  /**
   * UTC timestamp when the phone number was last updated.
   */
  updated_at: string;

  /**
   * A human-readable name for the phone number.
   */
  label?: string | null;
}

export namespace PhoneNumber {
  /**
   * The agent that answers inbound calls to this number, or `null` if unassigned
   */
  export interface Agent {
    id: string;

    name: string;
  }

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
   * A Cartesia-managed provider. US phone numbers only.
   */
  export interface CartesiaProviderResponse {
    /**
     * Always `"cartesia"`.
     */
    type: 'cartesia';
  }

  /**
   * A linked SIP trunk provider.
   */
  export interface SipTrunkEmbeddedResponse {
    /**
     * Unique identifier for the provider.
     */
    id: string;

    /**
     * Always `"sip_trunk"`.
     */
    type: 'sip_trunk';

    /**
     * A human-readable label for the provider.
     */
    label?: string | null;
  }
}

export interface PhoneNumberListResponse {
  data: Array<PhoneNumber>;

  has_more: boolean;
}

/**
 * Common phone number fields.
 */
export interface PhoneNumberProvisionResponse {
  /**
   * Unique identifier for the phone number.
   */
  id: string;

  /**
   * The agent that answers inbound calls to this number, or `null` if unassigned
   */
  agent: PhoneNumberProvisionResponse.Agent | null;

  /**
   * UTC timestamp when the phone number was created.
   */
  created_at: string;

  /**
   * The phone number in E.164 format (e.g. +14155551234).
   */
  number: string;

  /**
   * UTC timestamp when the phone number was last updated.
   */
  updated_at: string;

  /**
   * A human-readable name for the phone number.
   */
  label?: string | null;
}

export namespace PhoneNumberProvisionResponse {
  /**
   * The agent that answers inbound calls to this number, or `null` if unassigned
   */
  export interface Agent {
    id: string;

    name: string;
  }
}

/**
 * Cartesia-managed phone number provisioning usage for the current month.
 */
export interface PhoneNumberProvisioningUsageResponse {
  /**
   * Maximum phone numbers that can be provisioned during the current month. `null`
   * means the plan has no monthly limit.
   */
  monthly_limit: number | null;

  /**
   * Number of phone numbers provisioned during the current month. This includes
   * active numbers and numbers deleted during the month.
   */
  monthly_usage: number;

  /**
   * Phone numbers that can still be provisioned during the current month. `null`
   * means the plan has no monthly limit.
   */
  remaining: number | null;
}

export interface PhoneNumberUpdateParams {
  /**
   * Assign an agent to answer inbound calls to this number, or `null` to unassign.
   */
  agent_id?: string | null;

  /**
   * A new human-readable name.
   */
  label?: string;

  /**
   * Change the provider. Pass `{ "id": "..." }` for an existing provider, or pass
   * Twilio account fields for lookup convenience. For Twilio, the phone number must
   * exist in the target provider account. For SIP trunk providers, Cartesia handles
   * reassignment between SIP providers. Switching between provider types is not
   * supported; delete and re-import the number instead.
   */
  provider?: PhoneNumberUpdateParams.ByID | PhoneNumberUpdateParams.ByTwilioAccount;
}

export namespace PhoneNumberUpdateParams {
  export interface ByID {
    id: string;
  }

  export interface ByTwilioAccount {
    account_sid: string;

    type: 'twilio';

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region?: 'us1' | 'ie1' | 'au1';
  }
}

export interface PhoneNumberListParams {
  /**
   * Filter by assigned agent ID.
   */
  agent_id?: string;

  /**
   * A cursor to use in pagination. `ending_before` is a phone number ID that defines
   * your place in the list. For example, if you make a `/agents/phone-numbers`
   * request and receive 20 objects, starting with `pn_abc123`, your subsequent call
   * can include `ending_before=pn_abc123` to fetch the previous page of the list.
   */
  ending_before?: string | null;

  /**
   * (Pagination option) The number of phone numbers to return per page, ranging
   * between 1 and 100. The default page limit is 10.
   */
  limit?: number | null;

  /**
   * Filter by provider ID.
   */
  provider_id?: string;

  /**
   * Search by phone number, label, or agent name.
   */
  q?: string;

  /**
   * A cursor to use in pagination. `starting_after` is a phone number ID that
   * defines your place in the list. For example, if you make a
   * `/agents/phone-numbers` request and receive 20 objects, ending with `pn_abc123`,
   * your subsequent call can include `starting_after=pn_abc123` to fetch the next
   * page of the list.
   */
  starting_after?: string | null;

  /**
   * Filter by provider type.
   */
  type?: 'twilio' | 'cartesia' | 'sip_trunk';
}

export interface PhoneNumberImportParams {
  /**
   * A human-readable name for the phone number.
   */
  label: string;

  /**
   * The phone number in E.164 format.
   */
  number: string;

  /**
   * Reference to the provider. Pass `{ "id": "..." }` for an existing provider, or
   * `{ "type": "twilio", "account_sid": "...", "region": "..." }` to look up by
   * account.
   */
  provider: PhoneNumberImportParams.ByID | PhoneNumberImportParams.ByTwilioAccount;

  /**
   * Optionally assign an agent to answer inbound calls to this number. Omit to keep
   * the number outbound-only.
   */
  agent_id?: string;
}

export namespace PhoneNumberImportParams {
  export interface ByID {
    id: string;
  }

  export interface ByTwilioAccount {
    account_sid: string;

    type: 'twilio';

    /**
     * The Twilio region the phone number and API key are configured for. `us1` (US),
     * `ie1` (Ireland), `au1` (Australia). Default is `us1`.
     */
    region?: 'us1' | 'ie1' | 'au1';
  }
}

export interface PhoneNumberProvisionParams {
  /**
   * A human-readable name for the phone number.
   */
  label: string;

  /**
   * Optionally assign an agent to answer inbound calls to this number. Omit to keep
   * the number outbound-only.
   */
  agent_id?: string;
}

PhoneNumbers.Providers = Providers;

export declare namespace PhoneNumbers {
  export {
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
    Providers as Providers,
    type ProviderCreateResponse as ProviderCreateResponse,
    type ProviderRetrieveResponse as ProviderRetrieveResponse,
    type ProviderUpdateResponse as ProviderUpdateResponse,
    type ProviderListResponse as ProviderListResponse,
    type ProviderCreateParams as ProviderCreateParams,
    type ProviderUpdateParams as ProviderUpdateParams,
    type ProviderListParams as ProviderListParams,
  };
}
