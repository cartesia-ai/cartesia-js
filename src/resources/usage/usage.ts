// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as AgentsAPI from './agents';
import { AgentRetrieveParams, AgentRetrieveResponse, Agents } from './agents';
import * as CreditsAPI from './credits';
import { CreditRetrieveParams, CreditRetrieveResponse, Credits } from './credits';

export class Usage extends APIResource {
  agents: AgentsAPI.Agents = new AgentsAPI.Agents(this._client);
  credits: CreditsAPI.Credits = new CreditsAPI.Credits(this._client);
}

Usage.Agents = Agents;
Usage.Credits = Credits;

export declare namespace Usage {
  export {
    Agents as Agents,
    type AgentRetrieveResponse as AgentRetrieveResponse,
    type AgentRetrieveParams as AgentRetrieveParams,
  };

  export {
    Credits as Credits,
    type CreditRetrieveResponse as CreditRetrieveResponse,
    type CreditRetrieveParams as CreditRetrieveParams,
  };
}
