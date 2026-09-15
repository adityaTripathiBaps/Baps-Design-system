// One-shot: move the output reporters from args-spies to render-prop actions.
//
// Kept in tools/ rather than run and deleted because the reasoning is the
// useful part: getting Actions to work in an Angular wrapper library took three
// wrong turns, and the next person adding a component will hit the same ones.
//
//  1. `actions: { argTypesRegex }` in preview.ts. Storybook ASSIGNS args onto
//     the component instance, so a matched @Output's spy replaces the real
//     EventEmitter. Five interaction stories silently stopped working — drawer
//     and popover would not open, pagination would not page.
//  2. `fn()` spies in args, bound in the template. Safe, but the Actions panel
//     never shows them: an fn() bound in an Angular template is just a function
//     the template calls, and the addon is not watching it.
//  3. `action('name')` in render props, bound in the template. This is the one.
//     action() reports to the panel by design, and naming the prop `onX` rather
//     than `X` keeps it out of the instance's own namespace so no emitter is
//     overwritten.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const base = 'libs/ui-kit/src/lib/components';

const OUTS = {
  alert: ['closed', 'primaryActionClick', 'secondaryActionClick'],
  drawer: ['shown'],
  'file-upload': ['filesSelected'],
  'internal-navbar': ['itemClick'],
  navbar: ['menuToggle', 'mobileMenuToggle'],
  'split-button': ['clicked'],
  'table-column-config': ['closed'],
  tag: ['actionClick'],
};

const cap = (o) => 'on' + o[0].toUpperCase() + o.slice(1);

for (const [dir, outs] of Object.entries(OUTS)) {
  const file = `${base}/${dir}/${dir}.stories.ts`;
  if (!existsSync(file)) {
    console.log(dir, '— no stories file');
    continue;
  }
  let src = readFileSync(file, 'utf8');
  const spyNames = outs.map(cap);

  // 1. Drop the fn() spies from args, and any local-interface key that
  //    declared them. Whole-line matching, so no regex escaping to get wrong.
  src = src
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (spyNames.some((n) => t === `${n}: fn(),`)) return false;
      if (spyNames.some((n) => t.startsWith(`${n}: (`) && t.endsWith('=> void;'))) return false;
      return true;
    })
    .join('\n');

  // 2. Add the reporters to the meta render's props.
  const metaEnd = src.indexOf('\nexport default meta');
  const meta = src.slice(0, metaEnd);
  const reporters = outs.map((o) => `${cap(o)}: action('${o}')`).join(', ');

  let replaced = null;
  if (meta.includes('props: { ...args,')) {
    replaced = ['props: { ...args,', `props: { ...args, ${reporters},`];
  } else if (meta.includes('props: args,')) {
    replaced = ['props: args,', `props: { ...args, ${reporters} },`];
  } else if (/props: \{\n/.test(meta)) {
    replaced = ['props: {\n', `props: {\n      ${reporters},\n`];
  }
  if (!replaced) {
    console.log(dir, '— no props in the meta render, skipped');
    continue;
  }
  src = src.slice(0, metaEnd).replace(replaced[0], replaced[1]) + src.slice(metaEnd);

  // 3. Import action() once.
  if (!src.includes("from '@storybook/addon-actions'")) {
    src = src.replace(
      "import type { Meta, StoryObj } from '@storybook/angular';",
      "import type { Meta, StoryObj } from '@storybook/angular';\nimport { action } from '@storybook/addon-actions';",
    );
  }

  writeFileSync(file, src);
  console.log(dir.padEnd(22), 'reporters:', spyNames.join(' '));
}
