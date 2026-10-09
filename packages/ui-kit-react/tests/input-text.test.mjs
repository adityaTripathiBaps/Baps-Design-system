import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsInputText } from '../dist/index.js';

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
