// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

// This is a directory that Stainless will generate if we add a WebSocket
// method to the TTS resource.
//
// In an effort to improve maintainability, the TTS WebSocket method was
// removed from the Stainless config in SDK version 3.1.0 to prevent code
// generation from creating merge conflicts.
//
// At the time of writing, src/resources/tts.ts is the generated code and this
// directory contains manually maintained code.
// The eventual goal is to use all generated code as-is (with some additional exports as needed).
//
// FIXME: Bring [v3.1.0-b3](https://github.com/cartesia-ai/cartesia-js/releases/tag/v3.1.0-b3) TTS WebSocket code to v4.

export {
  TTS,
  type Emotion,
  type GenerationConfig,
  type GenerationRequest,
  type ModelSpeed,
  type OutputFormatContainer,
  type RawEncoding,
  type RawOutputFormat,
  type VoiceSpecifier,
  type WebsocketClientEvent,
  type WebsocketResponse,
  type TTSGenerateParams,
  type TTSGenerateSseParams,
  type TTSInfillParams,
} from './tts';

export { TTSWS, TTSWSContext, type ContextOptions, type ContextGenerateRequest } from './ws';
export { WebSocketTimeoutError } from './internal-base';
