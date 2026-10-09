import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsToolbar } from '../dist/index.js';

test('BapsToolbar keeps its three slots independent', () => {
  const html = renderToStaticMarkup(
    createElement(BapsToolbar, { title: 'Projects', right: createElement('button', null, 'New') }),
  );
  assert.ok(html.includes('Projects'));
  assert.ok(html.includes('New'));
});
