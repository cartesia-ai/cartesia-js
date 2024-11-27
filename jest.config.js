/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(emittery)/)',
    ],
  };
  