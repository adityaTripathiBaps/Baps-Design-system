/**
 * Framework snippets for the Card docs page, keyed by story export name.
 *
 * The Angular source tab is not in here — it renders Storybook's own source
 * for the story, so that markup is always the live one.
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
 * 1. `@org/tokens/css` — without it the stylesheet's own
 *    fallbacks take over and the type goes off: title line-height measured
 *    20.8px instead of 19.2px, subtitle 18.2px instead of 16.8px. Geometry and
 *    colour were unaffected; only line-height drifted.
 * 2. `@org/ui-kit/styles/card`, compiled from
 *    `libs/ui-kit/src/lib/styles/components/card/_card.scss` — that partial
 *    imports no other, so one `sass` run produces the whole card stylesheet.
 *    The Angular component loads the same source file via `styleUrls`, which
 *    is what keeps the two from drifting apart.
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
 * This section used to say that Playground, Divided, Interactive and
 * DashboardTiles were all absent because their templates nest PrimeNG
 * wrappers, and that they would get snippets once those components were
 * extracted the way card was. Three of the four are now covered, because that
 * is exactly what happened: button and tag each have a standalone partial
 * built from tokens and a drift guard (tools/check-button-drift.mjs,
 * tools/check-tag-drift.mjs), so a nested button or tag is as real in raw
 * markup as the card around it.
 *
 * DashboardTiles is still PrimeNG-only, and the two reasons are specific
 * rather than general. `baps-progressbar` has no standalone partial at all —
 * there is no styles/components/progress-bar directory, so the packaged CSS
 * has no progress-bar.css to import. `baps-avatar`'s partial exists but is
 * thin: measured 0 Sampark rules and 0 dark rules against the component's 36
 * and 8, which is why avatar's own page hides its Custom tab. That example
 * unblocks when those two are finished; nothing about the card changes.
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

/** Stated once; the same loads behind every snippet on this page. */
const SETUP = setupFor('card');

