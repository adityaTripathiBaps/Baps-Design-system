import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Popover } from 'primeng/popover';

/**
 * baps-popover — a small floating panel anchored to the element that opened it.
 *
 * Wraps PrimeNG Popover. Unlike most wrappers in this library, a popover has no
 * `visible` input to bind: PrimeNG drives it imperatively from the ORIGINATING
 * EVENT, because the panel positions itself against that event's target. So the
 * open methods are re-exposed here rather than replaced with a boolean, and a
 * caller uses a template reference:
 *
 *   <baps-button label="Options" (click)="pop.toggle($event)" />
 *   <baps-popover #pop>…</baps-popover>
 *
 * Passing the event is not optional — without it PrimeNG has no anchor and the
 * panel lands in the corner of the viewport.
 *
 * Shape follows the same split as every other floating surface here: MyBKY's
 * 12px overlay corner against Sampark's 4px, sharing the dropdown shadow so a
 * popover and a select panel read as the same tier of surface.
 */
@Component({
  selector: 'baps-popover',
  imports: [Popover],
  template: `
    <p-popover
      [dismissable]="dismissable"
      [focusOnShow]="focusOnShow"
      [ariaLabel]="ariaLabel"
      [appendTo]="appendTo"
      [autoZIndex]="autoZIndex"
      [baseZIndex]="baseZIndex"
      [styleClass]="panelClass"
      (onShow)="show.emit()"
      (onHide)="hide.emit()"
    >
      <ng-content></ng-content>
    </p-popover>
  `,
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/popover/_popover.scss so the same
  // rules ship to non-Angular consumers through @org/ui-kit/styles.
  styleUrls: ['../../styles/components/popover/_popover.scss'],
})
export class BapsPopover {
  @ViewChild(Popover) private readonly popover?: Popover;

  /** Clicking outside closes the panel. */
  @Input() dismissable = true;
  /**
   * Moves focus into the panel when it opens. On by default in PrimeNG and
   * kept that way: a popover opened by keyboard that leaves focus behind is
   * unreachable without a mouse.
   */
  @Input() focusOnShow = true;
  /**
   * Accessible name for the panel. Worth setting when the trigger's own label
   * does not describe what the panel contains.
   *
   * NOTE: v21's Popover has no close-button input — there is no
   * `showCloseIcon`. Dismissal is click-outside (`dismissable`) or Escape,
   * which the component binds itself. Put your own button in the content if
   * an explicit close affordance is wanted.
   */
  @Input() ariaLabel?: string;
  /**
   * 'body' by default, NOT PrimeNG's 'self'. Rendered inline, the panel is
   * clipped by any ancestor with `overflow` or a `transform` — which in
   * practice means most cards and every scrolling table.
   */
  @Input() appendTo: unknown = 'body';
  @Input() autoZIndex = true;
  @Input() baseZIndex = 0;
  /** Extra class(es) for the portalled panel. */
  @Input() styleClass?: string;
  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  @Output() show = new EventEmitter<void>();
  @Output() hide = new EventEmitter<void>();

  /**
   * The panel is portalled out of this host, so the brand cannot be carried by
   * a host class the way every other wrapper does it — it rides along on the
   * panel's own class list instead.
   */
  protected get panelClass(): string {
    const brandClass = this.brand === 'sampark' ? 'baps-ds-sampark baps-popover-sampark' : '';
    return [brandClass, this.styleClass].filter(Boolean).join(' ');
  }

  /** Open (or close) against the event that triggered it. Pass the event. */
  toggle(event: Event, target?: HTMLElement): void {
    this.popover?.toggle(event, target);
  }

  /** Open against the event that triggered it. Pass the event. */
  open(event: Event, target?: HTMLElement): void {
    this.popover?.show(event, target);
  }

  close(): void {
    this.popover?.hide();
  }
}
