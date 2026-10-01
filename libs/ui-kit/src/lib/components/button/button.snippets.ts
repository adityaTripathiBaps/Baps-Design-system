/**
 * Framework snippets for the Button docs page, keyed by story export name.
 *
 * ## Button is the first component where the Custom tab is AUTHORED
 *
 * On Card and Alert the Custom tab renders Storybook's own source for the
 * story, and that is already PrimeNG-free: neither component wraps PrimeNG, so
 * `<baps-card>` markup pasted into a plain HTML page works unchanged.
 *
 * Button does wrap PrimeNG. `<baps-button>` renders `<p-button>` inside it, so
 * its live Angular source is not copyable outside Angular — a raw
 * `<baps-button>` element is empty: nothing to style, nothing to click. So the
 * Custom tab here carries hand-written markup instead, and
 * `libs/ui-kit/src/lib/styles/components/button/_button.scss` is the
 * stylesheet that makes it render identically. That file's header explains why
 * it is authored from tokens rather than extracted from the component.
 *
 * ## Why these are not fiction
 *
 * Every `custom` block below is rendered on a bare HTML page — no Angular, no
 * Storybook, no PrimeNG — by `tools/check-button-drift.mjs`, which then diffs
 * it property by property against the live Angular render of the same story.
 * The checker reads the `custom` strings out of THIS FILE, so the markup that
 * is verified is the markup the tab shows. If a theme-token edit moves the
 * Angular button and not this one, the checker fails.
 *
 * ## Inputs become classes
 *
 * Outside Angular you write the class the input would have produced:
 *
 *   severity="primary"        -> class="baps-button--primary"
 *   severity="secondary"      -> class="baps-button--secondary"
 *   severity="danger"         -> class="baps-button--danger"
 *   severity="warn"           -> class="baps-button--warn"
 *   severity="primary"   + [text]="true"     -> "baps-button--ghost-primary"
 *   severity="secondary" + [text]="true"     -> "baps-button--ghost-secondary"
 *   [link]="true"             -> class="baps-button--link"   (Sampark only)
 *   size="small"              -> class="baps-button--s"
 *   size="large"              -> class="baps-button--l"
 *   size="xlarge"             -> class="baps-button--xl"
 *   [loading]="true"          -> class="baps-button--loading" + disabled
 *   [disabled]="true"         -> the native disabled attribute
 *   brand="sampark"           -> class="baps-sampark"
 *   icon-only (no label)      -> class="baps-button--icon-only" + aria-label
 *
 * `severity="secondary"` under Sampark is the OUTLINED treatment — the Angular
 * story writes `[outlined]="true"` alongside it, but the Sampark secondary skin
 * is outlined by definition, so there is no separate outlined class.
 *
 * ## Coverage, and what is deliberately missing
 *
 * The severities that have BAPS tokens: MyBKY primary / secondary / danger /
 * warn plus the two ghosts, and Sampark primary / secondary / ghost / link.
 * PrimeNG's success, info, help and contrast carry no `--button-*` token in
 * this design system, so no class is invented for them.
 *
 * The three Interaction stories get no snippets — they assert behaviour
 * through a `play` function and have no markup worth copying.
 *
 * ## Packaging — the gap this file used to record is closed
 *
 * These styles no longer need a relative path. `libs/ui-kit/package.json` now
 * declares `exports` for `./styles` and `./styles/*`, and
 * `libs/ui-kit/scripts/build-styles.mjs` compiles the partials to
 * `dist/libs/ui-kit/styles/*.css` as part of the library build, so a React or
 * Next app in another repo imports `@org/ui-kit/styles`. What each path does
 * and does not carry is measured in `libs/ui-kit/src/lib/docs/snippet-setup.ts`,
 * which is also where the setup block below comes from.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

/** Stated once; the same loads sit behind every snippet on this page. */
const SETUP = setupFor('button', true);