export const cardSnippets: Record<string, SnippetSet> = {
  // PrimeNG-Angular only, and the omission is the finding.
  //
  // The card itself is standalone — every other example on this page proves
  // that. What this one nests is not:
  //
  //   baps-progressbar   no standalone partial exists at all. There is no
  //                      styles/components/progress-bar directory, so the
  //                      packaged CSS has no progress-bar.css to import and
  //                      raw markup for it would render unstyled.
  //   baps-avatar        the partial exists but is thin: measured 0 Sampark
  //                      rules and 0 dark rules against the component's 36 and
  //                      8, which is why avatar's own page hides its Custom
  //                      tab. An avatar group inside a card would inherit that
  //                      same gap silently.
  //
  // So a React, Next or Custom block here would be a tile with two holes in
  // it, or a tile drawn with invented CSS. Neither is worth showing, and
  // hideCustom on the DemoCard keeps the Custom tab from falling back to the
  // live Angular source, which outside Angular is three empty elements.
  //
  // This unblocks the moment progressbar gets a partial and avatar's is
  // completed; nothing about the card has to change.
  DashboardTiles: {
    primeng: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem">
  <baps-card>
    <span style="display:block; margin-bottom:0.5rem">Registrations this week</span>
    <div style="font-size:1.75rem; font-weight:700; margin-bottom:0.75rem">128</div>
    <baps-progressbar [value]="72" severity="success" />
    <p style="margin:0.5rem 0 0; font-size:0.875rem; color:var(--card-sampark-subtitle-color)">
      72% of the Yuva Sabha capacity
    </p>
  </baps-card>

  <baps-card>
    <span style="display:block; margin-bottom:0.5rem">Donations this month</span>
    <div style="font-size:1.75rem; font-weight:700; margin-bottom:0.75rem">₹ 3,42,600</div>
    <div style="display:flex; gap:0.5rem">
      <baps-tag value="Annadan Seva" severity="contrast" />
      <baps-tag value="General Fund" />
    </div>
  </baps-card>

  <baps-card>
    <span style="display:block; margin-bottom:0.5rem">Seva volunteers</span>
    <baps-avatargroup>
      <baps-avatar label="NP" size="s" />
      <baps-avatar label="PS" size="s" />
      <baps-avatar label="RT" size="s" />
      <baps-avatar label="+9" size="s" />
    </baps-avatargroup>
    <p style="margin:0.5rem 0 0; font-size:0.875rem; color:var(--card-sampark-subtitle-color)">
      12 volunteers active today
    </p>
  </baps-card>
</div>`,
  },

  // The meta's own args: a default card with a title, subtitle, an action, body
  // text and a footer. The smallest complete card, and the right first thing to
  // copy.
  Playground: {
    primeng: `<div style="max-width: 420px">
  <baps-card>
    <span card-title>Registrations this week</span>
    <span card-subtitle>Yuva Sabha — 3 May</span>
    <div card-actions>
    <baps-button label="Export" severity="secondary" [text]="true" />
    </div>

    <p style="margin: 0">128 members have registered so far. Capacity closes on 1 May.</p>

    <div card-footer>Updated 12 April 2026</div>
  </baps-card>
</div>`,
    custom: `<!-- The action slot nests a button. That used to be the reason these
     examples had no snippets; button now has its own standalone partial and a
     drift guard, so the nested control is as real here as the card is.
     severity="secondary" + [text]="true" -> class="baps-button--ghost-secondary" -->
<div style="max-width: 420px">
  <baps-card>
    <span card-title>Registrations this week</span>
    <span card-subtitle>Yuva Sabha — 3 May</span>
    <div card-actions>
    <button type="button" class="baps-button baps-button--ghost-secondary">
      <span class="baps-button__label">Export</span>
    </button>
    </div>

    <p style="margin: 0">128 members have registered so far. Capacity closes on 1 May.</p>

    <div card-footer>Updated 12 April 2026</div>
  </baps-card>
</div>`,
    react: `\${SETUP}

export function Example() {
  return (
    <div style={{ maxWidth: 420 }}>
      <baps-card>
        <span card-title="">Registrations this week</span>
        <span card-subtitle="">Yuva Sabha — 3 May</span>
        <div card-actions="">
          <button type="button" className="baps-button baps-button--ghost-secondary">
            <span className="baps-button__label">Export</span>
          </button>
        </div>

        <p style={{ margin: 0 }}>128 members have registered so far. Capacity closes on 1 May.</p>

        <div card-footer="">Updated 12 April 2026</div>
      </baps-card>
    </div>
  );
}`,
    next: `\${SETUP}

/* No 'use client': a card is markup. The slots are plain attributes, which is
   why they are written card-title="" in JSX — a bare attribute is boolean
   true in JSX and the stylesheet matches on the attribute's presence. */
export default function Example() {
  return (
    <div style={{ maxWidth: 420 }}>
      <baps-card>
        <span card-title="">Registrations this week</span>
        <span card-subtitle="">Yuva Sabha — 3 May</span>
        <div card-actions="">
          <button type="button" className="baps-button baps-button--ghost-secondary">
            <span className="baps-button__label">Export</span>
          </button>
        </div>

        <p style={{ margin: 0 }}>128 members have registered so far. Capacity closes on 1 May.</p>

        <div card-footer="">Updated 12 April 2026</div>
      </baps-card>
    </div>
  );
}`,
  },

  // [divided]="true" -> class="baps-card-divided". One modifier, otherwise the
  // Playground card unchanged — which is the point of the example.
  Divided: {
    primeng: `<div style="max-width: 420px">
  <baps-card [divided]="true">
    <span card-title>Registrations this week</span>
    <span card-subtitle>Yuva Sabha — 3 May</span>
    <div card-actions>
    <baps-button label="Export" severity="secondary" [text]="true" />
    </div>

    <p style="margin: 0">128 members have registered so far. Capacity closes on 1 May.</p>

    <div card-footer>Updated 12 April 2026</div>
  </baps-card>
</div>`,
    custom: `<!-- The action slot nests a button. That used to be the reason these
     examples had no snippets; button now has its own standalone partial and a
     drift guard, so the nested control is as real here as the card is.
     severity="secondary" + [text]="true" -> class="baps-button--ghost-secondary" -->
<div style="max-width: 420px">
  <baps-card class="baps-card-divided">
    <span card-title>Registrations this week</span>
    <span card-subtitle>Yuva Sabha — 3 May</span>
    <div card-actions>
    <button type="button" class="baps-button baps-button--ghost-secondary">
      <span class="baps-button__label">Export</span>
    </button>
    </div>

    <p style="margin: 0">128 members have registered so far. Capacity closes on 1 May.</p>

    <div card-footer>Updated 12 April 2026</div>
  </baps-card>
</div>`,
    react: `\${SETUP}

export function Example() {
  return (
    <div style={{ maxWidth: 420 }}>
      <baps-card className="baps-card-divided">
        <span card-title="">Registrations this week</span>
        <span card-subtitle="">Yuva Sabha — 3 May</span>
        <div card-actions="">
          <button type="button" className="baps-button baps-button--ghost-secondary">
            <span className="baps-button__label">Export</span>
          </button>
        </div>

        <p style={{ margin: 0 }}>128 members have registered so far. Capacity closes on 1 May.</p>

        <div card-footer="">Updated 12 April 2026</div>
      </baps-card>
    </div>
  );
}`,
    next: `\${SETUP}

/* No 'use client': a card is markup. The slots are plain attributes, which is
   why they are written card-title="" in JSX — a bare attribute is boolean
   true in JSX and the stylesheet matches on the attribute's presence. */
export default function Example() {
  return (
    <div style={{ maxWidth: 420 }}>
      <baps-card className="baps-card-divided">
        <span card-title="">Registrations this week</span>
        <span card-subtitle="">Yuva Sabha — 3 May</span>
        <div card-actions="">
          <button type="button" className="baps-button baps-button--ghost-secondary">
            <span className="baps-button__label">Export</span>
          </button>
        </div>

        <p style={{ margin: 0 }}>128 members have registered so far. Capacity closes on 1 May.</p>

        <div card-footer="">Updated 12 April 2026</div>
      </baps-card>
    </div>
  );
}`,
  },

  // Two interactive cards, each with a tag in its action slot. The same
  // unblocking as Playground: tag has a standalone partial and
  // tools/check-tag-drift.mjs, so the nested control is real markup here.
  //
  //   [interactive]="true" -> class="baps-card-interactive" + role/tabindex
  //   severity="success"   -> class="baps-tag--success"
  //   (no severity)        -> class="baps-tag--grey"
  //
  // role="button" and tabindex="0" are added by the component for the
  // interactive case; outside Angular nothing adds them, and without them the
  // card looks clickable and is unreachable by keyboard.
  Interactive: {
    // The card takes a click and a keypress, so the guard asks for this flag.
    // Note: card is NOT a PrimeNG wrapper and the React block below really does
    // implement the behaviour — see the report; the shared note overstates the
    // limitation here, and narrowing it is a policy call, not one to make mid-run.
    interactive: true,
    primeng: `<div style="display: grid; gap: 1rem; max-width: 420px">
  <baps-card [interactive]="true">
    <span card-title>Yuva Sabha</span>
    <span card-subtitle>3 May, 4:00 PM</span>
    <div card-actions><baps-tag value="Open" severity="success" /></div>
  </baps-card>
  <baps-card [interactive]="true">
    <span card-title>Annadan Seva</span>
    <span card-subtitle>Ongoing</span>
    <div card-actions><baps-tag value="Full" /></div>
  </baps-card>
</div>`,
    custom: `<div style="display: grid; gap: 1rem; max-width: 420px">
  <baps-card class="baps-card-interactive" role="button" tabindex="0">
    <span card-title>Yuva Sabha</span>
    <span card-subtitle>3 May, 4:00 PM</span>
    <div card-actions>
      <span class="baps-tag baps-tag--success"><span class="baps-tag__label">Open</span></span>
    </div>
  </baps-card>
  <baps-card class="baps-card-interactive" role="button" tabindex="0">
    <span card-title>Annadan Seva</span>
    <span card-subtitle>Ongoing</span>
    <div card-actions>
      <span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Full</span></span>
    </div>
  </baps-card>
</div>`,
    react: `\${SETUP}

const CARDS = [
  ['Yuva Sabha', '3 May, 4:00 PM', 'Open', 'success'],
  ['Annadan Seva', 'Ongoing', 'Full', 'grey'],
];

export function Interactive({ onOpen }) {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 420 }}>
      {CARDS.map(([title, subtitle, tag, severity]) => (
        <baps-card
          key={title}
          className="baps-card-interactive"
          role="button"
          tabIndex={0}
          onClick={() => onOpen(title)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(title)}
        >
          <span card-title="">{title}</span>
          <span card-subtitle="">{subtitle}</span>
          <div card-actions="">
            <span className={\`baps-tag baps-tag--\${severity}\`}>
              <span className="baps-tag__label">{tag}</span>
            </span>
          </div>
        </baps-card>
      ))}
    </div>
  );
}`,
    next: `'use client';

\${SETUP}

/* 'use client' because the card takes a click and a keypress. A card that only
   links somewhere is better written as an <a> and stays a Server Component. */
const CARDS = [
  ['Yuva Sabha', '3 May, 4:00 PM', 'Open', 'success'],
  ['Annadan Seva', 'Ongoing', 'Full', 'grey'],
];

export default function Interactive({ onOpen }) {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 420 }}>
      {CARDS.map(([title, subtitle, tag, severity]) => (
        <baps-card
          key={title}
          className="baps-card-interactive"
          role="button"
          tabIndex={0}
          onClick={() => onOpen(title)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(title)}
        >
          <span card-title="">{title}</span>
          <span card-subtitle="">{subtitle}</span>
          <div card-actions="">
            <span className={\`baps-tag baps-tag--\${severity}\`}>
              <span className="baps-tag__label">{tag}</span>
            </span>
          </div>
        </baps-card>
      ))}
    </div>
  );
}`,
  },

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
