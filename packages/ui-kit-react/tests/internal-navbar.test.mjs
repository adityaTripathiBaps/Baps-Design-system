import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsInternalNavbar } from '../dist/index.js';

const NAV_ITEMS = [
  { label: 'Dashboard', iconName: 'widget' },
  { label: 'Reports', iconName: 'bar-chart' },
  { label: 'Settings', iconName: 'settings' },
];

test('BapsInternalNavbar marks the active row for sight and for a reader', () => {
  const html = renderToStaticMarkup(
    createElement(BapsInternalNavbar, { items: NAV_ITEMS, activeItem: 'Reports' }),
  );
  // The class paints it; aria-current is what is announced. Exactly one row
  // may claim either, and they must be the same row.
  assert.equal((html.match(/baps-internal-nav__item--active/g) ?? []).length, 1);
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
});

test('BapsInternalNavbar gives every row a real button', () => {
  const html = renderToStaticMarkup(createElement(BapsInternalNavbar, { items: NAV_ITEMS }));
  // Keyboard reach and the actionable role come from the element, not from
  // a click handler on a div.
  assert.equal((html.match(/<button/g) ?? []).length, NAV_ITEMS.length);
  assert.ok(html.includes('aria-label="Section navigation"') || html.includes('<nav'));
});

test('BapsInternalNavbar collapses by class, keeping the rows in the DOM', () => {
  const open = renderToStaticMarkup(createElement(BapsInternalNavbar, { items: NAV_ITEMS }));
  const shut = renderToStaticMarkup(
    createElement(BapsInternalNavbar, { items: NAV_ITEMS, collapsed: true }),
  );
  assert.ok(!open.includes('baps-internal-nav--collapsed'));
  assert.ok(shut.includes('baps-internal-nav--collapsed'));
  // Rows survive collapse — hiding is the CSS's job, not a render branch.
  assert.equal((shut.match(/<button/g) ?? []).length, NAV_ITEMS.length);
});
