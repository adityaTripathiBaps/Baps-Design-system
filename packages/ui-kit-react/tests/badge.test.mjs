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

const names = (html) => [...html.matchAll(new RegExp('<td[^>]*>([^<]*)<' + '/td>', 'g'))].map((m) => m[1]);

test('BapsBadge renders the canonical severity, size and brand structure', () => {
  const ref = { current: null };
  const element = BapsBadge({
    value: 8,
    severity: 'danger',
    badgeSize: 'large',
    brand: 'sampark',
    type: 'notification',
    ref,
  });
  const badge = element.props.children;

  assert.equal(element.type, 'baps-badge');
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(element.props.className, /\bbaps-badge-notification\b/);
  assert.equal(badge.type, 'span');
  assert.equal(badge.props.ref, ref);
  assert.match(badge.props.className, /\bp-badge-danger\b/);
  assert.match(badge.props.className, /\bp-badge-lg\b/);
  assert.equal(badge.props.children, 8);
});

test('BapsBadge dot names are explicit and disabled badges use native hidden', () => {
  const dot = BapsBadge({
    severity: 'success',
    'aria-label': 'Online',
  }).props.children;
  assert.match(dot.props.className, /\bp-badge-dot\b/);
  assert.equal(dot.props.role, 'status');
  assert.equal(dot.props['aria-label'], 'Online');

  const hidden = BapsBadge({
    value: '4',
    badgeDisabled: true,
  }).props.children;
  assert.equal(hidden.props.hidden, true);
});
