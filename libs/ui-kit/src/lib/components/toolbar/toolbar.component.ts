import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';

/**
 * baps-toolbar — Sampark page-level toolbar: title on the left,
 * search/actions on the right.
 *
 * Sampark-only, per the source contract (spm-ui `_toolbar.scss`) — there is
 * no MyBKY equivalent of this pattern, so unlike most components here this
 * one takes no `brand` input and carries no `.baps-sampark` scoping.
 *
 * Wraps PrimeNG v21 `p-toolbar` using its real `start`/`end` contract (per
 * PrimeNG's own docs: `<p-toolbar><ng-template #start>…<ng-template
 * #end>…`). Those are `@ContentChild('start' | 'end')` template-ref
 * queries, which resolve against the DECLARATION tree — a consumer's own
 * `<ng-template #start>` written inside `<baps-toolbar>` would never be
 * found (same constraint `baps-drawer` documents for its header/footer
 * templates). So this wrapper declares both itself and projects
 * `[toolbar-left]` / `[toolbar-right]` into them. `center` is never
 * declared: the real Sampark toolbar (dev.bapsapps.dev/spm) is one row
 * with two zones, not three — declaring an unused `#center` would make
 * PrimeNG render an empty `.p-toolbar-center` div for nothing.
 *
 * ## Anatomy
 *
 *   <baps-toolbar title="Robbinsville">
 *     <baps-button toolbar-left ariaLabel="Region" [text]="true" brand="sampark">
 *       <i class="pi pi-globe"></i><i class="pi pi-chevron-down"></i>
 *     </baps-button>
 *     <input toolbar-right bapsInputText class="search-input" placeholder="Search" />
 *     <baps-button toolbar-right label="Create Project" brand="sampark" />
 *   </baps-toolbar>
 *
 * `toolbar-left` renders ahead of `title` — the region switcher sits to the
 * LEFT of the title text (node 17512:72483), not after it.
 *
 * `toolbar-left` / `toolbar-right` are bare attribute slots — the same
 * convention `baps-drawer` and `baps-card` use, so there is no extra marker
 * directive to import. `.search-input` on a projected input is what the
 * source contract uses to pin the field to 400px; it works in either slot.
 *
 * ## Why PrimeNG's own start/end divs ARE .left/.right — no extra wrapper
 *
 * A prior version of this component declared only `#start`, then rendered
 * its own `.page-toolbar-section > .left / .right` divs entirely inside
 * that ONE slot. That left `.p-toolbar-end` never rendered at all (PrimeNG
 * gates it on `*ngIf="endTemplate"`) — everything landed inside a single
 * `.p-toolbar-start`, which is structurally wrong even when it happens to
 * look right, and is what you'd see in devtools as one oversized
 * `div.p-toolbar-start` holding the whole bar.
 *
 * The fix is to use BOTH `#start` and `#end` as two real, separate PrimeNG
 * nodes, and let THEM be `.left`/`.right` directly — no extra wrapper div
 * needed. PrimeNG's own base style (`@primeuix/styles/toolbar`) already
 * puts `display:flex; justify-content:space-between; flex-wrap:wrap` on
 * `.p-toolbar` and `display:flex; align-items:center` on each of
 * start/center/end — i.e. `.p-toolbar` already does the
 * `.page-toolbar-section` row job. Since this wrapper only ever renders one
 * row (no stacking), the outer `.page-toolbar` chrome (padding, gap,
 * background, border-bottom) lives on the same `.p-toolbar` root rather
 * than a separate wrapper level.
 */
