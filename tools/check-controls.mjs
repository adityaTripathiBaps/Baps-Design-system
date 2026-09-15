// Report how usable each story's Controls panel actually is.
//
// The signal is NOT "how many rows". Storybook renders a row for every arg it
// knows about, and for an arg with no value it renders a placeholder button —
// "Set string", "Set boolean", "Set object" — instead of a live control. A
// panel of those is a list a reader has to click through before they can change
// anything, which is the difference between our panels and the ones in
// Storybook's own reference screenshots.
//
// So: count the live controls, count the placeholders, and name the types.
// A `Set object` on something that is really a number or a union is a
// mis-inferred type worth an explicit argTypes entry.
//
//   node tools/check-controls.mjs <story-id>…
import { chromium } from '@playwright/test';

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('usage: node tools/check-controls.mjs <story-id>…');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
const rows = [];

for (const id of ids) {
  await page.goto(`http://localhost:4400/?path=/story/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);

  const info = await page.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tablist"] button')].find((b) =>
      b.textContent.trim().startsWith('Controls'),
    );
    tab?.click();
    const panel = document.querySelector('#storybook-panel-root');
    if (!panel) return { live: 0, unset: 0, kinds: {}, unsetNames: [] };

    const kinds = {};
    const unsetNames = [];
    let live = 0;
    let unset = 0;

    for (const tr of panel.querySelectorAll('tr')) {
      const cells = tr.querySelectorAll('td');
      if (cells.length < 2) continue;
      const name = cells[0].innerText.trim().split('\n')[0];
      if (!name || name === 'Name' || /^Hide .* items$/.test(name)) continue;

      // LAST cell, not cells[1]: with `controls.expanded` on, the row gains a
      // description column and the control moves. Reading cells[1] reported
      // every row as "no placeholder" and made a broken panel look fixed.
      const control = cells[cells.length - 1];
      const placeholder = /^Set (string|boolean|object|number|array|date)$/.test(
        control.innerText.trim(),
      );
      if (placeholder) {
        unset++;
        unsetNames.push(`${name}(${control.innerText.trim().replace('Set ', '')})`);
        continue;
      }

      let kind = 'other';
      if (control.querySelector('input[type="color"]')) kind = 'color';
      else if (control.querySelector('input[type="range"]')) kind = 'range';
      else if (control.querySelector('input[type="radio"]')) kind = 'radio';
      else if (control.querySelector('select')) kind = 'select';
      else if (control.querySelector('input[type="checkbox"]')) kind = 'boolean';
      else if (control.querySelector('input[type="number"]')) kind = 'number';
      else if (control.querySelector('textarea')) kind = 'text';
      else if (control.querySelector('input')) kind = 'text';
      kinds[kind] = (kinds[kind] || 0) + 1;
      live++;
    }
    return { live, unset, kinds, unsetNames };
  });

  rows.push([id, info]);
  const k = Object.entries(info.kinds)
    .sort()
    .map(([a, b]) => `${a}:${b}`)
    .join(' ');
  const flag = info.unset > info.live ? 'MOSTLY-UNSET' : info.unset ? 'some-unset' : 'ok';
  console.log(
    flag.padEnd(13),
    id.padEnd(42),
    `live ${String(info.live).padStart(2)}  unset ${String(info.unset).padStart(2)}`,
    ' ',
    k,
  );
  if (info.unset) console.log(''.padEnd(13), '  unset:', info.unsetNames.join(' '));
}

await browser.close();

const totalLive = rows.reduce((a, [, i]) => a + i.live, 0);
const totalUnset = rows.reduce((a, [, i]) => a + i.unset, 0);
const bad = rows.filter(([, i]) => i.unset > i.live);
console.log(
  `\n${rows.length} stories · ${totalLive} live controls · ${totalUnset} unset placeholders`,
);
if (bad.length) {
  console.log(`${bad.length} with more unset than live:`);
  console.log(bad.map(([id]) => id).join(' '));
}
