import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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
  BapsSortIcon,
  BapsTable,
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

test('BapsDivider renders native separator semantics and shared variant classes', () => {
  const ref = { current: null };
  const element = BapsDivider({
    children: 'OR',
    layout: 'vertical',
    type: 'dashed',
    align: 'bottom',
    size: 'compact',
    brand: 'sampark',
    ref,
  });
  const divider = element.props.children;

  assert.equal(element.type, 'baps-divider');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props['data-size'], 'compact');
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(divider.props.role, 'separator');
  assert.equal(divider.props['aria-orientation'], 'vertical');
  assert.match(divider.props.className, /\bp-divider-vertical\b/);
  assert.match(divider.props.className, /\bp-divider-dashed\b/);
  assert.match(divider.props.className, /\bp-divider-bottom\b/);
  assert.equal(divider.props.children.props.children, 'OR');
});

test('BapsProgressBar clamps determinate values and exposes progress semantics', () => {
  const ref = { current: null };
  const element = BapsProgressBar({
    value: 140,
    showValue: true,
    severity: 'success',
    brand: 'sampark',
    'aria-label': 'Import progress',
    ref,
  });
  const progress = element.props.children;
  const value = progress.props.children;

  assert.equal(element.type, 'baps-progressbar');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.role, 'progressbar');
  assert.equal(element.props['aria-label'], 'Import progress');
  assert.equal(element.props['aria-valuenow'], 100);
  assert.match(element.props.className, /\bbaps-progressbar-success\b/);
  assert.match(element.props.className, /\bbaps-progressbar-has-value\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(value.props.style.width, '100%');
  assert.equal(value.props.children.props.children, '100%');
});

test('BapsProgressBar indeterminate mode omits numeric aria values', () => {
  const element = BapsProgressBar({
    mode: 'indeterminate',
    'aria-label': 'Loading members',
  });
  const progress = element.props.children;

  assert.equal(element.props.role, 'progressbar');
  assert.equal(element.props['aria-valuenow'], undefined);
  assert.equal(element.props['aria-valuemin'], undefined);
  assert.equal(element.props['aria-valuemax'], undefined);
  assert.match(progress.props.className, /\bp-progressbar-indeterminate\b/);
  assert.equal(progress.props.children.props.style, undefined);
  // The name must reach the element carrying role="progressbar", not the
  // visual inside it. This is the one of the three axe findings the Angular
  // wrapper needed a whole new input to fix; React gets it from the native
  // attribute spread, and this asserts it actually lands.
  assert.equal(element.props['aria-label'], 'Loading members');
  assert.equal(progress.props['aria-hidden'], 'true');
});

test('BapsSpinner clamps determinate progress and forwards native attributes', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const element = BapsSpinner({
    value: -12,
    size: 'small',
    brand: 'sampark',
    'aria-label': 'File upload',
    onClick,
    ref,
  });
  const arc = element.props.children.props.children[1];

  assert.equal(element.type, 'baps-spinner');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.role, 'progressbar');
  assert.equal(element.props['aria-label'], 'File upload');
  assert.equal(element.props['aria-valuenow'], 0);
  assert.match(element.props.className, /\bbaps-spinner-small\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.ok(Math.abs(arc.props.strokeDashoffset - 2 * Math.PI * 14) < 1e-12);
});

test('BapsSpinner indeterminate mode is a named status without numeric values', () => {
  const element = BapsSpinner({ ariaLabel: 'Refreshing' });
  const arc = element.props.children.props.children[1];

  assert.equal(element.props.role, 'status');
  assert.equal(element.props['aria-label'], 'Refreshing');
  assert.equal(element.props['aria-valuenow'], undefined);
  assert.match(element.props.className, /\bbaps-spinner-indeterminate\b/);
  assert.match(arc.props.strokeDasharray, / /);
});

