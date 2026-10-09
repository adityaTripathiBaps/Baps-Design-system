import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsRadio } from '../dist/index.js';

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
