// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource tools', () => {
  // Mock server tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.agents.tools.create({
      api_schema: { method: 'GET', url: 'x' },
      description: 'x',
      execution_mode: 'immediate',
      name: 'name',
      pre_tool_speech: 'auto',
      type: 'webhook',
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
  test.skip('create: required and optional params', async () => {
    const response = await client.agents.tools.create({
      api_schema: {
        method: 'GET',
        url: 'x',
        authentication: {
          mode: 'basic_auth',
          password: {
            type: 'secret',
            secret_description: 'x',
            secret_value: 'secret_value',
          },
          username: 'username',
        },
        path_params_schema: {
          foo: {
            type: 'string',
            constant_value: 'string',
            description: 'description',
            dynamic_variable: 'dynamic_variable',
            enum: ['string'],
          },
        },
        query_params_schema: {
          properties: {
            foo: {
              type: 'string',
              constant_value: 'string',
              description: 'description',
              dynamic_variable: 'dynamic_variable',
              enum: ['string'],
              items: { type: 'string' },
            },
          },
          required: ['x'],
        },
        request_body_schema: {},
        request_headers: { foo: 'J!' },
      },
      description: 'x',
      execution_mode: 'immediate',
      name: 'name',
      pre_tool_speech: 'auto',
      type: 'webhook',
      assignments: [{ dynamic_variable: 'dynamic_variable', value_path: 'value_path' }],
      response_timeout_secs: 1,
    });
  });

  // Mock server tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.agents.tools.retrieve('x');
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
      client.agents.tools.retrieve('x', { expand: ['agents'] }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('update', async () => {
    const responsePromise = client.agents.tools.update('x', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.agents.tools.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.agents.tools.list(
        {
          agent_id: 'x',
          ending_before: 'ending_before',
          expand: ['agents'],
          limit: 1,
          starting_after: 'starting_after',
          type: 'webhook',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('delete', async () => {
    const responsePromise = client.agents.tools.delete('x');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