export const buttonSnippets: Record<string, SnippetSet> = {
  // The Playground carries no render function: it is the meta's own args, which
  // default to label "Button" and severity "primary" and nothing else. So this
  // is the smallest true button in the library, and the right first thing a
  // reader copies.
  Playground: {
    custom: `<button type="button" class="baps-button baps-button--primary">
  <span class="baps-button__label">Button</span>
</button>`,
    react: `${SETUP}

export function Example() {
  return (
    <button type="button" className="baps-button baps-button--primary">
      <span className="baps-button__label">Button</span>
    </button>
  );
}`,
    next: `'use client';

${SETUP}

export default function Example() {
  return (
    <button type="button" className="baps-button baps-button--primary">
      <span className="baps-button__label">Button</span>
    </button>
  );
}`,
    primeng: `<baps-button label="Button" severity="primary" />`,
  },

  // Four of the story's eight. The other four are not representable and the
  // reason is the same one the header gives for success and info: no
  // `--button-*` token exists for them. Measured on the component, the info
  // button's fill comes back rgb(3, 169, 244) — PrimeNG's own blue, reached
  // through the generic preset, not a BAPS value — and the two vertical
  // buttons need a column layout the standalone partial has no rule for.
  // tools/check-button-drift.mjs compares indices [0, 2, 3, 4] for exactly this
  // reason, so the four shown here are verified against the component and the
  // four left out are named rather than faked.
  //
  // The glyph slot is a comment, not a path. The registry is data, not CSS:
  // `import { BAPS_ICONS } from '@org/ui-kit/icons'` and inject
  // `<svg viewBox="0 0 24 24" fill="none">{BAPS_ICONS[name]}</svg>`, which is
  // what the Angular component does. The box does not depend on it — measured,
  // baps-icon is 18x18 whether the slot holds a path or nothing, which is why
  // the drift check still proves these buttons.
  WithIcons: {
    custom: `<!-- Leading icon: the glyph comes FIRST, the label second. Trailing is the
     same markup with the two swapped — the row is a flex container, so
     placement is source order and needs no modifier class. -->
<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center">
  <button type="button" class="baps-button baps-button--primary">
    <baps-icon style="--baps-icon-size: 18px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['add-to-filter'] --></span></baps-icon>
    <span class="baps-button__label">Add Filter</span>
  </button>
  <button type="button" class="baps-button baps-button--primary">
    <baps-icon style="--baps-icon-size: 18px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['plus'] --></span></baps-icon>
    <span class="baps-button__label">Create</span>
  </button>
  <button type="button" class="baps-button baps-button--secondary">
    <baps-icon style="--baps-icon-size: 18px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['search-2'] --></span></baps-icon>
    <span class="baps-button__label">Search</span>
  </button>
  <button type="button" class="baps-button baps-button--danger">
    <baps-icon style="--baps-icon-size: 18px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['trash'] --></span></baps-icon>
    <span class="baps-button__label">Delete</span>
  </button>
</div>`,
    react: `${SETUP}

import { BAPS_ICONS } from '@org/ui-kit/icons';

/* The glyph registry is plain data — measured, 0 references to Angular in the
   built file — so it is the one piece of the design system a React app can
   import directly. The wrapper below is byte for byte what the Angular icon
   component injects. */
function Glyph({ name, size = 18 }) {
  return (
    <baps-icon style={{ '--baps-icon-size': size + 'px' }}>
      <span
        className="baps-icon__glyph"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24" fill="none" focusable="false">' + BAPS_ICONS[name] + '</svg>',
        }}
      />
    </baps-icon>
  );
}

export function WithIcons() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary">
        <Glyph name="add-to-filter" />
        <span className="baps-button__label">Add Filter</span>
      </button>
      <button type="button" className="baps-button baps-button--primary">
        <Glyph name="plus" />
        <span className="baps-button__label">Create</span>
      </button>
      <button type="button" className="baps-button baps-button--secondary">
        <Glyph name="search-2" />
        <span className="baps-button__label">Search</span>
      </button>
      <button type="button" className="baps-button baps-button--danger">
        <Glyph name="trash" />
        <span className="baps-button__label">Delete</span>
      </button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

import { BAPS_ICONS } from '@org/ui-kit/icons';

/* 'use client' is required, and not for interactivity — there is none here.
   dangerouslySetInnerHTML is fine on the server, but the inline
   style={{ '--baps-icon-size': … }} custom property and the unknown
   <baps-icon> element are both things to keep out of a Server Component's
   output. Lift the registry import into a shared client component if several
   routes use icons; it is 2.3 MB of path data and belongs in one chunk. */
function Glyph({ name, size = 18 }) {
  return (
    <baps-icon style={{ '--baps-icon-size': size + 'px' }}>
      <span
        className="baps-icon__glyph"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24" fill="none" focusable="false">' + BAPS_ICONS[name] + '</svg>',
        }}
      />
    </baps-icon>
  );
}

export default function WithIcons() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary">
        <Glyph name="add-to-filter" />
        <span className="baps-button__label">Add Filter</span>
      </button>
      <button type="button" className="baps-button baps-button--primary">
        <Glyph name="plus" />
        <span className="baps-button__label">Create</span>
      </button>
      <button type="button" className="baps-button baps-button--secondary">
        <Glyph name="search-2" />
        <span className="baps-button__label">Search</span>
      </button>
      <button type="button" className="baps-button baps-button--danger">
        <Glyph name="trash" />
        <span className="baps-button__label">Delete</span>
      </button>
    </div>
  );
}`,
    primeng: `<!-- Angular resolves the glyph by name; iconPos moves it. The two severities
     the story also shows, success and info, are PrimeNG's own and carry no
     BAPS button token — they render through the generic preset. -->
<div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: center;">
  <baps-button label="Add Filter" icon="add-to-filter" severity="primary" />
  <baps-button label="Add to Filter" icon="add-to-filter" iconPos="right" severity="success" />
  <baps-button label="Create" icon="plus" severity="primary" />
  <baps-button label="Search" icon="search-2" severity="secondary" />
  <baps-button label="Delete" icon="trash" severity="danger" />
  <baps-button label="PrimeIcon" icon="pi pi-check" iconPos="right" severity="info" />
  <baps-button label="Top Icon" icon="settings" iconPos="top" severity="secondary" [outlined]="true" />
  <baps-button label="Bottom Icon" icon="download" iconPos="bottom" severity="secondary" [outlined]="true" />
</div>`,
  },

  AllVariants: {
    custom: `<!-- MyBKY severities. The filled three are gradients; the two ghosts are
     transparent with coloured ink. -->
<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center">
  <button type="button" class="baps-button baps-button--primary"><span class="baps-button__label">Primary</span></button>
  <button type="button" class="baps-button baps-button--secondary"><span class="baps-button__label">Secondary</span></button>
  <button type="button" class="baps-button baps-button--danger"><span class="baps-button__label">Danger</span></button>
  <button type="button" class="baps-button baps-button--warn"><span class="baps-button__label">Warning</span></button>
  <button type="button" class="baps-button baps-button--ghost-primary"><span class="baps-button__label">Primary Ghost</span></button>
  <button type="button" class="baps-button baps-button--ghost-secondary"><span class="baps-button__label">Secondary Ghost</span></button>
</div>`,
    react: `${SETUP}

export function AllVariants() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary"><span className="baps-button__label">Primary</span></button>
      <button type="button" className="baps-button baps-button--secondary"><span className="baps-button__label">Secondary</span></button>
      <button type="button" className="baps-button baps-button--danger"><span className="baps-button__label">Danger</span></button>
      <button type="button" className="baps-button baps-button--warn"><span className="baps-button__label">Warning</span></button>
      <button type="button" className="baps-button baps-button--ghost-primary"><span className="baps-button__label">Primary Ghost</span></button>
      <button type="button" className="baps-button baps-button--ghost-secondary"><span className="baps-button__label">Secondary Ghost</span></button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function AllVariants() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary"><span className="baps-button__label">Primary</span></button>
      <button type="button" className="baps-button baps-button--secondary"><span className="baps-button__label">Secondary</span></button>
      <button type="button" className="baps-button baps-button--danger"><span className="baps-button__label">Danger</span></button>
      <button type="button" className="baps-button baps-button--warn"><span className="baps-button__label">Warning</span></button>
      <button type="button" className="baps-button baps-button--ghost-primary"><span className="baps-button__label">Primary Ghost</span></button>
      <button type="button" className="baps-button baps-button--ghost-secondary"><span className="baps-button__label">Secondary Ghost</span></button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: center;">
  <baps-button label="Primary" severity="primary" />
  <baps-button label="Secondary" severity="secondary" />
  <baps-button label="Danger" severity="danger" />
  <baps-button label="Warning" severity="warn" />
  <baps-button label="Primary Ghost" severity="primary" [text]="true" />
  <baps-button label="Secondary Ghost" severity="secondary" [text]="true" />
</div>`,
  },

  // The story's first five, which are the four size steps plus one more
  // primary. The remaining four are outlined, rounded, and a text danger —
  // none of which has a `--button-*` token, and the rounded pair measures
  // border-radius 50% straight from PrimeNG's generic preset. Inventing those
  // colours to fill the tab out would be the one thing this file must not do,
  // so check-button-drift.mjs compares indices [0, 1, 2, 3, 4] and the rest are
  // named here.
  //
  // aria-label is not optional on any of them: with no visible label there is
  // nothing for a screen reader to announce, and the glyph is aria-hidden.
  //
  // The width is the news. Each step is square on its own height — measured
  // 32 / 36 / 36 / 42 — and until this example existed the standalone partial
  // got that wrong: its only icon-only width rule named .p-button-icon-only, a
  // class raw markup never carries, so a MyBKY icon-only button collapsed to
  // its 20px glyph. Fixed in _button.scss, and this is the example that holds
  // it in place.
  IconOnly: {
    custom: `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center">
  <button type="button" class="baps-button baps-button--primary baps-button--icon-only baps-button--s" aria-label="Add to filter">
    <baps-icon style="--baps-icon-size: 16px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['add-to-filter'] --></span></baps-icon>
  </button>
  <button type="button" class="baps-button baps-button--primary baps-button--icon-only" aria-label="Add to filter">
    <baps-icon style="--baps-icon-size: 18px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['add-to-filter'] --></span></baps-icon>
  </button>
  <button type="button" class="baps-button baps-button--primary baps-button--icon-only baps-button--l" aria-label="Add to filter">
    <baps-icon style="--baps-icon-size: 20px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['add-to-filter'] --></span></baps-icon>
  </button>
  <button type="button" class="baps-button baps-button--primary baps-button--icon-only baps-button--xl" aria-label="Add to filter">
    <baps-icon style="--baps-icon-size: 24px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['add-to-filter'] --></span></baps-icon>
  </button>
  <button type="button" class="baps-button baps-button--primary baps-button--icon-only" aria-label="Add">
    <baps-icon style="--baps-icon-size: 18px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['plus'] --></span></baps-icon>
  </button>
</div>`,
    react: `${SETUP}

import { BAPS_ICONS } from '@org/ui-kit/icons';

/* Same Glyph as the With Icons example; keep one copy in your own code. The
   size steps are not decoration — the icon shrinks and grows with the button,
   16 / 18 / 20 / 24 against heights of 32 / 36 / 36 / 42. */
function Glyph({ name, size = 18 }) {
  return (
    <baps-icon style={{ '--baps-icon-size': size + 'px' }}>
      <span
        className="baps-icon__glyph"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24" fill="none" focusable="false">' + BAPS_ICONS[name] + '</svg>',
        }}
      />
    </baps-icon>
  );
}

export function IconOnly() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only baps-button--s"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={16} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={18} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only baps-button--l"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={20} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only baps-button--xl"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={24} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only"
        aria-label="Add"
      >
        <Glyph name="plus" size={18} />
      </button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

import { BAPS_ICONS } from '@org/ui-kit/icons';

function Glyph({ name, size = 18 }) {
  return (
    <baps-icon style={{ '--baps-icon-size': size + 'px' }}>
      <span
        className="baps-icon__glyph"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24" fill="none" focusable="false">' + BAPS_ICONS[name] + '</svg>',
        }}
      />
    </baps-icon>
  );
}

export default function IconOnly() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only baps-button--s"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={16} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={18} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only baps-button--l"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={20} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only baps-button--xl"
        aria-label="Add to filter"
      >
        <Glyph name="add-to-filter" size={24} />
      </button>
      <button
        type="button"
        className="baps-button baps-button--primary baps-button--icon-only"
        aria-label="Add"
      >
        <Glyph name="plus" size={18} />
      </button>
    </div>
  );
}`,
    primeng: `<!-- Omit label, set ariaLabel. The icon size follows the button size on its
     own — the component maps small/default/large/xlarge to 16/18/20/24. -->
<div style="display:flex; flex-direction:column; gap: 16px;">
  <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <baps-button icon="add-to-filter" ariaLabel="Add to filter" size="small" />
    <baps-button icon="add-to-filter" ariaLabel="Add to filter" />
    <baps-button icon="add-to-filter" ariaLabel="Add to filter" size="large" />
    <baps-button icon="add-to-filter" ariaLabel="Add to filter" size="xlarge" />
  </div>
  <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <baps-button icon="plus" ariaLabel="Add" severity="primary" />
    <baps-button icon="edit" ariaLabel="Edit" severity="secondary" [outlined]="true" />
    <baps-button icon="trash" ariaLabel="Delete" severity="danger" [text]="true" />
    <baps-button icon="search-2" ariaLabel="Search" severity="info" [rounded]="true" />
    <baps-button icon="notification" ariaLabel="Notifications" severity="warn" [rounded]="true" [outlined]="true" />
  </div>
</div>`,
  },

  AllSizes: {
    custom: `<!-- MyBKY sets no height: it falls out of padding plus the font's line box,
     so the measured steps are 33 / 35 / 37px. XL is the one step with an
     explicit height, because PrimeNG's size scale stops at large. -->
<div style="display:flex; gap:12px; align-items:center">
  <button type="button" class="baps-button baps-button--primary baps-button--s"><span class="baps-button__label">S (32px)</span></button>
  <button type="button" class="baps-button baps-button--primary"><span class="baps-button__label">M (36px, default)</span></button>
  <button type="button" class="baps-button baps-button--primary baps-button--l"><span class="baps-button__label">L (36px, larger font)</span></button>
  <button type="button" class="baps-button baps-button--primary baps-button--xl"><span class="baps-button__label">XL (42px)</span></button>
</div>`,
    react: `${SETUP}

export function AllSizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary baps-button--s"><span className="baps-button__label">S (32px)</span></button>
      <button type="button" className="baps-button baps-button--primary"><span className="baps-button__label">M (36px, default)</span></button>
      <button type="button" className="baps-button baps-button--primary baps-button--l"><span className="baps-button__label">L (36px, larger font)</span></button>
      <button type="button" className="baps-button baps-button--primary baps-button--xl"><span className="baps-button__label">XL (42px)</span></button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function AllSizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary baps-button--s"><span className="baps-button__label">S (32px)</span></button>
      <button type="button" className="baps-button baps-button--primary"><span className="baps-button__label">M (36px, default)</span></button>
      <button type="button" className="baps-button baps-button--primary baps-button--l"><span className="baps-button__label">L (36px, larger font)</span></button>
      <button type="button" className="baps-button baps-button--primary baps-button--xl"><span className="baps-button__label">XL (42px)</span></button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-button label="S (32px)" size="small" />
  <baps-button label="M (36px, default)" />
  <baps-button label="L (36px, larger font)" size="large" />
  <baps-button label="XL (42px)" size="xlarge" />
</div>`,
  },

  States: {
    custom: `<!-- Disabled and loading are the same visual under MyBKY: PrimeNG's generic
     0.38 dim, with the fill unchanged. Loading also needs the native disabled
     attribute, or the button stays clickable while its action is in flight. -->
<div style="display:flex; gap:12px; align-items:center">
  <button type="button" class="baps-button baps-button--primary"><span class="baps-button__label">Default</span></button>
  <button type="button" class="baps-button baps-button--primary" disabled><span class="baps-button__label">Disabled</span></button>
  <button type="button" class="baps-button baps-button--primary baps-button--loading" disabled>
    <i class="pi pi-spinner pi-spin" aria-hidden="true"></i><span class="baps-button__label">Loading</span>
  </button>
</div>`,
    react: `${SETUP}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary"><span className="baps-button__label">Default</span></button>
      <button type="button" className="baps-button baps-button--primary" disabled><span className="baps-button__label">Disabled</span></button>
      <button type="button" className="baps-button baps-button--primary baps-button--loading" disabled>
        <i className="pi pi-spinner pi-spin" aria-hidden="true" />
        <span className="baps-button__label">Loading</span>
      </button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function States() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-button--primary"><span className="baps-button__label">Default</span></button>
      <button type="button" className="baps-button baps-button--primary" disabled><span className="baps-button__label">Disabled</span></button>
      <button type="button" className="baps-button baps-button--primary baps-button--loading" disabled>
        <i className="pi pi-spinner pi-spin" aria-hidden="true" />
        <span className="baps-button__label">Loading</span>
      </button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-button label="Default" />
  <baps-button label="Disabled" [disabled]="true" />
  <baps-button label="Loading" [loading]="true" />
</div>`,
  },

  SamparkVariants: {
    custom: `<!-- Sampark: flat 4px radius, explicit 32px height, no gradient. The
     .baps-sampark class is what the Angular host adds for brand="sampark";
     a whole page can switch instead by putting .baps-ds-sampark on an
     ancestor, which is what the Design system toolbar does. -->
<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center">
  <button type="button" class="baps-button baps-sampark baps-button--primary"><span class="baps-button__label">Primary</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--secondary"><span class="baps-button__label">Secondary</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--ghost-primary"><span class="baps-button__label">Primary Ghost</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--link"><span class="baps-button__label">Link</span></button>
</div>`,
    react: `${SETUP}

export function SamparkVariants() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary"><span className="baps-button__label">Primary</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--secondary"><span className="baps-button__label">Secondary</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--ghost-primary"><span className="baps-button__label">Primary Ghost</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--link"><span className="baps-button__label">Link</span></button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function SamparkVariants() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary"><span className="baps-button__label">Primary</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--secondary"><span className="baps-button__label">Secondary</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--ghost-primary"><span className="baps-button__label">Primary Ghost</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--link"><span className="baps-button__label">Link</span></button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: center;">
  <baps-button brand="sampark" label="Primary" severity="primary" />
  <baps-button brand="sampark" label="Secondary" severity="secondary" [outlined]="true" />
  <baps-button brand="sampark" label="Primary Ghost" severity="primary" [text]="true" />
  <baps-button brand="sampark" label="Link" [link]="true" />
</div>`,
  },

  SamparkSizes: {
    custom: `<!-- Sampark sizes are explicit heights: 28 / 32 / 36 / 42. The XL step is 42
     in both brands; the label below reading "40px" predates the Figma frame
     (13197:91897), whose XL symbols measure 42. -->
<div style="display:flex; gap:12px; align-items:center">
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--s"><span class="baps-button__label">SM (28px)</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary"><span class="baps-button__label">Default (32px)</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--l"><span class="baps-button__label">LG (36px)</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--xl"><span class="baps-button__label">XL (40px)</span></button>
</div>`,
    react: `${SETUP}

export function SamparkSizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--s"><span className="baps-button__label">SM (28px)</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary"><span className="baps-button__label">Default (32px)</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--l"><span className="baps-button__label">LG (36px)</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--xl"><span className="baps-button__label">XL (40px)</span></button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function SamparkSizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--s"><span className="baps-button__label">SM (28px)</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary"><span className="baps-button__label">Default (32px)</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--l"><span className="baps-button__label">LG (36px)</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--xl"><span className="baps-button__label">XL (40px)</span></button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-button brand="sampark" label="SM (28px)" size="small" />
  <baps-button brand="sampark" label="Default (32px)" />
  <baps-button brand="sampark" label="LG (36px)" size="large" />
  <baps-button brand="sampark" label="XL (40px)" size="xlarge" />
</div>`,
  },

  SamparkIconOnly: {
    custom: `<!-- aria-label is REQUIRED here: with no visible label there is nothing for a
     screen reader to announce. The sm and lg steps keep 16px of horizontal
     padding rather than being square — that is what the component renders,
     reproduced rather than tidied. See guidelines/known-gaps. -->
<div style="display:flex; gap:12px; align-items:center">
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--s" aria-label="Confirm"><i class="pi pi-check" aria-hidden="true"></i></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--icon-only" aria-label="Confirm"><i class="pi pi-check" aria-hidden="true"></i></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--l" aria-label="Confirm"><i class="pi pi-check" aria-hidden="true"></i></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--xl" aria-label="Confirm"><i class="pi pi-check" aria-hidden="true"></i></button>
  <button type="button" class="baps-button baps-sampark baps-button--secondary baps-button--icon-only" aria-label="Edit"><i class="pi pi-pencil" aria-hidden="true"></i></button>
  <button type="button" class="baps-button baps-sampark baps-button--ghost-primary baps-button--icon-only" aria-label="Delete"><i class="pi pi-trash" aria-hidden="true"></i></button>
</div>`,
    react: `${SETUP}

export function SamparkIconOnly() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--s" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--l" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--xl" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--secondary baps-button--icon-only" aria-label="Edit"><i className="pi pi-pencil" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--ghost-primary baps-button--icon-only" aria-label="Delete"><i className="pi pi-trash" aria-hidden="true" /></button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function SamparkIconOnly() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--s" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--l" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--icon-only baps-button--xl" aria-label="Confirm"><i className="pi pi-check" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--secondary baps-button--icon-only" aria-label="Edit"><i className="pi pi-pencil" aria-hidden="true" /></button>
      <button type="button" className="baps-button baps-sampark baps-button--ghost-primary baps-button--icon-only" aria-label="Delete"><i className="pi pi-trash" aria-hidden="true" /></button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" size="small" />
  <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" />
  <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" size="large" />
  <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" size="xlarge" />
  <baps-button brand="sampark" icon="pi pi-pencil" ariaLabel="Edit" severity="secondary" [outlined]="true" />
  <baps-button brand="sampark" icon="pi pi-trash" ariaLabel="Delete" severity="primary" [text]="true" />
</div>`,
  },

  SamparkStates: {
    custom: `<!-- Sampark's disabled is a distinct fill (#f3eaea on #e1e0e0, ink #bcb9b9),
     not an opacity dim — see button.mapping.mdx. Loading renders the same. -->
<div style="display:flex; gap:12px; align-items:center">
  <button type="button" class="baps-button baps-sampark baps-button--primary"><span class="baps-button__label">Default</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary" disabled><span class="baps-button__label">Disabled</span></button>
  <button type="button" class="baps-button baps-sampark baps-button--primary baps-button--loading" disabled>
    <i class="pi pi-spinner pi-spin" aria-hidden="true"></i><span class="baps-button__label">Loading</span>
  </button>
</div>`,
    react: `${SETUP}

export function SamparkStates() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary"><span className="baps-button__label">Default</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary" disabled><span className="baps-button__label">Disabled</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--loading" disabled>
        <i className="pi pi-spinner pi-spin" aria-hidden="true" />
        <span className="baps-button__label">Loading</span>
      </button>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function SamparkStates() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="button" className="baps-button baps-sampark baps-button--primary"><span className="baps-button__label">Default</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary" disabled><span className="baps-button__label">Disabled</span></button>
      <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--loading" disabled>
        <i className="pi pi-spinner pi-spin" aria-hidden="true" />
        <span className="baps-button__label">Loading</span>
      </button>
    </div>
  );
}`,
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-button brand="sampark" label="Default" />
  <baps-button brand="sampark" label="Disabled" [disabled]="true" />
  <baps-button brand="sampark" label="Loading" [loading]="true" />
</div>`,
  },
};
