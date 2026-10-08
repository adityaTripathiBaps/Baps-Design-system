/**
 * Framework snippets for the Table docs page, keyed by story export name.
 *
 * ## There is a React component now, and the snippets use it

This file predates `BapsTable`. It was written when the only way to get a
table outside Angular was to hand-write one, and its older entry still shows
that: a plain `<table>` carrying the design system's BEM vocabulary, with the
`--table-*` custom properties set directly because the Sampark skin targets
`baps-table .p-datatable-*` and a bare `<table>` never matches it.

That approach still works and is worth knowing. It is no longer what a
consumer should reach for first. `@org/ui-kit-react` ships `BapsTable`, which
emits the 19 `.p-datatable-*` selectors `table.css` actually targets, so the
skin applies without PrimeNG and without hand-written class strings. New
entries below use the component.

The component's API is data in, not templates in: `columns` and `value`
rather than `ng-template`. Sorting is controlled or uncontrolled, and the
difference matters — uncontrolled sorts its own rows, while controlled leaves
row order alone so a server-paged table is never reordered behind its own
pagination.

Not implemented, each a public-API decision: row selection, frozen columns,
virtual scroll, row expansion, column resize and reorder.

## Why this approach and not PrimeReact
 *
 * No snippet in this design system uses PrimeReact. The architecture is:
 * outside Angular you write the HTML the wrapper would have rendered, and the
 * design system's SCSS partials style it. `_button.scss` styles `.baps-button`
 * whether it sits inside Angular's `<baps-button>` or a plain `<button>`.
 *
 * Table is the same shape, only larger. The React tab writes a standard
 * `<table>` element with the design system's BEM class vocabulary — the same
 * `.baps-table-cell`, `.baps-table-cell-lead`, `.baps-table-action`,
 * `.dt-frozen-left` and `.dt-frozen-right` that the Angular template uses.
 *
 * The Sampark skin's CSS targets `baps-table .p-datatable-*`, so a bare
 * `<table>` won't pick those selectors up. Instead the React snippet applies
 * the design tokens DIRECTLY through the `--table-*` custom properties that
 * `_table-sampark.scss` declares on the `:is(baps-table.baps-sampark,
 * .baps-ds-sampark)` scope. In a consuming app the page carries
 * `.baps-ds-sampark` on its body (or a wrapper), so the tokens resolve.
 *
 * For `.baps-table-cell`, `.baps-table-cell-lead`, `.baps-table-action` —
 * these are authored to work inside any table that carries the design
 * system's `--baps-table-*` variables. The React snippet sets them on the
 * table wrapper.
 *
 * ## Inputs become structure
 *
 *   [value]="data"            → the <tbody> rows, written via .map()
 *   [brand]="sampark"         → class "baps-ds-sampark" on a wrapper
 *   [scrollable]="true"       → overflow: auto on the container
 *   scrollHeight="25rem"      → max-height on the container
 *   columns[n].visible        → conditional rendering via &&
 *   columns[n].locked/frozen  → class "dt-frozen-left" + left offset
 *   showColumnConfig          → useState boolean → drawer visibility
 *   onColumnsChange           → setState callback
 *
 * ## Interactive flag
 *
 * The WithColumnConfig snippet carries `interactive: true` because column
 * visibility and the config drawer need React state. The setup note under the
 * React tab explains this.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('table', true);

/* ── Shared data, identical to table.stories.ts ──────────────────────── */
const DATA = `
const templates = [
  {
    name: 'Diwali New Year Prasad - 2025',
    description: 'Celebrate the spirit of Diwali through seva and be a part of the grand festivities at the Mandir.',
    project: 'Family', sampark: 'Home Visit', scope: 'North America', level: 'Center',
    departments: ['Satsang Network'], more: '1',
    duration: '01 Oct 2025 - 15 Nov 2025', cadence: 'Once  (30-45 days)', recurring: false,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Draft',
  },
  {
    name: 'New Family Introduction Drive',
    description: 'Systematically connects with newly joined families and ensures smooth integration into satsang.',
    project: 'Family', sampark: 'Home Visit', scope: 'NorthEast', level: 'Center',
    departments: ['Satsang Network'], more: '+2',
    duration: '01 Jan 2025 - 31 Dec 2025', cadence: 'Every Qtr (10-15 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Event Participation Outreach',
    description: 'Tracks invitations, confirmations, and follow-ups for mandal or shibir events.',
    project: 'Family', sampark: 'Home Visit', scope: 'SouthWest', level: 'Center',
    departments: ['BKY', 'Outreach'], more: '+1',
    duration: '12 Jun 2025 - 18 Jun 2025', cadence: 'Once (7 days)', recurring: false,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Youth Re-Engagement Initiative',
    description: 'Designed to reconnect less-active youths through guided sampark and interest-based touchpoints.',
    project: 'Individual', sampark: 'Phone Call', scope: 'North America', level: 'Center',
    departments: ['Yuvak', 'Yuvati', 'BKY'],
    duration: '15 Aug 2025 - 30 Nov 2025', cadence: 'Ad-hoc (5-7 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Draft',
  },
  {
    name: 'Family Well-Being Check-In',
    description: 'Captures health, career, or personal concerns to provide appropriate sahay, guidance, or prarthana.',
    project: 'Family', sampark: 'Home Visit', scope: 'East', level: 'Center',
    departments: ['Satsang Network'], more: '+3',
    duration: '01 Jan 2025 - 31 Dec 2025', cadence: 'Every Qtr (10-15 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Bal Parent Sampark Plan',
    description: 'Focuses on parents of balaks/balikas to understand attendance, behaviour, and satsang needs.',
    project: 'Family', sampark: 'Home Visit', scope: 'Canada', level: 'Center',
    departments: ['Bal', 'Balika', 'BKY'],
    duration: '01 Jan 2025 - 31 Dec 2025', cadence: 'Half Yearly (10-15 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Festive Greetings & Mahotsav Touchpoints',
    description: 'A structured approach for sending greetings, prasang sharings, and annual festival sampark.',
    project: 'Family', sampark: 'Home Visit', scope: 'North America', level: 'Center',
    departments: ['Satsang Network'], more: '+1',
    duration: '12 Jun 2025 - 18 Jun 2025', cadence: 'Once (7 days)', recurring: false,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Niyam & Daily Satsang Progress Sampark',
    description: "Helps track members' niyam adherence and offers motivation for daily spiritual practices.",
    project: 'Individual', sampark: 'Phone Call', scope: 'North America', level: 'Center',
    departments: ['Satsang Network'], more: '+2',
    duration: '15 Aug 2025 - 30 Nov 2025', cadence: 'Ad-hoc (5-7 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Archived',
  },
];

const statusSeverity: Record<string, string | undefined> = {
  Draft: undefined,
  Published: 'success',
  Archived: 'warn',
};
`;

