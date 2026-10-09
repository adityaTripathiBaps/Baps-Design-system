import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsMenuItem } from '../dist/index.js';

test('BapsMenuItem always draws the selected bar, even unselected', () => {
  const html = renderToStaticMarkup(createElement(BapsMenuItem, { title: 'Export' }));
  // The bar is the selected indicator and is drawn in both states. Without it
  // the row's text shifts sideways the moment selection changes.
  assert.ok(html.includes('menu-item__bar'));
  assert.ok(html.includes('menu-item__title'));
  assert.ok(!html.includes('menu-item--selected'));
});

test('BapsMenuItem adds the two-line class only with a subtitle', () => {
  const one = renderToStaticMarkup(createElement(BapsMenuItem, { title: 'Export' }));
  const two = renderToStaticMarkup(
    createElement(BapsMenuItem, { title: 'Notifications', subtitle: '3 unread' }),
  );
  // subtitle is the one input that changes BOTH a class and the markup: the
  // class buys the height, the span carries the text, and either alone is a bug.
  assert.ok(!one.includes('menu-item--two-line'));
  assert.ok(two.includes('menu-item--two-line'));
  assert.ok(two.includes('menu-item__subtitle'));
});

test('BapsMenuItem hides its control and icon from a screen reader', () => {
  const html = renderToStaticMarkup(
    createElement(BapsMenuItem, { title: 'Notifications', control: 'checkbox', checked: true }),
  );
  // The row's accessible name is its title. A checkmark announced beside it
  // would say the same thing twice.
  assert.ok(html.includes('menu-item__control'));
  assert.ok(html.includes('is-checked'));
  assert.ok(html.includes('aria-hidden="true"'));
});

test('BapsMenuItem carries severity and disabled as separate classes', () => {
  const html = renderToStaticMarkup(
    createElement(BapsMenuItem, { title: 'Delete', severity: 'danger', disabled: true }),
  );
  assert.ok(html.includes('menu-item--danger'));
  assert.ok(html.includes('menu-item--disabled'));
});
