import { definePreset, palette } from '@primeuix/themes';
// Direct generated-file import, not the '@org/tokens' barrel — see the note at
// the top of baps.theme.ts for why the barrel emits "undefined" under AOT.
// eslint-disable-next-line @nx/enforce-module-boundaries
import * as t from '@org/tokens/generated/tokens';
import { MyBky, myBkyPrimaryDerivedComponents } from './baps.theme';
import { Sampark, samparkPrimaryDerivedComponents } from './sampark.theme';


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
 * Standard CSS and design system named colors mapped to modern hex codes.
 * Ensures consistent resolution in SSR, Node (tests), and browser environments.
 */
export const NAMED_COLORS: Record<string, string> = {
  emerald: '#10b981',
  green: '#22c55e',
  lime: '#84cc16',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
  red: '#ef4444',
  black: '#000000',
  white: '#ffffff',
  gray: '#6b7280',
  grey: '#6b7280',
  navy: '#0f172a',
  maroon: '#c96868',
  brown: '#78350f',
  gold: '#eab308',
  silver: '#c0c0c0',
  coral: '#ff7f50',
  crimson: '#dc143c',
  indigo: '#4f46e5',
  slate: '#64748b',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
  charcoal: '#1d1c1b',
  aqua: '#06b6d4',
  magenta: '#d946ef',
  olive: '#84cc16',
};

const EXTENDED_RAMPS: Record<string, Ramp> = Object.fromEntries(
  Object.entries(NAMED_COLORS).map(([k, hex]) => [k, palette(hex)])
);

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
  ...EXTENDED_RAMPS,
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
 * merged with `semantic.primary` alone. MyBKY and Sampark both do — see
 * `myBkyPrimaryDerivedComponents` and `samparkPrimaryDerivedComponents`.
 * Sampark needs it for the same reason MyBKY did: the preset states its
 * button, checkbox, radio, tabs, slider and progressbar values as build-time
 * token literals (`#c96868`), so a `semantic.primary` merge alone left every
 * one of them maroon under a custom colour.
 *
 * Identity comparison against the exported preset object, not a name or a
 * duck-typed probe: a caller that has already wrapped the preset gets the
 * plain semantic merge, which is the safe direction to fail in — a missed
 * remap looks like today's behaviour, a wrongly applied one would paint one
 * brand's button values onto another.
 */
export function withPrimaryRamp(preset: Preset, ramp: Ramp): Preset {
  const withSemantic = definePreset(preset, { semantic: { primary: ramp } });
  const rampSteps = ramp as Record<number | string, string | undefined>;
  const components =
    preset === MyBky
      ? myBkyPrimaryDerivedComponents(rampSteps)
      : preset === Sampark
        ? samparkPrimaryDerivedComponents(rampSteps)
        : {};
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

/**
 * The design-system ramp each brand exposes, and where a `palette()` step goes.
 *
 * MyBKY shares `palette()`'s own 50–950 shape, so every step maps to itself and
 * the write is exact.
 *
 * Sampark declares 0/10/20/40/60/80/100 — a different scale. The pairs below
 * are the INVERSE of the preset's own primitive map (`sampark.theme.ts`, the
 * `samparkMaroon` block), which already declares where each Sampark step sits
 * on PrimeNG's 50–950 scale:
 *
 *   samparkMaroon.500 = Primary60   .600 = Primary60   .700 = Primary80
 *   samparkMaroon.800 = Primary100  .900 = Primary100  .950 = Primary100
 */
export const DS_RAMPS = {
  mybky: {
    prefix: '--color-mybky-blue-',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => [s, s] as const),
  },
  sampark: {
    prefix: '--color-sampark-primary-',
    steps: [
      [0, 50],
      [10, 100],
      [20, 200],
      [40, 400],
      [60, 600],
      [80, 700],
      [100, 800],
    ] as const,
  },
} as const;

/**
 * Resolves any color input (hex, swatch name, standard CSS name, or browser-computed CSS color)
 * to a canonical #rrggbb hex string.
 */
export function resolveColorHex(color: string): string | undefined {
  if (!color) return undefined;
  const key = color.toLowerCase().trim();
  if (key === 'brand') return undefined;

  // 1. Direct hex match
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(key)) {
    return key;
  }

  // 2. Named colors dictionary (fast lookup, works in Node / Vitest / SSR)
  if (NAMED_COLORS[key]) {
    return NAMED_COLORS[key];
  }

  // 3. Browser runtime: dynamically resolve any valid CSS color name (tomato, rebeccapurple, etc.)
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = key;
        const resolved = ctx.fillStyle;
        if (resolved.startsWith('#') && (resolved !== '#000000' || key === 'black')) {
          return resolved;
        }
      }
    } catch {
      // ignore
    }
  }

  return undefined;
}

