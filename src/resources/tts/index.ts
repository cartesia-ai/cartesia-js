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
  type TTSGenerateSSEParams,
  type TTSInfillParams,
  /** Type alias for backward compatibility */
  type TTSGenerateSSEParams as TTSGenerateSseParams,
} from './tts';
export { type TTSWSClientOptions } from './ws';
export { type TTSWSReconnectOptions } from './ws-base';

export {
  TTSWS,
  TTSWSContext,
  WebSocketTimeoutError,
  type ContextGenerateRequest,
} from '../../lib/tts/ws/3-0-0';
export { TTSContexts, type ContextOptions } from '../../lib/tts/ws/context-manager';
