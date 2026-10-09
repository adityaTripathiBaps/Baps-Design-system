import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsMultiSelect, getNextMultiSelectValue } from '../dist/index.js';

const SELECTION_OPTIONS = [
  { label: 'Ahmedabad', value: 'amd' },
  { label: 'London', value: 'ldn' },
  { label: 'Nairobi', value: 'nbo', disabled: true },
];

test('BapsMultiSelect preserves multi-selection and selection limits', () => {
  assert.deepEqual(getNextMultiSelectValue(['amd'], 'ldn'), ['amd', 'ldn']);
  assert.deepEqual(getNextMultiSelectValue(['amd'], 'amd'), []);
  assert.deepEqual(getNextMultiSelectValue(['amd'], 'ldn', 1), ['amd']);

  const html = renderToStaticMarkup(
    createElement(BapsMultiSelect, {
      ariaLabel: 'Cities',
      options: SELECTION_OPTIONS,
      defaultValue: ['amd', 'ldn'],
      display: 'chip',
    }),
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /p-multiselect-chip-item/);
  assert.match(html, /Remove Ahmedabad/);
});
