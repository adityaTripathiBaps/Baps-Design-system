import type { Meta, StoryObj } from '@storybook/angular';
import { BapsSpinner } from './spinner.component';

const meta: Meta<BapsSpinner> = {
  title: 'Components/Feedback/Spinner',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-misc-spinner.
  id: 'components-spinner',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:84149.
    // Harvested from spinner.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-84149' },
  },
  component: BapsSpinner,
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    size: { control: 'inline-radio', options: ['small', 'large'] },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
  },
};

export default meta;

/** No `value` — the spinning quarter arc. Figma 17512:84149. */
export const Indeterminate: StoryObj<BapsSpinner> = {
  args: { size: 'small' },
};

/** `value` set — the ring fills clockwise from 12 o'clock. Figma 17512:84516. */
export const Determinate: StoryObj<BapsSpinner> = {
  args: { value: 75 },
};

/** The six states Figma draws for the determinate loader. */
export const DeterminateSteps: StoryObj<BapsSpinner> = {
  args: {},
  render: (args) => ({
    props: { ...args, steps: [0, 25, 50, 75, 90, 100] },
    template: `
      <div style="display: flex; gap: 1.25rem; align-items: center; background: #333; padding: 1.25rem">
        @for (step of steps; track step) {
          <baps-spinner [value]="step" [brand]="brand"></baps-spinner>
        }
      </div>
    `,
  }),
};

/** Both size steps, both brands. */
export const Sizes: StoryObj<BapsSpinner> = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    template: `
      <div style="display: flex; gap: 1.25rem; align-items: center; background: #333; padding: 1.25rem">
        <baps-spinner size="small" brand="mybky"></baps-spinner>
        <baps-spinner size="large" brand="mybky"></baps-spinner>
        <baps-spinner size="small" brand="sampark"></baps-spinner>
        <baps-spinner size="large" brand="sampark"></baps-spinner>
      </div>
    `,
  }),
};
