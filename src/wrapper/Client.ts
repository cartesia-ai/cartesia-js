import { CartesiaClient as FernCartesiaClient } from "../Client";
import { StreamingTTSClient } from "./StreamingTTSClient";

export class CartesiaClient extends FernCartesiaClient {

    protected _tts: StreamingTTSClient | undefined;

    public get tts(): StreamingTTSClient {
        return (this._tts ??= new StreamingTTSClient(this._options));
    }
}
