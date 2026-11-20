import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const POSTPROCESS = path.resolve(__dirname, '../scripts/utils/postprocess-files.cjs');

// tsc emits `require()` verbatim into .mjs files, so this mirrors the ws loader in the SDK.
const LOADER = `
let _ws;
try {
  _ws = require('fake-ws');
} catch {}
export const loaded = _ws?.WebSocket !== undefined;
`;

describe('post-processed ESM build', () => {
  let dir: string;

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cartesia-esm-'));
    fs.mkdirSync(path.join(dir, 'node_modules/fake-ws'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'node_modules/fake-ws/package.json'), '{"main":"index.js"}');
    fs.writeFileSync(path.join(dir, 'node_modules/fake-ws/index.js'), 'exports.WebSocket = class {};');
    fs.mkdirSync(path.join(dir, 'dist'));
    fs.writeFileSync(path.join(dir, 'dist/package.json'), '{}');
    fs.writeFileSync(path.join(dir, 'dist/loader.mjs'), LOADER);
    fs.writeFileSync(
      path.join(dir, 'dist/loader.js'),
      LOADER.replace('export const loaded =', 'exports.loaded ='),
    );

    execFileSync(process.execPath, [POSTPROCESS], {
      cwd: dir,
      env: { ...process.env, DIST_PATH: path.join(dir, 'dist') },
      stdio: 'pipe',
    });
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const loadedInEsm = (preamble = '') =>
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `${preamble}
        const { loaded } = await import(${JSON.stringify(
          pathToFileURL(path.join(dir, 'dist/loader.mjs')).href,
        )});
        console.log(loaded);`,
      ],
      { encoding: 'utf8' },
    ).trim();

  test('an ES module loads an installed peer dependency', () => {
    expect(loadedInEsm()).toBe('true');
  });

  test('an ES module still evaluates when the loader is unavailable', () => {
    expect(loadedInEsm('delete process.getBuiltinModule;')).toBe('false');
  });

  test('the CommonJS build is unaffected', () => {
    const out = execFileSync(process.execPath, ['-e', `console.log(require('./dist/loader.js').loaded)`], {
      cwd: dir,
      encoding: 'utf8',
    });
    expect(out.trim()).toBe('true');
  });
});
