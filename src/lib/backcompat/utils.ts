import { APIConnectionTimeoutError, APIError } from '../../core/error';
import { CartesiaClientError, CartesiaTimeoutError } from './errors';
import type { Cartesia } from '../../client';

// hack to prevent format from removing Cartesia import needed for doc strings
undefined satisfies Cartesia | undefined;

/**
 * Convert snake_case keys to camelCase, recursively. Only transforms plain objects.
 *
 * @deprecated Used {@link Cartesia } instead.
 */
export function backCompatSnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(backCompatSnakeToCamel);
  if (obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      result[camelKey] = backCompatSnakeToCamel(value);
    }
    return result;
  }
  return obj;
}

/**
 * @deprecated Used {@link Cartesia } instead.
 */
export async function backCompatWrap<T, R = T>(promise: Promise<T>): Promise<R> {
  try {
    return backCompatSnakeToCamel(await promise);
  } catch (e) {
    if (e instanceof APIConnectionTimeoutError) {
      throw new CartesiaTimeoutError(e.message);
    }
    if (e instanceof APIError) {
      throw new CartesiaClientError({
        message: e.message,
        statusCode: e.status,
        body: e.error,
      });
    }
    throw e;
  }
}
