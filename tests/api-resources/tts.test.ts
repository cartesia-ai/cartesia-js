// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource tts', () => {
  test('generate: required and optional params', async () => {
    const response = await client.tts.generate({
      model_id: 'model_id',
      output_format: {
        encoding: 'pcm_f32le',
        sample_rate: 8000,
        container: 'raw',
      },
      transcript: 'transcript',
      voice: { id: 'id', mode: 'id' },
      generation_config: {
        emotion: 'neutral',
        speed: 0,
        volume: 0,
      },
      language: 'en',
      pronunciation_dict_id: 'pronunciation_dict_id',
      save: true,
      speed: 'slow',
    });
  });

  // Prism tests are disabled
  test.skip('generateSse: only required params', async () => {
    const responsePromise = client.tts.generateSse({
      model_id: 'model_id',
      output_format: {
        container: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 8000,
      },
      transcript: 'transcript',
      voice: { id: 'id', mode: 'id' },
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('generateSse: required and optional params', async () => {
    const response = await client.tts.generateSse({
      model_id: 'model_id',
      output_format: {
        container: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 8000,
      },
      transcript: 'transcript',
      voice: { id: 'id', mode: 'id' },
      add_phoneme_timestamps: true,
      add_timestamps: true,
      context_id: 'context_id',
      generation_config: {
        emotion: 'neutral',
        speed: 0,
        volume: 0,
      },
      language: 'en',
      pronunciation_dict_id: 'pronunciation_dict_id',
      speed: 'slow',
      use_normalized_timestamps: true,
    });
  });
});
