// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsToastProvider, useToast } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

/** Let React commit, run effects, and let the portal attach. */
const flush = () => new Promise((r) => setTimeout(r, 40));

let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

/**
 * A toast has no markup until something pushes one, so every test needs a
 * child inside the provider that can reach the context. This renders nothing
 * and calls `push` once on mount.
 */
function Pusher({ push }) {
  const toast = useToast();
  useEffect(() => {
    push?.(toast);
  }, []);
  return null;
}

async function render(providerProps = {}, push) {
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(
    createElement(BapsToastProvider, providerProps, createElement(Pusher, { push })),
  );
  await flush();
  return { host, root };
}

const container = () => document.querySelector('.p-toast');
const messages = () => container().querySelectorAll('.p-toast-message');

test('BapsToastProvider portals its container to the body', async (t) => {
  t.after(teardown);
  const { host } = await render();
  const el = container();
  assert.ok(el, 'container should be in the document');
  // The container is fixed to a document corner, so it cannot live inside
  // whichever subtree happened to mount the provider.
  assert.ok(!host.contains(el));
  assert.ok(document.body.contains(el));
});

test('BapsToastProvider shows nothing until a message is pushed', async (t) => {
  t.after(teardown);
  await render();
  assert.equal(messages().length, 0);
});

test('useToast().show renders the summary and the detail', async (t) => {
  t.after(teardown);
  await render({}, (toast) =>
    toast.show({
      severity: 'success',
      summary: 'Saved',
      detail: 'Project updated.',
      sticky: true,
    }),
  );
  const message = container().querySelector('.p-toast-message');
  assert.ok(message);
  assert.equal(message.querySelector('.p-toast-summary').textContent, 'Saved');
  assert.equal(
    message.querySelector('.p-toast-detail').textContent,
    'Project updated.',
  );
});

test('useToast().show accepts an array and keeps every message', async (t) => {
  t.after(teardown);
  await render({}, (toast) =>
    toast.show([
      { summary: 'One', sticky: true },
      { summary: 'Two', sticky: true },
    ]),
  );
  assert.equal(messages().length, 2);
});

test('a toast is a live region, which is the only reason it is announced', async (t) => {
  t.after(teardown);
  await render({}, (toast) => toast.show({ summary: 'Saved', sticky: true }));
  const message = container().querySelector('.p-toast-message');
  // Without these the message appears and leaves having said nothing: it is
  // never focused, so nothing else would make a screen reader read it.
  assert.equal(message.getAttribute('role'), 'alert');
  assert.equal(message.getAttribute('aria-live'), 'assertive');
  assert.equal(message.getAttribute('aria-atomic'), 'true');
});

test('severity picks the icon and the severity class', async (t) => {
  t.after(teardown);
  await render({}, (toast) =>
    toast.show({ severity: 'error', summary: 'Failed', sticky: true }),
  );
  const message = container().querySelector('.p-toast-message');
  assert.match(message.className, /p-toast-message-error/);
  assert.match(
    message.querySelector('.p-toast-message-icon').className,
    /pi-times-circle/,
  );
});

test('a non-sticky toast removes itself when its life runs out', async (t) => {
  t.after(teardown);
  // Longer than the 40ms render flush, or the toast is already gone before
  // the first assertion gets to look for it.
  await render({}, (toast) => toast.show({ summary: 'Saved', life: 120 }));
  assert.equal(messages().length, 1);
  await new Promise((r) => setTimeout(r, 240));
  // The timer is the whole contract of a non-sticky toast: leave on its own.
  assert.equal(messages().length, 0);
});

test('a sticky toast stays past the same window', async (t) => {
  t.after(teardown);
  await render({}, (toast) =>
    toast.show({ summary: 'Saved', life: 120, sticky: true }),
  );
  await new Promise((r) => setTimeout(r, 240));
  assert.equal(messages().length, 1);
});

test('the close button is named and removes its own message', async (t) => {
  t.after(teardown);
  await render({}, (toast) =>
    toast.show([
      { summary: 'One', sticky: true },
      { summary: 'Two', sticky: true },
    ]),
  );
  const close = container().querySelector('.p-toast-icon-close');
  // An icon-only button with no accessible name is announced as nothing.
  assert.equal(close.getAttribute('aria-label'), 'Close');

  close.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await flush();
  const left = [...container().querySelectorAll('.p-toast-summary')].map(
    (node) => node.textContent,
  );
  assert.deepEqual(left, ['Two']);
});

test('closable: false withholds the close button', async (t) => {
  t.after(teardown);
  await render({}, (toast) =>
    toast.show({ summary: 'Saved', sticky: true, closable: false }),
  );
  assert.equal(container().querySelector('.p-toast-icon-close'), null);
});

test('clear() empties the queue', async (t) => {
  t.after(teardown);
  let handle;
  await render({}, (toast) => {
    handle = toast;
    toast.show([
      { summary: 'One', sticky: true },
      { summary: 'Two', sticky: true },
    ]);
  });
  handle.clear();
  await flush();
  assert.equal(messages().length, 0);
});

test('position places the container, and only that position', async (t) => {
  t.after(teardown);
  await render({ position: 'bottom-center' });
  const className = container().className;
  assert.match(className, /p-toast-bottom-center/);
  // Two position classes would have the stylesheet place the container twice,
  // and the loser depends on rule order rather than on the prop.
  assert.doesNotMatch(className, /p-toast-top-right/);
});

test('the Sampark brand scopes the container, not each message', async (t) => {
  t.after(teardown);
  await render({ brand: 'sampark' }, (toast) =>
    toast.show({ summary: 'Saved', sticky: true }),
  );
  // The scope class has to sit above the messages or a message pushed later
  // renders with the MyBKY tokens.
  assert.match(container().className, /baps-ds-sampark/);
});
