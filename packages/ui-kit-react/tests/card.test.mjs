import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsCard } from '../dist/index.js';

test('BapsCard renders shared slots, variants and native host attributes', () => {
  const ref = { current: null };
  const element = BapsCard({
    title: 'Registrations',
    subtitle: 'This week',
    actions: 'Export',
    footer: 'Updated today',
    children: '24 registrations',
    padding: 'compact',
    divided: true,
    raised: true,
    brand: 'sampark',
    ref,
  });
  const [header, body, footer] = element.props.children;

  assert.equal(element.type, 'baps-card');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-card-compact\b/);
  assert.match(element.props.className, /\bbaps-card-divided\b/);
  assert.match(element.props.className, /\bbaps-card-raised\b/);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(header.props.children[0].props['card-title'], '');
  assert.equal(header.props.children[1].props['card-subtitle'], '');
  assert.equal(body.props.children, '24 registrations');
  assert.equal(footer.props.children.props['card-footer'], '');
});

test('BapsCard interactive mode activates with Enter and Space', () => {
  let clicks = 0;
  let prevented = 0;
  const element = BapsCard({
    interactive: true,
    onClick: () => {
      clicks += 1;
    },
    children: 'Open member',
  });

  assert.equal(element.props.role, 'button');
  assert.equal(element.props.tabIndex, 0);
  assert.match(element.props.className, /\bbaps-card-interactive\b/);

  const currentTarget = {
    click: () => element.props.onClick(),
  };
  for (const key of ['Enter', ' ']) {
    element.props.onKeyDown({
      key,
      currentTarget,
      defaultPrevented: false,
      preventDefault: () => {
        prevented += 1;
      },
    });
  }
  assert.equal(clicks, 2);
  assert.equal(prevented, 2);
});
