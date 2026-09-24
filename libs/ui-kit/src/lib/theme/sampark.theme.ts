import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';
// Imported directly from the generated file (not the '@org/tokens' barrel) for the
// same AOT re-export elision issue documented in baps.theme.ts.
// eslint-disable-next-line @nx/enforce-module-boundaries
import * as tokens from '@org/tokens/generated/tokens';

/**
 * Sampark button token block. Values are the Style Dictionary
 * `button.sampark.*` tokens extracted from the Sampark Portal Figma
 * (node 13197:91897) via libs/migration-data's button.mapping.mdx.
 *
 * Used in two places:
 * - `components.button` of the `Sampark` preset below (whole-preview re-skin,
 *   selected via the Storybook "Design system" toolbar)
 * - the scoped `dt` input on `baps-button` when `brand="sampark"` is set on a
 *   single instance while the global preset stays MyBKY (button.component.ts)
 */
export const SAMPARK_BUTTON_TOKENS = {
  root: {
    borderRadius: tokens.ButtonSamparkRadius,
    gap: tokens.ButtonSamparkGap,
    label: { fontWeight: tokens.ButtonSamparkFontWeight },
    // spm-ui's dedicated icon-only scale is square — width equals the
    // explicit height per step (28/32/36/40, button.mapping.mdx). PrimeNG's
    // token surface stops at lg; the xl step is a host-class CSS rule in
    // button.component.ts.
    iconOnlyWidth: tokens.ButtonSamparkHeightDefault,
    sm: { iconOnlyWidth: tokens.ButtonSamparkHeightSm },
    lg: { iconOnlyWidth: tokens.ButtonSamparkHeightLg },
  },
  colorScheme: {
    light: {
      root: {
        primary: {
          background: '{primary.color}',
          hoverBackground: '{primary.hover.color}',
          activeBackground: '{primary.active.color}',
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
          activeBorderColor: 'transparent',
          color: tokens.ButtonSamparkPrimaryText,
          hoverColor: tokens.ButtonSamparkPrimaryText,
          activeColor: tokens.ButtonSamparkPrimaryText,
        },
        secondary: {
          background: tokens.ButtonSamparkSecondaryDefault,
          hoverBackground: tokens.ButtonSamparkSecondaryHover,
          activeBackground: tokens.ButtonSamparkSecondaryHover,
          borderColor: tokens.ButtonSamparkSecondaryBorder,
          hoverBorderColor: tokens.ButtonSamparkSecondaryBorder,
          activeBorderColor: tokens.ButtonSamparkSecondaryBorder,
          color: tokens.ButtonSamparkSecondaryText,
          hoverColor: tokens.ButtonSamparkSecondaryText,
          activeColor: tokens.ButtonSamparkSecondaryText,
        },
      },
      outlined: {
        secondary: {
          hoverBackground: tokens.ButtonSamparkSecondaryHover,
          activeBackground: tokens.ButtonSamparkSecondaryHover,
          borderColor: tokens.ButtonSamparkSecondaryBorder,
          color: tokens.ButtonSamparkSecondaryText,
        },
      },
      text: {
        primary: {
          hoverBackground: '{primary.50}',
          activeBackground: '{primary.100}',
          color: '{primary.color}',
        },
        // Secondary Ghost — Figma node 13197:91897 rows "Button=⚫️ Secondary
        // Ghost". Eight of the frame's 44 cells had no Sampark path at all:
        // there was no text.secondary block here and no
        // button.sampark.secondaryGhost.* tokens, so
        // `severity="secondary" [text]="true"` fell through to PrimeNG's stock
        // text-secondary colours. MyBKY has carried the equivalent all along.
        secondary: {
          hoverBackground: tokens.ButtonSamparkSecondaryGhostHover,
          activeBackground: tokens.ButtonSamparkSecondaryGhostHover,
          color: tokens.ButtonSamparkSecondaryGhostText,
        },
      },
      link: {
        color: '{primary.color}',
        hoverColor: '{primary.hover.color}',
        activeColor: '{primary.active.color}',
      },
    },
    // Dark mode. Primary is RESTATED with the same clay tokens as light — left to
    // merge, PrimeNG's Material dark scheme washes it out to a pale tint; pinning
    // it keeps the solid clay fill identical to light. Secondary + ghost are the
    // neutral variants that break on dark; they borrow the mybky mono darks (same
    // set as _input.scss dark) since Sampark has no dark palette yet.
    dark: {
      root: {
        primary: {
          background: '{primary.color}',
          hoverBackground: '{primary.hover.color}',
          activeBackground: '{primary.active.color}',
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
          activeBorderColor: 'transparent',
          color: tokens.ButtonSamparkPrimaryText,
          hoverColor: tokens.ButtonSamparkPrimaryText,
          activeColor: tokens.ButtonSamparkPrimaryText,
        },
        secondary: {
          background: tokens.ColorMybkyMono800,
          hoverBackground: tokens.ColorMybkyMono700,
          activeBackground: tokens.ColorMybkyMono700,
          borderColor: tokens.ColorMybkyMono700,
          hoverBorderColor: tokens.ColorMybkyMono600,
          activeBorderColor: tokens.ColorMybkyMono600,
          color: tokens.ColorMybkyMono50,
          hoverColor: tokens.ColorMybkyMono50,
          activeColor: tokens.ColorMybkyMono50,
        },
      },
      outlined: {
        secondary: {
          hoverBackground: tokens.ColorMybkyMono800,
          borderColor: tokens.ColorMybkyMono600,
          color: tokens.ColorMybkyMono50,
        },
      },
      text: {
        primary: {
          hoverBackground: 'rgba(255, 255, 255, 0.08)',
          activeBackground: 'rgba(255, 255, 255, 0.12)',
          color: '{primary.color}',
        },
      },
      link: {
        color: '{primary.color}',
        hoverColor: '{primary.hover.color}',
        activeColor: '{primary.active.color}',
      },
    },
  },
};

/**
 * Sampark avatar token block — squares (vs MyBKY's full circle) on the
 * 24–80px scale, maroon-tinted primary.0 fill with mono.80 initials, per
 * spm-ui's _avatar.scss / variables.css --avatar-* set (Sampark Portal
 * Figma node 13197:90187). PrimeNG's avatar token surface stops at
 * width/height/fontSize/radius/colors — the type variants (secondary,
 * warning), 1px/1.5px borders with hover, per-size radius (xl 6px,
 * 2xl 8px), icon/image slot sizes, status dot and icon badge are CSS
 * rules in avatar.component.ts driven by the --avatar-sampark-* variables.
 *
 * Used in `components.avatar` below and as the scoped `dt` on `baps-avatar`
 * when `brand="sampark"` is set per-instance (avatar.component.ts).
 */
export const SAMPARK_AVATAR_TOKENS = {
  root: {
    width: tokens.AvatarSamparkSizeM,
    height: tokens.AvatarSamparkSizeM,
    fontSize: tokens.AvatarSamparkFontSizeM,
    borderRadius: tokens.AvatarSamparkRadius,
    background: tokens.AvatarSamparkBackground,
    color: tokens.AvatarSamparkText,
  },
  lg: { width: tokens.AvatarSamparkSizeL, height: tokens.AvatarSamparkSizeL, fontSize: tokens.AvatarSamparkFontSizeL },
  xl: { width: tokens.AvatarSamparkSizeXl, height: tokens.AvatarSamparkSizeXl, fontSize: tokens.AvatarSamparkFontSizeXl },
};

/**
 * Sampark (spm-ui) live preset — PrimeNG v21 preset generated from the same
 * Style Dictionary token output as the MyBKY `MyBky` preset, but from the
 * `sampark.*` namespace. spm-ui itself is PrimeNG v17, so this preset is a
 * faithful v21 *re-skin* (colors, radii, sizes) rather than a port of v17
 * behavior — behavioral differences stay documented in libs/migration-data.
 *
 * Design language: flat maroon (#c96868) primary, 4px default radius
 * (vs MyBKY's universal pill), cool mono neutrals, white surfaces.
 */

/**
 * Sampark badge token block — 4px radius (vs MyBKY's pill) and its own size
 * scale: default 22px, xs 20px, lg 28px (badge.sampark.* tokens).
 *
 * Used in two places, same convention as SAMPARK_BUTTON_TOKENS:
 * - `components.badge` of the `Sampark` preset below (whole-preview re-skin)
 * - the scoped `dt` input on `baps-badge` when `brand="sampark"` is set on a
 *   single instance while the global preset stays MyBKY (badge.component.ts)
 */
export const SAMPARK_BADGE_TOKENS = {
  root: {
    borderRadius: tokens.BadgeSamparkRadius,
    height: tokens.BadgeSamparkSizeM,
    minWidth: tokens.BadgeSamparkSizeM,
    fontSize: tokens.BadgeSamparkFontSizeM,
    padding: tokens.BadgeSamparkPaddingM,
    fontWeight: tokens.FontWeightMedium,
  },
  sm: {
    height: tokens.BadgeSamparkSizeS,
    minWidth: tokens.BadgeSamparkSizeS,
    fontSize: tokens.BadgeSamparkFontSizeS,
  },
  lg: {
    height: tokens.BadgeSamparkSizeL,
    minWidth: tokens.BadgeSamparkSizeL,
    fontSize: tokens.BadgeSamparkFontSizeL,
  },
  xl: {
    height: tokens.BadgeSamparkSizeXl,
    minWidth: tokens.BadgeSamparkSizeXl,
    fontSize: tokens.BadgeSamparkFontSizeXl,
  },
};

/**
 * Sampark progress bar, as PrimeNG design tokens rather than component CSS.
 *
 * Used in two places, same convention as SAMPARK_BUTTON_TOKENS:
 * - `components.progressbar` of the `Sampark` preset below (whole-preview re-skin)
 * - the scoped `dt` input on `baps-progressbar` when `brand="sampark"` is set
 *   on a single instance while the global preset stays MyBKY
 *
 * `height` is included here because PrimeNG's progressbar token surface
 * actually exposes it — unlike Button, whose 217-token surface has no height
 * token at all and therefore genuinely requires CSS for the Figma heights.
 * Checking that surface first is the point of the styling hierarchy: this
 * component could drop its CSS, Button cannot.
 */
export const SAMPARK_PROGRESSBAR_TOKENS = {
  root: {
    borderRadius: tokens.RadiusSamparkDefault,
    height: '0.5rem',
    background: tokens.ColorSamparkMono20,
  },
  value: {
    background: '{primary.color}',
  },
  label: {
    color: tokens.ColorSamparkMono0,
    fontSize: '0.625rem',
    fontWeight: '600',
  },
};

/**
 * Sampark checkbox, as PrimeNG design tokens rather than component CSS.
 *
 * Checkbox has one of the better token surfaces in PrimeNG v21 (41 tokens,
 * including height/width and several disabled states), so most of what
 * checkbox.component.ts used to hand-write moves here.
 *
 * What could NOT move, and stays as CSS in the component with the reason
 * recorded next to it:
 * - The 1.5px box border WIDTH. There is a borderColor token but no
 *   borderWidth token, so the weight has to be set in CSS or it reverts to
 *   PrimeNG's own.
 * - The `disabled` and `checked+disabled` fills. PrimeNG exposes
 *   `disabledBackground` and `checkedDisabledBorderColor`, but no
 *   `disabledBorderColor` and no `checkedDisabledBackground`, so the Sampark
 *   disabled treatment is only half expressible.
 * - `.p-checkbox-label`. That element is BAPS's own markup, not PrimeNG's, so
 *   no checkbox token addresses it at all.
 */
export const SAMPARK_CHECKBOX_TOKENS = {
  root: {
    // 4px at BOTH sizes. The radius variables bound to this frame are
    // {0, 4, 999} — there is no 6px step, so the L box does not round harder
    // than the S box. (RadiusMybkySm's "checkbox small" comment claims 6px;
    // that comment is stale and no Sampark frame uses it.)
    borderRadius: tokens.RadiusSamparkDefault,
    width: '16px',
    height: '16px',
  },
  colorScheme: {
    light: {
      root: {
        background: tokens.ColorSamparkMono0,
        // Mono/60 — Figma's "Labels & Placeholder" step. This was Mono/40,
        // which Figma names "Disable Item": a resting checkbox was drawing
        // itself in the disabled ink, so enabled and disabled read almost the
        // same. The two steps are #9f9c9c and #bcb9b9.
        borderColor: tokens.ColorSamparkMono60,
        hoverBorderColor: '{primary.hover.color}',
        // The defining rule of this frame: a checked box stays WHITE. Colour
        // is carried by the border and the tick, never by a fill.
        //
        // This was Primary/60 as a solid background — PrimeNG's Material base
        // fills a checked box, and the preset was going along with it. Every
        // checked checkbox in both brands rendered as a solid maroon/blue
        // square instead of the outlined box Figma draws.
        checkedBackground: tokens.ColorSamparkMono0,
        checkedBorderColor: '{primary.color}',
        // Stays white on hover too; only the border darkens to Primary/80.
        checkedHoverBackground: tokens.ColorSamparkMono0,
        checkedHoverBorderColor: '{primary.hover.color}',
        disabledBackground: tokens.ColorSamparkMono20,
      },
      icon: {
        checkedColor: '{primary.color}',
        // The tick does NOT darken with the border on hover — Figma keeps it
        // at Primary/60 in both checked rows.
        checkedHoverColor: '{primary.color}',
        // Disabled+checked is the one state that does fill (Mono/40), so its
        // tick goes white for contrast. The fill has no token; see the
        // component's CSS.
        disabledColor: tokens.ColorSamparkMono0,
      },
    },
    // Mirrors light key-for-key. Without it the control falls through to
    // Material's own dark palette and renders in Material blue.
    dark: {
      root: {
        background: tokens.ColorSamparkDarkSurfaceCard,
        borderColor: tokens.ColorSamparkDarkBorderControl,
        hoverBorderColor: tokens.ColorSamparkDarkPrimaryHover,
        // Same no-fill rule in dark; the box keeps the card surface it sits on.
        checkedBackground: tokens.ColorSamparkDarkSurfaceCard,
        checkedBorderColor: tokens.ColorSamparkDarkPrimaryDefault,
        checkedHoverBackground: tokens.ColorSamparkDarkSurfaceCard,
        checkedHoverBorderColor: tokens.ColorSamparkDarkPrimaryHover,
        disabledBackground: tokens.ColorSamparkDarkSurfaceHover,
      },
      icon: {
        // In dark the tick carries the colour against the card surface, so it
        // takes the primary step rather than the inverse text colour the
        // filled version needed.
        checkedColor: tokens.ColorSamparkDarkPrimaryDefault,
        checkedHoverColor: tokens.ColorSamparkDarkPrimaryHover,
        disabledColor: tokens.ColorSamparkDarkTextDisabled,
      },
    },
  },
};

/**
 * Sampark slider, as PrimeNG design tokens rather than component CSS.
 *
 * The slider surface is 27 tokens across root/track/range/handle. Four of the
 * five things slider.component.ts used to hand-write have a token and moved
 * here: track.borderRadius, range.background, handle.background and
 * handle.hoverBackground.
 *
 * `range` and `handle` sit at the TOP level rather than under
 * colorScheme.light on purpose. The CSS they replace was not scheme-scoped —
 * it painted the maroon handle and fill in dark mode too — so pinning them
 * per-scheme would let PrimeNG's Material dark primary take over the handle
 * the moment the CSS went away.
 *
 * What could NOT move, and stays as CSS in the component with the reason
 * recorded next to it:
 * - The handle's border colour. There is handle.background and
 *   handle.hoverBackground but no handle.borderColor.
 * - The focus ring. handle.focusRing.shadow exists, but Material re-declares
 *   .p-slider-handle:focus-visible in its own css block at equal specificity
 *   and later in the primeng layer, so the token can never win.
 * - The disabled dim. The whole surface has no disabled token at all.
 */
export const SAMPARK_SLIDER_TOKENS = {
  track: { borderRadius: tokens.RadiusSamparkDefault },
  range: { background: '{primary.color}' },
  handle: {
    background: '{primary.color}',
    hoverBackground: '{primary.hover.color}',
  },
  colorScheme: {
    // Sampark has no dark palette yet — the track borrows the mybky mono
    // darks, same as the button/input dark blocks above.
    dark: { track: { background: tokens.ColorMybkyMono700 } },
  },
};

/**
 * Sampark radio button, as PrimeNG design tokens.
 *
 * Values read from Figma node 13197:89044 ("Checkbox" frame, which carries
 * BOTH the Checkbox and Radio Button types) via get_variable_defs — every one
 * already existed as a Sampark token, so nothing new was invented:
 *   Primary/60 #c96868 checked · Primary/80 #b44141 hover
 *   Mono/60 #9f9c9c resting border · Mono/20 #f3f2f2 disabled fill
 *   Mono/40 #bcb9b9 disabled ring/dot
 *
 * Size: the S step is 16px, the L (mobile) step 22px — both measured off the
 * frame. The L step is carried by the component's own `size` input rather
 * than here, because PrimeNG's sm/lg token sections size the control but the
 * LABEL also changes (14px -> 16px) and there is no token for that.
 */
export const SAMPARK_RADIO_TOKENS = {
  root: {
    width: '16px',
    height: '16px',
  },
  colorScheme: {
    light: {
      root: {
        background: tokens.ColorSamparkMono0,
        // Mono/60, same correction as the checkbox — this was the Mono/40
        // "Disable Item" step.
        borderColor: tokens.ColorSamparkMono60,
        hoverBorderColor: '{primary.hover.color}',
        // Checked stays white: ring + dot carry the colour.
        checkedBackground: tokens.ColorSamparkMono0,
        checkedBorderColor: '{primary.color}',
        // THE ONE PLACE THE TWO CONTROLS DIVERGE. A checked radio under the
        // pointer fills solid Primary/80 and flips its dot to white; a checked
        // checkbox never fills. This is deliberate in the Sampark spec — do
        // not "tidy" it into consistency with the checkbox.
        checkedHoverBackground: '{primary.hover.color}',
        checkedHoverBorderColor: '{primary.hover.color}',
        // Disabled UNCHECKED: Mono/20 fill, Mono/40 ring.
        disabledBackground: tokens.ColorSamparkMono20,
        checkedDisabledBorderColor: tokens.ColorSamparkMono40,
      },
      icon: {
        // 6px dot in a 16px box — Sampark runs a tighter dot than MyBKY's 8px.
        size: '6px',
        checkedColor: '{primary.color}',
        // White, because this is the one hover state with a solid fill under it.
        checkedHoverColor: tokens.ColorSamparkMono0,
        // Disabled+checked fills Mono/40, so the dot is white on top of it.
        disabledColor: tokens.ColorSamparkMono0,
      },
    },
    dark: {
      root: {
        background: tokens.ColorSamparkDarkSurfaceCard,
        borderColor: tokens.ColorSamparkDarkBorderControl,
        hoverBorderColor: tokens.ColorSamparkDarkPrimaryHover,
        checkedBackground: tokens.ColorSamparkDarkSurfaceCard,
        checkedBorderColor: tokens.ColorSamparkDarkPrimaryDefault,
        // The solid-fill hover carries over to dark, on the lighter primary.
        checkedHoverBackground: tokens.ColorSamparkDarkPrimaryHover,
        checkedHoverBorderColor: tokens.ColorSamparkDarkPrimaryHover,
        disabledBackground: tokens.ColorSamparkDarkSurfaceHover,
        checkedDisabledBorderColor: tokens.ColorSamparkDarkTextDisabled,
      },
      icon: {
        checkedColor: tokens.ColorSamparkDarkPrimaryDefault,
        checkedHoverColor: tokens.ColorSamparkDarkTextInverse,
        disabledColor: tokens.ColorSamparkDarkTextDisabled,
      },
    },
  },
};

export const Sampark = definePreset(Material, {
  primitive: {
    // spm-ui palettes are authored on a 0/5/10/20/40/60/80/100 scale; mapped
    // here onto PrimeNG's 50–950 keys (nearest step reused where spm-ui has
    // no equivalent — no new colors are invented).
    samparkMaroon: {
      50: tokens.ColorSamparkPrimary0,
      100: tokens.ColorSamparkPrimary10,
      200: tokens.ColorSamparkPrimary20,
      300: tokens.ColorSamparkPrimary40,
      400: tokens.ColorSamparkPrimary40,
      500: tokens.ColorSamparkPrimary60,
      600: tokens.ColorSamparkPrimary60,
      700: tokens.ColorSamparkPrimary80,
      800: tokens.ColorSamparkPrimary100,
      900: tokens.ColorSamparkPrimary100,
      950: tokens.ColorSamparkPrimary100,
    },
    samparkMono: {
      0: tokens.ColorSamparkMono0,
      50: tokens.ColorSamparkMono5,
      100: tokens.ColorSamparkMono20,
      200: tokens.ColorSamparkMonoBorders,
      300: tokens.ColorSamparkMono40,
      400: tokens.ColorSamparkMono60,
      500: tokens.ColorSamparkMono60,
      600: tokens.ColorSamparkMono80,
      700: tokens.ColorSamparkMono80,
      800: tokens.ColorSamparkMono100,
      900: tokens.ColorSamparkMono100,
      950: tokens.ColorSamparkMono100,
    },
    samparkError: {
      80: tokens.ColorSamparkError80,
      100: tokens.ColorSamparkError100,
    },
    samparkSuccess: {
      60: tokens.ColorSamparkSuccess60,
      80: tokens.ColorSamparkSuccess80,
    },
    samparkInfo: {
      60: tokens.ColorSamparkInfo60,
      80: tokens.ColorSamparkInfo80,
    },
    samparkWarning: {
      60: tokens.ColorSamparkWarning60,
      80: tokens.ColorSamparkWarning80,
    },
  },

  semantic: {
    fontSize: '14px',
    formField: {
      borderRadius: tokens.FormFieldSamparkBorderRadius,
    },
    primary: {
      50: '{samparkMaroon.50}',
      100: '{samparkMaroon.100}',
      200: '{samparkMaroon.200}',
      300: '{samparkMaroon.300}',
      400: '{samparkMaroon.400}',
      500: '{samparkMaroon.500}',
      600: '{samparkMaroon.600}',
      700: '{samparkMaroon.700}',
      800: '{samparkMaroon.800}',
      900: '{samparkMaroon.900}',
      950: '{samparkMaroon.950}',
    },
    colorScheme: {
      light: {
        // References into `semantic.primary` above, NOT the token literals these
        // replace — matching baps.theme.ts, which uses the same three steps.
        //
        // Why it matters: `withAccent` re-themes a preset by swapping
        // `semantic.primary`. Reading a token literal here bypassed that ramp
        // entirely, so picking an accent moved MyBKY's PrimeNG colours and left
        // Sampark's on the maroon — the two presets behaved differently for no
        // reason anyone had chosen.
        //
        // Value-preserving, measured: `{primary.600}` -> samparkMaroon.600 ->
        // ColorSamparkPrimary60 = #c96868, which is exactly what
        // ColorSamparkPrimaryDefault was. Same for 700 (#b44141) and 800
        // (#873030). `contrastColor` stays a token: it is text-on-primary, not
        // a step of the ramp, and MyBKY keeps a mono reference there too.
        primary: {
          color: '{primary.600}',
          contrastColor: tokens.ColorSamparkTextInverse,
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        formField: {
          background: tokens.ColorSamparkSurfaceCard,
          borderColor: tokens.ColorSamparkBorderDefault,
          hoverBorderColor: tokens.ColorSamparkBorderHover,
          invalidBorderColor: tokens.ColorSamparkBorderError,
          color: tokens.ColorSamparkTextPrimary,
          placeholderColor: tokens.ColorSamparkTextPlaceholder,
        },
      },
    },
  },

  components: {
    button: SAMPARK_BUTTON_TOKENS,

    badge: SAMPARK_BADGE_TOKENS,

    avatar: SAMPARK_AVATAR_TOKENS,

    // ToggleSwitch — maroon on-track, grey off-track, white thumb
    // (toggleswitch.sampark.* tokens).
    toggleswitch: {
      colorScheme: {
        light: {
          root: {
            background: tokens.ToggleSwitchSamparkTrackOff,
            hoverBackground: tokens.ToggleSwitchSamparkTrackOff,
            checkedBackground: tokens.ToggleSwitchSamparkTrackOn,
            checkedHoverBackground: tokens.ToggleSwitchSamparkTrackOn,
            disabledBackground: tokens.ToggleSwitchSamparkTrackOffDisabled,
          },
          handle: {
            background: tokens.ColorSamparkMono0,
            hoverBackground: tokens.ColorSamparkMono0,
            checkedBackground: tokens.ColorSamparkMono0,
            checkedHoverBackground: tokens.ColorSamparkMono0,
          },
        },
      },
    },

    // Checkbox — 4px radius, maroon checked fill.
    checkbox: SAMPARK_CHECKBOX_TOKENS,

    radiobutton: SAMPARK_RADIO_TOKENS,

    // Slider — 4px track radius, maroon range fill and handle.
    slider: SAMPARK_SLIDER_TOKENS,

    // ProgressBar — 4px radius, maroon fill.
    progressbar: SAMPARK_PROGRESSBAR_TOKENS,

    // Paginator — 4px radius, maroon active page.
    paginator: {
      root: {
        borderRadius: tokens.RadiusSamparkDefault,
      },
    },



    // Tooltip — dark bg, white text, 4px radius.
    tooltip: {
      root: {
        borderRadius: tokens.RadiusSamparkDefault,
      },
    },

    // Divider — 1px Sampark border color.
    divider: {
      colorScheme: {
        light: {
          root: {
            borderColor: tokens.ColorSamparkBorderDefault,
          },
          content: {
            background: tokens.ColorSamparkSurfaceCard,
            color: tokens.ColorSamparkTextMuted,
          },
        },
        // A divider is decorative, so it takes the quiet border tier — the one
        // deliberately below WCAG 1.4.11's 3:1. That threshold governs controls
        // whose boundary carries meaning, which a row rule does not.
        dark: {
          root: {
            borderColor: tokens.ColorSamparkDarkBorderDivider,
          },
          content: {
            background: tokens.ColorSamparkDarkSurfaceCard,
            color: tokens.ColorSamparkDarkTextMuted,
          },
        },
      },
    },

    // Tabs — maroon active indicator.
    tabs: {
      colorScheme: {
        light: {
          tablist: {
            borderColor: tokens.ColorSamparkBorderDefault,
          },
          tab: {
            activeColor: tokens.ColorSamparkPrimaryDefault,
            activeBorderColor: tokens.ColorSamparkPrimaryDefault,
          },
          activeBar: {
            background: tokens.ColorSamparkPrimaryDefault,
          },
        },
        dark: {
          tablist: {
            borderColor: tokens.ColorSamparkDarkBorderDivider,
          },
          tab: {
            activeColor: tokens.ColorSamparkDarkPrimaryDefault,
            activeBorderColor: tokens.ColorSamparkDarkPrimaryDefault,
          },
          activeBar: {
            background: tokens.ColorSamparkDarkPrimaryDefault,
          },
        },
      },
    },

    // DataTable — Sampark header bg, border color, selection.
    datatable: {
      root: {
        borderColor: tokens.ColorSamparkBorderDefault,
      },
      colorScheme: {
        light: {
          header: {
            background: tokens.ColorSamparkMono5,
            borderColor: tokens.ColorSamparkBorderDefault,
            color: tokens.ColorSamparkTextSecondary,
          },
          headerCell: {
            background: tokens.ColorSamparkMono5,
            hoverBackground: tokens.ColorSamparkMono20,
            borderColor: tokens.ColorSamparkBorderDefault,
            color: tokens.ColorSamparkTextSecondary,
          },
          row: {
            background: tokens.ColorSamparkSurfaceCard,
            hoverBackground: tokens.ColorSamparkMono20,
            selectedBackground: tokens.ColorSamparkPrimary0,
            color: tokens.ColorSamparkTextPrimary,
            stripedBackground: tokens.ColorSamparkMono5,
          },
          bodyCell: {
            borderColor: tokens.ColorSamparkBorderDefault,
          },
        },
        // The row ladder inverts in dark: the table body sits on the RAISED
        // surface and stripes step DOWN to the ground, because stepping up from
        // the ground would collide with the hover wash.
        //
        // KNOWN LIMITATION: selectedBackground equals hoverBackground here.
        // Light mode separates them with a pale maroon tint (primary.0), and
        // the Sampark ramp has no dark equivalent — primary-alpha over a
        // near-black ground is effectively invisible. Distinguishing them needs
        // a maroon-tinted dark surface step, which is a new primitive and so a
        // design decision, not something to invent inside a preset.
        dark: {
          header: {
            background: tokens.ColorSamparkDarkSurfaceCard,
            borderColor: tokens.ColorSamparkDarkBorderDivider,
            color: tokens.ColorSamparkDarkTextSecondary,
          },
          headerCell: {
            background: tokens.ColorSamparkDarkSurfaceCard,
            hoverBackground: tokens.ColorSamparkDarkSurfaceHover,
            borderColor: tokens.ColorSamparkDarkBorderDivider,
            color: tokens.ColorSamparkDarkTextSecondary,
          },
          row: {
            background: tokens.ColorSamparkDarkSurfaceCard,
            hoverBackground: tokens.ColorSamparkDarkSurfaceHover,
            selectedBackground: tokens.ColorSamparkDarkSurfaceHover,
            color: tokens.ColorSamparkDarkTextPrimary,
            stripedBackground: tokens.ColorSamparkDarkSurfaceGround,
          },
          bodyCell: {
            borderColor: tokens.ColorSamparkDarkBorderDivider,
          },
        },
      },
    },
  },
});

type RampSteps = Record<number | string, string | undefined>;

/**
 * Remaps the component-level tokens in the Sampark preset that derive from the
 * brand primary ramp.
 *
 * Parallel to `myBkyPrimaryDerivedComponents` in baps.theme.ts: presets define
 * component tokens using build-time token literals (`#c96868`, etc.).
 * When re-theming under an accent or custom primary color, merging
 * `semantic.primary` alone leaves component tokens on their baked default
 * literals. This function reconstructs those component overrides from the
 * chosen ramp so both semantic and component tokens move together.
 */
export function samparkPrimaryDerivedComponents(ramp: RampSteps) {
  const c50 = ramp[50];
  const c100 = ramp[100];
  const c200 = ramp[200];
  const c400 = ramp[400];
  const c600 = ramp[600];
  const c700 = ramp[700];
  const c800 = ramp[800];

  if (!c600) return {};

  const primaryBtn = {
    background: c600,
    hoverBackground: c700 ?? c600,
    activeBackground: c800 ?? c700 ?? c600,
  };

  const ghostBtn = {
    hoverBackground: c50 ?? 'rgba(0,0,0,0.04)',
    activeBackground: c100 ?? c50 ?? 'rgba(0,0,0,0.08)',
    color: c600,
  };

  const linkBtn = {
    color: c600,
    hoverColor: c700 ?? c600,
    activeColor: c800 ?? c600,
  };

  return {
    button: {
      colorScheme: {
        light: {
          root: { primary: primaryBtn },
          text: { primary: ghostBtn },
          link: linkBtn,
        },
        dark: {
          root: { primary: primaryBtn },
          text: { primary: { color: c600 } },
          link: linkBtn,
        },
      },
    },
    toggleswitch: {
      colorScheme: {
        light: {
          root: {
            checkedBackground: c600,
            checkedHoverBackground: c700 ?? c600,
          },
        },
      },
    },
    checkbox: {
      colorScheme: {
        light: {
          root: {
            hoverBorderColor: c700 ?? c600,
            checkedBorderColor: c600,
            checkedHoverBorderColor: c700 ?? c600,
          },
          icon: {
            checkedColor: c600,
            checkedHoverColor: c600,
          },
        },
        dark: {
          root: {
            hoverBorderColor: c200 ?? c400 ?? c600,
            checkedBorderColor: c400 ?? c600,
            checkedHoverBorderColor: c200 ?? c400 ?? c600,
          },
          icon: {
            checkedColor: c400 ?? c600,
            checkedHoverColor: c200 ?? c400 ?? c600,
          },
        },
      },
    },
    radiobutton: {
      colorScheme: {
        light: {
          root: {
            hoverBorderColor: c700 ?? c600,
            checkedBorderColor: c600,
            checkedHoverBackground: c700 ?? c600,
            checkedHoverBorderColor: c700 ?? c600,
          },
          icon: {
            checkedColor: c600,
          },
        },
        dark: {
          root: {
            hoverBorderColor: c200 ?? c400 ?? c600,
            checkedBorderColor: c400 ?? c600,
            checkedHoverBackground: c200 ?? c400 ?? c600,
            checkedHoverBorderColor: c200 ?? c400 ?? c600,
          },
          icon: {
            checkedColor: c400 ?? c600,
          },
        },
      },
    },
    // Tabs. The preset bakes ColorSamparkPrimaryDefault (the literal #c96868),
    // and _tabs-sampark.scss masks two of the three cells with !important —
    // so light mode LOOKED like it followed the picker while the active-bar
    // colour and the whole dark scheme stayed maroon.
    tabs: {
      colorScheme: {
        light: {
          tab: { activeColor: c600, activeBorderColor: c600 },
          activeBar: { background: c600 },
        },
        dark: {
          tab: {
            activeColor: c400 ?? c600,
            activeBorderColor: c400 ?? c600,
          },
          activeBar: { background: c400 ?? c600 },
        },
      },
    },
    progressbar: {
      value: {
        background: c600,
      },
    },
    slider: {
      range: {
        background: c600,
      },
      handle: {
        background: c600,
        hoverBackground: c700 ?? c600,
      },
    },
    avatar: {
      root: {
        background: c50 ?? tokens.ColorSamparkPrimary0,
      },
    },
    datatable: {
      colorScheme: {
        light: {
          row: {
            selectedBackground: c50 ?? tokens.ColorSamparkPrimary0,
          },
        },
      },
    },
  };
}

export default {
  preset: Sampark,
  options: {
    darkModeSelector: '.baps-dark',
  },
};

