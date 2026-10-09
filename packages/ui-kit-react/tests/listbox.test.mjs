import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsListbox, getNextListboxValue } from '../dist/index.js';

const SELECTION_OPTIONS = [
  { label: 'Ahmedabad', value: 'amd' },
  { label: 'London', value: 'ldn' },
  { label: 'Nairobi', value: 'nbo', disabled: true },
];

test('BapsListbox state helper covers single, multiple and meta-key selection', () => {
  assert.equal(getNextListboxValue(null, 'amd', false, false, false), 'amd');
  assert.deepEqual(getNextListboxValue(['amd'], 'ldn', true, false, false), [
    'amd',
    'ldn',
  ]);
  assert.deepEqual(getNextListboxValue(['amd'], 'ldn', true, true, false), [
    'ldn',
  ]);

  const html = renderToStaticMarkup(
    createElement(BapsListbox, {
      ariaLabel: 'Centres',
      options: SELECTION_OPTIONS,
      defaultValue: 'amd',
    }),
  );
  assert.match(html, /role="listbox"/);
  assert.match(html, /role="option"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-disabled="true"/);
});
