import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { moduleMetadata } from '@storybook/angular';
import { BapsTag } from './tag.component';

/**
 * Tag — a labelled status/category chip. Tag uses the `BapsTag` wrapper component.
 */
/** The component's inputs plus the output spies these stories bind. */
type Args = BapsTag & Record<'onActionClick', (event?: unknown) => void>;

const meta: Meta<Args> = {
  title: 'Components/Atoms/Tag',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-misc-tag.
  id: 'components-tag',
  parameters: {
    // Design tab — the Figma frame this component implements, node 22465:95582.
    // Harvested from tag.component.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/yY5bmcEifXbcCwhauoiy6Y/?node-id=22465-95582' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts.
  // Sampark renders spm-ui's "Badge" spec (_badge.scss) via _tag-sampark.scss:
  // 4px radius, 20/22/28px boxes, m = s (spm-ui md is the same 22px box).
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsTag,
  decorators: [moduleMetadata({ imports: [BapsTag] })],
  argTypes: {
    actionClick: { control: false },
    value: { control: 'text' },
    severity: {
      control: 'select',
      options: [undefined, 'secondary', 'success', 'info', 'warn', 'danger', 'contrast'],
    },
    size: { control: 'select', options: ['xs', 's', 'm', 'l'] },
    icon: { control: 'text' },
    chevron: { control: 'boolean' },
    action: { control: 'boolean' },
    disabled: { control: 'boolean' },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
  },
  args: {
    styleClass: '',
    style: {},
    rounded: false,
    value: 'Registered',
    severity: undefined,
    size: 's',
    icon: undefined,
    chevron: false,
    action: false,
    disabled: false,
  },
  render: (args) => ({
    props: { ...args, onActionClick: action('actionClick') },
    template: `<baps-tag
      [value]="value"
      [severity]="severity"
      [size]="size"
      [icon]="icon"
      [chevron]="chevron"
      [action]="action"
      [disabled]="disabled"
      [brand]="brand"
      (actionClick)="onActionClick($event)"
    />`,
  }),
};

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

/**
 * Variant mapping follows events-ui's _badge.scss: the unqualified tag is
 * Figma's GREY chip, and Figma's navy "Primary" chip maps to
 * `severity="contrast"` (PrimeNG's default severity slot is taken by grey).
 */
export const Severities: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-tag value="Grey" />
        <baps-tag value="Primary" severity="contrast" />
        <baps-tag value="Secondary" severity="secondary" />
        <baps-tag value="Info" severity="info" />
        <baps-tag value="Warning" severity="warn" />
        <baps-tag value="Error" severity="danger" />
        <baps-tag value="Success" severity="success" />
        <baps-tag value="Disabled" [disabled]="true" />
      </div>
    `,
  }),
};

/**
 * Figma sizes: xs 18px / s 22px (default) / m 26px / l 32px. Only height,
 * padding and font size change — the pill radius and 1px border are constant.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-tag value="Extra small" size="xs" />
        <baps-tag value="Small" />
        <baps-tag value="Medium" size="m" />
        <baps-tag value="Large" size="l" />
      </div>
    `,
  }),
};

/**
 * Sampark "Badge" (spm-ui _badge.scss): same variant crossover as MyBKY, at
 * Sampark hues — BG = variant/10-20, border = base @ 20%, hover border and
 * text = variant/80-100. Applied per-instance via `brand="sampark"` or
 * page-wide via the Design system toolbar.
 */
export const SamparkSeverities: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-tag brand="sampark" value="Grey" />
        <baps-tag brand="sampark" value="Primary" severity="contrast" />
        <baps-tag brand="sampark" value="Secondary" severity="secondary" />
        <baps-tag brand="sampark" value="Info" severity="info" />
        <baps-tag brand="sampark" value="Warning" severity="warn" />
        <baps-tag brand="sampark" value="Error" severity="danger" />
        <baps-tag brand="sampark" value="Success" severity="success" />
        <baps-tag brand="sampark" value="Disabled" [disabled]="true" />
      </div>
    `,
  }),
};

/**
 * Sampark boxes: xs 20px / s 22px / m = s (spm-ui md is the same box) /
 * l 28px with 6px radius and a 16px icon. 4px radius — never pill.
 */
export const SamparkSizes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-tag brand="sampark" value="Extra small" size="xs" />
        <baps-tag brand="sampark" value="Small" />
        <baps-tag brand="sampark" value="Medium" size="m" />
        <baps-tag brand="sampark" value="Large" size="l" icon="pi pi-clock" />
      </div>
    `,
  }),
};

