# Changelog

## 3.3.1 (2026-07-15)

Full Changelog: [v3.3.0...v3.3.1](https://github.com/cartesia-ai/cartesia-js/compare/v3.3.0...v3.3.1)

### Bug Fixes

* **ci:** add environment to workflows ([2b1eb5a](https://github.com/cartesia-ai/cartesia-js/commit/2b1eb5aa093372c7e426c6732baa0982be854095))


### Chores

* **ci:** format workflow files ([86fcda7](https://github.com/cartesia-ai/cartesia-js/commit/86fcda7ef52d90da7c7844ec98b88a2ddde2d8ec))
* **deps:** bump actions/setup-node from 3.9.1 to 6.4.0 ([6e0fea1](https://github.com/cartesia-ai/cartesia-js/commit/6e0fea1d56d7f15fa444f0cece847797f321490c))
* **deps:** bump actions/setup-node from 6.4.0 to 7.0.0 ([1965bd0](https://github.com/cartesia-ai/cartesia-js/commit/1965bd076c6b33f0c4272991383ebf3cd8543f63))

## 3.3.0 (2026-06-29)

Full Changelog: [v3.2.0...v3.3.0](https://github.com/cartesia-ai/cartesia-js/compare/v3.2.0...v3.3.0)

### Features

* stamp client identity on REST and WebSocket handshakes ([#106](https://github.com/cartesia-ai/cartesia-js/issues/106)) ([37a5751](https://github.com/cartesia-ai/cartesia-js/commit/37a575189ec01ab5e6d2f7e98567274e89cdbd95))


### Bug Fixes

* **client:** send content-type header for requests with an omitted optional body ([a999a05](https://github.com/cartesia-ai/cartesia-js/commit/a999a054858033f1359f70d0e8035ed422ee07dd))


### Chores

* **deps:** bump actions/checkout from 6.0.2 to 7.0.0 ([#104](https://github.com/cartesia-ai/cartesia-js/issues/104)) ([0f5ce6e](https://github.com/cartesia-ai/cartesia-js/commit/0f5ce6ed436c66213d4d81d9e392b2fe5d0c11ea))
* **deps:** bump pnpm/action-setup from 6.0.8 to 6.0.9 ([#102](https://github.com/cartesia-ai/cartesia-js/issues/102)) ([bd389c0](https://github.com/cartesia-ai/cartesia-js/commit/bd389c0b595c783333914df10d49d09b93ef5f86))

## 3.2.0 (2026-05-28)

Full Changelog: [v3.2.0-b2...v3.2.0](https://github.com/cartesia-ai/cartesia-js/compare/v3.2.0-b2...v3.2.0)

### Bug Fixes

* **backcompat:** correct error message when stream is unavailable ([4ef1f1f](https://github.com/cartesia-ai/cartesia-js/commit/4ef1f1fe664f49db13dccc53979114b2485b4281))
* **backcompat:** throw a useful error when CartesiaClient.tts.websocket is used in the browser ([8276cd2](https://github.com/cartesia-ai/cartesia-js/commit/8276cd215913bf713a2cf32eef6a65dd44045447))
* **browsers:** make stream optional ([7c4d86f](https://github.com/cartesia-ai/cartesia-js/commit/7c4d86f4162cae6b20e94ea5b775ad834b72789b))
* **stt:** correct transcribe params ([ae6293f](https://github.com/cartesia-ai/cartesia-js/commit/ae6293ff4bbb975419dab12a767636cfb86f9a33))


### Documentation

* **backcompat:** do not assume require error is due to being in a browser ([dec4c7b](https://github.com/cartesia-ai/cartesia-js/commit/dec4c7b2d7b210061037499fd88041a559671b28))
* **stt:** improve examples ([6944c10](https://github.com/cartesia-ai/cartesia-js/commit/6944c10c2bada6f887dc4a9267db008b14115edc))
* update contributing.md with publish-npm-trusted.yml ([0bea5d0](https://github.com/cartesia-ai/cartesia-js/commit/0bea5d0ef6bd3babb6cf02ad2369f7e031ec4263))


### Refactors

* **stt:** fix errors from refactor ([3eb0b03](https://github.com/cartesia-ai/cartesia-js/commit/3eb0b0358f17263b0fdec4282b420a27de2dae0b))
* **stt:** rename external vad to manual finalize ([5a9b35c](https://github.com/cartesia-ai/cartesia-js/commit/5a9b35c10502ac25ddc91d3ce8cf8d242d9e55e1))

## 3.2.0-b2 (2026-05-25)

Full Changelog: [v3.2.0-b1...v3.2.0-b2](https://github.com/cartesia-ai/cartesia-js/compare/v3.2.0-b1...v3.2.0-b2)

### Bug Fixes

* **browsers:** check if ws.WebSocket is undefined for browser compatibility ([b04cbbc](https://github.com/cartesia-ai/cartesia-js/commit/b04cbbc9e5af4f9568f674a9b15c2d68130021d1))

## 3.2.0-b1 (2026-05-25)

Full Changelog: [v3.1.0...v3.2.0-b1](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0...v3.2.0-b1)

### Features

* **api:** add realtime stt and model enums ([f07d77f](https://github.com/cartesia-ai/cartesia-js/commit/f07d77fdc8eb116f2665b79ea51c359d5821bf91))
* **stt:** add websocket methods ([25b0bd5](https://github.com/cartesia-ai/cartesia-js/commit/25b0bd5437ffba62790228327528f028f5c00dc8))
* **stt:** support browser websockets ([b01f743](https://github.com/cartesia-ai/cartesia-js/commit/b01f74303c35eadebabe6c208fc796bd940d00a2))
* **tts:** export each output format type ([351d890](https://github.com/cartesia-ai/cartesia-js/commit/351d890d63d7c051859fd1773170742c33898ae0))


### Bug Fixes

* **api:** keep accepting any string in model types ([90d1acc](https://github.com/cartesia-ai/cartesia-js/commit/90d1acc216476aa10c2b3ec791d50eb449c110bf))
* **browsers:** make ws optional ([ff2978e](https://github.com/cartesia-ai/cartesia-js/commit/ff2978e4770837084d2df6803d09659737a4e4ea))
* **stt:** accept any string value for external vad model ([04a4a64](https://github.com/cartesia-ai/cartesia-js/commit/04a4a64a1c8a7137ca94adde99645bc4274f9677))
* **stt:** do not json stringify external vad commands ([ff8ac41](https://github.com/cartesia-ai/cartesia-js/commit/ff8ac418bd87c51f9d0221f65d2f2fc75f202911))
* **ws:** lowercase headers from options to override properly ([8f9880e](https://github.com/cartesia-ai/cartesia-js/commit/8f9880eea35f6b612fc18d165482a429c8c74f95))


### Documentation

* **api:** improve formatting and grammar ([4923359](https://github.com/cartesia-ai/cartesia-js/commit/4923359255e63783bb4bc9e6c05099f0332e42a8))
* **readme:** change examples to use sonic-latest ([a2302c8](https://github.com/cartesia-ai/cartesia-js/commit/a2302c89a976112ee5b4fa34ff0abfd45cad1d8f))
* **stt:** add stt websocket examples ([6363dea](https://github.com/cartesia-ai/cartesia-js/commit/6363dea891da7804e43c424b49dac8e0497b9312))


### Refactors

* **ws:** change comments and remove extra comma ([61359e8](https://github.com/cartesia-ai/cartesia-js/commit/61359e8c1b4cdae8926493720b4b609f36ba37eb))

## 3.1.0 (2026-05-23)

Full Changelog: [v3.1.0...v3.1.0](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0...v3.1.0)

## 3.1.0 (2026-05-22)

Full Changelog: [v3.1.0-b8...v3.1.0](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b8...v3.1.0)

### Bug Fixes

* **typescript:** upgrade tsc-multi so that it works with Node 26 ([39808c9](https://github.com/cartesia-ai/cartesia-js/commit/39808c93ffee6df7f064d157fa44879816ab4d2c))


### Chores

* **tests:** remove redundant File import ([ec6d436](https://github.com/cartesia-ai/cartesia-js/commit/ec6d4362dd0bf77a8d23d61949960f7faa1f32e2))


### Documentation

* **api:** fix doc links ([b103fdd](https://github.com/cartesia-ai/cartesia-js/commit/b103fdde6a3968615d97c4c35b7d2f41b09a8f15))

## 3.1.0-b8 (2026-05-18)

Full Changelog: [v3.1.0-b7...v3.1.0-b8](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b7...v3.1.0-b8)

### Features

* **api:** add next_page to all paginated endpoints ([9eef45c](https://github.com/cartesia-ai/cartesia-js/commit/9eef45c2dc53f32c91853639b616b6250ad31d80))


### Bug Fixes

* **api:** undo next_page deprecation ([7a04967](https://github.com/cartesia-ai/cartesia-js/commit/7a04967236f85babf90065ee01fbe1c00825fa1e))


### Documentation

* **metrics:** remove comment about next page function ([2248c1f](https://github.com/cartesia-ai/cartesia-js/commit/2248c1fd4b7449e5f45c5997f6eaf15f2d987912))

## 3.1.0-b7 (2026-05-18)

Full Changelog: [v3.1.0-b6...v3.1.0-b7](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b6...v3.1.0-b7)

### Features

* **api:** deprecate next_page ([367ce0a](https://github.com/cartesia-ai/cartesia-js/commit/367ce0a4ee765bc8e7c08b662785062bfe4629d5))
* **voices:** add voice country ([cdb80f8](https://github.com/cartesia-ai/cartesia-js/commit/cdb80f84dea357fcb3756872f961cc910353c4db))


### Bug Fixes

* **tts:** wav output format type ([083d9ec](https://github.com/cartesia-ai/cartesia-js/commit/083d9ec6fcd47cead669bcf4c2d4bae1694b5a91))

## 3.1.0-b6 (2026-05-15)

Full Changelog: [v3.1.0-b5...v3.1.0-b6](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b5...v3.1.0-b6)

### Documentation

* **tts:** change default model to sonic-latest ([1e1d3cc](https://github.com/cartesia-ai/cartesia-js/commit/1e1d3ccf59dcf60b3e98691e8f60557a52ba2528))

## 3.1.0-b5 (2026-05-15)

Full Changelog: [v3.1.0-b4...v3.1.0-b5](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b4...v3.1.0-b5)

### Bug Fixes

* make ws optional and fix examples ([4c378a6](https://github.com/cartesia-ai/cartesia-js/commit/4c378a60f5b286f512691f6b15749a274b5fc676))
* **voices:** correct required properties ([04ed6c3](https://github.com/cartesia-ai/cartesia-js/commit/04ed6c35a6c8d01f4c04c0ec35808b1030632516))

## 3.1.0-b4 (2026-05-14)

Full Changelog: [v3.1.0-b3...v3.1.0-b4](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b3...v3.1.0-b4)

### Bug Fixes

* address newly introduced bugs ([dbe4fb8](https://github.com/cartesia-ai/cartesia-js/commit/dbe4fb8fa838484d830991667bd67aa61a56421c))
* **examples:** change examples to use tts.websocket ([5d2bf96](https://github.com/cartesia-ai/cartesia-js/commit/5d2bf9646afc10df5c3f71ce62da2a2fac50609b))
* **tts:** add container to RawOutputFormat type ([0aa1c06](https://github.com/cartesia-ai/cartesia-js/commit/0aa1c06dabe8e54ff2f33721286887fdf7d930fa))
* **tts:** change generation request to accept the common raw output format type ([40c3e41](https://github.com/cartesia-ai/cartesia-js/commit/40c3e41456932140167b6e383d0cb72c248f6b9c))
* **tts:** make tts ws backward compatible ([16bdcd4](https://github.com/cartesia-ai/cartesia-js/commit/16bdcd470f0ba05ffbc8ce93ae2f93764a3e7980))
* **tts:** make ws 3.0 return decoded audio in chunk messages ([532ab62](https://github.com/cartesia-ai/cartesia-js/commit/532ab628fbeaf5ffeda7698986040965699cf367))
* **tts:** remove generate_ws method ([fedb0eb](https://github.com/cartesia-ai/cartesia-js/commit/fedb0ebb5ef8004ef22e838ec258b1e36b8dc55b))
* **tts:** rollback default cartesia version to support voice embedding ([3811a0b](https://github.com/cartesia-ai/cartesia-js/commit/3811a0b396772324b649ef24e72a707525b1a8f8))
* **tts:** rollback to cartesia version 2025-11-04 to support voice embedding ([34b2b84](https://github.com/cartesia-ai/cartesia-js/commit/34b2b84eb888976d6216494007fcfa439fea9c0e))


### Chores

* redact api-key headers in debug logs ([8984a27](https://github.com/cartesia-ai/cartesia-js/commit/8984a274823d8265b5b57011ca3ad28d8ff1b031))


### Documentation

* change example comment to use pnpm to run ([45f9de7](https://github.com/cartesia-ai/cartesia-js/commit/45f9de789adcb5b7059bcc17454fa5d24fddc4bb))
* change migrating back to using tts.websocket() ([eb9f384](https://github.com/cartesia-ai/cartesia-js/commit/eb9f38432a71c05e56f95599877269890fe2d674))


### Styles

* **tts:** remove extra newline ([b96ffec](https://github.com/cartesia-ai/cartesia-js/commit/b96ffecd5ca0160c50e794fb99120b6d46ce5ed9))


### Refactors

* **tts:** remove uplicate base64 decode function ([37ce313](https://github.com/cartesia-ai/cartesia-js/commit/37ce31341daf818bd426f7e112f27911701c8c7d))

## 3.1.0-b3 (2026-05-05)

Full Changelog: [v3.1.0-b2...v3.1.0-b3](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b2...v3.1.0-b3)

### Features

* **tts:** accept null and undefined args for websockets ([73e066b](https://github.com/cartesia-ai/cartesia-js/commit/73e066b600fd39cbc8d8bb6f25b931c29c2971a3))


### Documentation

* **tts:** import type for link comment ([d9991f4](https://github.com/cartesia-ai/cartesia-js/commit/d9991f454185e8e578d8bda46813c79ec2477759))


### Styles

* **tts:** remove interface suffix ([5d4d801](https://github.com/cartesia-ai/cartesia-js/commit/5d4d801915cd2f5cc33eec8cbf3d3daa3c23d720))


### Refactors

* **backcompat:** prefix internal exports with back compat ([079761f](https://github.com/cartesia-ai/cartesia-js/commit/079761ffcedb7318655e6aef32b86f4b7e587e03))
* **tts:** move internals to lib/internal ([1c5bf69](https://github.com/cartesia-ai/cartesia-js/commit/1c5bf69d910cf6e9a509f041a5a3443606875a56))

## 3.1.0-b2 (2026-05-01)

Full Changelog: [v3.1.0-b1...v3.1.0-b2](https://github.com/cartesia-ai/cartesia-js/compare/v3.1.0-b1...v3.1.0-b2)

### Bug Fixes

* **stt:** make stt an initialism ([ab322a0](https://github.com/cartesia-ai/cartesia-js/commit/ab322a0ca94d0826f92653aa7d170ba97fd6cd2a))


### Chores

* **manual:** export cleanup ([9d8ba10](https://github.com/cartesia-ai/cartesia-js/commit/9d8ba109579ae07f941216f0ef7c6c66dcab336d))
* **tts:** rename context manager to contexts ws ([a701f47](https://github.com/cartesia-ai/cartesia-js/commit/a701f47482b6933e0f71c915f9e65f4c556daddf))
* **tts:** rename deprecated variables ([09d9a9a](https://github.com/cartesia-ai/cartesia-js/commit/09d9a9ae6e506a1151a3a0ccc563270a5b0c9486))


### Documentation

* **tts:** cleanup old context manager names ([56cb088](https://github.com/cartesia-ai/cartesia-js/commit/56cb08811c1d6105c230865da6878eda9e61fdfe))


### Refactors

* **tts:** add parameters to contextsWS ([29136d0](https://github.com/cartesia-ai/cartesia-js/commit/29136d0d7b93e90db7f8f98eb38c5cc86f871a94))
* **tts:** remove confusing TTSWS_3_0_0 exports ([5aab791](https://github.com/cartesia-ai/cartesia-js/commit/5aab7914e343f309f5e11696e21cd66bcbf975e8))

## 3.1.0-b1 (2026-05-01)

Full Changelog: [v3.0.0...v3.1.0-b1](https://github.com/cartesia-ai/cartesia-js/compare/v3.0.0...v3.1.0-b1)

### Features

* **api:** backward compatible schemas ([e25007b](https://github.com/cartesia-ai/cartesia-js/commit/e25007b8853f0f508a8576a4c0370b2667c5f921))
* **api:** improve sse support ([b21e69b](https://github.com/cartesia-ai/cartesia-js/commit/b21e69b2e5c1096181afec1a99cae31d3f37d357))
* **api:** mintlify examples ([67909d1](https://github.com/cartesia-ai/cartesia-js/commit/67909d1a906ba28c035d49d817c3d3cbe9967212))
* **client:** add async iterator and stream() to WebSocket classes ([69e04bc](https://github.com/cartesia-ai/cartesia-js/commit/69e04bcdc5eb80272c3ac1b67a02ab7f83d6b503))
* **client:** add support for binary messages ([17aea00](https://github.com/cartesia-ai/cartesia-js/commit/17aea00f8a3f82c1b5bb1005d5949fe9fa0b4058))
* **client:** add support for binary messages ([add82ff](https://github.com/cartesia-ai/cartesia-js/commit/add82ff267eeee7e04d1b93cd509ab4df2682a0f))
* **client:** add support for path parameters in websockets clients ([205dfad](https://github.com/cartesia-ai/cartesia-js/commit/205dfad087ee0d5c191d71f5cbd620497ce63517))
* **client:** add support for queuing messages when waiting for a connection ([a0236fa](https://github.com/cartesia-ai/cartesia-js/commit/a0236fae668f256897428d6b48a77d2c2371ff80))
* **client:** add support for WebSockets in the browser when using simple auth ([8b14242](https://github.com/cartesia-ai/cartesia-js/commit/8b1424259c55c18e6ba3243f579a8eaa358fb552))
* **client:** add support for WebSockets in the browser when using simple auth ([964bf46](https://github.com/cartesia-ai/cartesia-js/commit/964bf460c824e615131b629f56a48c716e38ade9))
* **client:** support automatic reconnection for websockets ([2c2f038](https://github.com/cartesia-ai/cartesia-js/commit/2c2f03880309f5e3715e660252ae5d2e7e156508))
* More TTS WebSocket reconnect and context tests ([7687198](https://github.com/cartesia-ai/cartesia-js/commit/7687198dd302e35f0b8c0c0388a045977518495f))
* support setting headers via env ([9d5e7a5](https://github.com/cartesia-ai/cartesia-js/commit/9d5e7a5579d16457b33bf87aa06e8e8f9e9f59ae))
* **tts:** generateWS ([107a205](https://github.com/cartesia-ai/cartesia-js/commit/107a20532c0196a6c0422c903249521420f4903d))
* **tts:** TTS WebSocket Context Manager ([437b34e](https://github.com/cartesia-ai/cartesia-js/commit/437b34e3d318112463563628f03213bdb603ac93))
* **typescript:** expose underlying WebSocket type ([3a5c077](https://github.com/cartesia-ai/cartesia-js/commit/3a5c077beb1cd3da5242a339b4b44ab86af87b06))


### Bug Fixes

* **api:** make backward compatible ([6a57474](https://github.com/cartesia-ai/cartesia-js/commit/6a574742ae835f6b7c59fc82fbfeb0ede2ce7a4c))
* **api:** make backward compatible ([62e017b](https://github.com/cartesia-ai/cartesia-js/commit/62e017b234cc8cd300c7a7a897aca1ff1ef610e7))
* **api:** make backward compatible ([de86352](https://github.com/cartesia-ai/cartesia-js/commit/de86352180c94e967e3d4745bb3d7af4dd7f280b))
* **api:** make backward compatible ([571680d](https://github.com/cartesia-ai/cartesia-js/commit/571680d8abdda0b6bacb668f2b2501f36c262109))
* **api:** WebSocket Error Response should have fewer required properties ([5d41ca2](https://github.com/cartesia-ai/cartesia-js/commit/5d41ca22e5c9cefe650cbf9829d30902f254b0e9))
* **client:** allow single messages greater than the size of the websockets queue ([e51f0b3](https://github.com/cartesia-ai/cartesia-js/commit/e51f0b3aad4b6d389b7d85365c9840ef453234d5))
* **client:** preserve URL params already embedded in path ([ba4e064](https://github.com/cartesia-ai/cartesia-js/commit/ba4e0643309bcf87426c1aac1d9402601198b531))
* fix request delays for retrying to be more respectful of high requested delays ([470fefc](https://github.com/cartesia-ai/cartesia-js/commit/470fefc190506fe476d841aaa1cea128274fda8a))
* Remove beta tag and fix types ([d81a218](https://github.com/cartesia-ai/cartesia-js/commit/d81a2185781ed957930bb8a88bf1fc89bbd10d61))
* Resolve TTS WebSocket semantics between custom and generated code ([68c74e3](https://github.com/cartesia-ai/cartesia-js/commit/68c74e3d0492a3ff6a661ee2052460fd61c5509e))
* **tts:** Allow arbitrary params in context push ([1f32a73](https://github.com/cartesia-ai/cartesia-js/commit/1f32a7358a34ecc77581a54fa634e0156bb7398d))
* **tts:** client.tts.websocket closes to prevent reconnect on error ([16867c9](https://github.com/cartesia-ai/cartesia-js/commit/16867c94cdb090a41b767b70756adb7933caefe6))
* **tts:** context-manager ([09e971c](https://github.com/cartesia-ai/cartesia-js/commit/09e971cea371a0bd04cfae048102c2ea2817618c))
* **tts:** Do not hide reconnects from consumers ([a38b983](https://github.com/cartesia-ai/cartesia-js/commit/a38b9831d7b696f65f46e19f196e4a5efe0b2d2f))
* **tts:** docstrings missing imports ([f212da7](https://github.com/cartesia-ai/cartesia-js/commit/f212da78ffd4bffeabf6ff6f9684aa95ce703574))
* **tts:** duplicate properties in context-manager ([d043888](https://github.com/cartesia-ai/cartesia-js/commit/d04388836fdf63c48799a2910612a04677bbb6fa))
* **tts:** Fix type errors ([55bb50f](https://github.com/cartesia-ai/cartesia-js/commit/55bb50fe67c59cbe7682713cff69c690a0b536a2))
* **tts:** Make errors more useful ([5b8516b](https://github.com/cartesia-ai/cartesia-js/commit/5b8516bcfa224b504e8549b707d8294e80cb96a3))
* **tts:** Move more generation params to context params ([c063469](https://github.com/cartesia-ai/cartesia-js/commit/c063469b1a43ab56a2ecc988841ca78da0da98a4))
* **tts:** remove innacurate docstring ([cf58862](https://github.com/cartesia-ai/cartesia-js/commit/cf5886228dcaa1d5d6bb9760959392a131eef918))
* **tts:** Remove unnecessary type casts ([af1b3a5](https://github.com/cartesia-ai/cartesia-js/commit/af1b3a52b5f4d0e20dfb3da75265b58ddb2576ce))
* **tts:** test ([b277a7a](https://github.com/cartesia-ai/cartesia-js/commit/b277a7a28f54ef28b9a1d29d3da67f92b3a4ca9f))
* **tts:** TTS Context Manager tests and fixes ([41f094e](https://github.com/cartesia-ai/cartesia-js/commit/41f094ea915082169e5f6b9d950787cbcf78c705))
* **tts:** TTS WS Context code updated with context_id being required ([c6652bf](https://github.com/cartesia-ai/cartesia-js/commit/c6652bf00e2bed0c32185405168c3ddacc8c78d2))
* **tts:** TTSContext.isClosed updates immidiately ([4d59353](https://github.com/cartesia-ai/cartesia-js/commit/4d593530492cb086644da58c1b09c45c9370e670))
* **tts:** TTWS backward compatibility for send ([363708f](https://github.com/cartesia-ai/cartesia-js/commit/363708f106b91cad296b63d96511f40b8fe16609))
* **tts:** WebsocketResponse.Error ([735c9c5](https://github.com/cartesia-ai/cartesia-js/commit/735c9c5164c634fd9c9c02e7aa2fc4ba29401d0a))
* **tts:** WebsocketResponse.Error ([49400bd](https://github.com/cartesia-ai/cartesia-js/commit/49400bd7b1af00f385f0728d2229536bfe63561b))
* **voices:** add back SupportedLanguage any string type ([9a4cf3b](https://github.com/cartesia-ai/cartesia-js/commit/9a4cf3b0b886c1608f395e77c096bdf3e5d77373))
* ws-routing.test.ts failed due to missing buildURL ([b227fd0](https://github.com/cartesia-ai/cartesia-js/commit/b227fd04bec34faab0baa74d1f99fe85b1011a72))
* ws-routing.test.ts improper emit ([3ab3193](https://github.com/cartesia-ai/cartesia-js/commit/3ab3193b23a217fa69429170c59610f0bdbe7f64))


### Chores

* **api:** migrate to cartesia-version 2026-03-01 ([d998f4a](https://github.com/cartesia-ai/cartesia-js/commit/d998f4a4e64c63e03e6bc031d9106dc2f3e6b3f9))
* **backcompat:** Nest backcompat under src/lib ([5678a8e](https://github.com/cartesia-ai/cartesia-js/commit/5678a8e002c4b625c80abee4aad185edd12ad7f6))
* **ci:** remove release-doctor workflow ([daa29ad](https://github.com/cartesia-ai/cartesia-js/commit/daa29ad6dff83f2b958c8926b3a03d0601587621))
* **ci:** skip lint on metadata-only changes ([9c2fc3c](https://github.com/cartesia-ai/cartesia-js/commit/9c2fc3cb85594456ff7f7dd80550977773497dd8))
* **ci:** skip uploading artifacts on stainless-internal branches ([2199c31](https://github.com/cartesia-ai/cartesia-js/commit/2199c319f701c071b7c6bb1bc1099352b23e58c2))
* extract query parameters to string conversion from client ([ab488a0](https://github.com/cartesia-ai/cartesia-js/commit/ab488a0cae5aaa77f79798c612b12216f5da938e))
* Fix build ([cbd7cdc](https://github.com/cartesia-ai/cartesia-js/commit/cbd7cdc127c86cd33c146a27d5a8fc80f2d56260))
* Fix lint errors ([7271c37](https://github.com/cartesia-ai/cartesia-js/commit/7271c375f2e77147dca3fda2e687b8c61b0670fa))
* **format:** run eslint and prettier separately ([7374827](https://github.com/cartesia-ai/cartesia-js/commit/7374827bc91bcee42a4245a75b24c874d7fbffcc))
* **formatter:** run prettier and eslint separately ([ceb1703](https://github.com/cartesia-ai/cartesia-js/commit/ceb170372205721f795fe51bce339c9ecb68c35b))
* **internal:** codegen related update ([4c4239c](https://github.com/cartesia-ai/cartesia-js/commit/4c4239c1c47a5bd28aba6449bd4eec391c01f7a5))
* **internal:** codegen related update ([181f6eb](https://github.com/cartesia-ai/cartesia-js/commit/181f6eb2dfe52b60bc3151375ba1f90d621647f7))
* **internal:** force build ([5626823](https://github.com/cartesia-ai/cartesia-js/commit/5626823a22727cb72b8ca2e3323f89024bf4d46c))
* **internal:** more robust bootstrap script ([9309a5b](https://github.com/cartesia-ai/cartesia-js/commit/9309a5b2ba4575dd3299a120841a1c330241d809))
* **internal:** refactor imports ([af6d526](https://github.com/cartesia-ai/cartesia-js/commit/af6d526d01b521ea7f9ff5c13f6d6205c9bf55b6))
* **internal:** tweak CI branches ([fcda8af](https://github.com/cartesia-ai/cartesia-js/commit/fcda8af3e886463bc67adefb985d792df84b7aec))
* **internal:** update dependencies to address dependabot vulnerabilities ([1ba9f3e](https://github.com/cartesia-ai/cartesia-js/commit/1ba9f3e43b93932e8b27a83c882b312daf3672e4))
* **internal:** update gitignore ([a03b8fb](https://github.com/cartesia-ai/cartesia-js/commit/a03b8fb56afe760c6b11faaa80ff7bd2db6eb6e5))
* match http protocol with ws protocol instead of wss ([ffe03d4](https://github.com/cartesia-ai/cartesia-js/commit/ffe03d40d407911d0dcd1ccbb2cc115873e030f9))
* Remove duplicated WebSocket code ([d3ab62d](https://github.com/cartesia-ai/cartesia-js/commit/d3ab62d25298e3abec8209fd8d76b3e1610a2cbd))
* **tts:** add more descriptions ([802b446](https://github.com/cartesia-ai/cartesia-js/commit/802b4468445c0cbd2ac927479d1eadff785fd460))
* **tts:** change ws 3.0.0 to import buildURL ([94e4d16](https://github.com/cartesia-ai/cartesia-js/commit/94e4d16b95ce061759b9ca2972de7d9e5ed33bb1))
* **tts:** Fix build missing DOM WebSocket ([eb270fe](https://github.com/cartesia-ai/cartesia-js/commit/eb270fec7880ba6192ecca081a836e391d034e61))
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
