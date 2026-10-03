/**
 * Framework snippets for the Pagination docs page, keyed by story export name.
 *
 * ## Why the React snippet is pure markup, not a library wrapper
 *
 * `baps-paginator` is the one component in this design system that does NOT
 * wrap PrimeNG. Its template is plain HTML with BEM classes —
 * `.baps-paginator`, `.baps-paginator__nav`, `.baps-paginator__page`,
 * `.baps-paginator__jump` — and all styling is in the component's own inline
 * `styles` block. Outside Angular you write the same HTML with the same
 * classes, and the design system's compiled CSS styles it.
 *
 * The React snippet adds `useState` for `page` and `rowsPerPage` because
 * pagination is inherently interactive: clicking a page number must update
 * the active page, and the "Go to" field must commit on Enter/blur. The
 * `interactive: true` flag triggers the standard note in the docs tab.
 *
 * ## Inputs become structure
 *
 *   [totalRecords]="250"              → totalRecords constant
 *   [rows]="20"                       → rowsPerPage state
 *   [first]="0"                       → derived from page * rowsPerPage
 *   [rowsPerPageOptions]="[10,20,50]" → <select> options
 *   [showCurrentPageReport]="true"    → "Showing X-Y of Z" span
 *   [showJumpToPage]="true"           → "Go to" input group
 *   [showFirstLastIcon]="true"        → « and » buttons
 *   brand="sampark"                   → class "baps-sampark" on host
 *
 * ## Page-link truncation
 *
 * The truncation algorithm is reproduced in the React snippet — first two,
 * last two, current ±1, with null gaps — because it is the defining feature
 * of this paginator vs PrimeNG's consecutive-window approach.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('pagination', true);

/* ── Shared page-link algorithm, used in every interactive snippet ──── */
const PAGES_FN = `
function getPages(current, totalPages) {
  const keep = new Set([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]);
  const sorted = [...keep].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push(null);
    out.push(n);
    prev = n;
  }
  return out;
}`;

