import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { BapsToolbar } from '../components/toolbar/toolbar.component';
import { BapsTable } from '../components/table/table.component';
import { BapsPaginator } from '../components/pagination/pagination.component';
import { BapsCheckbox } from '../components/checkbox/checkbox.component';
import { BapsSelect } from '../components/select/select.component';
import { BapsButton } from '../components/button/button.component';
import { BapsTag } from '../components/tag/tag.component';
import { BapsAlert } from '../components/alert/alert.component';
import { BapsAvatar } from '../components/avatar/avatar.component';
import { BapsIconField } from '../components/form-field/icon-field.component';
import { BapsInputIcon } from '../components/form-field/input-icon.component';
import { BapsInputText } from '../components/form-field/directives/input-text.directive';

/**
 * The data-management screen — one page that carries search, filtering, row
 * selection with select-all, a bulk-actions bar, pagination, and the three
 * states a list can be in when it has no rows to show (loading, genuinely
 * empty, filtered to nothing).
 *
 * Each of those is documented on its own elsewhere: `Components → Table` has
 * `Loading` and `Empty`, `Components → Pagination` has the paginator,
 * `Components → Toolbar` has a search field. What none of them can show is
 * how the pieces interact — that filtering must reset the page offset, that
 * selection must survive a page change or be visibly discarded, that the
 * empty state has to say something different depending on *why* it is empty.
 * The bugs in a listing screen live in those seams, so that is what this
 * pattern is for.
 *
 * Composed entirely from existing components. Two things it wanted and could
 * not get — an indeterminate select-all checkbox, and PrimeNG's own
 * `p-tableCheckbox` row-selection directives — are gaps recorded in the mdx
 * rather than papered over with a new component.
 */
