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

test('BapsIcon applies the shared size contract and decorative semantics', () => {
  const element = BapsIcon({ name: 'notification', size: 'md' });
  const glyph = element.props.children;

  assert.equal(element.type, 'baps-icon');
  assert.equal(element.props.style['--baps-icon-size'], '20px');
  assert.equal(glyph.props['aria-hidden'], true);
  assert.equal(glyph.props.role, undefined);
  assert.match(glyph.props.dangerouslySetInnerHTML.__html, /^<svg /);
});

test('BapsIcon labels content icons and forwards native host events/ref', () => {
  const onClick = () => undefined;
  const ref = { current: null };
  const element = BapsIcon({
    name: 'info-circle',
    label: 'Information',
    onClick,
    ref,
  });
  const glyph = element.props.children;

  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.ref, ref);
  assert.equal(glyph.props.role, 'img');
  assert.equal(glyph.props['aria-label'], 'Information');
  assert.equal(glyph.props['aria-hidden'], undefined);
});
