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

test('BapsAlert renders an assertive inline alert with native close behavior', () => {
  const onClose = () => undefined;
  const ref = { current: null };
  const element = BapsAlert({
    title: 'Session expiring',
    children: 'Save your changes.',
    severity: 'warning',
    brand: 'sampark',
    closable: true,
    closeLabel: 'Dismiss warning',
    onClose,
    ref,
  });
  const alert = element.props.children;
  const close = alert.props.children[3];

  assert.equal(element.type, 'baps-alert');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(alert.props.role, 'alert');
  assert.match(alert.props.className, /\bbaps-alert--warning\b/);
  assert.match(alert.props.className, /\bbaps-alert--closable\b/);
  assert.equal(close.type, 'button');
  assert.equal(close.props.type, 'button');
  assert.equal(close.props['aria-label'], 'Dismiss warning');
  assert.equal(close.props.onClick, onClose);
});

test('BapsAlert card clamps progress and forwards native action events', () => {
  const onPrimaryAction = () => undefined;
  const onSecondaryAction = () => undefined;
  const element = BapsAlert({
    appearance: 'card',
    severity: 'success',
    title: 'Upload complete',
    text: 'All records were saved.',
    progress: 140,
    progressLabel: 'Complete',
    primaryAction: 'View',
    secondaryAction: 'Dismiss',
    onPrimaryAction,
    onSecondaryAction,
  });
  const card = element.props.children;
  const body = card.props.children[1];
  const track = body.props.children[1].props.children[0];
  const actions = body.props.children[2].props.children;

  assert.equal(card.props.role, 'status');
  assert.match(card.props.className, /\bbaps-alert-card--success\b/);
  assert.equal(track.props.role, 'progressbar');
  assert.equal(track.props['aria-valuenow'], 100);
  assert.equal(track.props['aria-label'], 'Complete');
  assert.equal(track.props.children.props.style.width, '100%');
  assert.equal(actions[0].props.onClick, onPrimaryAction);
  assert.equal(actions[1].props.onClick, onSecondaryAction);
});
