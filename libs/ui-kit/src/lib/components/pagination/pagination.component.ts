import { Component, EventEmitter, Input, Output, ViewEncapsulation, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

/** What `pageChange` emits — the same shape PrimeNG's paginator emits, so a
 *  consumer migrating from `p-paginator` needs no handler changes. */
export interface BapsPageEvent {
  /** Zero-based index of the first row on the new page. */
  first: number;
  /** Rows per page after the change. */
  rows: number;
  /** Zero-based page index. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
}

/**
 * baps-paginator — table / list pagination controls.
 * Sampark Portal, Figma node 17512:73228.
 *
 * ## Why this is not a PrimeNG wrapper
 *
 * Every other component here wraps its PrimeNG counterpart. This one does
 * not, and the reason is the page-link row. The Figma specifies a truncated
 * list — first pages, an ellipsis, last pages ("1 2 … 24 25") — so that a
 * 250-row table does not render 25 buttons. PrimeNG's `Paginator` renders a
 * fixed window of `pageLinkSize` consecutive links and has no ellipsis, no
 * first/last anchoring, and no template hook that reaches inside the link
 * row (`paginatorleft` / `paginatorright` only bracket it). There is no
 * configuration of `p-paginator` that produces this design.
 *
 * The Figma also puts the rows-per-page dropdown immediately after the
 * record count and a "Go to" field at the far end; PrimeNG emits those in a
 * fixed DOM order that would have to be undone with `order` rules.
 *
 * This is the same call as `bapsTabs` (see CLAUDE.md "When NOT to wrap") —
 * where the PrimeNG component cannot express the design, we own the markup
 * rather than fight it. The public API is deliberately kept
 * `p-paginator`-shaped so call sites read the same.
 *
 * The rows-per-page control IS still `p-select`, so it inherits the design
 * system's select skin rather than re-deriving a dropdown.
 *
 * ## Layout (left to right, right-aligned as a group)
 *
 *   Showing 1-20 of 250 │ [20 ▾] │ « ‹ │ 1 2 … 24 25 │ › » │ Go to [ 1 ]
 */
@Component({
  selector: 'baps-paginator',
  imports: [FormsModule, Select],
  template: `
    <div class="baps-paginator" role="navigation" [attr.aria-label]="ariaLabel">
      @if (showCurrentPageReport) {
        <span class="baps-paginator__report">{{ report() }}</span>
      }

      @if (rowsPerPageOptions?.length) {
        <p-select
          class="baps-paginator__rpp"
          [options]="rowsPerPageOptions!"
          [ngModel]="rows"
          (ngModelChange)="onRowsChange($event)"
          [appendTo]="'body'"
          [panelStyleClass]="rppPanelClass"
          ariaLabel="Rows per page"
        />
      }

      @if (showFirstLastIcon) {
        <button
          type="button"
          class="baps-paginator__nav"
          [disabled]="page() === 0"
          aria-label="First page"
          (click)="goTo(0)"
        >
          <i class="pi pi-angle-double-left" aria-hidden="true"></i>
        </button>
      }

      <button
        type="button"
        class="baps-paginator__nav"
        [disabled]="page() === 0"
        aria-label="Previous page"
        (click)="goTo(page() - 1)"
      >
        <i class="pi pi-angle-left" aria-hidden="true"></i>
      </button>

      @if (showPageLinks) {
        @for (p of pages(); track $index) {
          @if (p === null) {
            <span class="baps-paginator__gap" aria-hidden="true">...</span>
          } @else {
            <button
              type="button"
              class="baps-paginator__page"
              [class.baps-paginator__page--active]="p - 1 === page()"
              [attr.aria-current]="p - 1 === page() ? 'page' : null"
              [attr.aria-label]="'Page ' + p"
              (click)="goTo(p - 1)"
            >
              {{ p }}
            </button>
          }
        }
      }

      <button
        type="button"
        class="baps-paginator__nav"
        [disabled]="page() >= pageCount() - 1"
        aria-label="Next page"
        (click)="goTo(page() + 1)"
      >
        <i class="pi pi-angle-right" aria-hidden="true"></i>
      </button>

      @if (showFirstLastIcon) {
        <button
          type="button"
          class="baps-paginator__nav"
          [disabled]="page() >= pageCount() - 1"
          aria-label="Last page"
          (click)="goTo(pageCount() - 1)"
        >
          <i class="pi pi-angle-double-right" aria-hidden="true"></i>
        </button>
      }

      @if (showJumpToPage) {
        <!-- One bordered group, split by a hairline: a label cell and the
             field. Commits on Enter and on blur — not on every keystroke,
             which would page the table away mid-type. -->
        <span class="baps-paginator__jump">
          <span class="baps-paginator__jump-label">Go to</span>
          <input
            #jump
            class="baps-paginator__jump-input"
            type="text"
            inputmode="numeric"
            [value]="page() + 1"
            aria-label="Go to page"
            (keydown.enter)="commitJump(jump.value); jump.blur()"
            (blur)="commitJump(jump.value)"
          />
        </span>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-paginator {
      display: block;
    }

    /* nowrap is load-bearing, not a preference. The strip is a fixed set of
       small controls that reads as one line; the moment any child is allowed
       to grow, wrapping turns it into a three-line block (report / control /
       buttons) rather than degrading gracefully. Every child below is
       therefore also pinned to its intrinsic width.

       nowrap is KEPT — the reasoning above is sound, and a wrapped strip is a
       worse phone experience than a scrolled one. What is added is somewhere
       for the overflow to go: without it the strip ran past its container and
       the PAGE scrolled sideways. overflow-x: auto contains that scroll to the
       strip itself, so the rest of the layout stays put. It is not gated
       behind a media query on purpose — the strip needs ~700px fully featured,
       which a narrow desktop column overflows just as readily as a phone, and
       the declaration does nothing at all while the row fits.

       safe flex-end, not flex-end: with a plain flex-end an overflowing flex
       row spills past its START edge, which no scrollbar can reach. The safe
       keyword falls back to flex-start exactly and only in that case, so
       right-alignment is unchanged whenever the row fits.

       overflow-y stays visible in intent but computes to auto alongside an
       explicit overflow-x; nothing here relies on vertical overflow — the
       rows-per-page overlay uses appendTo="body" and the focus rings are
       inset via outline-offset: -2px. */
    .baps-paginator {
      display: flex;
      align-items: center;
      justify-content: flex-end; /* fallback — the safe keyword is one value, so an engine without it drops the whole declaration */
      justify-content: safe flex-end;
      flex-wrap: nowrap;
      gap: 0.25rem;
      overflow-x: auto;
    }

    .baps-paginator > * {
      flex: none;
    }

    /* Rows-per-page sizing — deliberately NOT inside the Sampark block below,
       because it is structural rather than brand styling, and because
       skipping it is not a cosmetic loss: PrimeNG's select carries
       width: 100%, and flex: none does not save you from that — flex-basis
       resolves to the width, so the control still fills the strip and shoves
       the record count off the left edge. It has to be overridden for every
       brand, so it lives here.

       fit-content, not a fixed width: the options are 2-3 digits, and a
       declared box sized for 20 clips 100 (the label ellipsises to "10..").
       fit-content lets the control size to whichever option is current.

       !important is needed, not decorative. PrimeNG's width: 100% arrives on
       the same element through the theme layer, and flex: none does not save
       you from it — flex-basis resolves to the width, so the control still
       fills the strip and shoves the record count off the left edge. */
    /* The trailing .p-select is here for SPECIFICITY, not to narrow the match:
       that class is already on this same element. Without it the rule is
       (0,2,0), and the Sampark select skin's :is(…, baps-select.baps-sampark,
       …) .p-select is (0,2,1), so it wins and the control goes back to
       width: 100%. Both carry !important, so the tie-break is specificity
       alone. Measured 675px in a Sampark app with the shorter selector, which
       pushed the record count off the strip. */
    .baps-paginator .baps-paginator__rpp.p-select {
      width: fit-content !important;
      flex: none;
    }

    /* The label must be allowed to shrink inside that box — a flex child
       defaults to min-width: auto, which refuses to go below its content and
       would push the chevron out of the control. */
    .baps-paginator .baps-paginator__rpp .p-select-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ══════════════════════════════════════════════════════════════════
       MyBKY (default) — was previously unstyled (every rule below this
       block was Sampark-scoped only). Values from events-ui's noir.theme.ts
       PrimeNG paginator tokens: 30×30 pill nav/page buttons, Mono/80 resting
       text, Mono/10 hover fill, Mono/100 fill for the active page.
       ══════════════════════════════════════════════════════════════════ */
    baps-paginator .baps-paginator {
      gap: 0.125rem;
      font-size: 0.875rem;
    }

    baps-paginator .baps-paginator__report {
      color: var(--color-mybky-mono-900, #181b1d);
      white-space: nowrap;
    }

    baps-paginator .baps-paginator__rpp .p-select {
      height: 1.875rem;
    }

    baps-paginator .baps-paginator__nav,
    baps-paginator .baps-paginator__page {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.875rem;
      height: 1.875rem;
      padding: 0 0.375rem;
      background: transparent;
      border: 0;
      border-radius: var(--radius-mybky-pill, 9999px);
      color: var(--color-mybky-mono-800, #2b2f32);
      font-family: inherit;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 150ms ease, color 150ms ease;
    }

    baps-paginator .baps-paginator__nav:hover:not(:disabled),
    baps-paginator .baps-paginator__page:hover:not(.baps-paginator__page--active) {
      background: var(--color-mybky-mono-50, #f8fafb);
      color: var(--color-mybky-mono-900, #181b1d);
    }

    baps-paginator .baps-paginator__nav:disabled {
      color: var(--color-mybky-mono-400, #b6b6af);
      cursor: default;
    }

    baps-paginator .baps-paginator__page--active {
      background: var(--color-mybky-mono-900, #181b1d);
      color: var(--color-mybky-mono-0, #ffffff);
      font-weight: 600;
    }

    baps-paginator :is(.baps-paginator__nav, .baps-paginator__page):focus-visible {
      outline: 2px solid var(--color-mybky-blue-600, #5f78b8);
      outline-offset: -2px;
    }

    baps-paginator .baps-paginator__gap {
      display: inline-flex;
      align-items: flex-end;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.875rem;
      padding-bottom: 0.25rem;
      color: var(--color-mybky-mono-500, #6f777d);
      user-select: none;
    }

    baps-paginator .baps-paginator__jump {
      display: inline-flex;
      align-items: stretch;
      height: 1.875rem;
      margin-inline-start: 0.25rem;
      background: var(--color-mybky-mono-0, #ffffff);
      border: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      border-radius: var(--radius-mybky-md, 0.5rem);
      overflow: hidden;
    }

    baps-paginator .baps-paginator__jump-label {
      display: inline-flex;
      align-items: center;
      padding: 0 0.75rem;
      border-inline-end: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      color: var(--color-mybky-mono-900, #181b1d);
      font-weight: 600;
      white-space: nowrap;
    }

    baps-paginator .baps-paginator__jump-input {
      width: 2.5rem;
      padding: 0 0.25rem;
      background: transparent;
      border: 0;
      color: var(--color-mybky-mono-900, #181b1d);
      font-family: inherit;
      font-size: 0.875rem;
      text-align: center;
    }

    baps-paginator .baps-paginator__jump-input:focus {
      outline: none;
    }
    baps-paginator .baps-paginator__jump:focus-within {
      border-color: var(--color-mybky-blue-600, #5f78b8);
    }

    /* ══════════════════════════════════════════════════════════════════
       SAMPARK — Figma 17512:73228
       Every element is 32px tall so the strip reads as one row. Values
       below come from the frame's own variables: Mono/80 #595656 for
       resting text, Mono/100 #151414 for the active page, Mono/40 #bcb9b9
       for disabled, Mono/20% Black #1514140a for the active page's fill.
       ══════════════════════════════════════════════════════════════════ */
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator {
      gap: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.3;
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__report {
      color: var(--color-sampark-text-secondary, #595656);
      white-space: nowrap;
    }

    /* Rows-per-page — a real p-select, so the select skin supplies the box,
       the chevron and the overlay. Only its WIDTH is set here, and it has to
       be: PrimeNG's select is a block-level width: 100% control built for
       form rows, so dropped into this flex strip it eats every spare pixel
       and pushes the buttons onto a second line. width: max-content sizes
       it to "100" plus the chevron instead. The value is 2-3 digits, so the
       min-width keeps "20" and "100" the same width and stops the strip
       shuffling sideways when the page size changes. */
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__rpp .p-select {
      height: var(--form-field-sampark-height-default, 2rem);
    }
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__rpp .p-select-label {
      display: flex;
      align-items: center;
      padding-inline-end: 0.25rem;
      font-size: 0.875rem;
    }

    /* ── Nav arrows and page links ──
       Same 32px box; the arrows differ only in carrying an icon. */
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__nav,
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__page {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--form-field-sampark-height-default, 2rem);
      height: var(--form-field-sampark-height-default, 2rem);
      padding: 0 0.375rem;
      background: transparent;
      border: 0;
      border-radius: var(--radius-sampark-default, 0.25rem);
      color: var(--color-sampark-text-secondary, #595656);
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.3;
      cursor: pointer;
      transition: background-color 120ms cubic-bezier(0.16, 1, 0.3, 1), color 120ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__nav:hover:not(:disabled),
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__page:hover:not(.baps-paginator__page--active) {
      background: var(--color-sampark-secondary-0, #f8f7f7);
      color: var(--color-sampark-text-primary, #151414);
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__nav:disabled {
      color: var(--color-sampark-text-disabled, #bcb9b9);
      cursor: default;
    }

    /* The active page is a light neutral fill with dark semibold text — NOT
       the maroon primary. Figma reads Mono/20% Black here; the accent is
       reserved for actions, and a filled maroon chip in a footer strip
       competes with the page's real primary button. */
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__page--active {
      background: var(--color-sampark-mono-alpha4, rgba(21, 20, 20, 0.04));
      color: var(--color-sampark-text-primary, #151414);
      font-weight: 600;
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) :is(.baps-paginator__nav, .baps-paginator__page):focus-visible {
      outline: 2px solid var(--color-sampark-primary-default, #c96868);
      outline-offset: -2px;
    }

    /* Ellipsis — a label, not a control: it is not focusable and does not
       react to hover, so it must not look like the page links beside it. */
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__gap {
      display: inline-flex;
      align-items: flex-end;
      justify-content: center;
      min-width: 1.25rem;
      height: var(--form-field-sampark-height-default, 2rem);
      padding-bottom: 0.375rem;
      color: var(--color-sampark-text-secondary, #595656);
      user-select: none;
    }

    /* ── Go to ──
       A single bordered group split by a hairline, the way the Figma draws
       it — not two adjacent controls, which would show a 2px seam. */
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__jump {
      display: inline-flex;
      align-items: stretch;
      height: var(--form-field-sampark-height-default, 2rem);
      margin-inline-start: 0.25rem;
      background: var(--color-sampark-surface-card, #ffffff);
      border: 1px solid var(--color-sampark-border-default, #e1e0e0);
      border-radius: var(--radius-sampark-default, 0.25rem);
      overflow: hidden;
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__jump-label {
      display: inline-flex;
      align-items: center;
      padding: 0 0.75rem;
      border-inline-end: 1px solid var(--color-sampark-border-default, #e1e0e0);
      color: var(--color-sampark-text-primary, #151414);
      font-weight: 600;
      white-space: nowrap;
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__jump-input {
      width: 2.5rem;
      padding: 0 0.25rem;
      background: transparent;
      border: 0;
      color: var(--color-sampark-text-primary, #151414);
      font-family: inherit;
      font-size: 0.875rem;
      text-align: center;
    }

    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__jump-input:focus {
      outline: none;
    }
    :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__jump:focus-within {
      border-color: var(--color-sampark-primary-default, #c96868);
    }

    /* ── Dark mode ── */
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__report,
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__nav,
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__page,
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__gap {
      color: var(--color-mybky-mono-400, #b6b6af);
    }
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__nav:hover:not(:disabled),
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__page:hover:not(.baps-paginator__page--active) {
      background: var(--color-mybky-mono-800, #2b2f32);
      color: var(--color-mybky-mono-50, #f8fafb);
    }
    .baps-dark :is(baps-paginator.baps-sampark, .baps-ds-sampark baps-paginator) .baps-paginator__page--active {
      background: rgba(255, 255, 255, 0.08);
      color: var(--color-mybky-mono-50, #f8fafb);
    }

    /* The same treatment for the DEFAULT (MyBKY) paginator, which had none.
       Measured before this block, in dark: the report line was #181b1d on
       #181b1d — 1:1, literally invisible — page numbers were #2b2f32 at
       1.28:1, and the jump box was a white card. Every value below is the
       mono step the light rule uses, read from the other end of the ramp. */
    .baps-dark baps-paginator .baps-paginator__report,
    .baps-dark baps-paginator .baps-paginator__jump-label,
    .baps-dark baps-paginator .baps-paginator__jump-input {
      color: var(--color-mybky-dark-text-primary, #f8fafb);
    }

    .baps-dark baps-paginator .baps-paginator__nav,
    .baps-dark baps-paginator .baps-paginator__page {
      color: var(--color-mybky-dark-text-secondary, #e4ecf1);
    }

    .baps-dark baps-paginator .baps-paginator__gap {
      color: var(--color-mybky-dark-text-muted, #b6b6af);
    }

    .baps-dark baps-paginator .baps-paginator__nav:hover:not(:disabled),
    .baps-dark baps-paginator .baps-paginator__page:hover:not(.baps-paginator__page--active) {
      background: var(--color-mybky-dark-surface-hover, #3d4144);
      color: var(--color-mybky-dark-text-primary, #f8fafb);
    }

    .baps-dark baps-paginator .baps-paginator__nav:disabled {
      color: var(--color-mybky-dark-text-disabled, #6f777d);
    }

    /* The active page inverts in light — dark ink chip, white number. Inverting
       the same way in dark would be a near-black chip on a near-black strip, so
       it takes the raised surface and the accent's dark step instead. */
    .baps-dark baps-paginator .baps-paginator__page--active {
      background: var(--color-mybky-dark-surface-hover, #3d4144);
      color: var(--color-mybky-dark-primary-default, #9fadd9);
    }

    .baps-dark baps-paginator .baps-paginator__jump {
      background: var(--color-mybky-dark-surface-card, #2b2f32);
      border-color: var(--color-mybky-dark-border-divider, #3d4144);
    }

    .baps-dark baps-paginator .baps-paginator__jump-label {
      border-inline-end-color: var(--color-mybky-dark-border-divider, #3d4144);
    }

    .baps-dark baps-paginator :is(.baps-paginator__nav, .baps-paginator__page):focus-visible,
    .baps-dark baps-paginator .baps-paginator__jump:focus-within {
      outline-color: var(--color-mybky-dark-primary-default, #9fadd9);
      border-color: var(--color-mybky-dark-primary-default, #9fadd9);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsPaginator {
  /**
   * Class on the rows-per-page overlay.
   *
   * The panel is appended to <body>, so without a class of its own it is
   * indistinguishable from every other select overlay on the page — there is
   * no way to style just this one. `baps-ds-sampark` rides along because the
   * same detachment takes the panel out of any page-level brand scope.
   */
  protected readonly rppPanelClass = 'baps-ds-sampark baps-paginator__rpp-panel';

  /** Number of rows displayed per page. */
  @Input() set rows(v: number) {
    this._rows.set(v || 1);
  }
  get rows(): number {
    return this._rows();
  }
  private readonly _rows = signal(10);

  /** Total number of records in the dataset. */
  @Input() set totalRecords(v: number) {
    this._total.set(v ?? 0);
  }
  get totalRecords(): number {
    return this._total();
  }
  private readonly _total = signal(0);

  /** Zero-based index of the first row of the current page. */
  @Input() set first(v: number) {
    this._first.set(v ?? 0);
  }
  get first(): number {
    return this._first();
  }
  private readonly _first = signal(0);

  /** Dropdown options for the rows-per-page selector. Omit to hide it. */
  @Input() rowsPerPageOptions?: number[];
  /** The « and » jumps. */
  @Input() showFirstLastIcon = true;
  /** The "Showing 1-20 of 250" text. */
  @Input() showCurrentPageReport = false;
  /** Placeholders: {first} {last} {totalRecords} {currentPage} {totalPages}. */
  @Input() currentPageReportTemplate = 'Showing {first}-{last} of {totalRecords}';
  @Input() showPageLinks = true;
  /** The trailing "Go to [ n ]" field. */
  @Input() showJumpToPage = false;
  @Input() ariaLabel = 'Pagination';
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /** Emitted whenever the page or the rows-per-page changes. */
  @Output() pageChange = new EventEmitter<BapsPageEvent>();

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this._total() / this._rows())));
  protected readonly page = computed(() => Math.min(Math.floor(this._first() / this._rows()), this.pageCount() - 1));

  protected report(): string {
    const first = this._total() === 0 ? 0 : this._first() + 1;
    const last = Math.min(this._first() + this._rows(), this._total());
    return this.currentPageReportTemplate.replace('{first}', String(first))
      .replace('{last}', String(last))
      .replace('{totalRecords}', String(this._total()))
      .replace('{currentPage}', String(this.page() + 1))
      .replace('{totalPages}', String(this.pageCount()));
  }

  /**
   * The visible page numbers, with `null` marking an elided run.
   *
   * Always keeps the first two, the last two and the current page's
   * immediate neighbours, then inserts a gap wherever the kept numbers are
   * not consecutive. On page 1 of 25 that is `1 2 … 24 25`, exactly the
   * Figma; in the middle it opens to `1 2 … 12 13 14 … 24 25`. The list
   * never changes width by more than one slot as the user pages, so the
   * strip does not jitter.
   */
  protected pages(): (number | null)[] {
    const total = this.pageCount();
    const current = this.page() + 1;
    const keep = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
    const sorted = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

    const out: (number | null)[] = [];
    let prev = 0;
    for (const n of sorted) {
      if (prev && n - prev > 1) out.push(null);
      out.push(n);
      prev = n;
    }
    return out;
  }

  protected goTo(page: number): void {
    const next = Math.max(0, Math.min(page, this.pageCount() - 1));
    if (next === this.page()) return;
    this._first.set(next * this._rows());
    this.emit();
  }

  protected onRowsChange(rows: number): void {
    // Keep the first visible record in view rather than resetting to page 1 —
    // changing the page size should not lose the user's place in the list.
    const anchor = this._first();
    this._rows.set(rows);
    this._first.set(Math.floor(anchor / rows) * rows);
    this.emit();
  }

  protected commitJump(value: string): void {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) this.goTo(n - 1);
  }

  private emit(): void {
    this.pageChange.emit({
      first: this._first(),
      rows: this._rows(),
      page: this.page(),
      pageCount: this.pageCount(),
    });
  }
}
