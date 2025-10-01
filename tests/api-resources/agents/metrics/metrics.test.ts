// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import NoahTesting from 'noah-testing';

const client = new NoahTesting({
  authToken: 'My Auth Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource metrics', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.agents.metrics.create({ name: 'name', prompt: 'prompt' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('create: required and optional params', async () => {
    const response = await client.agents.metrics.create({
      name: 'name',
      prompt: 'prompt',
      display_name: 'display_name',
    });
  });

  // Prism tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.agents.metrics.retrieve('metric_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.agents.metrics.list();
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
      client.agents.metrics.list(
        { limit: 0, starting_after: 'starting_after' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(NoahTesting.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('addToAgent: only required params', async () => {
    const responsePromise = client.agents.metrics.addToAgent('metric_id', { agent_id: 'agent_id' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('addToAgent: required and optional params', async () => {
    const response = await client.agents.metrics.addToAgent('metric_id', { agent_id: 'agent_id' });
  });

  // Prism tests are disabled
  test.skip('removeFromAgent: only required params', async () => {
    const responsePromise = client.agents.metrics.removeFromAgent('metric_id', { agent_id: 'agent_id' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('removeFromAgent: required and optional params', async () => {
    const response = await client.agents.metrics.removeFromAgent('metric_id', { agent_id: 'agent_id' });
  });
});
