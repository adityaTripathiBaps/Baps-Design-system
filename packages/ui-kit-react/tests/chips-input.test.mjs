// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsChipsInput } from '../dist/index.js';
import { cleanup, dom, mount } from './dom.mjs';

const flush = () => new Promise((resolve) => setTimeout(resolve, 40));
let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

async function render(props = {}) {
  const host = mount();
  const root = createRoot(host);
  active = root;
  root.render(createElement(BapsChipsInput, props));
  await flush();
  return host;
}

function input() {
  return document.querySelector('baps-chips-input input');
}

function setInputValue(control, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    'value',
  )?.set;
  assert.ok(valueSetter, 'jsdom should expose the native input value setter');
  valueSetter.call(control, value);
  control.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

function keydown(control, key) {
  control.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', {
      key,
      code: key === 'Enter' ? 'Enter' : key,
      bubbles: true,
      cancelable: true,
    }),
  );
}

test('BapsChipsInput adds values with Enter and reports the array', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({ onChange: (value) => seen.push(value) });

  setInputValue(input(), 'Angular');
  await flush();
  keydown(input(), 'Enter');
  await flush();

  assert.deepEqual(seen, [['Angular']]);
  assert.equal(document.querySelector('.p-chip-label')?.textContent, 'Angular');
  assert.equal(input().value, '');
});

test('BapsChipsInput removes the last value with Backspace on empty input', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    value: ['Angular', 'React'],
    onChange: (value) => seen.push(value),
  });

  keydown(input(), 'Backspace');
  await flush();
  assert.deepEqual(seen, [['Angular']]);
});

test('BapsChipsInput renders accessible chip remove controls', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    value: ['Angular'],
    onChange: (value) => seen.push(value),
  });

  const remove = document.querySelector('baps-chip button');
  assert.equal(remove?.getAttribute('aria-label'), 'Remove Angular');
  remove.click();
  await flush();
  assert.deepEqual(seen, [[]]);
});

test('BapsChipsInput uses the approved separator and ignores duplicates', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    value: ['Angular'],
    separator: ',',
    onChange: (value) => seen.push(value),
  });

  setInputValue(input(), 'Angular');
  await flush();
  keydown(input(), ',');
  await flush();
  assert.deepEqual(seen, []);

  setInputValue(input(), 'React');
  await flush();
  keydown(input(), ',');
  await flush();
  assert.deepEqual(seen, [['Angular', 'React']]);
});

test('BapsChipsInput forwards brand, size, placeholder, and disabled state', async (t) => {
  t.after(teardown);
  const host = await render({
    brand: 'sampark',
    size: 'large',
    placeholder: 'Add a skill',
    disabled: true,
  });

  const element = host.querySelector('baps-chips-input');
  assert.match(element.className, /baps-sampark/);
  assert.match(element.className, /baps-chips-input-lg/);
  assert.equal(input().placeholder, 'Add a skill');
  assert.equal(input().getAttribute('aria-label'), 'Add a skill');
  assert.equal(
    host.querySelector('[role="group"]')?.getAttribute('aria-label'),
    'Add a skill values',
  );
  assert.equal(input().disabled, true);
});
