// Run axe over one story per component and group the violations by rule.
//
// Why one per component rather than all 309: a component's stories share their
// markup and tokens, so the same rule fires on all of them — scanning every
// story multiplies runtime without adding information. Pass explicit ids to
// scan a narrower or wider set.
//
// axe is injected directly rather than read off the Accessibility tab: the tab
// shows a count that MIXES violations with "incomplete" results (Button reads
// "Accessibility1" while reporting 0 violations and 1 incomplete), so the panel
// badge is not a number to gate on.
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

// axe-core arrives as a transitive dep of @storybook/addon-a11y, so it is not
// hoisted to the root and require.resolve cannot see it. Read it out of the
// pnpm store instead of adding a direct dependency for a dev-only script.
const store = 'node_modules/.pnpm';
const axeDir = readdirSync(store).find((d) => /^axe-core@/.test(d));
if (!axeDir) throw new Error('axe-core not found in the pnpm store — is addon-a11y installed?');
const axeSource = readFileSync(`${store}/${axeDir}/node_modules/axe-core/axe.min.js`, 'utf8');

const res = await fetch('http://localhost:4400/index.json');
const index = await res.json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story');

// First story of each component, unless ids were given on the command line.
const wanted = process.argv.slice(2);
const picked = wanted.length
  ? stories.filter((s) => wanted.includes(s.id))
  : Object.values(
      stories.reduce((acc, s) => {
        const key = s.title;
        if (!acc[key] && !/-interaction$/.test(s.id)) acc[key] = s;
        return acc;
      }, {}),
    );

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const byRule = {};

for (const s of picked) {
  await page.goto(`http://localhost:4400/iframe.html?viewMode=story&id=${s.id}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(700);
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run('#storybook-root', { resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });
  for (const v of result) {
    byRule[v.id] ??= { impact: v.impact, count: 0, stories: [] };
    byRule[v.id].count += v.nodes;
    byRule[v.id].stories.push(s.title);
  }
}
await browser.close();

console.log(`scanned ${picked.length} stories (one per component)\n`);
const rows = Object.entries(byRule).sort((a, b) => b[1].count - a[1].count);
if (!rows.length) console.log('no violations');
for (const [rule, v] of rows) {
  console.log(`${rule}  [${v.impact}]  ${v.count} nodes across ${v.stories.length} stories`);
  console.log(`   ${v.stories.slice(0, 8).join(', ')}${v.stories.length > 8 ? ', …' : ''}`);
}