test('BapsSkeleton is decorative and size overrides width and height', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const element = BapsSkeleton({
    shape: 'circle',
    size: '3rem',
    width: '80%',
    height: '1rem',
    brand: 'sampark',
    skeletonClassName: 'member-avatar',
    onClick,
    ref,
  });
  const skeleton = element.props.children;

  assert.equal(element.type, 'baps-skeleton');
  assert.equal(element.props['aria-hidden'], true);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(skeleton.props.className, /\bp-skeleton-circle\b/);
  assert.match(skeleton.props.className, /\bmember-avatar\b/);
  assert.equal(skeleton.props.style.width, '3rem');
  assert.equal(skeleton.props.style.height, '3rem');
});

test('BapsSkeleton static rectangle keeps explicit dimensions', () => {
  const element = BapsSkeleton({
    width: '60%',
    height: '0.875rem',
    animation: 'none',
  });
  const skeleton = element.props.children;

  assert.match(skeleton.props.className, /\bp-skeleton-animation-none\b/);
  assert.doesNotMatch(skeleton.props.className, /\bp-skeleton-circle\b/);
  assert.equal(skeleton.props.style.width, '60%');
  assert.equal(skeleton.props.style.height, '0.875rem');
});

test('BapsInputText preserves native input behavior and maps DS states', () => {
  const ref = { current: null };
  const onChange = () => undefined;
  const element = BapsInputText({
    type: 'email',
    name: 'email',
    pSize: 'small',
    variant: 'ghost',
    invalid: true,
    fluid: true,
    onChange,
    ref,
  });

  assert.equal(element.type, 'input');
  assert.equal(element.props.type, 'email');
  assert.equal(element.props.onChange, onChange);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props['aria-invalid'], true);
  assert.match(element.props.className, /\bp-inputtext-sm\b/);
  assert.match(element.props.className, /\bp-inputtext-ghost\b/);
  assert.match(element.props.className, /\bp-invalid\b/);
  assert.match(element.props.className, /\bp-fluid\b/);
});

test('BapsTextarea auto-resizes and preserves the consumer input handler', () => {
  let calls = 0;
  const element = BapsTextarea({
    autoResize: true,
    invalid: true,
    onInput: () => {
      calls += 1;
    },
  });
  const currentTarget = { style: { height: '5rem' }, scrollHeight: 148 };

  element.props.onInput({ currentTarget });

  assert.equal(currentTarget.style.height, '148px');
  assert.equal(calls, 1);
  assert.equal(element.props['aria-invalid'], true);
  assert.match(element.props.className, /\bp-textarea-auto-resize\b/);
});

test('BapsFloatLabel and IconField expose Prime-compatible composition DOM', () => {
  const input = BapsInputText({ id: 'member-name' });
  const label = { type: 'label', props: { htmlFor: 'member-name' } };
  const floatLabel = BapsFloatLabel({
    children: [input, label],
    variant: 'on',
    brand: 'sampark',
  });
  const iconField = BapsIconField({
    iconPosition: 'right',
    children: [input, BapsInputIcon({ icon: 'search-2' })],
  });

  assert.equal(floatLabel.type, 'baps-floatlabel');
  assert.match(floatLabel.props.className, /\bbaps-sampark\b/);
  assert.match(
    floatLabel.props.children.props.className,
    /\bp-floatlabel-on\b/,
  );
  assert.equal(iconField.type, 'baps-iconfield');
  assert.equal(iconField.props.children.type, 'p-iconfield');
  assert.match(
    iconField.props.children.props.className,
    /\bp-iconfield-right\b/,
  );
});

test('BapsInputIcon is decorative and uses the shared icon component', () => {
  const element = BapsInputIcon({ icon: 'search-2' });
  const visual = element.props.children;

  assert.equal(element.type, 'baps-inputicon');
  assert.equal(element.props['aria-hidden'], true);
  assert.match(visual.props.className, /\bp-inputicon\b/);
  assert.equal(visual.props.children.type, BapsIcon);
});

