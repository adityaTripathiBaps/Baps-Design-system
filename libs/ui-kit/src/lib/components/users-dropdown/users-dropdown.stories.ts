import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { BapsUsersDropdown, BapsUserOption } from './users-dropdown.component';

/**
 * Users Dropdown — Sampark Portal (Figma node 13197-89016).
 * A select-style dropdown: a trigger field (same field language as the FormField
 * Sampark dropdowns) that opens a floating panel — search + scrollable list of
 * user rows (baps-menu-item, avatar + name/role).
 */
const USERS: BapsUserOption[] = [
  { value: 1, title: 'Ghanshyam Pandey', subtitle: 'Nation Leader', avatarLabel: 'GP' },
  { value: 2, title: 'Ramesh Iyer', subtitle: 'Regional Coordinator', avatarLabel: 'RI' },
  { value: 3, title: 'Anjali Shah', subtitle: 'Volunteer Lead', avatarLabel: 'AS' },
  { value: 4, title: 'Mahesh Patel', subtitle: 'Zone Head', avatarLabel: 'MP' },
  { value: 5, title: 'Support Desk', subtitle: 'support@sampark.org', avatarIcon: 'pi-envelope' },
  { value: 6, title: 'Nilesh Trivedi', subtitle: 'Center Admin', avatarLabel: 'NT' },
  { value: 7, title: 'Priya Desai', subtitle: 'Seva Coordinator', avatarLabel: 'PD' },
  { value: 8, title: 'Karan Mehta', subtitle: 'Youth Wing', avatarLabel: 'KM' },
];

/**
 * The story harness, parameterised on canvas height.
 *
 * The height matters more than it looks. `.ud__panel` is `position: absolute`,
 * so it does not grow `#storybook-root` — and `#storybook-root` is exactly what
 * the visual baseline screenshots. Anything past the wrapper is CROPPED out of
 * the baseline rather than merely scrolled off, which is why `Groups` asks for a
 * taller one instead of relying on the default.
 */
const harness = (minHeight: string) => `
  <div style="min-height:${minHeight};">
    <baps-users-dropdown
      [users]="users"
      [placeholder]="placeholder"
      [searchPlaceholder]="searchPlaceholder"
      [maxHeight]="maxHeight"
      [disabled]="disabled"
      [open]="open"
      (valueChange)="valueChange($event)"
      (searchChange)="searchChange($event)"
    ></baps-users-dropdown>
  </div>
`;

const meta: Meta<BapsUsersDropdown> = {
  title: 'Components/Form/UsersDropdown',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-usersdropdown.
  id: 'components-usersdropdown',
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:88606.
    // Harvested from users-dropdown.component.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-88606' },
  },
  tags: ['ds:sampark'],
  component: BapsUsersDropdown,
  argTypes: {
    openChange: { control: false },
    searchChange: { control: false },
    valueChange: { control: false },
    valuesChange: { control: false },
    placeholder: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    maxHeight: { control: 'text' },
    disabled: { control: 'boolean' },
    open: { control: 'boolean' },
    value: { control: false },
    users: { control: false },
  },
  args: {
    placeholder: 'Select user',
    searchPlaceholder: 'Search',
    maxHeight: '320px',
    disabled: false,
    open: false,
    users: USERS,
  },
  render: (args) => ({ props: args, template: harness('460px') }),
};
export default meta;
type Story = StoryObj<BapsUsersDropdown>;

/** Interactive — click the trigger to open, search, and pick a user. */
export const Playground: Story = {};

/** The panel/list design, shown open (the Figma overlay frame). */
export const OpenPanel: Story = {
  args: { open: true },
};

/**
 * Grouped options — Figma "Users Dropdown" Group Counts 1/2/3
 * (13197-89016) and "♻️ Base User Item Group" (13197-88606). A `group` on
 * BapsUserOption buckets rows under an uppercase 12px header; options with no
 * `group` render header-less, so mixing grouped and ungrouped is fine.
 */
