import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { BapsChip } from './chip.component';

/**
 * baps-chip — a compact label for a selected value, a filter, or an entity.
 *
 * This is the same visual object a multiselect renders for each selection, so
 * both read from the grey (no-severity) tag tokens. Flip the toolbar's Design
 * System switch to compare: MyBKY is a 99px pill at 12px/500, Sampark a 4px
 * rounded rect at 13px/400.
 */
const meta: Meta<BapsChip> = {
  title: 'Components/Atoms/Chip',
  id: 'components-chip',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsChip,
  decorators: [
    moduleMetadata({
      imports: [BapsChip],
    }),
  ],
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/yY5bmcEifXbcCwhauoiy6Y/?node-id=22465-95582' },
  },
  argTypes: {
    label: { control: 'text' },
    imageError: { control: false },
    remove: { control: false },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    icon: { control: 'text' },
    disabled: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
  args: {
    styleClass: '',
    label: 'Robbinsville',
    icon: undefined,
    image: undefined,
    alt: undefined,
    disabled: false,
    removable: false,
    removeIcon: undefined,
    brand: 'mybky',
  },
  render: (args) => ({
    props: { ...args },
    template: `<baps-chip
      [label]="label"
      [icon]="icon"
      [image]="image"
      [alt]="alt"
      [removable]="removable"
      [removeIcon]="removeIcon"
      [disabled]="disabled"
      [brand]="brand"
      [styleClass]="styleClass"
    ></baps-chip>`,
  }),
};

export default meta;
type Story = StoryObj<BapsChip>;

export const Default: Story = {};

/** With a leading icon. */
export const WithIcon: Story = {
  render: () => ({
    template: `
      <baps-chip icon="pi pi-users" label="Satsang Network"></baps-chip>
    `,
  }),
};

/**
 * Chip with a remove control. The control is only revealed on hover so a list
 * of chips is not littered with crosses. (Hover the chips below to see it).
 */
export const Removable: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:0.5rem; align-items:center">
        <baps-chip label="Hover me" [removable]="true"></baps-chip>
        <baps-chip icon="pi pi-users" label="Satsang Network" [removable]="true"></baps-chip>
        <baps-chip image="https://primefaces.org/cdn/primeng/images/avatar/amyelsner.png" label="Amy Elsner" [removable]="true"></baps-chip>
      </div>
    `,
  }),
};

/**
 * A group of chips. Because they are display:inline-flex, they can just be
 * thrown into a flex container with gap and wrap.
 */
export const Group: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap">
        <baps-chip label="BAPS"></baps-chip>
        <baps-chip label="Design System"></baps-chip>
        <baps-chip label="Satsang Network"></baps-chip>
        <baps-chip label="Robbinsville"></baps-chip>
        <baps-chip label="Akshardham"></baps-chip>
      </div>
    `,
  }),
};

/**
 * Both brands side by side, for comparing them in one view. The story renders
 * MyBKY and Sampark itself, so it is tagged `ds:comparison` and stays hidden
 * until the toolbar's Comparison toggle is on — a story showing two brands at
 * once would otherwise appear under each single brand.
 */
export const Brands: Story = {
  tags: ['ds:comparison'],
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1.25rem">
        <div style="display:flex; gap:0.5rem; align-items:center">
          <span style="font:500 12px system-ui; opacity:.6; width:60px">MyBKY</span>
          <baps-chip label="Robbinsvile" [removable]="true" brand="mybky"></baps-chip>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center">
          <span style="font:500 12px system-ui; opacity:.6; width:60px">Sampark</span>
          <baps-chip label="Robbinsvile" [removable]="true" brand="sampark"></baps-chip>
        </div>
      </div>
    `,
  }),
};
