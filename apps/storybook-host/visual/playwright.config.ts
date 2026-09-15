import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// Deliberately NOT 4400: that is the port a developer's Storybook sits on, and
// sharing it is what this config now exists to prevent.
const VR_PORT = 4401;

/**
 * Visual regression for the BAPS design system.
 *
 * This exists to make the PrimeNG token migration safe. Roughly half the
 * library is currently styled by CSS override (707 `!important` declarations
 * across the shared SCSS) rather than through PrimeNG's token layer, and
 * converting those to design tokens changes the CSS that produces every
 * component's appearance. Without a pixel baseline that refactor is
 * unverifiable — "it still looks right" across 138 stories is not something
 * anyone can check by hand.
 *
 * Deliberately NOT a hosted service: this runs locally and in CI with no
 * account, no vendor and no per-snapshot billing. Chromatic would give nicer
 * review UX and cross-browser rendering, but that is a purchasing decision,
 * not a technical one.
 *
 * Baselines live in visual/__screenshots__ and are committed. Update them
 * ONLY when a visual change is intended, with `--update-snapshots`.
 */
export default defineConfig({
  testDir: '.',
  // Screenshots are the assertion, so a flaky one is a real signal — but
  // fonts and animations settle at slightly different times per run, which
  // is noise rather than regression. One retry absorbs that.
  retries: 1,
  // Chromium only — cross-browser rendering differences would need their own
  // baselines and triple the review burden for a design system whose target is
  // a single Chromium-based admin surface.
  //
  // Two viewports, because they answer different questions:
  //
  // - `chromium` (desktop) is the regression guard. A token migration or a
  //   refactor must produce ZERO diffs here. It also catches mobile CSS
  //   leaking out of its media query, which is a real failure mode — the
  //   library's mobile rules were historically written Sampark-scoped only.
  //
  // - `chromium-mobile` covers the 767px breakpoint the components actually
  //   use. Without it, responsive work is unverifiable: the desktop baseline
  //   passes happily while the mobile layout is broken, which is exactly the
  //   state this library was in (2 media queries across 32 components).
  //
  // Mobile also emulates touch, so it exercises the `pointer: coarse`
  // touch-target rules that desktop deliberately never sees.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  use: {
    baseURL: process.env.STORYBOOK_URL ?? `http://localhost:${VR_PORT}`,
  },
  // Own instance, own port. This block is the fix for a real failure that cost
  // two runs: with no webServer, Playwright just pointed at whatever was
  // already serving 4400 — the DEV Storybook. Anything else touching that
  // server during a run (navigating a story, injecting DOM, or simply the CPU
  // it costs) silently corrupts or times out the screenshots, and the run
  // reports it as a flake rather than as interference.
  //
  // reuseExistingServer is false ON PURPOSE. Reusing whatever is on the port is
  // exactly the behaviour that broke: a run must never share a browser target
  // with a human. The cost is ~80s of startup per run, against a ~4.5min run.
  //
  // MEMORY: stop any dev Storybook before running this. Each instance is a full
  // Angular webpack build and holds ~1.5GB; on a 20GB machine already sitting
  // at ~17GB used, the second one dies mid-compile and Playwright reports only
  // "Process from config.webServer exited early" with no cause — the OOM kill
  // is silent. Measured: 2.5GB free with the dev server up, 4.2GB after
  // stopping it.
  //
  // Skipped entirely when STORYBOOK_URL is set, so CI can point at a prebuilt
  // static Storybook and pay nothing for the dev server.
  ...(process.env.STORYBOOK_URL
    ? {}
    : {
        webServer: {
          command: `npx nx run storybook-host:storybook --port=${VR_PORT} --ci`,
          url: `http://localhost:${VR_PORT}`,
          cwd: fileURLToPath(new URL('../../..', import.meta.url)),
          reuseExistingServer: false,
          // Measured cold start is ~80s; the margin covers a first run with no
          // Nx cache, which is several times that.
          timeout: 300_000,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      }),
  expect: {
    toHaveScreenshot: {
      // Anti-aliasing on text and 1px borders differs by a few pixels between
      // runs on the same machine. 0.2% of pixels is comfortably below any
      // real visual change (a colour or spacing shift moves far more) while
      // absorbing that noise.
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  reporter: [['list'], ['html', { outputFolder: 'visual-report', open: 'never' }]],
});
