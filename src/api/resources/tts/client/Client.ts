/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as Cartesia from "../../../index";
import * as stream from "stream";
import * as serializers from "../../../../serialization/index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Tts {
    interface Options {
        environment?: core.Supplier<environments.CartesiaEnvironment | string>;
        apiKey?: core.Supplier<string | undefined>;
        /** Override the Cartesia-Version header */
        cartesiaVersion?: "2024-06-10";
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
        cartesiaVersion?: "2024-06-10";
    }
}

export class Tts {
    constructor(protected readonly _options: Tts.Options = {}) {}

    public async bytes(request: Cartesia.TtsRequest, requestOptions?: Tts.RequestOptions): Promise<stream.Readable> {
        const _response = await (this._options.fetcher ?? core.fetcher)<stream.Readable>({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.CartesiaEnvironment.Production,
                "/tts/bytes"
            ),
            method: "POST",
            headers: {
                "Cartesia-Version": requestOptions?.cartesiaVersion ?? this._options?.cartesiaVersion ?? "2024-06-10",
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@cartesia/cartesia-js",
                "X-Fern-SDK-Version": "2.0.3",
                "User-Agent": "@cartesia/cartesia-js/2.0.3",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
            },
            contentType: "application/json",
            requestType: "json",
            body: serializers.TtsRequest.jsonOrThrow(request, { unrecognizedObjectKeys: "strip" }),
            responseType: "streaming",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.CartesiaError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.CartesiaError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.CartesiaTimeoutError();
            case "unknown":
                throw new errors.CartesiaError({
                    message: _response.error.errorMessage,
                });
        }
    }

    public async sse(
        request: Cartesia.TtsRequest,
        requestOptions?: Tts.RequestOptions
    ): Promise<core.Stream<Cartesia.WebSocketResponse>> {
        const _response = await (this._options.fetcher ?? core.fetcher)<stream.Readable>({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.CartesiaEnvironment.Production,
                "/tts/sse"
            ),
            method: "POST",
            headers: {
                "Cartesia-Version": requestOptions?.cartesiaVersion ?? this._options?.cartesiaVersion ?? "2024-06-10",
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@cartesia/cartesia-js",
                "X-Fern-SDK-Version": "2.0.3",
                "User-Agent": "@cartesia/cartesia-js/2.0.3",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
            },
            contentType: "application/json",
            requestType: "json",
            body: serializers.TtsRequest.jsonOrThrow(request, { unrecognizedObjectKeys: "strip" }),
            responseType: "sse",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return new core.Stream({
                stream: _response.body,
                parse: async (data) => {
                    return serializers.WebSocketResponse.parseOrThrow(data, {
                        unrecognizedObjectKeys: "passthrough",
                        allowUnrecognizedUnionMembers: true,
                        allowUnrecognizedEnumValues: true,
                        skipValidation: true,
                        breadcrumbsPrefix: ["response"],
                    });
                },
                signal: requestOptions?.abortSignal,
                eventShape: {
                    type: "sse",
                    streamTerminator: "[DONE]",
                },
            });
        }

        if (_response.error.reason === "status-code") {
            throw new errors.CartesiaError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.CartesiaError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.CartesiaTimeoutError();
            case "unknown":
                throw new errors.CartesiaError({
                    message: _response.error.errorMessage,
                });
        }
    }

    protected async _getCustomAuthorizationHeaders() {
        const apiKeyValue = await core.Supplier.get(this._options.apiKey);
        return { "X-API-Key": apiKeyValue };
    }
}
