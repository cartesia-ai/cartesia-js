import fetch from "cross-fetch";
import type { ClientOptions } from "../types";
import { BASE_URL, CARTESIA_VERSION, constructApiUrl } from "./constants";

export class Client {
	apiKey: () => Promise<string>;
	baseUrl: string;

	constructor(options: ClientOptions = {}) {
		const apiKey = options.apiKey || process.env.CARTESIA_API_KEY;
		if (!apiKey) {
			throw new Error("Missing Cartesia API key.");
		}

		this.apiKey = typeof apiKey === "function" ? apiKey : async () => apiKey;
		this.baseUrl = options.baseUrl || BASE_URL;
	}

	protected async _fetch(path: string, options: RequestInit = {}) {
		const url = constructApiUrl(this.baseUrl, path);
		const headers = new Headers(options.headers);

		headers.set("X-API-Key", await this.apiKey());
		headers.set("Cartesia-Version", CARTESIA_VERSION);

		return fetch(url.toString(), {
			...options,
			headers,
		});
	}
}