export const Groups: Story = {
  // Its own harness, taller than the default, and a `maxHeight` that clears the
  // whole list. Both are needed: `maxHeight` caps `.ud__list`, so at the default
  // 320px the last rows sit below a scroll fold, and the wrapper caps what the
  // baseline can see, so the panel has to fit inside it too. Without the pair,
  // the ungrouped row — the one carrying the note above — is never visible.
  render: (args) => ({ props: args, template: harness('700px') }),
  args: {
    maxHeight: '560px',
    open: true,
    // Group sizes 1 / 2 / 3, which is what the Figma frame's name says, plus one
    // ungrouped row at the end — a group with no label renders no header, so the
    // last row proves the "mixing grouped and ungrouped is fine" claim above.
    // Own list rather than `USERS`, because the values have to be contiguous
    // through to the ungrouped row.
    users: [
      { value: 1, title: 'Ghanshyam Pandey', subtitle: 'Nation Leader', avatarLabel: 'GP', group: 'Leadership' },
      { value: 2, title: 'Ramesh Iyer', subtitle: 'Regional Coordinator', avatarLabel: 'RI', group: 'Coordinators' },
      { value: 3, title: 'Nilesh Trivedi', subtitle: 'Center Admin', avatarLabel: 'NT', group: 'Coordinators' },
      { value: 4, title: 'Anjali Shah', subtitle: 'Volunteer Lead', avatarLabel: 'AS', group: 'Volunteers' },
      { value: 5, title: 'Priya Desai', subtitle: 'Seva Coordinator', avatarLabel: 'PD', group: 'Volunteers' },
      { value: 6, title: 'Karan Mehta', subtitle: 'Youth Wing', avatarLabel: 'KM', group: 'Volunteers' },
      { value: 7, title: 'Support Desk', subtitle: 'support@sampark.org', avatarIcon: 'pi-envelope' },
    ],
  },
};

/**
 * Multi-select — the Check row types in "♻️ Base User Item Group". Rows carry
 * baps-menu-item's existing `control="checkbox"`; the panel stays open while
 * ticking and the trigger reads "N selected". State flows through
 * `values` / `valuesChange`, not `value`.
 */
export const MultiSelect: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      users: USERS.map((u, i) => ({ ...u, group: i < 4 ? 'Leadership' : 'Volunteers' })),
      values: [1, 3],
    },
    template: `
      <div style="min-height:520px;">
        <baps-users-dropdown
          [users]="users"
          selectionMode="checkbox"
          [values]="values"
          [open]="true"
          (valuesChange)="values = $event"
        ></baps-users-dropdown>
      </div>
    `,
  }),
};

/**
 * Radio rows — the Radio row types in "♻️ Base User Item Group". Still
 * single-select through `value`, but shown with a radio and the panel stays
 * open, because a radio list is something you scan and revise before closing.
 */
export const RadioSelect: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { users: USERS, value: 2 },
    template: `
      <div style="min-height:520px;">
        <baps-users-dropdown
          [users]="users"
          selectionMode="radio"
          [value]="value"
          [open]="true"
          (valueChange)="value = $event"
        ></baps-users-dropdown>
      </div>
    `,
  }),
};

/** Preselected value + disabled trigger. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { users: USERS },
    template: `
      <div style="display:flex; gap:24px; flex-wrap:wrap;">
        <div>
          <div style="font:600 12px/1.3 Inter,sans-serif; text-transform:uppercase; letter-spacing:.06em; opacity:.6; margin-bottom:8px;">Selected</div>
          <baps-users-dropdown [users]="users" [value]="1"></baps-users-dropdown>
        </div>
        <div>
          <div style="font:600 12px/1.3 Inter,sans-serif; text-transform:uppercase; letter-spacing:.06em; opacity:.6; margin-bottom:8px;">Disabled</div>
          <baps-users-dropdown [users]="users" [value]="1" [disabled]="true"></baps-users-dropdown>
        </div>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/** Open the panel and confirm the people list is reachable. */
export const OpenPanelInteraction: Story = {
  name: 'Interaction — open the panel',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Select user/i }));

    // Measured: the panel is a role="listbox" whose people are role="menuitem"
    // (not "option"), grouped under role="group". Portaled to <body>.
    await waitFor(() => expect(page.getByRole('listbox')).toBeInTheDocument(), { timeout: 8000 });
    await expect(page.getAllByRole('menuitem').length).toBeGreaterThan(0);
  },
};
