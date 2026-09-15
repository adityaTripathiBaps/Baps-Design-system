import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import {
  BapsTableColumnConfig,
  type BapsTableColumnConfigColumn,
} from './table-column-config.component';
import { BapsButton } from '../button/button.component';

/**
 * The "Fields" panel — search, an active-column count, and a
 * reorderable/pinnable column list, built on `baps-drawer`.
 *
 * Sampark-only: there is no MyBKY equivalent of this panel in the spec, so
 * unlike most components here it has no `brand` input — every part is pinned
 * to the Sampark skin. See the component's own doc comment for why it also
 * forces `styleClass="baps-ds-sampark"`.
 */
const COLUMNS: BapsTableColumnConfigColumn[] = [
  { key: 'name', label: 'Karyakar Name', locked: true },
  { key: 'centre', label: 'Centre', frozen: true },
  { key: 'mandal', label: 'Mandal', visible: true, group: 'Satsang' },
  { key: 'department', label: 'Department', visible: true, group: 'Satsang' },
  { key: 'seva', label: 'Seva Role', visible: true, group: 'Satsang' },
  { key: 'phone', label: 'Mobile', visible: true, group: 'Contact' },
  { key: 'email', label: 'Email', visible: false, group: 'Contact' },
  { key: 'address', label: 'Address', visible: false, group: 'Contact' },
  { key: 'lastSampark', label: 'Last Sampark', visible: true, group: 'Activity' },
  { key: 'status', label: 'Status', visible: false, group: 'Activity' },
  { key: 'actions', label: 'Actions', locked: true, end: true },
];

/** Fresh copies per story so one story's edits cannot leak into another. */
const seed = () => ({
  columns: COLUMNS.map((c) => ({ ...c })),
  defaultColumns: COLUMNS.map((c) => ({ ...c })),
  appliedLabels: '',
});

const TEMPLATE = `
  <div style="padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem">
    <baps-button label="Configure fields" icon="pi pi-sliders-h" brand="sampark" (click)="visible = true" />

    <div style="font-size:0.875rem; color:var(--color-sampark-text-muted); max-width:40rem">
      @if (appliedLabels) {
        <strong>Applied:</strong> {{ appliedLabels }}
      } @else {
        Nothing applied yet — edits are staged until you press Apply, and
        dismissing the panel (mask, Esc, X) discards them.
      }
    </div>
  </div>

  <baps-table-column-config
    [(visible)]="visible"
    [columns]="columns"
    [defaultColumns]="defaultColumns"
    [allowPin]="allowPin"
    [header]="header"
    [sectionLabel]="sectionLabel"
    [searchPlaceholder]="searchPlaceholder"
    [appendTo]="appendTo"
    (columnsChange)="onApply($event)"
    (closed)="onClosed($event)"
  />
`;

/** The component's inputs plus the output spies these stories bind. */
type Args = BapsTableColumnConfig & Record<'onClosed', (event?: unknown) => void>;

const meta: Meta<Args> = {
  title: 'Components/Data/TableColumnConfig',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-data-tablecolumnconfig.
  id: 'components-tablecolumnconfig',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:sampark'],
  component: BapsTableColumnConfig,
  decorators: [moduleMetadata({ imports: [BapsTableColumnConfig, BapsButton] })],
  argTypes: {
    closed: { control: false },
    columnsChange: { control: false },
    visibleChange: { control: false },
    appendTo: { control: 'inline-radio', options: ['self', 'body'] },
    allowPin: { control: 'boolean' },
  },
  args: {
    visible: false,
    header: 'Fields',
    sectionLabel: 'Column Fields',
    searchPlaceholder: 'Search fields',
    allowPin: true,
    appendTo: 'body',
  },
  parameters: {
    layout: 'fullscreen',
    // Design tab — the Figma frame this component implements, node 17512:83441.
    // Harvested from table-column-config.component.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-83441' },
  },
  render: (args) => ({
    props: {
      ...args,
      ...seed(),
      // After the spread, not before: `...args` would otherwise overwrite it.
      onClosed: action('closed'),
      onApply(next: BapsTableColumnConfigColumn[]) {
        const self = this as unknown as Record<string, unknown>;
        self['columns'] = next;
        self['appliedLabels'] = next
          .filter((c) => c.locked || c.frozen || c.visible)
          .map((c) => c.label)
          .join(', ');
      },
    },
    template: TEMPLATE,
  }),
};

export default meta;
type Story = StoryObj<Args>;

/** Click "Configure fields" to open the panel. */
export const Playground: Story = {};

/**
 * Click "Configure fields" to see the three buckets at once: a locked column
 * (Karyakar Name), a pinned one (Centre), the draggable regular group, and a
 * locked column anchored at the end (Actions).
 *
 * NOT open on load, though the state it demonstrates is the open one. Autodocs
 * mounts every story of a component on ONE page, and this panel is a
 * `baps-drawer` whose mask is a fixed full-viewport div appended to `<body>` —
 * not scoped to a story's canvas. Two stories defaulting to open put two masks
 * over the docs page permanently, and the page reads as broken. The drawer's
 * own stories carry the same note for the same reason.
 */
export const Open: Story = {};

/**
 * `allowPin="false"` hides the pin/unpin affordance — for tables that do not
 * support column freezing. Locked columns still stay put.
 */
export const WithoutPinning: Story = {
  args: { allowPin: false },
};

/* ── Interactions ────────────────────────────────────────────────────────── */

/**
 * Toggling a column's checkbox changes what the panel holds.
 *
 * This panel is what drives a table's columns, so the state it keeps IS the
 * feature — a checkbox that flips without updating the model leaves the table
 * unchanged and looks fine.
 *
 * The panel starts closed and is opened from the trigger, because it is a
 * drawer: measured, a closed story exposes only the "Configure fields" button,
 * which is why an earlier version of this test found no checkboxes at all.
 */
export const ToggleColumnInteraction: Story = {
  name: 'Interaction — toggle a column',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Configure fields/i }));

    // The panel is a portaled drawer, so it is found on the document. Measured:
    // its rows use the design system's toggle switches, NOT checkboxes — an
    // earlier version of this test looked for role="checkbox" and found none.
    const panel = await waitFor(
      () => canvasElement.ownerDocument.querySelector('.p-drawer'),
      { timeout: 5000 },
    );
    await expect(panel).toBeTruthy();

    const rows = await waitFor(() => page.getAllByRole('switch'), { timeout: 5000 });
    await expect(rows.length).toBeGreaterThan(1);

    // The lead column is locked, so toggle one that is actually enabled rather
    // than assuming index 0.
    const target = rows.find((r) => !(r as HTMLInputElement).disabled);
    await expect(target).toBeTruthy();

    const before = (target as HTMLInputElement).checked;
    await userEvent.click(target as HTMLInputElement);
    await waitFor(() => expect(target).toHaveProperty('checked', !before));
  },
};
