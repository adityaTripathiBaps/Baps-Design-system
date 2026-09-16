import type { Meta, StoryObj } from '@storybook/angular';
import { BapsDivider } from './divider.component';

const meta: Meta<BapsDivider> = {
  title: 'Components/Atoms/Divider',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-panel-divider.
  id: 'components-divider',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    layout: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    type: { control: 'inline-radio', options: [undefined, 'solid', 'dashed', 'dotted'] },
    align: { control: 'select', options: [undefined, 'left', 'center', 'right', 'top', 'bottom'] },
    size: { control: 'inline-radio', options: [undefined, 'default', 'compact'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    styleClass: { control: 'text' },
  },
  component: BapsDivider,
  render: (args) => ({
    props: args,
    template: `
      <div>
        <p>Section 1</p>
        <baps-divider [layout]="layout" [align]="align" [brand]="brand">
          <b>Divider Text</b>
        </baps-divider>
        <p>Section 2</p>
      </div>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsDivider> = {
  args: {
    layout: 'horizontal',
    align: 'center'
  },
};

/**
 * `size="compact"` — the toolbar separator: a 1x16px rule with 8px either
 * side, between the clusters of a toolbar.
 *
 * PrimeNG's vertical divider is sized for separating BLOCKS: it takes its
 * height from the row and adds 1rem of block padding, so dropped between two
 * 32px buttons it draws a rule as tall as the toolbar. `compact` pins the
 * geometry the Sampark Portal frames inspect as `width: 1px; height: 16px`
 * with an 8px margin.
 */
export const ToolbarSeparator: StoryObj<BapsDivider> = {
  render: (args) => ({
    props: args,
    template: `
      <!-- Plain elements on purpose: this story is about the divider geometry
           between siblings, and pulling baps-button in would need a
           moduleMetadata the rest of this file does not have. -->
      <div style="display:flex; align-items:center; padding:1.5rem; background:#fff; border:1px solid #e1e0e0">
        <span style="height:2rem; line-height:2rem; padding:0 .75rem; border:1px solid #e1e0e0; border-radius:4px; font-size:.875rem; color:#9f9c9c">Search</span>
        <baps-divider layout="vertical" size="compact" [brand]="brand" />
        <span style="height:2rem; line-height:2rem; padding:0 .75rem; border-radius:4px; background:#c96868; color:#fff; font-size:.875rem">+ Create Project</span>
        <baps-divider layout="vertical" size="compact" [brand]="brand" />
        <span style="width:2rem; height:2rem; display:inline-flex; align-items:center; justify-content:center">&#9776;</span>
        <baps-divider layout="vertical" size="compact" [brand]="brand" />
        <span style="width:2rem; height:2rem; display:inline-flex; align-items:center; justify-content:center">&#8645;</span>
      </div>
    `,
  }),
};
