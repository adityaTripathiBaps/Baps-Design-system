import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsTab, BapsTabList, BapsTabs } from '../dist/index.js';

test('BapsTabs marks one tab selected and the rest not', () => {
  const html = renderToStaticMarkup(
    createElement(
      BapsTabs,
      { defaultValue: 'b' },
      createElement(
        BapsTabList,
        null,
        createElement(BapsTab, { value: 'a' }, 'First'),
        createElement(BapsTab, { value: 'b' }, 'Second'),
      ),
    ),
  );
  // role="tab" with aria-selected is the contract a screen reader reads; the
  // painted underline is not.
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-selected="false"/g) ?? []).length, 1);
});
