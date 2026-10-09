// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsDialog } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

/** Let React commit, run effects, and let the portal attach. */
const flush = () => new Promise((r) => setTimeout(r, 40));

/**
 * Dialog is one of nine components that had no test at all, because
 * `renderToStaticMarkup` throws "document is not defined" the moment
 * `createPortal` runs. With jsdom the portal has somewhere to land and the
 * things that matter become readable: where it mounted, what it is called,
 * and whether Escape reaches the caller.
 */
let active = null;

/** Unmount the React root, then clear the body — in that order, or the root
 *  is left pointing at a container that no longer exists. */
function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

async function render(props, children = 'Body') {
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(createElement(BapsDialog, props, children));
  // React 19 commits asynchronously; a 0ms tick is not enough for the
  // portal and its effects to land.
  await flush();
  return { host, root };
}

test('BapsDialog renders nothing at all while closed', async (t) => {
  t.after(teardown);
  const { host } = await render({ visible: false, header: 'Project details' });
  // Not hidden — absent. A closed dialog in the DOM is still reachable by a
  // screen reader walking the page.
  assert.equal(host.innerHTML, '');
  assert.equal(document.querySelector('dialog'), null);
});

test('BapsDialog portals out of its host, not into it', async (t) => {
  t.after(teardown);
  const { host } = await render({ visible: true, header: 'Project details' });
  const el = document.querySelector('dialog');
  assert.ok(el, 'dialog should be in the document');
  // The point of the portal: it escapes whatever overflow or stacking context
  // the caller happens to sit in.
  assert.ok(!host.contains(el));
  assert.ok(document.body.contains(el));
});

test('BapsDialog takes its accessible name from header', async (t) => {
  t.after(teardown);
  await render({ visible: true, header: 'Project details' });
  const el = document.querySelector('dialog');
  const labelled = el.getAttribute('aria-labelledby');
  const named =
    el.getAttribute('aria-label') ||
    (labelled && document.getElementById(labelled)?.textContent);
  // Without this a dialog is announced as nothing — the aria-dialog-name
  // finding the a11y audit reports elsewhere in this library.
  assert.match(String(named), /Project details/);
});

test('BapsDialog reports its close button to the caller, and does not self-close', async (t) => {
  t.after(teardown);
  const seen = [];
  // closable defaults to FALSE, so the button has to be asked for.
  await render({
    visible: true,
    header: 'Project details',
    closable: true,
    onVisibleChange: (v) => seen.push(v),
  });

  document.querySelector('.p-dialog-header-close').click();
  await flush();

  // visible is a controlled prop, so the component asks rather than decides.
  // Closing itself would leave the caller's state disagreeing with the screen.
  assert.deepEqual(seen, [false]);
  assert.ok(document.querySelector('dialog'), 'still open until the caller says otherwise');
});

test('BapsDialog hides its close button by default', async (t) => {
  t.after(teardown);
  // Not an oversight: closable defaults to false, so a dialog that must be
  // answered cannot be dismissed by reflex.
  await render({ visible: true, header: 'Project details' });
  assert.equal(document.querySelector('.p-dialog-header-close'), null);
});

// NOT tested here: Escape. A browser turns it into a 'cancel' event on an open
// <dialog> and the component listens for exactly that, but jsdom implements
// neither showModal's modal behaviour nor the cancel it raises, and React
// attaches onCancel directly rather than through its delegated root. A test
// that synthesised the event would be testing the synthesiser. The wiring is
// visible in dialog.tsx as onCancel={handleCancel} guarded by closeOnEscape.
