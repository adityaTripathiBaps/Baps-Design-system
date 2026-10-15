# Changelog

All notable changes to the BAPS Design System are recorded here by hand. See
[`docs/VERSIONING-AND-UPGRADE.md`](docs/VERSIONING-AND-UPGRADE.md) for release
classification and deprecation policy.

## Unreleased

### Fixed

- **`@org/ui-kit` — patch, visual:** corrected the Angular toolbar's inherited
  text/border colour to use `--toolbar-sampark-title-color` instead of
  PrimeNG's fallback ink (`1e800d2`). This aligns the wrapper with its existing
  token and raw-markup partial; it does not introduce a new visual design.
- **`@org/ui-kit` — patch, visual:** added `box-sizing: border-box` to
  `.baps-paginator__gap` so its standalone `pagination.css` height is 30px
  instead of 34px (`4c053bc`). Storybook and applications with a global
  border-box reset already rendered 30px, so the visible correction affects
  raw-CSS consumers without that reset.