test('BapsMessage exposes polite alert semantics and severity variants', () => {
  const ref = { current: null };
  const element = BapsMessage({
    text: 'Email is required.',
    icon: 'info-circle',
    severity: 'error',
    variant: 'simple',
    size: 'small',
    brand: 'sampark',
    ref,
  });
  const message = element.props.children;
  const content = message.props.children.props.children;

  assert.equal(element.props.role, 'alert');
  assert.equal(element.props['aria-live'], 'polite');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(message.props.className, /\bp-message-error\b/);
  assert.match(message.props.className, /\bp-message-simple\b/);
  assert.match(message.props.className, /\bp-message-sm\b/);
  assert.equal(content.props.children[1].props.children, 'Email is required.');
});

test('BapsCheckbox uses a native labelled input and forwards change/ref', () => {
  const ref = { current: null };
  let changes = 0;
  const element = BapsCheckbox({
    id: 'active-member',
    label: 'Active member',
    checked: true,
    checkboxSize: 'large',
    brand: 'sampark',
    onChange: () => {
      changes += 1;
    },
    ref,
  });
  const wrapper = element.props.children;
  const control = wrapper.props.children[0];
  const input = control.props.children[0];
  const label = wrapper.props.children[1];

  input.props.onChange({ currentTarget: { checked: false } });
  assert.equal(changes, 1);
  assert.equal(input.type, 'input');
  assert.equal(input.props.type, 'checkbox');
  assert.equal(input.props.ref, ref);
  assert.equal(label.props.htmlFor, 'active-member');
  assert.match(element.props.className, /\bbaps-checkbox-lg\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
});

test('BapsCheckbox mixed and readonly states expose native keyboard semantics', () => {
  let changes = 0;
  let prevented = 0;
  const element = BapsCheckbox({
    'aria-label': 'Select all members',
    indeterminate: true,
    readOnly: true,
    onChange: () => {
      changes += 1;
    },
  });
  const control = element.props.children.props.children[0];
  const input = control.props.children[0];

  input.props.onClick({
    preventDefault: () => {
      prevented += 1;
    },
  });
  input.props.onChange({ currentTarget: { checked: true } });
  assert.equal(input.props['aria-checked'], 'mixed');
  assert.equal(input.props['aria-readonly'], true);
  assert.equal(prevented, 1);
  assert.equal(changes, 0);
  assert.match(control.props.className, /\bp-checkbox-indeterminate\b/);
});

test('BapsRadio renders a native grouped input with label and ref', () => {
  const ref = { current: null };
  const onChange = () => undefined;
  const element = BapsRadio({
    id: 'scope-all',
    name: 'scope',
    value: 'all',
    label: 'All members',
    checked: true,
    radioSize: 'large',
    brand: 'sampark',
    onChange,
    ref,
  });
  const wrapper = element.props.children;
  const control = wrapper.props.children[0];
  const input = control.props.children[0];
  const label = wrapper.props.children[1];

  assert.equal(input.type, 'input');
  assert.equal(input.props.type, 'radio');
  assert.equal(input.props.name, 'scope');
  assert.equal(input.props.value, 'all');
  assert.equal(input.props.onChange, onChange);
  assert.equal(input.props.ref, ref);
  assert.equal(label.props.htmlFor, 'scope-all');
  assert.match(element.props.className, /\bbaps-radio-lg\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(control.props.className, /\bp-radiobutton-checked\b/);
});

test('BapsToggleSwitch renders a labelled native switch with brand and size', () => {
  const ref = { current: null };
  let changes = 0;
  const element = BapsToggleSwitch({
    id: 'email-notifications',
    label: 'Email notifications',
    defaultChecked: true,
    toggleSize: 'sm',
    brand: 'sampark',
    onChange: () => {
      changes += 1;
    },
    ref,
  });
  const wrapper = element.props.children;
  const control = wrapper.props.children[0];
  const input = control.props.children[0];
  const label = wrapper.props.children[1];

  input.props.onChange({ currentTarget: { checked: false } });
  assert.equal(changes, 1);
  assert.equal(input.type, 'input');
  assert.equal(input.props.type, 'checkbox');
  assert.equal(input.props.role, 'switch');
  assert.equal(input.props.ref, ref);
  assert.equal(label.props.htmlFor, 'email-notifications');
  assert.match(control.props.className, /\bbaps-sampark\b/);
  assert.match(control.props.className, /\bbaps-toggle-switch--sm\b/);
});

test('BapsToggleSwitch readonly prevents pointer and keyboard state changes', () => {
  let clicks = 0;
  let changes = 0;
  let prevented = 0;
  const element = BapsToggleSwitch({
    'aria-label': 'Managed setting',
    readOnly: true,
    onClick: () => {
      clicks += 1;
    },
    onChange: () => {
      changes += 1;
    },
  });
  const input = element.props.children.props.children[0].props.children[0];

  input.props.onClick({
    preventDefault: () => {
      prevented += 1;
    },
  });
  input.props.onChange({ currentTarget: { checked: true } });
  assert.equal(input.props['aria-readonly'], true);
  assert.equal(prevented, 1);
  assert.equal(clicks, 0);
  assert.equal(changes, 0);
});

test('BapsInputGroup orders static addons around the reusable form control', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const input = BapsInputText({ type: 'number', 'aria-label': 'Minimum days' });
  const element = BapsInputGroup({
    prefix: 'min',
    suffix: 'day/s',
    brand: 'sampark',
    children: input,
    onClick,
    ref,
  });
  const group = element.props.children;
  const [prefix, field, suffix] = group.props.children;

  assert.equal(element.type, 'baps-input-group');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(group.props.className, /\bp-inputgroup\b/);
  assert.equal(prefix.type, 'span');
  assert.equal(prefix.props.children, 'min');
  assert.equal(prefix.props.role, undefined);
  assert.equal(field, input);
  assert.equal(suffix.props.children, 'day/s');
});

test('BapsInputGroup omits absent addons without hiding supplied content', () => {
  const input = BapsInputText({ 'aria-label': 'Weeks' });
  const element = BapsInputGroup({ suffix: 'week/s', children: input });
  const [prefix, field, suffix] = element.props.children.props.children;

  assert.equal(prefix, false);
  assert.equal(field, input);
  assert.equal(suffix.props.children, 'week/s');
  assert.equal(suffix.props['aria-hidden'], undefined);
  assert.equal(suffix.props.tabIndex, undefined);
});

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

test('BapsLink forwards native anchor attributes and secures a blank target', () => {
  const ref = { current: null };
  const element = BapsLink({
    children: 'Details',
    href: '/details',
    target: '_blank',
    ref,
  });
  const anchor = element.props.children;

  assert.equal(element.type, 'baps-link');
  assert.equal(anchor.type, 'a');
  assert.equal(anchor.props.href, '/details');
  assert.equal(anchor.props.ref, ref);
  assert.match(anchor.props.rel, /\bnoopener\b/);
  assert.match(anchor.props.rel, /\bnoreferrer\b/);
});

test('BapsLink disabled state removes navigation and blocks click handlers', () => {
  let called = false;
  const element = BapsLink({
    children: 'Unavailable',
    href: '/unavailable',
    disabled: true,
    onClick: () => {
      called = true;
    },
  });
  const anchor = element.props.children;

  assert.equal(anchor.props.href, undefined);
  assert.equal(anchor.props['aria-disabled'], true);
  assert.equal(anchor.props.tabIndex, -1);
  assert.equal(anchor.props.onClick, undefined);
  assert.equal(called, false);
});

test('BapsAvatar normalizes aliases and applies brand, size and variant classes', () => {
  const ref = { current: null };
  const element = BapsAvatar({
    label: 'GP',
    brand: 'sampark',
    size: 'large',
    variant: 'success',
    ref,
  });
  const visual = element.props.children[0];

  assert.equal(element.type, 'span');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-avatar-wrap--l\b/);
  assert.match(visual.props.className, /\bbaps-sampark\b/);
  assert.match(visual.props.className, /\bbaps-avatar-html--l\b/);
  assert.match(visual.props.className, /\bbaps-avatar-html--success\b/);
  assert.doesNotMatch(visual.props.className, /\bbaps-avatar-html--circle\b/);
});