export const paginationSnippets: Record<string, SnippetSet> = {

  /* ── Default (full strip) ──────────────────────────────────────────── */
  Default: {
    interactive: true,
    custom: `<!-- Full pagination strip: count, rows-per-page, first/prev, truncated
     page links, next/last, and "Go to". The .baps-paginator class vocabulary
     matches the Angular component's own template 1-for-1. -->
<div class="baps-ds-sampark">
  <nav class="baps-paginator" aria-label="Pagination">
    <span class="baps-paginator__report">Showing 1-20 of 250</span>
    <select class="baps-paginator__rpp" aria-label="Rows per page">
      <option value="10">10</option>
      <option value="20" selected>20</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
    <button type="button" class="baps-paginator__nav" disabled aria-label="First page">
      <i class="pi pi-angle-double-left" aria-hidden="true"></i>
    </button>
    <button type="button" class="baps-paginator__nav" disabled aria-label="Previous page">
      <i class="pi pi-angle-left" aria-hidden="true"></i>
    </button>
    <button type="button" class="baps-paginator__page baps-paginator__page--active" aria-current="page" aria-label="Page 1">1</button>
    <button type="button" class="baps-paginator__page" aria-label="Page 2">2</button>
    <span class="baps-paginator__gap" aria-hidden="true">...</span>
    <button type="button" class="baps-paginator__page" aria-label="Page 12">12</button>
    <button type="button" class="baps-paginator__page" aria-label="Page 13">13</button>
    <button type="button" class="baps-paginator__nav" aria-label="Next page">
      <i class="pi pi-angle-right" aria-hidden="true"></i>
    </button>
    <button type="button" class="baps-paginator__nav" aria-label="Last page">
      <i class="pi pi-angle-double-right" aria-hidden="true"></i>
    </button>
    <span class="baps-paginator__jump">
      <span class="baps-paginator__jump-label">Go to</span>
      <input type="text" class="baps-paginator__jump-input" inputmode="numeric" value="1" aria-label="Go to page" />
    </span>
  </nav>
</div>`,
    react: `${SETUP}

import { useState, useCallback } from 'react';
${PAGES_FN}

export function PaginationDefault() {
  const totalRecords = 250;
  const rowsOptions = [10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);
  const first = page * rowsPerPage + 1;
  const last = Math.min((page + 1) * rowsPerPage, totalRecords);

  const goTo = useCallback((p) => setPage(Math.max(0, Math.min(p, pageCount - 1))), [pageCount]);

  return (
    <nav className="baps-paginator" aria-label="Pagination">
      <span className="baps-paginator__report">
        Showing {first}-{last} of {totalRecords}
      </span>
      <select
        className="baps-paginator__rpp"
        value={rowsPerPage}
        onChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
        aria-label="Rows per page"
      >
        {rowsOptions.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="First page" onClick={() => goTo(0)}>
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="Previous page" onClick={() => goTo(page - 1)}>
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
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Last page" onClick={() => goTo(pageCount - 1)}>
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>
      <span className="baps-paginator__jump">
        <span className="baps-paginator__jump-label">Go to</span>
        <input
          className="baps-paginator__jump-input"
          type="text"
          inputMode="numeric"
          defaultValue={page + 1}
          aria-label="Go to page"
          onKeyDown={e => { if (e.key === 'Enter') { goTo(+e.currentTarget.value - 1); e.currentTarget.blur(); } }}
          onBlur={e => goTo(+e.currentTarget.value - 1)}
        />
      </span>
    </nav>
  );
}`,
    next: `'use client';

${SETUP}

import { useState, useCallback } from 'react';
${PAGES_FN}

export default function PaginationDefault() {
  const totalRecords = 250;
  const rowsOptions = [10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);
  const first = page * rowsPerPage + 1;
  const last = Math.min((page + 1) * rowsPerPage, totalRecords);

  const goTo = useCallback((p) => setPage(Math.max(0, Math.min(p, pageCount - 1))), [pageCount]);

  return (
    <nav className="baps-paginator" aria-label="Pagination">
      <span className="baps-paginator__report">
        Showing {first}-{last} of {totalRecords}
      </span>
      <select
        className="baps-paginator__rpp"
        value={rowsPerPage}
        onChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
        aria-label="Rows per page"
      >
        {rowsOptions.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="First page" onClick={() => goTo(0)}>
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="Previous page" onClick={() => goTo(page - 1)}>
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
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Last page" onClick={() => goTo(pageCount - 1)}>
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>
      <span className="baps-paginator__jump">
        <span className="baps-paginator__jump-label">Go to</span>
        <input
          className="baps-paginator__jump-input"
          type="text"
          inputMode="numeric"
          defaultValue={page + 1}
          aria-label="Go to page"
          onKeyDown={e => { if (e.key === 'Enter') { goTo(+e.currentTarget.value - 1); e.currentTarget.blur(); } }}
          onBlur={e => goTo(+e.currentTarget.value - 1)}
        />
      </span>
    </nav>
  );
}`,
    primeng: `<baps-paginator
  brand="sampark"
  [totalRecords]="250"
  [rows]="20"
  [rowsPerPageOptions]="[10, 20, 50, 100]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
  [showFirstLastIcon]="true"
  [showJumpToPage]="true"
  (pageChange)="onPage($event)"
/>`,
  },

  /* ── Compact (just arrows + links) ─────────────────────────────────── */
  Compact: {
    custom: `<!-- Compact: just prev / page links / next. No record count, no page
     size, no jump-to. Use under a short list where the full strip is more
     chrome than content. -->
<nav class="baps-paginator" aria-label="Pagination">
  <button type="button" class="baps-paginator__nav" disabled aria-label="Previous page">
    <i class="pi pi-angle-left" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__page baps-paginator__page--active" aria-current="page" aria-label="Page 1">1</button>
  <button type="button" class="baps-paginator__page" aria-label="Page 2">2</button>
  <span class="baps-paginator__gap" aria-hidden="true">...</span>
  <button type="button" class="baps-paginator__page" aria-label="Page 12">12</button>
  <button type="button" class="baps-paginator__page" aria-label="Page 13">13</button>
  <button type="button" class="baps-paginator__nav" aria-label="Next page">
    <i class="pi pi-angle-right" aria-hidden="true"></i>
  </button>
</nav>`,
    react: `${SETUP}

import { useState, useCallback } from 'react';
${PAGES_FN}

export function PaginationCompact() {
  const totalRecords = 250;
  const rowsPerPage = 20;
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);

  const goTo = useCallback((p) => setPage(Math.max(0, Math.min(p, pageCount - 1))), [pageCount]);

  return (
    <nav className="baps-paginator" aria-label="Pagination">
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="Previous page" onClick={() => goTo(page - 1)}>
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
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
    </nav>
  );
}`,
    next: `'use client';

${SETUP}

import { useState, useCallback } from 'react';
${PAGES_FN}

export default function PaginationCompact() {
  const totalRecords = 250;
  const rowsPerPage = 20;
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);

  const goTo = useCallback((p) => setPage(Math.max(0, Math.min(p, pageCount - 1))), [pageCount]);

  return (
    <nav className="baps-paginator" aria-label="Pagination">
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="Previous page" onClick={() => goTo(page - 1)}>
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
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
    </nav>
  );
}`,
    primeng: `<baps-paginator
  [totalRecords]="250"
  [rows]="20"
  [showCurrentPageReport]="false"
  [showFirstLastIcon]="false"
  [showJumpToPage]="false"
/>`,
  },

  /* ── Few Pages (no ellipsis) ───────────────────────────────────────── */
  FewPages: {
    custom: `<!-- Under six pages there is nothing to elide, so every page is listed
     and no "..." appears. -->
<nav class="baps-paginator" aria-label="Pagination">
  <span class="baps-paginator__report">Showing 1-20 of 60</span>
  <button type="button" class="baps-paginator__nav" disabled aria-label="First page">
    <i class="pi pi-angle-double-left" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__nav" disabled aria-label="Previous page">
    <i class="pi pi-angle-left" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__page baps-paginator__page--active" aria-current="page" aria-label="Page 1">1</button>
  <button type="button" class="baps-paginator__page" aria-label="Page 2">2</button>
  <button type="button" class="baps-paginator__page" aria-label="Page 3">3</button>
  <button type="button" class="baps-paginator__nav" aria-label="Next page">
    <i class="pi pi-angle-right" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__nav" aria-label="Last page">
    <i class="pi pi-angle-double-right" aria-hidden="true"></i>
  </button>
  <span class="baps-paginator__jump">
    <span class="baps-paginator__jump-label">Go to</span>
    <input type="text" class="baps-paginator__jump-input" inputmode="numeric" value="1" aria-label="Go to page" />
  </span>
</nav>`,
    react: `${SETUP}

import { useState, useCallback } from 'react';
${PAGES_FN}

export function PaginationFewPages() {
  const totalRecords = 60;
  const [rowsPerPage] = useState(20);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);
  const first = page * rowsPerPage + 1;
  const last = Math.min((page + 1) * rowsPerPage, totalRecords);

  const goTo = useCallback((p) => setPage(Math.max(0, Math.min(p, pageCount - 1))), [pageCount]);

  return (
    <nav className="baps-paginator" aria-label="Pagination">
      <span className="baps-paginator__report">
        Showing {first}-{last} of {totalRecords}
      </span>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="First page" onClick={() => goTo(0)}>
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="Previous page" onClick={() => goTo(page - 1)}>
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
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Last page" onClick={() => goTo(pageCount - 1)}>
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>
      <span className="baps-paginator__jump">
        <span className="baps-paginator__jump-label">Go to</span>
        <input
          className="baps-paginator__jump-input"
          type="text"
          inputMode="numeric"
          defaultValue={page + 1}
          aria-label="Go to page"
          onKeyDown={e => { if (e.key === 'Enter') { goTo(+e.currentTarget.value - 1); e.currentTarget.blur(); } }}
          onBlur={e => goTo(+e.currentTarget.value - 1)}
        />
      </span>
    </nav>
  );
}`,
    next: `'use client';

${SETUP}

import { useState, useCallback } from 'react';
${PAGES_FN}

export default function PaginationFewPages() {
  const totalRecords = 60;
  const [rowsPerPage] = useState(20);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);
  const first = page * rowsPerPage + 1;
  const last = Math.min((page + 1) * rowsPerPage, totalRecords);

  const goTo = useCallback((p) => setPage(Math.max(0, Math.min(p, pageCount - 1))), [pageCount]);

  return (
    <nav className="baps-paginator" aria-label="Pagination">
      <span className="baps-paginator__report">
        Showing {first}-{last} of {totalRecords}
      </span>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="First page" onClick={() => goTo(0)}>
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page === 0} aria-label="Previous page" onClick={() => goTo(page - 1)}>
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
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1} aria-label="Last page" onClick={() => goTo(pageCount - 1)}>
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>
      <span className="baps-paginator__jump">
        <span className="baps-paginator__jump-label">Go to</span>
        <input
          className="baps-paginator__jump-input"
          type="text"
          inputMode="numeric"
          defaultValue={page + 1}
          aria-label="Go to page"
          onKeyDown={e => { if (e.key === 'Enter') { goTo(+e.currentTarget.value - 1); e.currentTarget.blur(); } }}
          onBlur={e => goTo(+e.currentTarget.value - 1)}
        />
      </span>
    </nav>
  );
}`,
    primeng: `<baps-paginator
  [totalRecords]="60"
  [rows]="20"
  [rowsPerPageOptions]="[10, 20, 50, 100]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
  [showFirstLastIcon]="true"
  [showJumpToPage]="true"
  (pageChange)="onPage($event)"
/>`,
  },

  /* ── MidRange (truncation in action) ───────────────────────────────── */
  MidRange: {
    custom: `<!-- Opened to the middle of the range: 1 2 ... 12 13 14 ... 24 25 —
     the truncation that makes this paginator different from PrimeNG's. -->
<nav class="baps-paginator" aria-label="Pagination">
  <span class="baps-paginator__report">Showing 241-250 of 250</span>
  <select class="baps-paginator__rpp" aria-label="Rows per page">
    <option value="10">10</option>
    <option value="20" selected>20</option>
    <option value="50">50</option>
    <option value="100">100</option>
  </select>
  <button type="button" class="baps-paginator__nav" aria-label="First page">
    <i class="pi pi-angle-double-left" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__nav" aria-label="Previous page">
    <i class="pi pi-angle-left" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__page" aria-label="Page 1">1</button>
  <button type="button" class="baps-paginator__page" aria-label="Page 2">2</button>
  <span class="baps-paginator__gap" aria-hidden="true">...</span>
  <button type="button" class="baps-paginator__page" aria-label="Page 12">12</button>
  <button type="button" class="baps-paginator__page baps-paginator__page--active" aria-current="page" aria-label="Page 13">13</button>
  <button type="button" class="baps-paginator__nav" disabled aria-label="Next page">
    <i class="pi pi-angle-right" aria-hidden="true"></i>
  </button>
  <button type="button" class="baps-paginator__nav" disabled aria-label="Last page">
    <i class="pi pi-angle-double-right" aria-hidden="true"></i>
  </button>
  <span class="baps-paginator__jump">
    <span class="baps-paginator__jump-label">Go to</span>
    <input type="text" class="baps-paginator__jump-input" inputmode="numeric" value="13" aria-label="Go to page" />
  </span>
</nav>`,
    primeng: `<baps-paginator
  [totalRecords]="250"
  [rows]="20"
  [first]="240"
  [rowsPerPageOptions]="[10, 20, 50, 100]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
  [showFirstLastIcon]="true"
  [showJumpToPage]="true"
  (pageChange)="onPage($event)"
/>`,
  },
};
