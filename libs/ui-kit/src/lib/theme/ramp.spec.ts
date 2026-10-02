import { palette } from '@primeuix/themes';
import { describe, expect, it } from 'vitest';

import { buildRamp } from './ramp';

/**
 * buildRamp exists so a non-Angular consumer does not have to install
 * PrimeNG's theming package to generate a ramp. That is only worth doing if
 * the two agree exactly — a ramp that is merely close means the same accent
 * renders one way in the Angular shell and another in the React one, and the
 * difference is invisible until somebody diffs a computed style.
 *
 * So this asserts equality, channel by channel, rather than "looks similar".
 */
describe('buildRamp', () => {
  // Brand colours, arbitrary colours, and the two that break naive
  // implementations: pure black has nothing to scale toward, pure white
  // nothing to mix toward.
  const COLOURS = [
    '#46e5d8',
    '#4f46e5',
    '#c96868', // Sampark maroon
    '#5f78b8', // MyBKY blue
    '#10b981',
    '#f43f5e',
    '#0ea5e9',
    '#8b5cf6',
    '#eab308',
    '#000000',
    '#ffffff',
  ];

  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  for (const hex of COLOURS) {
    it(`matches palette() exactly for ${hex}`, () => {
      const ours = buildRamp(hex);
      const theirs = palette(hex) as Record<number, string>;
      expect(ours).toBeDefined();
      for (const step of STEPS) {
        expect(ours![step].toLowerCase()).toBe(theirs[step].toLowerCase());
      }
    });
  }

  it('accepts three-digit hex', () => {
    expect(buildRamp('#abc')).toEqual(buildRamp('#aabbcc'));
  });

  it('returns undefined for anything that is not a hex colour', () => {
    // Every caller already handles "no accent set", so undefined is the useful
    // answer here — a throw would make the common case a try/catch.
    for (const bad of [
      '',
      'brand',
      'rebeccapurple',
      '#12',
      '#1234',
      'abcdef',
    ]) {
      expect(buildRamp(bad)).toBeUndefined();
    }
  });

  it('is case-insensitive on input and lower-case on output', () => {
    const upper = buildRamp('#46E5D8')!;
    const lower = buildRamp('#46e5d8')!;
    expect(upper).toEqual(lower);
    expect(upper[500]).toBe('#46e5d8');
  });
});
