// Third step for the guide page: records a short video of one Storybook story per
// component from a running Storybook (default http://localhost:4400), preferring a
// story with a play function ("…-interaction") so the clip shows the component
// being used. Videos are bundled into vid-pack-N.json beside data.json.
//
// Usage: node tools/record-guide-videos.mjs <dir holding data.json>
// Env:   STORYBOOK_URL (default http://localhost:4400)
// Uses Playwright's own headless Chromium, one story at a time.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const DIR = process.argv[2];
if (!DIR) {
  console.error('Usage: node tools/record-guide-videos.mjs <dir holding data.json>');
  process.exit(1);
}
const SB = process.env.STORYBOOK_URL ?? 'http://localhost:4400';
const D = JSON.parse(readFileSync(join(DIR, 'data.json'), 'utf8'));
const index = await fetch(`${SB}/index.json`).then((r) => r.json());
const stories = Object.values(index.entries).filter((e) => e.type === 'story');

// One story per component group: an interaction story first, then a Sampark one, then the first story.
const groups = new Map();
for (const s of stories) {
  const g = s.id.split('--')[0];
  if (!g.startsWith('components-') && !g.startsWith('patterns-')) continue;
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(s);
}
const pick = (list) =>
  list.find((s) => /sampark.*interaction|interaction.*sampark/.test(s.id)) ??
  list.find((s) => /-interaction$/.test(s.id) && !/keyboard|disabled|escape|focus/.test(s.id)) ??
  list.find((s) => /-interaction$/.test(s.id)) ??
  list.find((s) => /sampark/.test(s.id)) ??
  list.find((s) => /default|playground/.test(s.id)) ??
  list[0];

const TMP = join(DIR, '.vid-tmp');
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
const browser = await chromium.launch();
const videos = {};
const packs = [{}];
let size = 0;
const LIMIT = 9 * 1024 * 1024;

for (const [group, list] of groups) {
  const story = pick(list);
  const ctx = await browser.newContext({ viewport: { width: 800, height: 500 }, recordVideo: { dir: TMP, size: { width: 800, height: 500 } } });
  // Small components render tiny in the top-left corner; zoom them so they fill the clip.
  // Wide ones (tables, drawers, shells, patterns) keep their size so nothing is cut off.
  const wide = /table|navbar|toolbar|drawer|dialog|patterns-|columnconfig|sortconfig|usersdropdown|datepicker|card|listbox|alert|stepper|editor|fileupload|form-controls/.test(group);
  await ctx.addInitScript((z) => { document.documentElement.style.zoom = z; }, wide ? '0.8' : '1.8');
  const page = await ctx.newPage();
  try {
    await page.goto(`${SB}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(900);
    if (!/-interaction$/.test(story.id)) {
      // No play function: hover and click the first control so the clip still shows it in use.
      const target = page.locator('#storybook-root').locator('button, [role="combobox"], input, a, [tabindex="0"]').first();
      if (await target.count()) {
        const box = await target.boundingBox().catch(() => null);
        if (box) {
          await page.mouse.move(40, 40);
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
          await page.waitForTimeout(700);
          await target.click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(1600);
          await page.keyboard.press('Escape').catch(() => {});
        }
      }
    }
    await page.waitForTimeout(/-interaction$/.test(story.id) ? 5200 : 1200);
  } catch (e) {
    console.warn(`skip ${story.id}: ${e.message.split('\n')[0]}`);
  }
  const video = page.video();
  await ctx.close();
  const file = video ? await video.path() : null;
  if (!file) continue;
  const data = 'data:video/webm;base64,' + readFileSync(file).toString('base64');
  if (size + data.length > LIMIT && Object.keys(packs.at(-1)).length) { packs.push({}); size = 0; }
  const id = `vid-${group}`;
  packs.at(-1)[id] = data;
  size += data.length;
  videos[group] = { id, story: story.id, title: story.title, name: story.name };
  console.log(`${group}: ${story.id} (${Math.round(data.length / 1024)} KB)`);
}
await browser.close();
rmSync(TMP, { recursive: true, force: true });

for (const f of readdirSync(DIR).filter((n) => /^vid-pack-\d+\.json$/.test(n))) unlinkSync(join(DIR, f));
D.videos = videos;
D.vidPacks = {};
packs.forEach((p, i) => {
  writeFileSync(join(DIR, `vid-pack-${i + 1}.json`), JSON.stringify(p));
  Object.keys(p).forEach((id) => { D.vidPacks[id] = i + 1; });
});
writeFileSync(join(DIR, 'data.json'), JSON.stringify(D));
console.log(`${Object.keys(videos).length} videos in ${packs.length} bundles`);
