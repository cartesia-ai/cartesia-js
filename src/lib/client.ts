import fetch from "cross-fetch";
import type { ClientOptions } from "../types";
import { BASE_URL, constructApiUrl } from "./constants";

export class Client {
	apiKey: string;
	baseUrl: string;

	constructor(options: ClientOptions = {}) {
		if (!(options.apiKey || process.env.CARTESIA_API_KEY)) {
			throw new Error("Missing Cartesia API key.");
		}

		// biome-ignore lint/style/noNonNullAssertion: Guaranteed to be defined by the check above.
		this.apiKey = (options.apiKey || process.env.CARTESIA_API_KEY)!;
		this.baseUrl = options.baseUrl || BASE_URL;
	}

	fetch(path: string, options: RequestInit = {}) {
		const url = constructApiUrl(this.baseUrl, path);

		return fetch(url.toString(), {
			...options,
			headers: {
				"X-API-KEY": this.apiKey,
				...options.headers,
			},
		});
	}
}
