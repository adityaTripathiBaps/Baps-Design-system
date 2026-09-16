import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, within } from '@storybook/test';
import { BapsCheckbox } from './checkbox.component';

/**
 * Checkbox — Sampark node 13197:89044, MyBKY node 22465:108841. Each frame is
 * named "Checkbox" but carries both types; the Radio Button rows are
 * implemented separately as `baps-radio`.
 *
 * These stories carry no `brand` input, so they follow the toolbar's Design
 * System switch — flip it to see either brand. Only the last story pins
 * Sampark, for the reasons noted there.
 *
 * Value is bound with `ngModel`, not `[value]`. `BapsCheckbox` is a
 * ControlValueAccessor: `value` is its internal CVA field, not an `@Input`,
 * so `[value]="…"` throws NG0303 at runtime ("Can't bind to 'value' since it
 * isn't a known property"). The story previously did exactly that and still
 * *looked* right, because Storybook assigns args onto the component instance
 * separately from the template binding — the error was logged and ignored.
 */
const meta: Meta<BapsCheckbox> = {
  title: 'Components/Atoms/Checkbox',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-checkbox.
  id: 'components-checkbox',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    binary: true,
    disabled: false,
    indeterminate: false,
    readonly: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    variant: { control: 'inline-radio', options: [undefined, 'outlined', 'filled'] },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    binary: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:89044.
    // Harvested from checkbox.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-89044' },
  },
  component: BapsCheckbox,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  render: (args) => ({
    props: { ...args, model: true },
    template: `
      <baps-checkbox [label]="label" [binary]="binary" [brand]="brand" [(ngModel)]="model"></baps-checkbox>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsCheckbox> = {
  args: {
    label: 'I accept the terms and conditions',
    binary: true,
  },
};

/**
 * The two Figma size steps. S (16px box / 14px label) is the default; L
 * ("L (24) (Mob)" in Figma) is the mobile step. Note the box it draws is 22px, not 24 — the 24 is the nominal step name.
 */
export const Sizes: StoryObj<BapsCheckbox> = {
  render: () => ({
    props: { a: true, b: true },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start">
        <baps-checkbox label="Small (16px)" [(ngModel)]="a"></baps-checkbox>
        <baps-checkbox size="large" label="Large (22px box, mobile)" [(ngModel)]="b"></baps-checkbox>
      </div>
    `,
  }),
};

/**
 * Every Status row from the Figma matrix: Default, Checked, Intermediate and
 * both Disabled states. Hover is pointer-driven and cannot be shown statically.
 */
export const States: StoryObj<BapsCheckbox> = {
  render: () => ({
    props: { off: false, on: true, ind: false, dOff: false, dOn: true },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start">
        <baps-checkbox label="Default" [(ngModel)]="off"></baps-checkbox>
        <baps-checkbox label="Checked" [(ngModel)]="on"></baps-checkbox>
        <baps-checkbox label="Intermediate" [indeterminate]="true" [(ngModel)]="ind"></baps-checkbox>
        <baps-checkbox label="Disabled" [disabled]="true" [(ngModel)]="dOff"></baps-checkbox>
        <baps-checkbox label="Disabled checked" [disabled]="true" [(ngModel)]="dOn"></baps-checkbox>
      </div>
    `,
  }),
};

/**
 * The same matrix with `brand="sampark"` PINNED, so it renders Sampark even
 * while the toolbar sits on MyBKY.
 *
 * Every story above deliberately carries no `brand`, so they follow the
 * toolbar's Design System switch. That is the normal case and it is what
 * consumers get. This one exists for the two things the toolbar cannot give:
 *
 * - the per-instance override the component documents — a Sampark control
 *   dropped onto a MyBKY page, which is what the `dt` getter is for;
 * - Sampark coverage in visual regression, which snapshots with the default
 *   (MyBKY) globals and would otherwise never photograph this brand.
 *
 * Note the one genuine divergence, visible in the "Disabled checked" row:
 * Sampark fills that box solid Mono/40 with a white tick, where MyBKY keeps
 * the pale Mono/20 ground and greys the tick. Flip the toolbar to compare.
 *
 * The reverse pin is not possible, and that asymmetry is real rather than an
 * oversight: `brand="sampark"` works because it swaps in Sampark tokens via
 * `dt`, but there is no MyBKY `dt` — MyBKY IS the global preset — so
 * `brand="mybky"` cannot hold MyBKY against a Sampark toolbar.
 */
export const Sampark: StoryObj<BapsCheckbox> = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    props: { off: false, on: true, ind: false, dOff: false, dOn: true },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start">
        <baps-checkbox brand="sampark" label="Default" [(ngModel)]="off"></baps-checkbox>
        <baps-checkbox brand="sampark" label="Checked" [(ngModel)]="on"></baps-checkbox>
        <baps-checkbox brand="sampark" label="Intermediate" [indeterminate]="true" [(ngModel)]="ind"></baps-checkbox>
        <baps-checkbox brand="sampark" label="Disabled" [disabled]="true" [(ngModel)]="dOff"></baps-checkbox>
        <baps-checkbox brand="sampark" label="Disabled checked" [disabled]="true" [(ngModel)]="dOn"></baps-checkbox>
        <baps-checkbox brand="sampark" size="large" label="Large (22px box, mobile)" [(ngModel)]="on"></baps-checkbox>
      </div>
    `,
  }),
};

