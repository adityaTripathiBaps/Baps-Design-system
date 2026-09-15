import type { Meta, StoryObj } from '@storybook/angular';
import { BapsBreadcrumb } from './breadcrumb.component';

const meta: Meta<BapsBreadcrumb> = {
  title: 'Components/Navigation/Breadcrumb',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-menu-breadcrumb.
  id: 'components-breadcrumb',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    styleClass: { control: 'text' },
  },
  component: BapsBreadcrumb,
  render: (args) => ({
    props: args,
    template: `
      <baps-breadcrumb [model]="model" [brand]="brand"></baps-breadcrumb>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsBreadcrumb> = {
  args: {
    // Four levels, because a breadcrumb with one item shows none of what the
    // component does: the separators, the muted colour on the ancestors and the
    // bold weight on the current page all only appear in a chain. Restored from
    // the pre-existing visual baseline, which renders exactly this trail.
    model: [
      { label: 'Electronics' },
      { label: 'Computers' },
      { label: 'Accessories' },
      { label: 'Keyboards' },
    ],
  },
};
