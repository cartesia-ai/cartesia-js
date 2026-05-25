// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type * as WS from 'ws';
import { BrowserWebSocket } from '../../../internal/ws-adapter-browser';
import { NodeWebSocket } from '../../../internal/ws-adapter-node';
import {
  TurnDetectingWSBase,
  type TurnDetectingWSBaseOptions,
  type TurnDetectingWSParameters,
} from './ws-base';
import { Cartesia } from '../../../client';
import { getAuthorizationTokenFromHeaders } from '../../../internal/lib/utils/get-authorization-token-from-headers';
import { buildHeaders } from '../../../internal/headers';

let _ws: Partial<typeof import('ws')> | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}

export type { TurnDetectingWSParameters, TurnDetectingWSReconnectOptions } from './ws-base';

export interface TurnDetectingWSClientOptions extends WS.ClientOptions, TurnDetectingWSBaseOptions {}

export class TurnDetectingWS extends TurnDetectingWSBase<NodeWebSocket | BrowserWebSocket> {
  private _wsOptions: WS.ClientOptions | null | undefined;

  constructor(
    client: Cartesia,
    parameters: TurnDetectingWSParameters,
    options?: TurnDetectingWSClientOptions | null | undefined,
  ) {
    if (_ws?.WebSocket === undefined && typeof WebSocket === 'undefined') {
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
    if (_ws?.WebSocket !== undefined) {
      const ws = new _ws.WebSocket(url, {
        ...this._wsOptions,
        headers: Object.fromEntries(
          buildHeaders([
            {
              'cartesia-version': '2025-11-04',
            },
            authHeaders,
            this._wsOptions?.headers,
          ]).values.entries(),
        ),
      });
      return new NodeWebSocket(ws);
    }
    // BrowserWebSocket
    url = new URL(url);
    const wsOptionsHeaders = buildHeaders([this._wsOptions?.headers]).values;

    const cartesiaVersionFromWSOptions = wsOptionsHeaders.get('cartesia-version');
    if (url.searchParams.get('cartesia_version')) {
      // cartesia version from parameters
    } else if (cartesiaVersionFromWSOptions) {
      // cartesia version from options
      url.searchParams.set('cartesia_version', cartesiaVersionFromWSOptions);
    } else {
      // set cartesia version
      url.searchParams.set('cartesia_version', '2025-11-04');
    }

    const apiKeyFromWSOptions = getAuthorizationTokenFromHeaders(wsOptionsHeaders);
    if (url.searchParams.get('access_token')) {
      // access token from parameters
    } else if (this._client.token) {
      // set access token
      url.searchParams.set('access_token', this._client.token);
    } else if (url.searchParams.get('api_key')) {
      // api key from parameters
    } else if (apiKeyFromWSOptions) {
      // api key from options
      url.searchParams.set('api_key', apiKeyFromWSOptions);
    } else if (this._client.apiKey) {
      // api key from client
      url.searchParams.set('api_key', this._client.apiKey);
    }

    return new BrowserWebSocket(new WebSocket(url));
  }
}
