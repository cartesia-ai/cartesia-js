/** Jest runs the TypeScript source, where `require` exists. The published build uses `#node-deps`. */
export function loadWs(): typeof import('ws') | undefined {
  try {
    return require('ws');
  } catch {
    return undefined;
  }
}

export function loadStream(): typeof import('stream') | undefined {
  try {
    return require('stream');
  } catch {
    return undefined;
  }
}
