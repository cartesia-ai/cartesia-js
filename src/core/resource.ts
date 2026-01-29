// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Cartesia } from '../client';

export abstract class APIResource {
  protected _client: Cartesia;

  constructor(client: Cartesia) {
    this._client = client;
  }
}
