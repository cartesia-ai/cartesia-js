export type Supplier<T> = T | Promise<T> | (() => T | Promise<T>);

export interface CartesiaClientOptions {
  environment?: Supplier<'https://api.cartesia.ai' | string>;
  /** Specify a custom URL to connect the client to. */
  baseUrl?: Supplier<string>;
  apiKey?: Supplier<string | undefined>;
  /** Override the Cartesia-Version header */
  cartesiaVersion?: string;
  fetcher?: any;
}

export interface BackCompatRequestOptions {
  timeoutInSeconds?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  cartesiaVersion?: string;
  headers?: Record<string, string>;
}
