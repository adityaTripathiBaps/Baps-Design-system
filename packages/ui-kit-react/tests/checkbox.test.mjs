import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsCheckbox } from '../dist/index.js';

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
