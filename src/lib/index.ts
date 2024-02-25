import Audio from "../audio";
import type { ClientOptions } from "../types";
import { Client } from "./client";

export class Cartesia extends Client {
	audio: Audio;

	constructor(options: ClientOptions = {}) {
		super(options);

		this.audio = new Audio(options);
	}
}
