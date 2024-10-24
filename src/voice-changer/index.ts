import { Client } from "../lib/client";
import type { VoiceChangerBytesResponse, VoiceChangerOptions } from "../types";

export default class VoiceChanger extends Client {
	async bytes(
		options: VoiceChangerOptions,
	): Promise<VoiceChangerBytesResponse> {
		const formData = new FormData();
		formData.append("clip", options.clip); // TODO: handle Blobs that are not Files
		formData.append("voice[id]", options.voice.id);

		const fmt = options.output_format;
		formData.append("output_format[container]", fmt.container);
		if ("encoding" in fmt) {
			formData.append("output_format[encoding]", fmt.encoding);
		}
		if ("bit_rate" in fmt) {
			formData.append("output_format[bit_rate]", fmt.bit_rate.toString());
		}
		if ("sample_rate" in fmt) {
			formData.append("output_format[sample_rate]", fmt.sample_rate.toString());
		}

		const response = await this._fetch("/voice-changer/bytes", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error(
				`Voice changer error! status: ${response.status}, message: ${await response.text()}`,
			);
		}

		return { buffer: await response.arrayBuffer() };
	}
}
