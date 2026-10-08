import type { StorybookConfig } from '@storybook/angular';
import remarkGfm from 'remark-gfm';


const config: StorybookConfig = {
  stories: [
    '../../../libs/ui-kit/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../../libs/migration-data/src/**/*.mdx',
  ],
  addons: [
    {
      // Controls, Actions, Viewport, Backgrounds, Toolbars, Measure, Outline
      // and Highlight — the panels and toolbar tools a reader expects from any
      // Storybook. None of them are built into core: they are separate addons,
      // and essentials is the meta-package that registers the set. Without it
      // the addon panel offered only Accessibility (from addon-a11y) and the
      // house "On this page", and the toolbar had zoom + theme and nothing
      // else. Every story's argTypes existed and had nothing to render them.
      //
      // `docs: false` because the standalone @storybook/addon-docs entry below
      // carries the remark-gfm option, and registering docs twice makes the
      // second registration win — silently dropping that option and taking
      // every markdown table in the library with it.
      name: '@storybook/addon-essentials',
      options: { docs: false },
    },
    {
      // remark-gfm is NOT on by default in Storybook 8's MDX pipeline, and
      // without it every GitHub-flavoured markdown table in our .mdx files
      // renders as literal "| --- | --- |" pipe text instead of a <table>.
      // Every PrimeNG-mapping / states / do's-and-don'ts table in the library
      // was affected. Tables are the primary format of this documentation, so
      // this is load-bearing, not cosmetic.
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    // The Interactions panel: it replays a story's `play` function step by
    // step, with pause/step/rerun controls, and shows which assertion failed.
    // Separate from essentials, and inert without it — the panel renders the
    // instrumented calls that @storybook/test emits.
    '@storybook/addon-interactions',
    // Design panel: renders the Figma frame a story declares in
    // `parameters.design`, side by side with the running component. The Figma
    // node ids were already recorded all over this library — in story comments,
    // MDX prose and SCSS headers — but only as text a reader had to copy into a
    // browser. This turns them into the tab.
    '@storybook/addon-designs',
    // Visual tests panel (Chromatic). The panel is part of the standard addon
    // set, so it is registered here; running a comparison from it needs a
    // Chromatic project token, and until one is configured the tab shows its
    // own "set up" prompt rather than results.
    //
    // This does NOT replace the existing visual regression suite: `nx
    // visual-test storybook-host` still runs the Playwright snapshots in
    // apps/storybook-host/visual, which need no account and are what CI uses.
    // The two answer different questions — Playwright pins our own pixels,
    // Chromatic reviews changes across browsers — so both stay.
    '@chromatic-com/storybook',
    'storybook-dark-mode',
    // Axe-based accessibility checks on every story and docs page. Version is
    // pinned to the Storybook core version - a mismatched addon major silently
    // fails to register rather than erroring.
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: [
    {
      from: '../../../libs/ui-kit/src/lib/styles/layout',
      to: '/'
    },
    // Storybook requests /favicon.svg on every page load, and the only static
    // dir above is a shared STYLES folder — dropping an icon in there would be
    // the wrong home for it, so this app gets its own. The mark is the same
    // BAPS logo the manager chrome uses (chrome-theme.ts), written out as a
    // real file rather than kept only as that file's inline data URI.
    {
      from: '../static',
      to: '/'
    },
    // The Playwright baselines double as the still image on each Components
    // Overview card (ComponentGallery in blocks/showcase.tsx), 21st.dev-style:
    // a picture at rest, the live story on hover. Served read-only from where
    // the visual suite already writes them, so there is no second copy to keep
    // in sync; a new or updated baseline shows up on the next start.
    {
      from: '../visual/stories.spec.ts-snapshots',
      to: '/visual-baselines'
    }
  ],
  webpackFinal: async (webpackConfig) => {
    // Cap minimizer parallelism. The production build died with
    //   DataCloneError: Data cannot be cloned, out of memory
    //   ERR_WORKER_OUT_OF_MEMORY
    // which is terser spawning one worker per core and handing each a copy
    // of a large bundle. NODE_OPTIONS does not reach those workers, so
    // raising the parent heap changed nothing across three attempts.
    //
    // One worker is slower and finishes. Nothing is suppressed: a real
    // compile error still fails the build.
    for (const m of webpackConfig.optimization?.minimizer ?? []) {
      if (m && typeof m === 'object' && 'options' in m) {
        (m as unknown as { options: Record<string, unknown> }).options['parallel'] = 1;
      }
    }
    // Short import for the shared documentation blocks. Without it every MDX
    // under libs/ui-kit would reach them through six levels of '../'.
    webpackConfig.resolve ??= {};
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@baps/docs-blocks': require('path').resolve(__dirname, 'blocks/index.tsx'),
    };
    webpackConfig.module ??= { rules: [] };
    webpackConfig.module.rules ??= [];
    // compodoc's documentation.json is imported by preview.ts, so it is inlined
    // into main.iframe.bundle.js and parsed by EVERY iframe — docs pages,
    // stories, each Playwright visual test. It was 6.7 MB of an 8.47 MB bundle,
    // mostly the BAPS_ICONS registry listed twice. The loader strips what no
    // reader uses (see its header) for 0.67 MB; the file on disk is untouched.
    webpackConfig.module.rules.push({
      test: /[\\/]documentation\.json$/,
      use: [require('path').resolve(__dirname, 'compodoc-slim-loader.cjs')],
    });
    webpackConfig.module.rules.push({
      test: /\.css$/,
      // Angular emits component `styles` as virtual .css?ngResource modules that
      // must stay raw text for @ngtools — running them through style-loader feeds
      // JS to Angular's postcss step ("Unknown word import" build error).
      resourceQuery: { not: [/ngResource/] },
      use: ['style-loader', 'css-loader'],
    });
    // Global SCSS (src/styles.scss, imported from preview.ts). The canonical
    // route — a `styles` option on the storybook targets — is silently dropped:
    // @storybook/angular 8.6's preset extracts style entries via
    // @angular-devkit/build-angular internals it supports only up to v19, and
    // this workspace is on v21. Loading through preview.ts sidesteps those
    // internals entirely (same pattern as the .css imports above).
    //
    // The Angular builder ships its own .scss rule; when two rules match the
    // same file webpack CONCATENATES their loader chains, so styles.scss went
    // style-loader → JS → Angular's sass-loader → "expected '{'" build error.
    // Exclude it from every pre-existing scss rule and claim it exclusively.
    const globalScss = /[\\/]apps[\\/]storybook-host[\\/]src[\\/]styles\.scss$/;
    for (const rule of webpackConfig.module.rules) {
      if (
        rule &&
        typeof rule === 'object' &&
        rule.test instanceof RegExp &&
        rule.test.test('file.scss')
      ) {
        const prev = rule.exclude;
        rule.exclude = prev ? (Array.isArray(prev) ? [...prev, globalScss] : [prev, globalScss]) : globalScss;
      }
    }
    webpackConfig.module.rules.push({
      test: globalScss,
      // url: false — _fonts.scss points at './fonts/…' which staticDirs serves
      // from the site root at runtime; the style-loader <style> tag resolves it
      // against the document base, so bundling the TTF here is both unnecessary
      // and broken (the path doesn't exist relative to styles.scss).
      use: ['style-loader', { loader: 'css-loader', options: { url: false } }, 'sass-loader'],
    });
    return webpackConfig;
  },
};



export default config;


// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs



