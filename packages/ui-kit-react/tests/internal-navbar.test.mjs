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

const NAV_ITEMS = [
  { label: 'Dashboard', iconName: 'widget' },
  { label: 'Reports', iconName: 'bar-chart' },
  { label: 'Settings', iconName: 'settings' },
];

test('BapsInternalNavbar marks the active row for sight and for a reader', () => {
  const html = renderToStaticMarkup(
    createElement(BapsInternalNavbar, { items: NAV_ITEMS, activeItem: 'Reports' }),
  );
  // The class paints it; aria-current is what is announced. Exactly one row
  // may claim either, and they must be the same row.
  assert.equal((html.match(/baps-internal-nav__item--active/g) ?? []).length, 1);
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
});

test('BapsInternalNavbar gives every row a real button', () => {
  const html = renderToStaticMarkup(createElement(BapsInternalNavbar, { items: NAV_ITEMS }));
  // Keyboard reach and the actionable role come from the element, not from
  // a click handler on a div.
  assert.equal((html.match(/<button/g) ?? []).length, NAV_ITEMS.length);
  assert.ok(html.includes('aria-label="Section navigation"') || html.includes('<nav'));
});

test('BapsInternalNavbar collapses by class, keeping the rows in the DOM', () => {
  const open = renderToStaticMarkup(createElement(BapsInternalNavbar, { items: NAV_ITEMS }));
  const shut = renderToStaticMarkup(
    createElement(BapsInternalNavbar, { items: NAV_ITEMS, collapsed: true }),
  );
  assert.ok(!open.includes('baps-internal-nav--collapsed'));
  assert.ok(shut.includes('baps-internal-nav--collapsed'));
  // Rows survive collapse — hiding is the CSS's job, not a render branch.
  assert.equal((shut.match(/<button/g) ?? []).length, NAV_ITEMS.length);
});
