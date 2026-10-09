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

test('BapsRadio renders a native grouped input with label and ref', () => {
  const ref = { current: null };
  const onChange = () => undefined;
  const element = BapsRadio({
    id: 'scope-all',
    name: 'scope',
    value: 'all',
    label: 'All members',
    checked: true,
    radioSize: 'large',
    brand: 'sampark',
    onChange,
    ref,
  });
  const wrapper = element.props.children;
  const control = wrapper.props.children[0];
  const input = control.props.children[0];
  const label = wrapper.props.children[1];

  assert.equal(input.type, 'input');
  assert.equal(input.props.type, 'radio');
  assert.equal(input.props.name, 'scope');
  assert.equal(input.props.value, 'all');
  assert.equal(input.props.onChange, onChange);
  assert.equal(input.props.ref, ref);
  assert.equal(label.props.htmlFor, 'scope-all');
  assert.match(element.props.className, /\bbaps-radio-lg\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(control.props.className, /\bp-radiobutton-checked\b/);
});
