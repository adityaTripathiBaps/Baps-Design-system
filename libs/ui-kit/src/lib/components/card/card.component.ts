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
  styles: `
    baps-card {
      display: flex;
      flex-direction: column;
      gap: var(--card-mybky-gap, 1rem);
      box-sizing: border-box;
      background: var(--card-mybky-background, #ffffff);
      border: var(--card-mybky-border-width, 1px) solid var(--card-mybky-border, #e4ecf1);
      border-radius: var(--card-mybky-radius, 0.5rem);
      padding: var(--card-mybky-padding, 1.5rem);
      color: inherit;
    }

    /* An unfilled slot leaves its wrapper with no child nodes at all, so it
       drops out of the flex column — and out of the gap calculation, which is
       what would otherwise show up as phantom space above the body. */
    baps-card .baps-card__header:empty,
    baps-card .baps-card__body:empty,
    baps-card .baps-card__footer:empty {
      display: none;
    }

    baps-card .baps-card__header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        'title actions'
        'subtitle actions';
      column-gap: var(--space-3, 0.75rem);
      row-gap: var(--space-1, 0.25rem);
      align-items: center;
    }

    baps-card .baps-card__body,
    baps-card .baps-card__footer {
      min-width: 0;
    }

    /* Slot typography is applied to whatever the consumer projects, so
       <h2 card-title> and <span card-title> land identically — the slot
       carries the style, not the tag. Margin is zeroed because a projected
       heading element brings the UA's own. */
    baps-card [card-title] {
      grid-area: title;
      margin: 0;
      font-size: var(--font-size-base, 1rem);
      font-weight: var(--font-weight-semibold, 600);
      line-height: var(--font-line-height-tight, 1.3);
      color: var(--card-mybky-title-color, #181b1d);
    }
    baps-card [card-subtitle] {
      grid-area: subtitle;
      margin: 0;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-regular, 400);
      line-height: var(--font-line-height-tight, 1.3);
      color: var(--card-mybky-subtitle-color, #6f777d);
    }
    baps-card [card-actions] {
      grid-area: actions;
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
    }

    /* ── Padding steps ── */
    baps-card.baps-card-compact {
      padding: var(--card-mybky-padding-compact, 1rem);
    }
    baps-card.baps-card-flush {
      padding: 0;
    }

    /* ── Divided — hairlines only, never shadows (CLAUDE.md). Negative inline
       margins let the rule span the full card width while the content stays
       inside the padding box. ── */
    baps-card.baps-card-divided .baps-card__header {
      padding-bottom: var(--card-mybky-gap, 1rem);
      border-bottom: var(--card-mybky-border-width, 1px) solid var(--card-mybky-border, #e4ecf1);
    }
    baps-card.baps-card-divided .baps-card__footer {
      padding-top: var(--card-mybky-gap, 1rem);
      border-top: var(--card-mybky-border-width, 1px) solid var(--card-mybky-border, #e4ecf1);
    }
    baps-card.baps-card-divided:not(.baps-card-flush) .baps-card__header,
    baps-card.baps-card-divided:not(.baps-card-flush) .baps-card__footer {
      margin-inline: calc(-1 * var(--card-mybky-padding, 1.5rem));
      padding-inline: var(--card-mybky-padding, 1.5rem);
    }
    baps-card.baps-card-divided.baps-card-compact .baps-card__header,
    baps-card.baps-card-divided.baps-card-compact .baps-card__footer {
      margin-inline: calc(-1 * var(--card-mybky-padding-compact, 1rem));
      padding-inline: var(--card-mybky-padding-compact, 1rem);
    }

    /* ── Raised — the ONLY shadow. Reserved for a card that genuinely floats. ── */
    baps-card.baps-card-raised {
      box-shadow: var(--card-mybky-shadow, 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.16));
    }

    /* ── Interactive — border darkens on hover; ring on keyboard focus. No
       transform, no shadow jump (CLAUDE.md "Interaction states"). ── */
    baps-card.baps-card-interactive {
      cursor: pointer;
      transition: border-color 120ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    baps-card.baps-card-interactive:hover {
      border-color: var(--color-mybky-mono-500, #6f777d);
    }
    baps-card.baps-card-interactive:focus-visible {
      outline: 2px solid var(--color-mybky-primary-default, #2b6cb0);
      outline-offset: 2px;
    }

    /* ═══ Sampark scope — one instance via brand="sampark", or page-wide via
       the .baps-ds-sampark body class the Storybook toolbar toggles. Only the
       token family changes; every rule above still describes the geometry. ═══ */
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card) {
      gap: var(--card-sampark-gap, 1rem);
      background: var(--card-sampark-background, #ffffff);
      border-color: var(--card-sampark-border, #e1e0e0);
      border-width: var(--card-sampark-border-width, 1px);
      border-radius: var(--card-sampark-radius, 0.5rem);
      padding: var(--card-sampark-padding, 1.5rem);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-compact {
      padding: var(--card-sampark-padding-compact, 1rem);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-flush {
      padding: 0;
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card) [card-title] {
      color: var(--card-sampark-title-color, #151414);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card) [card-subtitle] {
      color: var(--card-sampark-subtitle-color, #9f9c9c);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-divided .baps-card__header {
      padding-bottom: var(--card-sampark-gap, 1rem);
      border-bottom-color: var(--card-sampark-border, #e1e0e0);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-divided .baps-card__footer {
      padding-top: var(--card-sampark-gap, 1rem);
      border-top-color: var(--card-sampark-border, #e1e0e0);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-divided:not(.baps-card-flush) .baps-card__header,
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-divided:not(.baps-card-flush) .baps-card__footer {
      margin-inline: calc(-1 * var(--card-sampark-padding, 1.5rem));
      padding-inline: var(--card-sampark-padding, 1.5rem);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-divided.baps-card-compact .baps-card__header,
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-divided.baps-card-compact .baps-card__footer {
      margin-inline: calc(-1 * var(--card-sampark-padding-compact, 1rem));
      padding-inline: var(--card-sampark-padding-compact, 1rem);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-raised {
      box-shadow: var(--card-sampark-shadow, 0 12px 16px -4px rgba(16, 24, 40, 0.08));
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-interactive:hover {
      border-color: var(--color-sampark-border-hover, #94928f);
    }
    :is(baps-card.baps-sampark, .baps-ds-sampark baps-card).baps-card-interactive:focus-visible {
      outline-color: var(--color-sampark-primary-default, #c96868);
    }

    /* ── Dark mode (PrimeNG darkModeSelector). Surfaces follow the preset's
       own content tokens so a card sits on the dark canvas correctly. ── */
    .baps-dark baps-card {
      background: var(--p-content-background, #1b1b1b);
      border-color: var(--p-content-border-color, rgba(255, 255, 255, 0.12));
    }
    .baps-dark baps-card [card-title] {
      color: var(--p-text-color, #e6e6e6);
    }
    .baps-dark baps-card [card-subtitle] {
      color: var(--p-text-muted-color, #a5a5a5);
    }
    .baps-dark baps-card.baps-card-divided .baps-card__header,
    .baps-dark baps-card.baps-card-divided .baps-card__footer {
      border-color: var(--p-content-border-color, rgba(255, 255, 255, 0.12));
    }
  `,
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
