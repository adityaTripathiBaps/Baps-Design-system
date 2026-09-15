import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsTableSortConfig } from './table-sort-config.component';
import { BapsButton } from '../button/button.component';

/**
 * TableSortConfig — the multi-column sort panel.
 *
 * The counterpart to `baps-table-column-config`: that one decides WHICH
 * columns a table shows, this one decides the order it shows them in. Both are
 * Sampark Portal panels, both stage their edits until Apply, and both put the
 * priority in the row order rather than in a number the user has to reason
 * about.
 *
 * The header affordance that goes with this panel — the reveal-on-hover sort
 * arrow, and the bordered pill carrying the arrow plus its order number once
 * two or more columns are sorted — lives in the Sampark table skin, not here.
 * See the Table stories for it.
 */
const meta: Meta<BapsTableSortConfig> = {
  title: 'Components/Data/TableSortConfig',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-data-tablesortconfig.
  id: 'components-tablesortconfig',
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    visible: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    closed: { control: false },
    sortChange: { control: false },
    visibleChange: { control: false },
    appendTo: { control: 'inline-radio', options: [undefined, 'self', 'body'] },
    visible: { control: 'boolean' },
  },
  // Sampark-only, like table-column-config: this panel has no MyBKY counterpart.
  tags: ['ds:sampark'],
  component: BapsTableSortConfig,
  decorators: [moduleMetadata({ imports: [BapsTableSortConfig, BapsButton, FormsModule] })],
};

export default meta;
type Story = StoryObj<BapsTableSortConfig>;

const FIELDS = [
  { key: 'name', label: 'Project Name' },
  { key: 'samparkType', label: 'Project Sampark Type' },
  { key: 'location', label: 'Location' },
  { key: 'karyakars', label: '# Karyakars' },
  { key: 'families', label: '# Families' },
  { key: 'createdBy', label: 'Created By' },
];

/**
 * Open, with two chosen fields above the locked default. The first row reads
 * "Sort by", the rest "then by" — the list is meant to be read as a sentence.
 */
/**
 * Click "Sort" to open the panel.
 *
 * None of these stories mount open, even though the open state is what they
 * demonstrate. Autodocs puts every story of a component on ONE page, and this
 * panel is a baps-drawer whose mask is a fixed full-viewport div appended to
 * <body> rather than scoped to a story canvas. Three stories defaulting to
 * open stacked three masks over the docs page and never cleared them.
 */
export const Default: Story = {
  render: () => ({
    props: {
      open: false,
      fields: FIELDS,
      rows: [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: -1 },
      ],
      defaultSort: { field: 'name', direction: 1, locked: true },
    },
    template: `
      <div style="padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem; min-height:22rem">
        <baps-button label="Sort" icon="pi pi-sort-alt" (click)="open = true" />
        <div style="font-size:0.875rem; color:var(--color-sampark-text-muted); max-width:34rem">
          Priority is the row order, and the row order is draggable. Edits are
          staged until Apply; dismissing the panel discards them.
        </div>
        <baps-table-sort-config
          [(visible)]="open"
          [fields]="fields"
          [rows]="rows"
          [defaultSort]="defaultSort"
        />
      </div>
    `,
  }),
};

/**
 * Nothing sorted but a default. The locked row is still present — a table with
 * no deterministic order at all is not a state this panel can produce.
 */
export const DefaultOnly: Story = {
  render: () => ({
    props: {
      open: false,
      fields: FIELDS,
      rows: [],
      defaultSort: { field: 'name', direction: 1, locked: true },
    },
    template: `
      <div style="padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem; min-height:22rem">
        <baps-button label="Sort" icon="pi pi-sort-alt" (click)="open = true" />
        <div style="font-size:0.875rem; color:var(--color-sampark-text-muted); max-width:34rem">
          The locked row cannot be removed — but it can be reordered and
          flipped. Locked means unremovable, not frozen.
        </div>
        <baps-table-sort-config
          [(visible)]="open"
          [fields]="fields"
          [rows]="rows"
          [defaultSort]="defaultSort"
        />
      </div>
    `,
  }),
};

/**
 * No `defaultSort`, and nothing sorted yet — the empty state, with the
 * quick-sort chips as the only way in.
 */
export const Empty: Story = {
  render: () => ({
    props: { open: false, fields: FIELDS, rows: [] },
    template: `
      <div style="padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem; min-height:22rem">
        <baps-button label="Sort" icon="pi pi-sort-alt" (click)="open = true" />
        <div style="font-size:0.875rem; color:var(--color-sampark-text-muted); max-width:34rem">
          With no default sort the order really can be empty.
        </div>
        <baps-table-sort-config [(visible)]="open" [fields]="fields" [rows]="rows" />
      </div>
    `,
  }),
};

/**
 * Driven by a trigger, which is how a real page uses it — the panel is a
 * drawer, so it is opened from a toolbar button rather than rendered inline.
 */
export const FromTrigger: Story = {
  render: () => ({
    props: {
      open: false,
      fields: FIELDS,
      rows: [{ field: 'location', direction: 1 }],
      defaultSort: { field: 'name', direction: 1, locked: true },
    },
    template: `
      <div style="padding:1.5rem">
        <baps-button label="Sort" icon="pi pi-sort-alt" (click)="open = true" />
        <baps-table-sort-config
          [(visible)]="open"
          [fields]="fields"
          [rows]="rows"
          [defaultSort]="defaultSort"
        />
      </div>
    `,
  }),
};

/* ── Interactions ────────────────────────────────────────────────────────── */

/**
 * Open the panel from its trigger and confirm the staged rows are there.
 *
 * This story renders its OWN template. The meta for this component supplies no
 * render, so a play story that leaned on it mounted nothing at all and the
 * trigger query found no button — the same trap the dialog and popover stories
 * hit. Worth stating once: in this library, only some metas carry a render.
 */
export const SortRowsInteraction: Story = {
  name: 'Interaction — open and read the sort rows',
  render: () => ({
    props: {
      open: false,
      fields: FIELDS,
      rows: [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: -1 },
      ],
      defaultSort: { field: 'name', direction: 1, locked: true },
    },
    template: `
      <div style="padding:1.5rem; min-height:22rem">
        <baps-button label="Sort" icon="pi pi-sort-alt" (click)="open = true" />
        <baps-table-sort-config
          [(visible)]="open"
          [fields]="fields"
          [rows]="rows"
          [defaultSort]="defaultSort"
        ></baps-table-sort-config>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /^Sort$/i }));

    // The panel is a portaled drawer, so it is read off the document. Apply is
    // the assertion because it only exists once the panel's content is mounted,
    // and this panel's whole contract is that edits are STAGED until Apply.
    await waitFor(() => expect(page.getByText(/Apply/i)).toBeVisible(), { timeout: 5000 });
  },
};
