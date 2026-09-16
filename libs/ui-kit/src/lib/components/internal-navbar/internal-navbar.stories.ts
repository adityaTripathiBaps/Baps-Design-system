import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { BapsInternalNavbar, InternalNavItem } from './internal-navbar.component';

const meta: Meta<BapsInternalNavbar> = {
  title: 'Components/Organisms/Internal Navbar',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-menu-internalnavbar.
  id: 'components-internalnavbar',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    collapsed: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    itemClick: { control: false },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    collapsed: { control: 'boolean' },
    activeItem: { control: 'text' },
    title: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:89998.
    // Harvested from internal-navbar.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-89998' },
  },
  component: BapsInternalNavbar,
  render: (args) => ({
    props: { ...args, onItemClick: action('itemClick') },
    template: `
      <baps-internal-navbar [brand]="brand"
        (itemClick)="onItemClick($event)">
        <a href="#" class="active">Overview</a>
        <a href="#">Settings</a>
        <a href="#">Members</a>
      </baps-internal-navbar>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsInternalNavbar> = {};

const RAIL_ITEMS: InternalNavItem[] = [
  { label: 'Dashboard', icon: 'pi-th-large' },
  { label: 'Reports', icon: 'pi-chart-bar', notification: true },
  { label: 'Settings', icon: 'pi-cog' },
];

/**
 * Sampark icon rail — Figma "Web Nav Bar" component set (node 13197:89998):
 * dark 72px tiles, icon over label. "Settings" is selected to show the
 * Secondary/60 fill + drop shadow; "Reports" carries the status dot.
 * Hover (Secondary/80) is only visible on pointer-hover in the live story.
 */
export const SamparkRail: StoryObj<BapsInternalNavbar> = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    props: { items: RAIL_ITEMS },
    template: `
      <baps-internal-navbar brand="sampark" [collapsed]="true" [items]="items" activeItem="Settings">
      </baps-internal-navbar>
    `,
  }),
};

const NESTED_ITEMS: InternalNavItem[] = [
  { label: 'Dashboard', icon: 'pi-th-large' },
  {
    label: 'Events',
    icon: 'pi-calendar',
    children: [
      {
        label: 'Seminars',
        children: [
          {
            label: 'Regional',
            children: [{ label: 'North Zone' }, { label: 'South Zone' }],
          },
          { label: 'National' },
        ],
      },
      { label: 'Workshops', badge: 4 },
    ],
  },
  { label: 'Members', icon: 'pi-users', children: [{ label: 'Karyakars' }, { label: 'Volunteers' }] },
  { separator: true, label: 'sep-1' },
  { label: 'Settings', icon: 'pi-cog' },
];

/**
 * Nested menu — Figma "♻️ Base Internal Menu Levels" (13197:94022) and the
 * Hierarchy dimension of "Internal Menu Item" (13197:93289).
 *
 * Click a parent to expand it: 18px of extra indent per level, chevron right
 * when closed (Hierarchy Default) and down when open (Hierarchy Open). Leaf
 * rows keep an empty chevron slot so labels stay aligned with their siblings.
 * Expand Events > Seminars > Regional to reach level 3 (72px indent).
 *
 * Nothing here is opt-in: nesting activates purely from `children` being
 * present, and a flat `items` array renders exactly as it always has.
 */
export const Nested: StoryObj<BapsInternalNavbar> = {
  render: () => ({
    props: { items: NESTED_ITEMS },
    template: `
      <baps-internal-navbar [items]="items" activeItem="Dashboard" title="Navigation">
      </baps-internal-navbar>
    `,
  }),
};
