import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';
// NOTE: importing '@org/tokens' (the package barrel) here causes ngtools/webpack
// to silently emit an empty module for libs/tokens/src/index.ts's `export * from
// './generated/tokens'` re-export — every token resolves to the literal string
// "undefined" at runtime with no build error. Root cause not yet isolated
// (suspected Angular AOT re-export elision); importing the generated file
// directly sidesteps it. Revisit when auditing the token pipeline in Phase A.
// eslint-disable-next-line @nx/enforce-module-boundaries
import * as tokens from '@org/tokens/generated/tokens';

/**
 * MyBKY (events-ui) live preset — PrimeNG v21 preset generated from the
 * Style Dictionary token output (libs/tokens) instead of hand-duplicated
 * hex literals, mirroring events-ui's libs/ui-lib/src/lib/theme/noir.theme.ts.
 * Sampark (spm-ui) is PrimeNG v17 and cannot run live in this Angular 21/v21
 * workspace — its tokens (namespaced `sampark.*` in the same source files)
 * drive the separate v21 re-skin preset in sampark.theme.ts, selectable via
 * the Storybook "Design system" toolbar; true v17 behavior differences stay
 * documented in libs/migration-data.
 *
 * Button variants below are verified against Figma node 22465:93605
 * (MyBKY "Component Library" page, Button component set) — see
 * libs/migration-data/src/component-mapping/button.mapping.mdx for the
 * full v17-vs-v21 comparison and libs/ui-kit/src/lib/components/button/
 * for the corresponding stories.
 */
