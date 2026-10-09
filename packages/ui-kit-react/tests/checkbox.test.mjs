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

test('BapsCheckbox uses a native labelled input and forwards change/ref', () => {
  const ref = { current: null };
  let changes = 0;
  const element = BapsCheckbox({
    id: 'active-member',
    label: 'Active member',
    checked: true,
    checkboxSize: 'large',
    brand: 'sampark',
    onChange: () => {
      changes += 1;
    },
    ref,
  });
  const wrapper = element.props.children;
  const control = wrapper.props.children[0];
  const input = control.props.children[0];
  const label = wrapper.props.children[1];

  input.props.onChange({ currentTarget: { checked: false } });
  assert.equal(changes, 1);
  assert.equal(input.type, 'input');
  assert.equal(input.props.type, 'checkbox');
  assert.equal(input.props.ref, ref);
  assert.equal(label.props.htmlFor, 'active-member');
  assert.match(element.props.className, /\bbaps-checkbox-lg\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
});

test('BapsCheckbox mixed and readonly states expose native keyboard semantics', () => {
  let changes = 0;
  let prevented = 0;
  const element = BapsCheckbox({
    'aria-label': 'Select all members',
    indeterminate: true,
    readOnly: true,
    onChange: () => {
      changes += 1;
    },
  });
  const control = element.props.children.props.children[0];
  const input = control.props.children[0];

  input.props.onClick({
    preventDefault: () => {
      prevented += 1;
    },
  });
  input.props.onChange({ currentTarget: { checked: true } });
  assert.equal(input.props['aria-checked'], 'mixed');
  assert.equal(input.props['aria-readonly'], true);
  assert.equal(prevented, 1);
  assert.equal(changes, 0);
  assert.match(control.props.className, /\bp-checkbox-indeterminate\b/);
});