/**
 * Returns the 50–950 color ramp for the given accent.
 *
 * One value carries both forms: a swatch key ('brand', 'rose', 'red', 'black', ...) or a raw
 * '#rrggbb' hex code, or standard CSS color name.
 *
 * 'brand' returns undefined here on purpose — it is the preset's own primary,
 * so there is nothing to override.
 */
export function rampFor(accent: string): Ramp | undefined {
  if (!accent) return undefined;
  const key = accent.toLowerCase().trim();
  if (key === 'brand') return undefined;

  // 1. Check pre-computed ramps (includes ACCENT_RAMPS, PRIMARY_HEX, and standard named colors)
  if (PRIMARY_RAMPS[key]) {
    return PRIMARY_RAMPS[key];
  }

  // 2. Resolve to hex and generate via palette()
  const hex = resolveColorHex(key);
  if (hex) {
    return palette(hex) as Ramp;
  }

  return undefined;
}

/** Exactly what the last call wrote, so the next one can undo precisely that. */
let writtenProps: string[] = [];

/**
 * Writes the primary ramp's CSS custom properties to the design system's
 * token tier on the DOM root (or a target element).
 *
 * Sink 2 of the "one ramp, two sinks" architecture.
 */
export function applyThemeToDesignSystem(
  ds: 'mybky' | 'sampark',
  accentOrRamp: string | Ramp,
  targetElement?: HTMLElement
): void {
  if (typeof document === 'undefined') return;
  const root = targetElement ?? document.documentElement;

  // Undo previous writes
  for (const prop of writtenProps) root.style.removeProperty(prop);
  writtenProps = [];

  if (accentOrRamp === 'brand') return;

  const ramp = (typeof accentOrRamp === 'string' ? rampFor(accentOrRamp) : accentOrRamp) as
    | Record<number, string>
    | undefined;
  if (!ramp) return;

  const config = DS_RAMPS[ds];
  if (!config) return;

  for (const [dsStep, paletteStep] of config.steps) {
    const value = ramp[paletteStep];
    if (!value) continue;
    const prop = `${config.prefix}${dsStep}`;
    root.style.setProperty(prop, value);
    writtenProps.push(prop);
  }


  if (ds === 'sampark' && ramp[800]) {
    const alpha10Prop = '--color-sampark-primary-alpha10';
    root.style.setProperty(alpha10Prop, `rgb(from ${ramp[800]} r g b / 0.1)`);
    writtenProps.push(alpha10Prop);
  }

}

/**
 * The chrome ramp steps a nav colour drives, and how far each is lifted toward
 * white. The two ratios are measured off the Sampark defaults, not guessed:
 * #1d1c1b mixed 93% with white gives #2c2c2a (secondary/80) and 80% gives
 * #4a4947 (secondary/60) — exactly what the token file declares.
 */
const NAV_STEPS = [
  ['--color-sampark-secondary-100', 100],
  ['--color-sampark-secondary-80', 93],
  ['--color-sampark-secondary-60', 80],
] as const;

/**
 * Sink 3 — the navigation / chrome colour, independent of the primary ramp.
 *
 * The top navbar (`baps-navbar`) and the left rail (`baps-internal-navbar`) are
 * styled from the SECONDARY tier, not from primary: a brand can recolour its
 * actions without recolouring its chrome, and the reverse. That is why moving
 * the accent picker alone never moved the navbar, and why this is a separate
 * entry point rather than more work inside `applyThemeToDesignSystem`.
 *
 * Only the three base steps are written. `--navbar-bg`, `--navbar-border` and
 * the `--baps-inav-*` set are declared ON the components themselves as
 * `var(--color-sampark-secondary-NN)` / `var(--color-sampark-primary-*)`, so
 * they re-resolve on their own — a `:root` write of those names would be
 * outranked by the component's own declaration and do nothing at all.
 *
 * Passing nothing / `''` / `'brand'` removes the overrides and hands the chrome
 * back to the token file, rather than re-writing Sampark's charcoal as a
 * literal: the reset has to stay brand-agnostic.
 */
export function applyNavTheme(color?: string, targetElement?: HTMLElement): void {
  if (typeof document === 'undefined') return;
  const root = targetElement ?? document.documentElement;

  for (const [prop] of NAV_STEPS) root.style.removeProperty(prop);
  if (!color || color === 'brand') return;

  const key = color.toLowerCase().trim();
  let hex: string | undefined;

  if (key.startsWith('#')) {
    hex = key;
  } else if (key === 'black') {
    hex = '#000000';
  } else if (key === 'white') {
    hex = '#ffffff';
  } else {
    const ramp = rampFor(key);
    if (ramp) {
      hex = (ramp[950] ?? ramp[900] ?? ramp[800])!;
    } else {
      hex = resolveColorHex(key);
    }
  }

  if (!hex) return;

  for (const [prop, pct] of NAV_STEPS) {
    root.style.setProperty(prop, pct === 100 ? hex : `color-mix(in srgb, ${hex} ${pct}%, white)`);
  }
}