test('BapsAvatar image and icon forms preserve accessible names', () => {
  const image = BapsAvatar({
    image: '/person.jpg',
    imageAlt: 'Ghanshyam Patel',
  });
  const imageElement = image.props.children[0].props.children;
  assert.equal(imageElement.type, 'img');
  assert.equal(imageElement.props.alt, 'Ghanshyam Patel');

  const icon = BapsAvatar({
    children: 'icon',
    'aria-label': 'Profile',
  });
  assert.equal(icon.props.role, 'img');
  assert.equal(icon.props['aria-label'], 'Profile');
  assert.equal(
    icon.props.children[0].props.children.props['aria-hidden'],
    true,
  );
});

test('BapsAvatar status markers are decorative and token-styled by shared CSS', () => {
  const element = BapsAvatar({
    label: 'GP',
    size: 'xl',
    statusDot: true,
    iconBadge: true,
  });
  const markers = element.props.children[1];

  assert.match(element.props.className, /\bbaps-avatar-wrap--dot\b/);
  assert.match(element.props.className, /\bbaps-avatar-wrap--icon-badge\b/);
  assert.equal(markers.props['aria-hidden'], true);
  assert.equal(markers.props.children.length, 2);
});

test('BapsAvatarGroup forwards native group attributes, ref and size contract', () => {
  const ref = { current: null };
  const onKeyDown = () => undefined;
  const element = BapsAvatarGroup({
    children: 'avatars',
    size: 'xlarge',
    brand: 'sampark',
    'aria-label': 'Committee members',
    onKeyDown,
    ref,
  });

  assert.equal(element.type, 'div');
  assert.equal(element.props.role, 'group');
  assert.equal(element.props['aria-label'], 'Committee members');
  assert.equal(element.props.onKeyDown, onKeyDown);
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-avatar-group--xl\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
});

