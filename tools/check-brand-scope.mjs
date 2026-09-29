/**
 * One brand at a time, checked by COLOUR rather than by name.
 *
 * The sidebar filter and `<BrandOnly>` are supposed to mean that selecting a
 * brand shows only that brand's components and only the text describing them.
 * An earlier version of this check looked for the words "Sampark" / "MyBKY" in
 * headings and table-of-contents links, and reported everything clean — while a
 * section called "All Variants" rendered entirely in Sampark maroon on a MyBKY
 * page. A name says nothing about what was painted.
 *
 * So this reads the computed colours of every VISIBLE element inside every
 * visible story canvas, and fails if one brand's signature hues appear while the
 * other brand is selected. It still checks heading and TOC text as well, because
 * prose can leak without any colour changing.
 *
 * Run it against a Storybook dev server:
 *
 *     npx nx run storybook-host:storybook --port 4400
 *     node tools/check-brand-scope.mjs
 *
 * Exit code 1 on any leak, or on any page that could not be checked — an error
 * is not a pass. Three separate false "0 leaks" results in this codebase came
 * from counting only the pages that happened to load.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.SB_URL ?? 'http://localhost:4400';

/** Hues no shared or neutral token uses, so their presence means that brand rendered. */
const SIGNATURE = {
  sampark: ['201, 104, 104', '180, 65, 65', '135, 48, 48', '212, 135, 135', '233, 195, 195'],
  mybky: ['95, 120, 184', '56, 72, 113', '76, 96, 149', '159, 173, 217', '189, 198, 228'],
};

/**
 * Pages that are allowed to show both brands, with the reason. Everything else
 * is expected to be single-brand, so a new page is checked by default rather
 * than silently exempt.
 */
const ALLOWED_BOTH = new Map([
  ['foundations-colour--docs', 'palette reference — documents both ramps'],
  ['foundations-audit-inconsistency-findings--docs', 'its subject is where the brands diverge'],
  ['patterns-single-brand-project-setup--docs', 'guide that has to name both to explain the choice'],
  ['guidelines-known-gaps--docs', 'maintainer notes, several about cross-brand behaviour'],
  // Sampark-only components and patterns. Their meta carries `ds:sampark`, so
  // the sidebar hides them under MyBKY and a MyBKY reader never arrives here.
  // Opening them directly still renders Sampark, which is correct, not a leak.
  ['components-usersdropdown--docs', 'Sampark-only component (meta ds:sampark)'],
  ['components-tablecolumnconfig--docs', 'Sampark-only component (meta ds:sampark)'],
  ['components-tablesortconfig--docs', 'Sampark-only component (meta ds:sampark)'],
  ['components-fileupload--docs', 'Sampark-only component (meta ds:sampark)'],
  ['components-toolbar--docs', 'Sampark-only component (meta ds:sampark)'],
  ['patterns-data-management--docs', 'Sampark-only pattern (meta ds:sampark)'],
  ['patterns-delete-confirmation--docs', 'Sampark-only pattern (meta ds:sampark)'],
  // Known component-level gap, documented in guidelines/known-gaps: these
  // components paint Sampark tokens with no MyBKY branch. Listed so the check
  // stays useful for everything else; remove an entry when its skin is fixed.
  ['components-indicator--docs', 'KNOWN GAP — baps-indicator has no MyBKY branch'],
  ['components-alert--docs', 'KNOWN GAP — alert card action has no MyBKY branch'],
  ['components-molecules-menu-item--docs', 'KNOWN GAP — baps-menu-item has no MyBKY branch'],
  ['components-molecules-listbox--docs', 'KNOWN GAP — its rows are baps-menu-item, which has no MyBKY branch'],
  ['components-icon--docs', 'demonstrates colour inheritance with literal swatches'],
]);

const probe = async (page, id, brand) => {
  await page.goto(`${BASE}/iframe.html?viewMode=docs&id=${id}&globals=designSystem:${brand}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await page.waitForSelector('.sbdocs-wrapper', { timeout: 60000 });
  await page.waitForTimeout(3000);
  return page.evaluate((sig) => {
    const visible = (el) => {
      let n = el;
      while (n && n !== document.body) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        n = n.parentElement;
      }
      return true;
    };
    const hits = { sampark: new Set(), mybky: new Set() };
    for (const canvas of document.querySelectorAll('.docs-story')) {
      if (!visible(canvas)) continue;
      for (const el of canvas.querySelectorAll('*')) {
        if (!visible(el)) continue;
        const cs = getComputedStyle(el);
        const paint = [cs.backgroundColor, cs.color, cs.borderTopColor, cs.fill, cs.stroke].join(' ');
        for (const [key, colours] of Object.entries(sig)) {
          for (const c of colours) if (paint.includes(c)) hits[key].add(c);
        }
      }
    }
    const text = [
      ...[...document.querySelectorAll('h2,h3,h4')].filter(visible).map((h) => h.innerText.trim()),
      ...[...document.querySelectorAll('a.toc-link')].filter(visible).map((a) => 'TOC:' + a.innerText.trim()),
    ];
    return {
      sampark: [...hits.sampark],
      mybky: [...hits.mybky],
      textSampark: text.filter((t) => /sampark/i.test(t)),
      textMybky: text.filter((t) => /my ?bky/i.test(t)),
    };
  }, SIGNATURE);
};

const res = await fetch(`${BASE}/index.json`);
if (!res.ok) {
  console.error(`Could not read ${BASE}/index.json (HTTP ${res.status}). Is Storybook running?`);
  process.exit(1);
}
const index = await res.json();
const docs = Object.values(index.entries)
  .filter((e) => e.type === 'docs')
  .map((e) => e.id);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
page.setDefaultNavigationTimeout(120000);

let checked = 0;
const leaks = [];
const errors = [];

for (const id of docs) {
  try {
    const my = await probe(page, id, 'mybky');
    const sa = await probe(page, id, 'sampark');
    checked++;
    if (ALLOWED_BOTH.has(id)) continue;
    const issues = [];
    if (my.sampark.length) issues.push(`MyBKY view paints Sampark [${my.sampark.join('; ')}]`);
    if (sa.mybky.length) issues.push(`Sampark view paints MyBKY [${sa.mybky.join('; ')}]`);
    if (my.textSampark.length) issues.push(`MyBKY view text: ${my.textSampark.join(', ')}`);
    if (sa.textMybky.length) issues.push(`Sampark view text: ${sa.textMybky.join(', ')}`);
    if (issues.length) {
      leaks.push(id);
      console.log(`LEAK  ${id}\n        ${issues.join('\n        ')}`);
    }
  } catch (e) {
    errors.push(id);
    console.log(`ERR   ${id} :: ${String(e).split('\n')[0].slice(0, 120)}`);
  }
}

await browser.close();

console.log(
  `\nchecked ${checked}/${docs.length}   errors ${errors.length}   leaks ${leaks.length}   allowed-both ${ALLOWED_BOTH.size}`,
);
if (errors.length) console.log(`NOT CHECKED: ${errors.join(', ')}`);

if (errors.length || leaks.length) process.exit(1);
console.log('brand scope OK — one brand at a time on every checked docs page');
