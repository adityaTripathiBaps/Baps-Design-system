/**
 * Framework snippets for the Card docs page, keyed by story export name.
 *
 * The Custom tab is not in here — it renders Storybook's own source for the
 * story, so the Angular markup on that tab is always the live one.
 *
 * ## Why these are not fiction
 *
 * `baps-card` is one of the few components in this library that is NOT a
 * PrimeNG wrapper — its template is plain divs and its CSS has no `.p-*`
 * selector. So the same markup works with no Angular at all: `<baps-card>` is
 * simply an unregistered custom element, and every selector in the stylesheet
 * is anchored to that element name.
 *
 * Measured, not assumed. This markup was rendered on a bare HTML page with no
 * Angular and no Storybook, and every property the stylesheet owns came out
 * identical to the Angular render:
 *
 *   host       flex · column · gap 16px · #ffffff · 1px solid #e4ecf1 ·
 *              radius 8px · padding 24px · border-box · no shadow
 *   header     grid · "title actions" / "subtitle actions" · 12px / 4px · center
 *   title      16px · 600 · 19.2px · #181b1d · Inter Variable
 *   subtitle   14px · 400 · 16.8px · #6f777d · Inter Variable
 *   divided    header padding-bottom 16px, 1px #e4ecf1, margin-inline -24px
 *              footer padding-top 16px, 1px #e4ecf1, margin-inline -24px
 *
 * ## Inputs become classes
 *
 * The Angular host bindings are the only difference between the two markups.
 * Outside Angular you write the class the binding would have added:
 *
 *   padding="compact"    -> class="baps-card-compact"
 *   padding="none"       -> class="baps-card-flush"
 *   [divided]="true"     -> class="baps-card-divided"
 *   [raised]="true"      -> class="baps-card-raised"
 *   [interactive]="true" -> class="baps-card-interactive" + role/tabindex
 *   brand="sampark"      -> class="baps-sampark"
 *
 * ## What a non-Angular page has to load (all three, measured)
 *
 * 1. `libs/tokens/build/css/tokens.css` — without it the stylesheet's own
 *    fallbacks take over and the type goes off: title line-height measured
 *    20.8px instead of 19.2px, subtitle 18.2px instead of 16.8px. Geometry and
 *    colour were unaffected; only line-height drifted.
 * 2. `libs/ui-kit/src/lib/styles/components/card/_card.scss` — compiles on its
 *    own (it imports no other partial), so one `sass` run produces the whole
 *    card stylesheet. The Angular component loads the same file via
 *    `styleUrls`, which is what keeps the two from drifting apart.
 * 3. A base `font-family`. Nothing in ui-kit applies one — the measured page
 *    fell back to Times New Roman while the app renders Inter.
 *    `styles/layout/fonts` carries the @font-face and `styles/layout/common`
 *    defines `--font-family`, but the rule that applies it
 *    (`html { font-family: var(--font-family) }`) lives in the app's own
 *    `apps/storybook-host/src/styles.scss`. With all three in place the raw
 *    page measured `"Inter Variable", Inter, sans-serif`, matching Angular.
 *
 * ## Which stories are covered, and which are not
 *
 * Playground, Divided, Interactive and DashboardTiles are deliberately absent.
 * Their templates nest `baps-button`, `baps-tag`, `baps-avatar` or
 * `baps-progressbar`, and those ARE PrimeNG wrappers — a React snippet of those
 * stories could not produce the same design, only a card with the nested
 * control missing. They get snippets when those components are extracted the
 * way card was, not before.
 *
 * ## Known gap
 *
 * There is no package path for any of this yet: `libs/ui-kit/package.json`
 * declares no `exports`, and `@org/ui-kit` resolves through a tsconfig path
 * alias rather than a `node_modules` link — verified, `sass` cannot resolve
 * `@org/ui-kit/.../card`. Inside this repo the files are reachable by relative
 * path (which is how `apps/storybook-host/src/styles.scss` consumes them).
 * A React app in another repo would need a real styles export first; that is a
 * packaging decision and has not been made.
 */
export type SnippetSet = { react?: string; next?: string; primeng?: string; custom?: string };

/** Stated once; the same loads behind every snippet on this page. */
const SETUP = `/* Once, at your app's entry. Paths are relative because no package export
   exists yet — see card.snippets.ts.

     import '<repo>/libs/tokens/build/css/tokens.css';   // the import preview.ts uses

   in your global stylesheet:

     @use '<repo>/libs/ui-kit/src/lib/styles/layout/fonts';   // Inter @font-face
     @use '<repo>/libs/ui-kit/src/lib/styles/layout/common';  // --font-family et al
     @use '<repo>/libs/ui-kit/src/lib/styles/components/card/card';

   and the base rule, which is the app's own (copied from
   apps/storybook-host/src/styles.scss) — no ui-kit partial applies it:

     html { font-size: 16px; font-family: var(--font-family); }
*/`;

