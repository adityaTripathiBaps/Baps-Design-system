/**
 * Framework snippets for the Split button docs page.
 *
 * ## Route B: no Custom tab, and the guard is why
 *
 * A Custom tab was written first and check-snippets rejected it, correctly.
 * `split-button.css` targets `.p-splitbutton`, `.p-splitbutton-dropdown` and
 * the `.p-button-*` severities and sizes — but those are PrimeNG class names,
 * and this stylesheet is only the DELTA on top of the rules PrimeNG generates
 * at runtime from the preset. Raw markup would pick up our delta and none of
 * the base, so it would render wrong while looking plausible.
 *
 * The menu is a second reason: it opens into an overlay positioned at click
 * time, which no flat markup reproduces.
 *
 * What the classes still buy is the React component — `BapsSplitButton` emits
 * the same names, and a consuming app that loads the preset gets both layers.
 *
 * ## Two buttons, one control
 *
 * The default action and the menu toggle are separate `<button>` elements on
 * purpose: they do different things and each needs its own accessible name.
 * `aria-haspopup="menu"` and `aria-expanded` belong on the SECOND one only.
 * A single button carrying both jobs cannot say which one Enter will do.
 *
 * `count` is a badge on the default action, not on the menu — it belongs to
 * the thing the button does, and `countLabel` is what makes "3" mean
 * something to a screen reader.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('split-button');

export const splitButtonSnippets: Record<string, SnippetSet> = {
  // The controls story.
  Playground: {
    primeng: `<baps-split-button label="Save" [model]="items" />`,
    react: `${SETUP}

const ITEMS = [
  { label: 'Save and close', command: () => {} },
  { label: 'Save as draft', command: () => {} },
];

export function SaveSplit({ onSave }) {
  return <BapsSplitButton label="Save" model={ITEMS} onClick={onSave} />;
}`,
    next: `'use client';

${SETUP}

/* 'use client': the menu opens on click and positions itself. */
export default function SaveSplit({ onSave }) {
  return <BapsSplitButton label="Save" model={ITEMS} onClick={onSave} />;
}`,
  },

  // With a count on the default action.
  WithCount: {
    primeng: `<baps-split-button label="Approve" [count]="3" countLabel="3 pending" [model]="items" />`,
    react: `${SETUP}

export function ApproveSplit({ pending, onApprove }) {
  // countLabel is the accessible version. Without it the badge is a number
  // with no noun attached.
  return (
    <BapsSplitButton
      label="Approve"
      count={pending}
      countLabel={pending + ' pending'}
      model={ITEMS}
      onClick={onApprove}
    />
  );
}`,
    next: `'use client';

${SETUP}

export default function ApproveSplit({ pending, onApprove }) {
  return (
    <BapsSplitButton
      label="Approve"
      count={pending}
      countLabel={pending + ' pending'}
      model={ITEMS}
      onClick={onApprove}
    />
  );
}`,
  },

  // MyBKY. The default brand, so no scope class anywhere.
  MyBKY: {
    primeng: `<baps-split-button brand="mybky" label="Save" [model]="items" />`,
    react: `${SETUP}

export function MyBkySplit({ onSave }) {
  return <BapsSplitButton label="Save" model={ITEMS} onClick={onSave} />;
}`,
    next: `'use client';

${SETUP}

export default function MyBkySplit({ onSave }) {
  return <BapsSplitButton label="Save" model={ITEMS} onClick={onSave} />;
}`,
  },

  // Every severity and size together.
  Matrix: {
    primeng: `<baps-split-button label="Save" severity="secondary" size="small" [model]="items" />
<baps-split-button label="Delete" severity="danger" [model]="items" />
<baps-split-button label="Publish" size="xlarge" [model]="items" />`,
    react: `${SETUP}

const VARIANTS = [
  { label: 'Save', severity: 'secondary', size: 'small' },
  { label: 'Delete', severity: 'danger' },
  { label: 'Publish', size: 'xlarge' },
];

export function SplitMatrix() {
  return (
    <>
      {VARIANTS.map((v) => (
        <BapsSplitButton key={v.label} {...v} model={ITEMS} />
      ))}
    </>
  );
}`,
    next: `'use client';

${SETUP}

export default function SplitMatrix() {
  return (
    <>
      {VARIANTS.map((v) => (
        <BapsSplitButton key={v.label} {...v} model={ITEMS} />
      ))}
    </>
  );
}`,
  },
};
