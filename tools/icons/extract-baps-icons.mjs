/**
 * Turn the Figma export of the "BAPS Pixel Icons" sheet (node 13193:56731)
 * into libs/ui-kit/src/lib/components/icon/icon-set.ts.
 *
 *   node tools/icons/extract-baps-icons.mjs <sheet.svg> <metadata.json> <out.ts>
 *
 * Inputs:
 *   sheet.svg     the whole-sheet SVG export (download_assets on the root node)
 *   metadata.json the get_metadata result for the same node, which is where the
 *                 per-icon name and canvas position come from
 *
 * Why the whole sheet and not one export per icon: Figma's asset endpoint
 * returns one file per call, and there are 541 icons. The sheet export already
 * contains every icon as its own <g id="Name">, so one download plus the
 * geometry below beats 541 round trips.
 *
 * Two things have to be undone, and both are deterministic:
 *
 * 1. SCALE. The sheet is 1210x14041 on the canvas but Figma caps the export at
 *    4096px tall, so everything comes back multiplied by k = 4096/14041 —
 *    including stroke-width, which arrives as 0.2917 instead of 1. Scaling by
 *    1/k restores the geometry AND the stroke, because stroke-width scales with
 *    the transform.
 *
 * 2. POSITION. Each icon is drawn where it sits on the sheet, so its path
 *    coordinates are absolute (the Notification glyph starts near x=35, y=80).
 *    Translating by its canvas position brings it back to a 0 0 24 24 box.
 *
 * The transform is emitted rather than baked into the path data on purpose:
 * rewriting every coordinate means parsing arcs and beziers, which is a lot of
 * ways to be subtly wrong for no gain the browser cares about.
 *
 * The stroke is also hard-coded to #151414 (Sampark Mono/100) and is rewritten
 * to currentColor, so an icon takes the colour of whatever it sits in — that is
 * what lets one icon work in both brands and both modes without a variant.
 */
import fs from 'node:fs';
import path from 'node:path';

const [sheetFile, metaFile, outFile] = process.argv.slice(2);
if (!sheetFile || !metaFile || !outFile) {
  console.error('usage: extract-baps-icons.mjs <sheet.svg> <metadata.json> <out.ts>');
  process.exit(1);
}

// ── the icons, and where each one sits on the sheet ──────────────────────────
const metaXml = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
  .map((x) => x.text)
  .join('\n');

const instances = [
  ...metaXml.matchAll(
    /<instance id="([^"]+)" name="([^"]+)" x="(-?[\d.]+)" y="(-?[\d.]+)" width="24" height="24"/g,
  ),
].map((m) => ({ id: m[1], name: m[2].trim(), x: +m[3], y: +m[4] }));

if (!instances.length) throw new Error('no 24x24 icon instances found in the metadata');

// ── the sheet ───────────────────────────────────────────────────────────────
const sheet = fs.readFileSync(sheetFile, 'utf8');
const root = sheet.match(/<svg[^>]*viewBox="0 0 ([\d.]+) ([\d.]+)"/);
if (!root) throw new Error('could not read the sheet viewBox');
const exportHeight = +root[2];

// The canvas height the export was made from, taken from the sheet's own
// background rect in the metadata rather than hard-coded.
const canvas = metaXml.match(/<frame id="[^"]+" name="BAPS Pixel Icons"[^>]*height="([\d.]+)"/);
if (!canvas) throw new Error('could not read the sheet height from the metadata');
const canvasHeight = +canvas[1];

const k = exportHeight / canvasHeight;
const invK = 1 / k;

/**
 * Slice out one <g id="NAME"> … </g>, counting nesting so icons that contain
 * their own groups (User is two paths inside a <g>) are not truncated at the
 * first </g>.
 */
const sliceGroup = (src, startIdx) => {
  const open = src.indexOf('>', startIdx) + 1;
  let depth = 1;
  let i = open;
  while (depth > 0) {
    const nextOpen = src.indexOf('<g', i);
    const nextClose = src.indexOf('</g>', i);
    if (nextClose === -1) throw new Error('unbalanced <g> in the sheet');
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 2;
    } else {
      depth--;
      i = nextClose + 4;
    }
  }
  return { body: src.slice(open, i - 4), end: i };
};

/** Figma layer name -> the kebab-case name the component takes. */
const toName = (s) =>
  s
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Figma suffixes repeated layer names (_2, _3…). Group them by base name so the
// nth occurrence of a name lines up with the nth instance of that name.
const byName = new Map();
for (const inst of instances) {
  if (!byName.has(inst.name)) byName.set(inst.name, []);
  byName.get(inst.name).push(inst);
}

const seen = new Map();
const icons = [];
const skipped = [];

