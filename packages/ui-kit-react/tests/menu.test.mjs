// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsMenu } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

function clickFrom(el) {
  const event = new MouseEvent('click', { bubbles: true });
  Object.defineProperty(event, 'currentTarget', { value: el });
  Object.defineProperty(event, 'target', { value: el });
  return event;
}

function trigger() {
  const button = document.createElement('button');
  document.body.appendChild(button);
  return button;
}

const flush = () => new Promise((r) => setTimeout(r, 40));

let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

test('BapsMenu renders inline when popup is false', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  let clicked = false;
  const items = [
    { label: 'Edit', icon: 'pi pi-pencil', command: () => { clicked = true; } },
    { label: 'Hidden', visible: false },
    { label: 'Disabled item', disabled: true },
    {
      label: 'Group',
      items: [{ label: 'Sub-1' }],
    },
  ];

  root.render(createElement(BapsMenu, { model: items, popup: false }));
  await flush();

  const menuEl = host.querySelector('.p-menu');
  assert.ok(menuEl, 'p-menu should exist in inline container');

  const links = host.querySelectorAll('.p-menu-item-link');
  assert.ok(links.length >= 2, 'items should render links');

  // Verify visible: false item is not rendered
  assert.equal(host.querySelector('.p-menu-item-label:contains("Hidden")'), null);

  // Verify disabled item
  const disabledItem = host.querySelector('.p-menu-item.p-disabled');
  assert.ok(disabledItem, 'disabled item has p-disabled class');

  // Verify click command
  const editLink = Array.from(links).find((el) => el.textContent.includes('Edit'));
  assert.ok(editLink);
  editLink.click();
  assert.equal(clicked, true, 'command should fire on click');
});

test('BapsMenu stays out of DOM when popup is true until triggered', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  const items = [{ label: 'Action 1' }];
  root.render(createElement(BapsMenu, { model: items, popup: true }));
  await flush();

  assert.equal(document.querySelector('.p-menu'), null);
});

test('BapsMenu popup opens and closes through the approved toggle ref', async (t) => {
  t.after(teardown);
  const ref = createRef();
  const host = mount();
  const root = createRoot(host);
  active = root;

  const items = [{ label: 'Action 1' }];
  root.render(createElement(BapsMenu, { ref, model: items, popup: true }));
  await flush();

  const trig = trigger();
  ref.current.toggle(clickFrom(trig));
  await flush();

  const menuEl = document.querySelector('.p-menu.p-menu-overlay');
  assert.ok(menuEl, 'overlay menu should be in document');

  ref.current.toggle(clickFrom(trig));
  await flush();

  assert.equal(document.querySelector('.p-menu'), null);
});
