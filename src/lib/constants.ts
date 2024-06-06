export const BASE_URL = "https://api.cartesia.ai/v0";

export const constructApiUrl = (
	baseUrl: string,
	path: string,
	protocol?: string,
) => {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	if (!protocol) {
		return new URL(`${baseUrl}${normalizedPath}`);
	}
	if (!["http", "ws"].includes(protocol)) {
		throw new Error(`Invalid protocol: ${protocol}`);
	}
	return new URL(`${baseUrl.replace(/^http/, protocol)}${normalizedPath}`);
};
