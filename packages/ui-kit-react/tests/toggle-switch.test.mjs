import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsToggleSwitch } from '../dist/index.js';

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