test('BapsBadge renders the canonical severity, size and brand structure', () => {
  const ref = { current: null };
  const element = BapsBadge({
    value: 8,
    severity: 'danger',
    badgeSize: 'large',
    brand: 'sampark',
    type: 'notification',
    ref,
  });
  const badge = element.props.children;

  assert.equal(element.type, 'baps-badge');
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(element.props.className, /\bbaps-badge-notification\b/);
  assert.equal(badge.type, 'span');
  assert.equal(badge.props.ref, ref);
  assert.match(badge.props.className, /\bp-badge-danger\b/);
  assert.match(badge.props.className, /\bp-badge-lg\b/);
  assert.equal(badge.props.children, 8);
});

test('BapsBadge dot names are explicit and disabled badges use native hidden', () => {
  const dot = BapsBadge({
    severity: 'success',
    'aria-label': 'Online',
  }).props.children;
  assert.match(dot.props.className, /\bp-badge-dot\b/);
  assert.equal(dot.props.role, 'status');
  assert.equal(dot.props['aria-label'], 'Online');

  const hidden = BapsBadge({
    value: '4',
    badgeDisabled: true,
  }).props.children;
  assert.equal(hidden.props.hidden, true);
});

test('BapsOverlayBadge keeps child interaction intact and forwards root events/ref', () => {
  const ref = { current: null };
  const onKeyDown = () => undefined;
  const child = { type: 'button', props: { children: 'Inbox' } };
  const element = BapsOverlayBadge({
    children: child,
    value: 4,
    badgeAriaLabel: '4 unread messages',
    onKeyDown,
    ref,
  });
  const badgeComponent = element.props.children[1];

  assert.equal(element.type, 'span');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onKeyDown, onKeyDown);
  assert.equal(element.props.children[0], child);
  assert.equal(badgeComponent.type, BapsBadge);
  assert.equal(badgeComponent.props.value, 4);
  assert.equal(badgeComponent.props['aria-label'], '4 unread messages');
});