/* ── Interactions ─────────────────────────────────────────────────────────
   Replayed in the Interactions panel. These assert behaviour a screenshot
   cannot see: that the label is wired to the control, that the CVA writes
   back, and that a disabled box is genuinely inert. */

/**
 * Clicking the LABEL toggles the box.
 *
 * That is the assertion worth having: PrimeNG renders a hidden native input
 * plus a styled box, and the label only reaches it through `for`/`id` wiring.
 * A regression there leaves a checkbox that looks perfect and cannot be
 * clicked anywhere except a 16px square.
 */
export const ClickInteraction: StoryObj<BapsCheckbox> = {
  name: 'Interaction — click and label',
  args: { label: 'I accept the terms and conditions', binary: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox');

    // The story's model starts true, so the first click clears it.
    await expect(box).toBeChecked();
    await userEvent.click(canvas.getByText('I accept the terms and conditions'));
    await expect(box).not.toBeChecked();

    await userEvent.click(canvas.getByText('I accept the terms and conditions'));
    await expect(box).toBeChecked();
  },
};

/** Keyboard: Tab focuses, Space toggles. */
export const KeyboardInteraction: StoryObj<BapsCheckbox> = {
  name: 'Interaction — keyboard',
  args: { label: 'Notify me', binary: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox');

    await userEvent.tab();
    await expect(box).toHaveFocus();

    const before = (box as HTMLInputElement).checked;
    await userEvent.keyboard('{ }');
    await expect(box).toHaveProperty('checked', !before);
  },
};

/**
 * A disabled checkbox is inert — and this asserts the MECHANISM.
 *
 * Both the input and its label carry pointer-events: none, which is what
 * actually stops a user; measured in a real browser, a click on either times
 * out as unclickable. An earlier version of this story used fireEvent to
 * dispatch a click anyway and "found a bug": PrimeNG's own handleChange guards
 * on `readonly` but not on `disabled`, so a forced event does flip the model.
 * That path is unreachable for a user, so the fix was the test, not the
 * component — assert what blocks the click rather than forcing past it.
 */
export const DisabledInteraction: StoryObj<BapsCheckbox> = {
  name: 'Interaction — disabled is inert',
  render: () => ({
    props: { model: false },
    template: `
      <baps-checkbox
        label="Disabled"
        [binary]="true"
        [disabled]="true"
        [(ngModel)]="model"
      ></baps-checkbox>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox');

    await expect(box).toBeDisabled();
    await expect(box).not.toBeChecked();
    await expect(box).toHaveStyle({ pointerEvents: 'none' });
    await expect(canvas.getByText('Disabled')).toHaveStyle({ pointerEvents: 'none' });
  },
};
