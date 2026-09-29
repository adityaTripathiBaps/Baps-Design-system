import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { BapsTable } from './table.component';
import { BapsSortIcon } from './sort-icon.component';
import { BapsTag } from '../tag/tag.component';
import { BapsProgressBar } from '../progress-bar/progress-bar.component';
import { BapsAvatar } from '../avatar/avatar.component';
import { BapsPaginator } from '../pagination/pagination.component';
import {
  BapsTableColumnConfig,
  type BapsTableColumnConfigColumn,
} from '../table-column-config/table-column-config.component';

/**
 * Icon content for the lead-cell avatars below is projected SVG, not a
 * PrimeIcons class string — see the icon-slot doc on `BapsAvatar`. Both
 * icons are Lucide, `stroke-width: 1.75`, matching every other icon in this
 * table (the sync glyph, the action-cell icons).
 */
const GRID_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
`;
const CHECK_SQUARE_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
`;

/**
 * Sampark Portal table — Figma 🟢 Sampark Portal, node 17512:73144
 * (Templates listing, https://dev.bapsapps.dev/spm/templates).
 *
 * The visual skin lives in `_table-sampark.scss` and activates on either
 * `brand="sampark"` or a `.baps-ds-sampark` ancestor.
 */
const templates = [
  {
    name: 'Diwali New Year Prasad - 2025',
    description:
      'Celebrate the spirit of Diwali through seva and be a part of the grand festivities at the Mandir.',
    project: 'Family',
    sampark: 'Home Visit',
    scope: 'North America',
    level: 'Center',
    departments: ['Satsang Network'],
    more: '1',
    duration: '01 Oct 2025 - 15 Nov 2025',
    cadence: 'Once  (30-45 days)',
    recurring: false,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Draft',
  },
  {
    name: 'New Family Introduction Drive',
    description:
      'Systematically connects with newly joined families and ensures smooth integration into satsang.',
    project: 'Family',
    sampark: 'Home Visit',
    scope: 'NorthEast',
    level: 'Center',
    departments: ['Satsang Network'],
    more: '+2',
    duration: '01 Jan 2025 - 31 Dec 2025',
    cadence: 'Every Qtr (10-15 days)',
    recurring: true,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Published',
  },
  {
    name: 'Event Participation Outreach',
    description: 'Tracks invitations, confirmations, and follow-ups for mandal or shibir events.',
    project: 'Family',
    sampark: 'Home Visit',
    scope: 'SouthWest',
    level: 'Center',
    departments: ['BKY', 'Outreach'],
    more: '+1',
    duration: '12 Jun 2025 - 18 Jun 2025',
    cadence: 'Once (7 days)',
    recurring: false,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Published',
  },
  {
    name: 'Youth Re-Engagement Initiative',
    description:
      'Designed to reconnect less-active youths through guided sampark and interest-based touchpoints.',
    project: 'Individual',
    sampark: 'Phone Call',
    scope: 'North America',
    level: 'Center',
    departments: ['Yuvak', 'Yuvati', 'BKY'],
    duration: '15 Aug 2025 - 30 Nov 2025',
    cadence: 'Ad-hoc (5-7 days)',
    recurring: true,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Draft',
  },
  {
    name: 'Family Well-Being Check-In',
    description:
      'Captures health, career, or personal concerns to provide appropriate sahay, guidance, or prarthana.',
    project: 'Family',
    sampark: 'Home Visit',
    scope: 'East',
    level: 'Center',
    departments: ['Satsang Network'],
    more: '+3',
    duration: '01 Jan 2025 - 31 Dec 2025',
    cadence: 'Every Qtr (10-15 days)',
    recurring: true,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Published',
  },
  {
    name: 'Bal Parent Sampark Plan',
    description:
      'Focuses on parents of balaks/balikas to understand attendance, behaviour, and satsang needs.',
    project: 'Family',
    sampark: 'Home Visit',
    scope: 'Canada',
    level: 'Center',
    departments: ['Bal', 'Balika', 'BKY'],
    duration: '01 Jan 2025 - 31 Dec 2025',
    cadence: 'Half Yearly (10-15 days)',
    recurring: true,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Published',
  },
  {
    name: 'Festive Greetings & Mahotsav Touchpoints',
    description:
      'A structured approach for sending greetings, prasang sharings, and annual festival sampark.',
    project: 'Family',
    sampark: 'Home Visit',
    scope: 'North America',
    level: 'Center',
    departments: ['Satsang Network'],
    more: '+1',
    duration: '12 Jun 2025 - 18 Jun 2025',
    cadence: 'Once (7 days)',
    recurring: false,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Published',
  },
  {
    name: 'Niyam & Daily Satsang Progress Sampark',
    description:
      "Helps track members' niyam adherence and offers motivation for daily spiritual practices.",
    project: 'Individual',
    sampark: 'Phone Call',
    scope: 'North America',
    level: 'Center',
    departments: ['Satsang Network'],
    more: '+2',
    duration: '15 Aug 2025 - 30 Nov 2025',
    cadence: 'Ad-hoc (5-7 days)',
    recurring: true,
    createdBy: 'Rajesh Haripara',
    createdOn: 'Created on : 01 Jan 2025',
    status: 'Archived',
  },
];

/** Figma status chip mapping: Draft → grey, Published → success, Archived → warn. */
const statusSeverity: Record<string, string | undefined> = {
  Draft: undefined,
  Published: 'success',
  Archived: 'warn',
};

/**
 * Dashboard → Projects, Figma node 18845:92903. A FLAT list grouped by
 * location — not a tree structure. Rows must stay contiguous by location
 * for PrimeNG's subheader grouping to emit one header per group.
 */
