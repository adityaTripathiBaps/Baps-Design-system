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

const SORT_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount' },
];

test('getAvailableSortFields hides fields other rows already took', () => {
  const rows = [
    { field: 'name', direction: 1 },
    { field: 'date', direction: -1 },
  ];
  // Row 0 keeps its own field — otherwise its select would show a value that
  // is not in its options and render blank.
  assert.deepEqual(getAvailableSortFields(SORT_FIELDS, rows, 0).map((f) => f.key), [
    'name',
    'amount',
  ]);
  assert.deepEqual(getAvailableSortFields(SORT_FIELDS, rows, 1).map((f) => f.key), [
    'date',
    'amount',
  ]);
});

test('getAvailableSortFields offers everything to a row with no field yet', () => {
  const rows = [{ field: null, direction: 1 }];
  assert.equal(getAvailableSortFields(SORT_FIELDS, rows, 0).length, 3);
});

test('getAvailableSortFields ignores unset fields when working out what is taken', () => {
  // Three empty rows must not block each other — null is not a claim.
  const rows = [
    { field: null, direction: 1 },
    { field: null, direction: 1 },
    { field: 'name', direction: 1 },
  ];
  assert.deepEqual(getAvailableSortFields(SORT_FIELDS, rows, 0).map((f) => f.key), [
    'date',
    'amount',
  ]);
});

test('getApplicableSortRows drops rows with nothing chosen', () => {
  const rows = [
    { field: 'name', direction: 1 },
    { field: null, direction: -1 },
    { field: 'date', direction: -1, locked: true },
  ];
  // An empty row is a half-finished edit, not a sort — applying it would be a
  // sort by nothing. The locked default survives, because it always applies.
  assert.deepEqual(getApplicableSortRows(rows).map((r) => r.field), ['name', 'date']);
  assert.equal(getApplicableSortRows(rows).at(-1).locked, true);
});