/**
 * Figma's `Chevron` axis — a decorative disclosure caret after the label
 * (8px at xs, 10px at s, 12px at l). Not interactive and not announced.
 */
export const Chevron: Story = {
  // Mixed brands in one row: most tags follow the toolbar, one or two are pinned
  // to Sampark as a sample — and on Chevron and TrailingAction that sample is
  // LABELLED "Sampark". Unpinning them would render a tag that says Sampark in
  // the MyBKY skin, so the pins stay and the story is declared a comparison
  // instead: hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-tag value="Extra small" size="xs" [chevron]="true" />
        <baps-tag value="Small" [chevron]="true" />
        <baps-tag value="Large" size="l" [chevron]="true" />
        <baps-tag value="With icon" severity="info" icon="pi pi-user" [chevron]="true" />
        <baps-tag value="Disabled" [chevron]="true" [disabled]="true" />
        <baps-tag brand="sampark" value="Sampark" severity="success" [chevron]="true" />
      </div>
    `,
  }),
};

/**
 * Figma's `Trailing Action` axis. A real `<button>` with its own hover plate
 * (Figma keeps the plate at `opacity: 0` until hover) and an `actionClick`
 * output — not a decorative glyph.
 *
 * Figma names this frame "Badge Hover Action" and draws a diagonal arrow, not
 * a cross, so the API is `action` rather than `removable` and the default
 * glyph is `pi-arrow-up-right`. Use it for whatever the chip actually does.
 *
 * `actionLabel` has no default on purpose: the button has no text, so without
 * one it is announced as nothing. Every example below sets it.
 */
export const TrailingAction: Story = {
  // Mixed brands in one row: most tags follow the toolbar, one or two are pinned
  // to Sampark as a sample — and on Chevron and TrailingAction that sample is
  // LABELLED "Sampark". Unpinning them would render a tag that says Sampark in
  // the MyBKY skin, so the pins stay and the story is declared a comparison
  // instead: hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { onAction: (event: MouseEvent) => console.log('action', event) },
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-tag value="Extra small" size="xs" [action]="true" actionLabel="Open Extra small" (actionClick)="onAction($event)" />
        <baps-tag value="Small" [action]="true" actionLabel="Open Small" (actionClick)="onAction($event)" />
        <baps-tag value="Large" size="l" [action]="true" actionLabel="Open Large" (actionClick)="onAction($event)" />
        <baps-tag value="Filter" severity="contrast" icon="pi pi-filter" [action]="true" actionIcon="pi pi-times" actionLabel="Remove filter" />
        <baps-tag value="Disabled" [action]="true" actionLabel="Open Disabled" [disabled]="true" />
        <baps-tag brand="sampark" value="Sampark" severity="danger" [action]="true" actionLabel="Open Sampark" />
      </div>
    `,
  }),
};

/**
 * Figma's `Text=False` column: a square icon box (20 / 22 / 28), not a chip
 * collapsed to its icon. Chevron-only and icon + chevron grow past the square.
 */
export const IconOnly: Story = {
  // Mixed brands in one row: most tags follow the toolbar, one or two are pinned
  // to Sampark as a sample — and on Chevron and TrailingAction that sample is
  // LABELLED "Sampark". Unpinning them would render a tag that says Sampark in
  // the MyBKY skin, so the pins stay and the story is declared a comparison
  // instead: hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-tag icon="pi pi-user" size="xs" />
        <baps-tag icon="pi pi-user" />
        <baps-tag icon="pi pi-user" size="l" />
        <baps-tag icon="pi pi-user" [chevron]="true" />
        <baps-tag brand="sampark" icon="pi pi-user" />
        <baps-tag brand="sampark" icon="pi pi-user" size="l" />
      </div>
    `,
  }),
};

/**
 * Leading icon via PrimeNG's `icon` input — inherits the label's color and
 * font size at every step.
 */
export const WithIcon: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-tag value="Verified" severity="success" icon="pi pi-check" size="m" />
        <baps-tag value="Pending" severity="warn" icon="pi pi-clock" size="m" />
        <baps-tag value="Rejected" severity="danger" icon="pi pi-times" size="m" />
      </div>
    `,
  }),
};
