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

test('BapsCard renders shared slots, variants and native host attributes', () => {
  const ref = { current: null };
  const element = BapsCard({
    title: 'Registrations',
    subtitle: 'This week',
    actions: 'Export',
    footer: 'Updated today',
    children: '24 registrations',
    padding: 'compact',
    divided: true,
    raised: true,
    brand: 'sampark',
    ref,
  });
  const [header, body, footer] = element.props.children;

  assert.equal(element.type, 'baps-card');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-card-compact\b/);
  assert.match(element.props.className, /\bbaps-card-divided\b/);
  assert.match(element.props.className, /\bbaps-card-raised\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(header.props.children[0].props['card-title'], '');
  assert.equal(header.props.children[1].props['card-subtitle'], '');
  assert.equal(body.props.children, '24 registrations');
  assert.equal(footer.props.children.props['card-footer'], '');
});

test('BapsCard interactive mode activates with Enter and Space', () => {
  let clicks = 0;
  let prevented = 0;
  const element = BapsCard({
    interactive: true,
    onClick: () => {
      clicks += 1;
    },
    children: 'Open member',
  });

  assert.equal(element.props.role, 'button');
  assert.equal(element.props.tabIndex, 0);
  assert.match(element.props.className, /\bbaps-card-interactive\b/);

  const currentTarget = {
    click: () => element.props.onClick(),
  };
  for (const key of ['Enter', ' ']) {
    element.props.onKeyDown({
      key,
      currentTarget,
      defaultPrevented: false,
      preventDefault: () => {
        prevented += 1;
      },
    });
  }
  assert.equal(clicks, 2);
  assert.equal(prevented, 2);
});
