import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsDivider } from '../dist/index.js';

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
