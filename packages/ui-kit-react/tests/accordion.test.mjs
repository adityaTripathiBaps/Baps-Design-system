import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsAccordion, BapsAccordionPanel } from '../dist/index.js';

test('BapsAccordion opens one panel at a time unless multiple is set', () => {
  const single = renderToStaticMarkup(
    createElement(
      BapsAccordion,
      { defaultValue: 'a' },
      createElement(BapsAccordionPanel, { value: 'a', header: 'First' }, 'one'),
      createElement(BapsAccordionPanel, { value: 'b', header: 'Second' }, 'two'),
    ),
  );
  // aria-expanded is the contract; exactly one panel may be open in single mode.
  assert.equal((single.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((single.match(/aria-expanded="false"/g) ?? []).length, 1);
});

test('BapsAccordion opens several panels when multiple is set', () => {
  const html = renderToStaticMarkup(
    createElement(
      BapsAccordion,
      { multiple: true, defaultValue: ['a', 'b'] },
      createElement(BapsAccordionPanel, { value: 'a', header: 'First' }, 'one'),
      createElement(BapsAccordionPanel, { value: 'b', header: 'Second' }, 'two'),
    ),
  );
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 2);
});
