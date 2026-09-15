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
  styles: `
    /* The panel is portalled to <body>, so it is NOT a DOM descendant of this
       host — a rule scoped to baps-popover would never reach it. That is why
       the brand scope below is the page-wide class plus the panel class the
       component forwards, not the usual host-anchored :is() pair. */
    .p-popover {
      --baps-popover-bg: var(--color-mybky-mono-0, #ffffff);
      --baps-popover-border: var(--color-mybky-mono-300, #e4ecf1);
      --baps-popover-text: var(--color-mybky-text-primary, #181b1d);
      --baps-popover-radius: 0.75rem;
      --baps-popover-shadow:
        0 4px 6px -1px rgba(24, 27, 29, 0.06),
        0 10px 24px -4px rgba(24, 27, 29, 0.1);
    }

    :is(.baps-ds-sampark, .baps-popover-sampark).p-popover,
    .baps-ds-sampark .p-popover {
      --baps-popover-bg: var(--color-sampark-surface-card, #ffffff);
      /* Mono/40, a step darker than the hairline used inside content — a
         floating panel sits ON that content and needs its own edge. */
      --baps-popover-border: var(--color-sampark-mono-40, #bcb9b9);
      --baps-popover-text: var(--color-sampark-text-primary, #151414);
      --baps-popover-radius: var(--radius-sampark-default, 0.25rem);
      --baps-popover-shadow: var(--shadow-sampark-dropdown, 0 12px 40px rgba(0, 0, 0, 0.15));
    }

    .p-popover {
      background: var(--baps-popover-bg);
      color: var(--baps-popover-text);
      border: 1px solid var(--baps-popover-border);
      border-radius: var(--baps-popover-radius);
      box-shadow: var(--baps-popover-shadow);
    }

    .p-popover .p-popover-content {
      padding: 0.75rem;
    }

    /* PrimeNG draws a little arrow with two stacked pseudo-elements — the outer
       one is the border, the inner the fill. Both have to be re-pointed or the
       arrow keeps Material's palette while the panel wears ours. */
    .p-popover::before {
      border-block-end-color: var(--baps-popover-border);
    }
    .p-popover::after {
      border-block-end-color: var(--baps-popover-bg);
    }

    /* ── Dark ── */
    .baps-dark .p-popover {
      --baps-popover-bg: var(--color-mybky-dark-surface-card, #2b2f32);
      --baps-popover-border: var(--color-mybky-dark-border-divider, #3d4144);
      --baps-popover-text: var(--color-mybky-dark-text-primary, #f8fafb);
    }
    .baps-dark .baps-ds-sampark .p-popover,
    .baps-dark .p-popover.baps-popover-sampark {
      --baps-popover-bg: var(--color-sampark-dark-surface-card, #2c2c2a);
      --baps-popover-border: var(--color-sampark-dark-border-divider, #4a4947);
      --baps-popover-text: var(--color-sampark-dark-text-primary, #f8f7f7);
    }
  `,
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
