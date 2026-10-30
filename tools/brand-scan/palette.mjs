/**
 * Build the brand-exclusive colour sets the brand scan looks for.
 *
 *   node tools/brand-scan/palette.mjs [tokens.css]
 *
 * Reads every `--*mybky*` / `--*sampark*` hex token from the built tokens CSS
 * (default: this repo's libs/tokens/build/css/tokens.css) and writes
 * palette.json next to this file: colours that exist in one brand's palette
 * and not the other's. A computed colour from that set on a page of the other
 * brand is a wrong-brand hit. Copied from audits/tools/brand-scan (2026-10-30).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const src =
  process.argv[2] ??
  fileURLToPath(
    new URL('../../libs/tokens/build/css/tokens.css', import.meta.url),
  );
const css = readFileSync(src, 'utf8');

const norm = (hex) => {
  let h = hex.toLowerCase().replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (h.length !== 6) return null;
  return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
};

const sets = { mybky: {}, sampark: {} };
for (const m of css.matchAll(
  /--([\w-]*(mybky|sampark)[\w-]*):\s*(#[0-9a-fA-F]{3,6})\b/g,
)) {
  const rgb = norm(m[3]);
  if (rgb) (sets[m[2]][rgb] ??= []).push(m[1]);
}
const out = { mybkyOnly: {}, samparkOnly: {} };
for (const [rgb, names] of Object.entries(sets.mybky))
  if (!sets.sampark[rgb]) out.mybkyOnly[rgb] = names[0];
for (const [rgb, names] of Object.entries(sets.sampark))
  if (!sets.mybky[rgb]) out.samparkOnly[rgb] = names[0];
writeFileSync(`${here}palette.json`, JSON.stringify(out, null, 2) + '\n');
console.log(
  `mybkyOnly ${Object.keys(out.mybkyOnly).length}, samparkOnly ${Object.keys(out.samparkOnly).length}`,
);
