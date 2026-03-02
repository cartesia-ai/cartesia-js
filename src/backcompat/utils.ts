import { APIConnectionTimeoutError, APIError } from '../core/error';
import { CartesiaClientError, CartesiaTimeoutError } from './errors';

/** Convert snake_case keys to camelCase, recursively. Only transforms plain objects. */
export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      result[camelKey] = snakeToCamel(value);
    }
    return result;
  }
  return obj;
}

export async function wrap<T, R = T>(promise: Promise<T>): Promise<R> {
  try {
    return snakeToCamel(await promise);
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
