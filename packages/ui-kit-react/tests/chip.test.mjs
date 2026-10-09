import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsChip } from '../dist/index.js';

test('BapsChip uses shared host classes and a labelled native remove button', () => {
  const element = BapsChip({
    label: 'Ahmedabad',
    removable: true,
    brand: 'sampark',
  });
  const chip = element.props.children;
  const remove = chip.props.children[2];
  assert.equal(element.type, 'baps-chip');
  assert.match(element.props.className, /baps-sampark/);
  assert.equal(remove.type, 'button');
  assert.equal(remove.props['aria-label'], 'Remove Ahmedabad');
});
