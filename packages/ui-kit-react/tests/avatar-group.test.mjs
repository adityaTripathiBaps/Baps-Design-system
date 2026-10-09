import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsAvatarGroup } from '../dist/index.js';

test('BapsAvatarGroup forwards native group attributes, ref and size contract', () => {
  const ref = { current: null };
  const onKeyDown = () => undefined;
  const element = BapsAvatarGroup({
    children: 'avatars',
    size: 'xlarge',
    brand: 'sampark',
    'aria-label': 'Committee members',
    onKeyDown,
    ref,
  });

  assert.equal(element.type, 'div');
  assert.equal(element.props.role, 'group');
  assert.equal(element.props['aria-label'], 'Committee members');
  assert.equal(element.props.onKeyDown, onKeyDown);
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-avatar-group--xl\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
});
