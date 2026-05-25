// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './stt/index';

import { STT, type STTTranscribeParams, type STTTranscribeResponse } from './stt/stt';

/** Type alias for backward compatibility */
export type SttTranscribeResponse = STTTranscribeResponse;

/** Type alias for backward compatibility */
export type SttTranscribeParams = STTTranscribeParams;

/** @deprecated Use {@link STT} instead. */
export const Stt = STT;

/** @deprecated Use {@link STT} instead. */
export type Stt = STT;

export declare namespace Stt {
  export {
    type SttTranscribeResponse as SttTranscribeResponse,
    type SttTranscribeParams as SttTranscribeParams,
  };
}
