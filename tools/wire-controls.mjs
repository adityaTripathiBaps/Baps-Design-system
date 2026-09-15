// Make every component's Controls panel usable, derived from compodoc rather
// than hand-listed.
//
// Three separate problems, measured before and after:
//
//  1. Implementation internals as controls. Fixed globally in preview.ts via
//     CONTROLS_EXCLUDE — 137 non-input members across the library. Not this
//     script's job, but it is why this script's numbers look sane.
//
//  2. An arg with no value renders a PLACEHOLDER button ("Set boolean",
//     "Set number") instead of a live control. A panel of those is a list a
//     reader has to click through before anything is editable. Boolean and
//     numeric inputs have unambiguous defaults, so this script writes them into
//     the meta's `args`.
//
//     Deliberately NOT done for optional strings and objects. Setting `icon: ''`
//     would make the control live and could change what renders, which moves a
//     visual baseline for no reader benefit; and a real dataset for an
//     `options` input is component-specific. "Set string" on a genuinely
//     optional string is Storybook's normal behaviour.
//
//  3. Outputs shown as controls. An @Output is not editable, so it renders as
//     "Set object" and reads like a broken control. `control: false` keeps the
//     row — it still documents the event — without pretending.
//
//   node tools/wire-controls.mjs [--dry]
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const DRY = process.argv.includes('--dry');
const base = 'libs/ui-kit/src/lib/components';
const doc = JSON.parse(readFileSync('documentation.json', 'utf8'));

/** compodoc entry for a component class, by name. */
const byName = new Map();
for (const c of doc.components ?? []) byName.set(c.name, c);
for (const d of doc.directives ?? []) byName.set(d.name, d);

const parseLiteral = (raw) => {
  if (raw === undefined || raw === null) return undefined;
  const v = String(raw).trim();
  if (v === 'true') return 'true';
  if (v === 'false') return 'false';
  if (/^-?\d+(\.\d+)?$/.test(v)) return v;
  return undefined; // anything else is not a safe literal to copy
};

let touched = 0;
const report = [];

for (const dir of readdirSync(base)) {
  const file = `${base}/${dir}/${dir}.stories.ts`;
  if (!existsSync(file)) continue;
  let src = readFileSync(file, 'utf8');

  // Which component class does this story's meta describe?
  //
  // The meta type is sometimes a LOCAL alias — `type Args = BapsAlert & …`, or a
  // hand-written `interface FileUploadArgs`. Resolve it to the component class
  // before asking compodoc, or eleven components are skipped for no reason.
  const declared = src.match(/const meta: Meta<(\w+)>/)?.[1];
  const alias = declared
    ? src.match(new RegExp(`type ${declared} = (\\w+)`))?.[1]
    : undefined;
  const imported = src.match(/import \{ (Baps\w+)/)?.[1];
  const cls = [declared, alias, imported].find((n) => n && byName.has(n));
  const entry = cls && byName.get(cls);
  if (!entry) {
    report.push([dir, 'no compodoc entry for ' + (cls ?? 'meta type')]);
    continue;
  }

  const metaEnd = src.indexOf('\nexport default meta');
  const meta = src.slice(0, metaEnd);

  // Only the args BLOCK counts as "already set". Checking the whole meta let an
  // argTypes entry of the same name look like an arg, so slider reported
  // "already complete" while its panel showed four placeholder rows.
  const argsStart = meta.search(/^  args: \{/m);
  const argsBlock =
    argsStart === -1 ? '' : meta.slice(argsStart, meta.indexOf('\n  },', argsStart) + 1);

  // ── 2. boolean / numeric args with a declared default ──
  const wanted = [];
  for (const i of entry.inputsClass ?? []) {
    const lit = parseLiteral(i.defaultValue);
    if (lit === undefined) continue;
    if (new RegExp(`^\\s*${i.name}:`, 'm').test(argsBlock)) continue; // already set
    wanted.push(`    ${i.name}: ${lit},`);
  }

  // ── 3. outputs are not controls ──
  const outs = (entry.outputsClass ?? []).map((o) => o.name);
  const missingOuts = outs.filter(
    (o) => !new RegExp(`^\\s*${o}: \\{ control: false`, 'm').test(meta),
  );

  if (!wanted.length && !missingOuts.length) {
    report.push([dir, 'already complete']);
    continue;
  }

  // Insert args.
  if (wanted.length) {
    if (/^  args: \{$/m.test(meta)) {
      src = src.replace(/^  args: \{$/m, (m) => `${m}\n${wanted.join('\n')}`);
    } else if (/^  args: \{ (.*) \},$/m.test(meta)) {
      src = src.replace(
        /^  args: \{ (.*) \},$/m,
        (_m, inner) => `  args: {\n    ${inner},\n${wanted.join('\n')}\n  },`,
      );
    } else {
      const idLine = meta.match(/^  id: '[^']*',$/m);
      if (idLine) {
        src = src.replace(
          idLine[0],
          `${idLine[0]}\n  // Defaults copied from the component's own inputs, so every boolean and\n  // numeric control renders live rather than as a "Set …" placeholder.\n  args: {\n${wanted.join('\n')}\n  },`,
        );
      }
    }
  }

  // Insert output argTypes.
  if (missingOuts.length) {
    const block = missingOuts
      .map((o) => `    ${o}: { control: false },`)
      .join('\n');
    if (/^  argTypes: \{$/m.test(src.slice(0, src.indexOf('\nexport default meta')))) {
      src = src.replace(/^  argTypes: \{$/m, (m) => `${m}\n${block}`);
    } else {
      const idLine = src.slice(0, src.indexOf('\nexport default meta')).match(/^  id: '[^']*',$/m);
      if (idLine) {
        src = src.replace(
          idLine[0],
          `${idLine[0]}\n  // Outputs are not editable — keep the row (it documents the event) but\n  // do not render a control that pretends otherwise.\n  argTypes: {\n${block}\n  },`,
        );
      }
    }
  }

  if (!DRY) writeFileSync(file, src);
  touched++;
  report.push([
    dir,
    `${wanted.length} arg default(s), ${missingOuts.length} output(s) marked`,
  ]);
}

for (const [d, msg] of report) console.log(d.padEnd(22), msg);
console.log(`\n${touched} story file(s) ${DRY ? 'would change' : 'changed'}`);
