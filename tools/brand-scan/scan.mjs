/**
 * Single-brand gate for a consuming app: scan the open page for colours that
 * exist only in the OTHER brand's palette (see brand-theming rule, "One app,
 * one brand"). Copied from audits/tools/brand-scan (2026-10-30).
 *
 *   node tools/brand-scan/scan.mjs <label> [path] [steps-json]
 *
 * Connects to a Chromium started with --remote-debugging-port (default
 * http://localhost:9333, env BRAND_SCAN_CDP), takes the tab whose URL starts
 * with the app origin (default http://localhost:4200, env BRAND_SCAN_APP),
 * optionally navigates to [path] and runs steps such as
 * '[{"click":"baps-button[icon=\"filter\"] button"},{"wait":"2000"}]', then
 * prints every hit with host, element, property and token.
 *
 * BRAND_SCAN_APP_BRAND=sampark (default) looks for MyBKY-only colours;
 * =mybky looks for Sampark-only ones. ROOT=1 adds .baps-ds-sampark to <html>
 * first, to preview the root scope. Screenshot: BRAND_SCAN_SHOT=<file.png>.
 * Exit code 1 when anything is found. Run palette.mjs after a token change.
 * An overlay that did not open is not a pass: check the screenshot.
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const pal = JSON.parse(
  readFileSync(new URL('./palette.json', import.meta.url), 'utf8'),
);
const CDP = process.env.BRAND_SCAN_CDP ?? 'http://localhost:9333';
const APP = process.env.BRAND_SCAN_APP ?? 'http://localhost:4200';
const appBrand = process.env.BRAND_SCAN_APP_BRAND ?? 'sampark';
const foreign = appBrand === 'sampark' ? pal.mybkyOnly : pal.samparkOnly;
const [label, path, steps] = process.argv.slice(2);
if (!label) {
  console.error(
    'usage: node tools/brand-scan/scan.mjs <label> [path] [steps-json]',
  );
  process.exit(2);
}

const browser = await chromium.connectOverCDP(CDP);
const page = browser
  .contexts()[0]
  .pages()
  .find((p) => p.url().startsWith(APP));
if (!page) {
  console.error(`no tab open on ${APP}`);
  process.exit(2);
}
await page.bringToFront();
if (path) {
  await page
    .goto(`${APP}/${path}`, { waitUntil: 'networkidle', timeout: 90_000 })
    .catch(() => {});
  await page.waitForTimeout(3000);
}
for (const step of steps ? JSON.parse(steps) : []) {
  const [kind, arg] = Object.entries(step)[0];
  if (kind === 'wait') await page.waitForTimeout(Number(arg));
  else
    await page
      .locator(arg)
      .first()
      [kind === 'hover' ? 'hover' : 'click']({ force: true })
      .catch((e) => console.log('step failed', arg, e.message.slice(0, 80)));
  await page.waitForTimeout(900);
}
if (process.env.ROOT) {
  await page.evaluate(() =>
    document.documentElement.classList.add('baps-ds-sampark'),
  );
  await page.waitForTimeout(500);
}

const HOSTS =
  'baps-button,baps-table,baps-message,baps-select,baps-multi-select,baps-toggleswitch,baps-checkbox,baps-radio,baps-tag,baps-avatar,baps-divider,baps-dialog,baps-drawer,baps-skeleton,baps-popover,baps-tree-select,baps-iconfield,baps-overlaybadge,baps-spinner,baps-paginator,baps-accordion,baps-input-group,baps-input-number,baps-datepicker';
const PANELS =
  '.p-select-overlay,.p-multiselect-overlay,.p-treeselect-overlay,.p-popover,.p-tooltip,.p-drawer,.p-dialog,.p-datepicker-panel,.p-menu-overlay';
const res = await page.evaluate(
  ({ foreign, HOSTS, PANELS }) => {
    const props = [
      'color',
      'backgroundColor',
      'borderTopColor',
      'borderLeftColor',
      'borderBottomColor',
      'outlineColor',
    ];
    const hits = {};
    const seen = new Set();
    const roots = document.querySelectorAll(
      `[class*="baps-"], ${HOSTS}, [bapsinputtext], ${PANELS}`,
    );
    for (const r of roots)
      for (const el of [r, ...r.querySelectorAll('*')]) {
        if (seen.has(el)) continue;
        seen.add(el);
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') continue;
        for (const k of props) {
          const v = s[k];
          if (
            k.startsWith('border') &&
            parseFloat(s[k.replace('Color', 'Width')]) === 0
          )
            continue;
          if (
            k === 'outlineColor' &&
            (s.outlineStyle === 'none' || parseFloat(s.outlineWidth) === 0)
          )
            continue;
          if (k === 'backgroundColor' && v === 'rgba(0, 0, 0, 0)') continue;
          if (k === 'color' && !el.childNodes.length) continue;
          const tok = foreign[v];
          if (!tok) continue;
          const host = el.closest(`${HOSTS},${PANELS}`);
          const hn = host
            ? host.tagName.toLowerCase().startsWith('baps')
              ? host.tagName.toLowerCase() +
                (host.classList.contains('baps-sampark') ? '[sampark]' : '')
              : '.' + [...host.classList].find((c) => /^p-/.test(c))
            : el.tagName.toLowerCase();
          const key = `${hn} | ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} | ${k} ${v} (${tok})`;
          hits[key] = (hits[key] ?? 0) + 1;
        }
      }
    return {
      html: document.documentElement.className,
      url: location.href,
      hits,
    };
  },
  { foreign, HOSTS, PANELS },
);

console.log(label, res.url, 'html=', JSON.stringify(res.html));
const entries = Object.entries(res.hits).sort();
for (const [k, n] of entries) console.log(`  ${n}x ${k}`);
console.log(
  `${entries.length ? 'FAIL' : 'ok'}: ${entries.length} distinct ${appBrand === 'sampark' ? 'MyBKY' : 'Sampark'}-only colour hits`,
);
if (process.env.BRAND_SCAN_SHOT)
  await page.screenshot({ path: process.env.BRAND_SCAN_SHOT });
await browser.close();
process.exit(entries.length ? 1 : 0);