const projects = [
  {
    location: 'Robbinsvile',
    name: 'New Family Introduction Drive - M3',
    duration: '01 Mar 2026 - 31 Mar 2026',
    karyakars: 220,
    done: 0,
    target: 2000,
    status: 'Upcoming',
  },
  {
    location: 'Robbinsvile',
    name: 'New Family Introduction Drive - M2',
    duration: '01 Mar 2026 - 31 Mar 2026',
    karyakars: 220,
    done: 1800,
    target: 2000,
    status: 'Active',
  },
  {
    location: 'Robbinsvile',
    name: 'New Family Introduction Drive - M1',
    duration: '01 Mar 2026 - 31 Mar 2026',
    karyakars: 220,
    done: 2000,
    target: 2000,
    status: 'Archived',
  },
  {
    location: 'Dayton North',
    name: 'Bal Parent Sampark Plan - M2',
    duration: '01 Apr 2026 - 30 Apr 2026',
    karyakars: 96,
    done: 240,
    target: 800,
    status: 'Active',
  },
  {
    location: 'Dayton North',
    name: 'Bal Parent Sampark Plan - M1',
    duration: '01 Jan 2026 - 31 Jan 2026',
    karyakars: 96,
    done: 800,
    target: 800,
    status: 'Archived',
  },
];

/**
 * The `spm-last-in-group` hook truncates the tree spine on a group's final
 * row. Recompute this after every filter, search or tab change — a stale
 * set leaves the spine running into the next group.
 */
function lastInGroupNames(rows: { location: string; name: string }[]): string[] {
  return rows.filter((row, i) => rows[i + 1]?.location !== row.location).map((row) => row.name);
}

function groupCounts(rows: { location: string }[]): Record<string, number> {
  return rows.reduce<Record<string, number>>(
    (acc, row) => ({ ...acc, [row.location]: (acc[row.location] ?? 0) + 1 }),
    {},
  );
}

/** Karyakar assignments, Figma node 18708:93907. */
const karyakars = [
  { initials: 'YS', name: 'Yash Shah', role: 'G-Sampark', count: 4, center: 'Bordentown', mandal: 'Yuvak', network: 'Satsang Network', status: 'Pending', tasks: 2 },
  { initials: 'UP', name: 'Uttara Patel', role: 'G-Sampark', count: 4, center: 'Bordentown', mandal: 'Yuvti', network: 'iSatsang Network', status: 'Pending', tasks: 2 },
  { initials: 'LR', name: 'Lakshmi Rao', role: 'G-Sampark', count: 4, center: 'Bordentown', mandal: 'Sanyukta', network: 'iSatsang Network', status: 'Pending', tasks: 2 },
  { initials: 'VK', name: 'Vedant Kothari', role: 'G-Sampark', count: 4, center: 'Dayton North', mandal: 'Sanyukta', network: 'Satsang Network', status: 'Pending', tasks: 2 },
  { initials: 'TJ', name: 'Tanvi Joshi', role: 'G-Sampark', count: 4, center: 'Dayton North', mandal: 'Yuvti', network: 'iSatsang Network', status: 'Pending', tasks: 2 },
  { initials: 'RP', name: 'Rohan Patel', role: 'G-Sampark', count: 4, center: 'Dayton North', mandal: 'Yuvak', network: 'Satsang Network', status: 'Pending', tasks: 2 },
  { initials: 'SH', name: 'Shruti Gohel', role: 'G-Sampark', count: 4, center: 'Dayton North', mandal: 'Sanyukta', network: 'iSatsang Network', status: 'Pending', tasks: 2 },
  { initials: 'DJ', name: 'Divya Jain', role: 'G-Sampark', count: 4, center: 'Bordentown', mandal: 'Yuvti', network: 'iSatsang Network', status: 'Pending', tasks: 2 },
  { initials: 'DP', name: 'Devang Patel', role: 'G-Sampark', count: 4, center: 'Dayton North', mandal: 'Yuvak', network: 'Satsang Network', status: 'Complete', tasks: 2 },
  { initials: 'MN', name: 'Milan Patel', role: 'G-Sampark', count: 4, center: 'Dayton North', mandal: 'Yuvak', network: 'Satsang Network', status: 'Complete', tasks: 2 },
];

/** Figma status chip mapping: Upcoming → info, Active → warn, Archived → grey. */
const projectStatusSeverity: Record<string, string | undefined> = {
  Upcoming: 'info',
  Active: 'warn',
  Archived: undefined,
};

/** Pending → warn, Complete → success. */
const assignmentStatusSeverity: Record<string, string | undefined> = {
  Pending: 'warn',
  Complete: 'success',
};

