// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as WS from 'ws';
import { NodeWebSocket } from '../../../internal/ws-adapter-node';
import {
  ManualFinalizeWSBase,
  type ManualFinalizeWSBaseOptions,
  type ManualFinalizeWSParameters,
} from './ws-base';
import { Cartesia } from '../../../client';

export type { ManualFinalizeWSParameters, ManualFinalizeWSReconnectOptions } from './ws-base';

export interface ManualFinalizeWSClientOptions extends WS.ClientOptions, ManualFinalizeWSBaseOptions {}

export class ManualFinalizeWS extends ManualFinalizeWSBase<NodeWebSocket> {
  private _wsOptions: WS.ClientOptions | null | undefined;

  constructor(
    client: Cartesia,
    parameters: ManualFinalizeWSParameters,
    options?: ManualFinalizeWSClientOptions | null | undefined,
  ) {
    if (!WS?.WebSocket) {
      throw new Error(
        'ManualFinalizeWS from "@cartesia/cartesia-js/resources/stt/manual-finalize/ws" requires the "ws" package but it could not be loaded.',
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
