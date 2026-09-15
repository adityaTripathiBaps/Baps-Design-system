<!-- TEMPLATE — copied into a consumer repo by the baps-project-bootstrap skill.
     Unlike the other rules, this one is LOCAL: fill it in and maintain it here.
     Replace <APP>, <BRAND>, <PORT> and delete the sections that do not apply. -->

# <APP> — Application Architecture

Everything genuinely specific to this app. **Nothing here duplicates a
design-system rule** — if a change belongs in a copied rule, make it in the
design system instead.

## What this app is

<one paragraph: who uses it, what it does, which brand, which port>

Brand: **<BRAND>** · dev server **:<PORT>**

## Structure

```
src/app/
  pages/<page>/       one folder per route: component, template, scss
  theme/              local re-export of the design-system preset
  <shared>/           anything used by more than one page
src/styles.scss       token import + one @use per design-system partial
src/index.html        carries the page-wide brand scope
```

## Routing

<how routes are declared — lazy or eager, guards, the default route>

## State

<signals, a store, or plain services — say which and why>

Keep state out of components that only render. A page component owns its data;
a presentational child takes inputs and emits outputs.

## Composition rule

Build screens out of `baps-*` components. This app owns **layout** — where
things sit and how much space is around them. It does not own how a component
looks.

If a screen needs something the library does not have, the answer is a
design-system component, not a local one. A local component that looks like a
design-system component is the thing that makes two apps diverge.

## Demo and scaffolding code

Mark it, and remove it before the work is considered done. A page that has
accumulated demo bindings (`value`, `email`, `date`, `log()`) alongside real
ones is impossible to review.

## API

<!-- Delete if this app has no backend yet.
     When it gains one, copy events-ui/.agents/rules/api.md and
     auth-security.md rather than writing new ones — those rules are already
     agreed across BAPS. -->

## Logging

<!-- Delete if this app has no logger yet.
     When it gains one, copy events-ui/.agents/rules/logging.md.
     The rule there: always the LoggerService, never console.* in committed
     application code. -->

## Testing

<what runs here, and how — unit, e2e, visual. Reference `testing.md` for the
house rules rather than restating them.>

## Local conventions worth writing down

<anything a newcomer would otherwise have to discover by reading source. If it
took you more than five minutes to work out, it belongs here.>
