export type Supplier<T> = T | Promise<T> | (() => T | Promise<T>);

export interface CartesiaClientOptions {
  environment?: string | null | undefined;
  /** Specify a custom URL to connect the client to. */
  baseUrl?: string | null | undefined;
  apiKey?: Supplier<string | undefined> | null | undefined;
  fetcher?: any;
}

export interface BackCompatRequestOptions {
  timeoutInSeconds?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
}
