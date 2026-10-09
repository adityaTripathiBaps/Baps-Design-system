import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsTextarea } from '../dist/index.js';

test('BapsTextarea auto-resizes and preserves the consumer input handler', () => {
  let calls = 0;
  const element = BapsTextarea({
    autoResize: true,
    invalid: true,
    onInput: () => {
      calls += 1;
    },
  });
  const currentTarget = { style: { height: '5rem' }, scrollHeight: 148 };

  element.props.onInput({ currentTarget });

  assert.equal(currentTarget.style.height, '148px');
  assert.equal(calls, 1);
  assert.equal(element.props['aria-invalid'], true);
  assert.match(element.props.className, /\bp-textarea-auto-resize\b/);
});
