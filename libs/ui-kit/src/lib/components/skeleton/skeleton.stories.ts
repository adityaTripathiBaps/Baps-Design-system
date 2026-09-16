import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsSkeleton } from './skeleton.component';

/**
 * Skeleton — a placeholder block shown while real content loads.
 *
 * Colours are shared between brands on purpose: a skeleton is a neutral
 * surface, not a branded one, and tinting it makes a loading state read as
 * content. Only the corner differs (MyBKY 6px, Sampark 4px), and a circle
 * ignores both.
 *
 * ACCESSIBILITY: the component is `aria-hidden`. Announcing a dozen empty
 * boxes tells a screen-reader user nothing — put `aria-busy="true"` on the
 * region that is loading and announce the real content when it arrives. That
 * is the part that actually helps, and no placeholder can do it for you.
 */
const meta: Meta<BapsSkeleton> = {
  title: 'Components/Atoms/Skeleton',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-skeleton',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsSkeleton,
  decorators: [moduleMetadata({ imports: [BapsSkeleton] })],
  argTypes: {
    shape: { control: 'inline-radio', options: ['rectangle', 'circle'] },
    animation: { control: 'inline-radio', options: ['wave', 'none'] },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
  },
  args: { width: '12rem', height: '1rem' },
};

export default meta;
type Story = StoryObj<BapsSkeleton>;

export const Default: Story = {};

/** `size` sets width and height together — the usual way to get a circle. */
export const Circle: Story = {
  args: { shape: 'circle', size: '3rem', width: '', height: '' },
};

/**
 * `animation="none"` holds a static block. Worth using where several
 * skeletons sit together and the combined shimmer becomes the loudest thing
 * on the page.
 *
 * The wave also stops on its own under `prefers-reduced-motion` — a repeating
 * sweep is exactly the motion that setting exists to suppress.
 */
export const Static: Story = {
  args: { animation: 'none' },
};

/** A realistic loading row: avatar plus two lines of text. */
export const ListItem: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:0.75rem; align-items:center; width:22rem">
        <baps-skeleton shape="circle" size="2.5rem" [brand]="brand" />
        <div style="flex:1; display:flex; flex-direction:column; gap:0.5rem">
          <baps-skeleton width="60%" height="0.875rem" [brand]="brand" />
          <baps-skeleton width="90%" height="0.75rem" [brand]="brand" />
        </div>
      </div>
    `,
  }),
};

/** A card placeholder — the shape a chart tile takes before its data lands. */
export const Card: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="width:20rem; padding:1.5rem; border:1px solid #e4ecf1; border-radius:0.75rem; display:flex; flex-direction:column; gap:1rem">
        <baps-skeleton width="40%" height="0.875rem" [brand]="brand" />
        <baps-skeleton width="100%" height="8rem" [brand]="brand" />
      </div>
    `,
  }),
};
