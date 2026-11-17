// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource sessions', () => {
  // Mock server tests are disabled
  test.skip('createWebrtc', async () => {
    const responsePromise = client.agents.sessions.createWebrtc('x');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('createWebrtc: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.agents.sessions.createWebrtc(
        'x',
        {
          config_overrides: {
            audio: {
              output: {
                emotion: 'neutral',
                speed: 0.6,
                voice_id: 'x',
              },
            },
            initial_message: 'initial_message',
            instructions: 'x',
            language: { primary: 'en' },
          },
          dynamic_variables: { foo: 'string' },
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('createWebsocket', async () => {
    const responsePromise = client.agents.sessions.createWebsocket('x');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('createWebsocket: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.agents.sessions.createWebsocket(
        'x',
        {
          config_overrides: {
            audio: {
              output: {
                emotion: 'neutral',
                speed: 0.6,
                voice_id: 'x',
              },
            },
            initial_message: 'initial_message',
            instructions: 'x',
            language: { primary: 'en' },
          },
          dynamic_variables: { foo: 'string' },
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });
});
