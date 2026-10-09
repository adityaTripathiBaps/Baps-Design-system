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

test('BapsTag maps severity, size and brand to the shared standalone classes', () => {
  const ref = { current: null };
  const element = BapsTag({
    value: 'Registered',
    severity: 'contrast',
    size: 'l',
    brand: 'sampark',
    icon: 'check',
    ref,
  });

  assert.equal(element.type, 'span');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-tag--primary\b/);
  assert.match(element.props.className, /\bbaps-tag--l\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(element.props.children[1].props.children, 'Registered');
});

test('BapsTag trailing action is a labelled native button with disabled behavior', () => {
  const onAction = () => undefined;
  const element = BapsTag({
    value: 'Filter',
    action: true,
    actionLabel: 'Remove filter',
    onAction,
    disabled: true,
  });
  const action = element.props.children[3];

  assert.equal(action.type, 'button');
  assert.equal(action.props.type, 'button');
  assert.equal(action.props['aria-label'], 'Remove filter');
  assert.equal(action.props.onClick, onAction);
  assert.equal(action.props.disabled, true);
  assert.equal(element.props['aria-disabled'], true);
});
