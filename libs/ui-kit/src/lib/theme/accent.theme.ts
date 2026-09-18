import { definePreset, palette } from '@primeuix/themes';
// Direct generated-file import, not the '@org/tokens' barrel — see the note at
// the top of baps.theme.ts for why the barrel emits "undefined" under AOT.
// eslint-disable-next-line @nx/enforce-module-boundaries
import * as t from '@org/tokens/generated/tokens';
import { MyBky, myBkyPrimaryDerivedComponents } from './baps.theme';

/**
 * Primary + Surface palette switching for the Storybook theme-settings panel —
 * the BAPS analog of PrimeNG's own configurator. `withAccent`/`withSurface`
 * merge the chosen ramp into the preset via definePreset, which is what
 * `updatePrimaryPalette`/`updateSurfacePalette` do under the hood — done as a
 * preset merge (not a live call) so it survives Storybook's per-story
 * re-bootstrap. The BAPS product accents keep their real token ramps; the rest
 * are generated from a single base hex with PrimeNG's `palette()` (same set the
 * PrimeNG configurator ships). This is a Storybook exploration control only —
 * product code still follows CLAUDE.md's four product accents.
 *
 * primary re-skins semantic-primary surfaces (focus rings, links, checkbox,
 * formField hover) AND, since Route A, the MyBKY button fill.
 *
 * That second half used to be the opposite. This note read "It does NOT change
 * the primary *button* fill — MyBKY buttons run off their own Button* tokens in
 * baps.theme.ts", which was accurate and was the bug: those tokens resolve to
 * literals at build time, so a MyBKY Button kept its blue gradient at
 * `accent:amber` while every surface around it moved. `withPrimaryRamp` below
 * now remaps the primary-derived `components.button` values from the selected
 * ramp. Danger, warn and secondary still run off their own tokens and are
 * meant to — they are severity and mono colours, not primary-derived.
 */
export interface Swatch {
  key: string;
  label: string;
  /** Display hex for the manager swatch dot (the ramp's ~600). */
  color: string;
}

// Match palette()'s return shape (optional 0–950 keys) so generated ramps and
// the hand-written token ramps share one type.
type Ramp = ReturnType<typeof palette>;

