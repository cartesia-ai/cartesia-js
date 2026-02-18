// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { castToError } from '../internal/errors';
import { isObj } from '../internal/utils';

export class CartesiaError extends Error {}

export type BadRequestErrorCode =
  | 'file_too_large'
  | 'voice_model_mismatch'
  | 'unsupported_audio_format'
  | 'language_not_supported'
  | (string & {});

export type PaymentRequiredErrorCode = 'quota_exceeded' | 'plan_upgrade_required' | (string & {});

export type NotFoundErrorCode = 'voice_not_found' | 'model_not_found' | (string & {});

export type RateLimitErrorCode = 'concurrency_limited' | (string & {});

export type ContentTooLargeErrorCode = 'file_too_large' | (string & {});

// Union of all error codes
export type APIErrorCode =
  | BadRequestErrorCode
  | PaymentRequiredErrorCode
  | NotFoundErrorCode
  | RateLimitErrorCode
  | ContentTooLargeErrorCode;

export type APIErrorPayload<TErrorCode extends APIErrorCode = APIErrorCode> = {
  request_id: string;
  message: string;
  title: string;
  error_code: TErrorCode | undefined;
  doc_url: string | undefined;
  raw: APIErrorRaw;
};

export type APIErrorRaw = Record<string, unknown> | string;

type APIErrorPayloadFor<TErrorCode extends APIErrorCode | never> =
  [TErrorCode] extends [never] ? undefined : APIErrorPayload<TErrorCode> | undefined;

const DEFAULT_ERROR_PAYLOAD: APIErrorPayload = {
  request_id: 'unknown',
  message: 'Unknown error',
  title: 'Unknown error',
  error_code: undefined,
  doc_url: undefined,
  raw: 'unknown',
};

export function safeAPIErrorPayload(response: unknown): APIErrorPayload {
  if (!isObj(response))
    return {
      ...DEFAULT_ERROR_PAYLOAD,
      message: String(response),
      raw: String(response),
    };
  const raw = response;
  const { request_id, message, title, error_code, doc_url } = response;
  if (typeof request_id !== 'string' || typeof message !== 'string' || typeof title !== 'string') {
    return {
      ...DEFAULT_ERROR_PAYLOAD,
      message: String(message),
      raw: response,
    };
  }
  return {
    request_id,
    message,
    title,
    error_code: error_code != null ? String(error_code) : undefined,
    doc_url: typeof doc_url === 'string' ? doc_url : undefined,
    raw,
  };
}

export class APIError<
  TStatus extends number | undefined = number | undefined,
  THeaders extends Headers | undefined = Headers | undefined,
  TErrorCode extends APIErrorCode | never = APIErrorCode,
> extends CartesiaError {
  /** HTTP status for the response that caused the error */
  readonly status: TStatus;
  /** HTTP headers for the response that caused the error */
  readonly headers: THeaders;
  /** JSON body of the response that caused the error */
  readonly details: APIErrorPayloadFor<TErrorCode>;

  constructor(
    status: TStatus,
    details: APIErrorPayloadFor<TErrorCode>,
    message: string | undefined,
    headers: THeaders,
  ) {
    super(`${APIError.makeMessage(status, details, message)}`);
    this.status = status;
    this.headers = headers;
    this.details = details;
  }

  private static makeMessage(
    status: number | undefined,
    details: APIErrorPayload | undefined,
    message: string | undefined,
  ) {
    const msg =
      details?.message ?
        typeof details.message === 'string' ?
          details.message
        : JSON.stringify(details.message)
      : details ? JSON.stringify(details)
      : message;

    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return '(no status code or body)';
  }

  static generate(
    status: number | undefined,
    errorPayload: APIErrorPayload,
    message: string | undefined,
    headers: Headers | undefined,
  ): APIError {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorPayload) });
    }

    if (status === 400) {
      return new BadRequestError(
        status,
        errorPayload as APIErrorPayload<BadRequestErrorCode>,
        message,
        headers,
      );
    }

    if (status === 401) {
      return new AuthenticationError(status, errorPayload, message, headers);
    }

    if (status === 402) {
      return new PaymentRequiredError(
        status,
        errorPayload as APIErrorPayload<PaymentRequiredErrorCode>,
        message,
        headers,
      );
    }

    if (status === 403) {
      return new PermissionDeniedError(status, errorPayload, message, headers);
    }

    if (status === 404) {
      return new NotFoundError(status, errorPayload as APIErrorPayload<NotFoundErrorCode>, message, headers);
    }

    if (status === 409) {
      return new ConflictError(status, errorPayload, message, headers);
    }

    if (status === 413) {
      return new ContentTooLargeError(
        status,
        errorPayload as APIErrorPayload<ContentTooLargeErrorCode>,
        message,
        headers,
      );
    }

    if (status === 422) {
      return new UnprocessableEntityError(status, errorPayload, message, headers);
    }

    if (status === 429) {
      return new RateLimitError(
        status,
        errorPayload as APIErrorPayload<RateLimitErrorCode>,
        message,
        headers,
      );
    }

    if (status >= 500) {
      return new InternalServerError(status, errorPayload, message, headers);
    }

    return new APIError(status, errorPayload, message, headers);
  }
}

export class APIUserAbortError extends APIError<undefined, undefined, never> {
  constructor({ message }: { message?: string } = {}) {
    super(undefined, undefined, message || 'Request was aborted.', undefined);
  }
}

export class APIConnectionError extends APIError<undefined, undefined, never> {
  constructor({ message, cause }: { message?: string | undefined; cause?: Error | undefined }) {
    super(undefined, undefined, message || 'Connection error.', undefined);
    // in some environments the 'cause' property is already declared
    // @ts-ignore
    if (cause) this.cause = cause;
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor({ message }: { message?: string } = {}) {
    super({ message: message ?? 'Request timed out.' });
  }
}

export class BadRequestError extends APIError<400, Headers, BadRequestErrorCode> {}

export class AuthenticationError extends APIError<401, Headers> {}

export class PaymentRequiredError extends APIError<402, Headers, PaymentRequiredErrorCode> {}

export class PermissionDeniedError extends APIError<403, Headers> {}

export class NotFoundError extends APIError<404, Headers, NotFoundErrorCode> {}

export class ConflictError extends APIError<409, Headers> {}

export class ContentTooLargeError extends APIError<413, Headers, ContentTooLargeErrorCode> {}

export class UnprocessableEntityError extends APIError<422, Headers> {}

export class RateLimitError extends APIError<429, Headers, RateLimitErrorCode> {}

export class InternalServerError extends APIError<number, Headers> {}
