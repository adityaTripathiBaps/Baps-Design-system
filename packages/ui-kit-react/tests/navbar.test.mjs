import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsNavbar } from '../dist/index.js';

test('BapsNavbar renders title and version, and omits what is unset', () => {
  const full = renderToStaticMarkup(
    createElement(BapsNavbar, { title: 'Sampark', version: 'v1.1.0' }),
  );
  const bare = renderToStaticMarkup(createElement(BapsNavbar, {}));
  assert.ok(full.includes('baps-navbar__title'));
  assert.ok(full.includes('baps-navbar__version'));
  // No empty spans: an unset input renders nothing rather than a blank slot.
  assert.ok(!bare.includes('baps-navbar__title'));
  assert.ok(!bare.includes('baps-navbar__version'));
});

test('BapsNavbar adds the chevron only when asked, and names its state', () => {
  const without = renderToStaticMarkup(createElement(BapsNavbar, { title: 'Sampark' }));
  const withBtn = renderToStaticMarkup(
    createElement(BapsNavbar, { title: 'Sampark', menuButton: true, menuOpen: true }),
  );
  assert.ok(!without.includes('baps-navbar__menu-button'));
  assert.ok(withBtn.includes('baps-navbar__menu-button'));
  // aria-expanded, so the button says which way it will go.
  assert.ok(withBtn.includes('aria-expanded="true"'));
});
