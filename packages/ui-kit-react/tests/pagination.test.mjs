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

test('BapsPagination truncates page links and exposes accessible controls', () => {
  assert.deepEqual(getPaginationPages(1, 13), [1, 2, null, 12, 13]);
  assert.deepEqual(getPaginationPages(7, 13), [
    1,
    2,
    null,
    6,
    7,
    8,
    null,
    12,
    13,
  ]);
  assert.equal(
    formatPaginationReport(
      'Showing {first}-{last} of {totalRecords}',
      { first: 20, rows: 20, page: 1, pageCount: 13 },
      250,
    ),
    'Showing 21-40 of 250',
  );

  const html = renderToStaticMarkup(
    createElement(BapsPagination, {
      totalRecords: 250,
      defaultRows: 20,
      defaultFirst: 120,
      rowsPerPageOptions: [10, 20, 50],
      showCurrentPageReport: true,
      showJumpToPage: true,
      brand: 'sampark',
    }),
  );
  assert.match(
    html,
    /<baps-paginator class="baps-sampark baps-ds-sampark">/,
  );
  assert.match(html, /<nav class="baps-paginator" aria-label="Pagination">/);
  assert.match(html, /aria-current="page" aria-label="Page 7"/);
  assert.match(html, /aria-label="Rows per page"/);
  assert.match(html, /aria-label="Go to page"/);
  assert.match(html, />Showing 121-140 of 250</);
});
