import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsAvatar } from '../dist/index.js';

test('BapsAvatar normalizes aliases and applies brand, size and variant classes', () => {
  const ref = { current: null };
  const element = BapsAvatar({
    label: 'GP',
    brand: 'sampark',
    size: 'large',
    variant: 'success',
    ref,
  });
  const visual = element.props.children[0];

  assert.equal(element.type, 'span');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-avatar-wrap--l\b/);
  assert.match(visual.props.className, /\bbaps-sampark\b/);
  assert.match(visual.props.className, /\bbaps-avatar-html--l\b/);
  assert.match(visual.props.className, /\bbaps-avatar-html--success\b/);
  assert.doesNotMatch(visual.props.className, /\bbaps-avatar-html--circle\b/);
});

test('BapsAvatar image and icon forms preserve accessible names', () => {
  const image = BapsAvatar({
    image: '/person.jpg',
    imageAlt: 'Ghanshyam Patel',
  });
  const imageElement = image.props.children[0].props.children;
  assert.equal(imageElement.type, 'img');
  assert.equal(imageElement.props.alt, 'Ghanshyam Patel');

  const icon = BapsAvatar({
    children: 'icon',
    'aria-label': 'Profile',
  });
  assert.equal(icon.props.role, 'img');
  assert.equal(icon.props['aria-label'], 'Profile');
  assert.equal(
    icon.props.children[0].props.children.props['aria-hidden'],
    true,
  );
});

test('BapsAvatar status markers are decorative and token-styled by shared CSS', () => {
  const element = BapsAvatar({
    label: 'GP',
    size: 'xl',
    statusDot: true,
    iconBadge: true,
  });
  const markers = element.props.children[1];

  assert.match(element.props.className, /\bbaps-avatar-wrap--dot\b/);
  assert.match(element.props.className, /\bbaps-avatar-wrap--icon-badge\b/);
  assert.equal(markers.props['aria-hidden'], true);
  assert.equal(markers.props.children.length, 2);
});