@Component({
  selector: 'baps-toolbar',
  standalone: true,
  imports: [Toolbar],
  template: `
    <p-toolbar>
      <ng-template #start>
        <ng-content select="[toolbar-left]"></ng-content>
        @if (title) {
          <h1 class="page-toolbar-title">{{ title }}</h1>
        }
      </ng-template>
      <ng-template #end>
        <ng-content select="[toolbar-right]"></ng-content>
      </ng-template>
    </p-toolbar>
  `,
  // Encapsulation off so the rules below can reach PrimeNG's own
  // .p-toolbar / .p-toolbar-start / .p-toolbar-end elements and style the
  // projected .page-toolbar-title.
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Root — chrome (padding/background/border-bottom) + the row's own
       gap. justify-content/align-items already come from PrimeNG's base
       style. flex-wrap is overridden to nowrap: PrimeNG's base sets
       flex-wrap:wrap on THIS element, which wraps whole ZONES (drops
       .p-toolbar-end to a second line) the moment start+end don't both
       fit — not the internal wrap inside either zone. The reference
       toolbar is always one line; individual zones still wrap internally
       (see .p-toolbar-start/.p-toolbar-end below) if they ever need to. */
    baps-toolbar .p-toolbar {
      flex-wrap: nowrap;
      gap: var(--toolbar-sampark-gap, 0.5rem);
      padding: var(--toolbar-sampark-padding, 0.5rem);
      background: var(--toolbar-sampark-background, #ffffff);
      border: none;
      border-bottom: 1px solid var(--toolbar-sampark-border, #e1e0e0);
    }

    /* .left — PrimeNG's real start slot. min-width:0 lets it shrink below
       its content size instead of forcing .p-toolbar-end off the row. */
    baps-toolbar .p-toolbar-start {
      gap: var(--toolbar-sampark-section-gap, 0.25rem);
      flex: 1;
      flex-wrap: wrap;
      min-width: 0;
    }

    /* .right — PrimeNG's real end slot. flex:none so a compact right
       cluster (search + one button) never gets squeezed by .left's grow.
       flex-wrap:nowrap for the same reason as root above — its own
       children (search, button, filter icon) wrapping onto a second line
       is the exact bug this is fixing, one level deeper than the root. */
    baps-toolbar .p-toolbar-end {
      flex: none;
      flex-wrap: nowrap;
      gap: var(--toolbar-sampark-gap, 0.5rem);
    }

    /* Not scoped to one slot — the source contract pins width regardless
       of which zone a search field lands in. */
    baps-toolbar .search-input {
      width: var(--toolbar-sampark-search-width, 16rem);
    }

    /* Button labels sit inside a flex-shrinking zone (.p-toolbar-end above);
       without this they wrap to a second line well before the row is
       actually out of space. */
    baps-toolbar .p-button-label {
      white-space: nowrap;
    }

    baps-toolbar .page-toolbar-title {
      font-size: var(--toolbar-sampark-title-font-size, 1.25rem);
      font-weight: var(--toolbar-sampark-title-font-weight, 600);
      line-height: var(--toolbar-sampark-title-line-height, 1.5);
      color: var(--toolbar-sampark-title-color, #151414);
      letter-spacing: 0;
      margin: 0;
    }

    /* ── Mobile (<=767px) ──
       Above this width the one-row contract above stands: the reference
       toolbar is one line and the right cluster is fixed. Below it that
       contract is unsatisfiable — the Playground cluster alone (256px search
       + a labelled button + two icon buttons + gaps) clears 375px before the
       title is counted, and because nothing may shrink or wrap and no
       overflow is declared, the excess became sideways scroll on the PAGE
       while the toolbar drew its border-bottom at its own narrower box.

       So the two nowrap overrides are simply handed back at phone widths:
       PrimeNG's base flex-wrap: wrap on .p-toolbar drops the end zone to a
       second row, and the end zone wraps internally after that. This is
       PrimeNG's own degradation path, not a new layout.

       Not brand-scoped: baps-toolbar is a Sampark-only component and takes
       no brand input, so there is only one skin to serve. */
    @media (max-width: 767px) {
      baps-toolbar .p-toolbar {
        flex-wrap: wrap;
      }

      baps-toolbar .p-toolbar-end {
        flex: 1 1 auto;
        flex-wrap: wrap;
        justify-content: flex-end;
        min-width: 0;
      }

      /* 16rem plus any sibling action does not fit a 360px phone. Full width
         inside the wrapped end zone gives the field its own row instead of
         being the reason the row overflows. */
      baps-toolbar .search-input {
        width: 100%;
      }
    }

    /* ── Dark ──
       The three colour values above name Sampark's LIGHT chrome directly
       (#ffffff bar, #e1e0e0 hairline, #151414 title), so in dark the toolbar
       stayed a white band across the top of a dark page — and a button label
       inside it measured 1:1 against it, white on white.

       Sampark's own dark tokens, same three roles. Not brand-scoped for the
       same reason the light rules are not: baps-toolbar is Sampark-only. */
    .baps-dark baps-toolbar .p-toolbar {
      background: var(--color-sampark-dark-surface-card, #2c2c2a);
      border-bottom-color: var(--color-sampark-dark-border-divider, #4a4947);
    }

    .baps-dark baps-toolbar .page-toolbar-title {
      color: var(--color-sampark-dark-text-primary, #f8f7f7);
    }
  `,
})
export class BapsToolbar {
  /** Page/section title rendered in the start (left) slot, ahead of any `toolbar-left` content. */
  @Input() title?: string;
}