/* ── Column config data ──────────────────────────────────────────────── */
const COLUMNS = `
const initialColumns = [
  { key: 'name', label: 'Template Name', locked: true, visible: true },
  { key: 'project', label: 'Project / Sampark Type', visible: true },
  { key: 'scope', label: 'Location Scope / Level', visible: true },
  { key: 'departments', label: 'Department/s', visible: true },
  { key: 'duration', label: 'Duration', visible: true },
  { key: 'createdBy', label: 'Created By', visible: true },
  { key: 'status', label: 'Status', visible: true },
];

const COLUMN_WIDTHS: Record<string, string> = {
  name: '21.25rem', project: '12.5rem', scope: '12.5rem',
  departments: '14.0625rem', duration: '14.0625rem',
  createdBy: '14.0625rem', status: '7.5rem',
};

const COLUMN_WIDTH_PX = [340, 200, 200, 225, 225, 225, 120];
`;

/* ── SVG for the lead-cell avatar ────────────────────────────────────── */
const GRID_SVG = `
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);
`;

/* ── Tag helper for React/Next (replaces baps-tag) ───────────────────── */
const TAG_HELPER = `
function Tag({ value, severity }: { value: string; severity?: string }) {
  const cls = ['baps-tag', 'baps-sampark'];
  if (severity === 'success') cls.push('baps-tag--success');
  else if (severity === 'warn') cls.push('baps-tag--warn');
  else if (severity === 'contrast') cls.push('baps-tag--contrast');
  return (
    <span className={cls.join(' ')}>
      <span className="baps-tag__label">{value}</span>
    </span>
  );
}
`;