// BAPS product accents — real token ramps (libs/tokens color.accent.*).
const ACCENT_RAMPS: Record<string, Ramp> = {
  slate: {
    50: t.ColorAccentSlate50, 100: t.ColorAccentSlate100, 200: t.ColorAccentSlate200,
    300: t.ColorAccentSlate300, 400: t.ColorAccentSlate400, 500: t.ColorAccentSlate500,
    600: t.ColorAccentSlate600, 700: t.ColorAccentSlate700, 800: t.ColorAccentSlate800,
    900: t.ColorAccentSlate900, 950: t.ColorAccentSlate950,
  },
  clay: {
    50: t.ColorAccentClay50, 100: t.ColorAccentClay100, 200: t.ColorAccentClay200,
    300: t.ColorAccentClay300, 400: t.ColorAccentClay400, 500: t.ColorAccentClay500,
    600: t.ColorAccentClay600, 700: t.ColorAccentClay700, 800: t.ColorAccentClay800,
    900: t.ColorAccentClay900, 950: t.ColorAccentClay950,
  },
  indigo: {
    50: t.ColorAccentIndigo50, 100: t.ColorAccentIndigo100, 200: t.ColorAccentIndigo200,
    300: t.ColorAccentIndigo300, 400: t.ColorAccentIndigo400, 500: t.ColorAccentIndigo500,
    600: t.ColorAccentIndigo600, 700: t.ColorAccentIndigo700, 800: t.ColorAccentIndigo800,
    900: t.ColorAccentIndigo900, 950: t.ColorAccentIndigo950,
  },
  sage: {
    50: t.ColorAccentSage50, 100: t.ColorAccentSage100, 200: t.ColorAccentSage200,
    300: t.ColorAccentSage300, 400: t.ColorAccentSage400, 500: t.ColorAccentSage500,
    600: t.ColorAccentSage600, 700: t.ColorAccentSage700, 800: t.ColorAccentSage800,
    900: t.ColorAccentSage900, 950: t.ColorAccentSage950,
  },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// PrimeNG configurator's primary set — base = the color's 500. palette()
// expands each to a full 50–950 ramp.
const PRIMARY_HEX: Array<[string, string]> = [
  ['emerald', '#10b981'], ['green', '#22c55e'], ['lime', '#84cc16'],
  ['orange', '#f97316'], ['amber', '#f59e0b'], ['yellow', '#eab308'],
  ['teal', '#14b8a6'], ['cyan', '#06b6d4'], ['sky', '#0ea5e9'],
  ['blue', '#3b82f6'], ['violet', '#8b5cf6'], ['purple', '#a855f7'],
  ['fuchsia', '#d946ef'], ['pink', '#ec4899'], ['rose', '#f43f5e'],
];

/**
 * Every primary ramp the picker can select, keyed the same way `withAccent`
 * takes them. Exported because a consumer that re-themes has to write the SAME
 * ramp to the design system's own custom properties that `withAccent` hands to
 * PrimeNG — one ramp, two sinks. Deriving it a second time is not equivalent:
 * the four BAPS accents are hand-authored token ramps, so `palette(swatch.color)`
 * produces a *different* ramp for them and the two sides would silently drift.
 *
 * Data only. Reading it changes nothing.
 */
export const PRIMARY_RAMPS: Record<string, Ramp> = {
  ...ACCENT_RAMPS,
  ...Object.fromEntries(PRIMARY_HEX.map(([k, hex]) => [k, palette(hex)])),
};

/** Swatch list for the manager Primary picker. 'brand' = the preset default. */
export const PRIMARY_COLORS: Swatch[] = [
  { key: 'brand', label: 'Brand', color: t.ColorMybkyBlue600 },
  { key: 'slate', label: 'Slate teal', color: t.ColorAccentSlate600 },
  { key: 'clay', label: 'Clay', color: t.ColorAccentClay600 },
  { key: 'indigo', label: 'Indigo', color: t.ColorAccentIndigo600 },
  { key: 'sage', label: 'Sage', color: t.ColorAccentSage600 },
  ...PRIMARY_HEX.map(([k, hex]) => ({ key: k, label: cap(k), color: hex })),
];

// Surface neutrals — PrimeNG configurator's set (base = 500).
const SURFACE_HEX: Array<[string, string]> = [
  ['slate', '#64748b'], ['gray', '#6b7280'], ['zinc', '#71717a'],
  ['neutral', '#737373'], ['stone', '#78716c'],
];

const SURFACE_RAMPS: Record<string, Ramp> = Object.fromEntries(
  SURFACE_HEX.map(([k, hex]) => [k, palette(hex)])
);

/** Swatch list for the manager Surface picker. 'default' = the preset default. */
export const SURFACE_COLORS: Swatch[] = [
  { key: 'default', label: 'Default', color: t.ColorMybkyMono500 },
  ...SURFACE_HEX.map(([k, hex]) => ({ key: k, label: cap(k), color: hex })),
];

type Preset = ReturnType<typeof definePreset>;

/** Returns `preset` with the chosen primary ramp. 'brand'/unknown → unchanged. */
export function withAccent(preset: Preset, key: string): Preset {
  const ramp = PRIMARY_RAMPS[key];
  return ramp ? withPrimaryRamp(preset, ramp) : preset;
}

/**
 * Applies a primary ramp to BOTH sinks a preset owns: `semantic.primary`, and
 * the `components.*` entries whose values are primary-derived.
 *
 * Split out from `withAccent` because the accent picker has two entry points —
 * a swatch KEY, resolved through `PRIMARY_RAMPS` above, and a raw HEX from the
 * theme builder, which is not a key here and so is turned into a ramp by the
 * caller. Both have to reach the same two sinks; before this existed only the
 * key path did, and a hex chosen in the builder moved the surfaces while
 * leaving the primary button on its baked gradient.
 *
 * The components half is per-preset and opt-in: a preset states which of its
 * component values are primary-derived, and presets that state nothing are
 * merged with `semantic.primary` alone, exactly as before. Right now MyBKY is
 * the only one that does — see `myBkyPrimaryDerivedComponents`. Sampark's
 * button is maroon by brand rather than by accent, so it is deliberately not
 * remapped; its own sink-3 entries (toggleswitch, tabs) are a separate item.
 *
 * Identity comparison against the exported preset object, not a name or a
 * duck-typed probe: a caller that has already wrapped the preset gets the
 * plain semantic merge, which is the safe direction to fail in — a missed
 * remap looks like today's behaviour, a wrongly applied one would paint MyBKY
 * button values onto another brand.
 */
export function withPrimaryRamp(preset: Preset, ramp: Ramp): Preset {
  const withSemantic = definePreset(preset, { semantic: { primary: ramp } });
  if (preset !== MyBky) return withSemantic;
  const components = myBkyPrimaryDerivedComponents(ramp as Record<number | string, string | undefined>);
  return Object.keys(components).length ? definePreset(withSemantic, { components }) : withSemantic;
}

/** Returns `preset` with the chosen surface ramp. 'default'/unknown → unchanged. */
export function withSurface(preset: Preset, key: string): Preset {
  const ramp = SURFACE_RAMPS[key];
  return ramp
    ? definePreset(preset, {
        semantic: { colorScheme: { light: { surface: ramp }, dark: { surface: ramp } } },
      })
    : preset;
}
