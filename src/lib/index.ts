import TTS from "../tts";
import type { ClientOptions } from "../types";
import Voices from "../voices";
import { Client } from "./client";

export class Cartesia extends Client {
	tts: TTS;
	voices: Voices;

	constructor(options: ClientOptions = {}) {
		super(options);

		this.tts = new TTS(options);
		this.voices = new Voices(options);
	}
}