export const MyBky = definePreset(Material, {
  primitive: {
    bkymsBlue: {
      50: tokens.ColorMybkyBlue50,
      100: tokens.ColorMybkyBlue100,
      200: tokens.ColorMybkyBlue200,
      300: tokens.ColorMybkyBlue300,
      400: tokens.ColorMybkyBlue400,
      500: tokens.ColorMybkyBlue500,
      600: tokens.ColorMybkyBlue600,
      700: tokens.ColorMybkyBlue700,
      800: tokens.ColorMybkyBlue800,
      900: tokens.ColorMybkyBlue900,
      950: tokens.ColorMybkyBlue950,
    },
    bkymsMono: {
      0: tokens.ColorMybkyMono0,
      50: tokens.ColorMybkyMono50,
      100: tokens.ColorMybkyMono100,
      200: tokens.ColorMybkyMono200,
      300: tokens.ColorMybkyMono300,
      400: tokens.ColorMybkyMono400,
      500: tokens.ColorMybkyMono500,
      600: tokens.ColorMybkyMono600,
      700: tokens.ColorMybkyMono700,
      800: tokens.ColorMybkyMono800,
      900: tokens.ColorMybkyMono900,
      950: tokens.ColorMybkyMono950,
    },
    bkymsError: {
      80: tokens.ColorMybkyError80,
      100: tokens.ColorMybkyError100,
    },
    bkymsWarning: {
      60: tokens.ColorMybkyWarning60,
      80: tokens.ColorMybkyWarning80,
    },
    bkymsSuccess: {
      50: tokens.ColorMybkySuccess50,
      400: tokens.ColorMybkySuccess400,
      600: tokens.ColorMybkySuccess600,
    },
  },

  semantic: {
    fontSize: '14px',
    formField: {
      paddingX: tokens.FormFieldMybkyPaddingX,
      paddingY: tokens.FormFieldMybkyPaddingY,
      borderRadius: tokens.FormFieldMybkyBorderRadius,
    },
    primary: {
      50: '{bkymsBlue.50}',
      100: '{bkymsBlue.100}',
      200: '{bkymsBlue.200}',
      300: '{bkymsBlue.300}',
      400: '{bkymsBlue.400}',
      500: '{bkymsBlue.500}',
      600: '{bkymsBlue.600}',
      700: '{bkymsBlue.700}',
      800: '{bkymsBlue.800}',
      900: '{bkymsBlue.900}',
      950: '{bkymsBlue.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          contrastColor: '{bkymsMono.0}',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        formField: {
          background: '{bkymsMono.0}',
          borderColor: '{bkymsMono.300}',
          hoverBorderColor: '{primary.200}',
          invalidBorderColor: '{bkymsError.80}',
          color: '{bkymsMono.900}',
          placeholderColor: '{bkymsMono.500}',
        },
      },
    },
  },

  components: {
    button: {
      root: {
        gap: tokens.ButtonMybkyGap,
        paddingX: tokens.ButtonMybkyPaddingX,
        paddingY: tokens.ButtonMybkyPaddingY,
        borderRadius: tokens.ButtonMybkyRadius,
        label: { fontWeight: tokens.ButtonMybkyFontWeight },
        // Figma S = 32px height / 14px font, L (PrimeNG "large") = 36px height / 16px font,
        // both at the same 16px/8px padding as the default M size. PrimeNG has no direct
        // height token — paddingY is tuned here to land on the Figma-reported heights given
        // each size's line-height, rather than reusing the root 8px value verbatim.
        sm: { fontSize: '14px', paddingX: tokens.ButtonMybkyPaddingX, paddingY: '0.4375rem' },
        lg: { fontSize: '16px', paddingX: tokens.ButtonMybkyPaddingX, paddingY: '0.475rem' },
      },
      colorScheme: {
        light: {
          root: {
            // Primary — Figma node 22465:93606 (Default) / :93702 (Hover)
            primary: {
              background: tokens.ButtonMybkyPrimaryDefault,
              hoverBackground: tokens.ButtonMybkyPrimaryHover,
              activeBackground: tokens.ButtonMybkyPrimaryHover,
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: tokens.ButtonMybkyPrimaryText,
              hoverColor: tokens.ButtonMybkyPrimaryText,
              activeColor: tokens.ButtonMybkyPrimaryText,
            },
            // Secondary — Figma node 22465:93798 (Default) / :93830 (Hover)
            secondary: {
              background: tokens.ButtonMybkySecondaryDefault,
              hoverBackground: tokens.ButtonMybkySecondaryHover,
              activeBackground: tokens.ButtonMybkySecondaryHover,
              borderColor: tokens.ButtonMybkySecondaryBorder,
              hoverBorderColor: tokens.ButtonMybkySecondaryBorder,
              activeBorderColor: tokens.ButtonMybkySecondaryBorder,
              color: tokens.ButtonMybkySecondaryText,
              hoverColor: tokens.ButtonMybkySecondaryText,
              activeColor: tokens.ButtonMybkySecondaryText,
            },
            // Danger — Figma node 22465:93614 (Default) / :93710 (Hover)
            danger: {
              background: tokens.ButtonMybkyDangerDefault,
              hoverBackground: tokens.ButtonMybkyDangerHover,
              activeBackground: tokens.ButtonMybkyDangerHover,
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: tokens.ButtonMybkyDangerText,
              hoverColor: tokens.ButtonMybkyDangerText,
              activeColor: tokens.ButtonMybkyDangerText,
            },
            // Warning — PrimeNG's "warn" severity — Figma node 22465:93622 (Default) / :93718 (Hover)
            warn: {
              background: tokens.ButtonMybkyWarningDefault,
              hoverBackground: tokens.ButtonMybkyWarningHover,
              activeBackground: tokens.ButtonMybkyWarningHover,
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: tokens.ButtonMybkyWarningText,
              hoverColor: tokens.ButtonMybkyWarningText,
              activeColor: tokens.ButtonMybkyWarningText,
            },
          },
          // Ghost variants use PrimeNG's [text]="true" modifier — Figma "Primary Ghost" /
          // "Secondary Ghost" map to text.primary / text.secondary respectively.
          text: {
            primary: {
              hoverBackground: tokens.ButtonMybkyPrimaryGhostHover,
              activeBackground: tokens.ButtonMybkyPrimaryGhostHover,
              color: tokens.ButtonMybkyPrimaryGhostText,
            },
            secondary: {
              hoverBackground: tokens.ButtonMybkySecondaryGhostHover,
              activeBackground: tokens.ButtonMybkySecondaryGhostHover,
              color: tokens.ButtonMybkySecondaryGhostText,
            },
          },
        },
        // Dark mode. The accent fills (primary/danger/warn) are RESTATED with the
        // same brand tokens as light — left to merge, PrimeNG's Material dark
        // scheme washes them out to pale tints (a lavender "Primary", salmon
        // "Danger"); pinning them keeps the solid Figma fills identical to light.
        // Secondary + ghosts use the mybky mono dark end, matching the
        // _input.scss dark block so buttons and fields read as one system.
        dark: {
          root: {
            primary: {
              background: tokens.ButtonMybkyPrimaryDefault,
              hoverBackground: tokens.ButtonMybkyPrimaryHover,
              activeBackground: tokens.ButtonMybkyPrimaryHover,
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: tokens.ButtonMybkyPrimaryText,
              hoverColor: tokens.ButtonMybkyPrimaryText,
              activeColor: tokens.ButtonMybkyPrimaryText,
            },
            danger: {
              background: tokens.ButtonMybkyDangerDefault,
              hoverBackground: tokens.ButtonMybkyDangerHover,
              activeBackground: tokens.ButtonMybkyDangerHover,
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: tokens.ButtonMybkyDangerText,
              hoverColor: tokens.ButtonMybkyDangerText,
              activeColor: tokens.ButtonMybkyDangerText,
            },
            warn: {
              background: tokens.ButtonMybkyWarningDefault,
              hoverBackground: tokens.ButtonMybkyWarningHover,
              activeBackground: tokens.ButtonMybkyWarningHover,
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: tokens.ButtonMybkyWarningText,
              hoverColor: tokens.ButtonMybkyWarningText,
              activeColor: tokens.ButtonMybkyWarningText,
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
          text: {
            primary: {
              hoverBackground: 'rgba(255, 255, 255, 0.08)',
              activeBackground: 'rgba(255, 255, 255, 0.12)',
              color: tokens.ColorMybkyBlue300,
            },
            secondary: {
              hoverBackground: 'rgba(255, 255, 255, 0.08)',
              activeBackground: 'rgba(255, 255, 255, 0.12)',
              color: tokens.ColorMybkyMono100,
            },
          },
        },
      },
    },

    // ProgressBar — moved out of component CSS into the token layer. PrimeNG's
    // progressbar token surface exposes root.height / root.background /
    // root.borderRadius / value.background / label.*, which is exactly the set
    // baps-progressbar was overriding by hand, so none of it needs CSS.
    //
    // What deliberately stays in CSS: the `severity` variants and the
    // showValue height bump. Both are driven by host classes
    // (.baps-progressbar-success, .baps-progressbar-has-value) and PrimeNG has
    // no severity concept for this component, so there is no token to carry
    // them — tokens are per-component, not per-variant.
    progressbar: {
      root: {
        borderRadius: tokens.RadiusMybkyPill,
        height: '0.5rem',
        background: tokens.ColorMybkyMono300,
      },
      value: {
        background: tokens.ColorMybkyBlue600,
      },
      label: {
        color: tokens.ColorMybkyMono0,
        fontSize: '0.625rem',
        fontWeight: '600',
      },
    },

    // Badge — MyBKY uses the pill radius everywhere (Sampark would use 4px).
    // Severity fills flow from the semantic primary/success/info/warn/danger
    // palettes already defined above; only the shape + size scale is brand-specific.
    // Default (unqualified) badge maps to Figma's "S" 22px chip; sm/lg map to
    // Figma xs (18px) and l (32px). PrimeNG has no "m" step, so Figma's 26px M is
    // documented as a gap in badge.mdx rather than forced into a nonexistent token.
    badge: {
      root: {
        borderRadius: tokens.BadgeMybkyRadius,
        height: tokens.BadgeMybkySizeS,
        minWidth: tokens.BadgeMybkySizeS,
        fontWeight: tokens.FontWeightSemibold,
      },
      sm: { height: tokens.BadgeMybkySizeXs, minWidth: tokens.BadgeMybkySizeXs },
      lg: { height: tokens.BadgeMybkySizeL, minWidth: tokens.BadgeMybkySizeL },
    },

    // Tag — MyBKY's Figma "Badge" chip (node 22465:95582), rendered with p-tag.
    // Root carries the S (22px) default: pill radius, 12px/500 text, 4px 6px
    // padding. The severity mapping mirrors events-ui's _badge.scss: the
    // unqualified tag (PrimeNG "primary") is Figma's GREY chip, and Figma's
    // navy "Primary" chip is reached via severity="contrast". PrimeNG tag
    // tokens have no border, height, or hover — those live in the BapsTag
    // wrapper (tag.component.ts) via the --tag-mybky-* CSS variables.
    tag: {
      root: {
        fontSize: tokens.TagMybkyFontSizeS,
        fontWeight: tokens.TagMybkyFontWeight,
        padding: tokens.TagMybkyPaddingS,
        gap: tokens.TagMybkyGap,
        borderRadius: tokens.TagMybkyRadius,
        roundedBorderRadius: tokens.TagMybkyRadius,
      },
      colorScheme: {
        light: {
          primary: { background: tokens.TagMybkyGreyBackground, color: tokens.TagMybkyGreyText },
          secondary: { background: tokens.TagMybkySecondaryBackground, color: tokens.TagMybkySecondaryText },
          success: { background: tokens.TagMybkySuccessBackground, color: tokens.TagMybkySuccessText },
          info: { background: tokens.TagMybkyInfoBackground, color: tokens.TagMybkyInfoText },
          warn: { background: tokens.TagMybkyWarningBackground, color: tokens.TagMybkyWarningText },
          danger: { background: tokens.TagMybkyErrorBackground, color: tokens.TagMybkyErrorText },
          contrast: { background: tokens.TagMybkyPrimaryBackground, color: tokens.TagMybkyPrimaryText },
        },
      },
    },

    // Avatar — MyBKY renders full circles (pill radius); Sampark uses 4px squares
    // (documented, not rendered). Default maps to Figma M (36px); lg/xl map to
    // Figma l (48px) / xl (60px). Figma's xs/s/2xl have no PrimeNG size input and
    // are reached via [style] overrides in the stories, flagged in avatar.mdx.
    avatar: {
      root: {
        width: tokens.AvatarMybkySizeM,
        height: tokens.AvatarMybkySizeM,
        fontSize: tokens.AvatarMybkyFontSizeM,
        borderRadius: tokens.AvatarMybkyRadius,
      },
      lg: { width: tokens.AvatarMybkySizeL, height: tokens.AvatarMybkySizeL, fontSize: tokens.AvatarMybkyFontSizeL },
      xl: { width: tokens.AvatarMybkySizeXl, height: tokens.AvatarMybkySizeXl, fontSize: tokens.AvatarMybkyFontSizeXl },
      // Initials/icon chip fill. Moved OFF `root` into colorScheme so it flips
      // with `.baps-dark` — pinned at root it stayed light in dark mode. Light =
      // Figma blue-50 chip / blue-800 text; dark = blue-900 (token comment:
      // "dark mode avatar bg") / blue-200 text. Mirrors the toggleswitch pattern.
      colorScheme: {
        light: {
          root: { background: tokens.AvatarMybkyBackground, color: tokens.AvatarMybkyText },
        },
        dark: {
          root: { background: tokens.ColorMybkyBlue900, color: tokens.ColorMybkyBlue200 },
        },
      },
    },

    // ToggleSwitch — events-ui _switch.scss (MyBKY node 22465:108921):
    // recessed grey #8d9ba5 off-track, FULL-STRENGTH blue.600 on-track, thumb
    // white in every state — on/off is carried by the track alone. Inset track
    // shadow; pale disabled tracks (mono.300 off / blue.200 on) at full
    // opacity. Geometry: 36×20 pill track, 17px thumb at a 1.5px inset —
    // PrimeNG derives the checked position as width - (thumb + gap) = 17.5px
    // and vertically centers the thumb, matching events-ui's translate table.
    // sm (28×16) / lg (40×24) re-point the vars in _switch.scss.
    toggleswitch: {
      root: {
        width: tokens.ToggleSwitchMybkyTrackWidth,
        height: tokens.ToggleSwitchMybkyTrackHeight,
        borderRadius: tokens.RadiusMybkyPill,
        gap: tokens.ToggleSwitchMybkyGap,
        shadow: tokens.ShadowMybkySwitchTrack,
        slideDuration: tokens.MotionDurationModerate,
        // Material zeroes the outline in favor of its box-shadow halo (replaced
        // by `css` below) — restore a visible keyboard focus ring: 2px at 30%
        // accent, offset 2px (design-system focus rule). events-ui removes the
        // ring entirely; deliberately NOT ported (a11y rule).
        focusRing: {
          width: '2px',
          style: 'solid',
          color: `color-mix(in srgb, ${tokens.ToggleSwitchMybkyTrackOn} 30%, transparent)`,
          offset: '2px',
        },
      },
      handle: { size: tokens.ToggleSwitchMybkyThumbSize, borderRadius: '50%' },
      colorScheme: {
        light: {
          root: {
            background: tokens.ToggleSwitchMybkyTrackOff,
            hoverBackground: tokens.ToggleSwitchMybkyTrackOff,
            checkedBackground: tokens.ToggleSwitchMybkyTrackOn,
            checkedHoverBackground: tokens.ToggleSwitchMybkyTrackOn,
            disabledBackground: tokens.ToggleSwitchMybkyTrackOffDisabled,
          },
          handle: {
            background: tokens.ToggleSwitchMybkyThumbBg,
            hoverBackground: tokens.ToggleSwitchMybkyThumbBg,
            checkedBackground: tokens.ToggleSwitchMybkyThumbBg,
            checkedHoverBackground: tokens.ToggleSwitchMybkyThumbBg,
            disabledBackground: tokens.ToggleSwitchMybkyThumbBg,
          },
        },
      },
      // Replaces the Material preset's toggleswitch `css` block (thumb
      // elevation + 10px hover/focus-visible halo) with MyBKY's flat thumb
      // shadow — string overrides string on definePreset's deep merge.
      // Checked+disabled track (blue.200) and the softer disabled inset have
      // no PrimeNG token slot, so they ride along here.
      css: `
        .p-toggleswitch-handle { box-shadow: ${tokens.ShadowMybkySwitchThumb}; }
        .p-toggleswitch.p-disabled .p-toggleswitch-slider { box-shadow: ${tokens.ShadowMybkySwitchTrackDisabled}; }
        .p-toggleswitch.p-toggleswitch-checked.p-disabled .p-toggleswitch-slider { background: ${tokens.ToggleSwitchMybkyTrackOnDisabled}; }
      `,
    },
    // Checkbox — MyBKY node 22465:108841. There was NO checkbox section here
    // at all, so every MyBKY checkbox was rendering Material's own palette:
    // a solid Material-blue filled box on check, nothing like the outlined
    // box Figma draws.
    //
    // The defining rule, shared with Sampark: a checked box stays WHITE.
    // Colour is carried by the 1.5px border and the tick, never by a fill.
    // Disabled does not dim with opacity either — it swaps to distinct
    // Mono/20 and Mono/40 inks, which is why disabledBackground is set rather
    // than left to Material's alpha treatment.
    checkbox: {
      root: {
        // 4px at BOTH sizes. The frame's radius variables are {0, 4, 999};
        // there is no 6px step. RadiusMybkySm is commented "checkbox small"
        // and is 6px — that comment predates this frame and is stale, so it
        // is deliberately NOT used here.
        borderRadius: '4px',
        width: '16px',
        height: '16px',
      },
      colorScheme: {
        light: {
          root: {
            background: tokens.ColorMybkyMono0,
            // Mono/60 "Labels & Placeholder" (#6f777d), not the Mono/40
            // "Disable Item" step.
            borderColor: tokens.ColorMybkyMono500,
            hoverBorderColor: tokens.ColorMybkyPrimaryActive,
            checkedBackground: tokens.ColorMybkyMono0,
            checkedBorderColor: tokens.ColorMybkyPrimaryDefault,
            checkedHoverBackground: tokens.ColorMybkyMono0,
            checkedHoverBorderColor: tokens.ColorMybkyPrimaryActive,
            disabledBackground: tokens.ColorMybkyMono300,
          },
          icon: {
            checkedColor: tokens.ColorMybkyPrimaryDefault,
            checkedHoverColor: tokens.ColorMybkyPrimaryDefault,
            // Unlike Sampark, MyBKY's disabled+checked box does NOT fill dark:
            // it keeps the pale Mono/20 ground and greys the tick to Mono/40.
            disabledColor: tokens.ColorMybkyMono450,
          },
        },
        dark: {
          root: {
            background: tokens.ColorMybkyDarkSurfaceCard,
            borderColor: tokens.ColorMybkyDarkBorderControl,
            hoverBorderColor: tokens.ColorMybkyDarkPrimaryHover,
            checkedBackground: tokens.ColorMybkyDarkSurfaceCard,
            checkedBorderColor: tokens.ColorMybkyDarkPrimaryDefault,
            checkedHoverBackground: tokens.ColorMybkyDarkSurfaceCard,
            checkedHoverBorderColor: tokens.ColorMybkyDarkPrimaryHover,
            disabledBackground: tokens.ColorMybkyDarkSurfaceHover,
          },
          icon: {
            checkedColor: tokens.ColorMybkyDarkPrimaryDefault,
            checkedHoverColor: tokens.ColorMybkyDarkPrimaryHover,
            disabledColor: tokens.ColorMybkyDarkTextDisabled,
          },
        },
      },
    },

    // RadioButton — same frame, same matrix, same ramp as the checkbox above.
    //
    // Note what MyBKY does NOT do: Sampark's checked radio fills solid on
    // hover (Primary/80, white dot). The MyBKY frame has no such row — every
    // checked state here stays white — so that divergence is Sampark-only and
    // must not be copied across.
    radiobutton: {
      root: {
        width: '16px',
        height: '16px',
      },
      colorScheme: {
        light: {
          root: {
            background: tokens.ColorMybkyMono0,
            borderColor: tokens.ColorMybkyMono500,
            hoverBorderColor: tokens.ColorMybkyPrimaryActive,
            checkedBackground: tokens.ColorMybkyMono0,
            checkedBorderColor: tokens.ColorMybkyPrimaryDefault,
            checkedHoverBackground: tokens.ColorMybkyMono0,
            checkedHoverBorderColor: tokens.ColorMybkyPrimaryActive,
            disabledBackground: tokens.ColorMybkyMono300,
            checkedDisabledBorderColor: tokens.ColorMybkyMono450,
          },
          icon: {
            // 8px dot in a 16px box.
            size: '8px',
            checkedColor: tokens.ColorMybkyPrimaryDefault,
            checkedHoverColor: tokens.ColorMybkyPrimaryDefault,
            disabledColor: tokens.ColorMybkyMono450,
          },
        },
        dark: {
          root: {
            background: tokens.ColorMybkyDarkSurfaceCard,
            borderColor: tokens.ColorMybkyDarkBorderControl,
            hoverBorderColor: tokens.ColorMybkyDarkPrimaryHover,
            checkedBackground: tokens.ColorMybkyDarkSurfaceCard,
            checkedBorderColor: tokens.ColorMybkyDarkPrimaryDefault,
            checkedHoverBackground: tokens.ColorMybkyDarkSurfaceCard,
            checkedHoverBorderColor: tokens.ColorMybkyDarkPrimaryHover,
            disabledBackground: tokens.ColorMybkyDarkSurfaceHover,
            checkedDisabledBorderColor: tokens.ColorMybkyDarkTextDisabled,
          },
          icon: {
            checkedColor: tokens.ColorMybkyDarkPrimaryDefault,
            checkedHoverColor: tokens.ColorMybkyDarkPrimaryHover,
            disabledColor: tokens.ColorMybkyDarkTextDisabled,
          },
        },
      },
    },

  },
});

/**
 * @deprecated Use `MyBky`. This preset has always been the MyBKY skin — the doc
 * comment above says so — but it shipped under the name `Baps`, which reads as
 * "the house default" and made the design-system list look like it held four
 * presets when it holds three. `DS_PRESETS` in the Storybook preview mapped
 * `mybky: Baps`, which is the confusion in one line.
 *
 * Kept as an alias because both consuming apps import it by this name and
 * neither is in this repository. Same object, so `Baps === MyBky` and any
 * identity check still holds. Remove once both apps are on `MyBky`.
 */
export const Baps = MyBky;

export default {
  preset: MyBky,
  options: {
    darkModeSelector: '.baps-dark',
  },
};
