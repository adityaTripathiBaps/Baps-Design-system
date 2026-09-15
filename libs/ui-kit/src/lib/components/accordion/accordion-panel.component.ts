import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

/**
 * baps-accordion-panel — one section of a `baps-accordion`.
 *
 * Renders NOTHING of its own. Its whole job is to hold a section's inputs and
 * to capture the content between its tags as a `TemplateRef`, which
 * `baps-accordion` then stamps inside its own view.
 *
 * That indirection is the entire trick, and it is what makes a wrapper
 * possible at all here. PrimeNG's `AccordionPanel` resolves its parent with
 * `inject(Accordion)`, and element injectors resolve up the DECLARATION tree —
 * so a `p-accordion-panel` written in the consumer's template, or rendered
 * inside THIS component's view, would look for its accordion through the
 * consumer and never find it (`NG0201: No provider found for Accordion` —
 * measured, twice). Handing the content over as a template instead means every
 * PrimeNG element ends up in one view, next to the `p-accordion` that provides
 * `Accordion`, and the lookup resolves normally.
 *
 * `<ng-content>` inside an `<ng-template>` is what captures it. The content is
 * projected when the template is stamped, which happens exactly once.
 */
@Component({
  selector: 'baps-accordion-panel',
  template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class BapsAccordionPanel {
  /** Identity of this section, as used in the accordion's `value`. */
  @Input({ required: true }) value!: string;

  /** Heading text. */
  @Input() label = '';

  /**
   * The badge on the header — how many of this section's options are on.
   * Left undefined the badge is not rendered at all, which is the difference
   * between "none selected" and "this section does not count anything".
   */
  @Input() count?: number | string;

  /**
   * The hairline between the header and the content.
   *
   * On by default because most sections are a list of rows and Figma draws it
   * there. Turn it OFF for a section whose content is a single bordered
   * control — a select draws its own edge, and the two together read as a
   * double rule. That is the same 88px-vs-89px split the Sampark filter panel
   * frames use.
   */
  @Input() divider = true;

  @Input() disabled = false;

  /**
   * Adds a clear control to the header, beside the count.
   *
   * Only rendered while `count` is a non-zero number — a clear button on an
   * empty section is a control that cannot do anything. The panel does not
   * clear anything itself; it emits `clear` and the consumer owns the state,
   * because only the consumer knows what "empty" means for its own filter.
   */
  @Input() clearable = false;

  /** The header's clear control was activated. */
  @Output() clear = new EventEmitter<void>();

  @ViewChild('content', { static: true }) contentTemplate!: TemplateRef<unknown>;
}
