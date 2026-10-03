const fs = require('fs');
const path = 'D:\\baps-projects\\react-app-shell-sampark\\src\\components\\Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the old hardcoded Paginator with a proper interactive one
const OLD_PAGINATOR = /function Paginator\(\)[\s\S]*?\n\}\n/;

const NEW_PAGINATOR = `/* -- Page-link truncation algorithm (same as design system's baps-paginator) */
function getPages(current: number, totalPages: number): (number | null)[] {
  const keep = new Set([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]);
  const sorted = [...keep].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push(null);
    out.push(n);
    prev = n;
  }
  return out;
}

/* -- Paginator: pure React, using the design system's BEM class vocabulary
   (.baps-paginator, __nav, __page, __report, __jump, __gap).
   Sampark styling comes from the parent .baps-ds-sampark scope. */
function Paginator({
  totalRecords,
  rowsPerPage,
  page,
  onPageChange,
  onRowsChange,
}: {
  totalRecords: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (page: number) => void;
  onRowsChange: (rows: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);
  const first = totalRecords === 0 ? 0 : page * rowsPerPage + 1;
  const last = Math.min((page + 1) * rowsPerPage, totalRecords);

  const goTo = (p: number) => onPageChange(Math.max(0, Math.min(p, pageCount - 1)));

  return (
    <nav className="baps-paginator" role="navigation" aria-label="Pagination">
      <span className="baps-paginator__report">
        Showing {first}-{last} of {totalRecords}
      </span>

      <select
        className="baps-paginator__rpp"
        value={rowsPerPage}
        onChange={e => onRowsChange(+e.target.value)}
        aria-label="Rows per page"
        style={{
          height: 'var(--form-field-sampark-height-default, 2rem)',
          border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
          borderRadius: 'var(--radius-sampark-default, 0.25rem)',
          padding: '0 1.5rem 0 0.5rem',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          color: 'var(--color-sampark-text-primary, #151414)',
          background: 'var(--color-sampark-surface-card, #fff)',
          cursor: 'pointer',
          appearance: 'auto',
        }}
      >
        {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
      </select>

      <button type="button" className="baps-paginator__nav" disabled={page === 0}
              aria-label="First page" onClick={() => goTo(0)}>
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page === 0}
              aria-label="Previous page" onClick={() => goTo(page - 1)}>
        <i className="pi pi-angle-left" aria-hidden="true" />
      </button>

      {pages.map((p, i) =>
        p === null
          ? <span key={'gap' + i} className="baps-paginator__gap" aria-hidden="true">...</span>
          : <button key={p} type="button"
              className={'baps-paginator__page' + (p - 1 === page ? ' baps-paginator__page--active' : '')}
              aria-current={p - 1 === page ? 'page' : undefined}
              aria-label={'Page ' + p}
              onClick={() => goTo(p - 1)}>{p}</button>
      )}

      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1}
              aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1}
              aria-label="Last page" onClick={() => goTo(pageCount - 1)}>
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>

      <span className="baps-paginator__jump">
        <span className="baps-paginator__jump-label">Go to</span>
        <input
          className="baps-paginator__jump-input"
          type="text"
          inputMode="numeric"
          defaultValue={page + 1}
          key={page}
          aria-label="Go to page"
          onKeyDown={e => { if (e.key === 'Enter') { goTo(+e.currentTarget.value - 1); e.currentTarget.blur(); } }}
          onBlur={e => goTo(+e.currentTarget.value - 1)}
        />
      </span>
    </nav>
  );
}
`;

if (content.match(OLD_PAGINATOR)) {
  content = content.replace(OLD_PAGINATOR, NEW_PAGINATOR);
  console.log('Replaced old Paginator with interactive version.');
} else {
  console.log('Old Paginator pattern not found, inserting before Table export.');
  // Insert before export function Table()
  content = content.replace('export function Table()', NEW_PAGINATOR + '\\nexport function Table()');
}

// Now update Table() to have pagination state and pass it to Paginator
// Replace the static <Paginator /> with props
content = content.replace(
  '<Paginator />',
  '<Paginator totalRecords={250} rowsPerPage={rowsPerPage} page={currentPage} onPageChange={setCurrentPage} onRowsChange={(r) => { setRowsPerPage(r); setCurrentPage(0); }} />'
);

// Add state for pagination inside Table() function
// Find "const [columns, setColumns]" and add pagination state after it
if (!content.includes('const [currentPage')) {
  content = content.replace(
    'const [columns, setColumns] = useState(initialColumns.map(c => ({ ...c })));',
    `const [columns, setColumns] = useState(initialColumns.map(c => ({ ...c })));
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);`
  );
}

fs.writeFileSync(path, content);
console.log('Table.tsx updated with interactive Paginator.');
