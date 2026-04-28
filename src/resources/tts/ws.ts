// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/// <reference lib="dom" />

let _ws: typeof import('ws') | undefined;
try {
  _ws = require('ws');
} catch {
  // Optional — in browsers, we use the native WebSocket API instead.
}

import type * as WS from 'ws';
import { BrowserWebSocket } from '../../internal/ws-adapter-browser';
import { NodeWebSocket } from '../../internal/ws-adapter-node';
import { TTSWSBase, type TTSWSBaseOptions } from './ws-base';
import { Cartesia } from '../../client';

export type { TTSWSReconnectOptions } from './ws-base';

export interface TTSWSClientOptions extends WS.ClientOptions, TTSWSBaseOptions {}

export class TTSWS extends TTSWSBase<NodeWebSocket | BrowserWebSocket> {
  private _wsOptions: WS.ClientOptions | null | undefined;

  constructor(
    client: Cartesia,
    parameters?: Record<string, unknown> | undefined,
    options?: TTSWSClientOptions | null | undefined,
  ) {
    if (!_ws?.WebSocket && typeof WebSocket === 'undefined') {
      throw new Error(
        'TTSWS from "@cartesia/cartesia-js/resources/tts/ws" requires the "ws" package but it could not be loaded.',
      );
    }

    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    super(client, parameters, { reconnect, maxQueueSize });
    this._wsOptions = wsOptions;
    this._connectInitial();
  }

  protected _createSocket(url: URL, authHeaders: Record<string, string>): NodeWebSocket | BrowserWebSocket {
    if (_ws?.WebSocket) {
      const ws = new _ws.WebSocket(url, {
        ...this._wsOptions,
        headers: {
          'cartesia-version': '2026-03-01',
          ...authHeaders,
          ...this._wsOptions?.headers,
        },
      });
      return new NodeWebSocket(ws);
    }
    // Browser: use native WebSocket with auth in URL query params.
    const browserUrl = new URL(url);
    if (!browserUrl.searchParams.has('cartesia_version')) {
      browserUrl.searchParams.set('cartesia_version', '2025-11-04');
    }
    if (this._client.token && !browserUrl.searchParams.has('access_token')) {
      browserUrl.searchParams.set('access_token', this._client.token);
    }
    if (
      this._client.apiKey &&
      !browserUrl.searchParams.has('access_token') &&
      !browserUrl.searchParams.has('api_key')
    ) {
      browserUrl.searchParams.set('api_key', this._client.apiKey);
    }
    const ws = new WebSocket(browserUrl);
    return new BrowserWebSocket(ws);
  }
}
