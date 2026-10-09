import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsIcon, BapsInputIcon } from '../dist/index.js';

test('BapsInputIcon is decorative and uses the shared icon component', () => {
  const element = BapsInputIcon({ icon: 'search-2' });
  const visual = element.props.children;

  assert.equal(element.type, 'baps-inputicon');
  assert.equal(element.props['aria-hidden'], true);
  assert.match(visual.props.className, /\bp-inputicon\b/);
  assert.equal(visual.props.children.type, BapsIcon);
});
