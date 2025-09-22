// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { NoahTesting } from '../client';

export abstract class APIResource {
  protected _client: NoahTesting;

  constructor(client: NoahTesting) {
    this._client = client;
  }
}
