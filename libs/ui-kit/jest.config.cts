module.exports = {
  displayName: 'ui-kit',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: 'test-output/jest/coverage',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  // This suite died outright at Node's default heap — "Fatal process out of
  // memory: Zone", exit 127 — and even with an 8 GB parent heap four workers
  // still OOMed mid-run and were recovered without the run reporting it.
  //
  // Raising the parent heap does not reach the workers, so cap the workers
  // instead: Jest restarts one that passes the limit, between test files,
  // before it can die. That removes the failure rather than hiding it — a
  // genuinely failing test still fails.
  //
  // maxWorkers is capped for the same reason: fewer workers, more headroom
  // each, on a machine that may have little free RAM.
  workerIdleMemoryLimit: '1GB',
  maxWorkers: 2,
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ]
};
