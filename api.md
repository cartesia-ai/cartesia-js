# Cartesia

Types:

- <code><a href="./src/resources/top-level.ts">GetStatusResponse</a></code>

Methods:

- <code title="get /">client.<a href="./src/index.ts">getStatus</a>() -> GetStatusResponse</code>

# Shared

Types:

- <code><a href="./src/resources/shared.ts">PhonemeTimestamps</a></code>
- <code><a href="./src/resources/shared.ts">WordTimestamps</a></code>

# Agents

Types:

- <code><a href="./src/resources/agents/agents.ts">Agent</a></code>
- <code><a href="./src/resources/agents/agents.ts">AgentSummary</a></code>

Methods:

- <code title="post /v1/agents">client.agents.<a href="./src/resources/agents/agents.ts">create</a>({ ...params }) -> Agent</code>
- <code title="get /v1/agents/{agent_id}">client.agents.<a href="./src/resources/agents/agents.ts">retrieve</a>(agentID) -> Agent</code>
- <code title="patch /v1/agents/{agent_id}">client.agents.<a href="./src/resources/agents/agents.ts">update</a>(agentID, { ...params }) -> Agent</code>
- <code title="get /v1/agents">client.agents.<a href="./src/resources/agents/agents.ts">list</a>({ ...params }) -> AgentSummariesCursorIDPage</code>
- <code title="delete /v1/agents/{agent_id}">client.agents.<a href="./src/resources/agents/agents.ts">delete</a>(agentID) -> void</code>

## Models

Types:

- <code><a href="./src/resources/agents/models.ts">Model</a></code>

Methods:

- <code title="get /v1/agents/models/{model_id}">client.agents.models.<a href="./src/resources/agents/models.ts">retrieve</a>(modelID) -> Model</code>
- <code title="get /v1/agents/models">client.agents.models.<a href="./src/resources/agents/models.ts">list</a>({ ...params }) -> ModelsCursorIDPage</code>

## Tools

Types:

- <code><a href="./src/resources/agents/tools.ts">Tool</a></code>
- <code><a href="./src/resources/agents/tools.ts">WebhookBodyParam</a></code>
- <code><a href="./src/resources/agents/tools.ts">ToolListResponse</a></code>

Methods:

- <code title="post /v1/agents/tools">client.agents.tools.<a href="./src/resources/agents/tools.ts">create</a>({ ...params }) -> Tool</code>
- <code title="get /v1/agents/tools/{tool_id}">client.agents.tools.<a href="./src/resources/agents/tools.ts">retrieve</a>(toolID, { ...params }) -> Tool</code>
- <code title="patch /v1/agents/tools/{tool_id}">client.agents.tools.<a href="./src/resources/agents/tools.ts">update</a>(toolID, { ...params }) -> Tool</code>
- <code title="get /v1/agents/tools">client.agents.tools.<a href="./src/resources/agents/tools.ts">list</a>({ ...params }) -> ToolListResponse</code>
- <code title="delete /v1/agents/tools/{tool_id}">client.agents.tools.<a href="./src/resources/agents/tools.ts">delete</a>(toolID) -> void</code>

## Versions

Types:

- <code><a href="./src/resources/agents/versions.ts">Version</a></code>

Methods:

- <code title="get /v1/agents/{agent_id}/versions/{version_id}">client.agents.versions.<a href="./src/resources/agents/versions.ts">retrieve</a>(versionID, { ...params }) -> Version</code>
- <code title="get /v1/agents/{agent_id}/versions">client.agents.versions.<a href="./src/resources/agents/versions.ts">list</a>(agentID, { ...params }) -> VersionsCursorIDPage</code>

## Calls

Types:

- <code><a href="./src/resources/agents/calls/calls.ts">AgentCall</a></code>
- <code><a href="./src/resources/agents/calls/calls.ts">AgentTranscript</a></code>
- <code><a href="./src/resources/agents/calls/calls.ts">CallBatch</a></code>
- <code><a href="./src/resources/agents/calls/calls.ts">CallCreateResponse</a></code>
- <code><a href="./src/resources/agents/calls/calls.ts">CallCancelResponse</a></code>
- <code><a href="./src/resources/agents/calls/calls.ts">CallLogsResponse</a></code>

Methods:

- <code title="post /agents/calls">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">create</a>({ ...params }) -> CallCreateResponse</code>
- <code title="get /agents/calls/{call_id}">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">retrieve</a>(callID) -> AgentCall</code>
- <code title="get /agents/calls">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">list</a>({ ...params }) -> AgentCallsCursorIDPage</code>
- <code title="delete /agents/calls/{call_id}">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">delete</a>(callID) -> AgentCall</code>
- <code title="post /agents/calls/{call_id}/cancel">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">cancel</a>(callID) -> CallCancelResponse</code>
- <code title="get /agents/calls/{call_id}/audio">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">downloadAudio</a>(callID) -> void</code>
- <code title="get /agents/calls/{call_id}/logs">client.agents.calls.<a href="./src/resources/agents/calls/calls.ts">logs</a>(callID) -> CallLogsResponse</code>

### Batches

Methods:

- <code title="post /agents/calls/batches">client.agents.calls.batches.<a href="./src/resources/agents/calls/batches.ts">create</a>({ ...params }) -> CallBatch</code>
- <code title="get /agents/calls/batches/{batch_id}">client.agents.calls.batches.<a href="./src/resources/agents/calls/batches.ts">retrieve</a>(batchID) -> CallBatch</code>
- <code title="get /agents/calls/batches">client.agents.calls.batches.<a href="./src/resources/agents/calls/batches.ts">list</a>({ ...params }) -> CallBatchesCursorIDPage</code>
- <code title="post /agents/calls/batches/{batch_id}/cancel">client.agents.calls.batches.<a href="./src/resources/agents/calls/batches.ts">cancel</a>(batchID) -> CallBatch</code>
- <code title="post /agents/calls/batches/{batch_id}/retry">client.agents.calls.batches.<a href="./src/resources/agents/calls/batches.ts">retry</a>(batchID) -> CallBatch</code>

## Metrics

Types:

- <code><a href="./src/resources/agents/metrics/metrics.ts">Metric</a></code>
- <code><a href="./src/resources/agents/metrics/metrics.ts">MetricListResponse</a></code>

Methods:

- <code title="post /agents/metrics">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">create</a>({ ...params }) -> Metric</code>
- <code title="get /agents/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">retrieve</a>(metricID) -> Metric</code>
- <code title="get /agents/metrics">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">list</a>({ ...params }) -> MetricListResponse</code>
- <code title="delete /agents/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">delete</a>(metricID) -> void</code>
- <code title="post /agents/{agent_id}/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">addToAgent</a>(metricID, { ...params }) -> void</code>
- <code title="delete /agents/{agent_id}/metrics/{metric_id}">client.agents.metrics.<a href="./src/resources/agents/metrics/metrics.ts">removeFromAgent</a>(metricID, { ...params }) -> void</code>

### Results

Types:

- <code><a href="./src/resources/agents/metrics/results.ts">ResultListResponse</a></code>
- <code><a href="./src/resources/agents/metrics/results.ts">ResultExportResponse</a></code>

Methods:

- <code title="get /agents/metrics/results">client.agents.metrics.results.<a href="./src/resources/agents/metrics/results.ts">list</a>({ ...params }) -> ResultListResponsesCursorIDPage</code>
- <code title="get /agents/metrics/results/export">client.agents.metrics.results.<a href="./src/resources/agents/metrics/results.ts">export</a>({ ...params }) -> string</code>

## Webhooks

Types:

- <code><a href="./src/resources/agents/webhooks.ts">Webhook</a></code>
- <code><a href="./src/resources/agents/webhooks.ts">WebhookRetrieveResponse</a></code>
- <code><a href="./src/resources/agents/webhooks.ts">WebhookUpdateResponse</a></code>
- <code><a href="./src/resources/agents/webhooks.ts">WebhookListResponse</a></code>
- <code><a href="./src/resources/agents/webhooks.ts">WebhookDeleteResponse</a></code>

Methods:

- <code title="post /agents/webhooks">client.agents.webhooks.<a href="./src/resources/agents/webhooks.ts">create</a>({ ...params }) -> Webhook</code>
- <code title="get /agents/webhooks/{webhook_id}">client.agents.webhooks.<a href="./src/resources/agents/webhooks.ts">retrieve</a>(webhookID) -> WebhookRetrieveResponse</code>
- <code title="patch /agents/webhooks/{webhook_id}">client.agents.webhooks.<a href="./src/resources/agents/webhooks.ts">update</a>(webhookID, { ...params }) -> string</code>
- <code title="get /agents/webhooks">client.agents.webhooks.<a href="./src/resources/agents/webhooks.ts">list</a>({ ...params }) -> WebhookListResponsesCursorIDPage</code>
- <code title="delete /agents/webhooks/{webhook_id}">client.agents.webhooks.<a href="./src/resources/agents/webhooks.ts">delete</a>(webhookID) -> string</code>

