import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsIcon } from '../dist/index.js';

test('BapsIcon applies the shared size contract and decorative semantics', () => {
  const element = BapsIcon({ name: 'notification', size: 'md' });
  const glyph = element.props.children;

  assert.equal(element.type, 'baps-icon');
  assert.equal(element.props.style['--baps-icon-size'], '20px');
  assert.equal(glyph.props['aria-hidden'], true);
  assert.equal(glyph.props.role, undefined);
  assert.match(glyph.props.dangerouslySetInnerHTML.__html, /^<svg /);
});

test('BapsIcon labels content icons and forwards native host events/ref', () => {
  const onClick = () => undefined;
  const ref = { current: null };
  const element = BapsIcon({
    name: 'info-circle',
    label: 'Information',
    onClick,
    ref,
  });
  const glyph = element.props.children;

  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.ref, ref);
  assert.equal(glyph.props.role, 'img');
  assert.equal(glyph.props['aria-label'], 'Information');
  assert.equal(glyph.props['aria-hidden'], undefined);
});
