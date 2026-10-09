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

// One env var for every guard, so tools/with-storybook.mjs can point the
// whole set at the server it started. Falls back to the port the storybook
// target uses, which is what a developer running it by hand gets.
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';

// axe-core arrives as a transitive dep of @storybook/addon-a11y, so it is not
// hoisted to the root and require.resolve cannot see it. Read it out of the
// pnpm store instead of adding a direct dependency for a dev-only script.
const store = 'node_modules/.pnpm';
const axeDir = readdirSync(store).find((d) => /^axe-core@/.test(d));
if (!axeDir) throw new Error('axe-core not found in the pnpm store — is addon-a11y installed?');
const axeSource = readFileSync(`${store}/${axeDir}/node_modules/axe-core/axe.min.js`, 'utf8');

const res = await fetch(`${BASE}/index.json`);
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
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${s.id}`, {
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

/**
 * What this audit is known to report today, and why each one is still here.
 *
 * Until now the audit printed its findings and exited 0, so it sat in the CI
 * suite reporting two CRITICAL rules and nobody saw it — `with-storybook.mjs`
 * listed it as "ok". Exiting 1 on everything would have been just as useless,
 * because the whole list goes red on day one and stays red.
 *
 * So: a rule here is accounted for, and the count is the ceiling. Exceed the
 * ceiling, or introduce a rule that is not listed, and the audit fails. Fix
 * something and lower the number — it is meant to ratchet down.
 */
const KNOWN = {
  'color-contrast': {
    max: 52,
    why: 'not yet triaged — 52 nodes over 12 stories, needs a design pass',
  },
  'aria-allowed-attr': {
    max: 2,
    why: 'progress-bar: PrimeNG binds aria-valuenow on its own host whatever the mode, and neither wrapper lever overrides it. Open design decision in BRAIN.md',
  },
  'aria-valid-attr-value': {
    max: 2,
    why: 'the same progress-bar host binding as aria-allowed-attr',
  },
  'scrollable-region-focusable': {
    max: 1,
    why: 'listbox — proven a false positive and pinned by a test; see listbox.mdx',
  },
  'aria-required-children': {
    max: 1,
    why: "stepper — PrimeNG puts role=tablist on the stepper ROOT, so the tabpanels sit inside it. Needs an upstream fix or a decision to drop PrimeNG's stepper markup",
  },
  'aria-dialog-name': {
    max: 1,
    why: 'Patterns/Delete confirmation — its baps-dialog does carry a header, so the flagged node has not been identified yet',
  },
};

const regressions = [];
for (const [rule, v] of rows) {
  const known = KNOWN[rule];
  if (!known) {
    regressions.push(`${rule} [${v.impact}] — new, ${v.count} nodes`);
  } else if (v.count > known.max) {
    regressions.push(`${rule} — ${v.count} nodes, was ${known.max}`);
  }
}

if (regressions.length) {
  console.error('\na11y regressions:');
  for (const r of regressions) console.error('  ' + r);
  console.error('\nFix it, or raise the ceiling in KNOWN with a reason.');
  process.exit(1);
}

console.log('\nno a11y regressions — every finding is accounted for in KNOWN:');
for (const [rule, v] of rows) console.log(`  ${rule} (${v.count}) — ${KNOWN[rule].why}`);