export const cardSnippets: Record<string, SnippetSet> = {
  // The story writes `class="eyebrow"` on the label; that class is defined
  // nowhere in the repo — checked — so it is dropped here rather than copied
  // into documentation. The inline styles are what actually render.
  BodyOnly: {
    primeng: `<div style="max-width: 420px">
  <baps-card>
    <span style="display:block; margin-bottom: 0.5rem">Donations this month</span>
    <div style="font-size: 1.75rem; font-weight: 700">₹ 3,42,600</div>
  </baps-card>
</div>`,
    custom: `<!-- Identical markup: baps-card is not a PrimeNG wrapper, so the element the
     Angular component renders is the element you write by hand. Only the inputs
     change - they become classes. -->
<div style="max-width: 420px">
  <baps-card>
    <span style="display:block; margin-bottom: 0.5rem">Donations this month</span>
    <div style="font-size: 1.75rem; font-weight: 700">₹ 3,42,600</div>
  </baps-card>
</div>`,
    react: `${SETUP}

export function BodyOnly() {
  return (
    <div style={{ maxWidth: 420 }}>
      <baps-card>
        <span style={{ display: 'block', marginBottom: '0.5rem' }}>Donations this month</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹ 3,42,600</div>
      </baps-card>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function BodyOnly() {
  return (
    <div style={{ maxWidth: 420 }}>
      <baps-card>
        <span style={{ display: 'block', marginBottom: '0.5rem' }}>Donations this month</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹ 3,42,600</div>
      </baps-card>
    </div>
  );
}`,
  },

  PaddingSteps: {
    primeng: `<div style="display: grid; gap: 1rem; max-width: 420px">
  <baps-card padding="default">
    <span card-title>default</span>
    24px — the standard content card.
  </baps-card>
  <baps-card padding="compact">
    <span card-title>compact</span>
    16px — dense or table-adjacent.
  </baps-card>
  <baps-card padding="none" [divided]="true">
    <span card-title style="padding: 1rem 1rem 0">none</span>
    <div style="padding: 1rem">0 — the body supplies its own gutters.</div>
  </baps-card>
</div>`,
    custom: `<!-- padding="compact" -> class="baps-card-compact"
     padding="none"    -> class="baps-card-flush"
     [divided]="true"  -> class="baps-card-divided" -->
<div style="display: grid; gap: 1rem; max-width: 420px">
  <baps-card>
    <span card-title>default</span>
    24px — the standard content card.
  </baps-card>
  <baps-card class="baps-card-compact">
    <span card-title>compact</span>
    16px — dense or table-adjacent.
  </baps-card>
  <baps-card class="baps-card-flush baps-card-divided">
    <span card-title style="padding: 1rem 1rem 0">none</span>
    <div style="padding: 1rem">0 — the body supplies its own gutters.</div>
  </baps-card>
</div>`,
    react: `export function PaddingSteps() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 420 }}>
      <baps-card>
        <span card-title="">default</span>
        24px — the standard content card.
      </baps-card>
      <baps-card className="baps-card-compact">
        <span card-title="">compact</span>
        16px — dense or table-adjacent.
      </baps-card>
      <baps-card className="baps-card-flush baps-card-divided">
        <span card-title="" style={{ padding: '1rem 1rem 0' }}>none</span>
        <div style={{ padding: '1rem' }}>0 — the body supplies its own gutters.</div>
      </baps-card>
    </div>
  );
}`,
    next: `'use client';

export default function PaddingSteps() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 420 }}>
      <baps-card>
        <span card-title="">default</span>
        24px — the standard content card.
      </baps-card>
      <baps-card className="baps-card-compact">
        <span card-title="">compact</span>
        16px — dense or table-adjacent.
      </baps-card>
      <baps-card className="baps-card-flush baps-card-divided">
        <span card-title="" style={{ padding: '1rem 1rem 0' }}>none</span>
        <div style={{ padding: '1rem' }}>0 — the body supplies its own gutters.</div>
      </baps-card>
    </div>
  );
}`,
  },

  RestVsRaised: {
    primeng: `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 640px">
  <baps-card>
    <span card-title>At rest</span>
    <span card-subtitle>Hairline border, no shadow</span>
    This is what almost every card should be.
  </baps-card>
  <baps-card [raised]="true">
    <span card-title>Raised</span>
    <span card-subtitle>Brand shadow</span>
    Only for cards that float above the page.
  </baps-card>
</div>`,
    custom: `<!-- [raised]="true" -> class="baps-card-raised" -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 640px">
  <baps-card>
    <span card-title>At rest</span>
    <span card-subtitle>Hairline border, no shadow</span>
    This is what almost every card should be.
  </baps-card>
  <baps-card class="baps-card-raised">
    <span card-title>Raised</span>
    <span card-subtitle>Brand shadow</span>
    Only for cards that float above the page.
  </baps-card>
</div>`,
    react: `export function RestVsRaised() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 640 }}>
      <baps-card>
        <span card-title="">At rest</span>
        <span card-subtitle="">Hairline border, no shadow</span>
        This is what almost every card should be.
      </baps-card>
      <baps-card className="baps-card-raised">
        <span card-title="">Raised</span>
        <span card-subtitle="">Brand shadow</span>
        Only for cards that float above the page.
      </baps-card>
    </div>
  );
}`,
    next: `'use client';

export default function RestVsRaised() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 640 }}>
      <baps-card>
        <span card-title="">At rest</span>
        <span card-subtitle="">Hairline border, no shadow</span>
        This is what almost every card should be.
      </baps-card>
      <baps-card className="baps-card-raised">
        <span card-title="">Raised</span>
        <span card-subtitle="">Brand shadow</span>
        Only for cards that float above the page.
      </baps-card>
    </div>
  );
}`,
  },
};
