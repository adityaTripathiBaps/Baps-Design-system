import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

/**
 * baps-alert — inline notification / message banner.
 *
 * Custom component (not wrapping PrimeNG Message — the Sampark design uses
 * a left-accent-bar pattern that differs significantly from PrimeNG's
 * message layout). Supports info, success, warning, error severities with
 * tinted backgrounds. Brand-aware like button/avatar/tag: `brand="sampark"`
 * per-instance (host class) or `.baps-ds-sampark` page-wide; default is
 * mybky (matching every other brand-switchable component's default).
 *
 * Anatomy (appearance="inline", the default):
 *   [ 4px accent bar ] [ icon ] [ text ] [ close? ]
 *
 * `appearance="card"` switches to the Sampark Portal "Alert & Notification"
 * card (Figma node 13197:89157 — Default / Success / Error / Avatar):
 *
 *   [ 32px icon or avatar ] [ title + timestamp / close / subtitle
 *                             / progress bar / primary + secondary action ]
 *
 * The card is a separate skin, not a separate component: it reuses the whole
 * severity vocabulary (`severity`, `icon`, `defaultIcon`) and the entire
 * close contract (`closable` / `closed`), and adds card-only data on top.
 * It has NO accent bar — the Figma card deliberately drops it — so the bar
 * span simply is not rendered in that branch.
 *
 * Content projection applies to the inline banner only; the card's body text
 * is the `text` input (Figma models it as a plain "subtitleText" string).
 */
