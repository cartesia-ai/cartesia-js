// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource agents', () => {
  // Mock server tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.usage.agents.retrieve();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('retrieve: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.usage.agents.retrieve(
        {
          end_ts: '2026-03-08T00:00:00Z',
          interval: 'day',
          start_ts: '2026-03-01T00:00:00Z',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });
});
