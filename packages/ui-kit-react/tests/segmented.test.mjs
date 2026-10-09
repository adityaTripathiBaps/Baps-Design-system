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

test('BapsSegmented state transitions enforce single and multiple selection rules', () => {
  assert.equal(getNextSegmentedValue('Once', 'Repeat', false, true), 'Repeat');
  assert.equal(getNextSegmentedValue('Once', 'Once', false, true), null);
  assert.equal(getNextSegmentedValue('Once', 'Once', false, false), 'Once');
  assert.deepEqual(getNextSegmentedValue(['Su'], 'We', true, true), [
    'Su',
    'We',
  ]);
  assert.deepEqual(getNextSegmentedValue(['Su'], 'Su', true, false), ['Su']);
});

test('BapsSegmented keyboard focus wraps and supports Home and End', () => {
  let activeElement;
  const ownerDocument = {
    get activeElement() {
      return activeElement;
    },
  };
  const buttons = [0, 1, 2].map((index) => {
    const button = {
      index,
      focus() {
        activeElement = button;
      },
    };
    return button;
  });
  const group = {
    ownerDocument,
    querySelectorAll: () => buttons,
  };

  activeElement = buttons[2];
  assert.equal(moveSegmentedFocus(group, 'ArrowRight'), true);
  assert.equal(activeElement, buttons[0]);
  assert.equal(moveSegmentedFocus(group, 'End'), true);
  assert.equal(activeElement, buttons[2]);
  assert.equal(moveSegmentedFocus(group, 'Home'), true);
  assert.equal(activeElement, buttons[0]);
  assert.equal(moveSegmentedFocus(group, 'Tab'), false);
  assert.equal(BapsSegmented.displayName, 'BapsSegmented');
});
