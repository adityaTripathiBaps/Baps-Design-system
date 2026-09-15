import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import type { BapsIconName } from '../icon/icon-set';

/** What the app knows about a step, independent of which one is open. */
export type BapsStepStatus = 'completed' | 'in-progress' | 'invalid';

/**
 * baps-step — one step of a `baps-stepper`.
 *
 * Renders NOTHING of its own. Its whole job is to hold the step's inputs and
 * to capture the content between its tags as a `TemplateRef`, which
 * `baps-stepper` then stamps inside its own view as the step's panel.
 *
 * That indirection is the entire trick, and it is what makes a wrapper
 * possible here at all. PrimeNG's `Step`, `StepList`, `StepPanel` and
 * `StepPanels` each resolve their parent with `inject(Stepper)`, and element
 * injectors resolve up the DECLARATION tree — so a `p-step` written in the
 * consumer's template, or projected through `<ng-content>`, looks for its
 * stepper through the CONSUMER and never finds it (`NG0201: No provider found
 * for Stepper` — the failure `stepper.directive.ts` documents at length).
 * Handing the content over as a template instead means every PrimeNG element
 * is created in one view, next to the `p-stepper` that provides `Stepper`, and
 * the lookup resolves normally.
 *
 * `<ng-content>` inside an `<ng-template>` is what captures it. The content is
 * projected when the template is stamped, which happens exactly once.
 *
 * This is the same shape `baps-accordion-panel` uses, for the same reason.
 */
@Component({
  selector: 'baps-step',
  template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class BapsStep {
  /** Identity of this step, as used in the stepper's `value`. */
  @Input({ required: true }) value!: number;

  /** The step's name. Shown under the open slot, and on hover for the rest. */
  @Input() label = '';

  /**
   * Picks the SHAPE, not just the glyph.
   *
   * With an icon the step renders as an icon rail slot — a circle in a tinted
   * pill, the open one larger and lifted. Without one it renders as a plain
   * `p-step`, where PrimeNG draws its own number and title. Both are skinned;
   * see the stepper docs for which to reach for.
   *
   * Leave it off for every step or set it on every step. A rail with a hole in
   * it is not a state the skin has a treatment for.
   */
  @Input() icon?: BapsIconName;

  /**
   * What the app knows about this step, independent of which one is open.
   *
   * These are FILLS. Being open is a separate axis (a position: larger and
   * lifted), so a step can be both — the open step of a finished section is
   * large, lifted AND green.
   */
  @Input() status?: BapsStepStatus;

  /** Adds the red overlay badge that marks a step as needing input. */
  @Input() required = false;

  /**
   * Not reachable. Sets the `disabled` ATTRIBUTE as well as the wash, because
   * `pointer-events: none` alone still leaves the slot reachable by keyboard.
   */
  @Input() locked = false;

  @ViewChild('content', { static: true }) contentTemplate!: TemplateRef<unknown>;
}
