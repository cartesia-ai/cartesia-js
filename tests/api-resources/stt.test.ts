// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import NoahTesting from 'noah-testing';

const client = new NoahTesting({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource stt', () => {
  // Prism tests are disabled
  test.skip('transcribe', async () => {
    const responsePromise = client.stt.transcribe({});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
