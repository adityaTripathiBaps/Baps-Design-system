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

const names = (html) => [...html.matchAll(new RegExp('<td[^>]*>([^<]*)<' + '/td>', 'g'))].map((m) => m[1]);

test('BapsNavbar renders title and version, and omits what is unset', () => {
  const full = renderToStaticMarkup(
    createElement(BapsNavbar, { title: 'Sampark', version: 'v1.1.0' }),
  );
  const bare = renderToStaticMarkup(createElement(BapsNavbar, {}));
  assert.ok(full.includes('baps-navbar__title'));
  assert.ok(full.includes('baps-navbar__version'));
  // No empty spans: an unset input renders nothing rather than a blank slot.
  assert.ok(!bare.includes('baps-navbar__title'));
  assert.ok(!bare.includes('baps-navbar__version'));
});

test('BapsNavbar adds the chevron only when asked, and names its state', () => {
  const without = renderToStaticMarkup(createElement(BapsNavbar, { title: 'Sampark' }));
  const withBtn = renderToStaticMarkup(
    createElement(BapsNavbar, { title: 'Sampark', menuButton: true, menuOpen: true }),
  );
  assert.ok(!without.includes('baps-navbar__menu-button'));
  assert.ok(withBtn.includes('baps-navbar__menu-button'));
  // aria-expanded, so the button says which way it will go.
  assert.ok(withBtn.includes('aria-expanded="true"'));
});
