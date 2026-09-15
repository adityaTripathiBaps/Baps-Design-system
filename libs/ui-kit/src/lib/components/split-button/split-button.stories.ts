import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { BapsSplitButton } from './split-button.component';
import type { MenuItem } from 'primeng/api';

/**
 * SplitButton — primary action plus a dropdown of secondary actions
 * (Sampark Portal "Split Button", Figma node 13197:92206). Sizes
 * small/default/large/xlarge (28/32/36/40px), primary and secondary
 * severities, distinct disabled fill.
 */
interface SplitButtonArgs {
  /** Output spy — see the note in file-upload.stories.ts. */
  label: string;
  icon?: string;
  severity: 'primary' | 'secondary' | 'danger' | 'warn';
  size?: 'small' | 'large' | 'xlarge';
  disabled: boolean;
  brand: 'mybky' | 'sampark';
}

const MODEL: MenuItem[] = [
  { label: 'Save as draft' },
  { label: 'Duplicate' },
  { separator: true },
  { label: 'Delete' },
];

const meta: Meta<SplitButtonArgs> = {
  title: 'Components/Button/SplitButton',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-button-splitbutton.
  id: 'components-splitbutton',
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:92206.
    // Harvested from split-button.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-92206' },
  },
  // Docs page comes from split-button.mdx — no 'autodocs' tag, same fix as
  // file-upload.stories.ts (both tagged would conflict per the Storybook
  // indexer: "docs page... but also tagged... autodocs").
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsSplitButton,
  decorators: [moduleMetadata({ imports: [BapsSplitButton] })],
  argTypes: {
    severity: { control: 'radio', options: ['primary', 'secondary', 'danger', 'warn'] },
    size: { control: 'select', options: [undefined, 'small', 'large', 'xlarge'] },
    disabled: { control: 'boolean' },
    brand: { control: 'radio', options: ['mybky', 'sampark'] },
  },
  args: {
    label: 'Button Text',
    icon: 'pi pi-clock',
    severity: 'primary',
    size: undefined,
    disabled: false,
  },
  render: (args) => ({
    props: { ...args, onClicked: action('clicked'), model: MODEL },
    template: `
      <baps-split-button
        [label]="label"
        [icon]="icon"
        [model]="model"
        [severity]="severity"
        [size]="size"
        [disabled]="disabled"
        [brand]="brand"
      
        (clicked)="onClicked($event)"></baps-split-button>
    `,
  }),
};

export default meta;
type Story = StoryObj<SplitButtonArgs>;

export const Playground: Story = {};

/**
 * The count pill — Figma "Button Notification Counts" (Sampark 13197:92212,
 * MyBKY 22465:94086). A 16px white pill with a hairline border and a 12px
 * semibold number, sitting after the label inside the action segment.
 *
 * It renders only when `count` is set, and setting it switches the label
 * segment to a PrimeNG content template — the label input alone is bare text
 * with nowhere to put a sibling. Every call site without `count` keeps
 * PrimeNG's own rendering untouched.
 *
 * `countLabel` is not decoration: a bare number announces as "8" with no
 * indication of what is counted.
 */
export const WithCount: Story = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { model: MODEL },
    template: `
      <div style="display:grid; gap:16px; justify-items:start;">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <baps-split-button brand="sampark" label="Button Text" icon="pi pi-clock" [count]="8" countLabel="8 pending approvals" [model]="model"></baps-split-button>
          <baps-split-button brand="sampark" label="Button Text" icon="pi pi-clock" [count]="12" countLabel="12 pending approvals" [model]="model"></baps-split-button>
          <baps-split-button brand="sampark" label="Button Text" icon="pi pi-clock" [count]="0" countLabel="No pending approvals" [model]="model"></baps-split-button>
          <baps-split-button brand="sampark" label="Button Text" icon="pi pi-clock" [count]="8" [disabled]="true" [model]="model"></baps-split-button>
        </div>
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" [count]="8" countLabel="8 pending approvals" [model]="model"></baps-split-button>
          <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" [count]="12" countLabel="12 pending approvals" [model]="model"></baps-split-button>
          <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" [count]="0" countLabel="No pending approvals" [model]="model"></baps-split-button>
          <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" [count]="8" [disabled]="true" [model]="model"></baps-split-button>
        </div>
      </div>
    `,
  }),
};

/**
 * MyBKY (default brand) — pill radius, blue gradient primary, plus danger/warn
 * (matches baps-button's mybky colorScheme). Sampark has no danger/warn brand
 * colors either — same gap as baps-button — so those two severities render
 * under mybky only here.
 */
export const MyBKY: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  render: () => ({
    props: { model: MODEL },
    template: `
      <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
        <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" [model]="model"></baps-split-button>
        <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" severity="secondary" [model]="model"></baps-split-button>
        <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" severity="danger" [model]="model"></baps-split-button>
        <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" severity="warn" [model]="model"></baps-split-button>
        <baps-split-button brand="mybky" label="Button Text" icon="pi pi-clock" [disabled]="true" [model]="model"></baps-split-button>
      </div>
    `,
  }),
};

/** The Figma size × severity matrix: sm/md/lg/xl rows for primary, secondary and disabled. */
export const Matrix: Story = {
  render: () => ({
    props: { model: MODEL },
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start;">
        <div style="display:flex; gap:16px; align-items:center;">
          <baps-split-button label="Button Text" icon="pi pi-clock" size="small" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" size="large" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" size="xlarge" [model]="model"></baps-split-button>
        </div>
        <div style="display:flex; gap:16px; align-items:center;">
          <baps-split-button label="Button Text" icon="pi pi-clock" severity="secondary" size="small" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" severity="secondary" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" severity="secondary" size="large" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" severity="secondary" size="xlarge" [model]="model"></baps-split-button>
        </div>
        <div style="display:flex; gap:16px; align-items:center;">
          <baps-split-button label="Button Text" icon="pi pi-clock" [disabled]="true" [model]="model"></baps-split-button>
          <baps-split-button label="Button Text" icon="pi pi-clock" severity="secondary" [disabled]="true" [model]="model"></baps-split-button>
        </div>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * The two halves are separate controls, and that is the whole point.
 *
 * The label fires the default action; the chevron opens the menu and must NOT
 * fire it. A regression that merged them into one button is invisible in a
 * screenshot and changes what a click does.
 */
export const MenuInteraction: Story = {
  name: 'Interaction — chevron opens the menu',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const buttons = canvas.getAllByRole('button');

    await expect(buttons.length).toBeGreaterThan(1);

    // The trailing button is the menu toggle.
    await userEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => expect(page.getByRole('menu')).toBeVisible());
    await expect((await waitFor(() => page.getAllByRole('menuitem'))).length).toBeGreaterThan(0);
  },
};
