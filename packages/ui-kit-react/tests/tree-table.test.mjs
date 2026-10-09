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

const TREE = [
  {
    key: 'a',
    data: { name: 'Alpha' },
    children: [
      { key: 'a1', data: { name: 'Alpha one' } },
      { key: 'a2', data: { name: 'Alpha two' }, children: [{ key: 'a2x', data: { name: 'Deep' } }] },
    ],
  },
  { key: 'b', data: { name: 'Beta' }, children: [] },
  { key: 'c', data: { name: 'Gamma' } },
];

test('BapsTreeTable emits the PrimeNG tree DOM and marks hierarchy for a reader', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTreeTable, {
      value: TREE,
      columns: [{ field: 'name', header: 'Name' }],
      defaultExpandedKeys: ['a'],
    }),
  );
  for (const cls of [
    'p-treetable-thead',
    'p-treetable-tbody',
    'p-treetable-header-cell',
    'p-treetable-node-toggle-button',
  ]) {
    assert.ok(html.includes(cls), 'missing ' + cls);
  }
  // aria-level is 1-based; depth is not.
  assert.ok(html.includes('aria-level="1"'));
  assert.ok(html.includes('aria-level="2"'));
  assert.ok(html.includes('aria-expanded="true"'));
});

test('BapsTreeTable paints an error row and spans the empty message', () => {
  const err = renderToStaticMarkup(
    createElement(BapsTreeTable, {
      value: [{ key: 'x', data: { name: 'Bad' }, error: true }],
      columns: [{ field: 'name', header: 'Name' }],
    }),
  );
  assert.ok(err.includes('baps-tree-row-error'));

  const empty = renderToStaticMarkup(
    createElement(BapsTreeTable, {
      value: [],
      columns: [{ field: 'name', header: 'Name' }, { field: 'x', header: 'X' }],
    }),
  );
  assert.ok(empty.includes('colSpan="2"'));
  assert.ok(empty.includes('No results found'));
});


const flatKeys = (keys) => flattenTreeTableRows(TREE, keys).map((r) => r.node.key);

test('flattenTreeTableRows shows only roots when nothing is expanded', () => {
  assert.deepEqual(flatKeys([]), ['a', 'b', 'c']);
});

test('flattenTreeTableRows needs every ancestor open, not just the parent', () => {
  // 'a2x' stays hidden while 'a' is shut, even though its own parent is listed
  // as expanded — this is the case a naive flattener gets wrong.
  assert.deepEqual(flatKeys(['a2']), ['a', 'b', 'c']);
  assert.deepEqual(flatKeys(['a', 'a2']), ['a', 'a1', 'a2', 'a2x', 'b', 'c']);
});

test('flattenTreeTableRows reports depth for the indent and aria-level', () => {
  const rows = flattenTreeTableRows(TREE, ['a', 'a2']);
  assert.deepEqual(
    rows.map((r) => [r.node.key, r.depth]),
    [['a', 0], ['a1', 1], ['a2', 1], ['a2x', 2], ['b', 0], ['c', 0]],
  );
});

test('flattenTreeTableRows treats an empty children array as a leaf', () => {
  const rows = flattenTreeTableRows(TREE, ['a', 'b']);
  const b = rows.find((r) => r.node.key === 'b');
  // 'b' has children: [] — a toggle there would reveal nothing, so it gets none.
  assert.equal(b.expandable, false);
  assert.equal(b.expanded, false);
  assert.equal(rows.find((r) => r.node.key === 'c').expandable, false);
  assert.equal(rows.find((r) => r.node.key === 'a').expandable, true);
});
