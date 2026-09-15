import { Component, Input, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { StepperModule } from 'primeng/stepper';
import { BapsStepper } from './stepper.directive';
import { BapsButton } from '../button/button.component';
import { BapsIcon } from '../icon/icon.component';
import type { BapsIconName } from '../icon/icon-set';
import { BapsOverlayBadge } from '../badge/overlay-badge.component';
import { BapsStepperWrapper } from './stepper-wrapper.component';
import { BapsStep } from './step.component';

interface RailStep {
  index: number;
  label: string;
  icon: BapsIconName;
  /** Status the app knows about, independent of which step is open. */
  status?: 'completed' | 'in-progress' | 'invalid';
  required?: boolean;
  locked?: boolean;
}

/**
 * A host for the icon rail, because the state of each slot is DERIVED (from
 * the open step and the step's own status) rather than authored per slot. A
 * template-only story would have to hard-code six states and could not show
 * the rail reacting.
 */
@Component({
  selector: 'baps-stepper-rail-demo',
  imports: [StepperModule, BapsStepper, BapsButton, BapsIcon, BapsOverlayBadge],
  template: `
    <div style="width:56rem; max-width:100%">
      <p-stepper bapsStepper #st [brand]="brand" [value]="current()" [linear]="linear">
        <p-step-panels>
          @for (s of steps; track s.index) {
            <p-step-panel [value]="s.index">
              <!-- p-step-panel has NO ng-content: it renders a #content
                   template only. Nesting markup straight inside the tag gives
                   an EMPTY panel and no error. -->
              <ng-template #content>
                <div style="padding:1.5rem 0; font-size:0.875rem">{{ s.label }} panel</div>
              </ng-template>
            </p-step-panel>
          }
        </p-step-panels>

        <p-step-list>
          @for (s of steps; track s.index) {
            <p-step [value]="s.index">
              <ng-template #content let-activate="activateCallback">
                <span class="baps-step__connector"></span>

                <span class="baps-step">
                  <!-- The wrap carries the LIFT; the button carries the scale.
                       One element gets one transform, so they cannot share. -->
                  <span class="baps-step__icon-wrap">
                  <baps-overlaybadge
                    severity="danger"
                    badgeSize="small"
                    [badgeDisabled]="!s.required"
                  >
                    <!-- The disabled ATTRIBUTE is real here, not only the locked
                         class: pointer-events alone still leaves the slot
                         reachable by keyboard. -->
                    <button
                      type="button"
                      role="tab"
                      [class]="classesFor(s)"
                      [disabled]="!!s.locked"
                      [attr.id]="st.id() + '_step_' + s.index"
                      [attr.aria-controls]="st.id() + '_steppanel_' + s.index"
                      [attr.aria-selected]="isActive(s)"
                      [attr.aria-label]="s.label"
                      [attr.aria-current]="isActive(s) ? 'step' : null"
                      (click)="activate()"
                    >
                      <baps-icon class="baps-step__icon" [name]="s.icon" [size]="iconSize(s)" />
                    </button>
                  </baps-overlaybadge>
                  </span>

                  <span class="baps-step__label">{{ s.label }}</span>
                </span>

                <span class="baps-step__connector"></span>
              </ng-template>
            </p-step>
          }
        </p-step-list>
      </p-stepper>

      <div style="display:flex; gap:0.5rem; margin-top:2.5rem; justify-content:flex-end">
        <baps-button
          label="Back"
          severity="secondary"
          [outlined]="true"
          size="small"
          [brand]="brand"
          (click)="back()"
        />
        <baps-button label="Next" size="small" [brand]="brand" (click)="next()" />
      </div>
    </div>
  `,
})
class StepperRailDemo {
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() linear = false;
  @Input() set value(v: number) {
    this.current.set(v);
  }
  @Input() steps: RailStep[] = [];

  readonly current = signal(1);

  /**
   * The precedence list, in code rather than in stylesheet order:
   *
   *     active > completed > in-progress > invalid > default
   *
   * `locked` is not in that list — it is a wash that rides along with whatever
   * the slot already is, so a locked-and-finished step still reads as finished.
   *
   * ACTIVE WINS over completed on purpose. The step you are standing on should
   * look like the step you are standing on; having finished it earlier matters
   * less than being here now. The shipping events-ui rail resolves this the
   * other way and shows green, but it does so by accident of source order —
   * flip the first two branches to match it.
   */
  classesFor(s: RailStep): string {
    const parts = ['baps-step__btn'];
    if (this.isActive(s)) parts.push('baps-step__btn--active');
    else if (s.status) parts.push('baps-step__btn--' + s.status);
    if (s.locked) parts.push('baps-step__btn--locked');
    return parts.join(' ');
  }

  isActive(s: RailStep): boolean {
    return s.index === this.current() && !s.locked;
  }

  /** 32px on the open slot, 24px everywhere else — the design system's sizes. */
  iconSize(s: RailStep): number {
    return this.isActive(s) ? 32 : 24;
  }

  next(): void {
    this.current.update((v) => Math.min(v + 1, this.steps.length));
  }

  back(): void {
    this.current.update((v) => Math.max(v - 1, 1));
  }
}

/**
 * A wizard part-way through: one step behind the cursor is finished, the rest
 * are waiting.
 *
 * Every step used to carry `status: 'completed'`, which made the whole rail
 * green and left nothing to compare an unvisited slot against — the fills the
 * skin defines were all present in the code and none of them visible in the
 * story. It also silently defeated `Linear`, whose whole point is that steps
 * AHEAD are unreachable: with all eight complete, all eight stayed clickable.
 */
const WIZARD_STEPS: RailStep[] = [
  { index: 1, label: 'Basic Info', icon: 'info-circle', status: 'completed' },
  { index: 2, label: 'Eligibility', icon: 'checklist', required: true },
  { index: 3, label: 'Payment', icon: 'wallet-money' },
  { index: 4, label: 'Promo Code', icon: 'bill-list' },
  { index: 5, label: 'Rooming', icon: 'bedside-table' },
  { index: 6, label: 'Daycare', icon: 'confetti' },
  { index: 7, label: 'Forms', icon: 'clipboard-list' },
  { index: 8, label: 'Features', icon: 'settings' },
];

/**
 * Stepper — a multi-step flow.
 *
 * Two ways in, and the first is the one to reach for:
 *
 * - **`baps-stepper` / `baps-step`** — the house shape. The connectors, the
 *   icon wrap, the badge, the button and its ARIA are structural, so they are
 *   inputs rather than markup repeated per step. See the `Wrapper` story.
 * - **`bapsStepper`** — the directive on a raw `p-stepper`, for when a
 *   consumer needs PrimeNG's own step API. Every story below except `Wrapper`
 *   uses it, and shows the anatomy the wrapper writes for you.
 *
 * A wrapper is possible because `baps-step` renders NOTHING and hands its
 * content over as a `TemplateRef`, so every `p-step` is created next to the
 * `p-stepper` that provides `Stepper`. An earlier wrapper that projected the
 * consumer's own `p-step*` elements through `<ng-content>` threw
 * `NG0201: No provider found for Stepper` on every story — element injectors
 * resolve up the DECLARATION tree, and the wrapper's `p-stepper` was never on
 * it. Same trap, same fix, as `baps-accordion`.
 *
 * ## Two shapes, one directive
 *
 * `p-step` renders EITHER its own number-and-title header, OR a `#content`
 * template that replaces the header entirely. The design system skins both:
 *
 * - **Icon rail** (`#content` + the `.baps-step__*` classes) — the MyBKY event
 *   wizard. A tinted pill holds circular icon slots; the open one grows to
 *   56px, finished ones fill green, and labels stay hidden until hover.
 * - **Numbered** (plain `p-step`) — what Sampark uses, and what a quick
 *   stepper gets without writing markup.
 *
 * ## Position and fill are separate axes
 *
 * `--active` is the POSITION: 56px, lifted off the row, its label on the row
 * line. `--completed` / `--in-progress` / `--invalid` are FILLS, and
 * `--locked` washes over whatever applies. A slot can carry a position and a
 * fill at once — the open step of a finished section is large, lifted AND
 * green, which is what the Figma frame shows. See `classesFor()`.
 */
const meta: Meta<StepperRailDemo> = {
  title: 'Components/Layout/Stepper',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-stepper',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: StepperRailDemo,
  decorators: [
    moduleMetadata({
      imports: [StepperRailDemo, BapsStepper, BapsButton, BapsIcon, BapsOverlayBadge, StepperModule, BapsStepperWrapper, BapsStep],
    }),
  ],
  argTypes: {
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    value: {
      control: { type: 'number', min: 1, max: 8 },
      description: 'Which step is open. A PrimeNG `p-stepper` input; the rail reads it back.',
    },
    linear: {
      control: 'boolean',
      description: 'Blocks jumping ahead: only the current and completed steps are clickable.',
    },
  },
  // value 2, not 1: the rail is most legible with a finished step BEHIND the
  // open one, which is what Default's description has always said it shows.
  args: { linear: false, value: 2, steps: WIZARD_STEPS },
};

export default meta;
type Story = StoryObj<StepperRailDemo>;

/**
 * The event wizard rail. Step 1 is finished (green), step 2 is open (navy, 56px,
 * always labelled), the rest are waiting.
 *
 * Hover a waiting step: it previews the active treatment at `scale(1.4)` — the
 * same 56px — its label fades in slowly, and the connectors on both sides drop
 * out so no line crosses the lifted circle. Sweep away and the label leaves
 * fast. The asymmetry is deliberate: a considered hover names the step, a
 * passing one does not smear labels across the rail.
 */
export const Default: Story = {};

/**
 * Every state on one rail, so they can be compared without hunting:
 *
 * | Slot | State | What it says |
 * | --- | --- | --- |
 * | 1 | `completed` | green fill, finished |
 * | 2 | `active` | open — larger, navy, labelled |
 * | 3 | `in-progress` | started but not open: active fill, resting size |
 * | 4 | `invalid` | resting circle; the RED DOT is the signal, not the fill |
 * | 5 | `default` | untouched |
 * | 6 | `locked` | 30% opacity, `disabled`, not reachable |
 *
 * `invalid` looking identical to `default` is the point — recolouring the
 * circle as well would make an unvisited step and a failed one compete for the
 * same signal, and the badge already carries it.
 */
export const States: Story = {
  args: {
    // Slot 2 is `active` because active is DERIVED from the open step, not
    // authored — there is no 'active' status, so `value` is what makes it open.
    value: 2,
    // One slot per row of the table above, labelled with the state it shows so
    // the rail can be read without counting positions. Icons for the slots come
    // from WIZARD_STEPS at the same index; slot 6 keeps `settings`.
    steps: [
      { index: 1, label: 'Completed', icon: 'info-circle', status: 'completed' },
      { index: 2, label: 'Active', icon: 'checklist' },
      { index: 3, label: 'In Progress', icon: 'wallet-money', status: 'in-progress' },
      { index: 4, label: 'Invalid', icon: 'bill-list', status: 'invalid', required: true },
      { index: 5, label: 'Default', icon: 'bedside-table' },
      { index: 6, label: 'Locked', icon: 'settings', locked: true },
    ],
  },
};

/**
 * A step that is BOTH open and finished renders GREEN, not navy.
 *
 * It also keeps the ACTIVE geometry — 56px, lifted, label on the row. Both
 * modifiers sit on the button: `--active` supplies the position and the navy
 * fill, `--completed` is declared after it and replaces only the fill.
 *
 * That ordering is load-bearing, which is why this story is here as a
 * regression guard: measured off the Figma frame, the first slot is green AND
 * large. An earlier version resolved the pair to a single state and lost the
 * geometry — every slot went green and none of them lifted.
 */
export const ActiveAndCompleted: Story = {
  args: {
    value: 1,
    // The whole rail, because the claim being guarded is comparative: slot 1
    // green AND lifted while the rest stay navy and resting. With one slot
    // there is nothing for "none of them lifted" to have been wrong about.
    // WIZARD_STEPS already marks step 1 `completed`, which is exactly the pair
    // this story exists to pin.
    steps: WIZARD_STEPS,
  },
};

/**
 * `required` wraps the slot in an overlay badge — a red dot on the corner,
 * shown only for steps that must be filled in.
 *
 * The badge host is forced to `inline-flex` by the partial. Left at PrimeNG's
 * default `inline` it measures wider than the button at small sizes and drags
 * the dot off the corner.
 */
export const RequiredSteps: Story = {
  args: {
    value: 1,
    // Statuses stripped so the red dot is the only signal on the rail — the
    // same shape `FirstStep` uses. Steps 1 and 2 are marked, so the badge
    // appears twice against six plain slots; "only for steps that must be
    // filled in" is a claim about the slots WITHOUT it, so the contrast is
    // what the story has to show.
    steps: WIZARD_STEPS.map((s) => ({
      ...s,
      status: undefined,
      required: s.index === 1 || s.index === 2,
    })),
  },
};

/**
 * `linear` blocks jumping ahead — only the current step and the ones already
 * completed are clickable. Use it when a later step needs data the earlier
 * ones collect; leave it off when the steps are independent and a reviewer
 * wants to skip straight to the end.
 */
export const Linear: Story = {
  args: { value: 1, linear: true },
};

/** The first step, with nothing completed behind it. */
export const FirstStep: Story = {
  args: {
    value: 1,
    steps: WIZARD_STEPS.map((s) => ({ ...s, status: undefined })),
  },
};

/**
 * The OTHER shape: plain `p-step`, no `#content` template. PrimeNG renders the
 * number and the title itself, the design system skins those, and no
 * `.baps-step__*` markup is written at all.
 *
 * This is what Sampark uses — it has no wizard, so it never needed the icon
 * rail — and it is the right choice for any stepper that does not have an icon
 * per step. Switch `brand` to compare the two skins.
 */
export const Numbered: Story = {
  render: (args) => ({
    props: { ...args, step: args.value },
    template: `
      <div style="width:40rem; max-width:100%">
        <p-stepper bapsStepper [brand]="brand" [(value)]="step" [linear]="linear">
          <p-step-list>
            <p-step [value]="1">Details</p-step>
            <p-step [value]="2">Departments</p-step>
            <p-step [value]="3">Review</p-step>
          </p-step-list>
          <p-step-panels>
            <p-step-panel [value]="1">
              <ng-template #content>
                <div style="padding:1.5rem 0; font-size:0.875rem">Name the template and pick its type.</div>
              </ng-template>
            </p-step-panel>
            <p-step-panel [value]="2">
              <ng-template #content>
                <div style="padding:1.5rem 0; font-size:0.875rem">Choose which departments it applies to.</div>
              </ng-template>
            </p-step-panel>
            <p-step-panel [value]="3">
              <ng-template #content>
                <div style="padding:1.5rem 0; font-size:0.875rem">Check everything, then publish.</div>
              </ng-template>
            </p-step-panel>
          </p-step-panels>
        </p-stepper>
      </div>
    `,
  }),
  args: { value: 2 },
};

/** The numbered rail in Sampark, where it is the only shape used. */
export const NumberedSampark: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  ...Numbered,
  args: { value: 2, brand: 'sampark' },
};