## PhoneNumbers

Types:

- <code><a href="./src/resources/agents/phone-numbers/phone-numbers.ts">PhoneNumber</a></code>
- <code><a href="./src/resources/agents/phone-numbers/phone-numbers.ts">PhoneNumberListResponse</a></code>
- <code><a href="./src/resources/agents/phone-numbers/phone-numbers.ts">PhoneNumberProvisionResponse</a></code>

Methods:

- <code title="get /agents/phone-numbers/{id}">client.agents.phoneNumbers.<a href="./src/resources/agents/phone-numbers/phone-numbers.ts">retrieve</a>(id) -> PhoneNumber</code>
- <code title="patch /agents/phone-numbers/{id}">client.agents.phoneNumbers.<a href="./src/resources/agents/phone-numbers/phone-numbers.ts">update</a>(id, { ...params }) -> PhoneNumber</code>
- <code title="get /agents/phone-numbers">client.agents.phoneNumbers.<a href="./src/resources/agents/phone-numbers/phone-numbers.ts">list</a>({ ...params }) -> PhoneNumberListResponse</code>
- <code title="delete /agents/phone-numbers/{id}">client.agents.phoneNumbers.<a href="./src/resources/agents/phone-numbers/phone-numbers.ts">delete</a>(id) -> void</code>
- <code title="post /agents/phone-numbers">client.agents.phoneNumbers.<a href="./src/resources/agents/phone-numbers/phone-numbers.ts">import</a>({ ...params }) -> PhoneNumber</code>
- <code title="post /agents/phone-numbers/provision">client.agents.phoneNumbers.<a href="./src/resources/agents/phone-numbers/phone-numbers.ts">provision</a>({ ...params }) -> PhoneNumberProvisionResponse</code>

### Providers

Types:

- <code><a href="./src/resources/agents/phone-numbers/providers.ts">ProviderCreateResponse</a></code>
- <code><a href="./src/resources/agents/phone-numbers/providers.ts">ProviderRetrieveResponse</a></code>
- <code><a href="./src/resources/agents/phone-numbers/providers.ts">ProviderUpdateResponse</a></code>
- <code><a href="./src/resources/agents/phone-numbers/providers.ts">ProviderListResponse</a></code>

Methods:

- <code title="post /agents/phone-numbers/providers">client.agents.phoneNumbers.providers.<a href="./src/resources/agents/phone-numbers/providers.ts">create</a>({ ...params }) -> ProviderCreateResponse</code>
- <code title="get /agents/phone-numbers/providers/{id}">client.agents.phoneNumbers.providers.<a href="./src/resources/agents/phone-numbers/providers.ts">retrieve</a>(id) -> ProviderRetrieveResponse</code>
- <code title="patch /agents/phone-numbers/providers/{id}">client.agents.phoneNumbers.providers.<a href="./src/resources/agents/phone-numbers/providers.ts">update</a>(id, { ...params }) -> ProviderUpdateResponse</code>
- <code title="get /agents/phone-numbers/providers">client.agents.phoneNumbers.providers.<a href="./src/resources/agents/phone-numbers/providers.ts">list</a>({ ...params }) -> ProviderListResponse</code>
- <code title="delete /agents/phone-numbers/providers/{id}">client.agents.phoneNumbers.providers.<a href="./src/resources/agents/phone-numbers/providers.ts">delete</a>(id) -> void</code>

## KnowledgeBase

### Folders

Types:

- <code><a href="./src/resources/agents/knowledge-base/folders.ts">Folder</a></code>
- <code><a href="./src/resources/agents/knowledge-base/folders.ts">FolderListResponse</a></code>

Methods:

- <code title="post /agents/folders">client.agents.knowledgeBase.folders.<a href="./src/resources/agents/knowledge-base/folders.ts">create</a>({ ...params }) -> Folder</code>
- <code title="get /agents/folders/{id}">client.agents.knowledgeBase.folders.<a href="./src/resources/agents/knowledge-base/folders.ts">retrieve</a>(id) -> Folder</code>
- <code title="patch /agents/folders/{id}">client.agents.knowledgeBase.folders.<a href="./src/resources/agents/knowledge-base/folders.ts">update</a>(id, { ...params }) -> Folder</code>
- <code title="get /agents/folders">client.agents.knowledgeBase.folders.<a href="./src/resources/agents/knowledge-base/folders.ts">list</a>({ ...params }) -> FolderListResponse</code>
- <code title="delete /agents/folders/{id}">client.agents.knowledgeBase.folders.<a href="./src/resources/agents/knowledge-base/folders.ts">delete</a>(id, { ...params }) -> void</code>

