import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, within } from '@storybook/test';
import { BapsRadio } from './radio.component';

/**
 * Radio — Sampark node 13197:89044, MyBKY node 22465:108841. Each frame is
 * named "Checkbox" but carries both types; these are its "Type=Radio Button"
 * rows.
 *
 * Matrix: Size {S (16), L (Mob, 22)} x Status {Default, Hover, Disabled} x
 * Checked {True, False}. Radio has no Intermediate row — that exists only for
 * Checkbox, which is why this component has no `indeterminate` input.
 *
 * These stories carry no `brand` input, so they follow the toolbar's Design
 * System switch. Only the last story pins Sampark.
 *
 * Bound with `ngModel`: `value` is the CVA field, not an `@Input`.
 */
const meta: Meta<BapsRadio> = {
  title: 'Components/Atoms/Radio',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-radio.
  id: 'components-radio',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    disabled: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    variant: { control: 'inline-radio', options: [undefined, 'outlined', 'filled'] },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:89044.
    // Harvested from radio.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-89044' },
  },
  component: BapsRadio,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
};

export default meta;

/** A real single-choice group — radios grouped by a shared `name`. */
export const Default: StoryObj<BapsRadio> = {
  render: (args) => ({
    props: { ...args, scope: 'all' },
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start">
        <baps-radio name="scope" radioValue="all" [label]="label || 'All karyakars'" [disabled]="disabled" [size]="size" [variant]="variant" [brand]="brand" [(ngModel)]="scope"></baps-radio>
        <baps-radio name="scope" radioValue="mine" label="Assigned to me" [disabled]="disabled" [size]="size" [variant]="variant" [brand]="brand" [(ngModel)]="scope"></baps-radio>
        <baps-radio name="scope" radioValue="center" label="My center only" [disabled]="disabled" [size]="size" [variant]="variant" [brand]="brand" [(ngModel)]="scope"></baps-radio>
      </div>
    `,
  }),
};

/**
 * The two Figma size steps. S (16px control / 14px label) is the default;
 * L ("L (24) (Mob)" in Figma) is the mobile step. Note the box it draws is 22px, not 24 — the 24 is the nominal step name.
 */
export const Sizes: StoryObj<BapsRadio> = {
  render: () => ({
    props: { a: 'x', b: 'y' },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start">
        <baps-radio name="sz-s" radioValue="x" label="Small (16px)" [(ngModel)]="a"></baps-radio>
        <baps-radio name="sz-l" size="large" radioValue="y" label="Large (22px box, mobile)" [(ngModel)]="b"></baps-radio>
      </div>
    `,
  }),
};

/**
 * Every Status row from the Figma matrix. Hover is pointer-driven and cannot
 * be shown statically.
 */
export const States: StoryObj<BapsRadio> = {
  render: () => ({
    props: { off: null, on: 'on', dOff: null, dOn: 'don' },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start">
        <baps-radio name="st-1" radioValue="off" label="Default" [(ngModel)]="off"></baps-radio>
        <baps-radio name="st-2" radioValue="on" label="Checked" [(ngModel)]="on"></baps-radio>
        <baps-radio name="st-3" radioValue="doff" label="Disabled" [disabled]="true" [(ngModel)]="dOff"></baps-radio>
        <baps-radio name="st-4" radioValue="don" label="Disabled checked" [disabled]="true" [(ngModel)]="dOn"></baps-radio>
      </div>
    `,
  }),
};

/**
 * The same matrix with `brand="sampark"` PINNED, so it renders Sampark even
 * while the toolbar sits on MyBKY.
 *
 * Every story above carries no `brand` and therefore follows the toolbar's
 * Design System switch. This one covers what the toolbar cannot: the
 * per-instance override (a Sampark control on a MyBKY page, which is what the
 * `dt` getter exists for) and Sampark coverage in visual regression, which
 * snapshots with the default MyBKY globals.
 *
 * Hover this story's "Checked" row to see the one place the two controls
 * diverge: a checked Sampark radio fills solid Primary/80 #b44141 with a white
 * dot. A checked MyBKY radio does not fill, and neither checkbox ever does.
 *
 * The reverse pin is not possible — there is no MyBKY `dt`, because MyBKY IS
 * the global preset.
 */
export const Sampark: StoryObj<BapsRadio> = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    props: { off: null, on: 'on', dOff: null, dOn: 'don', lg: 'lg' },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start">
        <baps-radio brand="sampark" name="sp-1" radioValue="off" label="Default" [(ngModel)]="off"></baps-radio>
        <baps-radio brand="sampark" name="sp-2" radioValue="on" label="Checked" [(ngModel)]="on"></baps-radio>
        <baps-radio brand="sampark" name="sp-3" radioValue="doff" label="Disabled" [disabled]="true" [(ngModel)]="dOff"></baps-radio>
        <baps-radio brand="sampark" name="sp-4" radioValue="don" label="Disabled checked" [disabled]="true" [(ngModel)]="dOn"></baps-radio>
        <baps-radio brand="sampark" name="sp-5" radioValue="lg" size="large" label="Large (22px, mobile)" [(ngModel)]="lg"></baps-radio>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Single-choice: picking one clears the others.
 *
 * The grouping is by shared `name`, and that is the whole mechanism — nothing
 * in the markup of a single radio says which group it belongs to. A regression
 * that dropped or mangled the name would give three independently checkable
 * radios that still look like a group, which is exactly the bug this catches.
 */
export const SelectionInteraction: StoryObj<BapsRadio> = {
  name: 'Interaction — single choice',
  render: () => ({
    props: { scope: 'all' },
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start">
        <baps-radio name="scope" radioValue="all" label="All karyakars" [(ngModel)]="scope"></baps-radio>
        <baps-radio name="scope" radioValue="mine" label="Assigned to me" [(ngModel)]="scope"></baps-radio>
        <baps-radio name="scope" radioValue="center" label="My center only" [(ngModel)]="scope"></baps-radio>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('radio', { name: 'All karyakars' });
    const mine = canvas.getByRole('radio', { name: 'Assigned to me' });
    const center = canvas.getByRole('radio', { name: 'My center only' });

    await expect(all).toBeChecked();

    // By label, not by the control — same wiring assertion as the checkbox.
    await userEvent.click(canvas.getByText('Assigned to me'));
    await expect(mine).toBeChecked();
    await expect(all).not.toBeChecked();
    await expect(center).not.toBeChecked();
  },
};

/**
 * Keyboard: a radio group is ONE tab stop, and arrows move within it.
 *
 * That is the part people get wrong. Tab must not visit all three — it enters
 * the group at the checked one and leaves; Down/Up moves the selection. If a
 * refactor ever made each radio its own tab stop the group would still look
 * right and become tedious to operate.
 */
export const KeyboardInteraction: StoryObj<BapsRadio> = {
  name: 'Interaction — keyboard arrows',
  render: () => ({
    props: { scope: 'all' },
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start">
        <baps-radio name="kb" radioValue="all" label="All" [(ngModel)]="scope"></baps-radio>
        <baps-radio name="kb" radioValue="mine" label="Mine" [(ngModel)]="scope"></baps-radio>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('radio', { name: 'All' });
    const mine = canvas.getByRole('radio', { name: 'Mine' });

    await userEvent.tab();
    await expect(all).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(mine).toBeChecked();
    await expect(all).not.toBeChecked();
  },
};
