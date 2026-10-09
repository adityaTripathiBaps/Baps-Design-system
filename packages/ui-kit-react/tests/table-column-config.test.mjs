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

const CFG_COLUMNS = [
  { key: 'id', label: 'ID', locked: true },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email', visible: false },
  { key: 'region', label: 'Region', frozen: true },
  { key: 'actions', label: 'Actions', locked: true, end: true },
];

const keysOf = (b) => [...b.locked, ...b.pinned, ...b.regular, ...b.end].map((c) => c.key);

test('getColumnConfigBuckets orders locked, pinned, regular, then end', () => {
  // The order is the contract. end:true exists so a trailing actions column
  // stays trailing instead of sorting in with the other locked ones.
  assert.deepEqual(keysOf(getColumnConfigBuckets(CFG_COLUMNS)), [
    'id',
    'region',
    'name',
    'email',
    'actions',
  ]);
});

test('getColumnConfigBuckets treats pinned and locked as different things', () => {
  const b = getColumnConfigBuckets(CFG_COLUMNS);
  // A pinned column is still the user's to unpin; a locked one is not.
  assert.deepEqual(b.pinned.map((c) => c.key), ['region']);
  assert.deepEqual(b.locked.map((c) => c.key), ['id']);
  assert.deepEqual(b.end.map((c) => c.key), ['actions']);
});

test('getColumnConfigBuckets filters every bucket by the search, case-insensitively', () => {
  assert.deepEqual(keysOf(getColumnConfigBuckets(CFG_COLUMNS, 'e')), [
    'region',
    'name',
    'email',
  ]);
  assert.deepEqual(keysOf(getColumnConfigBuckets(CFG_COLUMNS, 'REGION')), ['region']);
  // Whitespace is not a query.
  assert.equal(keysOf(getColumnConfigBuckets(CFG_COLUMNS, '   ')).length, 5);
});

test('getColumnConfigBuckets returns every bucket even when all are empty', () => {
  const b = getColumnConfigBuckets(CFG_COLUMNS, 'nothing matches this');
  // Callers spread all four; a missing key would be a crash, not a blank list.
  assert.deepEqual(Object.keys(b).sort(), ['end', 'locked', 'pinned', 'regular']);
  assert.equal(keysOf(b).length, 0);
});