### Documents

Types:

- <code><a href="./src/resources/agents/knowledge-base/documents.ts">Document</a></code>
- <code><a href="./src/resources/agents/knowledge-base/documents.ts">DocumentCreateBulkResponse</a></code>

Methods:

- <code title="post /agents/documents">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">create</a>({ ...params }) -> Document</code>
- <code title="get /agents/documents/{document_id}">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">retrieve</a>(documentID) -> Document</code>
- <code title="patch /agents/documents/{document_id}">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">update</a>(documentID, { ...params }) -> Document</code>
- <code title="get /agents/documents">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">list</a>({ ...params }) -> DocumentsCursorIDPage</code>
- <code title="delete /agents/documents/{document_id}">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">delete</a>(documentID, { ...params }) -> void</code>
- <code title="post /agents/documents/bulk">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">createBulk</a>({ ...params }) -> DocumentCreateBulkResponse</code>
- <code title="post /agents/documents/{document_id}/retry">client.agents.knowledgeBase.documents.<a href="./src/resources/agents/knowledge-base/documents.ts">retry</a>(documentID) -> Document</code>

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
- <code><a href="./src/resources/fine-tunes.ts">FineTuneBaseModel</a></code>

Methods:

- <code title="post /fine-tunes/">client.fineTunes.<a href="./src/resources/fine-tunes.ts">create</a>({ ...params }) -> FineTune</code>
- <code title="get /fine-tunes/{id}">client.fineTunes.<a href="./src/resources/fine-tunes.ts">retrieve</a>(id) -> FineTune</code>
- <code title="get /fine-tunes/">client.fineTunes.<a href="./src/resources/fine-tunes.ts">list</a>({ ...params }) -> FineTunesCursorIDPage</code>
- <code title="delete /fine-tunes/{id}">client.fineTunes.<a href="./src/resources/fine-tunes.ts">delete</a>(id) -> void</code>
- <code title="get /fine-tunes/{id}/voices">client.fineTunes.<a href="./src/resources/fine-tunes.ts">listVoices</a>(id, { ...params }) -> VoicesCursorIDPage</code>

# Models

Types:

- <code><a href="./src/resources/models.ts">ListModelsResponse</a></code>
- <code><a href="./src/resources/models.ts">ModelCapability</a></code>
- <code><a href="./src/resources/models.ts">ModelCatalogEntry</a></code>
- <code><a href="./src/resources/models.ts">STTMode</a></code>

Methods:

- <code title="get /models">client.models.<a href="./src/resources/models.ts">list</a>({ ...params }) -> ListModelsResponse</code>

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

# STT

Types:

- <code><a href="./src/resources/stt/stt.ts">STTBatchModel</a></code>
- <code><a href="./src/resources/stt/stt.ts">STTEncoding</a></code>
- <code><a href="./src/resources/stt/stt.ts">STTErrorResponse</a></code>
- <code><a href="./src/resources/stt/stt.ts">STTTranscribeResponse</a></code>

Methods:

- <code title="post /stt">client.stt.<a href="./src/resources/stt/stt.ts">transcribe</a>({ ...params }) -> STTTranscribeResponse</code>

## AutoFinalize

Types:

- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeConnected</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeModel</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeTurnEagerEnd</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeTurnEnd</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeTurnResume</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeTurnStart</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeTurnUpdate</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeWebsocketRequest</a></code>
- <code><a href="./src/resources/stt/auto-finalize.ts">STTAutoFinalizeWebsocketResponse</a></code>

## ManualFinalize

Types:

- <code><a href="./src/resources/stt/manual-finalize.ts">STTManualFinalizeDoneResponse</a></code>
- <code><a href="./src/resources/stt/manual-finalize.ts">STTManualFinalizeFlushDoneResponse</a></code>
- <code><a href="./src/resources/stt/manual-finalize.ts">STTManualFinalizeModel</a></code>
- <code><a href="./src/resources/stt/manual-finalize.ts">STTManualFinalizeTranscriptResponse</a></code>
- <code><a href="./src/resources/stt/manual-finalize.ts">STTManualFinalizeWebsocketRequest</a></code>
- <code><a href="./src/resources/stt/manual-finalize.ts">STTManualFinalizeWebsocketResponse</a></code>

