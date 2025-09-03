# Reference

## Agents

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">list</a>() -> Cartesia.GetAgentsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Lists all agents associated with your account.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">get</a>(agentId) -> Cartesia.AgentSummary</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns the details of a specific agent. To create an agent, use the CLI or the Playground for the best experience and integration with Github.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.get("agent_123");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` — The ID of the agent.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">update</a>(agentId, { ...params }) -> Cartesia.AgentSummary</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.update("agent_123", {
    ttsVoice: "bf0a246a-8642-498a-9950-80c35e9276b5",
    ttsLanguage: "en",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` — The ID of the agent.

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.UpdateAgentRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">delete</a>(agentId) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.delete("agent_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` — The ID of the agent.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">templates</a>() -> Cartesia.GetTemplatesResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List of public, Cartesia-provided agent templates to help you get started.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.templates();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">listCalls</a>({ ...params }) -> core.Page<Cartesia.AgentCall></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Lists calls sorted by start time in descending order for a specific agent. `agent_id` is required and if you want to include `transcript` in the response, add `expand=transcript` to the request. This endpoint is paginated.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.agents.listCalls({
    agentId: "agent_id",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.agents.listCalls({
    agentId: "agent_id",
});
while (page.hasNextPage()) {
    page = page.getNextPage();
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ListCallsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getCall</a>(callId) -> Cartesia.AgentCall</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.getCall("ac_abc123");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**callId:** `string` — The ID of the call.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">phoneNumbers</a>(agentId) -> Cartesia.PhoneNumber[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List the phone numbers associated with an agent. Currently, you can only have one phone number per agent and these are provisioned by Cartesia.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.phoneNumbers("agent_demo");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` — The ID of the agent.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">listMetrics</a>({ ...params }) -> Cartesia.ListMetricsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List of all LLM-as-a-Judge metrics owned by your account.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.listMetrics();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ListMetricsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getMetric</a>(metricId) -> Cartesia.Metric</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a metric by its ID.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.getMetric("am_abc123");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**metricId:** `string` — The ID of the metric.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">createMetric</a>({ ...params }) -> Cartesia.Metric</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new metric.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.createMetric({
    name: "evaluate-user-satisfaction",
    displayName: "Evaluate User Satisfaction",
    prompt: "Task:\nEvaluate how engaged and satisfied the user is with the conversation. Engagement may be shown through active interest in the agent\u2019s products/services, expressing that the agent was helpful, or indicating they would want to interact again.\n\nDecision Logic:\n- If the user shows strong engagement (asks detailed follow-up questions, expresses high interest, compliments the agent, or states they would use the service/agent again) \u2192 classify as HIGH_SATISFACTION\n- If the user shows some engagement (asks a few relevant questions, shows mild interest, or gives neutral feedback) \u2192 classify as MEDIUM_SATISFACTION\n- If the user shows little or no engagement (short answers, off-topic responses, disinterest, no signs of satisfaction) \u2192 classify as LOW_SATISFACTION\n\nNotes:\n- Engagement can be verbal (explicit statements of interest) or behavioral (asking more about features, prices, benefits, or next steps).\n- Expressions of satisfaction, gratitude, or willingness to call again count as positive engagement.\n- Ignore scripted greetings or polite closings unless they contain genuine feedback.\n\nReturn:\nOnly output the exact category name as a string: HIGH_SATISFACTION, MEDIUM_SATISFACTION, or LOW_SATISFACTION.\n",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.CreateMetricRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">listMetricResults</a>({ ...params }) -> core.Page<Cartesia.MetricResult></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Paginated list of metric results. Filter results using the query parameters,

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.agents.listMetricResults();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.agents.listMetricResults();
while (page.hasNextPage()) {
    page = page.getNextPage();
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ListMetricResultsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">exportMetricResults</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export metric results to a CSV file. This endpoint is paginated with a default of 10 results per page and maximum of 100 results per page. Information on pagination can be found in the headers `x-has-more`, `x-limit`, and `x-next-page`.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.exportMetricResults();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ExportMetricResultsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">addMetricToAgent</a>(agentId, metricId) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a metric to an agent. Once the metric is added, it will be run on all calls made to the agent automatically from that point onwards.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.addMetricToAgent("agent_id", "metric_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` — The ID of the agent.

</dd>
</dl>

<dl>
<dd>

**metricId:** `string` — The ID of the metric.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">removeMetricFromAgent</a>(agentId, metricId) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Remove a metric from an agent. Once the metric is removed, it will no longer be run on all calls made to the agent automatically from that point onwards. Existing metric results will remain.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.removeMetricFromAgent("agent_id", "metric_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string`

</dd>
</dl>

<dl>
<dd>

**metricId:** `string` — The ID of the metric.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">listDeployments</a>(agentId) -> Cartesia.Deployment[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List of all deployments associated with an agent.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.listDeployments("agent_demo");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` — The ID of the agent.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getDeployment</a>(deploymentId) -> Cartesia.Deployment</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a deployment by its ID.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.getDeployment("ad_abc123");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**deploymentId:** `string` — The ID of the deployment.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## ApiStatus

<details><summary><code>client.apiStatus.<a href="/src/api/resources/apiStatus/client/Client.ts">get</a>() -> Cartesia.ApiInfo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.apiStatus.get();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ApiStatus.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Auth

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">accessToken</a>({ ...params }) -> Cartesia.TokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a new Access Token for the client. These tokens are short-lived and should be used to make requests to the API from authenticated clients.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.auth.accessToken({
    grants: {
        tts: true,
        stt: true,
    },
    expiresIn: 60,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.TokenRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Auth.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Datasets

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">list</a>({ ...params }) -> Cartesia.PaginatedDatasets</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Paginated list of datasets

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ListDatasetsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">create</a>({ ...params }) -> Cartesia.Dataset</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new dataset

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.create({
    name: "name",
    description: "description",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.CreateDatasetRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">get</a>(id) -> Cartesia.Dataset</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a specific dataset by ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.get("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the dataset to retrieve

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">update</a>(id, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update an existing dataset

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.update("id", {
    name: "name",
    description: "description",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the dataset to update

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.UpdateDatasetRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">delete</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a dataset

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.delete("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the dataset to delete

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">listFiles</a>(id, { ...params }) -> Cartesia.PaginatedDatasetFiles</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Paginated list of files in a dataset

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.listFiles("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the dataset to list files from

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.ListDatasetFilesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.datasets.<a href="/src/api/resources/datasets/client/Client.ts">deleteFile</a>(id, fileId) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Remove a file from a dataset

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.datasets.deleteFile("id", "fileID");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the dataset containing the file

</dd>
</dl>

<dl>
<dd>

**fileId:** `string` — ID of the file to remove

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Datasets.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## FineTunes

<details><summary><code>client.fineTunes.<a href="/src/api/resources/fineTunes/client/Client.ts">list</a>({ ...params }) -> Cartesia.PaginatedFineTunes</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Paginated list of all fine-tunes for the authenticated user

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fineTunes.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ListFineTunesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FineTunes.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.fineTunes.<a href="/src/api/resources/fineTunes/client/Client.ts">create</a>({ ...params }) -> Cartesia.FineTune</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new fine-tune

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fineTunes.create({
    name: "name",
    description: "description",
    language: "language",
    modelId: "model_id",
    dataset: "dataset",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.CreateFineTuneRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FineTunes.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.fineTunes.<a href="/src/api/resources/fineTunes/client/Client.ts">get</a>(id) -> Cartesia.FineTune</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a specific fine-tune by ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fineTunes.get("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the fine-tune to retrieve

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FineTunes.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.fineTunes.<a href="/src/api/resources/fineTunes/client/Client.ts">delete</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a fine-tune

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fineTunes.delete("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the fine-tune to delete

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FineTunes.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.fineTunes.<a href="/src/api/resources/fineTunes/client/Client.ts">listVoices</a>(id, { ...params }) -> Cartesia.PaginatedVoices</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all voices created from a fine-tune

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fineTunes.listVoices("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the fine-tune to list voices from

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.ListVoicesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FineTunes.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Infill

<details><summary><code>client.infill.<a href="/src/api/resources/infill/client/Client.ts">bytes</a>({ ...params }) -> core.BinaryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generate audio that smoothly connects two existing audio segments. This is useful for inserting new speech between existing speech segments while maintaining natural transitions.

**The cost is 1 credit per character of the infill text plus a fixed cost of 300 credits.**

Infilling is only available on `sonic-2` at this time.

At least one of `left_audio` or `right_audio` must be provided.

As with all generative models, there's some inherent variability, but here's some tips we recommend to get the best results from infill:

- Use longer infill transcripts
    - This gives the model more flexibility to adapt to the rest of the audio
- Target natural pauses in the audio when deciding where to clip
    - This means you don't need word-level timestamps to be as precise
- Clip right up to the start and end of the audio segment you want infilled, keeping as much silence in the left/right audio segments as possible
    - This helps the model generate more natural transitions
      </dd>
      </dl>
      </dd>
      </dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.infill.bytes({
    leftAudio: fs.createReadStream("/path/to/your/file"),
    rightAudio: fs.createReadStream("/path/to/your/file"),
    modelId: "sonic-2",
    language: "en",
    transcript: "middle segment",
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    outputFormatContainer: "mp3",
    outputFormatSampleRate: 44100,
    outputFormatBitRate: 128000,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.InfillBytesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Infill.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## PronunciationDicts

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">list</a>({ ...params }) -> Cartesia.PaginatedPronunciationDicts</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all pronunciation dictionaries for the authenticated user

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.ListPronunciationDictsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">create</a>({ ...params }) -> Cartesia.PronunciationDict</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new pronunciation dictionary

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.create({
    name: "name",
    items: undefined,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.CreatePronunciationDictRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">get</a>(id) -> Cartesia.PronunciationDict</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a specific pronunciation dictionary by ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.get("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the pronunciation dictionary to retrieve

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">update</a>(id, { ...params }) -> Cartesia.PronunciationDict</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a pronunciation dictionary

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.update("id", {
    name: undefined,
    items: undefined,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the pronunciation dictionary to update

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.UpdatePronunciationDictRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">delete</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a pronunciation dictionary

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.delete("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the pronunciation dictionary to delete

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">pin</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pin a pronunciation dictionary for the authenticated user

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.pin("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the pronunciation dictionary to pin

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.pronunciationDicts.<a href="/src/api/resources/pronunciationDicts/client/Client.ts">unpin</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Unpin a pronunciation dictionary for the authenticated user

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pronunciationDicts.unpin("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — ID of the pronunciation dictionary to unpin

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PronunciationDicts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Stt

<details><summary><code>client.stt.<a href="/src/api/resources/stt/client/Client.ts">transcribe</a>({ ...params }) -> Cartesia.TranscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Transcribes audio files into text using Cartesia's Speech-to-Text API.

Upload an audio file and receive a complete transcription response. Supports arbitrarily long audio files with automatic intelligent chunking for longer audio.

**Supported audio formats:** flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm

**Response format:** Returns JSON with transcribed text, duration, and language. Include `timestamp_granularities: ["word"]` to get word-level timestamps.

**Pricing:** Batch transcription is priced at **1 credit per 2 seconds** of audio processed.

<Note>
For migrating from the OpenAI SDK, see our [OpenAI Whisper to Cartesia Ink Migration Guide](/api-reference/stt/migrate-from-open-ai).
</Note>
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.stt.transcribe({
    file: fs.createReadStream("/path/to/your/file"),
    model: "ink-whisper",
    language: "en",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.TranscriptionRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Stt.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Tts

<details><summary><code>client.tts.<a href="/src/api/resources/tts/client/Client.ts">bytes</a>({ ...params }) -> core.BinaryResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tts.bytes({
    modelId: "sonic-2",
    transcript: "Hello, world!",
    voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
    },
    language: "en",
    outputFormat: {
        container: "mp3",
        sampleRate: 44100,
        bitRate: 128000,
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.TtsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Tts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.tts.<a href="/src/api/resources/tts/client/Client.ts">sse</a>({ ...params }) -> core.Stream<Cartesia.WebSocketResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.tts.sse({
    modelId: "sonic-2",
    transcript: "Hello, world!",
    voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
    },
    language: "en",
    outputFormat: {
        container: "raw",
        sampleRate: 44100,
        encoding: "pcm_f32le",
    },
});
for await (const item of response) {
    console.log(item);
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.TtssseRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Tts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## VoiceChanger

<details><summary><code>client.voiceChanger.<a href="/src/api/resources/voiceChanger/client/Client.ts">bytes</a>({ ...params }) -> core.BinaryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Takes an audio file of speech, and returns an audio file of speech spoken with the same intonation, but with a different voice.

This endpoint is priced at 15 characters per second of input audio.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voiceChanger.bytes({
    clip: fs.createReadStream("/path/to/your/file"),
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    outputFormatContainer: "mp3",
    outputFormatSampleRate: 44100,
    outputFormatBitRate: 128000,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.VoiceChangerBytesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VoiceChanger.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voiceChanger.<a href="/src/api/resources/voiceChanger/client/Client.ts">sse</a>({ ...params }) -> core.Stream<Cartesia.StreamingResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.voiceChanger.sse({
    clip: fs.createReadStream("/path/to/your/file"),
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    outputFormatContainer: "mp3",
    outputFormatSampleRate: 44100,
    outputFormatBitRate: 128000,
});
for await (const item of response) {
    console.log(item);
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.VoiceChangerSseRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VoiceChanger.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Voices

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">list</a>({ ...params }) -> core.Page<Cartesia.Voice></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.voices.list({
    gender: null,
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.voices.list({
    gender: null,
});
while (page.hasNextPage()) {
    page = page.getNextPage();
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.GetVoicesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">clone</a>({ ...params }) -> Cartesia.VoiceMetadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Clone a high similarity voice from an audio clip. Clones are more similar to the source clip, but may reproduce background noise. For these, use an audio clip about 5 seconds long.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.clone({
    clip: fs.createReadStream("/path/to/your/file"),
    name: "A high-similarity cloned voice",
    description: "Copied from Cartesia docs",
    language: "en",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.CloneVoiceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">delete</a>(id) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.delete("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `Cartesia.VoiceId`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">update</a>(id, { ...params }) -> Cartesia.Voice</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update the name, description, and gender of a voice. To set the gender back to the default, set the gender to `null`. If gender is not specified, the gender will not be updated.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.update("8f7d3c2e-1a2b-3c4d-5e6f-7g8h9i0j1k2l", {
    name: "Sarah Peninsular Spanish",
    description: "Sarah Voice in Peninsular Spanish",
    gender: "feminine",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `Cartesia.VoiceId`

</dd>
</dl>

<dl>
<dd>

**request:** `Cartesia.UpdateVoiceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">get</a>(id) -> Cartesia.Voice</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.get("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `Cartesia.VoiceId`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.voices.<a href="/src/api/resources/voices/client/Client.ts">localize</a>({ ...params }) -> Cartesia.VoiceMetadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new voice from an existing voice localized to a new language and dialect.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.voices.localize({
    voiceId: "694f9389-aac1-45b6-b726-9d9369183238",
    name: "Sarah Peninsular Spanish",
    description: "Sarah Voice in Peninsular Spanish",
    language: "es",
    originalSpeakerGender: "female",
    dialect: "pe",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Cartesia.LocalizeVoiceRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Voices.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
