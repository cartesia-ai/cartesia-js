import type { Cartesia } from '../../client';

// hack to prevent format from removing Cartesia import needed for doc strings
undefined satisfies Cartesia | undefined;

/**
 * @deprecated Used {@link Cartesia } instead.
 */
export type BackCompatSupplier<T> = T | Promise<T> | (() => T | Promise<T>);

/**
 * @deprecated Used {@link Cartesia } instead.
 */
export interface BackCompatCartesiaClientOptions {
  environment?: BackCompatSupplier<'https://api.cartesia.ai' | string>;
  /** Specify a custom URL to connect the client to. */
  baseUrl?: BackCompatSupplier<string>;
  apiKey?: BackCompatSupplier<string | undefined>;
  /** Override the Cartesia-Version header */
  cartesiaVersion?: string;
  fetcher?: any;
}

/**
 * @deprecated Used {@link Cartesia } instead.
 */
export interface BackCompatRequestOptions {
  timeoutInSeconds?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  cartesiaVersion?: string;
  headers?: Record<string, string>;
}