# TTS

Types:

- <code><a href="./src/resources/tts.ts">Emotion</a></code>
- <code><a href="./src/resources/tts.ts">GenerationConfig</a></code>
- <code><a href="./src/resources/tts.ts">GenerationRequest</a></code>
- <code><a href="./src/resources/tts.ts">InfillModel</a></code>
- <code><a href="./src/resources/tts.ts">ModelSpeed</a></code>
- <code><a href="./src/resources/tts.ts">MP3OutputFormat</a></code>
- <code><a href="./src/resources/tts.ts">OutputFormatContainer</a></code>
- <code><a href="./src/resources/tts.ts">RawEncoding</a></code>
- <code><a href="./src/resources/tts.ts">RawOutputFormat</a></code>
- <code><a href="./src/resources/tts.ts">TTSModel</a></code>
- <code><a href="./src/resources/tts.ts">TTSSSEEvent</a></code>
- <code><a href="./src/resources/tts.ts">VoiceSpecifier</a></code>
- <code><a href="./src/resources/tts.ts">WAVOutputFormat</a></code>
- <code><a href="./src/resources/tts.ts">WebsocketClientEvent</a></code>
- <code><a href="./src/resources/tts.ts">WebsocketResponse</a></code>

Methods:

- <code title="post /tts/bytes">client.tts.<a href="./src/resources/tts.ts">generate</a>({ ...params }) -> Response</code>
- <code title="post /tts/sse">client.tts.<a href="./src/resources/tts.ts">generateSSE</a>({ ...params }) -> TTSSSEEvent</code>
- <code title="post /infill/bytes">client.tts.<a href="./src/resources/tts.ts">infill</a>({ ...params }) -> Response</code>

# Watermark

Types:

- <code><a href="./src/resources/watermark.ts">WatermarkDetectResponse</a></code>

Methods:

- <code title="post /v1/watermark/detect">client.watermark.<a href="./src/resources/watermark.ts">detect</a>({ ...params }) -> WatermarkDetectResponse</code>

# Voices

Types:

- <code><a href="./src/resources/voices.ts">Accent</a></code>
- <code><a href="./src/resources/voices.ts">AddVoiceAccentsRequest</a></code>
- <code><a href="./src/resources/voices.ts">AttachVoiceAccent</a></code>
- <code><a href="./src/resources/voices.ts">Gender</a></code>
- <code><a href="./src/resources/voices.ts">GenderPresentation</a></code>
- <code><a href="./src/resources/voices.ts">ListAccentsResponse</a></code>
- <code><a href="./src/resources/voices.ts">LocalizeDialect</a></code>
- <code><a href="./src/resources/voices.ts">LocalizeTargetLanguage</a></code>
- <code><a href="./src/resources/voices.ts">SupportedLanguage</a></code>
- <code><a href="./src/resources/voices.ts">Voice</a></code>
- <code><a href="./src/resources/voices.ts">VoiceAccent</a></code>
- <code><a href="./src/resources/voices.ts">VoiceLocale</a></code>
- <code><a href="./src/resources/voices.ts">VoiceMetadata</a></code>

Methods:

- <code title="patch /voices/{id}">client.voices.<a href="./src/resources/voices.ts">update</a>(id, { ...params }) -> Voice</code>
- <code title="get /voices">client.voices.<a href="./src/resources/voices.ts">list</a>({ ...params }) -> VoicesCursorIDPage</code>
- <code title="delete /voices/{id}">client.voices.<a href="./src/resources/voices.ts">delete</a>(id) -> void</code>
- <code title="patch /voices/{id}/accents">client.voices.<a href="./src/resources/voices.ts">addAccents</a>(id, { ...params }) -> Voice</code>
- <code title="post /voices/clone">client.voices.<a href="./src/resources/voices.ts">clone</a>({ ...params }) -> VoiceMetadata</code>
- <code title="delete /voices/{id}/accents/{accent_id}">client.voices.<a href="./src/resources/voices.ts">deleteAccent</a>(accentID, { ...params }) -> Voice</code>
- <code title="get /voices/{id}">client.voices.<a href="./src/resources/voices.ts">get</a>(id, { ...params }) -> Voice</code>
- <code title="get /accents">client.voices.<a href="./src/resources/voices.ts">listAccents</a>() -> ListAccentsResponse</code>
- <code title="post /voices/localize">client.voices.<a href="./src/resources/voices.ts">localize</a>({ ...params }) -> VoiceMetadata</code>
