import type { Meta, StoryObj } from '@storybook/angular';
import { BapsPriority } from './priority.component';

const meta: Meta<BapsPriority> = {
  title: 'Components/Atoms/Priority',
  id: 'components-priority',
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/PKHWEQTVUKl6FAeQSIkXMW/?node-id=5959-99251',
    },
  },
  component: BapsPriority,
  args: { level: 'high', interactive: false },
  argTypes: {
    level: { control: 'inline-radio', options: ['high', 'medium', 'low', 'none'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
  },
  render: (args) => ({
    props: args,
    template: `<baps-priority [level]="level" [interactive]="interactive" [brand]="brand" />`,
  }),
};

export default meta;
type Story = StoryObj<BapsPriority>;

export const Playground: Story = {};

/**
 * Figma's two rows: the four levels at rest, and the same four with
 * `interactive` set. Hover the bottom row to see the filled square.
 */
export const Levels: Story = {
  render: () => ({
    props: { levels: ['high', 'medium', 'low', 'none'] },
    template: `
      <div style="display:grid; grid-template-columns:repeat(4, 1.5rem); gap:1.25rem;">
        @for (l of levels; track l) { <baps-priority [level]="l" /> }
        @for (l of levels; track l) { <baps-priority [level]="l" [interactive]="true" /> }
      </div>
    `,
  }),
};