const meta: Meta<BapsTable> = {
  title: 'Components/Organisms/Table',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-data-table.
  id: 'components-table',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    firstChange: { control: false },
    lazyLoad: { control: false },
    pageEvent: { control: false },
    rowSelect: { control: false },
    rowUnselect: { control: false },
    selectionChange: { control: false },
    sortEvent: { control: false },
    sortMode: { control: 'inline-radio', options: [undefined, 'single', 'multiple'] },
    selectionMode: { control: 'inline-radio', options: [undefined, 'single', 'multiple'] },
    rowGroupMode: { control: 'inline-radio', options: [undefined, 'subheader', 'rowspan'] },
    columnResizeMode: { control: 'inline-radio', options: [undefined, 'fit', 'expand'] },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large'] },
    responsiveLayout: { control: 'inline-radio', options: [undefined, 'scroll', 'stack'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    paginator: { control: 'boolean' },
    showCurrentPageReport: { control: 'boolean' },
    showInitialSortBadge: { control: 'boolean' },
    scrollable: { control: 'boolean' },
    virtualScroll: { control: 'boolean' },
    loading: { control: 'boolean' },
    lazy: { control: 'boolean' },
    rowHover: { control: 'boolean' },
    resizableColumns: { control: 'boolean' },
    showGridlines: { control: 'boolean' },
    stripedRows: { control: 'boolean' },
    first: { control: 'number' },
    rows: { control: 'number' },
    totalRecords: { control: 'number' },
    sortField: { control: 'text' },
    scrollHeight: { control: 'text' },
    styleClass: { control: 'text' },
    dataKey: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:73144.
    // Harvested from table.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-73144' },
  },
  component: BapsTable,
  decorators: [
    moduleMetadata({
      imports: [
        BapsTable,
        BapsSortIcon,
        BapsTag,
        BapsProgressBar,
        BapsAvatar,
        BapsPaginator,
        BapsTableColumnConfig,
        SharedModule,
        TableModule,
        FormsModule,
      ],
    }),
  ],
  args: {
    styleClass: '',
    style: {},
    first: 0,
    lazy: false,
    loading: false,
    paginator: false,
    resizableColumns: false,
    rowHover: true,
    rows: 10,
    scrollable: false,
    showCurrentPageReport: false,
    showGridlines: false,
    showInitialSortBadge: true,
    stripedRows: false,
    totalRecords: 0,
    virtualScroll: false,
    value: templates,
  },
};

export default meta;

/**
 * The Templates listing exactly as designed: 40px header row at Mono/10,
 * full hairline gridlines, and two-line cells (primary over secondary).
 */
export const Default: StoryObj<BapsTable> = {
  render: (args) => ({
    props: { ...args, statusSeverity },
    template: `
      <baps-table [value]="value" [brand]="brand" [size]="size" [tableStyle]="{ 'min-width': '102rem' }">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 21.25rem">Template Name</th>
            <th style="width: 12.5rem">Project / Sampark Type</th>
            <th style="width: 12.5rem">Location Scope / Level</th>
            <th style="width: 14.0625rem">Department/s</th>
            <th style="width: 14.0625rem">Duration</th>
            <th style="width: 14.0625rem">Created By</th>
            <th style="width: 7.5rem">Status</th>
            <th style="width: 6.0625rem">
              <i class="pi pi-objects-column" aria-hidden="true"></i>
              <span class="p-hidden-accessible">Toggle columns</span>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td class="baps-table-cell-lead">
              <div style="display: flex; align-items: center; gap: 0.5rem">
                <baps-avatar variant="secondary">${GRID_ICON_SVG}</baps-avatar>
                <span class="baps-table-cell">
                  {{ row.name }}
                  <small>{{ row.description }}</small>
                </span>
              </div>
            </td>
            <td>
              <span class="baps-table-cell">{{ row.project }}<small>{{ row.sampark }}</small></span>
            </td>
            <td>
              <span class="baps-table-cell">{{ row.scope }}<small>{{ row.level }}</small></span>
            </td>
            <td>
              <span style="display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap">
                @for (d of row.departments; track d) {
                  <baps-tag
                    [value]="d"
                    [severity]="d === 'Outreach' ? undefined : 'contrast'"
                  />
                }
                @if (row.more) {
                  <baps-tag [value]="row.more" />
                }
              </span>
            </td>
            <td>
              <span class="baps-table-cell">
                <span style="display: flex; align-items: center; gap: 0.5rem">
                  {{ row.duration }}
                  @if (row.recurring) {
                    <i class="pi pi-sync" aria-hidden="true"></i>
                  }
                </span>
                <small>{{ row.cadence }}</small>
              </span>
            </td>
            <td>
              <span class="baps-table-cell">{{ row.createdBy }}<small>{{ row.createdOn }}</small></span>
            </td>
            <td>
              <baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" />
            </td>
            <td>
              <span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem">
                <button type="button" class="baps-table-action" [disabled]="row.status === 'Archived'" aria-label="Edit template">
                  <i class="pi pi-pencil" aria-hidden="true"></i>
                </button>
                <button type="button" class="baps-table-action" [disabled]="row.status === 'Archived'" aria-label="Delete template">
                  <i class="pi pi-trash" aria-hidden="true"></i>
                </button>
              </span>
            </td>
          </tr>
        </ng-template>
      </baps-table>
    `,
  }),
};

/**
 * `Default` at `[size]="small"` — Figma's `Compact=True` cell variant
 * (13197:89532 / 13197:89633). Rows drop 56px to 44px; the entire change
 * is vertical cell padding (12px to 6px), so the header stays 40px and
 * column widths are untouched. Diff this against `Default` side by side:
 * everything but the row height should be identical.
 */
export const Compact: StoryObj<BapsTable> = {
  ...Default,
  args: { size: 'small' },
};

/**
 * Column visibility, wired to a real `baps-table-column-config` panel
 * (Figma node 17512:83441, `app-common-table-column`). The `Default`
 * story's header already carries a `pi-objects-column` trigger (Figma marks
 * it "Toggle columns") with no handler — this variant is that trigger made
 * to do something, with the full column-config spec behind it: search,
 * the "N Active Columns" view toggle, drag-reorder and pin/unpin within the
 * regular bucket, and Reset Default / Apply.
 *
 * The table itself is template-driven (see `BapsTable`'s own doc comment) —
 * each `<th>`/`<td>` pair is hardcoded per column key, so reordering in the
 * panel does not re-order the rendered columns; `onColumnsChange` only
 * merges visibility/pin state back onto the demo's fixed-position array by
 * key. Template Name is the one locked column (Figma: dimmed lock icon, no
 * drag, disabled switch, always on).
 *
 * Pinning uses the `.dt-frozen-left` pattern (see its doc comment in
 * `_table-sampark.scss`), not PrimeNG's `pFrozenColumn` — every column here
 * already has a fixed `style="width: …rem"`, so `frozenLeftOffset()` below
 * just sums `COLUMN_WIDTH_PX` for the other frozen columns to the left,
 * rather than asking PrimeNG to measure the live DOM.
 */
const tableColumns: BapsTableColumnConfigColumn[] = [
  { key: 'name', label: 'Template Name', locked: true, visible: true },
  { key: 'project', label: 'Project / Sampark Type', visible: true },
  { key: 'scope', label: 'Location Scope / Level', visible: true },
  { key: 'departments', label: 'Department/s', visible: true },
  { key: 'duration', label: 'Duration', visible: true },
  { key: 'createdBy', label: 'Created By', visible: true },
  { key: 'status', label: 'Status', visible: true },
];

// Matches each column's own `style="width: …rem"` below, 1rem = 16px — the
// fixed-width case `.dt-frozen-left`'s doc comment describes: since these
// never change, the left offset is a plain sum, no DOM measurement needed.
const COLUMN_WIDTH_PX = [340, 200, 200, 225, 225, 225, 120];

export const WithColumnConfig: StoryObj<BapsTable> = {
  render: (args) => {
    const columns = tableColumns.map((c) => ({ ...c }));
    const defaultColumns = tableColumns.map((c) => ({ ...c }));
    const isFrozenLeft = (col: BapsTableColumnConfigColumn) => Boolean(col.locked || col.frozen);
    return {
      props: {
        ...args,
        statusSeverity,
        showColumnConfig: false,
        columns,
        defaultColumns,
        isFrozenLeft,
        frozenLeftOffset: (index: number) => {
          if (!isFrozenLeft(columns[index])) return null;
          let left = 0;
          for (let i = 0; i < index; i++) {
            if (isFrozenLeft(columns[i])) left += COLUMN_WIDTH_PX[i];
          }
          return left;
        },
        onColumnsChange: (next: BapsTableColumnConfigColumn[]) => {
          for (const updated of next) {
            const target = columns.find((c) => c.key === updated.key);
            if (target) Object.assign(target, updated);
          }
        },
      },
      template: `
      <baps-table
        [value]="value"
        [brand]="brand"
        [scrollable]="true"
        scrollHeight="25rem"
        [tableStyle]="{ 'min-width': '102rem' }"
      >
        <ng-template pTemplate="header">
          <tr>
            @if (columns[0].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[0])" [style.left.px]="frozenLeftOffset(0)" style="width: 21.25rem">Template Name</th>
            }
            @if (columns[1].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[1])" [style.left.px]="frozenLeftOffset(1)" style="width: 12.5rem">Project / Sampark Type</th>
            }
            @if (columns[2].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[2])" [style.left.px]="frozenLeftOffset(2)" style="width: 12.5rem">Location Scope / Level</th>
            }
            @if (columns[3].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[3])" [style.left.px]="frozenLeftOffset(3)" style="width: 14.0625rem">Department/s</th>
            }
            @if (columns[4].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[4])" [style.left.px]="frozenLeftOffset(4)" style="width: 14.0625rem">Duration</th>
            }
            @if (columns[5].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[5])" [style.left.px]="frozenLeftOffset(5)" style="width: 14.0625rem">Created By</th>
            }
            @if (columns[6].visible) {
              <th [class.dt-frozen-left]="isFrozenLeft(columns[6])" [style.left.px]="frozenLeftOffset(6)" style="width: 7.5rem">Status</th>
            }
            <th class="dt-frozen-right" style="width: 6.0625rem">
              <button
                type="button"
                class="baps-table-action"
                aria-label="Column settings"
                (click)="showColumnConfig = true"
              >
                <i class="pi pi-objects-column" aria-hidden="true"></i>
              </button>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            @if (columns[0].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[0])" [style.left.px]="frozenLeftOffset(0)" class="baps-table-cell-lead">
                <div style="display: flex; align-items: center; gap: 0.5rem">
                  <baps-avatar variant="secondary">${GRID_ICON_SVG}</baps-avatar>
                  <span class="baps-table-cell">
                    {{ row.name }}
                    <small>{{ row.description }}</small>
                  </span>
                </div>
              </td>
            }
            @if (columns[1].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[1])" [style.left.px]="frozenLeftOffset(1)"><span class="baps-table-cell">{{ row.project }}<small>{{ row.sampark }}</small></span></td>
            }
            @if (columns[2].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[2])" [style.left.px]="frozenLeftOffset(2)"><span class="baps-table-cell">{{ row.scope }}<small>{{ row.level }}</small></span></td>
            }
            @if (columns[3].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[3])" [style.left.px]="frozenLeftOffset(3)">
                <span style="display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap">
                  @for (d of row.departments; track d) {
                    <baps-tag [value]="d" [severity]="d === 'Outreach' ? undefined : 'contrast'" />
                  }
                  @if (row.more) { <baps-tag [value]="row.more" /> }
                </span>
              </td>
            }
            @if (columns[4].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[4])" [style.left.px]="frozenLeftOffset(4)">
                <span class="baps-table-cell">
                  <span style="display: flex; align-items: center; gap: 0.5rem">
                    {{ row.duration }}
                    @if (row.recurring) { <i class="pi pi-sync" aria-hidden="true"></i> }
                  </span>
                  <small>{{ row.cadence }}</small>
                </span>
              </td>
            }
            @if (columns[5].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[5])" [style.left.px]="frozenLeftOffset(5)"><span class="baps-table-cell">{{ row.createdBy }}<small>{{ row.createdOn }}</small></span></td>
            }
            @if (columns[6].visible) {
              <td [class.dt-frozen-left]="isFrozenLeft(columns[6])" [style.left.px]="frozenLeftOffset(6)"><baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" /></td>
            }
            <td class="dt-frozen-right">
              <div style="display: flex; align-items: center; gap: 0.25rem">
                <button type="button" class="baps-table-action" aria-label="Edit">
                  <i class="pi pi-pencil" aria-hidden="true"></i>
                </button>
                <button type="button" class="baps-table-action" aria-label="Delete">
                  <i class="pi pi-trash" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        </ng-template>
      </baps-table>

      <baps-table-column-config
        [(visible)]="showColumnConfig"
        [columns]="columns"
        [defaultColumns]="defaultColumns"
        (columnsChange)="onColumnsChange($event)"
      />
    `,
    };
  },
};

/**
 * The listing screen as shipped — Figma 17512:73143. This is `WithColumnConfig`
 * plus the two things that turn a table into a page: the surface that gives it
 * a bounded height, and `baps-paginator` beneath it.
 *
 * Three details are the whole point of this story:
 *
 * - The paginator sits **outside** `.baps-table-surface`, on the page
 *   background. It is not `[paginator]="true"` on `baps-table` — PrimeNG's
 *   built-in paginator renders *inside* the table's frame, under the last row
 *   and inside the border, which is not where the Figma puts it.
 * - `scrollHeight="flex"` plus the surface's flex chain lets the body scroll
 *   inside a fixed frame, so the paginator stays put instead of being pushed
 *   down the page by a long page size.
 * - Paging is wired for real (`onPage`), so the rows change and the record
 *   count tracks. Switch the page size and the current first row is kept in
 *   view rather than snapping back to page 1.
 */
export const WithPagination: StoryObj<BapsTable> = {
  render: (args) => {
    const all = Array.from({ length: 250 }, (_, i) => {
      const base = templates[i % templates.length];
      return { ...base, name: `${base.name}${i >= templates.length ? ` (${Math.floor(i / templates.length) + 1})` : ''}` };
    });
    const state = { first: 0, rows: 20 };
    return {
      props: {
        ...args,
        statusSeverity,
        total: all.length,
        state,
        rowsFor: () => all.slice(state.first, state.first + state.rows),
        onPage: (e: { first: number; rows: number }) => {
          state.first = e.first;
          state.rows = e.rows;
        },
      },
      template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; height: 34rem">
        <div class="baps-table-surface">
          <baps-table
            [value]="rowsFor()"
            [brand]="brand"
            [scrollable]="true"
            scrollHeight="flex"
            [tableStyle]="{ 'min-width': '102rem' }"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="dt-frozen-left" [style.left.px]="0" style="width: 21.25rem">Template Name</th>
                <th style="width: 12.5rem">Project / Sampark Type</th>
                <th style="width: 12.5rem">Location Scope / Level</th>
                <th style="width: 14.0625rem">Department/s</th>
                <th style="width: 14.0625rem">Duration</th>
                <th style="width: 14.0625rem">Created By</th>
                <th style="width: 7.5rem">Status</th>
                <th class="dt-frozen-right baps-table-config-cell" style="width: 6.0625rem">
                  <button type="button" class="baps-table-action" aria-label="Column settings">
                    <i class="pi pi-objects-column" aria-hidden="true"></i>
                  </button>
                </th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row>
              <tr>
                <td class="dt-frozen-left baps-table-cell-lead" [style.left.px]="0">
                  <div style="display: flex; align-items: center; gap: 0.5rem">
                    <baps-avatar variant="secondary">${GRID_ICON_SVG}</baps-avatar>
                    <span class="baps-table-cell">{{ row.name }}<small>{{ row.description }}</small></span>
                  </div>
                </td>
                <td><span class="baps-table-cell">{{ row.project }}<small>{{ row.sampark }}</small></span></td>
                <td><span class="baps-table-cell">{{ row.scope }}<small>{{ row.level }}</small></span></td>
                <td>
                  <span style="display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap">
                    @for (d of row.departments; track d) {
                      <baps-tag [value]="d" [severity]="d === 'Outreach' ? undefined : 'contrast'" />
                    }
                    @if (row.more) { <baps-tag [value]="row.more" /> }
                  </span>
                </td>
                <td>
                  <span class="baps-table-cell">
                    <span style="display: flex; align-items: center; gap: 0.5rem">
                      {{ row.duration }}
                      @if (row.recurring) { <i class="pi pi-sync" aria-hidden="true"></i> }
                    </span>
                    <small>{{ row.cadence }}</small>
                  </span>
                </td>
                <td><span class="baps-table-cell">{{ row.createdBy }}<small>{{ row.createdOn }}</small></span></td>
                <td><baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" /></td>
                <td class="dt-frozen-right baps-table-action-cell">
                  <div style="display: flex; align-items: center; gap: 0.25rem">
                    <button type="button" class="baps-table-action" aria-label="Edit">
                      <i class="pi pi-pencil" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="baps-table-action" aria-label="Delete">
                      <i class="pi pi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </baps-table>
        </div>

        <baps-paginator
          [totalRecords]="total"
          [rows]="state.rows"
          [first]="state.first"
          [rowsPerPageOptions]="[10, 20, 50, 100]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
          [showJumpToPage]="true"
          (pageChange)="onPage($event)"
        />
      </div>
    `,
    };
  },
};

/**
 * The complete listing pattern — `WithColumnConfig` and `WithPagination`
 * each demo one integration in isolation; a real listing screen needs both
 * at once. This merges them: the same column-visibility/frozen-offset state
 * as `WithColumnConfig`, inside the same bounded-height surface + external
 * `baps-paginator` as `WithPagination`. Nothing new — same two behaviors,
 * same caveats (template-driven columns don't physically reorder on drag,
 * see `WithColumnConfig`'s own doc comment), just proven to compose.
 */
export const FullListingPage: StoryObj<BapsTable> = {
  render: (args) => {
    const all = Array.from({ length: 250 }, (_, i) => {
      const base = templates[i % templates.length];
      return { ...base, name: `${base.name}${i >= templates.length ? ` (${Math.floor(i / templates.length) + 1})` : ''}` };
    });
    const pageState = { first: 0, rows: 20 };
    const columns = tableColumns.map((c) => ({ ...c }));
    const defaultColumns = tableColumns.map((c) => ({ ...c }));
    const isFrozenLeft = (col: BapsTableColumnConfigColumn) => Boolean(col.locked || col.frozen);
    return {
      props: {
        ...args,
        statusSeverity,
        total: all.length,
        pageState,
        rowsFor: () => all.slice(pageState.first, pageState.first + pageState.rows),
        onPage: (e: { first: number; rows: number }) => {
          pageState.first = e.first;
          pageState.rows = e.rows;
        },
        showColumnConfig: false,
        columns,
        defaultColumns,
        isFrozenLeft,
        frozenLeftOffset: (index: number) => {
          if (!isFrozenLeft(columns[index])) return null;
          let left = 0;
          for (let i = 0; i < index; i++) {
            if (isFrozenLeft(columns[i])) left += COLUMN_WIDTH_PX[i];
          }
          return left;
        },
        onColumnsChange: (next: BapsTableColumnConfigColumn[]) => {
          for (const updated of next) {
            const target = columns.find((c) => c.key === updated.key);
            if (target) Object.assign(target, updated);
          }
        },
      },
      template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; height: 34rem">
        <div class="baps-table-surface">
          <baps-table
            [value]="rowsFor()"
            [brand]="brand"
            [scrollable]="true"
            scrollHeight="flex"
            [tableStyle]="{ 'min-width': '102rem' }"
          >
            <ng-template pTemplate="header">
              <tr>
                @if (columns[0].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[0])" [style.left.px]="frozenLeftOffset(0)" style="width: 21.25rem">Template Name</th>
                }
                @if (columns[1].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[1])" [style.left.px]="frozenLeftOffset(1)" style="width: 12.5rem">Project / Sampark Type</th>
                }
                @if (columns[2].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[2])" [style.left.px]="frozenLeftOffset(2)" style="width: 12.5rem">Location Scope / Level</th>
                }
                @if (columns[3].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[3])" [style.left.px]="frozenLeftOffset(3)" style="width: 14.0625rem">Department/s</th>
                }
                @if (columns[4].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[4])" [style.left.px]="frozenLeftOffset(4)" style="width: 14.0625rem">Duration</th>
                }
                @if (columns[5].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[5])" [style.left.px]="frozenLeftOffset(5)" style="width: 14.0625rem">Created By</th>
                }
                @if (columns[6].visible) {
                  <th [class.dt-frozen-left]="isFrozenLeft(columns[6])" [style.left.px]="frozenLeftOffset(6)" style="width: 7.5rem">Status</th>
                }
                <th class="dt-frozen-right baps-table-config-cell" style="width: 6.0625rem">
                  <button type="button" class="baps-table-action" aria-label="Column settings" (click)="showColumnConfig = true">
                    <i class="pi pi-objects-column" aria-hidden="true"></i>
                  </button>
                </th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row>
              <tr>
                @if (columns[0].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[0])" [style.left.px]="frozenLeftOffset(0)" class="baps-table-cell-lead">
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                      <baps-avatar variant="secondary">${GRID_ICON_SVG}</baps-avatar>
                      <span class="baps-table-cell">{{ row.name }}<small>{{ row.description }}</small></span>
                    </div>
                  </td>
                }
                @if (columns[1].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[1])" [style.left.px]="frozenLeftOffset(1)"><span class="baps-table-cell">{{ row.project }}<small>{{ row.sampark }}</small></span></td>
                }
                @if (columns[2].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[2])" [style.left.px]="frozenLeftOffset(2)"><span class="baps-table-cell">{{ row.scope }}<small>{{ row.level }}</small></span></td>
                }
                @if (columns[3].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[3])" [style.left.px]="frozenLeftOffset(3)">
                    <span style="display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap">
                      @for (d of row.departments; track d) {
                        <baps-tag [value]="d" [severity]="d === 'Outreach' ? undefined : 'contrast'" />
                      }
                      @if (row.more) { <baps-tag [value]="row.more" /> }
                    </span>
                  </td>
                }
                @if (columns[4].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[4])" [style.left.px]="frozenLeftOffset(4)">
                    <span class="baps-table-cell">
                      <span style="display: flex; align-items: center; gap: 0.5rem">
                        {{ row.duration }}
                        @if (row.recurring) { <i class="pi pi-sync" aria-hidden="true"></i> }
                      </span>
                      <small>{{ row.cadence }}</small>
                    </span>
                  </td>
                }
                @if (columns[5].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[5])" [style.left.px]="frozenLeftOffset(5)"><span class="baps-table-cell">{{ row.createdBy }}<small>{{ row.createdOn }}</small></span></td>
                }
                @if (columns[6].visible) {
                  <td [class.dt-frozen-left]="isFrozenLeft(columns[6])" [style.left.px]="frozenLeftOffset(6)"><baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" /></td>
                }
                <td class="dt-frozen-right baps-table-action-cell">
                  <div style="display: flex; align-items: center; gap: 0.25rem">
                    <button type="button" class="baps-table-action" aria-label="Edit">
                      <i class="pi pi-pencil" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="baps-table-action" aria-label="Delete">
                      <i class="pi pi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </baps-table>
        </div>

        <baps-paginator
          [totalRecords]="total"
          [rows]="pageState.rows"
          [first]="pageState.first"
          [rowsPerPageOptions]="[10, 20, 50, 100]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
          [showJumpToPage]="true"
          (pageChange)="onPage($event)"
        />
      </div>

      <baps-table-column-config
        [(visible)]="showColumnConfig"
        [columns]="columns"
        [defaultColumns]="defaultColumns"
        (columnsChange)="onColumnsChange($event)"
      />
    `,
    };
  },
};

/**
 * Sortable columns, pagination with the page report, and a sticky first
 * column — `pFrozenColumn` needs `[scrollable]` and a `[scrollHeight]`.
 */
/* Sortable headers WITHOUT pSortableColumn / p-sortIcon.

   Those two inject PrimeNG's Table, and content projected into baps-table sits
   under the CONSUMER in the declaration tree, so the lookup walks past the
   p-table that provides it and throws NG0201. This story used to do exactly
   that and rendered an empty header.

   The answer is to stop asking DI for the state and pass it in: the template
   reference #t reaches baps-table directly, sort() forwards to the PrimeNG
   instance, and baps-sort-icon takes order/index as inputs. The header cell is
   a real <button>, so it is reachable by keyboard — which pSortableColumn on a
   <th> never was. */
export const SortableStickyPaginated: StoryObj<BapsTable> = {
  args: {
    paginator: true,
    rows: 5,
    rowsPerPageOptions: [5, 10, 25],
    showCurrentPageReport: true,
    scrollable: true,
    scrollHeight: '25rem',
    dataKey: 'name',
    selectionMode: 'single',
  },
  render: (args) => ({
    props: { ...args, statusSeverity, order: [{ field: 'project', order: 1 }] },
    template: `
      <baps-table
        #t
        sortMode="multiple"
        [multiSortMeta]="order"
        [value]="value"
        [brand]="brand"
        [paginator]="paginator"
        [rows]="rows"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [showCurrentPageReport]="showCurrentPageReport"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeight"
        [dataKey]="dataKey"
        [selectionMode]="selectionMode"
        [tableStyle]="{ 'min-width': '60rem' }"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 21.25rem">
              <button type="button" class="baps-th-sort" (click)="t.sort('name', $event)">
                Template Name <baps-sort-icon [order]="t.sortOrderOf('name')" [index]="t.sortIndexOf('name')" />
              </button>
            </th>
            <th style="width: 12.5rem">
              <button type="button" class="baps-th-sort" (click)="t.sort('project', $event)">
                Project / Sampark Type <baps-sort-icon [order]="t.sortOrderOf('project')" [index]="t.sortIndexOf('project')" />
              </button>
            </th>
            <th style="width: 12.5rem">
              <button type="button" class="baps-th-sort" (click)="t.sort('scope', $event)">
                Location Scope / Level <baps-sort-icon [order]="t.sortOrderOf('scope')" [index]="t.sortIndexOf('scope')" />
              </button>
            </th>
            <th style="width: 14.0625rem">
              <button type="button" class="baps-th-sort" (click)="t.sort('createdBy', $event)">
                Created By <baps-sort-icon [order]="t.sortOrderOf('createdBy')" [index]="t.sortIndexOf('createdBy')" />
              </button>
            </th>
            <th style="width: 7.5rem">
              <button type="button" class="baps-th-sort" (click)="t.sort('status', $event)">
                Status <baps-sort-icon [order]="t.sortOrderOf('status')" [index]="t.sortIndexOf('status')" />
              </button>
            </th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td class="baps-table-cell-lead">
              <span class="baps-table-cell">{{ row.name }}<small>{{ row.description }}</small></span>
            </td>
            <td><span class="baps-table-cell">{{ row.project }}<small>{{ row.sampark }}</small></span></td>
            <td><span class="baps-table-cell">{{ row.scope }}<small>{{ row.level }}</small></span></td>
            <td><span class="baps-table-cell">{{ row.createdBy }}<small>{{ row.createdOn }}</small></span></td>
            <td><baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" /></td>
          </tr>
        </ng-template>
      </baps-table>
    `,
  }),
};

/**
 * Dashboard → Projects (Figma 18845:92903). `p-table` in grouped mode —
 * `rowGroupMode="subheader"` + `groupRowsBy="location"`. **Not**
 * `p-treetable`: the tree spine is CSS `::before`/`::after` on
 * `.spm-name-col`, no extra column and no hierarchical data.
 *
 * Collapsing hides a group's rows with `@if` inside the body template
 * rather than rebuilding `value` — the group header still renders, and no
 * new array is allocated per change-detection pass.
 */
export const GroupedProjects: StoryObj<BapsTable> = {
  args: { value: projects, rowGroupMode: 'subheader', groupRowsBy: 'location' },
  render: (args) => ({
    props: {
      ...args,
      statusSeverity: projectStatusSeverity,
      lastInGroup: lastInGroupNames(projects),
      counts: groupCounts(projects),
      // Robbinsvile open (Figma "Default"), Dayton North closed ("Variant2").
      expanded: { Robbinsvile: true, 'Dayton North': false } as Record<string, boolean>,
    },
    template: `
      <baps-table
        [value]="value"
        [brand]="brand"
        [rowGroupMode]="rowGroupMode"
        [groupRowsBy]="groupRowsBy"
        [tableStyle]="{ 'min-width': '64.75rem' }"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Project</th>
            <th style="width: 13.75rem">Duration</th>
            <th style="width: 6.875rem">Karyakars</th>
            <th style="width: 12.5rem">Progress</th>
            <th style="width: 8.125rem">Status</th>
            <th style="width: 4.25rem"><span class="p-hidden-accessible">Actions</span></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="groupheader" let-row>
          <tr class="baps-table-group-row" [class.baps-table-group-collapsed]="!expanded[row.location]">
            <td colspan="6">
              <button
                type="button"
                class="baps-table-group-toggle"
                [attr.aria-expanded]="expanded[row.location]"
                (click)="expanded[row.location] = !expanded[row.location]"
              >
                <i class="pi pi-chevron-right" aria-hidden="true"></i>
                <span>{{ row.location }}</span>
                <span class="baps-table-badge baps-table-badge-sm">
                  {{ counts[row.location] }} {{ counts[row.location] === 1 ? 'Project' : 'Projects' }}
                </span>
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          @if (expanded[row.location]) {
          <tr class="baps-table-child-row">
            <td class="spm-name-col" [class.spm-last-in-group]="lastInGroup.includes(row.name)">
              <div style="display: flex; align-items: center; gap: 0.5rem">
                <baps-avatar variant="secondary">${CHECK_SQUARE_ICON_SVG}</baps-avatar>
                <span class="baps-table-cell">{{ row.name }}</span>
              </div>
            </td>
            <td>{{ row.duration }}</td>
            <td>
              <span class="baps-table-badge">
                <i class="pi pi-users" aria-hidden="true"></i>{{ row.karyakars }}
              </span>
            </td>
            <td>
              <span class="baps-table-progress">
                <baps-progressbar
                  severity="success"
                  [value]="row.done / row.target * 100"
                />
                <span class="baps-table-progress-meta">
                  <span>{{ row.done }} / {{ row.target }} Families</span>
                  <span>{{ row.done / row.target * 100 | number: '1.0-0' }}%</span>
                </span>
              </span>
            </td>
            <td>
              <baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" />
            </td>
            <td class="baps-table-action-cell">
              <button type="button" class="baps-table-action" aria-label="View project">
                <i class="pi pi-eye" aria-hidden="true"></i>
              </button>
            </td>
          </tr>
          }
        </ng-template>
      </baps-table>
    `,
  }),
};

/** One branch per depth, for the level-indent story below. */
const hierarchy = [
  { name: 'North America', level: 1, karyakars: 1840 },
  { name: 'Robbinsvile Region', level: 2, karyakars: 610 },
  { name: 'Robbinsvile Center', level: 3, karyakars: 240 },
  { name: 'Yuvak Mandal', level: 4, karyakars: 96 },
  { name: 'Dayton North Region', level: 2, karyakars: 430 },
];

/**
 * Tree depth, Figma "♻️ Base Table Levels" (13197:89904). The level box
 * measures 22 / 40 / 58 / 76px across levels 1–4 — a flat 18px step, which
 * `_table-sampark.scss` applies as arithmetic on `--baps-table-level`
 * rather than four hand-written positions. Level 1 is the default and
 * needs no class, so the existing `GroupedProjects` spine is untouched.
 *
 * `.spm-level-2/3/4` set the variable from markup; a consumer with deeper
 * or runtime-computed nesting can bind `--baps-table-level` directly and
 * the spine, connector stub and text all shift together.
 */
export const TreeLevels: StoryObj<BapsTable> = {
  args: { value: hierarchy },
  render: (args) => ({
    props: { ...args, lastRow: hierarchy[hierarchy.length - 1].name },
    template: `
      <baps-table [value]="value" [brand]="brand" [tableStyle]="{ 'min-width': '36rem' }">
        <ng-template pTemplate="header">
          <tr>
            <th>Organisation</th>
            <th style="width: 9rem">Karyakars</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td
              class="spm-name-col"
              [class.spm-level-2]="row.level === 2"
              [class.spm-level-3]="row.level === 3"
              [class.spm-level-4]="row.level === 4"
              [class.spm-last-in-group]="row.name === lastRow"
            >
              <span class="baps-table-cell">{{ row.name }}</span>
            </td>
            <td>
              <span class="baps-table-badge">
                <i class="pi pi-users" aria-hidden="true"></i>{{ row.karyakars }}
              </span>
            </td>
          </tr>
        </ng-template>
      </baps-table>
    `,
  }),
};

/**
 * Karyakar assignments (Figma 18708:93907). 56px rows driven by the 36px
 * initials avatar, an expand chevron per row, and a sticky-right task
 * column via `pFrozenColumn alignFrozen="right"`.
 */
export const KaryakarAssignments: StoryObj<BapsTable> = {
  args: { value: karyakars, scrollable: true, scrollHeight: '28rem' },
  render: (args) => ({
    props: {
      ...args,
      statusSeverity: assignmentStatusSeverity,
      expanded: {} as Record<string, boolean>,
    },
    template: `
      <baps-table
        [value]="value"
        [brand]="brand"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeight"
        [tableStyle]="{ 'min-width': '70.75rem' }"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 20.125rem">Karyakar</th>
            <th style="width: 10.625rem">Center</th>
            <th style="width: 9.375rem">Mandal</th>
            <th style="width: 12.5rem">Network</th>
            <th style="width: 10rem">Status</th>
            <th pFrozenColumn alignFrozen="right" style="width: 8.125rem">Tasks</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem">
                <button
                  type="button"
                  class="baps-table-row-toggle"
                  [attr.aria-expanded]="!!expanded[row.name]"
                  [attr.aria-label]="'Expand ' + row.name"
                  (click)="expanded[row.name] = !expanded[row.name]"
                >
                  <i class="pi pi-chevron-right" aria-hidden="true"></i>
                </button>
                <baps-avatar variant="secondary" [label]="row.initials" />
                <span class="baps-table-cell">
                  <span style="display: flex; align-items: center; gap: 0.25rem">
                    {{ row.name }}
                    <span class="baps-table-badge baps-table-badge-sm">
                      <i class="pi pi-users" aria-hidden="true"></i>{{ row.count }}
                    </span>
                  </span>
                  <small>{{ row.role }}</small>
                </span>
              </div>
            </td>
            <td>{{ row.center }}</td>
            <td>{{ row.mandal }}</td>
            <td>{{ row.network }}</td>
            <td>
              <baps-tag [value]="row.status" [severity]="statusSeverity[row.status]" />
            </td>
            <td pFrozenColumn alignFrozen="right">
              <span class="baps-table-badge">
                <i class="pi pi-file-edit" aria-hidden="true"></i>{{ row.tasks }}
                <i class="pi pi-chevron-right" aria-hidden="true"></i>
              </span>
            </td>
          </tr>
        </ng-template>
      </baps-table>
    `,
  }),
};

/** Loading overlay while rows are fetched. */
export const Loading: StoryObj<BapsTable> = {
  args: { loading: true, value: [] },
  render: (args) => ({
    props: args,
    template: `
      <baps-table [value]="value" [brand]="brand" [loading]="loading">
        <ng-template pTemplate="header">
          <tr><th>Template Name</th><th>Status</th></tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr><td>{{ row.name }}</td><td>{{ row.status }}</td></tr>
        </ng-template>
      </baps-table>
    `,
  }),
};

/** Empty state. */
export const Empty: StoryObj<BapsTable> = {
  args: { value: [] },
  render: (args) => ({
    props: args,
    template: `
      <baps-table [value]="value" [brand]="brand">
        <ng-template pTemplate="header">
          <tr><th>Template Name</th><th>Status</th></tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="2">No templates match these filters</td></tr>
        </ng-template>
      </baps-table>
    `,
  }),
};
