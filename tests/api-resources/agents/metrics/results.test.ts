// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({
  token: 'My Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource results', () => {
  // Mock server tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.agents.metrics.results.list();
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
      client.agents.metrics.results.list(
        {
          agent_id: 'agent_id',
          call_id: 'call_id',
          deployment_id: 'deployment_id',
          end_date: '2019-12-27T18:11:19.117Z',
          ending_before: 'ending_before',
          limit: 0,
          metric_id: 'metric_id',
          start_date: '2019-12-27T18:11:19.117Z',
          starting_after: 'starting_after',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('export', async () => {
    const responsePromise = client.agents.metrics.results.export();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('export: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.agents.metrics.results.export(
        {
          agent_id: 'agent_id',
          call_id: 'call_id',
          deployment_id: 'deployment_id',
          end_date: '2019-12-27T18:11:19.117Z',
          metric_id: 'metric_id',
          start_date: '2019-12-27T18:11:19.117Z',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Cartesia.NotFoundError);
  });
});
