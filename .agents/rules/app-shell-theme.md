# The app-shell theme file

Every BAPS app shell carries one file that lets a project retheme itself
without a change inside `@org/ui-kit`. This is what it must do, in each
framework, and which parts of it are Angular's alone.

The Angular reference is
`baps-app-shell/src/app/theme/app-sell.theme.ts`.

---

## The contract

Two constants at the top, and nothing else a project should have to edit:

```ts
/** '' or 'brand' → the brand's own colour. Or a hex, a swatch name, or a CSS
 *  colour name. */
export const APP_SHELL_PRIMARY_COLOR: string = '';

/** The navbar and left rail. Same accepted values. */
export const APP_SHELL_NAV_COLOR: string = '';
```

From those, on import, the file writes to **three sinks**. Which of them
exist depends on the framework, and that is the whole of the difference.

| Sink | What it is                                                                | Angular | React / Next |
| ---- | ------------------------------------------------------------------------- | ------- | ------------ |
| 1    | PrimeNG preset — `withPrimaryRamp(Sampark, ramp)` fed to `providePrimeNG` | **yes** | **no**       |
| 2    | `--color-<brand>-primary-*` custom properties on `documentElement`        | yes     | **yes**      |
| 3    | `--color-sampark-secondary-*` — the nav and chrome ramp                   | yes     | **yes**      |

Sink 1 is not "skipped for simplicity". A React app renders no `.p-button`,
no `.p-tag`, nothing a preset could re-skin, so importing
`@primeuix/themes` there would add a dependency to drive machinery with no
output. Sinks 2 and 3 are pure DOM and carry everywhere.

## The ramp

Sinks 2 and 3 need a 50–950 ramp built from one colour.

**Use `buildRamp` from `@org/ui-kit/theme`.** It has no dependencies, and it is
not an approximation:

```
lighter  mix toward white at 95 / 76 / 57 / 38 / 19 per cent
darker   scale toward black at 15 / 30 / 45 / 60 / 75 per cent
500      the input colour, normalised
```

The two directions are different operations — `v + t * (255 - v)` going up,
`v * (1 - t)` going down. Using one for both gives a ramp that looks right in
the light half and muddy in the dark.

Those percentages were recovered by solving the mix ratio per step against
`palette()` across six base colours, not guessed. `ramp.spec.ts` asserts the
two agree channel by channel on eleven colours including `#000000` and
`#ffffff`: **worst error 0**. That test is what stops this drifting if PrimeNG
ever changes its own.

So an app shell outside Angular needs **no PrimeNG package at all** to theme
itself.

## The step mapping

Copy it from `DS_RAMPS` in `libs/ui-kit/src/lib/theme/accent.theme.ts`
verbatim. Do not re-derive it:

```
sampark   --color-sampark-primary-{0,10,20,40,60,80,100}
          from ramp steps {50,100,200,400,600,700,800}
mybky     --color-mybky-blue-{50…950} from the same step
```

Sampark also publishes `--color-sampark-primary-alpha10`, derived from step
800 rather than carried by the ramp.

## Undoing

Keep the list of properties the last call wrote and remove exactly those
before writing again. Calling with no accent must **remove** the inline
properties, not write the defaults back — the stylesheet's own values have to
be able to apply again, and an inline property beats them forever.

## Brand and dark mode belong in the same file

They are the same mechanism and no part of them is framework-specific:

```ts
document.body.classList.toggle('baps-ds-sampark', brand === 'sampark');
document.body.classList.toggle('baps-dark', dark);
```

MyBKY is the default and carries no class. A future third brand is a token set
plus a scope class — no component markup changes.

## Checklist

- [ ] Two constants at the top, documented, defaulting to `''`
- [ ] Ramp from `buildRamp`, not a hand-rolled mix
- [ ] Step mapping copied from `DS_RAMPS`, not re-derived
- [ ] Written properties tracked so the next call undoes them exactly
- [ ] No accent → properties removed, not defaults rewritten
- [ ] Brand and dark mode in the same file
- [ ] Angular only: sink 1, and `preset` wired into `providePrimeNG`
- [ ] Non-Angular: no PrimeNG package in `package.json`
