import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsAvatar } from './avatar.component';
import { BapsAvatarGroup } from './avatar-group.component';

/**
 * The icon content mode: Lucide-style inline SVG, projected — not a
 * PrimeIcons class string. See the icon-slot doc on `BapsAvatar`. Shared
 * across stories below rather than repeated per usage.
 */
const USER_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
`;

/**
 * Avatar — represents a user or entity via image, initials, or icon. Avatar
 * uses the `BapsAvatar` wrapper component.
 */
const meta: Meta<BapsAvatar> = {
  title: 'Components/Atoms/Avatar',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-media-avatar.
  id: 'components-avatar',
  parameters: {
    // Design tab — the Figma frame this component implements.
    // Harvested from avatar.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/🟢-Sampark-Portal?node-id=13197-90187' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsAvatar,
  decorators: [moduleMetadata({ imports: [BapsAvatar, BapsAvatarGroup] })],
  argTypes: {
    label: { control: 'text' },
    image: { control: 'text' },
    shape: { control: 'radio', options: ['circle', 'square'] },
    size: { control: 'select', options: ['xs', 's', 'm', 'l', 'xl', '2xl'] },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
    statusDot: { control: 'boolean' },
    iconBadge: { control: 'boolean' },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
  },
  args: {
    styleClass: '',
    style: {},
    label: 'AT',
    shape: 'circle',
    size: 'm',
    variant: 'primary',
    statusDot: false,
    iconBadge: false,
  },
  // `icon` isn't a component @Input (see the class doc) — it's projected
  // content, so the Playground can't offer it as a text control. `label` and
  // `image` still cover the other two content modes; see the Types story
  // below for the icon-content example.
  render: (args) => ({
    props: args,
    template: `<baps-avatar
      [label]="label"
      [image]="image"
      [shape]="shape"
      [size]="size"
      [variant]="variant"
      [statusDot]="statusDot"
      [iconBadge]="iconBadge"
      [brand]="brand"
    />`,
  }),
};

export default meta;
type Story = StoryObj<BapsAvatar>;

export const Playground: Story = {};

/**
 * The three content modes: initials (label), icon, and image. MyBKY's default
 * avatar background is blue.50 with blue.800 text (set in the preset), so
 * initials read as a subtle branded chip rather than PrimeNG's grey default.
 */
export const Types: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 16px; align-items: center;">
        <baps-avatar label="AT" shape="circle" />
        <baps-avatar shape="circle">${USER_ICON_SVG}</baps-avatar>
        <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
      </div>
    `,
  }),
};

/**
 * All 6 Figma sizes (xs 24 / s 32 / m 36 / l 48 / xl 60 / 2xl 80px) are
 * first-class on the `size` input. m/l/xl ride PrimeNG's own size steps
 * (token-driven via the preset); xs, s and 2xl are host-class CSS rules in
 * the wrapper fed by the same avatar.*.size tokens. PrimeNG's
 * normal/large/xlarge names still work as aliases for m/l/xl.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 16px; align-items: center;">
        <baps-avatar label="XS" shape="circle" size="xs" />
        <baps-avatar label="S" shape="circle" size="s" />
        <baps-avatar label="M" shape="circle" />
        <baps-avatar label="L" shape="circle" size="l" />
        <baps-avatar label="XL" shape="circle" size="xl" />
        <baps-avatar label="2X" shape="circle" size="2xl" />
      </div>
    `,
  }),
};

/**
 * Sampark Portal avatar set — Figma node 13197:90187
 * (https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/🟢-Sampark-Portal?node-id=13197-90187),
 * mirrored 1:1 in spm-ui's _avatar.scss. Bordered squares (1px, 1.5px from
 * L up; radius 4px, xl 6px, 2xl 8px) with mono.80 initials in three types:
 * primary (maroon-tinted), secondary (grey), warning (amber). Hovering
 * darkens only the border. Applied per-instance via `brand="sampark"`
 * scoped tokens — the global preset stays MyBKY.
 */
export const SamparkVariants: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    props: { icon: USER_ICON_SVG },
    template: `
      <div style="display:grid; grid-template-columns:repeat(4, max-content); gap:20px 28px; align-items:center;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" label="GP" />
          <code style="font-size:11px;">Initial Primary</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" label="GP" variant="secondary" />
          <code style="font-size:11px;">Initial Secondary</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark">${USER_ICON_SVG}</baps-avatar>
          <code style="font-size:11px;">Icon Primary</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" variant="secondary">${USER_ICON_SVG}</baps-avatar>
          <code style="font-size:11px;">Icon Secondary</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" variant="success">${USER_ICON_SVG}</baps-avatar>
          <code style="font-size:11px;">Icon Success</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" variant="error">${USER_ICON_SVG}</baps-avatar>
          <code style="font-size:11px;">Icon Error</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" />
          <code style="font-size:11px;">Image</code>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <baps-avatar brand="sampark" label="GP" variant="warning" />
          <code style="font-size:11px; color:#9f9c9c;">warning*</code>
        </div>
      </div>
    `,
  }),
};

