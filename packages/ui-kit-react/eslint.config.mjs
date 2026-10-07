import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/fixtures/**/*',
            '{projectRoot}/scripts/**/*',
            '{projectRoot}/tests/**/*',
          ],
          // Token CSS is consumed through the public styles entry,
          // so there is intentionally no TypeScript import for the
          // dependency checker to discover.
          ignoredDependencies: ['@org/tokens'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['fixtures/**/*.tsx'],
    rules: {
      // These are external-consumer compile fixtures on purpose; using
      // the package self-reference is the behaviour under test.
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    ignores: ['**/out-tsc', 'src/lib/generated'],
  },
];
