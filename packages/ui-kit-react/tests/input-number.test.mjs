// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsInputNumber } from '../dist/index.js';
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
  root.render(createElement(BapsInputNumber, props));
  await flush();
  return host;
}

const input = () => document.querySelector('baps-input-number input');
const buttons = () => [
  ...document.querySelectorAll('baps-input-number button'),
];

test('BapsInputNumber defaults to named, keyboard-reachable spinner buttons', async (t) => {
  t.after(teardown);
  await render({ defaultValue: 2 });

  assert.equal(buttons().length, 2);
  assert.deepEqual(
    buttons().map((button) => button.getAttribute('aria-label')),
    ['Increase value', 'Decrease value'],
  );
  assert.ok(buttons().every((button) => button.tabIndex === 0));
});

test('BapsInputNumber clamps button changes and reports the formatted value', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    defaultValue: 9.999,
    min: 1,
    max: 10,
    maxFractionDigits: 2,
    onInput: (detail) => seen.push(detail),
  });

  assert.equal(input().value, '10');
  assert.equal(buttons()[0].disabled, true);
  buttons()[1].click();
  await flush();

  assert.equal(input().value, '9');
  assert.equal(seen.at(-1).value, 9);
  assert.equal(seen.at(-1).formattedValue, '9');
});

test('BapsInputNumber toggles grouping and forwards classes and size', async (t) => {
  t.after(teardown);
  const host = await render({
    defaultValue: 12345,
    useGrouping: false,
    size: 'large',
    styleClass: 'number-root',
    inputStyleClass: 'number-input',
    brand: 'sampark',
  });

  assert.equal(input().value, '12345');
  assert.match(input().className, /p-inputtext-lg/);
  assert.match(input().className, /number-input/);
  assert.match(host.querySelector('.p-inputnumber').className, /number-root/);
  assert.match(
    host.querySelector('baps-input-number').className,
    /baps-sampark/,
  );
});

test('BapsInputNumber parses input, clamps it, and emits the numeric value', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    defaultValue: 5,
    min: 1,
    max: 10,
    onInput: (detail) => seen.push(detail.value),
  });

  const control = input();
  const valueSetter = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    'value',
  )?.set;
  assert.ok(valueSetter, 'jsdom should expose the native input value setter');
  valueSetter.call(control, '24');
  control.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await flush();

  assert.equal(control.value, '10');
  assert.deepEqual(seen, [10]);
});

test('BapsInputNumber disables the input and spinner buttons natively', async (t) => {
  t.after(teardown);
  await render({ defaultValue: 5, disabled: true });

  assert.equal(input().disabled, true);
  assert.ok(buttons().every((button) => button.disabled));
});
