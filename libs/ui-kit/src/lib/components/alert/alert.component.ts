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
  // CSS lives in ../../styles/components/alert/_alert.scss so the same rules can
  // style raw <baps-alert> markup that Angular never rendered — see the header
  // comment there. styleUrls keeps it shipping with the component.
  styleUrls: ['../../styles/components/alert/_alert.scss'],
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
