import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsMessage } from '../dist/index.js';

test('BapsMessage exposes polite alert semantics and severity variants', () => {
  const ref = { current: null };
  const element = BapsMessage({
    text: 'Email is required.',
    icon: 'info-circle',
    severity: 'error',
    variant: 'simple',
    size: 'small',
    brand: 'sampark',
    ref,
  });
  const message = element.props.children;
  const content = message.props.children.props.children;

  assert.equal(element.props.role, 'alert');
  assert.equal(element.props['aria-live'], 'polite');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(message.props.className, /\bp-message-error\b/);
  assert.match(message.props.className, /\bp-message-simple\b/);
  assert.match(message.props.className, /\bp-message-sm\b/);
  assert.equal(content.props.children[1].props.children, 'Email is required.');
});
