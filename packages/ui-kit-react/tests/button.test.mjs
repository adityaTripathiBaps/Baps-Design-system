import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsButton } from '../dist/index.js';

test('BapsButton preserves native keyboard semantics and typed event/ref forwarding', () => {
  const onClick = () => undefined;
  const ref = { current: null };
  const element = BapsButton({ label: 'Save', onClick, ref });

  assert.equal(element.type, 'button');
  assert.equal(element.props.type, 'button');
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.disabled, false);
  assert.match(element.props.className, /\bbaps-button--primary\b/);
});

test('BapsButton loading state is disabled, busy and uses the shared icon', () => {
  const element = BapsButton({
    label: 'Saving',
    brand: 'sampark',
    size: 'xlarge',
    loading: true,
  });

  assert.equal(element.props.disabled, true);
  assert.equal(element.props['aria-busy'], true);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.match(element.props.className, /\bbaps-button--loading\b/);
  assert.match(element.props.className, /\bbaps-button--xl\b/);
});

test('BapsButton icon-only output keeps an accessible native button name', () => {
  const element = BapsButton({ icon: 'trash', 'aria-label': 'Delete' });

  assert.equal(element.props['aria-label'], 'Delete');
  assert.match(element.props.className, /\bbaps-button--icon-only\b/);
});

test('BapsButton composes outlined with a severity rather than replacing it', () => {
  const html = renderToStaticMarkup(
    createElement(BapsButton, {
      brand: 'sampark',
      severity: 'secondary',
      outlined: true,
      label: 'Secondary',
    }),
  );
  // Both classes. The CSS drops only the fill and keeps the severity's
  // border and ink, so replacing --secondary with --outlined would lose
  // the border colour entirely.
  assert.match(html, /baps-button--secondary/);
  assert.match(html, /baps-button--outlined/);
});

test('BapsButton leaves the fill alone when outlined is not asked for', () => {
  const html = renderToStaticMarkup(
    createElement(BapsButton, { severity: 'secondary', label: 'Secondary' }),
  );
  assert.doesNotMatch(html, /baps-button--outlined/);
});

test('BapsButton ignores outlined on ghost and link, which have no fill', () => {
  for (const variant of ['ghost', 'link']) {
    const html = renderToStaticMarkup(
      createElement(BapsButton, {
        brand: 'sampark',
        variant,
        outlined: true,
        label: 'X',
      }),
    );
    // Stacking --outlined on a variant that is already transparent would
    // add a class no stylesheet answers, and read as a third appearance.
    assert.doesNotMatch(html, /baps-button--outlined/);
  }
});
