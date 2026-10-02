/**
 * Build a 50–950 colour ramp from one hex colour. No dependencies.
 *
 * ## Why this exists when `palette()` already does it
 *
 * The design system's accent engine uses `palette()` from `@primeuix/themes`,
 * and the Angular side should keep doing so — it is already there, next to
 * `definePreset` and the rest of PrimeNG's theming.
 *
 * A React or Next consumer is in a different position. It has no PrimeNG at
 * all, and the only thing it needs from that package is this one function. An
 * app shell that themes itself should not install PrimeNG's theming library to
 * do arithmetic on six numbers.
 *
 * ## It is not an approximation
 *
 * The algorithm was recovered by measurement, not guessed, and it is exact.
 * Solving the mix ratio per step across six base colours gave 0.9494, 0.7605,
 * 0.5698, 0.3794, 0.1882 toward white and 0.1473, 0.3001, 0.4471, 0.5988,
 * 0.7470 toward black — close enough to clean percentages to be the intent
 * rather than the output of something more complicated.
 *
 * Tested against `palette()` on ten colours including the two that break naive
 * implementations, #000000 and #ffffff: **worst channel error 0**. Not "close
 * enough" — identical, on every channel of every step.
 *
 * `ramp.spec.ts` asserts that against the real `palette()` so this cannot
 * silently drift if PrimeNG ever changes its own.
 *
 * ## The two directions are not symmetric
 *
 * Lighter steps mix TOWARD WHITE: `v + t * (255 - v)`.
 * Darker steps scale toward black: `v * (1 - t)`.
 *
 * Those are different operations, and using one for both is the mistake that
 * produces a ramp which looks right in the light half and muddy in the dark.
 */

/** The eleven steps, keyed the way the design system keys them. */
export type Ramp = Record<number, string>;

/** Mix toward white. Measured: 95 / 76 / 57 / 38 / 19 per cent. */
const LIGHTER: ReadonlyArray<readonly [number, number]> = [
  [50, 0.95],
  [100, 0.76],
  [200, 0.57],
  [300, 0.38],
  [400, 0.19],
];

/** Scale toward black. Measured: 15 / 30 / 45 / 60 / 75 per cent. */
const DARKER: ReadonlyArray<readonly [number, number]> = [
  [600, 0.15],
  [700, 0.3],
  [800, 0.45],
  [900, 0.6],
  [950, 0.75],
];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#abc` and `#aabbcc` both in; anything else is a caller error, not a colour. */
const toRgb = (hex: string): [number, number, number] | null => {
  if (!HEX.test(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const toHex = (rgb: number[]): string =>
  '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/**
 * @param hex the 500 step — the colour the ramp is built around.
 * @returns the eleven steps, or `undefined` for anything that is not a hex
 *          colour. Undefined rather than a thrown error, because every caller
 *          here already has to handle "no accent set".
 */
export function buildRamp(hex: string): Ramp | undefined {
  const base = toRgb(hex);
  if (!base) return undefined;

  // The 500 step is the base colour NORMALISED, not the string that came in:
  // '#abc' and '#aabbcc' are the same colour and must produce the same ramp,
  // which they did not while this echoed the input. Caught by ramp.spec.ts.
  const ramp: Ramp = { 500: toHex(base) };
  for (const [step, t] of LIGHTER)
    ramp[step] = toHex(base.map((v) => v + t * (255 - v)));
  for (const [step, t] of DARKER)
    ramp[step] = toHex(base.map((v) => v * (1 - t)));
  return ramp;
}
