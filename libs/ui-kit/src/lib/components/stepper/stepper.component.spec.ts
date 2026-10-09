import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsStep, type BapsStepStatus } from './step.component';
import { BapsStepperWrapper } from './stepper-wrapper.component';

/**
 * One spec for the stepper's three files, because they are one component
 * split across three: `baps-step` only captures content and inputs,
 * `baps-stepper` reads them through ContentChildren and does all the work,
 * and the `bapsStepper` directive is only a host class.
 *
 * Four things are pinned, all of which fail without an error:
 *
 * 1. **`classesFor` is a precedence list in code**, not in stylesheet order:
 *    active beats completed, and `locked` is a wash that rides along with
 *    whatever the slot already is. Get it wrong and a finished step you are
 *    standing on stops looking like the step you are standing on.
 *
 * 2. **`isActive` excludes locked**, so a locked step can never be the one
 *    drawn as open even if `value` points at it.
 *
 * 3. **The rail buttons carry the full tab relationship by hand** — id,
 *    aria-controls, aria-selected, aria-current. A missing aria-controls is
 *    a tab that announces no panel; a missing `disabled` leaves a locked
 *    step reachable by keyboard, which `pointer-events: none` does not fix.
 *
 * 4. **`railPosition` must render exactly one set of panels.** PrimeNG
 *    resolves a panel by value, so a second set shadows the first — which is
 *    why the block is written out in both branches rather than stamped from
 *    one template.
 */
