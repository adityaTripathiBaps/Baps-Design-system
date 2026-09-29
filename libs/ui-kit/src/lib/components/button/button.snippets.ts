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
 * ## Known gap
 *
 * There is still no package path for any of this — `libs/ui-kit/package.json`
 * declares no `exports` and `@org/ui-kit` resolves through a tsconfig alias, so
 * `sass` cannot resolve a `@org/ui-kit/...` import. Inside this repo the files
 * are reachable by relative path, which is how apps/storybook-host/src/
 * styles.scss consumes them. A React app in another repo needs a real styles
 * export first; that is a packaging decision and has not been made. Same gap
 * card.snippets.ts records.
 */
export type SnippetSet = { react?: string; next?: string; primeng?: string; custom?: string };

/** Stated once; the same loads sit behind every snippet on this page. */
const SETUP = `/* Once, at your app's entry. Paths are relative because no package export
   exists yet — see button.snippets.ts.

     import '<repo>/libs/tokens/build/css/tokens.css';   // the import preview.ts uses
     import 'primeicons/primeicons.css';                 // only if you use icons

   in your global stylesheet:

     @use '<repo>/libs/ui-kit/src/lib/styles/layout/fonts';    // Inter @font-face
     @use '<repo>/libs/ui-kit/src/lib/styles/layout/common';   // --font-family et al
     @use '<repo>/libs/ui-kit/src/lib/styles/components/button/button';

   and the base rules, which are the app's own (copied from
   apps/storybook-host/src/styles.scss) — no ui-kit partial applies them:

     html {
       font-size: 16px;
       font-family: var(--font-family);
       font-feature-settings: var(--font-feature-settings);
     }
     button, input, textarea, select { font-feature-settings: inherit; }

   Both feature-settings lines are load-bearing, and not obviously so. Inter's
   OpenType set (case, cpsp, salt, ss01/03/04, cv01-11) changes glyph advance
   widths: without them every label measures about 1px narrower per word, so
   the button comes out narrow while every colour, border, radius and padding
   still matches exactly. A <button> does not inherit the features from html on
   its own, which is why the second rule exists. Found by
   tools/check-button-drift.mjs, not by reading.
*/`;

export const buttonSnippets: Record<string, SnippetSet> = {
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
