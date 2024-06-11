export const BASE_URL = "https://api.cartesia.ai";
export const CARTESIA_VERSION = "2024-06-10";

/**
 * Construct a URL for the Cartesia API.
 *
 * @param baseUrl The base URL for the API.
 * @param path The path to append to the base URL.
 * @param options Options for the URL.
 * @param options.websocket Whether to use the WebSocket protocol.
 * @returns A URL object.
 */
export const constructApiUrl = (
	baseUrl: string,
	path: string,
	{ websocket = false } = {},
) => {
	const url = new URL(path, baseUrl);
	if (websocket) {
		// Using find-and-replace ensures that if the base URL uses TLS, the
		// new protocol does too.
		url.protocol = baseUrl.replace(/^http/, "ws");
	}
	return url;
};
