// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsTooltip } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

// React listens for focus through delegated focusin, so a native 'focus' —
// which does not bubble — never reaches onFocus.

/** Let React commit, run effects, and let the portal attach. */
const flush = () => new Promise((r) => setTimeout(r, 40));

let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

async function render(props) {
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(
    createElement(
      BapsTooltip,
      props,
      createElement('button', { type: 'button' }, 'Archive'),
    ),
  );
  await flush();
  return host;
}

test('BapsTooltip renders its trigger and nothing else at rest', async (t) => {
  t.after(teardown);
  const host = await render({ content: 'Archive this project' });
  assert.match(host.textContent, /Archive/);
  // The bubble is not in the DOM until the pointer or focus arrives, so it
  // cannot be read by a screen reader walking the page either.
  assert.equal(document.querySelector('[role="tooltip"]'), null);
});

test('BapsTooltip opens on focus, not only on hover', async (t) => {
  t.after(teardown);
  const host = await render({ content: 'Archive this project' });

  host.querySelector('button').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  await flush();

  // Keyboard users never hover. A tooltip that only answers the pointer is
  // invisible to them.
  const tip = document.querySelector('[role="tooltip"]');
  assert.ok(tip, 'tooltip should open on focus');
  assert.match(tip.textContent, /Archive this project/);
});

test('BapsTooltip portals the bubble out of the trigger', async (t) => {
  t.after(teardown);
  const host = await render({ content: 'Archive this project' });

  host.querySelector('button').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  await flush();

  const tip = document.querySelector('[role="tooltip"]');
  // Out of the trigger's stacking and overflow context, which is the whole
  // reason it portals.
  assert.ok(!host.contains(tip));
  assert.ok(document.body.contains(tip));
});
