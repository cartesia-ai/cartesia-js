export const BASE_URL = "https://api.cartesia.ai/v0";
export const SAMPLE_RATE = 44100;

export const constructWebsocketUrl = (baseUrl: string) => {
	return new URL(`${baseUrl.replace(/^http/, "ws")}/ws`);
};
