// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia, { toFile } from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource watermark', () => {
  // Mock server tests are disabled
  test.skip('detect: only required params', async () => {
    const responsePromise = client.watermark.detect({
      file: await toFile(Buffer.from('Example data'), 'README.md'),
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
  test.skip('detect: required and optional params', async () => {
    const response = await client.watermark.detect({
      file: await toFile(Buffer.from('Example data'), 'README.md'),
    });
  });
});
