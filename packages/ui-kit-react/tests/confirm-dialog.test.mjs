// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BapsConfirmDialog,
  BapsConfirmProvider,
  useConfirm,
} from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

const flush = () => new Promise((r) => setTimeout(r, 40));

let active = null;

function teardown() {
  active?.unmount();
  active = null;
  cleanup();
}

test('BapsConfirmDialog renders nothing while closed', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  root.render(
    createElement(BapsConfirmDialog, {
      visible: false,
      header: 'Delete Item',
      message: 'Are you sure?',
    }),
  );
  await flush();

  assert.equal(document.querySelector('dialog'), null);
});

test('BapsConfirmDialog renders dialog, icon, message and buttons when visible', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  let accepted = false;
  let rejected = false;

  root.render(
    createElement(BapsConfirmDialog, {
      visible: true,
      header: 'Confirm Title',
      message: 'Are you sure you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Proceed',
      rejectLabel: 'Cancel',
      baseZIndex: 1200,
      style: { maxWidth: '90vw' },
      onAccept: () => {
        accepted = true;
      },
      onReject: () => {
        rejected = true;
      },
    }),
  );
  await flush();

  const dialog = document.querySelector('dialog');
  assert.ok(dialog, 'dialog should be in the document');
  assert.ok(dialog.classList.contains('p-confirmdialog'));
  assert.equal(dialog.style.zIndex, '1200');
  assert.equal(dialog.style.maxWidth, '90vw');

  const msg = document.querySelector('.baps-confirm-dialog__message');
  assert.ok(msg, 'message element should exist');
  assert.equal(msg.textContent.trim(), 'Are you sure you want to proceed?');

  const icon = document.querySelector('.baps-confirm-dialog__icon');
  assert.ok(icon, 'icon should exist');
  assert.ok(icon.classList.contains('pi-exclamation-triangle'));

  const buttons = dialog.querySelectorAll('button');
  assert.equal(buttons.length, 2, 'should render two action buttons');

  // Click accept button
  const acceptBtn = Array.from(buttons).find((b) =>
    b.textContent.includes('Proceed'),
  );
  assert.ok(acceptBtn, 'accept button exists');
  acceptBtn.click();
  await flush();
  assert.equal(accepted, true, 'onAccept was triggered');
  assert.equal(rejected, false, 'onReject was not triggered');
});

test('BapsConfirmProvider and useConfirm resolves promise on user action', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  let resolveValue = null;

  function Consumer() {
    const confirm = useConfirm();
    return createElement(
      'button',
      {
        id: 'trigger',
        onClick: async () => {
          const res = await confirm.confirm({
            header: 'Hook Confirm',
            message: 'Proceed with action?',
          });
          resolveValue = res;
        },
      },
      'Open Confirm',
    );
  }

  root.render(
    createElement(BapsConfirmProvider, null, createElement(Consumer)),
  );
  await flush();

  const triggerBtn = document.getElementById('trigger');
  assert.ok(triggerBtn);
  triggerBtn.click();
  await flush();

  // Dialog should be open
  const dialog = document.querySelector('dialog');
  assert.ok(dialog, 'dialog should open after hook call');

  // Click reject button ("No")
  const buttons = dialog.querySelectorAll('button');
  const rejectBtn = Array.from(buttons).find((b) =>
    b.textContent.includes('No'),
  );
  assert.ok(rejectBtn, 'reject button exists');
  rejectBtn.click();
  await flush();

  assert.equal(
    resolveValue,
    false,
    'useConfirm should resolve with false on reject',
  );
});

test('BapsConfirmProvider invokes callbacks once and settles once', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  const seen = [];
  let resolveValue = null;

  function Consumer() {
    const confirm = useConfirm();
    return createElement(
      'button',
      {
        id: 'trigger',
        onClick: async () => {
          resolveValue = await confirm.confirm({
            header: 'Single settlement',
            accept: () => seen.push('accept'),
            reject: () => seen.push('reject'),
          });
        },
      },
      'Open Confirm',
    );
  }

  root.render(
    createElement(BapsConfirmProvider, null, createElement(Consumer)),
  );
  await flush();

  const trigger = document.getElementById('trigger');
  assert.ok(trigger, 'trigger button exists');
  trigger.click();
  await flush();

  const dialog = document.querySelector('dialog');
  assert.ok(dialog, 'dialog should open after hook call');
  const acceptBtn = Array.from(dialog.querySelectorAll('button')).find(
    (button) => button.textContent.includes('Yes'),
  );
  assert.ok(acceptBtn, 'accept button exists');
  acceptBtn.click();
  await flush();

  assert.equal(resolveValue, true);
  assert.deepEqual(seen, ['accept']);
});

test('BapsConfirmProvider resolves false and rejects on Escape', async (t) => {
  t.after(teardown);
  const host = mount();
  const root = createRoot(host);
  active = root;

  const seen = [];
  let resolveValue = null;

  function Consumer() {
    const confirm = useConfirm();
    return createElement(
      'button',
      {
        id: 'trigger',
        onClick: async () => {
          resolveValue = await confirm.confirm({
            header: 'Escape settlement',
            reject: () => seen.push('reject'),
          });
        },
      },
      'Open Confirm',
    );
  }

  root.render(
    createElement(BapsConfirmProvider, null, createElement(Consumer)),
  );
  await flush();

  const trigger = document.getElementById('trigger');
  assert.ok(trigger, 'trigger button exists');
  trigger.click();
  await flush();

  const dialog = document.querySelector('dialog');
  assert.ok(dialog, 'dialog should open after hook call');
  dialog.dispatchEvent(
    new window.Event('cancel', { bubbles: true, cancelable: true }),
  );
  await flush();

  assert.equal(resolveValue, false);
  assert.deepEqual(seen, ['reject']);
  assert.equal(document.querySelector('dialog'), null);
});
