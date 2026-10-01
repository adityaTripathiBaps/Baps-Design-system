// Compile the design system's SCSS into CSS a non-Angular app can import.
//
// WHY THIS EXISTS
//
// The library ships SCSS as source and consuming Angular apps pull it in with
// Sass's `pkg:` importer (see publishing.md). That works because those apps
// already run Sass. A React or Next.js app does not: it imports CSS. Without a
// compiled artefact, `@org/ui-kit` gives a non-Angular consumer the Angular
// components and nothing else — no classes, no brand scopes, no dark mode.
//
// This adds the CSS and changes nothing about the Angular path: the SCSS source
// is still shipped and still exported under ./src/*.
//
// WHAT IT PRODUCES, inside the ng-packagr STAGE directory
//
//   styles/index.css          layout + every component, one import
//   styles/<component>.css    one component on its own
//
// WHAT IT DOES NOT DO
//
// It does not inline a single token value. Every rule keeps its
// var(--color-…, …) reference, so the CSS is meaningless on its own and the
// consumer imports @org/tokens/css alongside it — one source of truth for the
// values, exactly as in Storybook. Verified by the assertion at the end.
//
// Sass comes from the workspace (`sass` is already a devDependency); nothing
// new is installed.
import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  statSync,
} from 'node:fs';
import { join, posix } from 'node:path';
import * as sass from 'sass';

const SRC = 'libs/ui-kit/src/lib/styles';
const STAGE = 'dist/libs/ui-kit-stage/styles';
const LOAD_PATH = SRC;

/** The shared rules a component's classes assume: fonts, base typography. */
const LAYOUT_ENTRIES = ['layout/fonts', 'layout/common'];

const compile = (entryScss, label) => {
  const result = sass.compileString(entryScss, {
    loadPaths: [LOAD_PATH],
    style: 'expanded',
    // A partial that imports nothing else still resolves its siblings through
    // the load path, which is how `@use 'layout/common'` works below.
  });
  if (!result.css.trim())
    throw new Error(`[ui-kit styles] ${label} compiled to nothing`);
  return result.css;
};

const componentDirs = readdirSync(join(SRC, 'components'), {
  withFileTypes: true,
})
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

mkdirSync(STAGE, { recursive: true });

// ── one file per component ──────────────────────────────────────────────────
const written = [];
for (const name of componentDirs) {
  const dir = join(SRC, 'components', name);
  const partials = readdirSync(dir).filter((f) => f.endsWith('.scss'));
  if (partials.length === 0) continue;

  // `@use` every partial in the directory: several components split themselves
  // into a base file plus a brand skin (_select.scss + _select-sampark.scss),
  // and a consumer asking for "select" wants both.
  const entry = partials
    .map(
      (f) =>
        `@use '${posix.join('components', name, f.replace(/^_/, '').replace(/\.scss$/, ''))}';`,
    )
    .join('\n');

  const css = compile(entry, `components/${name}`);
  writeFileSync(join(STAGE, `${name}.css`), css);
  written.push({ name, bytes: css.length });
}

// ── the bundle ──────────────────────────────────────────────────────────────
const bundleEntry = [
  ...LAYOUT_ENTRIES.map((p) => `@use '${p}';`),
  ...componentDirs.flatMap((name) => {
    const dir = join(SRC, 'components', name);
    return readdirSync(dir)
      .filter((f) => f.endsWith('.scss'))
      .map(
        (f) =>
          `@use '${posix.join('components', name, f.replace(/^_/, '').replace(/\.scss$/, ''))}';`,
      );
  }),
].join('\n');

const bundle = compile(bundleEntry, 'index');
writeFileSync(join(STAGE, 'index.css'), bundle);

// ── the font the @font-face points at ───────────────────────────────────────
//
// index.css declares `src: url("./fonts/Inter-VariableFont_opsz,wght.ttf")`,
// and until now the package shipped the declaration without the file. Vite
// resolved the rest of the stylesheet and left that one url alone; Next's
// webpack css-loader refused the build outright with
//
//   Cannot find module './fonts/Inter-VariableFont_opsz,wght.ttf'
//
// which is the better failure of the two — the silent one ships an app whose
// every measurement is right and whose typeface is the browser's default.
// Found by building a real Next.js app against the package, not by reading.
const FONT_SRC = `${SRC}/layout/fonts`;
const FONT_OUT = join(STAGE, 'fonts');
mkdirSync(FONT_OUT, { recursive: true });
const fonts = readdirSync(FONT_SRC).filter((n) =>
  /.(ttf|woff2?|otf)$/i.test(n),
);
if (fonts.length === 0) {
  throw new Error(
    `[ui-kit styles] ${FONT_SRC} has no font files, but index.css declares an @font-face that points there`,
  );
}
for (const n of fonts) copyFileSync(join(FONT_SRC, n), join(FONT_OUT, n));

// ── the token values must NOT be baked in ───────────────────────────────────
//
// If a build ever starts emitting literal hex where a var() used to be, the CSS
// silently stops following the theme and nothing else would notice.
const varCount = (bundle.match(/var\(--/g) ?? []).length;
if (varCount < 100) {
  throw new Error(
    `[ui-kit styles] index.css has only ${varCount} var() references — token values look inlined. ` +
      `The CSS must keep its custom-property references so @org/tokens/css stays the single source.`,
  );
}

const total = statSync(join(STAGE, 'index.css')).size;
console.log(
  `[ui-kit styles] ${fonts.length} font file(s) copied;  ${written.length} component files + index.css ` +
    `(${(total / 1024).toFixed(1)} kB, ${varCount} token references kept)`,
);
