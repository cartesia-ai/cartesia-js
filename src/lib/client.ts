import type { ClientOptions } from "../types";
import { BASE_URL } from "./constants";

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
}
