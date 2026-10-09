import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsSkeleton } from '../dist/index.js';

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