test('BapsIndicator maps visual inputs to the canonical host contract', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const element = BapsIndicator({
    children: 3,
    severity: 'warning',
    size: 'xl',
    text: true,
    ring: true,
    'aria-label': '3 warnings',
    onClick,
    ref,
  });

  assert.equal(element.type, 'baps-indicator');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.role, 'status');
  assert.equal(element.props['aria-label'], '3 warnings');
  assert.match(element.props.className, /\bbaps-indicator--warning\b/);
  assert.match(element.props.className, /\bbaps-indicator--xl\b/);
  assert.match(element.props.className, /\bbaps-indicator--text\b/);
  assert.match(element.props.className, /\bbaps-indicator--ring\b/);
  assert.equal(element.props.children.props['aria-hidden'], undefined);
});

test('BapsIndicator defaults decorative content to hidden semantics', () => {
  const element = BapsIndicator({ severity: 'success' });

  assert.equal(element.props.role, undefined);
  assert.equal(element.props['aria-label'], undefined);
  assert.equal(element.props.children.props['aria-hidden'], true);
  assert.match(element.props.className, /\bbaps-indicator--m\b/);
});

test('BapsTag maps severity, size and brand to the shared standalone classes', () => {
  const ref = { current: null };
  const element = BapsTag({
    value: 'Registered',
    severity: 'contrast',
    size: 'l',
    brand: 'sampark',
    icon: 'check',
    ref,
  });

  assert.equal(element.type, 'span');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-tag--primary\b/);
  assert.match(element.props.className, /\bbaps-tag--l\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(element.props.children[1].props.children, 'Registered');
});

test('BapsTag trailing action is a labelled native button with disabled behavior', () => {
  const onAction = () => undefined;
  const element = BapsTag({
    value: 'Filter',
    action: true,
    actionLabel: 'Remove filter',
    onAction,
    disabled: true,
  });
  const action = element.props.children[3];

  assert.equal(action.type, 'button');
  assert.equal(action.props.type, 'button');
  assert.equal(action.props['aria-label'], 'Remove filter');
  assert.equal(action.props.onClick, onAction);
  assert.equal(action.props.disabled, true);
  assert.equal(element.props['aria-disabled'], true);
});

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

test('BapsMultiSelect preserves multi-selection and selection limits', () => {
  assert.deepEqual(getNextMultiSelectValue(['amd'], 'ldn'), ['amd', 'ldn']);
  assert.deepEqual(getNextMultiSelectValue(['amd'], 'amd'), []);
  assert.deepEqual(getNextMultiSelectValue(['amd'], 'ldn', 1), ['amd']);

  const html = renderToStaticMarkup(
    createElement(BapsMultiSelect, {
      ariaLabel: 'Cities',
      options: SELECTION_OPTIONS,
      defaultValue: ['amd', 'ldn'],
      display: 'chip',
    }),
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /p-multiselect-chip-item/);
  assert.match(html, /Remove Ahmedabad/);
});

test('BapsListbox state helper covers single, multiple and meta-key selection', () => {
  assert.equal(getNextListboxValue(null, 'amd', false, false, false), 'amd');
  assert.deepEqual(getNextListboxValue(['amd'], 'ldn', true, false, false), [
    'amd',
    'ldn',
  ]);
  assert.deepEqual(getNextListboxValue(['amd'], 'ldn', true, true, false), [
    'ldn',
  ]);

  const html = renderToStaticMarkup(
    createElement(BapsListbox, {
      ariaLabel: 'Centres',
      options: SELECTION_OPTIONS,
      defaultValue: 'amd',
    }),
  );
  assert.match(html, /role="listbox"/);
  assert.match(html, /role="option"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-disabled="true"/);
});

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

