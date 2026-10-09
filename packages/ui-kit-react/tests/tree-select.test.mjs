import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsTreeSelect, getNextTreeSelectValue } from '../dist/index.js';

const LOCATION_TREE = [
  {
    key: 'in',
    label: 'India',
    children: [
      { key: 'in-amd', label: 'Ahmedabad' },
      { key: 'in-mum', label: 'Mumbai' },
    ],
  },
];

test('BapsTreeSelect cascades checkbox selection and renders a tree combobox', () => {
  assert.deepEqual(
    getNextTreeSelectValue(LOCATION_TREE, [], 'in', 'checkbox', true, true),
    ['in', 'in-amd', 'in-mum'],
  );
  assert.deepEqual(
    getNextTreeSelectValue(
      LOCATION_TREE,
      ['in-amd'],
      'in-mum',
      'checkbox',
      true,
      true,
    ),
    ['in-amd', 'in-mum', 'in'],
  );

  const html = renderToStaticMarkup(
    createElement(BapsTreeSelect, {
      ariaLabel: 'Locations',
      options: LOCATION_TREE,
      defaultValue: 'in-amd',
    }),
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-haspopup="tree"/);
  assert.match(html, />Ahmedabad</);
});
