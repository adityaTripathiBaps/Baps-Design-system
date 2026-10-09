import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsButton } from '../dist/index.js';

test('BapsButton preserves native keyboard semantics and typed event/ref forwarding', () => {
  const onClick = () => undefined;
  const ref = { current: null };
  const element = BapsButton({ label: 'Save', onClick, ref });

  assert.equal(element.type, 'button');
  assert.equal(element.props.type, 'button');
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.disabled, false);
  assert.match(element.props.className, /\bbaps-button--primary\b/);
});

test('BapsButton loading state is disabled, busy and uses the shared icon', () => {
  const element = BapsButton({
    label: 'Saving',
    brand: 'sampark',
    size: 'xlarge',
    loading: true,
  });

  assert.equal(element.props.disabled, true);
  assert.equal(element.props['aria-busy'], true);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(element.props.className, /\bbaps-button--loading\b/);
  assert.match(element.props.className, /\bbaps-button--xl\b/);
});

test('BapsButton icon-only output keeps an accessible native button name', () => {
  const element = BapsButton({ icon: 'trash', 'aria-label': 'Delete' });

  assert.equal(element.props['aria-label'], 'Delete');
  assert.match(element.props.className, /\bbaps-button--icon-only\b/);
});
