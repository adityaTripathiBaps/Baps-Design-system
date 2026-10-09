import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BapsDatepicker,
  getNextDatepickerValue,
  formatBapsDate,
} from '../dist/index.js';

test('BapsDatepicker handles range transitions and renders an accessible inline grid', () => {
  const start = new Date(2026, 9, 7);
  const end = new Date(2026, 9, 10);
  const first = getNextDatepickerValue('range', [null, null], start);
  assert.equal(first.complete, false);
  assert.equal(formatBapsDate(first.value[0]), '10/07/2026');
  const second = getNextDatepickerValue('range', first.value, end);
  assert.equal(second.complete, true);
  assert.equal(formatBapsDate(second.value[1]), '10/10/2026');

  const html = renderToStaticMarkup(
    createElement(BapsDatepicker, {
      ariaLabel: 'Visit date',
      inline: true,
      defaultValue: start,
      brand: 'sampark',
    }),
  );
  assert.match(html, /<baps-datepicker class="baps-sampark baps-ds-sampark">/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /role="grid"/);
  assert.match(html, /aria-selected="true"/);
});
