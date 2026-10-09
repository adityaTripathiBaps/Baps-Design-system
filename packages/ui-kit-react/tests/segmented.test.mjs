import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BapsSegmented,
  getNextSegmentedValue,
  moveSegmentedFocus,
} from '../dist/index.js';

test('BapsSegmented state transitions enforce single and multiple selection rules', () => {
  assert.equal(getNextSegmentedValue('Once', 'Repeat', false, true), 'Repeat');
  assert.equal(getNextSegmentedValue('Once', 'Once', false, true), null);
  assert.equal(getNextSegmentedValue('Once', 'Once', false, false), 'Once');
  assert.deepEqual(getNextSegmentedValue(['Su'], 'We', true, true), [
    'Su',
    'We',
  ]);
  assert.deepEqual(getNextSegmentedValue(['Su'], 'Su', true, false), ['Su']);
});

test('BapsSegmented keyboard focus wraps and supports Home and End', () => {
  let activeElement;
  const ownerDocument = {
    get activeElement() {
      return activeElement;
    },
  };
  const buttons = [0, 1, 2].map((index) => {
    const button = {
      index,
      focus() {
        activeElement = button;
      },
    };
    return button;
  });
  const group = {
    ownerDocument,
    querySelectorAll: () => buttons,
  };

  activeElement = buttons[2];
  assert.equal(moveSegmentedFocus(group, 'ArrowRight'), true);
  assert.equal(activeElement, buttons[0]);
  assert.equal(moveSegmentedFocus(group, 'End'), true);
  assert.equal(activeElement, buttons[2]);
  assert.equal(moveSegmentedFocus(group, 'Home'), true);
  assert.equal(activeElement, buttons[0]);
  assert.equal(moveSegmentedFocus(group, 'Tab'), false);
  assert.equal(BapsSegmented.displayName, 'BapsSegmented');
});
