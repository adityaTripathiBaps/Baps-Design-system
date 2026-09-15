import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Toast } from 'primeng/toast';

/**
 * baps-toast — transient notifications, rendered once near the app root.
 *
 * Wraps PrimeNG Toast. Unlike every other wrapper here this one takes no
 * content: messages arrive through PrimeNG's `MessageService`, which the
 * APPLICATION must provide — the component only renders whatever that service
 * pushes.
 *
 *   // app config
 *   providers: [MessageService]
 *
 *   // once, in the shell
 *   <baps-toast brand="sampark" />
 *
 *   // anywhere
 *   this.messages.add({ severity: 'success', summary: 'Saved' });
 *
 * Providing MessageService per-component instead of at the root is the usual
 * way this silently does nothing: the service instance the caller injects is
 * then a different one from the instance this toast subscribes to, so the
 * message goes nowhere and there is no error to notice.
 *
 * Severity colours come from the alert/message ramp rather than a set of their
 * own — a toast and an inline alert say the same thing at the same weight, and
 * two ramps would drift.
 */
@Component({
  selector: 'baps-toast',
  imports: [Toast],
  template: `
    <p-toast
      [key]="key"
      [position]="position"
      [life]="life"
      [preventOpenDuplicates]="preventOpenDuplicates"
      [preventDuplicates]="preventDuplicates"
      [autoZIndex]="autoZIndex"
      [baseZIndex]="baseZIndex"
      [styleClass]="panelClass"
    ></p-toast>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Toasts are portalled to <body>, so a host-anchored rule cannot reach
       them — the brand rides on the panel's own class list, same as the
       popover. */
    .p-toast {
      --baps-toast-bg: var(--color-mybky-mono-0, #ffffff);
      --baps-toast-text: var(--color-mybky-text-primary, #181b1d);
      --baps-toast-border: var(--color-mybky-border-default, #e4ecf1);
      --baps-toast-radius: var(--radius-mybky-md, 0.5rem);
      --baps-toast-shadow: 0 10px 24px -4px rgba(24, 27, 29, 0.16);
    }

    .baps-ds-sampark .p-toast,
    .p-toast.baps-toast-sampark {
      --baps-toast-bg: var(--color-sampark-surface-card, #ffffff);
      --baps-toast-text: var(--color-sampark-text-primary, #151414);
      --baps-toast-border: var(--color-sampark-border-default, #e1e0e0);
      --baps-toast-radius: var(--radius-sampark-md, 0.5rem);
      --baps-toast-shadow: var(--shadow-sampark-dropdown, 0 12px 40px rgba(0, 0, 0, 0.15));
    }

    .p-toast .p-toast-message {
      background: var(--baps-toast-bg);
      color: var(--baps-toast-text);
      border: 1px solid var(--baps-toast-border);
      border-radius: var(--baps-toast-radius);
      box-shadow: var(--baps-toast-shadow);
    }

    /* Severity is carried by a 4px leading bar, not by a tinted panel. A fully
       coloured toast over live content is hard to read and harder to ignore;
       the bar plus the icon is enough to identify the kind at a glance. */
    .p-toast .p-toast-message {
      border-inline-start: 4px solid var(--baps-toast-accent, transparent);
    }
    .p-toast .p-toast-message-success {
      --baps-toast-accent: var(--color-mybky-success-default, #178251);
    }
    .p-toast .p-toast-message-info {
      --baps-toast-accent: var(--color-mybky-info-default, #2265c3);
    }
    .p-toast .p-toast-message-warn {
      --baps-toast-accent: var(--color-mybky-warning-default, #c38222);
    }
    .p-toast .p-toast-message-error {
      --baps-toast-accent: var(--color-mybky-error-default, #c32226);
    }

    .p-toast .p-toast-summary {
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.3;
    }
    .p-toast .p-toast-detail {
      font-size: 0.8125rem;
      font-weight: 400;
      line-height: 1.4;
      opacity: 0.85;
    }

    /* ── Dark ── */
    .baps-dark .p-toast {
      --baps-toast-bg: var(--color-mybky-dark-surface-card, #2b2f32);
      --baps-toast-text: var(--color-mybky-dark-text-primary, #f8fafb);
      --baps-toast-border: var(--color-mybky-dark-border-divider, #3d4144);
    }
    .baps-dark .baps-ds-sampark .p-toast,
    .baps-dark .p-toast.baps-toast-sampark {
      --baps-toast-bg: var(--color-sampark-dark-surface-card, #2c2c2a);
      --baps-toast-text: var(--color-sampark-dark-text-primary, #f8f7f7);
      --baps-toast-border: var(--color-sampark-dark-border-divider, #4a4947);
    }
  `,
})
export class BapsToast {
  /**
   * Only renders messages sent with the same `key`. Leave unset for the single
   * app-wide toast; set it when one screen needs its own outlet (a drawer that
   * should keep its toasts inside itself, say).
   */
  @Input() key?: string;
  @Input() position:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
    | 'center' = 'top-right';
  /** Milliseconds before auto-dismiss. A message's own `life` wins over this. */
  @Input() life = 4000;
  /** Drops a message identical to one already on screen. */
  @Input() preventOpenDuplicates = false;
  /** Drops a message identical to the previous one, shown or not. */
  @Input() preventDuplicates = false;
  @Input() autoZIndex = true;
  @Input() baseZIndex = 0;
  /** Extra class(es) for the portalled container. */
  @Input() styleClass?: string;
  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  protected get panelClass(): string {
    const brandClass = this.brand === 'sampark' ? 'baps-ds-sampark baps-toast-sampark' : '';
    return [brandClass, this.styleClass].filter(Boolean).join(' ');
  }
}
