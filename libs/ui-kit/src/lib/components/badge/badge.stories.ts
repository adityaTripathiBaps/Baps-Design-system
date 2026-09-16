import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsBadge } from './badge.component';
import { BapsButton } from '../button/button.component';
import { BapsOverlayBadge } from './overlay-badge.component';

/**
 * Badge — a small count/status chip. Badge uses the `BapsBadge` wrapper component.
 */
const meta: Meta<BapsBadge> = {
  title: 'Components/Atoms/Badge',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-misc-badge.
  id: 'components-badge',
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsBadge,
  decorators: [moduleMetadata({ imports: [BapsBadge, BapsButton, BapsOverlayBadge] })],
  argTypes: {
    value: { control: 'text' },
    severity: {
      control: 'select',
      options: [undefined, 'secondary', 'success', 'info', 'warn', 'danger', 'contrast'],
    },
    badgeSize: { control: 'select', options: [undefined, 'small', 'large', 'xlarge'] },
    badgeDisabled: { control: 'boolean' },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
  },
  args: {
    styleClass: '',
    style: {},
    value: '8',
    severity: undefined,
    badgeSize: undefined,
    badgeDisabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<baps-badge
      [value]="value"
      [severity]="severity"
      [badgeSize]="badgeSize"
      [badgeDisabled]="badgeDisabled"
      [brand]="brand"
    />`,
  }),
};

export default meta;
type Story = StoryObj<BapsBadge>;

export const Playground: Story = {};

/**
 * Severities map to the semantic palettes already defined in the MyBky preset.
 * MyBKY does not formally define a "secondary" or "contrast" badge in Figma —
 * they inherit PrimeNG's defaults, retinted by the preset's mono palette.
 */
export const Severities: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-badge value="8" />
        <baps-badge value="8" severity="secondary" />
        <baps-badge value="8" severity="success" />
        <baps-badge value="8" severity="info" />
        <baps-badge value="8" severity="warn" />
        <baps-badge value="8" severity="danger" />
        <baps-badge value="8" severity="contrast" />
      </div>
    `,
  }),
};

/**
 * Figma defines 4 sizes (xs 18 / s 22 / m 26 / l 32px). PrimeNG's `badgeSize`
 * exposes small/(default)/large/xlarge — the default maps to Figma's S (22px),
 * `small` to xs (18px), `large` to l (32px). Figma's M (26px) has no PrimeNG
 * step and is a documented gap (see badge.mdx).
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-badge value="8" badgeSize="small" />
        <baps-badge value="8" />
        <baps-badge value="8" badgeSize="large" />
        <baps-badge value="8" badgeSize="xlarge" />
      </div>
    `,
  }),
};

/**
 * Sampark skin, per-instance, via `brand="sampark"` (scoped `dt`, no
 * page-wide design-system switch needed).
 *
 * The count pill: 100px radius and a 12/16/20/24px scale. It used to render
 * at 4px/20/22/28 — tag's numbers — because `badge.sampark` carried the tag
 * scale. p-tag is the status label, p-badge is the count.
 */
export const Sampark: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <baps-badge value="8" brand="sampark" />
        <baps-badge value="8" severity="success" brand="sampark" />
        <baps-badge value="8" severity="danger" brand="sampark" />
        <baps-badge value="8" badgeSize="small" brand="sampark" />
        <baps-badge value="8" badgeSize="large" brand="sampark" />
      </div>
    `,
  }),
};

/**
 * The three Sampark badge types. A separate axis from `severity`: `disable`
 * has no severity to map onto, and `badgeDisabled` is not it — that input
 * hides the badge rather than recolouring it.
 */
export const SamparkTypes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <baps-badge value="8" type="notification" brand="sampark" />
        <baps-badge value="8" type="counts" brand="sampark" />
        <baps-badge value="8" type="disable" brand="sampark" />
        <!-- Multi-character values lose PrimeNG's .p-badge-circle, so this is the
             one that actually exercises the 100px pill radius. -->
        <baps-badge value="99+" type="notification" brand="sampark" />
      </div>
      <div style="display:flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-top: 16px;">
        <baps-badge value="8" type="notification" badgeSize="small" brand="sampark" />
        <baps-badge value="8" type="notification" brand="sampark" />
        <baps-badge value="8" type="notification" badgeSize="large" brand="sampark" />
        <baps-badge value="8" type="notification" badgeSize="xlarge" brand="sampark" />
      </div>
    `,
  }),
};

/**
 * Dot badge (no value) for terse status indication, and the overlay badge
 * pattern anchored to another element (icon button / avatar).
 */
export const DotAndOverlay: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 24px; align-items: center;">
        <baps-badge severity="success" />
        <baps-badge severity="danger" />
        <baps-overlaybadge value="4" severity="danger">
          <baps-button icon="pi pi-bell" [rounded]="true" [text]="true" severity="secondary" ariaLabel="Notifications" />
        </baps-overlaybadge>
        <baps-overlaybadge severity="success">
          <baps-button icon="pi pi-envelope" [rounded]="true" [text]="true" severity="secondary" ariaLabel="Messages" />
        </baps-overlaybadge>
      </div>
    `,
  }),
};
