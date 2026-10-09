import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsFileUpload } from '../dist/index.js';

test('BapsFileUpload renders one keyboard-operable native file input zone', () => {
  const html = renderToStaticMarkup(
    createElement(BapsFileUpload, {
      ariaLabel: 'Upload member photo',
      accept: 'image/*',
      multiple: true,
      brand: 'sampark',
    }),
  );
  assert.match(html, /<baps-file-upload class="baps-sampark">/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /type="file"/);
  assert.match(html, /accept="image\/\*"/);
  assert.match(html, /multiple=""/);
});
