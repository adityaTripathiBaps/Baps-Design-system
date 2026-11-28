// Capture the landing page's live-screen stills.
//
// WHY THIS EXISTS
//
// Each live screen on apps/storybook-host/static/landing/index.html is a whole
// Storybook preview (Angular, PrimeNG, the kit) in an iframe. On a slow machine
// one takes seconds to boot, and the canvas showed "Loading live screen…" for
// that long. The page now shows a still of the same screen at once and fades
// the live story in over it when it is ready. This script makes those stills.
//
// It photographs the landing page itself, not the bare story, so a still is
// exactly what the live frame draws there: same box, same zoom, same brand and
// mode classes.
//
// USAGE  (Storybook running on :4400)
//
//   node tools/capture-landing-stills.mjs
//
// Writes shots/live/<storyId>--<brand>-<light|dark>.jpg next to the landing
// page. Re-run it when one of those stories changes how it looks. The list of
// stories must match STILLS in index.html.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SB_URL ?? 'http://localhost:4400';
const OUT = 'apps/storybook-host/static/landing/shots/live';
mkdirSync(OUT, { recursive: true });

// Canvas stage index -> story on that stage. Stage 5 (index 5) is always dark.
const STAGES = [
  [1, 'foundations-theme-preview--components'],
  [2, 'patterns-crud-form--default'],
  [3, 'patterns-login--default'],
  [4, 'components-table--full-listing-page'],
  [5, 'components-table--grouped-projects'],
];

const browser = await chromium.launch();
let count = 0;
for (const brand of ['mybky', 'sampark']) {
  for (const mode of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await page.addInitScript(
      ([b, m]) => {
        localStorage.clear();
        localStorage.setItem('baps-landing-brand', b);
        localStorage.setItem('baps-landing-mode', m);
      },
      [brand, mode],
    );
    await page.goto(`${BASE}/landing/index.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
    for (const [step, id] of STAGES) {
      const look = step === 5 ? 'dark' : mode;
      if (step === 5 && mode === 'light') continue; // always dark: once per brand
      await page.evaluate((n) => {
        const s = document.querySelector(`.step[data-step="${n}"]`);
        scrollTo(0, s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2);
      }, step);
      const layer = page.locator(`#cBody .layer[data-layer="${step}"]`);
      await layer.locator('iframe.ready').waitFor({ timeout: 90_000 });
      // The CRUD stage types into its form; wait until both fields are filled.
      await page.waitForTimeout(step === 2 ? 4500 : 2000);
      await layer.screenshot({ path: `${OUT}/${id}--${brand}-${look}.jpg`, type: 'jpeg', quality: 80 });
      count++;
    }
    await page.close();
  }
}
await browser.close();
console.log(`[landing stills] ${count} stills written to ${OUT}`);
