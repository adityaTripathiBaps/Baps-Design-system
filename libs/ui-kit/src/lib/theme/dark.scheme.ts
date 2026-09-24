/**
 * The dark half of both presets, in one place.
 *
 * Why this file exists
 * --------------------
 * MyBKY and Sampark both extend PrimeNG's Material preset and both declared
 * `semantic.colorScheme.light` only. Everything dark therefore fell through to
 * Material's stock scheme, which is built on **zinc** — `content.background`
 * #18181b, card #27272a, borders #3f3f46 — while every hand-rolled component in
 * this library (chip, popover, skeleton, checkbox, radio, …) reads the brand's
 * own dark tokens (`--color-mybky-dark-surface-*`, `--color-sampark-dark-*`).
 * Dark mode was running two palettes at once: PrimeNG grey next to brand grey,
 * a few points apart, which reads as a rendering fault rather than a design.
 *
 * The fix is one lever. Material's dark scheme expresses almost everything as a
 * reference into `{surface.*}` — content, overlays, form fields, lists,
 * navigation. Replace that ramp with the brand's own mono ramp and the whole
 * dark surface system moves together, without restating a single component.
 *
 * Everything here is scoped to `colorScheme.dark`, so the light baselines in
 * apps/storybook-host/visual do not move.
 *
 * What is deliberately NOT here
 * -----------------------------
 * - `disabledOpacity` (0.38, from Material). Disabled field text measures
 *   1.79:1 in dark and 1.70:1 in light, so it is a LIGHT-mode problem too and
 *   the token is not scheme-scoped — raising it would move every light
 *   baseline. Left for the light pass.
 * - `content.borderColor` stays on `{surface.700}` (1.70:1). That is the
 *   brand's own "border/divider" step, documented in tokens as decorative at
 *   1.68:1; WCAG 1.4.11 applies to control boundaries, not gridlines. Control
 *   boundaries use `{surface.500}` below, the brand's "border/control" step.
 */

/** A 0–950 surface ramp, the shape PrimeNG's `semantic.surface` expects. */
export type SurfaceRamp = Record<number, string>;

/**
 * Dark elevation shadows with top-edge inset highlight for visible depth
 * on near-black surfaces without needing thick borders.
 */
export const darkElevation = {
  sm: '0 1px 2px 0 rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)',
  md: '0 8px 16px -4px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.07)',
  lg: '0 24px 48px -12px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.08)',
};

/**
 * The dark scheme both presets share, given the brand's dark-capable ramp.
 *
 * The ramp's dark end has to line up with the brand's dark tokens, because
 * Material reads specific steps for specific jobs:
 *
 *   950  form field background      900  page / content background
 *   800  card, filled field, hover  700  disabled field, dividers
 *   600  (unused here)              500  control boundaries
 *   400  muted text, hover borders    0  body text
 */
export function darkColorScheme(surface: SurfaceRamp) {
  return {
    surface,

    // Material puts body text on {surface.0}, i.e. pure #ffffff. Every brand
    // token for dark text is one step down (#f8fafb / #f8f7f7), and the
    // hand-rolled components already use it, so pure white was the one place
    // PrimeNG text and library text visibly disagreed.
    text: { color: '{surface.50}', hoverColor: '{surface.50}' },

    formField: {
      color: '{surface.50}',
      // Material reaches for {surface.600} here, which is a divider-weight grey
      // and misses the 3:1 WCAG 1.4.11 asks of a control boundary. {surface.500}
      // is the brand's "border/control" step, sized for exactly this.
      borderColor: '{surface.500}',
      hoverBorderColor: '{surface.400}',
      shadow: darkElevation.sm,
    },

    // Material's dark overlay sits on {surface.900} — the same colour as the
    // page behind it — so a panel is separated by its shadow alone, and a black
    // shadow on a near-black page separates nothing. One step up to the card
    // surface gives the elevation back without touching the 140 shadow tokens.
    overlay: {
      select: { background: '{surface.800}', borderColor: '{surface.700}', shadow: darkElevation.md },
      popover: { background: '{surface.800}', borderColor: '{surface.700}', shadow: darkElevation.md },
      modal: { background: '{surface.800}', borderColor: '{surface.700}', shadow: darkElevation.lg },
      navigation: { shadow: darkElevation.md },
    },

    // Both used to be {surface.800}, which the overlays now occupy; a focused
    // option would have been invisible inside a panel.
    list: { option: { focusBackground: '{surface.700}' } },
    navigation: { item: { focusBackground: '{surface.700}' } },

    // Material's 84% transparent leaves a selected row 1.35:1 against the
    // panel — you cannot see which row is selected. 60% roughly doubles that
    // (2.34:1 MyBKY, 2.07:1 Sampark) while the block still reads as a tint.
    //
    // It does NOT reach 3:1, and no tint can: clearing 3:1 on a near-black
    // ground takes roughly a 45% accent wash, which turns selection into a
    // solid colour block. The 3:1 cue is carried instead by the 3px accent bar
    // in styles/components/selection/_selection-dark.scss, which also survives
    // greyscale and colour-blind viewing in a way a hue shift does not.
    highlight: {
      background: 'color-mix(in srgb, {primary.400}, transparent 60%)',
      focusBackground: 'color-mix(in srgb, {primary.400}, transparent 48%)',
    },
  };
}

/** One severity's pair: the core brand hue, and the light step text sits on. */
export interface SeverityPair {
  /** The brand's core hue for this severity — the tint and border derive from it. */
  core: string;
  /** The light step used for text. On a 16% tint of `core` it must clear 4.5:1. */
  tint: string;
}

/**
 * `p-message` severities for dark, from brand hues instead of Material's.
 *
 * Two problems in one fix. Material dark paints a message with its OWN palette
 * (#2196F3 info, #F44336 error) next to brand-coloured alerts and badges, and
 * it puts the text on the same 500 step it used for the 16% tint behind it:
 * info measures 4.43:1 and error 3.98:1 against that tint, both short of 4.5.
 * Taking the text one step lighter — the brand's own "tint"/40 step — clears
 * it while the block keeps the brand's hue.
 *
 * Only `message` is covered: `inlinemessage` is not used anywhere in this
 * library, and `toast` paints its severities from its own component CSS.
 */
export function darkMessageSeverities(sev: Record<'info' | 'success' | 'warn' | 'error', SeverityPair>) {
  const one = ({ core, tint }: SeverityPair) => ({
    background: `color-mix(in srgb, ${core}, transparent 84%)`,
    borderColor: `color-mix(in srgb, ${core}, transparent 64%)`,
    color: tint,
    outlined: { color: tint, borderColor: tint },
    simple: { color: tint },
    closeButton: { focusRing: { color: tint } },
  });
  return {
    message: {
      colorScheme: {
        dark: {
          info: one(sev.info),
          success: one(sev.success),
          warn: one(sev.warn),
          error: one(sev.error),
        },
      },
    },
  };
}

/** Shared component tokens across brands that have no custom brand styling. */
export const darkSharedComponents = {
  tooltip: {
    colorScheme: {
      dark: {
        root: {
          background: '{surface.700}',
          color: '{surface.50}',
        },
      },
    },
  },
  skeleton: {
    colorScheme: {
      dark: {
        root: {
          background: '{surface.700}',
        },
      },
    },
  },
  togglebutton: {
    colorScheme: {
      dark: {
        root: {
          borderColor: '{surface.500}',
          hoverBorderColor: '{surface.400}',
        },
      },
    },
  },
  // Both presets pin the progressbar TRACK to a light mono step outside any
  // colorScheme (MyBKY mono.300 #e4ecf1, Sampark mono.20 #f3f2f2), so a dark
  // page drew a near-white bar with the fill barely readable on it — measured
  // at 0.83 luminance against a 0.01 page. The track is the unfilled half, so
  // it belongs one step off the surface, not at the top of the ramp.
  //
  // `value.background` is left alone: the brand accent still clears 3:1 as a
  // graphic against the dark ground, and changing it would move the meaning of
  // the fill rather than fix a defect.
  progressbar: {
    colorScheme: {
      dark: {
        root: { background: '{surface.700}' },
      },
    },
  },
};

/**
 * Component-level dark fixes that no semantic token reaches.
 *
 * Material drops the table header's tint in dark and separates the header with
 * its bottom border instead — the same border that sits at 1.70:1, so a dark
 * table reads as one undivided block of text.
 */
export const darkComponents = {
  ...darkSharedComponents,
  datatable: {
    colorScheme: {
      dark: {
        headerCell: { background: '{surface.800}' },
        row: { stripedBackground: '{surface.800}' },
        // Material draws gridlines with {surface.800}, which is now the header
        // and striped fill — the lines vanished into the rows they divide.
        // {surface.700} is the brand's divider step.
        bodyCell: { borderColor: '{surface.700}' },
      },
    },
  },
  treetable: {
    colorScheme: {
      dark: {
        headerCell: { background: '{surface.800}' },
      },
    },
  },
};