/* ── Column Config drawer (React state-driven) ───────────────────────── */
const CONFIG_DRAWER = `
function ColumnConfigDrawer({
  visible, columns, onClose, onApply, onReset,
}: {
  visible: boolean;
  columns: { key: string; label: string; locked?: boolean; visible: boolean }[];
  onClose: () => void;
  onApply: (cols: typeof columns) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = React.useState(columns.map(c => ({ ...c })));
  React.useEffect(() => { setDraft(columns.map(c => ({ ...c }))); }, [columns, visible]);

  if (!visible) return null;

  const toggle = (key: string) =>
    setDraft(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));

  return (
    <div className="baps-drawer-backdrop" onClick={onClose}>
      <aside className="baps-drawer baps-sampark" onClick={e => e.stopPropagation()}
             role="dialog" aria-label="Configure columns">
        <div className="baps-drawer__header">
          <h2 className="baps-drawer__title">Fields</h2>
          <button type="button" className="baps-drawer__close" onClick={onClose} aria-label="Close">
            <i className="pi pi-times" aria-hidden="true" />
          </button>
        </div>
        <div className="baps-drawer__body">
          {draft.map(col => (
            <label key={col.key} className="baps-column-config__row">
              <input type="checkbox" checked={col.visible} disabled={col.locked}
                     onChange={() => toggle(col.key)} />
              <span>{col.label}</span>
              {col.locked && <i className="pi pi-lock" aria-hidden="true" style={{ opacity: 0.4 }} />}
            </label>
          ))}
        </div>
        <div className="baps-drawer__footer">
          <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary"
                  onClick={onReset}>Reset Default</button>
          <button type="button" className="baps-button baps-sampark baps-button--primary"
                  onClick={() => { onApply(draft); onClose(); }}>Apply</button>
        </div>
      </aside>
    </div>
  );
}
`;

