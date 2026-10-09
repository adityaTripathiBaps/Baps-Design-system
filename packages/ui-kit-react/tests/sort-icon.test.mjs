import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsSortIcon } from '../dist/index.js';

test('BapsSortIcon draws both chevrons when sortable but unsorted', () => {
  const el = BapsSortIcon({});
  assert.equal(el.props.className, 'p-datatable-sort-icon');
  assert.equal(el.props['aria-hidden'], 'true');
  // Neutral has to say "sortable" without claiming a direction, so it is the
  // only state that renders two paths.
  assert.equal(el.props.children.length, 2);
});

test('BapsSortIcon draws one chevron per direction, and they differ', () => {
  const up = BapsSortIcon({ order: 1 });
  const down = BapsSortIcon({ order: -1 });
  assert.equal(up.props.children.length, 1);
  assert.equal(down.props.children.length, 1);
  assert.notEqual(up.props.children[0].props.d, down.props.children[0].props.d);
});

test('BapsSortIcon shows a multi-sort badge only from index 1', () => {
  assert.equal(BapsSortIcon({ order: 1, index: 0 }).type, 'svg');
  const withBadge = BapsSortIcon({ order: 1, index: 2 });
  const badge = withBadge.props.children[1];
  assert.equal(badge.props.className, 'p-datatable-sort-badge');
  assert.equal(badge.props.children, 2);
});