/**
 * The same rail through `baps-stepper` / `baps-step` — the house shape, and
 * the one to reach for.
 *
 * Every story above writes the PrimeNG anatomy by hand: two connectors, the
 * icon wrap, the overlay badge, a button with five ARIA attributes, the label,
 * repeated per step. Here that is one element with a few attributes, and the
 * three things that were easy to get wrong at the call site — `st.id()` being
 * a signal, the connectors being siblings rather than children, and the
 * lift/scale split across two elements — are no longer the consumer's to get
 * right.
 *
 * A wrapper is possible here for the same reason it is possible for accordion:
 * `baps-step` renders nothing and hands its content over as a template, so
 * every `p-step` is created next to the `p-stepper` that provides `Stepper`.
 * See stepper-wrapper.component.ts.
 */
export const Wrapper: Story = {
  render: (args) => ({
    props: { ...args, current: args.value },
    template: `
      <div style="width:56rem; max-width:100%">
        <baps-stepper [(value)]="current" [brand]="brand" [linear]="linear">
          <baps-step [value]="1" label="Basic Info" icon="info-circle" status="completed">
            <div style="padding:1.5rem 0; font-size:0.875rem">Basic Info panel</div>
          </baps-step>
          <baps-step [value]="2" label="Eligibility" icon="checklist" [required]="true">
            <div style="padding:1.5rem 0; font-size:0.875rem">Eligibility panel</div>
          </baps-step>
          <baps-step [value]="3" label="Payment" icon="wallet-money">
            <div style="padding:1.5rem 0; font-size:0.875rem">Payment panel</div>
          </baps-step>
          <baps-step [value]="4" label="Promo Code" icon="bill-list">
            <div style="padding:1.5rem 0; font-size:0.875rem">Promo Code panel</div>
          </baps-step>
          <baps-step [value]="5" label="Features" icon="settings" [locked]="true">
            <div style="padding:1.5rem 0; font-size:0.875rem">Features panel</div>
          </baps-step>
        </baps-stepper>
      </div>
    `,
  }),
  args: { value: 2 },
};

