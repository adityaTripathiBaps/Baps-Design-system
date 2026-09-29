/**
 * Slims compodoc's documentation.json on its way into the PREVIEW bundle.
 *
 * Why: preview.ts imports documentation.json for setCompodocJson, so the whole
 * file is inlined into main.iframe.bundle.js, and every iframe parses it —
 * each docs page, each story, every Playwright visual test, and every live
 * preview on Components › Overview. Measured before this loader: a 6.7 MB
 * JSON inside an 8.47 MB main bundle. 4.7 MB of it was one exported constant,
 * BAPS_ICONS (the icon SVG registry), listed twice — under
 * miscellaneous.variables and again under miscellaneous.groupedVariables.
 *
 * What is dropped is exactly what nothing in the preview reads:
 *
 *   - @storybook/angular's compodoc reader (client/docs/compodoc.js) looks up
 *     components / directives / pipes / injectables / classes and reads their
 *     description, rawdescription, jsdoctags and the *Class member lists; from
 *     `miscellaneous` it reads only `typealiases` and `enumerations`.
 *   - preview.ts (CONTROLS_EXCLUDE) reads inputsClass, outputsClass,
 *     propertiesClass, methodsClass and accessors.
 *   - blocks/showcase.tsx reads name, selector and inputsClass.
 *
 * So per declaration it strips the source text compodoc embeds (sourceCode,
 * the inline styles/template and their resolved copies), and from
 * `miscellaneous` it keeps typealiases, enumerations and functions.
 *
 * The file on disk is untouched — tools/wire-controls.mjs and anything else
 * reading documentation.json still get the full output. Only the bundle copy
 * is slimmed, and a new compodoc field that something starts reading keeps
 * working unless it is on the strip list below.
 */
const STRIP_PER_DECLARATION = [
  'sourceCode',
  'styles',
  'stylesData',
  'styleUrlsData',
  'template',
  'templateData',
];
const DECLARATION_GROUPS = [
  'components',
  'directives',
  'pipes',
  'injectables',
  'classes',
  'interfaces',
  'guards',
  'interceptors',
  'modules',
];
const KEEP_MISCELLANEOUS = ['typealiases', 'enumerations', 'functions'];

module.exports = function compodocSlimLoader(source) {
  const doc = JSON.parse(source);
  for (const group of DECLARATION_GROUPS) {
    for (const declaration of doc[group] ?? []) {
      for (const field of STRIP_PER_DECLARATION) delete declaration[field];
    }
  }
  if (doc.miscellaneous) {
    doc.miscellaneous = Object.fromEntries(
      KEEP_MISCELLANEOUS.filter((k) => k in doc.miscellaneous).map((k) => [
        k,
        doc.miscellaneous[k],
      ]),
    );
  }
  delete doc.coverage;
  return JSON.stringify(doc);
};
