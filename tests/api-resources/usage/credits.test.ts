// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource credits', () => {
  // Mock server tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.usage.credits.retrieve();
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
      client.usage.credits.retrieve(
        {
          api_key_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
          end_ts: '2026-01-03T00:00:00Z',
          group_by: 'capability',
          interval: 'day',
          start_ts: '2026-01-01T00:00:00Z',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });
});