/**
 * All 6 sizes under the Sampark skin. Initials scale 12/14/14/16/20/36px —
 * every step is Inter 500 except 2xl, which drops to 400. Icon slots are
 * fixed per size (18/20/24/32/36/48px); images are contained to the slot,
 * matching spm-ui's pictogram-style image avatars.
 */
export const SamparkSizes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 16px; align-items: center;">
        <baps-avatar brand="sampark" label="XS" size="xs" />
        <baps-avatar brand="sampark" label="S" size="s" />
        <baps-avatar brand="sampark" label="GP" />
        <baps-avatar brand="sampark" label="GP" size="l" />
        <baps-avatar brand="sampark" label="GP" size="xl" />
        <baps-avatar brand="sampark" label="GP" size="2xl" />
      </div>
    `,
  }),
};

/**
 * Status dot (green, top-right) and icon badge (blue, bottom-right) — the
 * Figma set's indicator variants, sized per avatar step with a white ring.
 * Sampark-only add-ons; MyBKY anchors counts/status with baps-overlaybadge.
 */
export const SamparkIndicators: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 16px; align-items: center;">
        <baps-avatar brand="sampark" label="GP" size="xs" [statusDot]="true" />
        <baps-avatar brand="sampark" label="GP" [statusDot]="true" />
        <baps-avatar brand="sampark" label="GP" [iconBadge]="true" />
        <baps-avatar brand="sampark" label="GP" [statusDot]="true" [iconBadge]="true" />
        <baps-avatar brand="sampark" label="GP" size="xl" [statusDot]="true" [iconBadge]="true" />
      </div>
    `,
  }),
};

/**
 * Shape contrast: MyBKY circles vs the square shape Sampark uses. Both are
 * available on the same component via the `shape` input — the brand default
 * (circle) is what MyBKY ships.
 */
export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 16px; align-items: center;">
        <baps-avatar label="AT" shape="circle" size="large" />
        <baps-avatar label="AT" shape="square" size="large" />
      </div>
    `,
  }),
};

/** Stacked avatars for compact multi-user contexts (attendees, assignees). */
export const Group: Story = {
  render: () => ({
    template: `
      <baps-avatargroup size="m">
        <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
        <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" shape="circle" />
        <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" shape="circle" />
        <baps-avatar label="+3" shape="circle" />
      </baps-avatargroup>
    `,
  }),
};

/**
 * Every status the MyBKY sheet defines (22465:97983), crossed with the three
 * content modes. This axis previously did nothing on MyBKY — the class was
 * set on the host but only the Sampark scope styled it, so every MyBKY avatar
 * rendered the same blue whatever `variant` said.
 */
export const MyBkyStatuses: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:14px;">
        @for (row of rows; track row.content) {
          <div style="display:flex; gap:16px; align-items:center;">
            <code style="font-size:11px; width:70px;">{{ row.content }}</code>
            @for (v of variants; track v) {
              @if (row.content === 'initial') {
                <baps-avatar [label]="'GP'" [variant]="v" size="l" />
              } @else if (row.content === 'icon') {
                <baps-avatar [variant]="v" size="l">${USER_ICON_SVG}</baps-avatar>
              } @else {
                <baps-avatar [variant]="v" size="l" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" />
              }
            }
          </div>
        }
        <div style="display:flex; gap:16px; align-items:center;">
          <code style="font-size:11px; width:70px;"></code>
          @for (v of variants; track v) {
            <code style="font-size:10px; width:48px; text-align:center; color:#6f777d;">{{ v }}</code>
          }
        </div>
      </div>
    `,
    props: {
      variants: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
      rows: [{ content: 'initial' }, { content: 'icon' }, { content: 'image' }],
    },
  }),
};

/**
 * The group at all six sizes, as the Sampark sheet draws it (13197:90488):
 * square avatars, initials, and a +N box closing the row.
 *
 * The overlap is a per-size constant, not a ratio — 6/24 and 12/48 are a
 * quarter, 10/32 and 10/36 are not. `size` on the group sets it; the same
 * value has to go on each child, because the group never instantiates the
 * avatars it lays out.
 */
export const GroupSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:20px; align-items:flex-start;">
        @for (s of sizes; track s) {
          <div style="display:flex; align-items:center; gap:16px;">
            <code style="font-size:11px; width:34px;">{{ s }}</code>
            <baps-avatargroup [size]="s">
              <baps-avatar [size]="s" shape="square" label="RW" />
              <baps-avatar [size]="s" shape="square" label="SP" />
              <baps-avatar [size]="s" shape="square" label="DG" />
              <baps-avatar [size]="s" shape="square" label="GD" />
              <baps-avatar [size]="s" shape="square" label="+2" />
            </baps-avatargroup>
          </div>
        }
      </div>
    `,
    props: { sizes: ['xs', 's', 'm', 'l', 'xl', '2xl'] },
  }),
};
