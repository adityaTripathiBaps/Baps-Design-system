import { Component, Input, ViewEncapsulation } from '@angular/core';

/** Inner padding step. `compact` (16px) suits dense/table-adjacent cards. */
export type BapsCardPadding = 'default' | 'compact' | 'none';

/**
 * baps-card — a bordered content container.
 *
 * The generic block every admin screen is built out of: dashboard summary
 * tiles, form sections, list panels, empty states. Deliberately unopinionated
 * about its contents — everything is projected.
 *
 * ## Why this exists
 *
 * `libs/ui-kit` shipped no container component, so consuming apps hand-rolled
 * `<div class="panel">` from raw tokens (`--color-sampark-surface-card`,
 * `--color-sampark-border-default`, `--radius-sampark-md`, `--space-*`) and
 * re-derived the same geometry each time. That is exactly the drift this
 * library exists to prevent, and it is also how a card ends up with a MyBKY
 * border on a Sampark page. This wraps that geometry once.
 *
 * PrimeNG's own `p-card` is deliberately NOT wrapped here. An earlier version
 * of this note said p-card "hard-codes a box-shadow at rest"; that is wrong,
 * and worth correcting rather than deleting — `shadow` IS a settable token in
 * v21, reachable through the same `dt` passthrough the rest of this library
 * uses. The real reasons are structural, and all three were checked against
 * primeng 21.1.3:
 *
 * 1. The card's defining feature is a 1px hairline border (CLAUDE.md: hairlines
 *    do the structural work, shadows are for floating elements). The v21 card
 *    token set is `background`, `borderRadius`, `color`, `shadow` plus
 *    `body.padding`/`body.gap` and the title/subtitle text tokens — there is
 *    no `borderColor` and no `borderWidth`. The border is CSS either way.
 * 2. `.p-card-caption` holds only title and subtitle. There is no actions
 *    slot, and `card-actions` has to sit opposite the title spanning both its
 *    rows, so the header grid is custom either way.
 * 3. `divided` draws its rules full-bleed using negative inline margins keyed
 *    to the card's own padding value. That value therefore has to stay a CSS
 *    custom property; routing padding through the `body.padding` token instead
 *    would put it somewhere CSS cannot read it back.
 *
 * What wrapping would add on top of all that CSS: two more elements between
 * the host and the content (`.p-card` > `.p-card-body`), and a split between
 * the focusable element (this host, which carries `role="button"` and the
 * focus ring when `interactive`) and the element painting the visible border.
 * Same CSS, more DOM, worse focus/border coupling — so the host stays the card.
 *
 * ## Anatomy
 *
 * Four slots, all optional, all selected by bare attribute — the same
 * convention `baps-navbar` uses for `navbar-end`, so there are no extra
 * marker directives to import. The header row disappears entirely when none
 * of its three slots are filled, so a bare `<baps-card>Text</baps-card>` is
 * just a padded bordered box with no stray gap above the content.
 *
 *   <baps-card brand="sampark">
 *     <span card-title>Registrations this week</span>
 *     <span card-subtitle>Yuva Sabha — 3 May</span>
 *     <div card-actions><baps-button label="Export" [text]="true" /></div>
 *
 *     Body content goes in the default slot.
 *
 *     <div card-footer>Updated 12 April 2026</div>
 *   </baps-card>
 *
 * `card-actions` sits top-right on the header row, opposite the title, and
 * spans both the title and subtitle rows.
 *
 * ## Rules this encodes (CLAUDE.md "Visual Rules")
 *
 * - A card at rest is `background: white`, a 1px hairline border, 8px radius,
 *   and 24px padding — **no shadow**. `[raised]="true"` exists for the rare
 *   floating case and is the only way to get a shadow here.
 * - `[interactive]="true"` marks a whole card as a click target: hover
 *   border-darken plus a keyboard focus ring, and nothing else. It does not
 *   scale, lift, or shadow-jump on hover.
 * - Separators between header/body/footer are hairlines, never shadows, and
 *   are opt-in via `[divided]="true"` — an undivided card is the default
 *   because most cards are a single thought.
 */
@Component({
  selector: 'baps-card',
  // The header holds the three slot elements directly (no grouping wrappers)
  // so that `.baps-card__header:empty` is true whenever none of them are
  // filled — Ivy's <ng-content> leaves no DOM node behind, and Angular's
  // default `preserveWhitespaces: false` strips the whitespace-only text
  // nodes between them at compile time. Grid areas do the two-row layout that
  // the wrappers would otherwise have provided.
  template: `
    <div class="baps-card__header">
      <ng-content select="[card-title]"></ng-content>
      <ng-content select="[card-subtitle]"></ng-content>
      <ng-content select="[card-actions]"></ng-content>
    </div>

    <div class="baps-card__body">
      <ng-content></ng-content>
    </div>

    <div class="baps-card__footer">
      <ng-content select="[card-footer]"></ng-content>
    </div>
  `,
  // Encapsulation is off for the same reason as every other wrapper here: the
  // Sampark scope class (.baps-ds-sampark) lives on <body>, outside any
  // emulated-encapsulation boundary, so a scoped stylesheet could never see
  // it. Every selector below is anchored to the baps-card host tag, so
  // nothing leaks.
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/card/_card.scss so the same rules can
  // style raw <baps-card> markup that Angular never rendered — see the header
  // comment there. styleUrls keeps it shipping with the component, so an app
  // that only imports BapsCard is unaffected.
  styleUrls: ['../../styles/components/card/_card.scss'],
  host: {
    '[class.baps-card-compact]': "padding === 'compact'",
    '[class.baps-card-flush]': "padding === 'none'",
    '[class.baps-card-divided]': 'divided',
    '[class.baps-card-raised]': 'raised',
    '[class.baps-card-interactive]': 'interactive',
    '[class.baps-sampark]': "brand === 'sampark'",
    '[attr.tabindex]': 'interactive ? 0 : null',
    '[attr.role]': 'interactive ? "button" : null',
  },
})
export class BapsCard {
  /** Inner padding: 24px (default), 16px (`compact`), or 0 (`none`). */
  @Input() padding: BapsCardPadding = 'default';
  /** Hairline rules between header/body/footer. Off by default. */
  @Input() divided = false;
  /**
   * Adds the brand shadow. Reserve for cards that genuinely float — a card at
   * rest gets a hairline border and no shadow (CLAUDE.md).
   */
  @Input() raised = false;
  /**
   * Marks the whole card as one click target: hover border-darken, keyboard
   * focus ring, `role="button"` and `tabindex="0"`. Bind your own `(click)`
   * on the host; this input only supplies the affordance.
   */
  @Input() interactive = false;
  /** Visual skin. 'sampark' also arrives page-wide via `.baps-ds-sampark`. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
