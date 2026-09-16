import type { Meta, StoryObj } from '@storybook/angular';
import { BapsProgressBar } from './progress-bar.component';

const meta: Meta<BapsProgressBar> = {
  title: 'Components/Atoms/Progress Bar',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-misc-progressbar.
  id: 'components-progressbar',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    styleClass: '',
    style: {},
    showValue: false,
    value: 0,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    mode: { control: 'inline-radio', options: [undefined, 'determinate', 'indeterminate'] },
    severity: { control: 'select', options: [undefined, 'success', 'info', 'warning', 'error'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    showValue: { control: 'boolean' },
    value: { control: 'number' },
    styleClass: { control: 'text' },
  },
  component: BapsProgressBar,
  render: (args) => ({
    props: args,
    template: `
      <baps-progressbar [value]="value" [brand]="brand"></baps-progressbar>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsProgressBar> = {
  args: {
    value: 75,
  },
};

/** The four semantic fills under MyBKY (default brand) — pill radius, blue.600 default fill. */
export const SeveritiesMyBKY: StoryObj<BapsProgressBar> = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  args: { brand: 'mybky', value: 60 },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 20rem">
        <baps-progressbar [value]="value" [brand]="brand"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="success"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="info"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="warning"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="error"></baps-progressbar>
      </div>
    `,
  }),
};

/** The four semantic fills, at the default 8px track height (Sampark). */
export const Severities: StoryObj<BapsProgressBar> = {
  args: { value: 60 },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 20rem">
        <baps-progressbar [value]="value" [brand]="brand"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="success"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="info"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="warning"></baps-progressbar>
        <baps-progressbar [value]="value" [brand]="brand" severity="error"></baps-progressbar>
      </div>
    `,
  }),
};

/**
 * Table-cell progress — Figma 18845:92903 (Dashboard → Projects).
 *
 * A 4px track over a label/percent line. The geometry comes from the
 * `.baps-table-progress` wrapper in `_table-sampark.scss`, which drops the
 * track to 4px and re-points its fill to 4% ink; the bar itself is a plain
 * `baps-progressbar severity="success"` with no table-specific component.
 *
 * That wrapper lives under the Sampark scope, so it needs a
 * `.baps-ds-sampark` ancestor (or `baps-table brand="sampark"`) — hence the
 * wrapping div here. Inside a table cell the scope is already present.
 */
export const TableCellProgress: StoryObj<BapsProgressBar> = {
  args: {},
  render: (args) => ({
    props: {
      ...args,
      rows: [
        { done: 0, target: 2000 },
        { done: 1800, target: 2000 },
        { done: 2000, target: 2000 },
      ],
    },
    template: `
      <div class="baps-ds-sampark" style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 12.5rem">
        @for (row of rows; track $index) {
          <span class="baps-table-progress">
            <baps-progressbar severity="success" [value]="row.done / row.target * 100"></baps-progressbar>
            <span class="baps-table-progress-meta">
              <span>{{ row.done }} / {{ row.target }} Families</span>
              <span>{{ row.done / row.target * 100 | number: '1.0-0' }}%</span>
            </span>
          </span>
        }
      </div>
    `,
  }),
};
