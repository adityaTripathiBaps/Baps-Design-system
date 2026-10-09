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

const LOCATION_TREE = [
  {
    key: 'in',
    label: 'India',
    children: [
      { key: 'in-amd', label: 'Ahmedabad' },
      { key: 'in-mum', label: 'Mumbai' },
    ],
  },
];

const TREE = [
  {
    key: 'a',
    data: { name: 'Alpha' },
    children: [
      { key: 'a1', data: { name: 'Alpha one' } },
      { key: 'a2', data: { name: 'Alpha two' }, children: [{ key: 'a2x', data: { name: 'Deep' } }] },
    ],
  },
  { key: 'b', data: { name: 'Beta' }, children: [] },
  { key: 'c', data: { name: 'Gamma' } },
];

test('BapsTreeSelect cascades checkbox selection and renders a tree combobox', () => {
  assert.deepEqual(
    getNextTreeSelectValue(LOCATION_TREE, [], 'in', 'checkbox', true, true),
    ['in', 'in-amd', 'in-mum'],
  );
  assert.deepEqual(
    getNextTreeSelectValue(
      LOCATION_TREE,
      ['in-amd'],
      'in-mum',
      'checkbox',
      true,
      true,
    ),
    ['in-amd', 'in-mum', 'in'],
  );

  const html = renderToStaticMarkup(
    createElement(BapsTreeSelect, {
      ariaLabel: 'Locations',
      options: LOCATION_TREE,
      defaultValue: 'in-amd',
    }),
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-haspopup="tree"/);
  assert.match(html, />Ahmedabad</);
});
