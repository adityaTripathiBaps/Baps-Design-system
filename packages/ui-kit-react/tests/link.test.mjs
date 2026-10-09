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

test('BapsLink forwards native anchor attributes and secures a blank target', () => {
  const ref = { current: null };
  const element = BapsLink({
    children: 'Details',
    href: '/details',
    target: '_blank',
    ref,
  });
  const anchor = element.props.children;

  assert.equal(element.type, 'baps-link');
  assert.equal(anchor.type, 'a');
  assert.equal(anchor.props.href, '/details');
  assert.equal(anchor.props.ref, ref);
  assert.match(anchor.props.rel, /\bnoopener\b/);
  assert.match(anchor.props.rel, /\bnoreferrer\b/);
});

test('BapsLink disabled state removes navigation and blocks click handlers', () => {
  let called = false;
  const element = BapsLink({
    children: 'Unavailable',
    href: '/unavailable',
    disabled: true,
    onClick: () => {
      called = true;
    },
  });
  const anchor = element.props.children;

  assert.equal(anchor.props.href, undefined);
  assert.equal(anchor.props['aria-disabled'], true);
  assert.equal(anchor.props.tabIndex, -1);
  assert.equal(anchor.props.onClick, undefined);
  assert.equal(called, false);
});
