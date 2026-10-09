import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BapsUsersDropdown,
  getNextUsersDropdownValues,
} from '../dist/index.js';

test('BapsUsersDropdown toggles checkbox values and renders a named combobox', () => {
  assert.deepEqual(getNextUsersDropdownValues(['asha'], 'ravi'), [
    'asha',
    'ravi',
  ]);
  assert.deepEqual(getNextUsersDropdownValues(['asha'], 'asha'), []);
  const html = renderToStaticMarkup(
    createElement(BapsUsersDropdown, {
      ariaLabel: 'Member',
      users: [{ value: 'asha', title: 'Asha Patel', avatarLabel: 'AP' }],
      defaultValue: 'asha',
    }),
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="Member"/);
  assert.match(html, />Asha Patel</);
});
