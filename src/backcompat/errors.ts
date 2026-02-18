import { APIConnectionTimeoutError, APIError } from '../core/error';

/** @deprecated Use {@link CartesiaError} or specialized error classes from core/error instead. */
export class CartesiaClientError extends Error {
  readonly statusCode?: number;
  readonly body?: unknown;

  constructor({ message, statusCode, body }: { message?: string; statusCode?: number; body?: unknown }) {
    super(message);
    Object.setPrototypeOf(this, CartesiaClientError.prototype);
    if (statusCode != null) {
      this.statusCode = statusCode;
    }
    if (body !== undefined) {
      this.body = body;
    }
  }
}

/** @deprecated Use {@link APIConnectionTimeoutError} instead. */
export class CartesiaTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CartesiaTimeoutError.prototype);
  }
}

export async function wrap<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof APIConnectionTimeoutError) {
      throw new CartesiaTimeoutError(e.message);
    }
    if (e instanceof APIError) {
      throw new CartesiaClientError({
        message: e.message,
        statusCode: e.status,
        body: e.details,
      });
    }
    throw e;
  }
}
