import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsSlider, normaliseSliderValue } from '../dist/index.js';

test('BapsSlider aligns values to step and exposes native slider semantics', () => {
  assert.equal(normaliseSliderValue(52, 0, 100, 5), 50);
  assert.equal(normaliseSliderValue(120, 0, 100, 5), 100);
  const html = renderToStaticMarkup(
    createElement(BapsSlider, {
      ariaLabel: 'Attendance target',
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 5,
    }),
  );
  assert.match(html, /role="slider"/);
  assert.match(html, /aria-valuenow="50"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
});
