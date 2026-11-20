function loadWs() {
  try {
    return require('ws');
  } catch {
    return undefined;
  }
}

function loadStream() {
  try {
    return require('stream');
  } catch {
    return undefined;
  }
}

module.exports = { loadWs, loadStream };
