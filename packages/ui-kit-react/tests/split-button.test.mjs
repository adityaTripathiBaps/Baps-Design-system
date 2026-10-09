// The DOM has to exist before React's renderer is imported.
import './dom.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BapsSplitButton } from '../dist/index.js';
import { mount, cleanup } from './dom.mjs';

/**
 * Split Button is the third component that could not be tested before jsdom:
 * it has no portal of its own, but its menu is a BapsPopover, so the half of
 * it that matters renders into document.body rather than into the host.
 */

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
  root.render(createElement(BapsSplitButton, props));
  await flush();
  return { host, root };
}

const buttons = () => [...document.querySelectorAll('baps-split-button button')];
const primary = () => buttons()[0];
const dropdown = () => buttons()[1];

/** The popover renders outside the host, so look for the menu in the body. */
const menu = () => document.body.querySelector('[role="menu"]');

/**
 * The clickable row, not the `<baps-menu-item>` wrapping it. The handler sits
 * on the inner element that carries role="menuitem", so a click on the
 * wrapper never reaches it — which is also what a user's pointer does.
 */
const items = () => [...menu().querySelectorAll('[role="menuitem"]')];

const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

const MODEL = [
  { label: 'Duplicate', icon: 'pi pi-copy' },
  { label: 'Archive' },
];

test('BapsSplitButton renders exactly two buttons: the action and its dropdown', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL });
  // Two, not one with a caret: the primary action has to stay clickable
  // without opening the menu, which is the whole point of the pattern.
  assert.equal(buttons().length, 2);
  assert.match(dropdown().className, /p-splitbutton-dropdown/);
});

test('the primary button carries the label and calls onClick', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({ label: 'Save', model: MODEL, onClick: () => seen.push('click') });

  assert.equal(primary().querySelector('.p-button-label').textContent, 'Save');
  click(primary());
  assert.deepEqual(seen, ['click']);
});

test('clicking the primary button does not open the menu', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL });
  click(primary());
  await flush();
  // A primary action that also opens the menu is just a menu button.
  assert.equal(menu(), null);
});

test('the dropdown button opens the menu, and the menu portals out of the host', async (t) => {
  t.after(teardown);
  const { host } = await render({ label: 'Save', model: MODEL });
  assert.equal(menu(), null);

  click(dropdown());
  await flush();

  const open = menu();
  assert.ok(open, 'menu should be in the document');
  // Inside the host it would be clipped by the toolbar it usually sits in.
  assert.ok(!host.contains(open));
});

test('every model entry renders, in order', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL });
  click(dropdown());
  await flush();

  assert.match(menu().textContent, /Duplicate/);
  assert.match(menu().textContent, /Archive/);
  assert.ok(
    menu().textContent.indexOf('Duplicate') < menu().textContent.indexOf('Archive'),
  );
});

test('choosing an entry runs its command and closes the menu', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    label: 'Save',
    model: [{ label: 'Duplicate', command: () => seen.push('Duplicate') }],
  });

  click(dropdown());
  await flush();
  click(items()[0]);
  await flush();

  assert.deepEqual(seen, ['Duplicate']);
  // Leaving it open after a choice means the next click lands on a menu the
  // user thought was gone.
  assert.equal(menu(), null);
});

test('a disabled entry runs nothing and leaves the menu open', async (t) => {
  t.after(teardown);
  const seen = [];
  await render({
    label: 'Save',
    model: [{ label: 'Archive', disabled: true, command: () => seen.push('Archive') }],
  });

  click(dropdown());
  await flush();
  click(items()[0]);
  await flush();

  assert.deepEqual(seen, []);
  assert.ok(menu(), 'a dead entry should not dismiss the menu either');
});

test('disabled disables both buttons, natively', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, disabled: true });
  // The native attribute is what takes them out of the tab order; a class
  // alone leaves both reachable by keyboard.
  assert.equal(primary().disabled, true);
  assert.equal(dropdown().disabled, true);
});

test('the dropdown button is named and declares that it owns a popup', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL });
  // Icon-only, so aria-label is the only name it has.
  assert.equal(dropdown().getAttribute('aria-label'), 'More Options');
  assert.equal(dropdown().getAttribute('aria-haspopup'), 'true');
});

test('count renders the tally pill with its own accessible name', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, count: 3, countLabel: '3 pending' });
  const pill = primary().querySelector('.baps-splitbutton-count');
  assert.ok(pill);
  assert.equal(pill.textContent, '3');
  // Without the label the pill is announced as a bare "3" after the action.
  assert.equal(pill.getAttribute('aria-label'), '3 pending');
});

test('count 0 still renders, because zero is a real tally', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, count: 0 });
  // A falsy guard here would hide "0 pending" and show nothing instead.
  assert.equal(primary().querySelector('.baps-splitbutton-count').textContent, '0');
});

test('no count prop means no pill at all', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL });
  assert.equal(primary().querySelector('.baps-splitbutton-count'), null);
});

test('xlarge is a host class, because PrimeNG stops at large', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, size: 'xlarge' });
  const host = document.querySelector('baps-split-button');
  assert.match(host.className, /baps-splitbutton-xl/);
  // Handing 'xlarge' to the button classes would print p-button-xlarge,
  // which no stylesheet defines, and the button would render at default
  // height with no error.
  assert.doesNotMatch(primary().className, /p-button-xlarge/);
});

test('the sizes the button classes do support are forwarded', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, size: 'small' });
  assert.match(primary().className, /p-button-sm/);
  assert.match(dropdown().className, /p-button-sm/);
});

test('severity reaches both segments, so they cannot drift apart', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, severity: 'danger' });
  assert.match(primary().className, /p-button-danger/);
  assert.match(dropdown().className, /p-button-danger/);
});

test('the Sampark brand scopes the host, and reaches the menu too', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, brand: 'sampark' });
  const host = document.querySelector('baps-split-button');
  assert.match(host.className, /baps-ds-sampark/);

  click(dropdown());
  await flush();
  // The menu is portalled to the body, so it leaves the host's scope: the
  // brand has to be passed down to the popover or the menu renders in MyBKY
  // tokens while the button it belongs to is Sampark.
  const panel = [...document.body.children].find((node) =>
    node.className?.includes?.('baps-ds-sampark') && !node.contains(host),
  );
  assert.ok(panel, 'the portalled menu should carry the brand scope');
});

test('menuStyleClass lands on the menu panel', async (t) => {
  t.after(teardown);
  await render({ label: 'Save', model: MODEL, menuStyleClass: 'bkyms-split-menu' });
  click(dropdown());
  await flush();
  assert.match(document.body.innerHTML, /bkyms-split-menu/);
});
