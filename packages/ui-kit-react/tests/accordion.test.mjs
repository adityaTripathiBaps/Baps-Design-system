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

test('BapsAccordion opens one panel at a time unless multiple is set', () => {
  const single = renderToStaticMarkup(
    createElement(
      BapsAccordion,
      { defaultValue: 'a' },
      createElement(BapsAccordionPanel, { value: 'a', header: 'First' }, 'one'),
      createElement(BapsAccordionPanel, { value: 'b', header: 'Second' }, 'two'),
    ),
  );
  // aria-expanded is the contract; exactly one panel may be open in single mode.
  assert.equal((single.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((single.match(/aria-expanded="false"/g) ?? []).length, 1);
});

test('BapsAccordion opens several panels when multiple is set', () => {
  const html = renderToStaticMarkup(
    createElement(
      BapsAccordion,
      { multiple: true, defaultValue: ['a', 'b'] },
      createElement(BapsAccordionPanel, { value: 'a', header: 'First' }, 'one'),
      createElement(BapsAccordionPanel, { value: 'b', header: 'Second' }, 'two'),
    ),
  );
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 2);
});
