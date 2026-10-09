import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsProgressBar } from '../dist/index.js';

test('BapsProgressBar clamps determinate values and exposes progress semantics', () => {
  const ref = { current: null };
  const element = BapsProgressBar({
    value: 140,
    showValue: true,
    severity: 'success',
    brand: 'sampark',
    'aria-label': 'Import progress',
    ref,
  });
  const progress = element.props.children;
  const value = progress.props.children;

  assert.equal(element.type, 'baps-progressbar');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.role, 'progressbar');
  assert.equal(element.props['aria-label'], 'Import progress');
  assert.equal(element.props['aria-valuenow'], 100);
  assert.match(element.props.className, /\bbaps-progressbar-success\b/);
  assert.match(element.props.className, /\bbaps-progressbar-has-value\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(value.props.style.width, '100%');
  assert.equal(value.props.children.props.children, '100%');
});

test('BapsProgressBar indeterminate mode omits numeric aria values', () => {
  const element = BapsProgressBar({
    mode: 'indeterminate',
    'aria-label': 'Loading members',
  });
  const progress = element.props.children;

  assert.equal(element.props.role, 'progressbar');
  assert.equal(element.props['aria-valuenow'], undefined);
  assert.equal(element.props['aria-valuemin'], undefined);
  assert.equal(element.props['aria-valuemax'], undefined);
  assert.match(progress.props.className, /\bp-progressbar-indeterminate\b/);
  assert.equal(progress.props.children.props.style, undefined);
  // The name must reach the element carrying role="progressbar", not the
  // visual inside it. This is the one of the three axe findings the Angular
  // wrapper needed a whole new input to fix; React gets it from the native
  // attribute spread, and this asserts it actually lands.
  assert.equal(element.props['aria-label'], 'Loading members');
  assert.equal(progress.props['aria-hidden'], 'true');
});