const meta: Meta = {
  title: 'Patterns/Data management',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        SharedModule,
        TableModule,
        BapsToolbar,
        BapsTable,
        BapsPaginator,
        BapsCheckbox,
        BapsSelect,
        BapsButton,
        BapsTag,
        BapsAlert,
        BapsAvatar,
        BapsIconField,
        BapsInputIcon,
        BapsInputText,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

interface Karyakar {
  id: number;
  initials: string;
  name: string;
  email: string;
  center: string;
  mandal: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

const NAMES: [string, string, string, string, Karyakar['status']][] = [
  ['Yash Shah', 'Bordentown', 'Yuvak', 'G-Sampark', 'Active'],
  ['Uttara Patel', 'Bordentown', 'Yuvti', 'Coordinator', 'Pending'],
  ['Lakshmi Rao', 'Bordentown', 'Sanyukta', 'G-Sampark', 'Active'],
  ['Vedant Kothari', 'Dayton North', 'Sanyukta', 'Karyakar', 'Inactive'],
  ['Tanvi Joshi', 'Dayton North', 'Yuvti', 'G-Sampark', 'Active'],
  ['Rohan Patel', 'Dayton North', 'Yuvak', 'Coordinator', 'Pending'],
  ['Shruti Gohel', 'Robbinsville', 'Sanyukta', 'Karyakar', 'Active'],
  ['Divya Jain', 'Robbinsville', 'Yuvti', 'G-Sampark', 'Pending'],
  ['Devang Patel', 'Robbinsville', 'Yuvak', 'Coordinator', 'Active'],
  ['Milan Patel', 'Edison', 'Yuvak', 'Karyakar', 'Inactive'],
  ['Nikita Desai', 'Edison', 'Yuvti', 'G-Sampark', 'Active'],
  ['Parth Mehta', 'Edison', 'Yuvak', 'Karyakar', 'Pending'],
  ['Anjali Trivedi', 'Bordentown', 'Sanyukta', 'Coordinator', 'Active'],
  ['Harsh Bhatt', 'Dayton North', 'Yuvak', 'Karyakar', 'Active'],
  ['Priya Amin', 'Robbinsville', 'Yuvti', 'G-Sampark', 'Inactive'],
  ['Kunal Vyas', 'Edison', 'Yuvak', 'Coordinator', 'Pending'],
  ['Meera Dave', 'Bordentown', 'Yuvti', 'Karyakar', 'Active'],
  ['Ronak Shah', 'Dayton North', 'Yuvak', 'G-Sampark', 'Active'],
  ['Sneha Modi', 'Robbinsville', 'Sanyukta', 'Coordinator', 'Pending'],
  ['Aarav Thakkar', 'Edison', 'Yuvak', 'Karyakar', 'Inactive'],
  ['Ishita Pandya', 'Bordentown', 'Yuvti', 'G-Sampark', 'Active'],
  ['Jay Solanki', 'Dayton North', 'Yuvak', 'Karyakar', 'Pending'],
  ['Krishna Raval', 'Robbinsville', 'Sanyukta', 'G-Sampark', 'Active'],
  ['Nishi Chauhan', 'Edison', 'Yuvti', 'Coordinator', 'Active'],
  ['Om Gandhi', 'Bordentown', 'Yuvak', 'Karyakar', 'Inactive'],
  ['Riya Kapadia', 'Dayton North', 'Yuvti', 'G-Sampark', 'Pending'],
];

const KARYAKARS: Karyakar[] = NAMES.map(([name, center, mandal, role, status], i) => ({
  id: i + 1,
  initials: name
    .split(' ')
    .map((p) => p[0])
    .join(''),
  name,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@baps.dev`,
  center,
  mandal,
  role,
  status,
}));

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Inactive', value: 'Inactive' },
];

const CENTER_OPTIONS = [...new Set(KARYAKARS.map((k) => k.center))].map((c) => ({
  label: c,
  value: c,
}));

/** Figma chip mapping: Active → success, Pending → warn, Inactive → grey. */
const statusSeverity: Record<string, string | undefined> = {
  Active: 'success',
  Pending: 'warn',
  Inactive: undefined,
};

interface ScreenOptions {
  /** Rows the "server" holds. Empty array = the genuinely-empty state. */
  rows?: Karyakar[];
  /** Pre-filled search term — used to land the story straight on no-results. */
  query?: string;
  /** Pins the loading overlay on. */
  loading?: boolean;
}

/**
 * One render factory for every story on this page. The state stories are the
 * *same screen* with different starting state, not simplified stand-ins for
 * it — an empty-state story that drops the toolbar and paginator hides the
 * layout bugs those states actually cause.
 *
 * Everything mutable lives on one `ui` object. Storybook copies `props` by
 * value into its wrapper component, so a captured `let selected = []`
 * reassigned in a handler would never reach the template; reading `ui.x` in
 * the template is what keeps it live. Same fix as crud-form's `ui` and
 * table.stories' `pageState`.
 */
function dataManagementScreen({ rows = KARYAKARS, query = '', loading = false }: ScreenOptions = {}) {
  const ui = {
    query,
    status: null as string | null,
    center: null as string | null,
    first: 0,
    rows: 10,
    /** Selected row ids. Ids, not row objects — see the mdx. */
    selected: [] as number[],
    loading,
    lastBulkAction: null as string | null,
  };

  const filtered = () => {
    const q = ui.query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) &&
        (!ui.status || r.status === ui.status) &&
        (!ui.center || r.center === ui.center),
    );
  };
  const pageRows = () => filtered().slice(ui.first, ui.first + ui.rows);

  return {
    props: {
      ui,
      statusOptions: STATUS_OPTIONS,
      centerOptions: CENTER_OPTIONS,
      statusSeverity,
      filtered,
      pageRows,
      hasFilters: () => !!ui.query.trim() || !!ui.status || !!ui.center,

      // ── Search + filtering ────────────────────────────────────────────
      // Both reset `first`. Without it, filtering 26 rows down to 3 while
      // sitting on page 3 shows an empty table over a paginator insisting
      // there are results — the single most common bug in this screen shape.
      onSearch: (value: string) => {
        ui.query = value;
        ui.first = 0;
      },
      onFilter: (key: 'status' | 'center', value: string | null) => {
        ui[key] = value;
        ui.first = 0;
      },
      clearFilters: () => {
        ui.query = '';
        ui.status = null;
        ui.center = null;
        ui.first = 0;
      },

      // ── Selection ─────────────────────────────────────────────────────
      isSelected: (row: Karyakar) => ui.selected.includes(row.id),
      toggleRow: (row: Karyakar, checked: boolean) => {
        ui.selected = checked
          ? [...ui.selected, row.id]
          : ui.selected.filter((id) => id !== row.id);
      },
      /** Header checkbox reflects the CURRENT PAGE only, like PrimeNG's own. */
      allOnPageSelected: () => {
        const page = pageRows();
        return page.length > 0 && page.every((r) => ui.selected.includes(r.id));
      },
      toggleAllOnPage: (checked: boolean) => {
        const pageIds = pageRows().map((r) => r.id);
        ui.selected = checked
          ? [...new Set([...ui.selected, ...pageIds])]
          : ui.selected.filter((id) => !pageIds.includes(id));
      },
      selectAllMatching: () => {
        ui.selected = filtered().map((r) => r.id);
      },
      clearSelection: () => {
        ui.selected = [];
      },

      // ── Bulk actions ──────────────────────────────────────────────────
      runBulk: (action: string) => {
        ui.lastBulkAction = `${action} — ${ui.selected.length} karyakar${ui.selected.length === 1 ? '' : 's'}`;
        ui.selected = [];
      },

      onPage: (e: { first: number; rows: number }) => {
        ui.first = e.first;
        ui.rows = e.rows;
      },
    },
    template: `
      <div style="display:flex; flex-direction:column; height:40rem; gap:0.5rem;">
        <baps-toolbar title="Karyakars">
          <baps-iconfield toolbar-right>
            <baps-inputicon styleClass="pi pi-search" />
            <input
              bapsInputText
              class="search-input"
              type="search"
              placeholder="Search name or email"
              aria-label="Search karyakars"
              [ngModel]="ui.query"
              (ngModelChange)="onSearch($event)"
            />
          </baps-iconfield>

          <baps-select
            toolbar-right
            brand="sampark"
            ariaLabel="Filter by status"
            placeholder="Status"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            [ngModel]="ui.status"
            (ngModelChange)="onFilter('status', $event)"
          />

          <baps-select
            toolbar-right
            brand="sampark"
            ariaLabel="Filter by center"
            placeholder="Center"
            [options]="centerOptions"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            [ngModel]="ui.center"
            (ngModelChange)="onFilter('center', $event)"
          />

          @if (hasFilters()) {
            <baps-button
              toolbar-right
              brand="sampark"
              label="Clear"
              severity="secondary"
              [text]="true"
              (click)="clearFilters()"
            />
          }

          <baps-button toolbar-right brand="sampark" label="Add Karyakar" icon="pi pi-plus" />
        </baps-toolbar>

        @if (ui.lastBulkAction) {
          <baps-alert
            brand="sampark"
            severity="success"
            [text]="ui.lastBulkAction"
            [closable]="true"
            (closed)="ui.lastBulkAction = null"
          />
        }

        <!-- Bulk-actions bar. Occupies no space until something is selected,
             and is a sibling ABOVE the table surface rather than a floating
             overlay, so it never covers the last row it is acting on. -->
        @if (ui.selected.length) {
          <div
            role="region"
            aria-label="Bulk actions"
            style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; padding:0.5rem 0.75rem; border-radius:0.5rem; background:var(--color-sampark-primary-5, #fdf5f5); border:1px solid var(--color-sampark-primary-20, #e9c3c3);"
          >
            <strong style="font-size:0.875rem;">{{ ui.selected.length }} selected</strong>

            @if (ui.selected.length < filtered().length) {
              <baps-button
                brand="sampark"
                size="small"
                [link]="true"
                [label]="'Select all ' + filtered().length + ' matching'"
                (click)="selectAllMatching()"
              />
            }

            <span style="flex:1"></span>

            <baps-button brand="sampark" size="small" label="Assign project" icon="pi pi-user-plus" severity="secondary" [outlined]="true" (click)="runBulk('Assigned to project')" />
            <baps-button brand="sampark" size="small" label="Export" icon="pi pi-download" severity="secondary" [outlined]="true" (click)="runBulk('Exported')" />
            <baps-button brand="sampark" size="small" label="Delete" icon="pi pi-trash" severity="danger" (click)="runBulk('Deleted')" />
            <baps-button brand="sampark" size="small" label="Clear" [text]="true" severity="secondary" (click)="clearSelection()" />
          </div>
        }

        <div class="baps-table-surface" style="flex:1; min-height:0;">
          <baps-table
            brand="sampark"
            [value]="pageRows()"
            [loading]="ui.loading"
            [scrollable]="true"
            scrollHeight="flex"
            [tableStyle]="{ 'min-width': '62rem' }"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 3.5rem">
                  <baps-checkbox
                    brand="sampark"
                    inputId="dm-select-all"
                    [ngModel]="allOnPageSelected()"
                    (ngModelChange)="toggleAllOnPage($event)"
                  />
                  <label for="dm-select-all" class="p-hidden-accessible">Select all rows on this page</label>
                </th>
                <th style="width: 20rem">Karyakar</th>
                <th style="width: 11rem">Center</th>
                <th style="width: 9rem">Mandal</th>
                <th style="width: 11rem">Role</th>
                <th style="width: 8rem">Status</th>
                <th style="width: 6rem"><span class="p-hidden-accessible">Actions</span></th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row>
              <!-- .p-datatable-row-selected is PrimeNG's own class, and
                   _table-sampark.scss already skins it (including the frozen
                   columns). Setting it by hand reuses that skin; the
                   directive that would normally set it, pSelectableRow,
                   cannot be used here — see the mdx. -->
              <tr [class.p-datatable-row-selected]="isSelected(row)">
                <td>
                  <baps-checkbox
                    brand="sampark"
                    [inputId]="'dm-row-' + row.id"
                    [ngModel]="isSelected(row)"
                    (ngModelChange)="toggleRow(row, $event)"
                  />
                  <label [for]="'dm-row-' + row.id" class="p-hidden-accessible">Select {{ row.name }}</label>
                </td>
                <td class="baps-table-cell-lead">
                  <div style="display:flex; align-items:center; gap:0.5rem">
                    <baps-avatar brand="sampark" variant="secondary" [label]="row.initials" />
                    <span class="baps-table-cell">{{ row.name }}<small>{{ row.email }}</small></span>
                  </div>
                </td>
                <td>{{ row.center }}</td>
                <td>{{ row.mandal }}</td>
                <td>{{ row.role }}</td>
                <td><baps-tag brand="sampark" [value]="row.status" [severity]="statusSeverity[row.status]" /></td>
                <td class="baps-table-action-cell">
                  <div style="display:flex; align-items:center; gap:0.25rem">
                    <button type="button" class="baps-table-action" [attr.aria-label]="'Edit ' + row.name">
                      <i class="pi pi-pencil" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="baps-table-action" [attr.aria-label]="'Delete ' + row.name">
                      <i class="pi pi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <!-- One template, two messages. "No results" and "nothing here
                 yet" are different situations and need different exits: one
                 offers Clear filters, the other offers Add. -->
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" style="text-align:center; padding:2.5rem 1rem;">
                  @if (hasFilters()) {
                    <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem;">
                      <i class="pi pi-search" style="font-size:1.5rem; opacity:0.4;" aria-hidden="true"></i>
                      <strong>No karyakars match these filters</strong>
                      <span style="opacity:0.7; font-size:0.875rem;">Try a different search term, or clear the filters.</span>
                      <baps-button brand="sampark" size="small" label="Clear filters" severity="secondary" [outlined]="true" (click)="clearFilters()" />
                    </div>
                  } @else {
                    <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem;">
                      <i class="pi pi-users" style="font-size:1.5rem; opacity:0.4;" aria-hidden="true"></i>
                      <strong>No karyakars yet</strong>
                      <span style="opacity:0.7; font-size:0.875rem;">Add the first karyakar to this center to get started.</span>
                      <baps-button brand="sampark" size="small" label="Add Karyakar" icon="pi pi-plus" />
                    </div>
                  }
                </td>
              </tr>
            </ng-template>
          </baps-table>
        </div>

        <baps-paginator
          brand="sampark"
          [totalRecords]="filtered().length"
          [rows]="ui.rows"
          [first]="ui.first"
          [rowsPerPageOptions]="[10, 20, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
          [showJumpToPage]="true"
          (pageChange)="onPage($event)"
        />
      </div>
    `,
  };
}

/**
 * The whole screen, working. Things worth actually trying rather than
 * reading about:
 *
 * - Tick two rows, page forward, page back — the selection is still there,
 *   because `ui.selected` holds **ids**, not row objects. Hold row objects
 *   and the identity check breaks the moment the page slice is re-created.
 * - Tick every row on page 1, then use "Select all 26 matching" in the bulk
 *   bar. Header-checkbox select-all is page-scoped (that is what users
 *   expect from a checkbox in a column header); crossing the page boundary
 *   is a separate, explicit action.
 * - Go to page 3, then type in the search box. The page snaps back to 1 —
 *   `onSearch` resets `first`. Skip that reset and you get a blank table
 *   under a paginator claiming there are results.
 * - Search for something nonsense to reach the no-results state in place.
 */
export const Default: Story = {
  render: () => dataManagementScreen(),
};

/**
 * Filtered to nothing. The empty cell has to explain *why* it is empty and
 * offer the exit that matches — here, Clear filters. Offering "Add Karyakar"
 * in this state would be answering a question nobody asked: there are 26
 * karyakars, the search just does not match any of them.
 */
export const NoResults: Story = {
  render: () => dataManagementScreen({ query: 'chandrakant' }),
};

/**
 * Nothing to manage yet — a new center, before anyone has been added. Same
 * `emptymessage` template, other branch: no filters are set, so this is the
 * onboarding message and the Add action.
 *
 * The toolbar and paginator still render. That is deliberate: they are
 * page furniture, and a screen that grows a toolbar the moment its first row
 * arrives reflows under the user.
 */
export const Empty: Story = {
  render: () => dataManagementScreen({ rows: [] }),
};

/**
 * Fetching. `[loading]` puts PrimeNG's overlay over the table body only —
 * the toolbar stays interactive, which is right (a user can keep refining
 * the search) and also a trap (that refinement must not be lost when the
 * response lands).
 */
export const Loading: Story = {
  render: () => dataManagementScreen({ rows: [], loading: true }),
};
