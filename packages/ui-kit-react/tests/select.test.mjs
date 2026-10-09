import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsSelect } from '../dist/index.js';

const SELECTION_OPTIONS = [
  { label: 'Ahmedabad', value: 'amd' },
  { label: 'London', value: 'ldn' },
  { label: 'Nairobi', value: 'nbo', disabled: true },
];

test('BapsSelect server markup exposes a named native combobox contract', () => {
  const html = renderToStaticMarkup(
    createElement(BapsSelect, {
      ariaLabel: 'City',
      options: SELECTION_OPTIONS,
      defaultValue: 'ldn',
      brand: 'sampark',
      showClear: true,
    }),
  );

  assert.match(html, /<baps-select class="baps-sampark">/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="City"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />London</);
});
