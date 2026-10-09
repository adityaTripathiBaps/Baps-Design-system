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

test('BapsButton preserves native keyboard semantics and typed event/ref forwarding', () => {
  const onClick = () => undefined;
  const ref = { current: null };
  const element = BapsButton({ label: 'Save', onClick, ref });

  assert.equal(element.type, 'button');
  assert.equal(element.props.type, 'button');
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.disabled, false);
  assert.match(element.props.className, /\bbaps-button--primary\b/);
});

test('BapsButton loading state is disabled, busy and uses the shared icon', () => {
  const element = BapsButton({
    label: 'Saving',
    brand: 'sampark',
    size: 'xlarge',
    loading: true,
  });

  assert.equal(element.props.disabled, true);
  assert.equal(element.props['aria-busy'], true);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(element.props.className, /\bbaps-button--loading\b/);
  assert.match(element.props.className, /\bbaps-button--xl\b/);
});

test('BapsButton icon-only output keeps an accessible native button name', () => {
  const element = BapsButton({ icon: 'trash', 'aria-label': 'Delete' });

  assert.equal(element.props['aria-label'], 'Delete');
  assert.match(element.props.className, /\bbaps-button--icon-only\b/);
});
