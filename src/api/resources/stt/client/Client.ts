import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as Cartesia from "../../../index";
import * as serializers from "../../../../serialization/index";
import * as errors from "../../../../errors/index";

export declare namespace Stt {
    interface Options {
        environment?: core.Supplier<environments.CartesiaEnvironment | string>;
        apiKey?: core.Supplier<string | undefined>;
        /** Override the Cartesia-Version header */
        cartesiaVersion?: "2025-04-16";
        fetcher?: core.FetchFunction;
    }

    interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
        /** Override the Cartesia-Version header */
        cartesiaVersion?: "2025-04-16";
    }
}

export class Stt {
    constructor(protected readonly _options: Stt.Options = {}) {}

    protected async _getCustomAuthorizationHeaders() {
        const apiKeyValue = await core.Supplier.get(this._options.apiKey);
        return { "X-API-Key": apiKeyValue };
    }
} 
