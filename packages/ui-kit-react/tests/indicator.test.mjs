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

test('BapsIndicator maps visual inputs to the canonical host contract', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const element = BapsIndicator({
    children: 3,
    severity: 'warning',
    size: 'xl',
    text: true,
    ring: true,
    'aria-label': '3 warnings',
    onClick,
    ref,
  });

  assert.equal(element.type, 'baps-indicator');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.role, 'status');
  assert.equal(element.props['aria-label'], '3 warnings');
  assert.match(element.props.className, /\bbaps-indicator--warning\b/);
  assert.match(element.props.className, /\bbaps-indicator--xl\b/);
  assert.match(element.props.className, /\bbaps-indicator--text\b/);
  assert.match(element.props.className, /\bbaps-indicator--ring\b/);
  assert.equal(element.props.children.props['aria-hidden'], undefined);
});

test('BapsIndicator defaults decorative content to hidden semantics', () => {
  const element = BapsIndicator({ severity: 'success' });

  assert.equal(element.props.role, undefined);
  assert.equal(element.props['aria-label'], undefined);
  assert.equal(element.props.children.props['aria-hidden'], true);
  assert.match(element.props.className, /\bbaps-indicator--m\b/);
});
