import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Divider } from 'primeng/divider';

/**
 * baps-divider — visual separator between content sections.
 *
 * Wraps PrimeNG Divider. Sampark skin uses the thinner 1px mono border
 * (#e1e0e0) versus MyBKY's cooler #e4ecf1. Content-bearing dividers
 * (text or icon inside) get 4px radius in Sampark.
 */
@Component({
  selector: 'baps-divider',
  imports: [Divider],
  template: `
    <p-divider
      [layout]="layout"
      [type]="type"
      [align]="align"
      [styleClass]="styleClass"
    >
      <ng-content></ng-content>
    </p-divider>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* ── Compact (size="compact") ──
       The toolbar separator from the Sampark Portal frames: a 1x16px rule with
       8px either side, used between the clusters of a toolbar and between the
       actions and the close in a drawer header. Figma inspects it as
       display:flex; width:1px; height:16px, padding 1 x 16, margin 8.

       PrimeNG's vertical divider is sized for separating BLOCKS — it takes its
       height from the row and adds 1rem of block padding, so dropped between
       two 32px buttons it draws a rule as tall as the toolbar. Everything here
       is geometry; the colour is still the scope block's below.

       align-self keeps the 16px centred against taller siblings: the divider is
       a flex item in the toolbar, so without it the fixed height would stretch
       or sit at the top depending on the row's align-items. */
    baps-divider[data-size='compact'] {
      display: flex;
      align-items: center;
      align-self: center;
      flex: none;
    }

    baps-divider[data-size='compact'] .p-divider-vertical {
      height: 1rem;
      min-height: 0;
      /* PrimeNG gives the vertical divider a min-width so the block variant has
         something to click past. Left in place the box measured 24px against
         Figma's 1px, which put 12px of dead space either side of the rule on
         top of the 8px margin — 40px of footprint for a 17px separator. */
      width: 1px;
      min-width: 0;
      /* NO margin. A toolbar is a flex row with its own gap, and PrimeNG's own
         0 1rem margin stacked on top of it — measured 16px either side of the
         rule in a row whose gap was already 8px. The separator's spacing is
         the row's job; this only has to be 1px wide. */
      margin: 0;
      padding: 0;
    }

    /* ── Sampark scope ── */
    :is(baps-divider.baps-sampark, .baps-ds-sampark baps-divider) .p-divider-horizontal::before {
      border-top: 1px solid var(--color-sampark-border-default, #e1e0e0);
    }
    :is(baps-divider.baps-sampark, .baps-ds-sampark baps-divider) .p-divider-vertical::before {
      border-left: 1px solid var(--color-sampark-border-default, #e1e0e0);
    }
    :is(baps-divider.baps-sampark, .baps-ds-sampark baps-divider) .p-divider-content {
      background: var(--color-sampark-surface-card, #ffffff);
      color: var(--color-sampark-text-muted, #9f9c9c);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0 0.75rem;
      border-radius: var(--radius-sampark-default, 0.25rem);
    }

    /* ── Dark mode ── */
    .baps-dark :is(baps-divider.baps-sampark, .baps-ds-sampark baps-divider) .p-divider-horizontal::before {
      border-top-color: var(--color-mybky-mono-700, #3d4144);
    }
    .baps-dark :is(baps-divider.baps-sampark, .baps-ds-sampark baps-divider) .p-divider-vertical::before {
      border-left-color: var(--color-mybky-mono-700, #3d4144);
    }
    .baps-dark :is(baps-divider.baps-sampark, .baps-ds-sampark baps-divider) .p-divider-content {
      background: var(--color-mybky-mono-900, #181b1d);
      color: var(--color-mybky-mono-400, #b6b6af);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[attr.data-size]': "size",
  },
})
export class BapsDivider {
  /** Orientation of the divider line. */
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  /** Line style. */
  @Input() type: 'solid' | 'dashed' | 'dotted' = 'solid';
  /** Content alignment along the divider. */
  @Input() align?: 'left' | 'center' | 'right' | 'top' | 'bottom';
  /** Additional CSS class(es) forwarded to the PrimeNG root. */
  @Input() styleClass?: string;
  /**
   * 'compact' is the toolbar separator: a 1x16px rule with 8px either side,
   * rather than PrimeNG's block divider that takes its height from the row.
   * Use it between the clusters of a toolbar or a drawer header; leave it
   * 'default' when separating stacked content.
   */
  @Input() size: 'default' | 'compact' = 'default';

  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
