// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia, { toFile } from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource stt', () => {
  // Mock server tests are disabled
  test.skip('transcribe: only required params', async () => {
    const responsePromise = client.stt.transcribe({
      file: await toFile(Buffer.from('Example data'), 'README.md'),
      model: 'ink-whisper',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('transcribe: required and optional params', async () => {
    const response = await client.stt.transcribe({
      file: await toFile(Buffer.from('Example data'), 'README.md'),
      model: 'ink-whisper',
      encoding: 'pcm_s16le',
      sample_rate: 0,
      language: 'en',
      timestamp_granularities: ['word'],
    });
  });
});