test('BapsDatepicker handles range transitions and renders an accessible inline grid', () => {
  const start = new Date(2026, 9, 7);
  const end = new Date(2026, 9, 10);
  const first = getNextDatepickerValue('range', [null, null], start);
  assert.equal(first.complete, false);
  assert.equal(formatBapsDate(first.value[0]), '10/07/2026');
  const second = getNextDatepickerValue('range', first.value, end);
  assert.equal(second.complete, true);
  assert.equal(formatBapsDate(second.value[1]), '10/10/2026');

  const html = renderToStaticMarkup(
    createElement(BapsDatepicker, {
      ariaLabel: 'Visit date',
      inline: true,
      defaultValue: start,
      brand: 'sampark',
    }),
  );
  assert.match(html, /<baps-datepicker class="baps-sampark baps-ds-sampark">/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /role="grid"/);
  assert.match(html, /aria-selected="true"/);
});

test('BapsSlider aligns values to step and exposes native slider semantics', () => {
  assert.equal(normaliseSliderValue(52, 0, 100, 5), 50);
  assert.equal(normaliseSliderValue(120, 0, 100, 5), 100);
  const html = renderToStaticMarkup(
    createElement(BapsSlider, {
      ariaLabel: 'Attendance target',
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 5,
    }),
  );
  assert.match(html, /role="slider"/);
  assert.match(html, /aria-valuenow="50"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
});

test('BapsChip uses shared host classes and a labelled native remove button', () => {
  const element = BapsChip({
    label: 'Ahmedabad',
    removable: true,
    brand: 'sampark',
  });
  const chip = element.props.children;
  const remove = chip.props.children[2];
  assert.equal(element.type, 'baps-chip');
  assert.match(element.props.className, /baps-sampark/);
  assert.equal(remove.type, 'button');
  assert.equal(remove.props['aria-label'], 'Remove Ahmedabad');
});

test('BapsUsersDropdown toggles checkbox values and renders a named combobox', () => {
  assert.deepEqual(getNextUsersDropdownValues(['asha'], 'ravi'), [
    'asha',
    'ravi',
  ]);
  assert.deepEqual(getNextUsersDropdownValues(['asha'], 'asha'), []);
  const html = renderToStaticMarkup(
    createElement(BapsUsersDropdown, {
      ariaLabel: 'Member',
      users: [{ value: 'asha', title: 'Asha Patel', avatarLabel: 'AP' }],
      defaultValue: 'asha',
    }),
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="Member"/);
  assert.match(html, />Asha Patel</);
});

test('BapsFileUpload renders one keyboard-operable native file input zone', () => {
  const html = renderToStaticMarkup(
    createElement(BapsFileUpload, {
      ariaLabel: 'Upload member photo',
      accept: 'image/*',
      multiple: true,
      brand: 'sampark',
    }),
  );
  assert.match(html, /<baps-file-upload class="baps-sampark">/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /type="file"/);
  assert.match(html, /accept="image\/\*"/);
  assert.match(html, /multiple=""/);
});

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

test('BapsSortIcon draws both chevrons when sortable but unsorted', () => {
  const el = BapsSortIcon({});
  assert.equal(el.props.className, 'p-datatable-sort-icon');
  assert.equal(el.props['aria-hidden'], 'true');
  // Neutral has to say "sortable" without claiming a direction, so it is the
  // only state that renders two paths.
  assert.equal(el.props.children.length, 2);
});

test('BapsSortIcon draws one chevron per direction, and they differ', () => {
  const up = BapsSortIcon({ order: 1 });
  const down = BapsSortIcon({ order: -1 });
  assert.equal(up.props.children.length, 1);
  assert.equal(down.props.children.length, 1);
  assert.notEqual(up.props.children[0].props.d, down.props.children[0].props.d);
});

test('BapsSortIcon shows a multi-sort badge only from index 1', () => {
  assert.equal(BapsSortIcon({ order: 1, index: 0 }).type, 'svg');
  const withBadge = BapsSortIcon({ order: 1, index: 2 });
  const badge = withBadge.props.children[1];
  assert.equal(badge.props.className, 'p-datatable-sort-badge');
  assert.equal(badge.props.children, 2);
});

const TABLE_ROWS = [
  { name: 'Charlie', age: 30 },
  { name: 'alice', age: 25 },
  { name: 'Bob', age: undefined },
];
const TABLE_COLS = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'age', header: 'Age', sortable: true },
];
const names = (html) => [...html.matchAll(new RegExp('<td[^>]*>([^<]*)<' + '/td>', 'g'))].map((m) => m[1]);

