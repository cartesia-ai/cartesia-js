import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function loadWs() {
  try {
    return require('ws');
  } catch {
    return undefined;
  }
}

export function loadStream() {
  try {
    return require('stream');
  } catch {
    return undefined;
  }
}
