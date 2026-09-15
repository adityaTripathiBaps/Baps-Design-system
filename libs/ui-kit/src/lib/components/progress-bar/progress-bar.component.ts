import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ProgressBar } from 'primeng/progressbar';
// Sampark skin lives in the theme layer so one token block drives both the
// whole-preview Sampark preset and this per-instance dt scoping — same
// convention as baps-button / baps-badge / baps-avatar.
import { SAMPARK_PROGRESSBAR_TOKENS } from '../../theme/sampark.theme';

/**
 * baps-progressbar — determinate or indeterminate progress indicator.
 *
 * Wraps PrimeNG ProgressBar. Sampark skin: 4px radius track, maroon
 * fill, configurable success variant via the success-60 token.
 */
@Component({
  selector: 'baps-progressbar',
  imports: [ProgressBar],
  template: `
    <p-progressbar
      [value]="value"
      [mode]="mode"
      [showValue]="showValue"
      [style]="style"
      [styleClass]="computedStyleClass"
      [dt]="dt"
    ></p-progressbar>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Track geometry, track/fill colours and the label are NOT here: they now
       come from PrimeNG design tokens (baps.theme.ts components.progressbar,
       and SAMPARK_PROGRESSBAR_TOKENS via the dt input below), because the
       progressbar token surface actually exposes root.height /
       root.background / root.borderRadius / value.background / label.*.
       Only what has no token equivalent remains as CSS.

       The value fill keeps its radius here: PrimeNG applies borderRadius to
       the track root, not to the inner value element, so a partially-filled
       bar would otherwise show a square-ended fill inside a pill track. */
    baps-progressbar .p-progressbar-value {
      border-radius: inherit;
    }

    /* ── Severity variants ──
       Host-class driven, and PrimeNG has no severity concept for progressbar,
       so there is no token to carry these — tokens are per-component, not
       per-variant. This is a genuine token-surface gap, not an unmigrated
       leftover. ── */
    baps-progressbar.baps-progressbar-success .p-progressbar-value {
      background: var(--color-mybky-success-400, #40bf84);
    }
    baps-progressbar.baps-progressbar-info .p-progressbar-value {
      background: var(--color-mybky-info-60, #528de0);
    }
    baps-progressbar.baps-progressbar-warning .p-progressbar-value {
      background: var(--color-mybky-warning-60, #e0a652);
    }
    baps-progressbar.baps-progressbar-error .p-progressbar-value {
      background: var(--color-mybky-error-80, #e05255);
    }

    /* ── Sampark ──
       Track geometry, colours and label also removed here — they come from
       SAMPARK_PROGRESSBAR_TOKENS through the dt input. Only the severity
       variants below remain, for the same no-token reason as MyBKY. ── */

    /* Success variant */
    :is(baps-progressbar.baps-sampark, .baps-ds-sampark baps-progressbar).baps-progressbar-success .p-progressbar-value {
      background: var(--color-sampark-success-60, #17b56c);
    }

    /* Info variant */
    :is(baps-progressbar.baps-sampark, .baps-ds-sampark baps-progressbar).baps-progressbar-info .p-progressbar-value {
      background: var(--color-sampark-info-60, #3889fa);
    }

    /* Warning variant */
    :is(baps-progressbar.baps-sampark, .baps-ds-sampark baps-progressbar).baps-progressbar-warning .p-progressbar-value {
      background: var(--color-sampark-warning-60, #faab38);
    }

    /* Error variant */
    :is(baps-progressbar.baps-sampark, .baps-ds-sampark baps-progressbar).baps-progressbar-error .p-progressbar-value {
      background: var(--color-sampark-error-80, #ea151a);
    }

    /* ── Dark mode ── */
    .baps-dark :is(baps-progressbar.baps-sampark, .baps-ds-sampark baps-progressbar) .p-progressbar {
      background: var(--color-mybky-mono-700, #3d4144);
    }

    /* ── showValue ──
       Structurally broken before this: both brands pin the track to 0.5rem
       (8px) for the thin-bar design, PrimeNG sets overflow hidden on it, and
       the label is 0.625rem (10px) — so the number was clipped at every width
       under every brand. A bar cannot be 8px tall AND contain a label, so the
       track grows only when a label is actually requested; the default thin
       bar is untouched.

       Deliberately last in the file and listing both brand selectors: the
       Sampark .p-progressbar rule above has equal specificity, so source
       order is what decides this. Moving this block earlier silently
       reintroduces the clipping under brand="sampark". */
    baps-progressbar.baps-progressbar-has-value .p-progressbar,
    :is(baps-progressbar.baps-sampark, .baps-ds-sampark baps-progressbar).baps-progressbar-has-value .p-progressbar {
      height: 1.25rem;
    }
    baps-progressbar.baps-progressbar-has-value .p-progressbar-label {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      line-height: 1;
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-progressbar-has-value]': 'showValue',
    '[class.baps-progressbar-success]': "severity === 'success'",
    '[class.baps-progressbar-info]': "severity === 'info'",
    '[class.baps-progressbar-warning]': "severity === 'warning'",
    '[class.baps-progressbar-error]': "severity === 'error'",
  },
})
export class BapsProgressBar {
  /** Current value (0–100). */
  @Input() value = 0;
  /** Display mode. */
  @Input() mode: 'determinate' | 'indeterminate' = 'determinate';
  /** Whether to display the value label inside the bar. */
  @Input() showValue = false;
  /** Semantic colour for the fill bar. */
  @Input() severity?: 'success' | 'info' | 'warning' | 'error';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  get computedStyleClass(): string {
    return this.styleClass || '';
  }

  /**
   * Per-instance Sampark skin via PrimeNG design tokens, so a single
   * `brand="sampark"` bar can sit on a MyBKY page. MyBKY needs no `dt` — it
   * is the global preset (baps.theme.ts components.progressbar), so returning
   * undefined lets the preset apply unmodified.
   */
  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_PROGRESSBAR_TOKENS : undefined;
  }
}
