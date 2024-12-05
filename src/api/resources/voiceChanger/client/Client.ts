/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as fs from "fs";
import { Blob } from "buffer";
import * as Cartesia from "../../../index";
import * as stream from "stream";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";
import * as serializers from "../../../../serialization/index";

export declare namespace VoiceChanger {
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

export class VoiceChanger {
    constructor(protected readonly _options: VoiceChanger.Options = {}) {}

    /**
     * Takes an audio file of speech, and returns an audio file of speech spoken with the same intonation, but with a different voice.
     *
     * This endpoint is priced at 15 characters per second of input audio.
     */
    public async bytes(
        clip: File | fs.ReadStream | Blob,
        request: Cartesia.VoiceChangerBytesRequest,
        requestOptions?: VoiceChanger.RequestOptions
    ): Promise<stream.Readable> {
        const _request = await core.newFormData();
        await _request.appendFile("clip", clip);
        await _request.append("voice[id]", request.voiceId);
        await _request.append("output_format[container]", request.outputFormatContainer);
        await _request.append("output_format[sample_rate]", request.outputFormatSampleRate.toString());
        if (request.outputFormatEncoding != null) {
            await _request.append("output_format[encoding]", request.outputFormatEncoding);
        }

        if (request.outputFormatBitRate != null) {
            await _request.append("output_format[bit_rate]", request.outputFormatBitRate.toString());
        }

        const _maybeEncodedRequest = await _request.getRequest();
        const _response = await (this._options.fetcher ?? core.fetcher)<stream.Readable>({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.CartesiaEnvironment.Production,
                "/voice-changer/bytes"
            ),
            method: "POST",
            headers: {
                "Cartesia-Version": requestOptions?.cartesiaVersion ?? this._options?.cartesiaVersion ?? "2024-06-10",
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@cartesia/cartesia-js",
                "X-Fern-SDK-Version": "2.0.0-alpha2",
                "User-Agent": "@cartesia/cartesia-js/2.0.0-alpha2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ..._maybeEncodedRequest.headers,
            },
            requestType: "file",
            duplex: _maybeEncodedRequest.duplex,
            body: _maybeEncodedRequest.body,
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
        clip: File | fs.ReadStream | Blob,
        request: Cartesia.VoiceChangerSseRequest,
        requestOptions?: VoiceChanger.RequestOptions
    ): Promise<core.Stream<Cartesia.StreamingResponse>> {
        const _request = await core.newFormData();
        await _request.appendFile("clip", clip);
        await _request.append("voice[id]", request.voiceId);
        await _request.append("output_format[container]", request.outputFormatContainer);
        await _request.append("output_format[sample_rate]", request.outputFormatSampleRate.toString());
        if (request.outputFormatEncoding != null) {
            await _request.append("output_format[encoding]", request.outputFormatEncoding);
        }

        if (request.outputFormatBitRate != null) {
            await _request.append("output_format[bit_rate]", request.outputFormatBitRate.toString());
        }

        const _maybeEncodedRequest = await _request.getRequest();
        const _response = await (this._options.fetcher ?? core.fetcher)<stream.Readable>({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.CartesiaEnvironment.Production,
                "/voice-changer/sse"
            ),
            method: "POST",
            headers: {
                "Cartesia-Version": requestOptions?.cartesiaVersion ?? this._options?.cartesiaVersion ?? "2024-06-10",
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@cartesia/cartesia-js",
                "X-Fern-SDK-Version": "2.0.0-alpha2",
                "User-Agent": "@cartesia/cartesia-js/2.0.0-alpha2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ..._maybeEncodedRequest.headers,
            },
            requestType: "file",
            duplex: _maybeEncodedRequest.duplex,
            body: _maybeEncodedRequest.body,
            responseType: "sse",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return new core.Stream({
                stream: _response.body,
                parse: async (data) => {
                    return serializers.StreamingResponse.parseOrThrow(data, {
                        unrecognizedObjectKeys: "passthrough",
                        allowUnrecognizedUnionMembers: true,
                        allowUnrecognizedEnumValues: true,
                        skipValidation: true,
                        breadcrumbsPrefix: ["response"],
                    });
                },
                signal: requestOptions?.abortSignal,
                eventShape: {
                    type: "json",
                    messageTerminator: "\n",
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
