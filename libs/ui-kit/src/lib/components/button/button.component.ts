import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Button } from 'primeng/button';
// Sampark button skin lives in the theme layer so the same token block drives
// both the whole-preview Sampark preset and this per-instance dt scoping.
import { SAMPARK_BUTTON_TOKENS } from '../../theme/sampark.theme';

@Component({
  selector: 'baps-button',
  imports: [Button],
  template: `
    <p-button
      [label]="label"
      [icon]="icon"
      [iconPos]="iconPos"
      [loading]="loading"
      [loadingIcon]="loadingIcon"
      [severity]="severity"
      [raised]="raised"
      [rounded]="rounded"
      [text]="text"
      [outlined]="outlined"
      [link]="link"
      [size]="primeSize"
      [plain]="plain"
      [fluid]="fluid"
      [disabled]="disabled"
      [autofocus]="autofocus"
      [ariaLabel]="ariaLabel"
      [dt]="dt"
    >
      <ng-content></ng-content>
    </p-button>
  `,
  // Encapsulation is off so the size/disabled rules below can reach the
  // projected .p-button element; every selector is anchored to the baps-button
  // host tag plus a Sampark scope class (.baps-sampark on the host or
  // .baps-ds-sampark on an ancestor), so nothing leaks to the default (MyBKY)
  // skin or to raw p-button usage.
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* MyBKY XL — Figma's 42px/16px mobile step (node 22465:93605). PrimeNG's
       size input stops at 'large', so like Sampark's xl this rides the
       .baps-button-xl host class; the :not() keeps it out of both Sampark
       scopes, whose own xl rules below carry the Sampark height (also 42px —
       both brands specify 42 at XL, they just reach it via different tokens). */
    baps-button.baps-button-xl:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button {
      height: var(--button-mybky-height-xl, 2.625rem);
      font-size: 16px;
    }

    /* Every rule below matches under either Sampark scope: a single instance
       opted in via brand="sampark" (host .baps-sampark class), or the whole
       page switched to the Sampark design system (.baps-ds-sampark ancestor
       class, set by the Storybook "Design system" toolbar). */

    /* Sampark sizes an explicit height per step (28/32/36/42) instead of
       deriving it from paddingY like the MyBKY preset — heights come from
       the --button-sampark-height-* CSS variables (libs/tokens build/css). */
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button {
      height: var(--button-sampark-height-default, 2rem);
      padding-top: 0;
      padding-bottom: 0;
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button-sm {
      height: var(--button-sampark-height-sm, 1.75rem);
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button-lg {
      height: var(--button-sampark-height-lg, 2.25rem);
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button).baps-button-xl .p-button {
      height: var(--button-sampark-height-xl, 2.625rem);
    }

    /* Icon-only buttons are square on the same scale. sm/default/lg widths
       flow through PrimeNG's iconOnlyWidth tokens (sampark.theme.ts); only
       the xl step needs CSS since the token surface stops at lg. */
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button).baps-button-xl .p-button-icon-only {
      width: var(--button-sampark-height-xl, 2.625rem);
    }

    /* Sampark's disabled state is a distinct fill, not PrimeNG's generic
       opacity dim (see button.mapping.mdx). Ghost/link stay transparent. */
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:disabled:not(.p-button-text):not(.p-button-link) {
      background: var(--button-sampark-disabled-background, #f3eaea);
      border-color: var(--button-sampark-disabled-border, #e1e0e0);
      color: var(--button-sampark-disabled-text, #bcb9b9);
      opacity: 1;
    }

    /* A button label never wraps. The height is fixed by the size step, so a
       second line either overflows the box or pushes the glyph off-centre —
       "Ad-hoc" broke at its hyphen and "Button Text" at its space whenever the
       container was narrower than the text. PrimeNG leaves white-space at its
       initial "normal", so this has to be stated. Long labels now overflow
       visibly, which is the honest failure: the fix is a shorter label, not a
       taller control. */
    baps-button .p-button-label {
      white-space: nowrap;
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:disabled:not(.p-button-text):not(.p-button-link) .p-button-label,
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:disabled:not(.p-button-text):not(.p-button-link) .p-button-icon {
      color: var(--button-sampark-disabled-text, #bcb9b9);
    }

    /* Ghost and link disabled. The rule above deliberately EXCLUDES them so
       they never gain a fill — but that also left them on PrimeNG's generic
       opacity dim instead of the Mono/40 disabled ink Figma specifies
       (node 13197:92178, "Primary Ghost / Disable"). Background stays
       transparent; only the ink dims. */
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:disabled:is(.p-button-text, .p-button-link),
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:disabled:is(.p-button-text, .p-button-link) .p-button-label,
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:disabled:is(.p-button-text, .p-button-link) .p-button-icon {
      color: var(--button-sampark-disabled-text, #bcb9b9);
      opacity: 1;
    }

    /* spm-ui's p-button-link underlines on hover. */
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button-link:not(:disabled):hover .p-button-label {
      text-decoration: underline;
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-button-xl]': "size === 'xlarge'",
  },
})
export class BapsButton {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() iconPos: 'left' | 'right' | 'top' | 'bottom' = 'left';
  @Input() loading = false;
  @Input() loadingIcon?: string;
  @Input() severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';
  @Input() raised = false;
  @Input() rounded = false;
  @Input() text = false;
  @Input() outlined = false;
  @Input() link = false;
  /**
   * PrimeNG's size input stops at 'large', so 'xlarge' is implemented as a
   * host class instead of being forwarded — MyBKY renders it 42px/16px font
   * (node 22465:93605), Sampark 42px (node 13197:91897, whose XL symbols are
   * named "Size=XL (42) (Mob)" and measure height=42). This previously read
   * "Sampark 40px" and cited the same node, which the node contradicts.
   */
  @Input() size?: 'small' | 'large' | 'xlarge';
  @Input() plain = false;
  @Input() fluid = false;
  @Input() disabled = false;
  @Input() autofocus = false;
  /** Required on icon-only buttons — without it screen readers announce nothing. */
  @Input() ariaLabel?: string;
  /**
   * Visual skin: 'mybky' (default) renders the global MyBky preset — pill
   * radius, gradient fills. 'sampark' applies the flat Sampark Portal
   * language (4px radius, flat #c96868 primary) via scoped design tokens.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  get primeSize(): 'small' | 'large' | undefined {
    return this.size === 'xlarge' ? undefined : this.size;
  }

  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_BUTTON_TOKENS : undefined;
  }
}
