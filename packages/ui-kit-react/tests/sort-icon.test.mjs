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

test('BapsSortIcon draws both chevrons when sortable but unsorted', () => {
  const el = BapsSortIcon({});
  assert.equal(el.props.className, 'p-datatable-sort-icon');
  assert.equal(el.props['aria-hidden'], 'true');
  // Neutral has to say "sortable" without claiming a direction, so it is the
  // only state that renders two paths.
  assert.equal(el.props.children.length, 2);
});

test('BapsSortIcon draws one chevron per direction, and they differ', () => {
  const up = BapsSortIcon({ order: 1 });
  const down = BapsSortIcon({ order: -1 });
  assert.equal(up.props.children.length, 1);
  assert.equal(down.props.children.length, 1);
  assert.notEqual(up.props.children[0].props.d, down.props.children[0].props.d);
});

test('BapsSortIcon shows a multi-sort badge only from index 1', () => {
  assert.equal(BapsSortIcon({ order: 1, index: 0 }).type, 'svg');
  const withBadge = BapsSortIcon({ order: 1, index: 2 });
  const badge = withBadge.props.children[1];
  assert.equal(badge.props.className, 'p-datatable-sort-badge');
  assert.equal(badge.props.children, 2);
});
