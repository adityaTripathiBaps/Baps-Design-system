// Second step after gen-guide-data.mjs: turns every before/after screenshot into a
// compact WebP and renders every code change as an editor-style screenshot, then
// bundles them into a few img-pack-N.json files beside data.json (path -> data URL).
// A handful of bundles publishes far more easily than hundreds of loose PNGs.
//
// Usage: node tools/pack-guide-images.mjs <dir holding data.json>
// Uses Playwright's own headless Chromium (not any running debug browser).
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const DIR = process.argv[2];
if (!DIR) {
  console.error(
    'Usage: node tools/pack-guide-images.mjs <dir holding data.json>',
  );
  process.exit(1);
}
const D = JSON.parse(readFileSync(join(DIR, 'data.json'), 'utf8'));
const PACK_LIMIT = 9 * 1024 * 1024; // characters per bundle
const packs = [{}];
let size = 0;
const put = (id, dataUrl) => {
  if (size + dataUrl.length > PACK_LIMIT && Object.keys(packs.at(-1)).length) {
    packs.push({});
    size = 0;
  }
  packs.at(-1)[id] = dataUrl;
  size += dataUrl.length;
  return id;
};

const esc = (s) =>
  String(s).replace(
    /[&<>]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c],
  );
const pane = (lines, start, side) => {
  let n = start;
  return lines
    .filter(
      (l) =>
        !(side === 'before' && l[0] === '+') &&
        !(side === 'after' && l[0] === '-'),
    )
    .map(
      (l) =>
        `<span class="ln">${n++}</span><span class="lc ${l[0] === '-' ? 'del' : l[0] === '+' ? 'add' : ''}">${esc(l.slice(1)) || ' '}</span>`,
    )
    .join('');
};
const EDITOR_CSS = `
  body { margin: 0; background: #141010; font-family: Consolas, 'Cascadia Code', monospace; }
  #ed { width: 1200px; background: #1e1b1b; border: 1px solid #332c2c; border-radius: 10px; overflow: hidden; }
  .tabs { display: flex; gap: 6px; align-items: center; padding: 10px 14px; background: #2a2424; border-bottom: 1px solid #3a3232; }
  .dot { width: 11px; height: 11px; border-radius: 50%; background: #5a4c4c; }
  .file { margin-left: 8px; font-size: 13px; color: #d8cfcf; }
  .panes { display: grid; grid-template-columns: 1fr 1fr; }
  .pane { min-width: 0; border-right: 1px solid #3a3232; }
  .pane:last-child { border-right: 0; }
  .label { font: 700 11px system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; padding: 7px 14px; margin: 0; background: #241f1f; color: #e3a3a3; }
  .pane:last-child .label { color: #8fd1ad; }
  pre { margin: 0; padding: 10px 0; font-size: 13px; line-height: 1.6; color: #e8e2e2; display: grid; grid-template-columns: auto 1fr; }
  .ln { color: #7d6f6f; text-align: right; padding: 0 10px 0 14px; }
  .lc { white-space: pre-wrap; word-break: break-all; padding-right: 14px; }
  .del { background: rgba(255, 92, 92, .2); color: #ffb4b0; }
  .add { background: rgba(76, 200, 130, .2); color: #a6f0c6; }`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
const toWebp = async (file) => {
  const b64 = readFileSync(file).toString('base64');
  return page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, 1440 / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.8);
  }, 'data:image/png;base64,' + b64);
};

let shots = 0,
  codeShots = 0;
for (const s of D.screens) {
  s.before = put(`${s.key}-before`, await toWebp(s.beforeSrc));
  s.after = put(`${s.key}-after`, await toWebp(s.afterSrc));
  s.diff = s.diffSrc ? put(`${s.key}-diff`, await toWebp(s.diffSrc)) : null;
  delete s.beforeSrc;
  delete s.afterSrc;
  delete s.diffSrc;
  shots++;
}

for (const c of D.swaps) {
  for (const [fi, f] of c.files.entries()) {
    for (const [hi, h] of f.hunks.entries()) {
      await page.setContent(`<style>${EDITOR_CSS}</style><div id="ed"><div class="tabs"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="file">${esc(f.file)}</span></div>
        <div class="panes"><div class="pane"><p class="label">Before</p><pre>${pane(h.lines, h.oldStart, 'before')}</pre></div>
        <div class="pane"><p class="label">After</p><pre>${pane(h.lines, h.newStart, 'after')}</pre></div></div></div>`);
      const buf = await page
        .locator('#ed')
        .screenshot({ type: 'jpeg', quality: 88 });
      h.shot = put(
        `code-${c.hash}-${fi}-${hi}`,
        'data:image/jpeg;base64,' + buf.toString('base64'),
      );
      codeShots++;
    }
  }
}
await browser.close();

for (const f of readdirSync(DIR).filter((n) => /^img-pack-\d+\.json$/.test(n)))
  unlinkSync(join(DIR, f));
D.imgPacks = {};
packs.forEach((p, i) => {
  writeFileSync(join(DIR, `img-pack-${i + 1}.json`), JSON.stringify(p));
  Object.keys(p).forEach((id) => {
    D.imgPacks[id] = i + 1;
  });
});
writeFileSync(join(DIR, 'data.json'), JSON.stringify(D));
console.log(
  `${shots} screen pairs, ${codeShots} code screenshots, ${packs.length} bundles`,
);
