# Content & Voice Rules

Every string an agent writes into a component, a story, a docs page or an app
follows these. Copy is part of the design system, not an afterthought.

## Tone

Warm, clear, respectful. Never casual to the point of flippant, never stiff to
the point of corporate.

| Surface | Voice |
| --- | --- |
| Admin consoles | clear, direct, administrative — no softening flourishes |
| Member-facing mobile | warm, concise: "Aarti starts at 6:30 PM. Tap to set a reminder." |
| Donation flows | honest and specific — always name the actual fund |
| Satsang content | reverent, minimal. Let the content speak; never decorate with adjectives |

## Copy rules

- **Casing:** sentence case for UI labels — "New member", "Mark attendance".
  Not Title Case, not ALL CAPS. The `.eyebrow` class is the only ALL CAPS.
- **Buttons:** short imperatives — "Register", "Save", "Send receipt",
  "Join Satsang".
- **Dates:** `25 April 2026`, day-first. Never `04/25/2026`.
- **Times:** `6:30 PM` — 12-hour, space before AM/PM.
- **Currency:** `₹ 2,100` with Indian digit grouping (2-2-3). `$` and `£`
  supported for international centres.
- **Names:** full name in records, first name in greetings — "Good evening,
  Nilesh".
- **No emoji** in product UI. Icons carry the semantic load.
- **No exclamation marks**, except a rare confirmation ("Registration
  confirmed"). Never two.
- **Errors are concrete:** "This PAN already exists on record" — not
  "Something went wrong".
- Refer to leadership with the appropriate respectful style (Pramukh Swami
  Maharaj, Mahant Swami Maharaj). **Never first name only.**

## Examples

```
✅  Register for Yuva Sabha — 3 May, 4:00 PM
✅  You contributed ₹ 5,100 to Annadan Seva on 12 April 2026.

❌  Register Now!! 🎉
❌  Your Donation Has Been Received Successfully!
❌  Hey there! Welcome back 👋
```

## Accessible names are copy too

An `ariaLabel` is a user-facing string and follows the same rules. It should say
what the control does, not what it looks like:

```html
<!-- CORRECT -->
<button aria-label="Configure fields">
<baps-datepicker ariaLabel="Event date" />

<!-- WRONG -->
<button aria-label="sliders icon">
<baps-datepicker ariaLabel="datepicker" />
```

A control with a visible label does **not** need an `aria-label` repeating it —
that makes a screen reader say it twice. See `accessibility.md`.

## Documentation voice

MDX pages and code comments are written for the next engineer, in the same
register: plain, specific, and honest about what is not known.

- Lead with the rule, then the reason. A rule with its reason attached survives
  a refactor.
- **Record what was measured**, with the number: "measured 1 → 0 in a real
  browser", "107 nodes across 19 components".
- **Record what was ruled out.** That is what stops the same wrong fix being
  tried twice.
- Name a conflict between sources and say which you followed — never pick
  silently.
- Never leave an empty section in an MDX page. Omit the heading instead.
- "When not to use" is as valuable as "when to use", and is the section most
  often missing.