/* ── The table body markup shared by React and Next ──────────────────── */
const TABLE_BODY = `
      <div className="baps-table-container" style={{ maxHeight: '25rem', overflow: 'auto',
           border: '1px solid var(--table-border, var(--color-sampark-border-default, #e1e0e0))',
           borderRadius: 'var(--radius-sampark-default, 0.25rem)',
           boxShadow: 'var(--shadow-sampark-xs, 0 1px 2px rgba(16,24,40,0.15))' }}>
        <table role="table" style={{ minWidth: '102rem', borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
          <thead>
            <tr>
              {columns.filter(c => c.visible).map((col, i) => {
                const frozen = col.locked || col.frozen;
                const left = frozen ? columns.filter((c2, j) => j < columns.indexOf(col) && (c2.locked || c2.frozen))
                  .reduce((sum, c2) => sum + COLUMN_WIDTH_PX[initialColumns.findIndex(ic => ic.key === c2.key)], 0) : undefined;
                return (
                  <th key={col.key}
                      className={frozen ? 'dt-frozen-left' : ''}
                      style={{
                        width: COLUMN_WIDTHS[col.key],
                        left: left != null ? \`\${left}px\` : undefined,
                        position: frozen ? 'sticky' : undefined,
                        zIndex: frozen ? 2 : undefined,
                        height: '2.5rem',
                        background: 'var(--table-header-bg, var(--color-sampark-mono-10, #f8f7f7))',
                        color: 'var(--table-header-text, var(--color-sampark-mono-60, #9f9c9c))',
                        borderRight: '1px solid var(--table-border, #e1e0e0)',
                        borderBottom: '1px solid var(--table-border, #e1e0e0)',
                        padding: '0 0.75rem',
                        fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                    {col.label}
                  </th>
                );
              })}
              <th className="dt-frozen-right" style={{
                width: '6.0625rem', position: 'sticky', right: 0, zIndex: 2,
                background: 'var(--table-header-bg, #f8f7f7)',
                borderBottom: '1px solid var(--table-border, #e1e0e0)',
                textAlign: 'center',
              }}>
                <button type="button" className="baps-table-action"
                        aria-label="Column settings" onClick={() => setShowConfig(true)}>
                  <i className="pi pi-objects-column" aria-hidden="true" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((row) => (
              <tr key={row.name} style={{
                background: 'var(--table-row-bg, #fff)',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--table-row-hover, #f3f2f2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--table-row-bg, #fff)')}>
                {columns.filter(c => c.visible).map((col) => {
                  const frozen = col.locked || col.frozen;
                  const left = frozen ? columns.filter((c2, j) => j < columns.indexOf(col) && (c2.locked || c2.frozen))
                    .reduce((sum, c2) => sum + COLUMN_WIDTH_PX[initialColumns.findIndex(ic => ic.key === c2.key)], 0) : undefined;
                  const cellStyle: React.CSSProperties = {
                    padding: col.key === 'name' ? '0.625rem 1rem' : '1.125rem 1rem',
                    borderRight: '1px solid var(--table-border, #e1e0e0)',
                    borderBottom: '1px solid var(--table-border, #e1e0e0)',
                    fontSize: '0.875rem', color: 'var(--table-body-text, #151414)',
                    position: frozen ? 'sticky' : undefined,
                    left: left != null ? \`\${left}px\` : undefined,
                    zIndex: frozen ? 1 : undefined,
                    background: 'inherit',
                  };
                  return (
                    <td key={col.key} style={cellStyle}
                        className={col.key === 'name' ? 'baps-table-cell-lead' : ''}>
                      {col.key === 'name' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="baps-avatar baps-avatar-secondary" style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '2rem', height: '2rem', borderRadius: '50%',
                            background: 'var(--color-sampark-mono-10, #f8f7f7)',
                            color: 'var(--color-sampark-text-secondary, #9f9c9c)',
                          }}>
                            <GridIcon />
                          </span>
                          <span className="baps-table-cell" style={{
                            display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0,
                          }}>
                            <span style={{ fontWeight: 500 }}>{row.name}</span>
                            <small style={{
                              fontSize: '0.75rem', color: 'var(--table-secondary-text, #9f9c9c)',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{row.description}</small>
                          </span>
                        </div>
                      )}
                      {col.key === 'project' && (
                        <span className="baps-table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span>{row.project}</span>
                          <small style={{ fontSize: '0.75rem', color: 'var(--table-secondary-text, #9f9c9c)' }}>{row.sampark}</small>
                        </span>
                      )}
                      {col.key === 'scope' && (
                        <span className="baps-table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span>{row.scope}</span>
                          <small style={{ fontSize: '0.75rem', color: 'var(--table-secondary-text, #9f9c9c)' }}>{row.level}</small>
                        </span>
                      )}
                      {col.key === 'departments' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {row.departments.map(d => (
                            <Tag key={d} value={d} severity={d === 'Outreach' ? undefined : 'contrast'} />
                          ))}
                          {row.more && <Tag value={row.more} />}
                        </span>
                      )}
                      {col.key === 'duration' && (
                        <span className="baps-table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {row.duration}
                            {row.recurring && <i className="pi pi-sync" aria-hidden="true" />}
                          </span>
                          <small style={{ fontSize: '0.75rem', color: 'var(--table-secondary-text, #9f9c9c)' }}>{row.cadence}</small>
                        </span>
                      )}
                      {col.key === 'createdBy' && (
                        <span className="baps-table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span>{row.createdBy}</span>
                          <small style={{ fontSize: '0.75rem', color: 'var(--table-secondary-text, #9f9c9c)' }}>{row.createdOn}</small>
                        </span>
                      )}
                      {col.key === 'status' && (
                        <Tag value={row.status} severity={statusSeverity[row.status]} />
                      )}
                    </td>
                  );
                })}
                <td className="dt-frozen-right" style={{
                  position: 'sticky', right: 0, zIndex: 1,
                  borderBottom: '1px solid var(--table-border, #e1e0e0)',
                  background: 'inherit', padding: '0.625rem 1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button type="button" className="baps-table-action" aria-label="Edit">
                      <i className="pi pi-pencil" aria-hidden="true" />
                    </button>
                    <button type="button" className="baps-table-action" aria-label="Delete">
                      <i className="pi pi-trash" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>`;

