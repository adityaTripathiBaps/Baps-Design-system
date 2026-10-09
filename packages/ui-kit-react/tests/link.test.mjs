import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsLink } from '../dist/index.js';

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
