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
  // CSS lives in ../../styles/components/toast/_toast.scss so the same
  // rules ship to non-Angular consumers through @org/ui-kit/styles.
  styleUrls: ['../../styles/components/toast/_toast.scss'],
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