@Component({
  selector: 'baps-alert',
  template: `
    @if (appearance === 'card') {
      <div
        class="baps-alert-card"
        [class.baps-alert-card--info]="severity === 'info'"
        [class.baps-alert-card--success]="severity === 'success'"
        [class.baps-alert-card--warning]="severity === 'warning'"
        [class.baps-alert-card--error]="severity === 'error'"
        role="status"
      >
        <span class="baps-alert-card__leading">
          @if (avatarLabel) {
            <span class="baps-alert-card__avatar" aria-hidden="true">{{ avatarLabel }}</span>
          } @else {
            <i class="baps-alert-card__icon pi" [class]="icon ?? defaultIcon" aria-hidden="true"></i>
          }
        </span>

        <div class="baps-alert-card__body">
          <div class="baps-alert-card__header">
            @if (title || timestamp) {
              <div class="baps-alert-card__title-row">
                @if (title) {
                  <span class="baps-alert-card__title">{{ title }}</span>
                }
                @if (timestamp) {
                  <span class="baps-alert-card__time">{{ timestamp }}</span>
                }
              </div>
            }

            @if (closable) {
              <button
                class="baps-alert-card__close"
                (click)="onClose()"
                aria-label="Close"
                type="button"
              >
                <i class="pi pi-times" aria-hidden="true"></i>
              </button>
            }

            @if (text) {
              <span class="baps-alert-card__text">{{ text }}</span>
            }
          </div>

          @if (progress !== undefined && progress !== null) {
            <div class="baps-alert-card__progress">
              <div
                class="baps-alert-card__progress-track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                [attr.aria-valuenow]="clampedProgress"
                [attr.aria-label]="progressLabel || 'Progress'"
              >
                <!-- Width is the datum itself, not a design decision — an
                     arbitrary percentage has no static-CSS expression. -->
                <span class="baps-alert-card__progress-fill" [style.width.%]="clampedProgress"></span>
              </div>
              @if (progressLabel) {
                <span class="baps-alert-card__progress-label">{{ progressLabel }}</span>
              }
            </div>
          }

          @if (primaryAction || secondaryAction) {
            <div class="baps-alert-card__actions">
              @if (primaryAction) {
                <button
                  class="baps-alert-card__action baps-alert-card__action--primary"
                  type="button"
                  (click)="primaryActionClick.emit()"
                >
                  {{ primaryAction }}
                </button>
              }
              @if (secondaryAction) {
                <button
                  class="baps-alert-card__action baps-alert-card__action--secondary"
                  type="button"
                  (click)="secondaryActionClick.emit()"
                >
                  {{ secondaryAction }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    } @else {
    <div
      class="baps-alert"
      [class.baps-alert--info]="severity === 'info'"
      [class.baps-alert--success]="severity === 'success'"
      [class.baps-alert--warning]="severity === 'warning'"
      [class.baps-alert--error]="severity === 'error'"
      [class.baps-alert--closable]="closable"
      role="alert"
    >
      <span class="baps-alert__bar" aria-hidden="true"></span>

      <span class="baps-alert__icon" aria-hidden="true">
        <i class="pi" [class]="icon ?? defaultIcon"></i>
      </span>

      <span class="baps-alert__content">
        @if (title) {
          <span class="baps-alert__title">{{ title }}</span>
        }
        <span class="baps-alert__text"><ng-content></ng-content>{{ text }}</span>
      </span>

      @if (closable) {
        <button
          class="baps-alert__close"
          (click)="onClose()"
          aria-label="Close"
          type="button"
        >
          <i class="pi pi-times"></i>
        </button>
      }
    </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-alert {
      display: block;
    }

    baps-alert .baps-alert {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem 0.75rem 1.25rem;
      border-radius: var(--radius-sampark-md, 0.5rem);
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.5;
      overflow: hidden;
    }

    /* Left accent bar */
    baps-alert .baps-alert__bar {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
    }

    /* Icon */
    baps-alert .baps-alert__icon {
      flex: none;
      display: flex;
      align-items: center;
      font-size: 1.125rem;
      margin-top: 1px;
    }

    /* Content */
    baps-alert .baps-alert__content {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }
    baps-alert .baps-alert__title {
      font-weight: 600;
      font-size: 0.875rem;
    }
    baps-alert .baps-alert__text {
      font-weight: 400;
      color: inherit;
    }

    /* Close button */
    baps-alert .baps-alert__close {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.75rem;
      color: inherit;
      opacity: 0.6;
      border-radius: var(--radius-sampark-default, 0.25rem);
      transition: opacity 120ms ease, background 120ms ease;
    }
    baps-alert .baps-alert__close:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.06);
    }

    /* ── MyBKY (default) severities ── */
    baps-alert .baps-alert--info {
      background: var(--color-mybky-info-20, #d8e7fd);
      color: var(--color-mybky-info-80, #2265c3);
    }
    baps-alert .baps-alert--info .baps-alert__bar {
      background: var(--color-mybky-info-60, #528de0);
    }
    baps-alert .baps-alert--info .baps-alert__text {
      color: var(--color-mybky-mono-900, #181b1d);
    }

    baps-alert .baps-alert--success {
      background: var(--color-mybky-success-50, #d8fdeb);
      color: var(--color-mybky-success-600, #2a9c68);
    }
    baps-alert .baps-alert--success .baps-alert__bar {
      background: var(--color-mybky-success-400, #40bf84);
    }
    baps-alert .baps-alert--success .baps-alert__text {
      color: var(--color-mybky-mono-900, #181b1d);
    }

    baps-alert .baps-alert--warning {
      background: var(--color-mybky-warning-20, #fdedd8);
      color: var(--color-mybky-warning-80, #c38222);
    }
    baps-alert .baps-alert--warning .baps-alert__bar {
      background: var(--color-mybky-warning-60, #e0a652);
    }
    baps-alert .baps-alert--warning .baps-alert__text {
      color: var(--color-mybky-mono-900, #181b1d);
    }

    baps-alert .baps-alert--error {
      /* No light error tint exists in the mybky palette (only 80/100 solid
         stops) — approximate one at low opacity, matching every other
         severity's light-bg/dark-text pattern instead of a solid fill. */
      background: rgba(224, 82, 85, 0.12);
      color: var(--color-mybky-error-100, #c32226);
    }
    baps-alert .baps-alert--error .baps-alert__bar {
      background: var(--color-mybky-error-80, #e05255);
    }
    baps-alert .baps-alert--error .baps-alert__text {
      color: var(--color-mybky-mono-900, #181b1d);
    }

    /* ── Sampark scope — per-instance brand="sampark" (host .baps-sampark
       class) or page-wide .baps-ds-sampark, same convention as button/avatar. ── */
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--info {
      background: var(--color-sampark-info-5, #f3f8ff);
      color: var(--color-sampark-info-80, #0661e0);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--info .baps-alert__bar {
      background: var(--color-sampark-info-60, #3889fa);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--success {
      background: var(--color-sampark-success-5, #f0fff6);
      color: var(--color-sampark-success-80, #089152);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--success .baps-alert__bar {
      background: var(--color-sampark-success-60, #17b56c);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--warning {
      background: var(--color-sampark-warning-5, #fff9ef);
      color: var(--color-sampark-warning-80, #e08705);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--warning .baps-alert__bar {
      background: var(--color-sampark-warning-60, #faab38);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--error {
      background: var(--color-sampark-error-10, #ffefef);
      color: var(--color-sampark-error-80, #ea151a);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--error .baps-alert__bar {
      background: var(--color-sampark-error-80, #ea151a);
    }
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--info .baps-alert__text,
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--success .baps-alert__text,
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--warning .baps-alert__text,
    :is(baps-alert.baps-sampark, .baps-ds-sampark baps-alert) .baps-alert--error .baps-alert__text {
      color: var(--color-sampark-text-primary, #151414);
    }

    /* ══════════════════════════════════════════════════════════════════
       CARD — appearance="card". Figma "Alert & Notification" (13197:89157),
       variants Default / Success / Error / Avatar, each a 400x~237 frame
       whose inner "Web Alert" (13197:89159) is the card itself.

       Unlike the inline banner this is NOT brand-switchable: the card only
       exists in the Sampark Portal Figma, so it reads the sampark tokens
       directly (same convention as baps-menu-item / baps-users-dropdown).
       All four variants share a white surface — severity tints only the
       leading icon, and there is no accent bar anywhere in the design.
       ══════════════════════════════════════════════════════════════════ */
    baps-alert .baps-alert-card {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 400px;
      min-width: 300px;
      max-width: 100%;
      padding: 16px;
      background: var(--color-sampark-surface-card, #ffffff);
      border: 1px solid var(--color-sampark-border-default, #e1e0e0);
      border-radius: var(--radius-sampark-default, 0.25rem);
      /* Figma effect "XL Drop Shadow": #10182829 (0,8) r12 s-4 and
         #10182814 (0,20) r24 s-4. Promoted into the shared shadow ramp as
         shadow.sampark.xl once this card needed it. */
      box-shadow: var(
        --shadow-sampark-xl,
        0 8px 12px -4px rgba(16, 24, 40, 0.16),
        0 20px 24px -4px rgba(16, 24, 40, 0.08)
      );
      font-family: inherit;
      line-height: 1.3;
    }

    /* Leading slot — 32px, an icon (Default/Success/Error) or the Avatar variant. */
    baps-alert .baps-alert-card__leading {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    }
    baps-alert .baps-alert-card__icon {
      font-size: 24px;
      /* Figma's "Default" card draws a neutral grey glyph, so info maps to
         secondary text rather than the banner's blue. */
      color: var(--color-sampark-text-secondary, #595656);
    }
    baps-alert .baps-alert-card--success .baps-alert-card__icon {
      color: var(--color-sampark-success-60, #17b56c);
    }
    baps-alert .baps-alert-card--warning .baps-alert-card__icon {
      color: var(--color-sampark-warning-60, #faab38);
    }
    baps-alert .baps-alert-card--error .baps-alert-card__icon {
      color: var(--color-sampark-error-80, #ea151a);
    }

    /* Avatar variant — same rose box as the user rows in "Base User Item Group". */
    baps-alert .baps-alert-card__avatar {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sampark-default, 0.25rem);
      background: var(--color-sampark-primary-0, #fbf4f4);
      border: 1px solid var(--color-sampark-primary-20, #e9c3c3);
      color: var(--color-sampark-text-primary, #151414);
      font-size: 14px;
      font-weight: 500;
    }

    baps-alert .baps-alert-card__body {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Header stack — title row / close / subtitle, 8px apart. Relative so the
       close button can sit at the Figma -8px offset without stealing a column. */
    baps-alert .baps-alert-card__header {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      min-height: 32px;
    }

    baps-alert .baps-alert-card__title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 20px;
      /* Room for the absolutely positioned close button. */
      padding-right: 28px;
      min-width: 0;
    }
    baps-alert .baps-alert-card__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-sampark-text-primary, #151414);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    baps-alert .baps-alert-card__time {
      flex: none;
      font-size: 12px;
      font-weight: 400;
      color: var(--color-sampark-text-muted, #9f9c9c);
    }

    baps-alert .baps-alert-card__text {
      font-size: 14px;
      font-weight: 400;
      color: var(--color-sampark-text-secondary, #595656);
      overflow-wrap: anywhere;
    }

    baps-alert .baps-alert-card__close {
      position: absolute;
      top: -8px;
      right: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      min-height: 28px;
      padding: 8px 4px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sampark-default, 0.25rem);
      color: var(--color-sampark-text-secondary, #595656);
      font-size: 14px;
      cursor: pointer;
      transition: background 120ms ease;
    }
    baps-alert .baps-alert-card__close:hover {
      background: var(--color-sampark-mono-alpha4, rgba(21, 20, 20, 0.04));
    }

    /* Progress — Figma "Alert Progress Bar Container" is py 8px around a 4px
       track. The fill is Success/80 #17b56c (our success-60 by value) in every
       variant, including Error — the bar reports upload progress, not severity. */
    baps-alert .baps-alert-card__progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }
    baps-alert .baps-alert-card__progress-track {
      position: relative;
      height: 4px;
      border-radius: 4px;
      background: var(--color-sampark-mono-alpha4, rgba(21, 20, 20, 0.04));
      overflow: hidden;
    }
    baps-alert .baps-alert-card__progress-fill {
      display: block;
      height: 100%;
      border-radius: 4px;
      background: var(--color-sampark-success-60, #17b56c);
      transition: width 200ms ease;
    }
    baps-alert .baps-alert-card__progress-label {
      font-size: 12px;
      font-weight: 400;
      text-align: right;
      color: var(--color-sampark-text-secondary, #595656);
    }

    /* Actions — 32px text buttons, no fill; the 10px side padding is what
       separates them, so the row itself has no gap (Figma "Alert Actions"). */
    baps-alert .baps-alert-card__actions {
      display: flex;
      align-items: center;
      margin-left: -10px; /* pull the first label back to the text's left edge */
    }
    baps-alert .baps-alert-card__action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      padding: 8px 10px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sampark-default, 0.25rem);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      cursor: pointer;
      transition: background 120ms ease;
    }
    baps-alert .baps-alert-card__action:hover {
      background: var(--color-sampark-mono-alpha4, rgba(21, 20, 20, 0.04));
    }
    baps-alert .baps-alert-card__action--primary {
      color: var(--color-sampark-primary-60, #c96868);
    }
    baps-alert .baps-alert-card__action--secondary {
      color: var(--color-sampark-text-primary, #151414);
    }

    .baps-dark baps-alert .baps-alert-card {
      background: var(--color-mybky-mono-900, #181b1d);
      border-color: var(--color-mybky-mono-700, #3d4144);
    }
    .baps-dark baps-alert .baps-alert-card__title,
    .baps-dark baps-alert .baps-alert-card__action--secondary {
      color: var(--color-mybky-mono-50, #f8fafb);
    }
    .baps-dark baps-alert .baps-alert-card__text,
    .baps-dark baps-alert .baps-alert-card__progress-label,
    .baps-dark baps-alert .baps-alert-card__close {
      color: var(--color-mybky-mono-400, #b6b6af);
    }
    .baps-dark baps-alert .baps-alert-card__progress-track {
      background: var(--color-mybky-mono-800, #2b2f32);
    }

    /* ── Dark mode ── */
    .baps-dark baps-alert .baps-alert--info { background: rgba(56, 137, 250, 0.1); }
    .baps-dark baps-alert .baps-alert--success { background: rgba(23, 181, 108, 0.1); }
    .baps-dark baps-alert .baps-alert--warning { background: rgba(250, 171, 56, 0.1); }
    .baps-dark baps-alert .baps-alert--error { background: rgba(234, 21, 26, 0.1); }
    .baps-dark baps-alert .baps-alert__text {
      color: var(--color-mybky-mono-50, #f8fafb);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsAlert {
  /** Alert severity determines the accent bar, icon, and background tint. */
  @Input() severity: 'info' | 'success' | 'warning' | 'error' = 'info';
  /** Alert text content (alternative to projected content). */
  @Input() text?: string;
  /** Optional bold title line above the text. */
  @Input() title?: string;
  /** Custom PrimeNG icon class. If omitted, uses a default per severity. */
  @Input() icon?: string;
  /** Whether a close button is shown. */
  @Input() closable = false;
  /** Visual skin. Defaults to 'mybky' (matching every other brand-switchable component). */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * 'inline' (default) is the accent-bar banner; 'card' is the Sampark
   * notification card (Figma 13197:89157). Everything below this line is
   * card-only and inert for the banner.
   */
  @Input() appearance: 'inline' | 'card' = 'inline';

  /** Relative time shown next to the card title, e.g. "2 mins ago". */
  @Input() timestamp?: string;

  /** Initials for the card's Avatar variant. Replaces the leading icon when set. */
  @Input() avatarLabel?: string;

  /** 0-100. Renders the card's embedded progress bar; omit for no bar. */
  @Input() progress?: number;

  /** Caption under the progress bar, e.g. "60% uploaded…". Also names the progressbar. */
  @Input() progressLabel?: string;

  /** Label of the card's primary (brand-coloured) action. Omit to hide it. */
  @Input() primaryAction?: string;

  /** Label of the card's secondary (neutral) action. Omit to hide it. */
  @Input() secondaryAction?: string;

  /** Emitted when the close button is clicked. */
  @Output() closed = new EventEmitter<void>();

  @Output() primaryActionClick = new EventEmitter<void>();
  @Output() secondaryActionClick = new EventEmitter<void>();

  /** `progress` pinned to 0-100 so a bad value can't overflow the track. */
  get clampedProgress(): number {
    return Math.min(100, Math.max(0, this.progress ?? 0));
  }

  get defaultIcon(): string {
    switch (this.severity) {
      case 'success': return 'pi-check-circle';
      case 'warning': return 'pi-exclamation-triangle';
      case 'error':   return 'pi-times-circle';
      case 'info':
      default:        return 'pi-info-circle';
    }
  }

  onClose(): void {
    this.closed.emit();
  }
}
