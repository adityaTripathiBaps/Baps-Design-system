// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsDrawer } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

/** Let React commit, run effects, and let the portal attach. */
const flush = () => new Promise((r) => setTimeout(r, 40));

let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

async function render(props, children = 'Panel') {
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(createElement(BapsDrawer, props, children));
  await flush();
  return { host, root };
}

test('BapsDrawer renders nothing while closed', async (t) => {
  t.after(teardown);
  const { host } = await render({ visible: false, header: 'Fields' });
  // Absent rather than hidden: a closed drawer left in the DOM is still
  // reachable by a screen reader walking the page.
  assert.equal(host.innerHTML, '');
  assert.equal(document.querySelector('baps-drawer'), null);
});

test('BapsDrawer portals out of its host', async (t) => {
  t.after(teardown);
  const { host } = await render({ visible: true, header: 'Fields' });
  const el = document.querySelector('baps-drawer');
  assert.ok(el, 'drawer should be in the document');
  // This is why it cannot be tested by renderToStaticMarkup, and why eight
  // other components had no tests until jsdom arrived.
  assert.ok(!host.contains(el));
  assert.ok(document.body.contains(el));
});

test('BapsDrawer carries its header through as the panel title', async (t) => {
  t.after(teardown);
  await render({ visible: true, header: 'Fields' });
  assert.match(document.body.textContent, /Fields/);
  assert.match(document.body.textContent, /Panel/);
});

test('BapsDrawer scopes the Sampark brand on the host, not the panel', async (t) => {
  t.after(teardown);
  await render({ visible: true, header: 'Fields', brand: 'sampark' });
  const host = document.querySelector('baps-drawer');
  // The scope class sits on the custom element so the whole subtree inherits
  // the token set; putting it on the panel would miss the mask.
  assert.match(host.className, /baps-ds-sampark/);
});

test('BapsDrawer places itself from the position prop', async (t) => {
  t.after(teardown);
  await render({ visible: true, header: 'Fields', position: 'left' });
  // Position is a class, not inline geometry, so the stylesheet owns the
  // animation and the sizing.
  assert.match(document.body.innerHTML, /p-drawer-left/);
});
