import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
// Not from the package barrel: these are internals the components export for
// their own use and for these tests. Keeping them off the barrel keeps the
// public API to components and their types.
import { getColumnConfigBuckets } from '../dist/lib/table-column-config/table-column-config.js';
import {
  getAvailableSortFields,
  getApplicableSortRows,
} from '../dist/lib/table-sort-config/table-sort-config.js';
import { flattenTreeTableRows } from '../dist/lib/tree-table/tree-table.js';
import {
  BapsAlert,
  BapsAvatar,
  BapsAvatarGroup,
  BapsBadge,
  BapsButton,
  BapsCard,
  BapsCheckbox,
  BapsDivider,
  BapsFloatLabel,
  BapsIcon,
  BapsIconField,
  BapsIndicator,
  BapsInputIcon,
  BapsInputGroup,
  BapsInputText,
  BapsLink,
  BapsMessage,
  BapsOverlayBadge,
  BapsProgressBar,
  BapsRadio,
  BapsSelect,
  BapsMultiSelect,
  BapsListbox,
  BapsTreeSelect,
  BapsDatepicker,
  BapsSlider,
  BapsChip,
  BapsUsersDropdown,
  BapsFileUpload,
  BapsPagination,
  BapsAccordion,
  BapsAccordionPanel,
  BapsBreadcrumb,
  BapsInternalNavbar,
  BapsNavbar,
  BapsStep,
  BapsStepList,
  BapsStepper,
  BapsTab,
  BapsTabList,
  BapsTabs,
  BapsToolbar,
  BapsMenuItem,
  BapsSortIcon,
  BapsTable,
  BapsTreeTable,
  BapsSegmented,
  BapsSkeleton,
  BapsSpinner,
  BapsTag,
  BapsTextarea,
  BapsToggleSwitch,
  getNextSegmentedValue,
  getNextMultiSelectValue,
  getNextListboxValue,
  getNextTreeSelectValue,
  getNextDatepickerValue,
  formatBapsDate,
  normaliseSliderValue,
  getNextUsersDropdownValues,
  getPaginationPages,
  formatPaginationReport,
  moveSegmentedFocus,
} from '../dist/index.js';

const TABLE_ROWS = [
  { name: 'Charlie', age: 30 },
  { name: 'alice', age: 25 },
  { name: 'Bob', age: undefined },
];

const TABLE_COLS = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'age', header: 'Age', sortable: true },
];

const names = (html) => [...html.matchAll(new RegExp('<td[^>]*>([^<]*)<' + '/td>', 'g'))].map((m) => m[1]);

const sortCalls = [];

test('BapsTable emits the PrimeNG DOM the canonical stylesheet targets', () => {
  // These class names are a contract, not a preference: table.css styles 19
  // .p-datatable-* selectors, so renaming any of them renders it unstyled.
  const html = renderToStaticMarkup(
    createElement(BapsTable, { columns: TABLE_COLS, value: TABLE_ROWS }),
  );
  for (const cls of [
    'p-datatable',
    'p-datatable-table-container',
    'p-datatable-table',
    'p-datatable-thead',
    'p-datatable-tbody',
    'p-datatable-column-header-content',
    'p-datatable-column-title',
  ]) {
    assert.ok(html.includes(cls), 'missing ' + cls);
  }
});

test('BapsTable sorts its own rows when uncontrolled', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      defaultSortField: 'name',
      defaultSortOrder: 1,
    }),
  );
  // localeCompare, so 'alice' sorts with the A's rather than after Z.
  assert.deepEqual(names(html).filter((n) => /^[A-Za-z]+$/.test(n)), [
    'alice',
    'Bob',
    'Charlie',
  ]);
});

test('BapsTable leaves row order alone when sorting is controlled', () => {
  // The guarantee a server-paged table depends on: the caller handed us one
  // page, and reordering it would show the wrong rows.
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      sortField: 'name',
      sortOrder: 1,
      // Recorded rather than ignored: a controlled table must still report the
      // click so the caller can refetch, even though it does not reorder.
      onSort: (e) => sortCalls.push(e),
    }),
  );
  assert.deepEqual(names(html).filter((n) => /^[A-Za-z]+$/.test(n)), [
    'Charlie',
    'alice',
    'Bob',
  ]);
  assert.equal(sortCalls.length, 0, 'no click yet, so no report');
});

test('BapsTable sorts absent values last in both directions', () => {
  const asc = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      defaultSortField: 'age',
      defaultSortOrder: 1,
    }),
  );
  // Bob has no age. Absent is not small, so it trails ascending too.
  assert.equal(names(asc).filter((n) => /^[A-Za-z]+$/.test(n)).at(-1), 'Bob');
});

test('BapsTable marks aria-sort only on sortable columns', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: [...TABLE_COLS, { field: 'note', header: 'Note' }],
      value: TABLE_ROWS,
      defaultSortField: 'name',
      defaultSortOrder: -1,
    }),
  );
  assert.ok(html.includes('aria-sort="descending"'));
  assert.ok(html.includes('aria-sort="none"'));
  // Three columns, two sortable — the plain one carries no aria-sort at all.
  assert.equal((html.match(/aria-sort=/g) ?? []).length, 2);
});

test('BapsTable spans the empty message across every column', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, { columns: TABLE_COLS, value: [] }),
  );
  assert.ok(html.includes('p-datatable-empty-message'));
  // renderToStaticMarkup emits the React prop name; the browser DOM turns it
  // into the lowercase attribute.
  assert.ok(html.includes('colSpan="2"'));
  assert.ok(html.includes('No results found'));
});

test('BapsTable marks the container busy while loading', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      loading: true,
    }),
  );
  // aria-busy is what a screen reader acts on; the mask is decoration.
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('p-datatable-mask'));
});