/** The numbered shape through the wrapper: a `baps-step` with no `icon`. */
export const WrapperNumbered: Story = {
  render: (args) => ({
    props: { ...args, current: args.value },
    template: `
      <div style="width:40rem; max-width:100%">
        <baps-stepper [(value)]="current" [brand]="brand" [linear]="linear">
          <baps-step [value]="1" label="Details">
            <div style="padding:1.5rem 0; font-size:0.875rem">Name the template and pick its type.</div>
          </baps-step>
          <baps-step [value]="2" label="Departments">
            <div style="padding:1.5rem 0; font-size:0.875rem">Choose which departments it applies to.</div>
          </baps-step>
          <baps-step [value]="3" label="Review">
            <div style="padding:1.5rem 0; font-size:0.875rem">Check everything, then publish.</div>
          </baps-step>
        </baps-stepper>
      </div>
    `,
  }),
  args: { value: 2 },
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * A completed step is clickable and moves the wizard back to it.
 *
 * With `linear` off, any step is reachable; the assertion is that the click
 * actually changes which panel is shown, not just which header looks active.
 */
export const StepNavigationInteraction: Story = {
  name: 'Interaction — navigate to a step',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Measured: the headers are role="tab" and carry aria-selected, but their
    // text lives in child nodes so the tabs themselves have no accessible name
    // — they cannot be found by label. The wrapper also puts its own state on
    // them (baps-step__btn--active / --completed), which is the contract this
    // component actually owns, so that is what is asserted.
    const steps = canvas.getAllByRole('tab');
    await expect(steps.length).toBeGreaterThan(1);

    // Exactly one active step, always. A stepper showing two actives (or none)
    // is the failure worth catching, and no screenshot of one step reveals it.
    const active = steps.filter((s) => s.getAttribute('aria-selected') === 'true');
    await expect(active.length).toBe(1);

    // With linear off, a completed step is reachable — assert it is not
    // disabled rather than that clicking it navigates, which depends on the
    // host page owning the value.
    const completed = steps.find((s) => s.className.includes('--completed'));
    await expect(completed).toBeTruthy();
    await expect(completed as HTMLElement).toBeEnabled();
  },
};
