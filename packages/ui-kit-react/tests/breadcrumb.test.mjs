import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsBreadcrumb } from '../dist/index.js';

test('BapsBreadcrumb marks only the last crumb as current', () => {
  const html = renderToStaticMarkup(
    createElement(BapsBreadcrumb, {
      model: [{ label: 'Home', url: '/' }, { label: 'Projects', url: '/p' }, { label: 'Detail' }],
    }),
  );
  // aria-current="page", not a class: it is what a screen reader reads for
  // "you are here", and exactly one crumb may claim it.
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.ok(html.includes('Detail'));
});