@Component({
  standalone: true,
  imports: [BapsStepperWrapper, BapsStep],
  template: `
    <baps-stepper
      [(value)]="value"
      [linear]="linear()"
      [brand]="brand()"
      [railPosition]="railPosition()"
      [railClass]="railClass()"
    >
      <baps-step [value]="1" label="Details" icon="user" [status]="statusOne()">
        Step one body
      </baps-step>
      <baps-step [value]="2" label="Schedule" icon="calendar" [required]="true">
        Step two body
      </baps-step>
      <baps-step [value]="3" label="Review" icon="check" [locked]="lockedThree()">
        Step three body
      </baps-step>
    </baps-stepper>
  `,
})
class Host {
  value = 1;
  readonly linear = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly railPosition = signal<'top' | 'bottom'>('top');
  readonly railClass = signal('');
  readonly statusOne = signal<BapsStepStatus | undefined>(undefined);
  readonly lockedThree = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

/** The rail slots, in document order. */
const slots = (fixture: { nativeElement: HTMLElement }) =>
  [...fixture.nativeElement.querySelectorAll('button.baps-step__btn')] as HTMLButtonElement[];

describe('BapsStepperWrapper', () => {
  describe('rail', () => {
    it('renders one slot per projected step, in order', async () => {
      const fixture = await setup();
      expect(slots(fixture)).toHaveLength(3);
      expect(
        [...fixture.nativeElement.querySelectorAll('.baps-step__label')].map(
          (n) => n.textContent?.trim(),
        ),
      ).toEqual(['Details', 'Schedule', 'Review']);
    });

    it('renders exactly one set of panels for the chosen rail position', async () => {
      const fixture = await setup();
      const count = () =>
        fixture.nativeElement.querySelectorAll('p-step-panels').length;
      // Two sets would shadow each other: PrimeNG resolves a panel by value.
      expect(count()).toBe(1);

      fixture.componentInstance.railPosition.set('bottom');
      await apply(fixture);
      expect(count()).toBe(1);
    });

    it('puts railClass on the element wrapping the rail', async () => {
      const fixture = await setup();
      fixture.componentInstance.railClass.set('is-sticky');
      await apply(fixture);
      expect(
        fixture.nativeElement.querySelector('.is-sticky .p-steplist'),
      ).not.toBeNull();
    });
  });

  describe('classesFor', () => {
    it('marks the open slot active', async () => {
      const fixture = await setup();
      expect(slots(fixture)[0].classList).toContain('baps-step__btn--active');
      expect(slots(fixture)[1].classList).not.toContain('baps-step__btn--active');
    });

    it('lets active win over a status fill', async () => {
      const fixture = await setup();
      fixture.componentInstance.statusOne.set('completed');
      await apply(fixture);

      // Standing on a step you already finished should still look like
      // standing on it.
      expect(slots(fixture)[0].classList).toContain('baps-step__btn--active');
      expect(slots(fixture)[0].classList).not.toContain(
        'baps-step__btn--completed',
      );
    });

    it('falls back to the status fill when the step is not open', async () => {
      const fixture = await setup();
      fixture.componentInstance.value = 2;
      fixture.componentInstance.statusOne.set('completed');
      await apply(fixture);

      expect(slots(fixture)[0].classList).toContain('baps-step__btn--completed');
      expect(slots(fixture)[0].classList).not.toContain('baps-step__btn--active');
    });

    it('adds locked as a wash on top of whatever the slot already is', async () => {
      const fixture = await setup();
      fixture.componentInstance.lockedThree.set(true);
      await apply(fixture);

      const third = slots(fixture)[2];
      // Not part of the precedence list — it rides along, so a locked and
      // finished step still reads as finished.
      expect(third.classList).toContain('baps-step__btn--locked');
      expect(third.classList).toContain('baps-step__btn');
    });

    it('never treats a locked step as the open one', async () => {
      const fixture = await setup();
      fixture.componentInstance.lockedThree.set(true);
      fixture.componentInstance.value = 3;
      await apply(fixture);

      const third = slots(fixture)[2];
      expect(third.classList).not.toContain('baps-step__btn--active');
      expect(third.getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('accessibility', () => {
    it('wires each slot to its panel as a tab', async () => {
      const fixture = await setup();
      const first = slots(fixture)[0];

      expect(first.getAttribute('role')).toBe('tab');
      expect(first.getAttribute('aria-label')).toBe('Details');
      // Without aria-controls the tab announces no panel at all.
      expect(first.getAttribute('aria-controls')).toMatch(/_steppanel_1$/);
      expect(first.id).toMatch(/_step_1$/);
    });

    it('marks only the open slot selected and current', async () => {
      const fixture = await setup();
      const [first, second] = slots(fixture);

      expect(first.getAttribute('aria-selected')).toBe('true');
      expect(first.getAttribute('aria-current')).toBe('step');
      expect(second.getAttribute('aria-selected')).toBe('false');
      // null rather than "false": aria-current is a presence attribute.
      expect(second.hasAttribute('aria-current')).toBe(false);
    });

    it('disables a locked slot natively, not only visually', async () => {
      const fixture = await setup();
      expect(slots(fixture)[2].disabled).toBe(false);

      fixture.componentInstance.lockedThree.set(true);
      await apply(fixture);
      // pointer-events: none alone leaves the slot reachable by keyboard.
      expect(slots(fixture)[2].disabled).toBe(true);
    });
  });

  describe('value', () => {
    it('moves to the clicked step and reports it back', async () => {
      const fixture = await setup();
      slots(fixture)[1].click();
      await apply(fixture);

      expect(fixture.componentInstance.value).toBe(2);
      expect(slots(fixture)[1].classList).toContain('baps-step__btn--active');
    });
  });

  describe('content', () => {
    it('projects each step body, which only works through the ng-template', async () => {
      const fixture = await setup();
      // `<ng-content>` inside `<ng-template>` is what captures the body; the
      // panel renders a #content template and has no ng-content of its own,
      // so markup written straight into the tag gives an empty panel.
      expect(fixture.nativeElement.textContent).toContain('Step one body');
    });
  });

  describe('brand', () => {
    it('puts the Sampark class on the PrimeNG stepper', async () => {
      const fixture = await setup();
      const stepper = fixture.nativeElement.querySelector('p-stepper');
      expect(stepper.classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      // A class rather than PrimeNG's `dt`: v21 declares dt as a signal
      // input, which cannot be written from outside.
      expect(stepper.classList).toContain('baps-sampark');
    });
  });
});
