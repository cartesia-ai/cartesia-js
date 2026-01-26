import { Cartesia, type ClientOptions } from '../client';
import { TTSWrapper } from './tts-wrapper';
import { VoicesWrapper } from './voices-wrapper';
import { VoiceChangerWrapper } from './voice-changer-wrapper';
import { buildHeaders, type NullableHeaders } from '../internal/headers';
import type { CartesiaClientOptions, Supplier } from './types';

async function resolveSupplier<T>(supplier: Supplier<T>): Promise<T> {
  if (typeof supplier === 'function') {
    return (supplier as () => T | Promise<T>)();
  }
  return supplier;
}

class DynamicCartesia extends Cartesia {
  private apiKeySupplier?: Supplier<string | undefined>;

  constructor(options: ClientOptions & { apiKeySupplier?: Supplier<string | undefined> }) {
    super(options);
    this.apiKeySupplier = options.apiKeySupplier;
  }

  protected override validateHeaders(_headers: NullableHeaders): void {
    // Skip validation if we have a dynamic API key supplier
    // The key will be resolved and added in authHeaders
    if (this.apiKeySupplier) {
      return;
    }
    super.validateHeaders(_headers);
  }

  protected override async authHeaders(opts: any): Promise<NullableHeaders | undefined> {
    // If we have a dynamic supplier, resolve it and return the auth header
    if (this.apiKeySupplier) {
      const key = await resolveSupplier(this.apiKeySupplier);
      if (key) {
        return buildHeaders([{ Authorization: `Bearer ${key}` }]);
      }
    }
    // Otherwise, fall back to default behavior
    return super.authHeaders(opts);
  }
}

/**
 * @deprecated Use the {@link Cartesia} class directly instead.
 *
 * This class is provided for backward compatibility with the legacy SDK and may be removed in a future release.
 */
export class CartesiaClient {
  private client: Cartesia;
  public tts: TTSWrapper;
  public voices: VoicesWrapper;
  public voiceChanger: VoiceChangerWrapper;

  constructor(options: CartesiaClientOptions = {}) {
    const newOptions: ClientOptions = {};
    let apiKeySupplier: Supplier<string | undefined> | undefined;

    if (options.apiKey) {
      if (typeof options.apiKey === 'function') {
        apiKeySupplier = options.apiKey;
      } else {
        newOptions.apiKey = options.apiKey as string;
      }
    }

    if (options.baseUrl) {
      newOptions.baseURL = options.baseUrl as string;
    } else if (options.environment) {
      newOptions.baseURL = options.environment as string;
    }

    this.client = new DynamicCartesia({ ...newOptions, apiKeySupplier });
    this.tts = new TTSWrapper(this.client);
    this.voices = new VoicesWrapper(this.client);
    this.voiceChanger = new VoiceChangerWrapper(this.client);
  }
}

export * from './tts-wrapper';
export * from './voices-wrapper';
export * from './voice-changer-wrapper';
export * from './types';
export * from './errors';
