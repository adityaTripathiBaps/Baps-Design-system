import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsBadge, BapsOverlayBadge } from '../dist/index.js';

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
