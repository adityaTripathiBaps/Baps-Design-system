import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsBadge } from '../dist/index.js';

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
