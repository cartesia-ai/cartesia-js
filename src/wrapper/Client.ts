import { CartesiaClient as FernCartesiaClient } from "../Client";
import { StreamingTTSClient } from "./StreamingTTSClient";
import { StreamingSTTClient } from "./StreamingSTTClient";

export class CartesiaClient extends FernCartesiaClient {
    protected _stt: StreamingSTTClient | undefined;
    protected _tts: StreamingTTSClient | undefined;

    public get stt(): StreamingSTTClient {
        return (this._stt ??= new StreamingSTTClient(this._options));
    }

    public get tts(): StreamingTTSClient {
        return (this._tts ??= new StreamingTTSClient(this._options));
    }
}
