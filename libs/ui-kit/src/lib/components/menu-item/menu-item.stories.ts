import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { BapsMenuItem } from './menu-item.component';

const meta: Meta = {
  title: 'Components/Molecules/Menu Item',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-molecules-menu-item.
  // No hyphen, matching components-tablecolumnconfig and components-usersdropdown.
  id: 'components-menuitem',
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-87722' },
  },
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [BapsMenuItem],
    }),
  ],
};

export default meta;
type Story = StoryObj;

export const MenuItemPlayground: Story = {
  name: 'Menu Item — Playground',
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    control: {
      control: 'inline-radio',
      options: ['none', 'checkbox', 'radio'],
    },
    media: { control: 'inline-radio', options: ['none', 'icon', 'avatar'] },
    icon: { control: 'text' },
    avatarLabel: { control: 'text' },
    avatarIcon: { control: 'text' },
    severity: { control: 'inline-radio', options: ['default', 'danger'] },
    checked: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    title: 'Option',
    control: 'none',
    media: 'none',
    severity: 'default',
    checked: false,
    selected: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div role="menu" style="width:300px; border:1px solid var(--color-sampark-border-default,#e1e0e0); border-radius:8px; overflow:hidden;">
        <baps-menu-item
          [title]="title" [subtitle]="subtitle"
          [control]="control" [checked]="checked"
          [media]="media" [icon]="icon" [avatarLabel]="avatarLabel" [avatarIcon]="avatarIcon"
          [severity]="severity" [selected]="selected" [disabled]="disabled"
        ></baps-menu-item>
      </div>
    `,
  }),
};

/**
 * Queried by role, not by class: `menuitem` is the semantic the wrapper has to
 * expose for a menu to be navigable at all, and the focus it takes is a state
 * no screenshot of the resting row can show.
 */
export const FocusInteraction: Story = {
  ...MenuItemPlayground,
  name: 'Interaction — the row exposes role=menuitem and takes focus',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const menuItem = canvas.getByRole('menuitem');
    expect(menuItem).toBeTruthy();

    menuItem.focus();
    expect(menuItem).toHaveFocus();

    await userEvent.click(menuItem);
  },
};

const menuItemMatrix = (brand: 'mybky' | 'sampark') => ({
  props: {
    brand,
    simpleCols: [
      { control: 'none', media: 'none' },
      { control: 'none', media: 'icon' },
      { control: 'checkbox', media: 'none' },
      { control: 'radio', media: 'none' },
    ],
    simpleRows: [
      { severity: 'default', selected: false, disabled: false },
      { severity: 'default', selected: true, disabled: false },
      { severity: 'danger', selected: false, disabled: false },
      { severity: 'danger', selected: true, disabled: false },
      { severity: 'default', selected: false, disabled: true },
    ],
    userCols: [
      { control: 'none' },
      { control: 'checkbox' },
      { control: 'radio' },
    ],
    userMedias: [
      { avatarLabel: 'GP', avatarIcon: undefined },
      { avatarLabel: undefined, avatarIcon: 'pi-envelope' },
    ],
    userRows: [
      { selected: false, disabled: false },
      { selected: true, disabled: false },
      { selected: false, disabled: true },
    ],
  },
  template: `
      <style>
        .mi-section { margin-bottom: 40px; }
        .mi-heading { font: 600 13px/1.3 Inter, sans-serif; letter-spacing: .06em; text-transform: uppercase;
          opacity: .6; margin: 0 0 16px; }
      </style>

      <section class="mi-section">
        <p class="mi-heading">Simple — icon / checkbox / radio</p>
        <div style="display:grid; grid-template-columns:repeat(4, 240px); gap:24px;">
          @for (col of simpleCols; track $index) {
            <div style="display:flex; flex-direction:column; gap:16px;">
              @for (row of simpleRows; track $index) {
                <baps-menu-item title="Option" [brand]="brand"
                  [control]="col.control" [media]="col.media"
                  [severity]="row.severity" [selected]="row.selected" [disabled]="row.disabled"
                ></baps-menu-item>
              }
            </div>
          }
        </div>
      </section>

      <section class="mi-section">
        <p class="mi-heading">User — avatar + name / role</p>
        <div style="display:grid; grid-template-columns:repeat(3, 300px); gap:24px;">
          @for (col of userCols; track $index) {
            <div style="display:flex; flex-direction:column; gap:8px;">
              @for (media of userMedias; track $index) {
                @for (row of userRows; track $index) {
                  <baps-menu-item [brand]="brand"
                    media="avatar" [avatarLabel]="media.avatarLabel" [avatarIcon]="media.avatarIcon"
                    title="Ghanshyam Pandey" subtitle="Nation Leader"
                    [control]="col.control" [selected]="row.selected" [disabled]="row.disabled"
                  ></baps-menu-item>
                }
              }
            </div>
          }
        </div>
      </section>

      <section class="mi-section">
        <p class="mi-heading">Selection — checked states</p>
        <div style="display:flex; flex-direction:column; gap:8px; width:300px;">
          <baps-menu-item [brand]="brand" control="checkbox" title="Unchecked option"></baps-menu-item>
          <baps-menu-item [brand]="brand" control="checkbox" title="Checked option" [checked]="true" [selected]="true"></baps-menu-item>
          <baps-menu-item [brand]="brand" control="radio" title="Unselected option"></baps-menu-item>
          <baps-menu-item [brand]="brand" control="radio" title="Selected option" [checked]="true" [selected]="true"></baps-menu-item>
        </div>
      </section>
    `,
});

export const AllVariants: Story = {
  tags: ['!ds:mybky'],
  name: 'Menu Item — All Variants',
  parameters: { controls: { disable: true } },
  render: () => menuItemMatrix('sampark'),
};

export const AllVariantsMyBKY: Story = {
  tags: ['!ds:sampark'],
  name: 'Menu Item — All Variants (MyBKY)',
  parameters: { controls: { disable: true } },
  render: () => menuItemMatrix('mybky'),
};