const groupRe = /<g id="([^"]+)"/g;
let m;
while ((m = groupRe.exec(sheet)) !== null) {
  const rawName = m[1];
  // Trim before matching: several layer names carry a trailing space in Figma
  // ("Notebook ", "Heart ", "Minimize "), the metadata reader strips it, and
  // the sheet export does not. Without this, 37 icons silently fail to match.
  const base = rawName.trim().replace(/_\d+$/, '');
  const candidates = byName.get(base);
  if (!candidates) continue; // headers, frames, the wrapper

  const nth = seen.get(base) ?? 0;
  seen.set(base, nth + 1);
  // The sheet can hold more groups under a name than there are 24x24 instances
  // — "Sort List" appears twice but is placed once. Falling back to the last
  // known position would emit a glyph translated to the wrong place, which
  // renders as an empty box rather than an obvious error. Skip instead: without
  // an instance there is no position, and a guess is worse than an omission.
  const inst = candidates[nth];
  if (!inst) {
    skipped.push(`${rawName} — group has no matching 24x24 instance, so no position`);
    continue;
  }

  const { body } = sliceGroup(sheet, m.index);

  const cleaned = body
    .replace(/\s+id="[^"]*"/g, '')
    .replace(/stroke="#151414"/gi, 'stroke="currentColor"')
    .replace(/fill="#151414"/gi, 'fill="currentColor"')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/<(path|circle|rect|line|polyline|polygon|ellipse)/.test(cleaned)) {
    skipped.push(`${rawName} — no drawable content`);
    continue;
  }
  if (/#313131|fill="white"/.test(cleaned)) {
    skipped.push(`${rawName} — sheet chrome leaked in`);
    continue;
  }

  const key = toName(rawName.replace(/_(\d+)$/, '-$1'));
  if (icons.some((i) => i.key === key)) {
    skipped.push(`${rawName} — duplicate key ${key}`);
    continue;
  }

  // Undo the export scale, then move the glyph back to the origin.
  //
  // stroke-width on the wrapper is load-bearing. Most glyphs arrive with an
  // explicit stroke-width="0.291717" that the scale restores to 1, but 36 of
  // them carry no stroke-width at all and so fall back to the SVG default of 1
  // — which the same scale then blows up to 3.4px, rendering them as solid
  // blobs. stroke-width inherits, so setting it to k here gives those glyphs
  // the right base while the ones that declare their own keep overriding it.
  const tx = (-inst.x).toFixed(3);
  const ty = (-inst.y).toFixed(3);
  const s = invK.toFixed(6);
  const wrapped =
    `<g transform="translate(${tx} ${ty}) scale(${s})" stroke-width="${k.toFixed(6)}">` +
    `${cleaned}</g>`;

  icons.push({ key, body: wrapped });
}

icons.sort((a, b) => a.key.localeCompare(b.key));

const out = `/**
 * BAPS Pixel Icons — generated, do not edit by hand.
 *
 * Source: Figma "Sampark Portal", node 13193:56731 ("BAPS Pixel Icons").
 * Regenerate with:
 *
 *   node tools/icons/extract-baps-icons.mjs <sheet.svg> <metadata.json> ${outFile
   .split(path.sep)
   .join('/')}
 *
 * Every icon is a 24x24 stroked glyph whose stroke is \`currentColor\`, so it
 * takes the colour of the text around it in either brand and either mode.
 *
 * Each entry carries a transform. That is not decoration: the sheet export is
 * scaled to fit Figma's 4096px export cap and every glyph is drawn at its
 * position on the 1210x14041 sheet, so the transform undoes both. See the
 * extractor for the arithmetic.
 *
 * ponytail: a flat string registry is honest at this size but it is ~${Math.round(
   icons.reduce((n, i) => n + i.body.length, 0) / 1024,
 )}KB of
 * source that every consumer bundles whole. If icon weight ever shows up in a
 * bundle report, move to per-icon lazy imports or an SVG sprite — the component
 * API does not have to change for either.
 */

/**
 * The names are the \`as const\` source of truth and the icon bodies are typed
 * as plain strings. The other way round — \`as const\` on the bodies — makes the
 * inferred type include 541 multi-kilobyte string literals, which TypeScript
 * refuses to serialize into a .d.ts (TS7056).
 */
export const BAPS_ICON_NAMES = [
${icons.map((i) => `  '${i.key}',`).join('\n')}
] as const;

export type BapsIconName = (typeof BAPS_ICON_NAMES)[number];

export const BAPS_ICONS: Record<BapsIconName, string> = {
${icons.map((i) => `  '${i.key}':\n    '${i.body.replace(/'/g, "\\'")}',`).join('\n')}
};
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out, 'utf8');

console.log(`icon instances in metadata : ${instances.length}`);
console.log(`export scale k             : ${k.toFixed(6)} (${exportHeight} / ${canvasHeight})`);
console.log(`icons written              : ${icons.length}`);
console.log(`skipped                    : ${skipped.length}`);
skipped.slice(0, 15).forEach((s) => console.log('   ' + s));
console.log(`registry size              : ${(out.length / 1024).toFixed(0)}KB`);
