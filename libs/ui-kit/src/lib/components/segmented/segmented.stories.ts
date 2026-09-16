import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsSegmented } from './segmented.component';

/**
 * Segmented — Sampark Portal, Figma "Web Tabs Group" (node 17512:78179) and
 * the weekday chip (node 17512:82933), which is the same control in
 * multi-select mode. See the component docs for why those are not two
 * components.
 *
 * Despite the Figma name this is NOT the tab strip — that is bapsTabs, a
 * p-tabs underline directive. This is a boxed pill group that holds a value.
 *
 * Bound with ngModel: value is the CVA field, not an @Input.
 */
const meta: Meta<BapsSegmented> = {
  title: 'Components/Molecules/Segmented',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-segmented.
  id: 'components-segmented',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    allowEmpty: true,
    disabled: false,
    multiple: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    multiple: { control: 'boolean' },
    allowEmpty: { control: 'boolean' },
    disabled: { control: 'boolean' },
    optionLabel: { control: 'text' },
    optionValue: { control: 'text' },
    optionDisabled: { control: 'text' },
    ariaLabel: { control: 'text' },
    ariaLabelledBy: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:78179.
    // Harvested from segmented.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-78179' },
  },
  component: BapsSegmented,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
};

export default meta;

/** The Frequency row from node 17512:78163 — three pills across 344px. */
export const Default: StoryObj<BapsSegmented> = {
  render: () => ({
    props: { options: ['Once', 'Repeat', 'Ad-hoc'], frequency: 'Once' },
    template: `
      <div style="width:344px">
        <baps-segmented
          ariaLabel="Frequency"
          [options]="options"
          [(ngModel)]="frequency"
        ></baps-segmented>
      </div>
      <p style="font:14px Inter; margin-top:12px">Selected: {{ frequency }}</p>
    `,
  }),
};

/**
 * Two pills in the same 344px box — the pills flex, so the Figma 112px at
 * three across and 169px at two both fall out of the same rule.
 */
export const TwoUp: StoryObj<BapsSegmented> = {
  render: () => ({
    props: { options: ['Once', 'Repeat'], mode: 'Once' },
    template: `
      <div style="width:344px">
        <baps-segmented ariaLabel="Mode" [options]="options" [(ngModel)]="mode"></baps-segmented>
      </div>
    `,
  }),
};

/**
 * multiple — the weekday chip row (node 17512:82910). Same component: the
 * chips lose the shared box because there is no single winner to lift, and
 * active chips tint to Primary/0 instead of glowing.
 */
export const Multiple: StoryObj<BapsSegmented> = {
  render: () => ({
    props: {
      days: ['Su', 'We'],
      options: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    template: `
      <baps-segmented
        multiple="true"
        ariaLabel="Repeat on"
        [options]="options"
        [(ngModel)]="days"
      ></baps-segmented>
      <p style="font:14px Inter; margin-top:12px">Selected: {{ days.join(', ') }}</p>
    `,
  }),
};

/** Object options, with one row disabled through optionDisabled. */
export const ObjectOptions: StoryObj<BapsSegmented> = {
  render: () => ({
    props: {
      options: [
        { label: 'Once', value: 'once' },
        { label: 'Repeat', value: 'repeat' },
        { label: 'Ad-hoc', value: 'adhoc', unavailable: true },
      ],
      frequency: 'once',
    },
    template: `
      <div style="width:344px">
        <baps-segmented
          ariaLabel="Frequency"
          optionLabel="label"
          optionValue="value"
          optionDisabled="unavailable"
          [options]="options"
          [(ngModel)]="frequency"
        ></baps-segmented>
      </div>
    `,
  }),
};

/** Both skins side by side. MyBKY swaps the maroon accent for the brand blue. */
export const Brands: StoryObj<BapsSegmented> = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { options: ['Once', 'Repeat', 'Ad-hoc'], a: 'Once', b: 'Repeat' },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; width:344px">
        <baps-segmented brand="sampark" ariaLabel="Sampark" [options]="options" [(ngModel)]="a"></baps-segmented>
        <baps-segmented brand="mybky" ariaLabel="MyBKY" [options]="options" [(ngModel)]="b"></baps-segmented>
      </div>
    `,
  }),
};

/** Whole-group disabled. */
export const Disabled: StoryObj<BapsSegmented> = {
  render: () => ({
    props: { options: ['Once', 'Repeat', 'Ad-hoc'], frequency: 'Once' },
    template: `
      <div style="width:344px">
        <baps-segmented
          ariaLabel="Frequency"
          disabled="true"
          [options]="options"
          [(ngModel)]="frequency"
        ></baps-segmented>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Selecting a segment moves the selection and writes the model.
 *
 * The rendered text below the control is the model, so asserting on it proves
 * the CVA wrote back — not just that a pill changed colour.
 */
export const SelectionInteraction: StoryObj<BapsSegmented> = {
  name: 'Interaction — select a segment',
  render: () => ({
    props: { options: ['Once', 'Repeat', 'Ad-hoc'], frequency: 'Once' },
    template: `
      <div style="width:344px">
        <baps-segmented
          ariaLabel="Frequency"
          [options]="options"
          [(ngModel)]="frequency"
        ></baps-segmented>
      </div>
      <p style="font:14px Inter; margin-top:12px">Selected: {{ frequency }}</p>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Selected: Once')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Repeat' }));
    await waitFor(() => expect(canvas.getByText('Selected: Repeat')).toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: 'Ad-hoc' }));
    await waitFor(() => expect(canvas.getByText('Selected: Ad-hoc')).toBeInTheDocument());
  },
};
