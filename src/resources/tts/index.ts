// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  TTS,
  type GenerationConfig,
  type GenerationRequest,
  type ModelSpeed,
  type OutputFormatContainer,
  type PhonemeTimestamps,
  type RawEncoding,
  type RawOutputFormat,
  type TTSSSEEvent,
  type VoiceSpecifier,
  type WebsocketClientEvent,
  type WebsocketResponse,
  type WordTimestamps,
  type TTSGenerateParams,
  type TTSGenerateSseParams,
  type TTSGenerateSSEParams,
  type TTSInfillParams,
} from './tts';
export { type TTSWSClientOptions } from './ws';
export { type TTSWSReconnectOptions } from './ws-base';

export {
  TTSWS_3_0_0 as TTSWS,
  TTSWSContext_3_0_0 as TTSWSContext,
  WebSocketTimeoutError_3_0_0 as WebSocketTimeoutError,
  type ContextOptions_3_0_0 as ContextOptions,
  type ContextGenerateRequest_3_0_0 as ContextGenerateRequest,
} from '../../lib/tts/ws/3-0-0';
export { TTSContexts } from '../../lib/tts/ws/context-manager';
