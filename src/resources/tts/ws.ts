// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as WS from 'ws';
import { NodeWebSocket } from '../../internal/ws-adapter-node';
import type { WebSocketLike } from '../../internal/ws-adapter';
import { TTSWSBase, type TTSWSBaseOptions } from './ws-base';
import { Cartesia } from '../../client';

export type { TTSWSReconnectOptions } from './ws-base';

export interface TTSWSClientOptions extends WS.ClientOptions, TTSWSBaseOptions {}

export class TTSWS extends TTSWSBase {
  private _wsOptions: WS.ClientOptions | null | undefined;

  constructor(
    client: Cartesia,
    parameters?: Record<string, unknown> | undefined,
    options?: TTSWSClientOptions | null | undefined,
  ) {
    if (!WS?.WebSocket) {
      throw new Error(
        'TTSWS from "@cartesia/cartesia-js/resources/tts/ws" requires the "ws" package but it could not be loaded.',
      );
    }

    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    super(client, parameters, { reconnect, maxQueueSize });
    this._wsOptions = wsOptions;
    this._connectInitial();
  }

  protected _createSocket(url: URL, authHeaders: Record<string, string>): WebSocketLike {
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
}
