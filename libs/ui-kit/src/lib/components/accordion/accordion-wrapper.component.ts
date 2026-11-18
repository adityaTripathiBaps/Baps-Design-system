import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
} from 'primeng/accordion';
import { BapsAccordionPanel } from './accordion-panel.component';

/**
 * PrimeNG's own accordion value type, mirrored so this passes straight
 * through. Numbers are in it because a panel's `value` may be an index.
 */
export type AccordionValue =
  string | number | string[] | number[] | null | undefined;

/**
 * baps-accordion — collapsible sections, in the house shape.
 *
 * ## Why this can be a wrapper when the earlier attempts could not
 *
 * Two shapes were tried before and both threw
 * `NG0201: No provider found for Accordion`:
 *
 * 1. Wrapping the panels too, so `p-accordion-panel` rendered inside a
 *    `baps-accordion-panel` view.
 * 2. Wrapping only the root, with the consumer's own `p-accordion-panel`
 *    elements projected in.
 *
 * Both fail for one reason: `AccordionPanel` resolves its parent with
 * `inject(Accordion)`, and element injectors walk the DECLARATION tree. In
 * either shape the panel is declared somewhere the `p-accordion` element is
 * not an ancestor, so the lookup runs past it into the module injector.
 *
 * This shape moves the PrimeNG markup instead of the lookup. Consumers write
 * `baps-accordion-panel`, which renders nothing and just hands its content over
 * as a `TemplateRef`; every `p-accordion-panel` is then created HERE, in the
 * same view as the `p-accordion` that provides `Accordion`. The DI question
 * disappears rather than being worked around, and the consumer never types a
 * `p-` element.
 *
 * ## What it removes from the call site
 *
 * The count badge, the label, the body wrapper and the divider are all
 * structural — every section has them, spelled the same way. They are inputs
 * here instead of markup the consumer repeats:
 *
 *     <baps-accordion brand="sampark" [multiple]="true" [(value)]="open">
 *       <baps-accordion-panel value="status" label="Status" [count]="4">
 *         <div class="baps-accordion-row">…</div>
 *       </baps-accordion-panel>
 *     </baps-accordion>
 *
 * `bapsAccordion` (the directive on a raw `p-accordion`) is still there and
 * still supported — reach for it when a consumer needs PrimeNG's own panel
 * API, such as a custom header template. This is the shorter road for the
 * ordinary case.
 */
@Component({
  selector: 'baps-accordion',
  imports: [
    NgTemplateOutlet,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
  ],
  template: `
    <p-accordion
      [multiple]="multiple"
      [value]="value!"
      (valueChange)="valueChange.emit($event)"
      [class.baps-sampark]="brand === 'sampark'"
    >
      @for (panel of panels; track panel.value) {
        <p-accordion-panel [value]="panel.value" [disabled]="panel.disabled">
          <p-accordion-header>
            @if (panel.count !== undefined && panel.count !== null) {
              <span
                class="baps-accordion-count"
                [class.baps-accordion-count--zero]="+panel.count === 0"
                aria-hidden="true"
                >{{
                panel.count
              }}</span>
            }
            <span class="baps-accordion-label">{{ panel.label }}</span>
            @if (panel.clearable && +(panel.count ?? 0) > 0) {
              <!-- stopPropagation, or the click also toggles the section it
                   sits in: the header IS the toggle, so a control inside it
                   would clear the filter and collapse the panel in one go. -->
              <button
                type="button"
                class="baps-accordion-clear"
                [attr.aria-label]="'Clear ' + panel.label"
                (click)="panel.clear.emit(); $event.stopPropagation()"
              >
                <i
                  class="pi pi-times-circle baps-accordion-clear__mybky"
                  aria-hidden="true"
                ></i>
                <svg
                  class="baps-accordion-clear__sampark"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M11.625 7.12503L9.74998 9.00002M9.74998 9.00002L7.87498 10.875M9.74998 9.00002L7.87497 7.12502M9.74998 9.00002L11.625 10.875M2.61736 11.385L3.12796 12.18C4.01338 13.5586 4.45608 14.2479 5.15336 14.6239C5.85063 15 6.68593 15 8.35653 15H10.3342C13.2408 15 14.6941 15 15.597 14.1213C16.5 13.2426 16.5 11.8284 16.5 9C16.5 6.17157 16.5 4.75736 15.597 3.87868C14.6941 3 13.2408 3 10.3342 3L8.35653 3C6.68593 3 5.85063 3 5.15336 3.37607C4.45608 3.75215 4.01337 4.44143 3.12796 5.82001L2.61736 6.61501C1.87245 7.77481 1.5 8.35471 1.5 9C1.5 9.64529 1.87245 10.2252 2.61736 11.385Z"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            }
          </p-accordion-header>
          <p-accordion-content>
            <div class="baps-accordion-body">
              @if (panel.divider) {
                <span class="baps-accordion-divider"></span>
              }
              <ng-container *ngTemplateOutlet="panel.contentTemplate" />
            </div>
          </p-accordion-content>
        </p-accordion-panel>
      }
    </p-accordion>
  `,
  // None: the skin lives in a global partial and would never reach a scoped view.
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-accordion {
      display: block;
    }
  `,
})
export class BapsAccordionWrapper {
  /** More than one section open at a time. */
  @Input() multiple = false;

  /**
   * Which section(s) are open — a string in single mode, an array in
   * `multiple`. PrimeNG's own `value`, passed straight through.
   */
  @Input() value?: AccordionValue;
  @Output() valueChange = new EventEmitter<AccordionValue>();

  /**
   * Visual skin. 'sampark' adds the host class `_accordion.scss` keys its
   * Mono/10 header plate and Primary/10% count badge off.
   *
   * A class rather than PrimeNG's `dt`, for the reason the directive spells
   * out: v21 declares `dt` as a signal input, which is read-only from outside.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  @ContentChildren(BapsAccordionPanel) panels!: QueryList<BapsAccordionPanel>;
}
