import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BapsPagination,
  getPaginationPages,
  formatPaginationReport,
} from '../dist/index.js';

test('BapsPagination truncates page links and exposes accessible controls', () => {
  assert.deepEqual(getPaginationPages(1, 13), [1, 2, null, 12, 13]);
  assert.deepEqual(getPaginationPages(7, 13), [
    1,
    2,
    null,
    6,
    7,
    8,
    null,
    12,
    13,
  ]);
  assert.equal(
    formatPaginationReport(
      'Showing {first}-{last} of {totalRecords}',
      { first: 20, rows: 20, page: 1, pageCount: 13 },
      250,
    ),
    'Showing 21-40 of 250',
  );

  const html = renderToStaticMarkup(
    createElement(BapsPagination, {
      totalRecords: 250,
      defaultRows: 20,
      defaultFirst: 120,
      rowsPerPageOptions: [10, 20, 50],
      showCurrentPageReport: true,
      showJumpToPage: true,
      brand: 'sampark',
    }),
  );
  assert.match(
    html,
    /<baps-paginator class="baps-sampark baps-ds-sampark">/,
  );
  assert.match(html, /<nav class="baps-paginator" aria-label="Pagination">/);
  assert.match(html, /aria-current="page" aria-label="Page 7"/);
  assert.match(html, /aria-label="Rows per page"/);
  assert.match(html, /aria-label="Go to page"/);
  assert.match(html, />Showing 121-140 of 250</);
});
