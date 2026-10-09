import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsIndicator } from '../dist/index.js';

test('BapsIndicator maps visual inputs to the canonical host contract', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const element = BapsIndicator({
    children: 3,
    severity: 'warning',
    size: 'xl',
    text: true,
    ring: true,
    'aria-label': '3 warnings',
    onClick,
    ref,
  });

  assert.equal(element.type, 'baps-indicator');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.role, 'status');
  assert.equal(element.props['aria-label'], '3 warnings');
  assert.match(element.props.className, /\bbaps-indicator--warning\b/);
  assert.match(element.props.className, /\bbaps-indicator--xl\b/);
  assert.match(element.props.className, /\bbaps-indicator--text\b/);
  assert.match(element.props.className, /\bbaps-indicator--ring\b/);
  assert.equal(element.props.children.props['aria-hidden'], undefined);
});

test('BapsIndicator defaults decorative content to hidden semantics', () => {
  const element = BapsIndicator({ severity: 'success' });

  assert.equal(element.props.role, undefined);
  assert.equal(element.props['aria-label'], undefined);
  assert.equal(element.props.children.props['aria-hidden'], true);
  assert.match(element.props.className, /\bbaps-indicator--m\b/);
});
