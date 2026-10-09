import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsSpinner } from '../dist/index.js';

test('BapsSpinner clamps determinate progress and forwards native attributes', () => {
  const ref = { current: null };
  const onClick = () => undefined;
  const element = BapsSpinner({
    value: -12,
    size: 'small',
    brand: 'sampark',
    'aria-label': 'File upload',
    onClick,
    ref,
  });
  const arc = element.props.children.props.children[1];

  assert.equal(element.type, 'baps-spinner');
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.role, 'progressbar');
  assert.equal(element.props['aria-label'], 'File upload');
  assert.equal(element.props['aria-valuenow'], 0);
  assert.match(element.props.className, /\bbaps-spinner-small\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.ok(Math.abs(arc.props.strokeDashoffset - 2 * Math.PI * 14) < 1e-12);
});

test('BapsSpinner indeterminate mode is a named status without numeric values', () => {
  const element = BapsSpinner({ ariaLabel: 'Refreshing' });
  const arc = element.props.children.props.children[1];

  assert.equal(element.props.role, 'status');
  assert.equal(element.props['aria-label'], 'Refreshing');
  assert.equal(element.props['aria-valuenow'], undefined);
  assert.match(element.props.className, /\bbaps-spinner-indeterminate\b/);
  assert.match(arc.props.strokeDasharray, / /);
});
