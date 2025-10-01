// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import NoahTesting from 'noah-testing';

const client = new NoahTesting({
  accessToken: 'My Access Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource results', () => {
  // Prism tests are disabled
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

  // Prism tests are disabled
  test.skip('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.agents.metrics.results.list(
        {
          agent_id: 'agent_id',
          call_id: 'call_id',
          deployment_id: 'deployment_id',
          ending_before: 'ending_before',
          limit: 0,
          metric_id: 'metric_id',
          starting_after: 'starting_after',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(NoahTesting.NotFoundError);
  });

  // Prism tests are disabled
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

  // Prism tests are disabled
  test.skip('export: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.agents.metrics.results.export(
        {
          agent_id: 'agent_id',
          call_id: 'call_id',
          deployment_id: 'deployment_id',
          ending_before: 'ending_before',
          limit: 0,
          metric_id: 'metric_id',
          starting_after: 'starting_after',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(NoahTesting.NotFoundError);
  });
});
