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

const SELECTION_OPTIONS = [
  { label: 'Ahmedabad', value: 'amd' },
  { label: 'London', value: 'ldn' },
  { label: 'Nairobi', value: 'nbo', disabled: true },
];

test('BapsSelect server markup exposes a named native combobox contract', () => {
  const html = renderToStaticMarkup(
    createElement(BapsSelect, {
      ariaLabel: 'City',
      options: SELECTION_OPTIONS,
      defaultValue: 'ldn',
      brand: 'sampark',
      showClear: true,
    }),
  );

  assert.match(html, /<baps-select class="baps-sampark">/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="City"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />London</);
});
