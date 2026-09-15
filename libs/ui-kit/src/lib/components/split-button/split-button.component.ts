import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem, PrimeTemplate } from 'primeng/api';

/**
 * baps-split-button — primary action + dropdown of secondary actions
 * (Sampark Portal "Split Button", Figma node 13197:92206).
 *
 * Wraps PrimeNG SplitButton. The Sampark skin is CSS-only (no dt): unlike
 * baps-button, the two inner p-button instances live inside p-splitbutton,
 * so a scoped dt on the host can't reach their button tokens — the color
 * rules below restate the button.sampark.* palette instead.
 */
@Component({
  selector: 'baps-split-button',
  imports: [SplitButton, PrimeTemplate],
  template: `
    <p-splitbutton
      [label]="hasCount ? undefined : label"
      [icon]="hasCount ? undefined : icon"
      [model]="model"
      [severity]="severity"
      [size]="primeSize"
      [disabled]="disabled"
      [menuStyleClass]="menuStyleClass ?? ''"
      (onClick)="clicked.emit($event)"
    >
      @if (hasCount) {
        <ng-template pTemplate="content">
          @if (icon) {
            <span [class]="icon" aria-hidden="true"></span>
          }
          @if (label) {
            <span class="p-button-label">{{ label }}</span>
          }
          <span class="baps-splitbutton-count" [attr.aria-label]="countLabel">{{ count }}</span>
        </ng-template>
      }
    </p-splitbutton>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Every Sampark rule matches under either scope: per-instance
       brand="sampark" (host class) or the whole-preview .baps-ds-sampark
       toggle — same convention as baps-button. The MyBKY block below is
       unscoped (it's the default brand, same convention as baps-alert /
       baps-progressbar / baps-paginator). */

    /* ── MyBKY: pill radius, blue gradient primary, danger/warn covered
       (matches baps-button's mybky colorScheme — see baps.theme.ts) ── */

    /* A split-button label never wraps. The height is fixed by the size step, so a
       second line either overflows the box or pushes the glyph off-centre —
       "Ad-hoc" broke at its hyphen and "Button Text" at its space whenever the
       container was narrower than the text. PrimeNG leaves white-space at its
       initial "normal", so this has to be stated. Long labels now overflow
       visibly, which is the honest failure: the fix is a shorter label, not a
       taller control. */
    baps-split-button .p-button-label {
      white-space: nowrap;
    }

    /* ── Notification count ──
       Figma "Button Notification Counts" (Sampark 13197:92212, and the same
       element in the MyBKY set 22465:94086). A 16px pill after the label,
       inside the action segment.

       It is NOT baps-indicator. That component is the 12/16/20/24 dot scale
       drawn white-on-a-semantic-fill; this one is the inverse — white fill,
       hairline border, dark text — because it sits ON a filled brand button
       and has to read against it. Figma names them separately too.

       min-width equals the height so a single digit stays a circle and only
       a two-digit tally stretches it into a pill; the 4px padding is what
       does the stretching. Values read from the VARIABLE definitions, not
       the fallbacks in the generated reference, which were stale again
       (#e6e5e5 for Mono/Borders against the real #e1e0e0, and #0e0d0d for
       Mono/100 against #151414). */
    baps-split-button .baps-splitbutton-count {
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      height: 1rem;
      min-width: 1rem;
      padding: 0 0.25rem;
      border-radius: 100px;
      border: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      background: var(--color-mybky-mono-0, #ffffff);
      color: var(--color-mybky-mono-900, #181b1d);
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.3;
      white-space: nowrap;
    }

    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button)
      .baps-splitbutton-count {
      border-color: var(--color-sampark-mono-borders, #e1e0e0);
      background: var(--color-sampark-mono-0, #ffffff);
      color: var(--color-sampark-mono-100, #151414);
    }

    /* A disabled button dims as a whole; the pill must not stay bright white
       on a greyed-out control. */
    baps-split-button .p-button:disabled .baps-splitbutton-count,
    baps-split-button .p-disabled .baps-splitbutton-count {
      opacity: 0.6;
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button {
      height: var(--button-mybky-height-m, 2.25rem);
      padding-top: 0;
      padding-bottom: 0;
      font-weight: var(--button-mybky-font-weight, 600);
      border-radius: 0;
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button:first-child {
      border-start-start-radius: var(--button-mybky-radius, 999px);
      border-end-start-radius: var(--button-mybky-radius, 999px);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-splitbutton-dropdown {
      border-start-end-radius: var(--button-mybky-radius, 999px);
      border-end-end-radius: var(--button-mybky-radius, 999px);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button-sm {
      height: var(--button-mybky-height-s, 2rem);
    }
    /* MyBKY's L step is deliberately the SAME height as M (both 2.25rem) —
       per the button.mybky.height.l token comment it's the mobile variant,
       differentiated by a 16px font rather than a taller box. Without the
       font bump, size="large" renders identically to the default and looks
       like a no-op; baps-button's own preset sets lg.fontSize 16px, matched
       here. */
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button-lg {
      height: var(--button-mybky-height-l, 2.25rem);
      font-size: 1rem;
    }
    baps-split-button.baps-splitbutton-xl:not(.baps-sampark) .p-splitbutton .p-button {
      height: var(--button-mybky-height-xl, 2.625rem);
      font-size: 1rem;
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button:not(.p-button-secondary):not(.p-button-danger):not(.p-button-warn):not(.p-button-success):not(.p-button-info):not(.p-button-help):not(.p-button-contrast):not(:disabled) {
      background: var(--button-mybky-primary-default, #5f78b8);
      border-color: transparent;
      color: var(--button-mybky-primary-text, #ffffff);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button:not(.p-button-secondary):not(.p-button-danger):not(.p-button-warn):not(.p-button-success):not(.p-button-info):not(.p-button-help):not(.p-button-contrast):not(:disabled):hover {
      background: var(--button-mybky-primary-hover, #4a5f96);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-splitbutton-dropdown:not(.p-button-secondary) {
      border-inline-start: 1px solid rgba(255, 255, 255, 0.24);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-secondary:not(:disabled) {
      background: var(--button-mybky-secondary-default, #ffffff);
      border: 1px solid var(--button-mybky-secondary-border, #e4ecf1);
      color: var(--button-mybky-secondary-text, #181b1d);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-secondary:not(:disabled):hover {
      background: var(--button-mybky-secondary-hover, #e4ecf1);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-splitbutton-dropdown.p-button-secondary:not(:disabled) {
      border-inline-start-color: var(--button-mybky-secondary-border, #e4ecf1);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-danger:not(:disabled) {
      background: var(--button-mybky-danger-default, #e05255);
      border-color: transparent;
      color: var(--button-mybky-danger-text, #ffffff);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-danger:not(:disabled):hover {
      background: var(--button-mybky-danger-hover, #c32226);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-warn:not(:disabled) {
      background: var(--button-mybky-warning-default, #d99a2b);
      border-color: transparent;
      color: var(--button-mybky-warning-text, #ffffff);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-warn:not(:disabled):hover {
      background: var(--button-mybky-warning-hover, #b87e1f);
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button:disabled {
      color: var(--button-mybky-disabled-text-color, #8d9ba5);
      opacity: 1;
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button:not(.p-button-secondary):disabled {
      background: var(--button-mybky-primary-disabled, rgba(95, 120, 184, 0.1));
    }
    baps-split-button:not(.baps-sampark) .p-splitbutton .p-button.p-button-secondary:disabled {
      background: var(--button-mybky-secondary-disabled, #f8fafb);
      border-color: var(--button-mybky-secondary-border, #e4ecf1);
    }

    /* ── Geometry: explicit heights (28/32/36/42), 4px outer radius ── */
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button {
      height: var(--button-sampark-height-default, 2rem);
      padding-top: 0;
      padding-bottom: 0;
      font-weight: var(--button-sampark-font-weight, 600);
      border-radius: 0;
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button:first-child {
      border-start-start-radius: var(--button-sampark-radius, 0.25rem);
      border-end-start-radius: var(--button-sampark-radius, 0.25rem);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-splitbutton-dropdown {
      border-start-end-radius: var(--button-sampark-radius, 0.25rem);
      border-end-end-radius: var(--button-sampark-radius, 0.25rem);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button-sm {
      height: var(--button-sampark-height-sm, 1.75rem);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button-lg {
      height: var(--button-sampark-height-lg, 2.25rem);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button).baps-splitbutton-xl .p-splitbutton .p-button {
      height: var(--button-sampark-height-xl, 2.625rem);
      font-size: 1rem;
    }

    /* ── Primary: flat maroon, darkening one step per state ──
       Excludes every severity class PrimeNG applies for the others (danger/
       warn/success/info/help/contrast have no Sampark override — same gap
       Button itself has, see button.component.ts — so they fall through to
       PrimeNG's own severity colors instead of being force-painted maroon). */
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button:not(.p-button-secondary):not(.p-button-danger):not(.p-button-warn):not(.p-button-success):not(.p-button-info):not(.p-button-help):not(.p-button-contrast):not(:disabled) {
      background: var(--button-sampark-primary-default, #c96868);
      border-color: var(--button-sampark-primary-default, #c96868);
      color: var(--button-sampark-primary-text, #ffffff);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button:not(.p-button-secondary):not(.p-button-danger):not(.p-button-warn):not(.p-button-success):not(.p-button-info):not(.p-button-help):not(.p-button-contrast):not(:disabled):hover {
      background: var(--button-sampark-primary-hover, #b44141);
      border-color: var(--button-sampark-primary-hover, #b44141);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button:not(.p-button-secondary):not(.p-button-danger):not(.p-button-warn):not(.p-button-success):not(.p-button-info):not(.p-button-help):not(.p-button-contrast):not(:disabled):active {
      background: var(--button-sampark-primary-active, #873030);
      border-color: var(--button-sampark-primary-active, #873030);
    }
    /* Hairline divider between the label and chevron segments. */
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-splitbutton-dropdown:not(.p-button-secondary) {
      border-inline-start: 1px solid rgba(21, 20, 20, 0.16);
    }

    /* ── Secondary: white, 1px border, grey hover ── */
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button.p-button-secondary:not(:disabled) {
      background: var(--button-sampark-secondary-default, #ffffff);
      border: 1px solid var(--button-sampark-secondary-border, #e1e0e0);
      color: var(--button-sampark-secondary-text, #151414);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button.p-button-secondary:not(:disabled):hover {
      background: var(--button-sampark-secondary-hover, #f8f7f7);
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-splitbutton-dropdown.p-button-secondary:not(:disabled) {
      border-inline-start-color: var(--button-sampark-secondary-border, #e1e0e0);
    }

    /* ── Disabled: distinct fills, not PrimeNG's opacity dim ── */
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button:disabled {
      background: var(--button-sampark-disabled-background, #f3eaea);
      border-color: var(--button-sampark-disabled-border, #e1e0e0);
      color: var(--button-sampark-disabled-text, #bcb9b9);
      opacity: 1;
    }
    :is(baps-split-button.baps-sampark, .baps-ds-sampark baps-split-button) .p-splitbutton .p-button.p-button-secondary:disabled {
      background: var(--button-sampark-secondary-default, #ffffff);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-splitbutton-xl]': "size === 'xlarge'",
  },
})
export class BapsSplitButton {
  @Input() label?: string;
  @Input() icon?: string;
  /** Dropdown entries (PrimeNG MenuItem[]). */
  @Input() model: MenuItem[] = [];
  @Input() severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  /** 'xlarge' is a host-class step (40px Sampark) — PrimeNG stops at 'large'. */
  @Input() size?: 'small' | 'large' | 'xlarge';
  @Input() disabled = false;
  @Input() menuStyleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  /**
   * Figma "Button Notification Counts" (node 13197:92212) — the tally pill
   * that sits after the label, inside the action segment.
   *
   * Setting it switches the label segment to a content template, because
   * PrimeNG renders the label input as bare text with nowhere to put a
   * sibling. Left unset, the component takes PrimeNG's own label/icon path
   * exactly as before, so no existing call site changes.
   */
  @Input() count?: number | string | null;
  /**
   * Accessible name for the tally. A bare number announces as "8" with no
   * indication of what is counted, so set it to the meaning
   * ("8 pending approvals").
   */
  @Input() countLabel?: string;

  /** 0 is a meaningful tally: only null/undefined/empty hides the pill. */
  get hasCount(): boolean {
    return this.count !== null && this.count !== undefined && this.count !== '';
  }

  /** Fires when the default (label) segment is clicked. */
  @Output() clicked = new EventEmitter<MouseEvent>();

  get primeSize(): 'small' | 'large' | undefined {
    return this.size === 'xlarge' ? undefined : this.size;
  }
}
