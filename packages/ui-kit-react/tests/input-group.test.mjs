import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsInputGroup, BapsInputText } from '../dist/index.js';

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
