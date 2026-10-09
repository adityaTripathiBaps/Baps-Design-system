// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsPopover } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

/**
 * show() positions the panel against the event's currentTarget, so the event
 * needs a real element behind it. A bare `new MouseEvent('click')` has none
 * and throws on getBoundingClientRect — which is the component doing the
 * right thing, not a bug.
 */
function clickFrom(el) {
  const event = new MouseEvent('click', { bubbles: true });
  Object.defineProperty(event, 'currentTarget', { value: el });
  Object.defineProperty(event, 'target', { value: el });
  return event;
}

/** A trigger the popover can measure. */
function trigger() {
  const button = document.createElement('button');
  document.body.appendChild(button);
  return button;
}

/** Let React commit, run effects, and let the portal attach. */
const flush = () => new Promise((r) => setTimeout(r, 40));

let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

async function render(props, children = 'Details') {
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(createElement(BapsPopover, props, children));
  await flush();
  return host;
}

test('BapsPopover stays out of the DOM until something shows it', async (t) => {
  t.after(teardown);
  await render({});
  // A popover has no visible prop: it opens through its imperative handle,
  // because the trigger owns the interaction rather than a parent's state.
  assert.equal(document.querySelector('.p-popover'), null);
});

test('BapsPopover opens through its ref and portals out of its host', async (t) => {
  t.after(teardown);
  const ref = createRef();
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(createElement(BapsPopover, { ref }, 'Details'));
  await flush();

  ref.current.show(clickFrom(trigger()));
  await flush();

  const el = document.querySelector('.p-popover');
  assert.ok(el, 'popover should be in the document once shown');
  assert.ok(!host.contains(el));
});

test('BapsPopover hides again through the same handle', async (t) => {
  t.after(teardown);
  const ref = createRef();
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(createElement(BapsPopover, { ref }, 'Details'));
  await flush();

  ref.current.show(clickFrom(trigger()));
  await flush();
  assert.ok(document.querySelector('.p-popover'));

  ref.current.hide();
  await flush();
  // Gone, not merely hidden — the same reason a closed dialog is absent.
  assert.equal(document.querySelector('.p-popover'), null);
});