export const tableSnippets: Record<string, SnippetSet> = {
  // Row grouping is the one thing on this page BapsTable does not do.
  //
  // The Angular side gets it from PrimeNG's rowgroup templates. The React
  // component has no grouping API, and adding one is a real decision — who
  // owns the collapsed state, whether a group header is a row or a section,
  // what a group does to sorting. So this shows the honest alternative:
  // group in the caller and render one table per group. It costs a heading
  // per group and gains an API nobody has to design.
  GroupedProjects: {
    primeng: `<baps-table [value]="rows" rowGroupMode="subheader" groupRowsBy="centre">
  <ng-template pTemplate="groupheader" let-row>
    <tr class="baps-table-group-row"><td colspan="4">{{ row.centre }}</td></tr>
  </ng-template>
</baps-table>`,
    react: `${SETUP}

/* No grouping prop — see the note on this entry. Grouping in the caller keeps
   the table dumb and the collapsed state wherever it already lives. */
export function GroupedProjects({ rows }) {
  const groups = Object.groupBy(rows, (r) => r.centre);

  return (
    <>
      {Object.entries(groups).map(([centre, groupRows]) => (
        <section key={centre}>
          {/* A real heading, so the groups are navigable by landmark rather
              than only visible. */}
          <h3>{centre}</h3>
          <BapsTable columns={COLUMNS} value={groupRows} />
        </section>
      ))}
    </>
  );
}`,
    next: `${SETUP}

/* No 'use client': grouping is a pure transform and can run on the server. */
export default function GroupedProjects({ rows }) {
  const groups = Object.groupBy(rows, (r) => r.centre);

  return (
    <>
      {Object.entries(groups).map(([centre, groupRows]) => (
        <section key={centre}>
          <h3>{centre}</h3>
          <BapsTable columns={COLUMNS} value={groupRows} />
        </section>
      ))}
    </>
  );
}`,
  },

  // The whole screen: toolbar, table, pagination, and the column-config panel
  // the toolbar opens. Worth having as one entry because the wiring between
  // them is the part that is easy to get wrong.
  FullListingPage: {
    primeng: `<baps-toolbar>
  <baps-button label="Columns" (onClick)="configVisible = true" />
</baps-toolbar>

<baps-table [value]="rows" [paginator]="true" [rows]="10" [totalRecords]="total" />

<baps-table-column-config
  [(visible)]="configVisible"
  [columns]="columns"
  (columnsChange)="columns = $event"
/>`,
    react: `${SETUP}

export function ListingPage({ rows, total }) {
  const [columns, setColumns] = useState(ALL_COLUMNS);
  const [configOpen, setConfigOpen] = useState(false);
  const [first, setFirst] = useState(0);

  // The table renders the columns the panel left visible. The panel stages
  // its own edits and only emits on Apply, so this state changes once per
  // Apply rather than once per toggle.
  const visibleColumns = columns.filter((c) => c.visible !== false);

  return (
    <>
      <BapsToolbar>
        <BapsButton severity="secondary" size="small" onClick={() => setConfigOpen(true)}>
          Columns
        </BapsButton>
      </BapsToolbar>

      <BapsTable
        columns={visibleColumns}
        value={rows.slice(first, first + 10)}
      />

      <BapsPagination
        first={first}
        rows={10}
        totalRecords={total}
        onPageChange={(e) => setFirst(e.first)}
      />

      <BapsTableColumnConfig
        visible={configOpen}
        onVisibleChange={setConfigOpen}
        columns={columns}
        onColumnsChange={setColumns}
      />
    </>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' for the panel and the page offset. The rows themselves can
   still be fetched on the server and passed in. */
export default function ListingPage({ rows, total }) {
  const [columns, setColumns] = useState(ALL_COLUMNS);
  const [configOpen, setConfigOpen] = useState(false);
  const [first, setFirst] = useState(0);

  return (
    <>
      <BapsToolbar>
        <BapsButton severity="secondary" size="small" onClick={() => setConfigOpen(true)}>
          Columns
        </BapsButton>
      </BapsToolbar>

      <BapsTable
        columns={columns.filter((c) => c.visible !== false)}
        value={rows.slice(first, first + 10)}
      />

      <BapsPagination first={first} rows={10} totalRecords={total} onPageChange={(e) => setFirst(e.first)} />

      <BapsTableColumnConfig
        visible={configOpen}
        onVisibleChange={setConfigOpen}
        columns={columns}
        onColumnsChange={setColumns}
      />
    </>
  );
}`,
  },

  // A cell is a render function, which is the whole extension point: anything
  // that goes in a cell is yours, and the table stays out of it.
  TreeLevels: {
    primeng: `<baps-table [value]="rows">
  <ng-template pTemplate="body" let-row>
    <tr>
      <td class="baps-table-cell">
        <span class="spm-name-col">{{ row.name }}</span>
        <span class="baps-table-badge">{{ row.count }}</span>
      </td>
    </tr>
  </ng-template>
</baps-table>`,
    react: `${SETUP}

const LEVEL_COLUMNS = [
  {
    field: 'name',
    header: 'Location',
    sortable: true,
    // The BEM classes here are the shared stylesheet's, not this component's
    // — .baps-table-cell and .baps-table-badge ship in table.css and work
    // inside any cell.
    body: (row) => (
      <span className="baps-table-cell">
        <span>{row.name}</span>
        <span className="baps-table-badge">{row.count}</span>
      </span>
    ),
  },
  { field: 'provider', header: 'Provider' },
];

export function LevelsTable({ rows }) {
  return <BapsTable columns={LEVEL_COLUMNS} value={rows} />;
}`,
    next: `${SETUP}

/* No 'use client': render functions run wherever the table does, and nothing
   here holds state. */
export default function LevelsTable({ rows }) {
  return <BapsTable columns={LEVEL_COLUMNS} value={rows} />;
}`,
  },

  // Composition, not configuration: avatars, tags and progress bars are their
  // own components dropped into a cell. The table has no opinion about them.
  KaryakarAssignments: {
    primeng: `<baps-table [value]="rows">
  <ng-template pTemplate="body" let-row>
    <tr>
      <td class="baps-table-cell">
        <baps-avatar [label]="row.initials" size="s" />
        <span>{{ row.name }}</span>
      </td>
      <td><baps-tag [label]="row.status" [severity]="row.severity" /></td>
    </tr>
  </ng-template>
</baps-table>`,
    react: `${SETUP}

const ASSIGNMENT_COLUMNS = [
  {
    field: 'name',
    header: 'Karyakar',
    body: (row) => (
      <span className="baps-table-cell">
        <BapsAvatar label={row.initials} size="s" />
        <span>{row.name}</span>
      </span>
    ),
  },
  {
    field: 'status',
    header: 'Status',
    body: (row) => <BapsTag label={row.status} severity={row.severity} />,
  },
];

export function AssignmentsTable({ rows }) {
  return <BapsTable columns={ASSIGNMENT_COLUMNS} value={rows} />;
}`,
    next: `${SETUP}

export default function AssignmentsTable({ rows }) {
  return <BapsTable columns={ASSIGNMENT_COLUMNS} value={rows} />;
}`,
  },

  // Pagination is a sibling, not a prop. BapsTable renders the rows it is
  // given, so the page slice stays the caller's — which is also what makes a
  // server-paged table possible without a second code path.
  WithPagination: {
    primeng: `<baps-table [value]="rows" [paginator]="true" [rows]="10" [totalRecords]="total" />`,
    react: `${SETUP}

export function PagedTable({ rows }) {
  const [first, setFirst] = useState(0);
  const perPage = 10;

  return (
    <>
      <BapsTable columns={COLUMNS} value={rows.slice(first, first + perPage)} />
      <BapsPagination
        first={first}
        rows={perPage}
        totalRecords={rows.length}
        onPageChange={(e) => setFirst(e.first)}
      />
    </>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' for the page offset. Lift it to a search param if the page
   should survive a refresh or be shareable. */
export default function PagedTable({ rows }) {
  const [first, setFirst] = useState(0);
  const perPage = 10;

  return (
    <>
      <BapsTable columns={COLUMNS} value={rows.slice(first, first + perPage)} />
      <BapsPagination
        first={first}
        rows={perPage}
        totalRecords={rows.length}
        onPageChange={(e) => setFirst(e.first)}
      />
    </>
  );
}`,
  },

  // Sorting CONTROLLED, which is the point of this example. Uncontrolled would
  // sort the ten rows already on screen and leave the other ninety alone — the
  // table would look sorted and be wrong. Controlled means the component never
  // touches row order; it reports the click and the server answers.
  SortableStickyPaginated: {
    primeng: `<baps-table
  [value]="rows"
  sortMode="single"
  [sortField]="sortField"
  [sortOrder]="sortOrder"
  (sortEvent)="onSort($event)"
  [scrollable]="true"
  scrollHeight="25rem"
  [paginator]="true"
/>`,
    react: `${SETUP}

export function ServerSortedTable({ rows, total, onQuery }) {
  const [sort, setSort] = useState({ field: 'name', order: 1 });
  const [first, setFirst] = useState(0);

  // scrollHeight makes the header sticky: the container scrolls, the thead
  // does not.
  return (
    <>
      <BapsTable
        columns={COLUMNS}
        value={rows}
        sortField={sort.field}
        sortOrder={sort.order}
        onSort={(e) => {
          setSort(e);
          setFirst(0);
          onQuery({ ...e, first: 0 });
        }}
        scrollable
        scrollHeight="25rem"
      />
      <BapsPagination
        first={first}
        rows={10}
        totalRecords={total}
        onPageChange={(e) => {
          setFirst(e.first);
          onQuery({ ...sort, first: e.first });
        }}
      />
    </>
  );
}`,
    next: `'use client';

${SETUP}

/* Sorting and paging both belong in the URL for a server-backed listing, so
   this is the component that should read searchParams in a real app. */
export default function ServerSortedTable({ rows, total, onQuery }) {
  const [sort, setSort] = useState({ field: 'name', order: 1 });
  const [first, setFirst] = useState(0);

  return (
    <>
      <BapsTable
        columns={COLUMNS}
        value={rows}
        sortField={sort.field}
        sortOrder={sort.order}
        onSort={(e) => {
          setSort(e);
          setFirst(0);
          onQuery({ ...e, first: 0 });
        }}
        scrollable
        scrollHeight="25rem"
      />
      <BapsPagination first={first} rows={10} totalRecords={total} onPageChange={(e) => setFirst(e.first)} />
    </>
  );
}`,
  },

  // Sorting is uncontrolled here: the component sorts its own rows. onSort
  // still fires, so a caller can record it without taking ownership.
  Default: {
    primeng: `<baps-table [value]="rows" sortMode="single">
  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="name">Name <baps-sort-icon [order]="0" /></th>
      <th pSortableColumn="centre">Centre <baps-sort-icon [order]="0" /></th>
      <th>Role</th>
      <th>Status</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-row>
    <tr>
      <td>{{ row.name }}</td>
      <td>{{ row.centre }}</td>
      <td>{{ row.role }}</td>
      <td>{{ row.status }}</td>
    </tr>
  </ng-template>
</baps-table>`,
    react: `${SETUP}

const COLUMNS = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'centre', header: 'Centre', sortable: true },
  { field: 'role', header: 'Role' },
  { field: 'status', header: 'Status' },
];

const ROWS = [
  { name: 'Hiren Patel', centre: 'Edison', role: 'Coordinator', status: 'Active' },
  { name: 'Anjali Shah', centre: 'Toronto', role: 'Volunteer', status: 'Active' },
  { name: 'Rakesh Desai', centre: 'Houston', role: 'Lead', status: 'Inactive' },
];

export function MemberTable({ onSort }) {
  // columns + value, not templates. A column is sortable because it says so,
  // and the header button, its aria-sort and the icon all follow from that.
  return <BapsTable columns={COLUMNS} value={ROWS} onSort={onSort} />;
}`,
    next: `${SETUP}

/* No 'use client': uncontrolled sorting lives inside the component, and this
   page holds nothing of its own. Add it when you lift sortField up. */
const COLUMNS = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'centre', header: 'Centre', sortable: true },
  { field: 'role', header: 'Role' },
  { field: 'status', header: 'Status' },
];

const ROWS = [
  { name: 'Hiren Patel', centre: 'Edison', role: 'Coordinator', status: 'Active' },
  { name: 'Anjali Shah', centre: 'Toronto', role: 'Volunteer', status: 'Active' },
  { name: 'Rakesh Desai', centre: 'Houston', role: 'Lead', status: 'Inactive' },
];

export default function MemberTable() {
  return <BapsTable columns={COLUMNS} value={ROWS} />;
}`,
  },

  // Compact is one prop. The row height, cell padding and font size all come
  // from .p-datatable-sm in the shared stylesheet, so there is nothing to
  // restyle per table.
  Compact: {
    primeng: `<baps-table [value]="rows" size="small" />`,
    react: `${SETUP}

export function CompactTable() {
  return <BapsTable columns={COLUMNS} value={ROWS} size="small" />;
}`,
    next: `${SETUP}

export default function CompactTable() {
  return <BapsTable columns={COLUMNS} value={ROWS} size="small" />;
}`,
  },

  // Loading marks the container busy and leaves the rows in place, so a
  // reader keeps what they had and the change is announced rather than shown.
  Loading: {
    primeng: `<baps-table [value]="rows" [loading]="true" />`,
    react: `${SETUP}

export function LoadingTable({ loading }) {
  // aria-busy goes on the scroll container; the mask over it is decoration
  // and is marked aria-hidden.
  return <BapsTable columns={COLUMNS} value={ROWS} loading={loading} />;
}`,
    next: `${SETUP}

export default function LoadingTable({ loading }) {
  return <BapsTable columns={COLUMNS} value={ROWS} loading={loading} />;
}`,
  },

  // Empty is a row spanning every column, not a blank body: a table with a
  // head and nothing under it reads as broken rather than as "no results".
  Empty: {
    primeng: `<baps-table [value]="[]">
  <ng-template pTemplate="emptymessage">
    <tr><td colspan="4">No results found</td></tr>
  </ng-template>
</baps-table>`,
    react: `${SETUP}

export function EmptyTable() {
  // emptyMessage takes a node, so it can carry an illustration or a "clear
  // filters" action instead of a sentence.
  return <BapsTable columns={COLUMNS} value={[]} emptyMessage="No results found" />;
}`,
    next: `${SETUP}

export default function EmptyTable() {
  return <BapsTable columns={COLUMNS} value={[]} emptyMessage="No results found" />;
}`,
  },

  WithColumnConfig: {
    interactive: true,
    primeng: `<baps-table
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
        <button type="button" class="baps-table-action" aria-label="Column settings"
          (click)="showColumnConfig = true">
          <i class="pi pi-objects-column" aria-hidden="true"></i>
        </button>
      </th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-row>
    <tr>
      <!-- cells per column, with frozen/visible logic -->
    </tr>
  </ng-template>
</baps-table>

<baps-table-column-config
  [(visible)]="showColumnConfig"
  [columns]="columns"
  [defaultColumns]="defaultColumns"
  (columnsChange)="onColumnsChange($event)"
/>`,
    react: `${SETUP}

import React, { useState } from 'react';
${DATA}
${COLUMNS}
${GRID_SVG}
${TAG_HELPER}
${CONFIG_DRAWER}

export function WithColumnConfig() {
  const [columns, setColumns] = useState(initialColumns.map(c => ({ ...c })));
  const [showConfig, setShowConfig] = useState(false);
${TABLE_BODY}

  return (
    <div className="baps-ds-sampark">
      <div className="baps-table-surface" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
{TABLE_BODY}
      </div>
      <ColumnConfigDrawer
        visible={showConfig}
        columns={columns}
        onClose={() => setShowConfig(false)}
        onApply={(next) => setColumns(next)}
        onReset={() => setColumns(initialColumns.map(c => ({ ...c })))}
      />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

import React, { useState } from 'react';
${DATA}
${COLUMNS}
${GRID_SVG}
${TAG_HELPER}
${CONFIG_DRAWER}

export default function WithColumnConfig() {
  const [columns, setColumns] = useState(initialColumns.map(c => ({ ...c })));
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="baps-ds-sampark">
      <div className="baps-table-surface" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
${TABLE_BODY}
      </div>
      <ColumnConfigDrawer
        visible={showConfig}
        columns={columns}
        onClose={() => setShowConfig(false)}
        onApply={(next) => setColumns(next)}
        onReset={() => setColumns(initialColumns.map(c => ({ ...c })))}
      />
    </div>
  );
}`,
  },
};
