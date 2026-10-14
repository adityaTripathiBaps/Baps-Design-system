import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { BapsMenu, type BapsMenuModelItem } from './menu.component';
import { BapsButton } from '../button/button.component';

/**
 * Menu — a popup (or inline) navigation and command menu.
 *
 * Wraps PrimeNG Menu (`p-menu`). Item hover, accent bar, and keyboard focus
 * are driven by the design system's overlay-list stylesheet.
 *
 * The panel is portalled to `<body>` by default when `popup` is true, so its
 * brand rides on the panel's own class list (`panelClass`) instead of a host class.
 */
const sampleItems: BapsMenuModelItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

const submenuItems: BapsMenuModelItem[] = [
  {
    label: 'Actions',
    items: [
      { label: 'Edit profile', icon: 'pi pi-user' },
      { label: 'Duplicate', icon: 'pi pi-copy' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', icon: 'pi pi-cog' },
      { label: 'Sign out', icon: 'pi pi-sign-out' },
    ],
  },
];

const meta: Meta<BapsMenu> = {
  title: 'Components/Molecules/Menu',
  id: 'components-menu',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsMenu,
  decorators: [moduleMetadata({ imports: [BapsMenu, BapsButton] })],
  argTypes: {
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    popup: { control: 'boolean' },
  },
  args: {
    popup: true,
    brand: 'mybky',
    model: sampleItems,
  },
};

export default meta;
type Story = StoryObj<BapsMenu>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:var(--space-6)">
        <baps-button label="Open Menu" [brand]="brand" (click)="menu.toggle($event)" />
        <baps-menu #menu [model]="model" [popup]="popup" [brand]="brand" />
      </div>
    `,
  }),
};

export const Submenus: Story = {
  args: {
    model: submenuItems,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:var(--space-6)">
        <baps-button label="User Menu" [brand]="brand" (click)="menu.toggle($event)" />
        <baps-menu #menu [model]="model" [popup]="popup" [brand]="brand" />
      </div>
    `,
  }),
};

export const Inline: Story = {
  args: {
    popup: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:var(--space-6)">
        <baps-menu [model]="model" [popup]="false" [brand]="brand" />
      </div>
    `,
  }),
};

export const Sampark: Story = {
  args: {
    brand: 'sampark',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="baps-ds-sampark" style="padding:var(--space-6)">
        <baps-button label="Sampark Menu" brand="sampark" (click)="menu.toggle($event)" />
        <baps-menu #menu [model]="model" [popup]="popup" brand="sampark" />
      </div>
    `,
  }),
};

/* ── Interactions ────────────────────────────────────────────────────────── */

export const OpenCloseInteraction: Story = {
  name: 'Interaction — open and dismiss',
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:var(--space-6)">
        <baps-button label="Actions" [brand]="brand" (click)="menu.toggle($event)" />
        <baps-menu #menu [model]="model" [popup]="true" [brand]="brand" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(page.getByText('Edit profile')).toBeVisible(), { timeout: 8000 });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByText('Edit profile')).not.toBeInTheDocument(), { timeout: 8000 });
  },
};
