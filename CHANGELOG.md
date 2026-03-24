# Changelog

## 3.1.0 (2026-03-24)

Full Changelog: [v3.0.0...v3.1.0](https://github.com/cartesia-ai/cartesia-js/compare/v3.0.0...v3.1.0)

### Features

* **api:** mintlify examples ([67909d1](https://github.com/cartesia-ai/cartesia-js/commit/67909d1a906ba28c035d49d817c3d3cbe9967212))
* **client:** add async iterator and stream() to WebSocket classes ([69e04bc](https://github.com/cartesia-ai/cartesia-js/commit/69e04bcdc5eb80272c3ac1b67a02ab7f83d6b503))


### Bug Fixes

* **client:** preserve URL params already embedded in path ([ba4e064](https://github.com/cartesia-ai/cartesia-js/commit/ba4e0643309bcf87426c1aac1d9402601198b531))
* fix request delays for retrying to be more respectful of high requested delays ([470fefc](https://github.com/cartesia-ai/cartesia-js/commit/470fefc190506fe476d841aaa1cea128274fda8a))


### Chores

* **ci:** skip lint on metadata-only changes ([9c2fc3c](https://github.com/cartesia-ai/cartesia-js/commit/9c2fc3cb85594456ff7f7dd80550977773497dd8))
* **ci:** skip uploading artifacts on stainless-internal branches ([2199c31](https://github.com/cartesia-ai/cartesia-js/commit/2199c319f701c071b7c6bb1bc1099352b23e58c2))
* extract query parameters to string conversion from client ([ab488a0](https://github.com/cartesia-ai/cartesia-js/commit/ab488a0cae5aaa77f79798c612b12216f5da938e))
* **internal:** refactor imports ([af6d526](https://github.com/cartesia-ai/cartesia-js/commit/af6d526d01b521ea7f9ff5c13f6d6205c9bf55b6))
* **internal:** tweak CI branches ([fcda8af](https://github.com/cartesia-ai/cartesia-js/commit/fcda8af3e886463bc67adefb985d792df84b7aec))
* **internal:** update dependencies to address dependabot vulnerabilities ([1ba9f3e](https://github.com/cartesia-ai/cartesia-js/commit/1ba9f3e43b93932e8b27a83c882b312daf3672e4))
* **internal:** update gitignore ([a03b8fb](https://github.com/cartesia-ai/cartesia-js/commit/a03b8fb56afe760c6b11faaa80ff7bd2db6eb6e5))
* match http protocol with ws protocol instead of wss ([ffe03d4](https://github.com/cartesia-ai/cartesia-js/commit/ffe03d40d407911d0dcd1ccbb2cc115873e030f9))
* use proper capitalization for WebSockets ([fcacc25](https://github.com/cartesia-ai/cartesia-js/commit/fcacc2570aba08a305780874298770456067b54f))

## 3.0.0 (2026-03-02)

Full Changelog: [v3.0.0-b17...v3.0.0](https://github.com/cartesia-ai/cartesia-js/compare/v3.0.0-b17...v3.0.0)

### Features

* **api:** add flush_id to chunks response and binary response to voice changer ([1d98580](https://github.com/cartesia-ai/cartesia-js/commit/1d98580ffe61be7a86d28bdf1ee5bb1d50df7382))
* **api:** group infill output_format ([ac4ded7](https://github.com/cartesia-ai/cartesia-js/commit/ac4ded743720fedbc4517c9c94ed75e79bb2f18b))
* **api:** infill output_format ([c3d3dac](https://github.com/cartesia-ai/cartesia-js/commit/c3d3dac2d3756038b2d199a75c204413c23a19d1))
* **api:** infill response ([b9cbaa2](https://github.com/cartesia-ai/cartesia-js/commit/b9cbaa27c220db26462aee7c80692df89edeb8fe))
* **api:** inline websocketresponse type definitions ([c5cbfbf](https://github.com/cartesia-ai/cartesia-js/commit/c5cbfbfeca17b0f799d791a9ba32c8d2fd18cda8))
* **api:** move infill and websocket_connect ([a987ebd](https://github.com/cartesia-ai/cartesia-js/commit/a987ebdddc35712a26bbad443672ee45a78b4afc))
* **api:** update headline example ([715db7e](https://github.com/cartesia-ai/cartesia-js/commit/715db7e02534a0e2254da61fc7342b240e7f251e))


### Bug Fixes

* **client:** avoid memory leak with abort signals ([fb63460](https://github.com/cartesia-ai/cartesia-js/commit/fb63460d3701ac1684f5385f7d882f5e71747f14))
* **client:** avoid removing abort listener too early ([b89ee81](https://github.com/cartesia-ai/cartesia-js/commit/b89ee81caf0ae443eeac9898fb807c34545eb70b))
* **docs/contributing:** correct pnpm link command ([d5830ae](https://github.com/cartesia-ai/cartesia-js/commit/d5830aed6fd927265bfdbbe875aed7093e0f24cc))
* **internal:** skip tests that depend on mock server ([e55b44f](https://github.com/cartesia-ai/cartesia-js/commit/e55b44f8402a4f59f59e4780e06300260c9b8170))


### Chores

* **client:** do not parse responses with empty content-length ([ed0b69e](https://github.com/cartesia-ai/cartesia-js/commit/ed0b69e1c1d6d7854bccfb2d65ef273cc9564d93))
* **client:** restructure abort controller binding ([e969433](https://github.com/cartesia-ai/cartesia-js/commit/e9694332f28915c81908a09bffc1d877befb848f))
* **internal/client:** fix form-urlencoded requests ([80aceb7](https://github.com/cartesia-ai/cartesia-js/commit/80aceb72e17b1c6989e2ea9e53b83d29cdfe766e))
* **internal:** avoid type checking errors with ts-reset ([3eb6f15](https://github.com/cartesia-ai/cartesia-js/commit/3eb6f15cb8faa30ab5b759599a0bf74243851a5b))
* **internal:** fix pagination internals not accepting option promises ([822f34f](https://github.com/cartesia-ai/cartesia-js/commit/822f34fab79bd7274e15fe383798696e9ae3930b))
* **internal:** move stringifyQuery implementation to internal function ([ec23288](https://github.com/cartesia-ai/cartesia-js/commit/ec23288564c1586c22e64581ff4d77763a00a268))
* **internal:** remove mock server code ([2fe0e85](https://github.com/cartesia-ai/cartesia-js/commit/2fe0e85f5884a797b9bbbe80013e30f17f6ca5cb))
* **internal:** upgrade pnpm ([948fa2d](https://github.com/cartesia-ai/cartesia-js/commit/948fa2dbdc13671eda76493bbac27976fb70649b))
* **internal:** upgrade pnpm version ([9cc6aa2](https://github.com/cartesia-ai/cartesia-js/commit/9cc6aa2b033369cea8ade26c92bca06c3f6d4a79))
* update mock server docs ([4f1e1c6](https://github.com/cartesia-ai/cartesia-js/commit/4f1e1c6f34149aa4a65d4d562e32d19f8c247ce9))

## 3.0.0-b17 (2026-01-30)

Full Changelog: [v3.0.0-b16...v3.0.0-b17](https://github.com/cartesia-ai/cartesia-js/compare/v3.0.0-b16...v3.0.0-b17)

### Features

* **api:** update api version ([e98298c](https://github.com/cartesia-ai/cartesia-js/commit/e98298c56b49f1bf1a8e494edfaafd78cc5ebd4c))

## 3.0.0-b16 (2026-01-29)

Full Changelog: [v3.0.0-b15...v3.0.0-b16](https://github.com/cartesia-ai/cartesia-js/compare/v3.0.0-b15...v3.0.0-b16)

### Features

* **api:** add jsr key to npm target ([5afbf2e](https://github.com/cartesia-ai/cartesia-js/commit/5afbf2e0bad2551e2dbaa0be31553f98fdeb9724))
* **api:** update js target ([a39e957](https://github.com/cartesia-ai/cartesia-js/commit/a39e9571aa58fb6e1bbddeb523ce83527293a58b))

## 3.0.0-b15 (2026-01-29)

Full Changelog: [v3.0.0-b14...v3.0.0-b15](https://github.com/cartesia-ai/cartesia-js/compare/v3.0.0-b14...v3.0.0-b15)

### Features

* **api:** add release environment ([501864c](https://github.com/cartesia-ai/cartesia-js/commit/501864ca051ad7197b54bbb8c08039bb883ff4fd))
* **api:** update release environment ([c148860](https://github.com/cartesia-ai/cartesia-js/commit/c148860eea503d0720b08e7d187272625491d918))
* ws context helpers ([d1898fb](https://github.com/cartesia-ai/cartesia-js/commit/d1898fbe768daeb527282a4e7bcc53d4e4f7af51))


### Bug Fixes

* bytes returns arraybuffer ([#26](https://github.com/cartesia-ai/cartesia-js/issues/26)) ([229ea0f](https://github.com/cartesia-ai/cartesia-js/commit/229ea0f08c21d9a5fb56be8fac2a044368a33c34))
* export correct client ([#21](https://github.com/cartesia-ai/cartesia-js/issues/21)) ([e8456dd](https://github.com/cartesia-ai/cartesia-js/commit/e8456dd39a91f55cb27cd038cef0dbcd1b1acf3e))
* include message in `TimeoutError` for `.fernignore` clients. ([#41](https://github.com/cartesia-ai/cartesia-js/issues/41)) ([d50a5b9](https://github.com/cartesia-ai/cartesia-js/commit/d50a5b9a30a3c7001572d60314a6a3bb752ac28f))
* upgrade qs from 6.11.2 to 6.13.0 ([#24](https://github.com/cartesia-ai/cartesia-js/issues/24)) ([fddd4ac](https://github.com/cartesia-ai/cartesia-js/commit/fddd4acef6bd20d3859712b25f8774c6d04c2031))


### Chores

* downgrade emittery for cjs compatiblity ([#23](https://github.com/cartesia-ai/cartesia-js/issues/23)) ([015d941](https://github.com/cartesia-ai/cartesia-js/commit/015d9414cff876e44adf776cecca73bc081c2b48))
* export `WebPlayer` ([#31](https://github.com/cartesia-ai/cartesia-js/issues/31)) ([e31186e](https://github.com/cartesia-ai/cartesia-js/commit/e31186e75fbb22c5a79d82ddea5b160f3dd05e04))
* fix compile ([#64](https://github.com/cartesia-ai/cartesia-js/issues/64)) ([1de7fd0](https://github.com/cartesia-ai/cartesia-js/commit/1de7fd0b7891e54a13a78699516e610886578681))
* **internal:** codegen related update ([e44abc2](https://github.com/cartesia-ai/cartesia-js/commit/e44abc24b5c18735c74f1a9345b6f9d312aad338))
* remove `ci.yml` branch ([#22](https://github.com/cartesia-ai/cartesia-js/issues/22)) ([6d2201a](https://github.com/cartesia-ai/cartesia-js/commit/6d2201a7d13172768b5d17c2e8dc5ebfd3d9bcd2))
* remove fernignore on ArrayBuffer ([#55](https://github.com/cartesia-ai/cartesia-js/issues/55)) ([b10bbc7](https://github.com/cartesia-ai/cartesia-js/commit/b10bbc75335089004b38f4b547d92d789f15275c))
* remove ignored `README.md` ([#56](https://github.com/cartesia-ai/cartesia-js/issues/56)) ([ee6d2dd](https://github.com/cartesia-ai/cartesia-js/commit/ee6d2dd17b0e392189e553affdc411fcde42d5ed))
* remove STT .fernignore ([#65](https://github.com/cartesia-ai/cartesia-js/issues/65)) ([3c0ce3e](https://github.com/cartesia-ai/cartesia-js/commit/3c0ce3e0449166e3e7dc766eeeb90a991e12e401))
* sync repo ([1ad7016](https://github.com/cartesia-ai/cartesia-js/commit/1ad7016dc4222eb858389a0eed7dcd0558713346))
* update `apiKeyHeader` to `apiKey` ([#20](https://github.com/cartesia-ai/cartesia-js/issues/20)) ([0f54d2e](https://github.com/cartesia-ai/cartesia-js/commit/0f54d2ee812cd080c8722a55a157b63a37f885d5))
* update README ([#58](https://github.com/cartesia-ai/cartesia-js/issues/58)) ([c24f0a6](https://github.com/cartesia-ai/cartesia-js/commit/c24f0a6bfb43647723e322215ffc59f3b307b700))
* Update README.md ([#32](https://github.com/cartesia-ai/cartesia-js/issues/32)) ([8d36b88](https://github.com/cartesia-ai/cartesia-js/commit/8d36b88f76a56b470e57d16190f127d915e934e9))
* update SDK settings ([e2be8ea](https://github.com/cartesia-ai/cartesia-js/commit/e2be8ea4b2dbc3891029efa3f40bec512622f78d))

## 3.0.0-b14 (2026-01-23)

Full Changelog: [v3.0.0-b13...v3.0.0-b14](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b13...v3.0.0-b14)

## 3.0.0-b13 (2026-01-21)

Full Changelog: [v3.0.0-b12...v3.0.0-b13](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b12...v3.0.0-b13)

### Features

* **api:** remove -&gt; delete ([04c4d03](https://github.com/cartesia-ai/cartesia-js-internal/commit/04c4d03a3e3525ad0e8c72a6372602319cdedb56))
* wrapper remove -&gt; delete ([e856bda](https://github.com/cartesia-ai/cartesia-js-internal/commit/e856bda9d6bfb07c6df08839087de24380b336be))

## 3.0.0-b12 (2026-01-21)

Full Changelog: [v3.0.0-b11...v3.0.0-b12](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b11...v3.0.0-b12)

### Features

* **api:** delete -&gt; remove ([d51a281](https://github.com/cartesia-ai/cartesia-js-internal/commit/d51a2812bb7e5be98d1aa4248e90acc3a4aae0d2))
* update backcompat voices helpers ([ca4cc6a](https://github.com/cartesia-ai/cartesia-js-internal/commit/ca4cc6a98c2f9165689916e22afd784f56671948))

## 3.0.0-b11 (2026-01-20)

Full Changelog: [v3.0.0-b10...v3.0.0-b11](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b10...v3.0.0-b11)

### Features

* **api:** binary response types ([5bdf3e3](https://github.com/cartesia-ai/cartesia-js-internal/commit/5bdf3e3be2867099b8187c186745a509991df91e))

## 3.0.0-b10 (2026-01-20)

Full Changelog: [v3.0.0-b9...v3.0.0-b10](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b9...v3.0.0-b10)

### Features

* **api:** voice changer response ([5ca129b](https://github.com/cartesia-ai/cartesia-js-internal/commit/5ca129b1dfa59043560c7866a2cdd87fb03b42bf))

## 3.0.0-b9 (2026-01-16)

Full Changelog: [v3.0.0-b8...v3.0.0-b9](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b8...v3.0.0-b9)

### Features

* refine backcompat layer with strict Node stream return types ([0fc86b8](https://github.com/cartesia-ai/cartesia-js-internal/commit/0fc86b840a7b94fa6017aa454225ef6ee3a31d5f))

## 3.0.0-b8 (2026-01-16)

Full Changelog: [v3.0.0-b7...v3.0.0-b8](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b7...v3.0.0-b8)

### Chores

* fix typo in descriptions ([895a99d](https://github.com/cartesia-ai/cartesia-js-internal/commit/895a99d1f9436866184ffa6982635e771cfc16ce))
* **internal:** update `actions/checkout` version ([78c57e2](https://github.com/cartesia-ai/cartesia-js-internal/commit/78c57e297e0a578a04d03e8b1f3dadc3d2c1ce3d))
* **internal:** upgrade babel, qs, js-yaml ([b9f1b07](https://github.com/cartesia-ai/cartesia-js-internal/commit/b9f1b0705e635b7d3e0690886adf89349ffe5597))

## 3.0.0-b7 (2026-01-13)

Full Changelog: [v3.0.0-b6...v3.0.0-b7](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b6...v3.0.0-b7)

## 3.0.0-b6 (2026-01-09)

Full Changelog: [v3.0.0-b5...v3.0.0-b6](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b5...v3.0.0-b6)

## 3.0.0-b5 (2026-01-07)

Full Changelog: [v3.0.0-b4...v3.0.0-b5](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b4...v3.0.0-b5)

### Features

* **api:** fix readme ([91bd83c](https://github.com/cartesia-ai/cartesia-js-internal/commit/91bd83cb75d8b92778928cf7aebab908f7723b79))

## 3.0.0-b4 (2026-01-07)

Full Changelog: [v3.0.0-b3...v3.0.0-b4](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b3...v3.0.0-b4)

### Features

* **api:** fix list/get uri mismatch ([cf74b40](https://github.com/cartesia-ai/cartesia-js-internal/commit/cf74b40daedb940dec1740d8c2c8d63d9a758e33))
* **api:** sync openapi spec ([d4def66](https://github.com/cartesia-ai/cartesia-js-internal/commit/d4def66cab22c20f2433f502b06c05eb622105ad))

## 3.0.0-b3 (2026-01-06)

Full Changelog: [v3.0.0-b2...v3.0.0-b3](https://github.com/cartesia-ai/cartesia-js-internal/compare/v3.0.0-b2...v3.0.0-b3)

### Features

* **api:** add generation_config and generation_request to types export ([55b3d0c](https://github.com/cartesia-ai/cartesia-js-internal/commit/55b3d0ca52fa9b1a63dde5bb3c806708bd1424c7))
* **api:** move connect into tts ([50b07ef](https://github.com/cartesia-ai/cartesia-js-internal/commit/50b07efcba3abf7183ee5fe0061e855eeb39c40e))
* **client:** add support for websockets ([d241a31](https://github.com/cartesia-ai/cartesia-js-internal/commit/d241a3181979a106a00aab920538a880152f9106))


### Bug Fixes

* correct client name ([dd6b170](https://github.com/cartesia-ai/cartesia-js-internal/commit/dd6b170533ba66a9ac7b1fb6bf81a8716c74c264))
* **mcp:** correct code tool API endpoint ([d17b424](https://github.com/cartesia-ai/cartesia-js-internal/commit/d17b424670152b357440ae90a6fe30dd56baf799))
* **mcp:** return correct lines on typescript errors ([3912828](https://github.com/cartesia-ai/cartesia-js-internal/commit/39128283aeaf2aa5a7b5ea03db5e3dfcc3d04e15))


### Chores

* break long lines in snippets into multiline ([124c326](https://github.com/cartesia-ai/cartesia-js-internal/commit/124c326d47d192810aa610dc2a71d7ed8163992d))
* **client:** fix logger property type ([8fec3fb](https://github.com/cartesia-ai/cartesia-js-internal/commit/8fec3fbbcb0f7123b9b13bfaf74e9c03579ef2cf))
* **internal:** codegen related update ([4cbab21](https://github.com/cartesia-ai/cartesia-js-internal/commit/4cbab218f2a5f82eac61aee26c8b51cdabd343a1))
* **internal:** codegen related update ([80c80ee](https://github.com/cartesia-ai/cartesia-js-internal/commit/80c80ee6e3cefc3c027769e24129d90c40eda894))
* **internal:** codegen related update ([d70b514](https://github.com/cartesia-ai/cartesia-js-internal/commit/d70b5149a5fcead62befde97799ee4f73530f19a))
* **internal:** upgrade eslint ([b5ec6d3](https://github.com/cartesia-ai/cartesia-js-internal/commit/b5ec6d37f1cb738c287c8bc69b98514662a2f6ce))


### Documentation

* prominently feature MCP server setup in root SDK readmes ([e432267](https://github.com/cartesia-ai/cartesia-js-internal/commit/e432267d940ea2dec986465ad77872fc67784751))

## 3.0.0-b2 (2025-11-26)

Full Changelog: [v0.0.1...v3.0.0-b2](https://github.com/cartesia-ai/cartesia-js-internal/compare/v0.0.1...v3.0.0-b2)

### Features

* **api:** ws allOf updates ([13201f8](https://github.com/cartesia-ai/cartesia-js-internal/commit/13201f873fc0245c6fed160975907de80f332b2e))


### Bug Fixes

* bytes returns arraybuffer ([#26](https://github.com/cartesia-ai/cartesia-js-internal/issues/26)) ([229ea0f](https://github.com/cartesia-ai/cartesia-js-internal/commit/229ea0f08c21d9a5fb56be8fac2a044368a33c34))
* export correct client ([#21](https://github.com/cartesia-ai/cartesia-js-internal/issues/21)) ([e8456dd](https://github.com/cartesia-ai/cartesia-js-internal/commit/e8456dd39a91f55cb27cd038cef0dbcd1b1acf3e))
* include message in `TimeoutError` for `.fernignore` clients. ([#41](https://github.com/cartesia-ai/cartesia-js-internal/issues/41)) ([d50a5b9](https://github.com/cartesia-ai/cartesia-js-internal/commit/d50a5b9a30a3c7001572d60314a6a3bb752ac28f))
* upgrade qs from 6.11.2 to 6.13.0 ([#24](https://github.com/cartesia-ai/cartesia-js-internal/issues/24)) ([fddd4ac](https://github.com/cartesia-ai/cartesia-js-internal/commit/fddd4acef6bd20d3859712b25f8774c6d04c2031))


### Chores

* downgrade emittery for cjs compatiblity ([#23](https://github.com/cartesia-ai/cartesia-js-internal/issues/23)) ([015d941](https://github.com/cartesia-ai/cartesia-js-internal/commit/015d9414cff876e44adf776cecca73bc081c2b48))
* export `WebPlayer` ([#31](https://github.com/cartesia-ai/cartesia-js-internal/issues/31)) ([e31186e](https://github.com/cartesia-ai/cartesia-js-internal/commit/e31186e75fbb22c5a79d82ddea5b160f3dd05e04))
* remove `ci.yml` branch ([#22](https://github.com/cartesia-ai/cartesia-js-internal/issues/22)) ([6d2201a](https://github.com/cartesia-ai/cartesia-js-internal/commit/6d2201a7d13172768b5d17c2e8dc5ebfd3d9bcd2))
* sync repo ([8cb58ff](https://github.com/cartesia-ai/cartesia-js-internal/commit/8cb58ffa568f67697748f9ea50ce28bd7119d517))
* update `apiKeyHeader` to `apiKey` ([#20](https://github.com/cartesia-ai/cartesia-js-internal/issues/20)) ([0f54d2e](https://github.com/cartesia-ai/cartesia-js-internal/commit/0f54d2ee812cd080c8722a55a157b63a37f885d5))
* Update README.md ([#32](https://github.com/cartesia-ai/cartesia-js-internal/issues/32)) ([8d36b88](https://github.com/cartesia-ai/cartesia-js-internal/commit/8d36b88f76a56b470e57d16190f127d915e934e9))
* update SDK settings ([958847f](https://github.com/cartesia-ai/cartesia-js-internal/commit/958847f762544bb6b592f29d583ab7a2c1f609c9))
* update SDK settings ([8b43493](https://github.com/cartesia-ai/cartesia-js-internal/commit/8b434934e6ec6288d973b5caa7c4c1e3fa3639a7))
