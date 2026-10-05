import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Button } from 'primeng/button';
import { BapsIcon, type BapsIconSize } from '../icon/icon.component';
import { BAPS_ICONS } from '../icon/icon-set';
// Sampark button skin lives in the theme layer so the same token block drives
// both the whole-preview Sampark preset and this per-instance dt scoping.
import { SAMPARK_BUTTON_TOKENS } from '../../theme/sampark.theme';

@Component({
  selector: 'baps-button',
  imports: [Button, BapsIcon],
  template: `
    <p-button
      [label]="label"
      [icon]="primeIcon"
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
      @if (isBapsIcon) {
        <ng-template #icon let-iconClass="class">
          <baps-icon
            [name]="$any(bapsIconName)"
            [size]="iconSize"
            [class]="iconClass"
          />
        </ng-template>
      }
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
    baps-button.baps-button-xl:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button:not(.p-button-vertical) {
      height: var(--button-mybky-height-xl, 2.625rem);
      font-size: 16px;
    }

    /* MyBKY heights, the same way Sampark does it below. Stacked buttons
       (iconPos top/bottom, PrimeNG class .p-button-vertical) are excluded: they
       lay their icon over their label in a column, so a one-row height clips
       them — measured scrollHeight 37 inside a 36px box. The tokens always
       existed — 32 / 36 / 36 / 42 — but only XL applied them. The other three
       steps fell out of paddingY plus the font's line box and measured
       33 / 35 / 37, so a button was a pixel or two off its own token and an
       icon-only button could never be square: measured 40x33, 48x35, 56x37,
       with xlarge coming out NARROWER than large because it has no PrimeNG
       size of its own and fell through to the root width. */
    baps-button:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button:not(.p-button-vertical) {
      height: var(--button-mybky-height-m, 2.25rem);
      padding-top: 0;
      padding-bottom: 0;
    }
    baps-button:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button-sm:not(.p-button-vertical) {
      height: var(--button-mybky-height-s, 2rem);
    }
    baps-button:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button-lg:not(.p-button-vertical) {
      height: var(--button-mybky-height-l, 2.25rem);
    }

    /* Icon-only is a square: width equals height. sm / default / lg widths come
       from the preset's iconOnlyWidth (baps.theme.ts); XL needs CSS because
       primeSize returns undefined for it, so the preset's root value applies
       instead of an xl one. */
    baps-button.baps-button-xl:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button-icon-only {
      width: var(--button-mybky-height-xl, 2.625rem);
    }

    /* PrimeNG zeroes the inline padding on .p-button-icon-only, but its own
       size classes set padding-inline again and win on order, so sm and lg kept
       16px either side. That padding is the button's min-content width, which
       is why small measured 34px against a 32px width token — the box could not
       shrink to the value it was given. */
    baps-button:not(.baps-sampark, .baps-ds-sampark baps-button) .p-button-icon-only {
      padding-inline: 0;
    }

    /* Every rule below matches under either Sampark scope: a single instance
       opted in via brand="sampark" (host .baps-sampark class), or the whole
       page switched to the Sampark design system (.baps-ds-sampark ancestor
       class, set by the Storybook "Design system" toolbar). */

    /* Sampark sizes an explicit height per step (28/32/36/42) instead of
       deriving it from paddingY like the MyBKY preset — heights come from
       the --button-sampark-height-* CSS variables (libs/tokens build/css). */
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button:not(.p-button-vertical) {
      height: var(--button-sampark-height-default, 2rem);
      padding-top: 0;
      padding-bottom: 0;
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button-sm:not(.p-button-vertical) {
      height: var(--button-sampark-height-sm, 1.75rem);
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button) .p-button-lg:not(.p-button-vertical) {
      height: var(--button-sampark-height-lg, 2.25rem);
    }
    :is(baps-button.baps-sampark, .baps-ds-sampark baps-button).baps-button-xl .p-button:not(.p-button-vertical) {
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

    /* Icon positioning and alignment */
    baps-button .p-button-icon-right,
    baps-button .p-button-icon-bottom {
      order: 2;
    }
    baps-button .p-button-icon-left,
    baps-button .p-button-icon-top {
      order: 0;
    }
    baps-button baps-icon.p-button-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
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

  get isBapsIcon(): boolean {
    if (!this.icon) return false;
    // PrimeIcons classes start with 'pi ' or 'pi-'
    if (this.icon.startsWith('pi ') || this.icon.startsWith('pi-')) {
      return false;
    }
    return this.icon in BAPS_ICONS || !this.icon.includes(' ');
  }

  get bapsIconName(): string | undefined {
    return this.icon;
  }

  get primeIcon(): string | undefined {
    return this.isBapsIcon ? undefined : this.icon;
  }

  /**
   * The Figma icon ramp, identical in both brands: S 16 / M 18 / L 20 / XL 24
   * (MyBKY node 22465:93605, Sampark node 151:361). Only the button heights
   * differ between the brands, not the icons, so one ramp serves both.
   *
   * This used to return sm / sm / 18 / md — 16 / 16 / 18 / 20 — which left
   * `small` and the default step drawing the same icon and every step from M
   * upwards one size short. 18 and 24 are not steps on the icon scale
   * (xs 12 · sm 16 · md 20 · lg 24 · xl 32), and that is fine: the scale is the
   * artwork's own ramp, while these are the sizes the button frames specify.
   */
  get iconSize(): BapsIconSize | number {
    if (this.size === 'small') return 16;
    if (this.size === 'large') return 20;
    if (this.size === 'xlarge') return 24;
    return 18;
  }

  get primeSize(): 'small' | 'large' | undefined {
    return this.size === 'xlarge' ? undefined : this.size;
  }

  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_BUTTON_TOKENS : undefined;
  }
}
