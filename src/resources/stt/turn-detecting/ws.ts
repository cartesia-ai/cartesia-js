// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as WS from 'ws';
import { BrowserWebSocket } from '../../../internal/ws-adapter-browser';
import { NodeWebSocket } from '../../../internal/ws-adapter-node';
import {
  TurnDetectingWSBase,
  type TurnDetectingWSBaseOptions,
  type TurnDetectingWSParameters,
} from './ws-base';
import { Cartesia } from '../../../client';
import { getAuthorizationTokenFromHeaders } from '../../../internal/lib/utils/get-authorization-token-from-headers';

export type { TurnDetectingWSParameters, TurnDetectingWSReconnectOptions } from './ws-base';

export interface TurnDetectingWSClientOptions extends WS.ClientOptions, TurnDetectingWSBaseOptions {}

export class TurnDetectingWS extends TurnDetectingWSBase<NodeWebSocket | BrowserWebSocket> {
  private _wsOptions: WS.ClientOptions | null | undefined;

  constructor(
    client: Cartesia,
    parameters: TurnDetectingWSParameters,
    options?: TurnDetectingWSClientOptions | null | undefined,
  ) {
    if (!WS?.WebSocket && typeof WebSocket === 'undefined') {
      throw new Error(
        'TurnDetectingWS from "@cartesia/cartesia-js/resources/stt/turn-detecting/ws" requires the "ws" package but it could not be loaded.',
      );
    }

    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    super(client, parameters, { reconnect, maxQueueSize });
    this._wsOptions = wsOptions;
    this._connectInitial();
  }

  protected _createSocket(url: URL, authHeaders: Record<string, string>): NodeWebSocket | BrowserWebSocket {
    if (WS?.WebSocket) {
      const ws = new WS.WebSocket(url, {
        ...this._wsOptions,
        headers: {
          'cartesia-version': '2025-11-04',
          ...authHeaders,
          ...this._wsOptions?.headers,
        },
      });
      return new NodeWebSocket(ws);
    }
    // BrowserWebSocket
    url = new URL(url);

    if (this._wsOptions?.headers?.['cartesia-version']) {
      // override cartesia version
      url.searchParams.set('cartesia_version', this._wsOptions.headers['cartesia-version']);
    } else if (url.searchParams.get('cartesia_version')) {
      // use current cartesia version
    } else {
      // set cartesia version
      url.searchParams.set('cartesia_version', '2025-11-04');
    }

    if (url.searchParams.get('access_token')) {
      // use current access token
    } else if (this._client.token) {
      // set access token
      url.searchParams.set('access_token', this._client.token);
    } else {
      // api key (insecure fallback)
      const overrideAPIKey = getAuthorizationTokenFromHeaders(this._wsOptions?.headers);
      if (overrideAPIKey) {
        // override api key
        url.searchParams.set('api_key', overrideAPIKey);
      } else if (url.searchParams.get('api_key')) {
        // use current api key
      } else if (this._client.apiKey) {
        // api key from client
        url.searchParams.set('api_key', this._client.apiKey);
      }
    }

    return new BrowserWebSocket(new WebSocket(url));
  }
}
