// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as WS from 'ws';
import { NodeWebSocket } from '../../../internal/ws-adapter-node';
import { ExternalVADWSBase, type ExternalVADWSBaseOptions, type ExternalVADWSParameters } from './ws-base';
import { Cartesia } from '../../../client';

export type { ExternalVADWSParameters, ExternalVADWSReconnectOptions } from './ws-base';

export interface ExternalVADWSClientOptions extends WS.ClientOptions, ExternalVADWSBaseOptions {}

export class ExternalVADWS extends ExternalVADWSBase<NodeWebSocket> {
  private _wsOptions: WS.ClientOptions | null | undefined;

  constructor(
    client: Cartesia,
    parameters: ExternalVADWSParameters,
    options?: ExternalVADWSClientOptions | null | undefined,
  ) {
    if (!WS?.WebSocket) {
      throw new Error(
        'ExternalVADWS from "@cartesia/cartesia-js/resources/stt/external-vad/ws" requires the "ws" package but it could not be loaded.',
      );
    }

    const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
    super(client, parameters, { reconnect, maxQueueSize });
    this._wsOptions = wsOptions;
    this._connectInitial();
  }

  protected _createSocket(url: URL, authHeaders: Record<string, string>): NodeWebSocket {
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
