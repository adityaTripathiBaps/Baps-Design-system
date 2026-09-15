import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'json/flat-with-attributes',
  format: ({ dictionary }) =>
    JSON.stringify(
      dictionary.allTokens.map((token) => ({
        name: token.name,
        path: token.path,
        value: token.value,
        original: token.original.value,
        legacyMapping: token.legacyMapping ?? {},
        comment: token.comment,
      })),
      null,
      2,
    ),
});

export default {
  source: ['src/source/**/*.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/generated/',
      files: [{ destination: 'tokens.ts', format: 'javascript/es6' }],
    },
    json: {
      transformGroup: 'js',
      buildPath: 'build/json/',
      files: [{ destination: 'tokens.flat.json', format: 'json/flat-with-attributes' }],
    },
  },
};