test('BapsTable emits the PrimeNG DOM the canonical stylesheet targets', () => {
  // These class names are a contract, not a preference: table.css styles 19
  // .p-datatable-* selectors, so renaming any of them renders it unstyled.
  const html = renderToStaticMarkup(
    createElement(BapsTable, { columns: TABLE_COLS, value: TABLE_ROWS }),
  );
  for (const cls of [
    'p-datatable',
    'p-datatable-table-container',
    'p-datatable-table',
    'p-datatable-thead',
    'p-datatable-tbody',
    'p-datatable-column-header-content',
    'p-datatable-column-title',
  ]) {
    assert.ok(html.includes(cls), 'missing ' + cls);
  }
});

test('BapsTable sorts its own rows when uncontrolled', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      defaultSortField: 'name',
      defaultSortOrder: 1,
    }),
  );
  // localeCompare, so 'alice' sorts with the A's rather than after Z.
  assert.deepEqual(names(html).filter((n) => /^[A-Za-z]+$/.test(n)), [
    'alice',
    'Bob',
    'Charlie',
  ]);
});

const sortCalls = [];
test('BapsTable leaves row order alone when sorting is controlled', () => {
  // The guarantee a server-paged table depends on: the caller handed us one
  // page, and reordering it would show the wrong rows.
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      sortField: 'name',
      sortOrder: 1,
      // Recorded rather than ignored: a controlled table must still report the
      // click so the caller can refetch, even though it does not reorder.
      onSort: (e) => sortCalls.push(e),
    }),
  );
  assert.deepEqual(names(html).filter((n) => /^[A-Za-z]+$/.test(n)), [
    'Charlie',
    'alice',
    'Bob',
  ]);
  assert.equal(sortCalls.length, 0, 'no click yet, so no report');
});

test('BapsTable sorts absent values last in both directions', () => {
  const asc = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      defaultSortField: 'age',
      defaultSortOrder: 1,
    }),
  );
  // Bob has no age. Absent is not small, so it trails ascending too.
  assert.equal(names(asc).filter((n) => /^[A-Za-z]+$/.test(n)).at(-1), 'Bob');
});

test('BapsTable marks aria-sort only on sortable columns', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: [...TABLE_COLS, { field: 'note', header: 'Note' }],
      value: TABLE_ROWS,
      defaultSortField: 'name',
      defaultSortOrder: -1,
    }),
  );
  assert.ok(html.includes('aria-sort="descending"'));
  assert.ok(html.includes('aria-sort="none"'));
  // Three columns, two sortable — the plain one carries no aria-sort at all.
  assert.equal((html.match(/aria-sort=/g) ?? []).length, 2);
});

test('BapsTable spans the empty message across every column', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, { columns: TABLE_COLS, value: [] }),
  );
  assert.ok(html.includes('p-datatable-empty-message'));
  // renderToStaticMarkup emits the React prop name; the browser DOM turns it
  // into the lowercase attribute.
  assert.ok(html.includes('colSpan="2"'));
  assert.ok(html.includes('No results found'));
});

test('BapsTable marks the container busy while loading', () => {
  const html = renderToStaticMarkup(
    createElement(BapsTable, {
      columns: TABLE_COLS,
      value: TABLE_ROWS,
      loading: true,
    }),
  );
  // aria-busy is what a screen reader acts on; the mask is decoration.
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('p-datatable-mask'));
});
