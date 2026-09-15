import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { BapsInputGroup } from './input-group.component';

/**
 * InputGroup — Sampark Portal. One bordered field split into segments by text
 * addons: the Min / Max / Day / Week / Time instances in nodes 17512:77924,
 * 17512:82910, 17512:82727, 17512:78163 and 17512:78134.
 *
 * Distinct from baps-iconfield, which overlays an icon INSIDE the field with
 * no reserved column and no divider.
 */
const meta: Meta<BapsInputGroup> = {
  title: 'Components/Form/InputGroup',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-inputgroup.
  id: 'components-inputgroup',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:77924.
    // Harvested from input-group.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-77924' },
  },
  component: BapsInputGroup,
  decorators: [moduleMetadata({ imports: [FormsModule, InputText] })],
};

export default meta;

/** The Min field from node 17512:82916 — both addons, 168px wide. */
export const Default: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { days: 15 },
    template: `
      <div style="width:168px">
        <baps-input-group prefix="min" suffix="day/s">
          <input pInputText type="number" aria-label="Minimum days" [(ngModel)]="days" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** Trailing addon only — the Week and Time instances (node 17512:78172). */
export const SuffixOnly: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { weeks: 2 },
    template: `
      <div style="width:168px">
        <baps-input-group suffix="week/s">
          <input pInputText type="number" aria-label="Weeks" [(ngModel)]="weeks" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** The full Min / Max row from node 17512:82912. */
export const MinMaxRow: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { min: 1, max: 3 },
    template: `
      <div style="display:flex; gap:8px; align-items:center; width:476px">
        <span style="font:500 14px Inter; color:#595656; width:120px">For</span>
        <baps-input-group prefix="min" suffix="day/s" style="flex:1">
          <input pInputText type="number" aria-label="Minimum days" [(ngModel)]="min" />
        </baps-input-group>
        <baps-input-group prefix="max" suffix="day/s" style="flex:1">
          <input pInputText type="number" aria-label="Maximum days" [(ngModel)]="max" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** Both skins. */
export const Brands: StoryObj<BapsInputGroup> = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { a: 15, b: 15 },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; width:168px">
        <baps-input-group brand="sampark" prefix="min" suffix="day/s">
          <input pInputText type="number" aria-label="Sampark days" [(ngModel)]="a" />
        </baps-input-group>
        <baps-input-group brand="mybky" prefix="min" suffix="day/s">
          <input pInputText type="number" aria-label="MyBKY days" [(ngModel)]="b" />
        </baps-input-group>
      </div>
    `,
  }),
};
