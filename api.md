# Cartesia

Types:

- <code><a href="./src/resources/top-level.ts">GetStatusResponse</a></code>

Methods:

- <code title="get /">client.<a href="./src/index.ts">getStatus</a>() -> GetStatusResponse</code>

# Agents

Types:

- <code><a href="./src/resources/agents/agents.ts">AgentSummary</a></code>
- <code><a href="./src/resources/agents/agents.ts">AgentListResponse</a></code>
- <code><a href="./src/resources/agents/agents.ts">AgentListPhoneNumbersResponse</a></code>
- <code><a href="./src/resources/agents/agents.ts">AgentListTemplatesResponse</a></code>

Methods:

- <code title="get /agents/{agent_id}">client.agents.<a href="./src/resources/agents/agents.ts">retrieve</a>(agentID) -> AgentSummary</code>
- <code title="patch /agents/{agent_id}">client.agents.<a href="./src/resources/agents/agents.ts">update</a>(agentID, { ...params }) -> AgentSummary</code>
- <code title="get /agents">client.agents.<a href="./src/resources/agents/agents.ts">list</a>() -> AgentListResponse</code>
- <code title="delete /agents/{agent_id}">client.agents.<a href="./src/resources/agents/agents.ts">delete</a>(agentID) -> void</code>
- <code title="get /agents/{agent_id}/phone-numbers">client.agents.<a href="./src/resources/agents/agents.ts">listPhoneNumbers</a>(agentID) -> AgentListPhoneNumbersResponse</code>
- <code title="get /agents/templates">client.agents.<a href="./src/resources/agents/agents.ts">listTemplates</a>() -> AgentListTemplatesResponse</code>

## Calls

Types:

- <code><a href="./src/resources/agents/calls.ts">AgentCall</a></code>
- <code><a href="./src/resources/agents/calls.ts">AgentTranscript</a></code>

Methods:

- <code title="get /agents/calls/{call_id}">client.agents.calls.<a href="./src/resources/agents/calls.ts">retrieve</a>(callID) -> AgentCall</code>
- <code title="get /agents/calls">client.agents.calls.<a href="./src/resources/agents/calls.ts">list</a>({ ...params }) -> AgentCallsCursorIDPage</code>
- <code title="get /agents/calls/{call_id}/audio">client.agents.calls.<a href="./src/resources/agents/calls.ts">downloadAudio</a>(callID) -> void</code>

## Metrics

Types:

- <code><a href="./src/resources/agents/metrics/metrics.ts">Metric</a></code>
- <code><a href="./src/resources/agents/metrics/metrics.ts">MetricListResponse</a></code>

Methods:

- <code title="post /agents/metrics">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">create</a>({ ...params }) -> Metric</code>
- <code title="get /agents/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">retrieve</a>(metricID) -> Metric</code>
- <code title="get /agents/metrics">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">list</a>({ ...params }) -> MetricListResponse</code>
- <code title="post /agents/{agent_id}/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">addToAgent</a>(metricID, { ...params }) -> void</code>
- <code title="delete /agents/{agent_id}/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">removeFromAgent</a>(metricID, { ...params }) -> void</code>

### Results

Types:

- <code><a href="./src/resources/agents/metrics/results.ts">ResultListResponse</a></code>
- <code><a href="./src/resources/agents/metrics/results.ts">ResultExportResponse</a></code>

Methods:

- <code title="get /agents/metrics/results">client.agents.metrics.results.<a href="./src/resources/agents/metrics/results.ts">list</a>({ ...params }) -> ResultListResponsesCursorIDPage</code>
- <code title="get /agents/metrics/results/export">client.agents.metrics.results.<a href="./src/resources/agents/metrics/results.ts">export</a>({ ...params }) -> string</code>

## Deployments

Types:

- <code><a href="./src/resources/agents/deployments.ts">Deployment</a></code>
- <code><a href="./src/resources/agents/deployments.ts">DeploymentListResponse</a></code>

Methods:

- <code title="get /agents/deployments/{deployment_id}">client.agents.deployments.<a href="./src/resources/agents/deployments.ts">retrieve</a>(deploymentID) -> Deployment</code>
- <code title="get /agents/{agent_id}/deployments">client.agents.deployments.<a href="./src/resources/agents/deployments.ts">list</a>(agentID) -> DeploymentListResponse</code>

# AccessToken

Types:

- <code><a href="./src/resources/access-token.ts">AccessTokenCreateResponse</a></code>

Methods:

- <code title="post /access-token">client.accessToken.<a href="./src/resources/access-token.ts">create</a>({ ...params }) -> AccessTokenCreateResponse</code>

# Datasets

Types:

- <code><a href="./src/resources/datasets/datasets.ts">Dataset</a></code>

Methods:

- <code title="post /datasets/">client.datasets.<a href="./src/resources/datasets/datasets.ts">create</a>({ ...params }) -> Dataset</code>
- <code title="get /datasets/{id}">client.datasets.<a href="./src/resources/datasets/datasets.ts">retrieve</a>(id) -> Dataset</code>
- <code title="patch /datasets/{id}">client.datasets.<a href="./src/resources/datasets/datasets.ts">update</a>(id, { ...params }) -> void</code>
- <code title="get /datasets/">client.datasets.<a href="./src/resources/datasets/datasets.ts">list</a>({ ...params }) -> DatasetsCursorIDPage</code>
- <code title="delete /datasets/{id}">client.datasets.<a href="./src/resources/datasets/datasets.ts">delete</a>(id) -> void</code>

## Files

Types:

- <code><a href="./src/resources/datasets/files.ts">FileListResponse</a></code>

Methods:

- <code title="get /datasets/{id}/files">client.datasets.files.<a href="./src/resources/datasets/files.ts">list</a>(id, { ...params }) -> FileListResponsesCursorIDPage</code>
- <code title="delete /datasets/{id}/files/{fileID}">client.datasets.files.<a href="./src/resources/datasets/files.ts">delete</a>(fileID, { ...params }) -> void</code>
- <code title="post /datasets/{id}/files">client.datasets.files.<a href="./src/resources/datasets/files.ts">upload</a>(id, { ...params }) -> void</code>

# FineTunes

Types:

- <code><a href="./src/resources/fine-tunes.ts">FineTune</a></code>

Methods:

- <code title="post /fine-tunes/">client.fineTunes.<a href="./src/resources/fine-tunes.ts">create</a>({ ...params }) -> FineTune</code>
- <code title="get /fine-tunes/{id}">client.fineTunes.<a href="./src/resources/fine-tunes.ts">retrieve</a>(id) -> FineTune</code>
- <code title="get /fine-tunes/">client.fineTunes.<a href="./src/resources/fine-tunes.ts">list</a>({ ...params }) -> FineTunesCursorIDPage</code>
- <code title="delete /fine-tunes/{id}">client.fineTunes.<a href="./src/resources/fine-tunes.ts">delete</a>(id) -> void</code>
- <code title="get /fine-tunes/{id}/voices">client.fineTunes.<a href="./src/resources/fine-tunes.ts">listVoices</a>(id, { ...params }) -> VoicesCursorIDPage</code>

# PronunciationDicts

Types:

- <code><a href="./src/resources/pronunciation-dicts.ts">PronunciationDict</a></code>
- <code><a href="./src/resources/pronunciation-dicts.ts">PronunciationDictItem</a></code>

Methods:

- <code title="post /pronunciation-dicts/">client.pronunciationDicts.<a href="./src/resources/pronunciation-dicts.ts">create</a>({ ...params }) -> PronunciationDict</code>
- <code title="get /pronunciation-dicts/{id}">client.pronunciationDicts.<a href="./src/resources/pronunciation-dicts.ts">retrieve</a>(id) -> PronunciationDict</code>
- <code title="patch /pronunciation-dicts/{id}">client.pronunciationDicts.<a href="./src/resources/pronunciation-dicts.ts">update</a>(id, { ...params }) -> PronunciationDict</code>
- <code title="get /pronunciation-dicts/">client.pronunciationDicts.<a href="./src/resources/pronunciation-dicts.ts">list</a>({ ...params }) -> PronunciationDictsCursorIDPage</code>
- <code title="delete /pronunciation-dicts/{id}">client.pronunciationDicts.<a href="./src/resources/pronunciation-dicts.ts">delete</a>(id) -> void</code>

# Stt

Types:

- <code><a href="./src/resources/stt.ts">SttTranscribeResponse</a></code>

Methods:

- <code title="post /stt">client.stt.<a href="./src/resources/stt.ts">transcribe</a>({ ...params }) -> SttTranscribeResponse</code>

# TTS

Types:

- <code><a href="./src/resources/tts.ts">GenerationConfig</a></code>
- <code><a href="./src/resources/tts.ts">GenerationRequest</a></code>
- <code><a href="./src/resources/tts.ts">ModelSpeed</a></code>
- <code><a href="./src/resources/tts.ts">OutputFormatContainer</a></code>
- <code><a href="./src/resources/tts.ts">RawEncoding</a></code>
- <code><a href="./src/resources/tts.ts">RawOutputFormat</a></code>
- <code><a href="./src/resources/tts.ts">VoiceSpecifier</a></code>
- <code><a href="./src/resources/tts.ts">WebsocketClientEvent</a></code>
- <code><a href="./src/resources/tts.ts">WebsocketResponse</a></code>

Methods:

- <code title="post /tts/bytes">client.tts.<a href="./src/resources/tts.ts">generate</a>({ ...params }) -> Response</code>
- <code title="post /tts/sse">client.tts.<a href="./src/resources/tts.ts">generateSse</a>({ ...params }) -> void</code>
- <code title="post /infill/bytes">client.tts.<a href="./src/resources/tts.ts">infill</a>({ ...params }) -> Response</code>

# VoiceChanger

Methods:

- <code title="post /voice-changer/bytes">client.voiceChanger.<a href="./src/resources/voice-changer.ts">changeVoiceBytes</a>({ ...params }) -> Response</code>
- <code title="post /voice-changer/sse">client.voiceChanger.<a href="./src/resources/voice-changer.ts">changeVoiceSse</a>({ ...params }) -> void</code>

# Voices

Types:

- <code><a href="./src/resources/voices.ts">GenderPresentation</a></code>
- <code><a href="./src/resources/voices.ts">SupportedLanguage</a></code>
- <code><a href="./src/resources/voices.ts">Voice</a></code>
- <code><a href="./src/resources/voices.ts">VoiceMetadata</a></code>

Methods:

- <code title="patch /voices/{id}">client.voices.<a href="./src/resources/voices.ts">update</a>(id, { ...params }) -> Voice</code>
- <code title="get /voices">client.voices.<a href="./src/resources/voices.ts">list</a>({ ...params }) -> VoicesCursorIDPage</code>
- <code title="delete /voices/{id}">client.voices.<a href="./src/resources/voices.ts">delete</a>(id) -> void</code>
- <code title="post /voices/clone">client.voices.<a href="./src/resources/voices.ts">clone</a>({ ...params }) -> VoiceMetadata</code>
- <code title="get /voices/{id}">client.voices.<a href="./src/resources/voices.ts">get</a>(id, { ...params }) -> Voice</code>
- <code title="post /voices/localize">client.voices.<a href="./src/resources/voices.ts">localize</a>({ ...params }) -> VoiceMetadata</code>
