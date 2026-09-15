import { Component, ElementRef, Input, ViewEncapsulation, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { SelectButton, SelectButtonChangeEvent } from 'primeng/selectbutton';

/**
 * SelectButton's entire token surface is root.borderRadius and
 * root.invalidBorderColor — two properties, neither of which describes the
 * group box. PrimeNG spends borderRadius on the FIRST and LAST pill's outer
 * corners, so it carries the pill's 4px and the box's own 6px stays CSS.
 *
 * Held as a module constant, not built in the getter: [dt] is re-read every
 * change detection, and a fresh object each time makes PrimeNG regenerate the
 * scoped stylesheet on every cycle. Not brand-conditional — a pill's radius
 * is the same in both skins.
 */
const SELECTBUTTON_TOKENS = { root: { borderRadius: '4px' } };

/**
 * baps-segmented — boxed pill group for picking one option (or several).
 *
 * Figma calls it "Web Tabs Group" (nodes 17512:78179 / 17512:77924 /
 * 17512:78134) but it is NOT the tab strip. The repo already has bapsTabs, a
 * p-tabs underline directive; this is a different control — a bordered box
 * that holds equal-width pills, with the selected pill outlined in the brand
 * accent.
 *
 * ## Why the weekday chip is NOT a second component
 * Figma node 17512:82933 ("Component 116") is a 34x32 "Su" chip with
 * Active x Hover states, used in 17512:82910 / 17512:78134 as a row of seven.
 * The audit suspected it was the same control in a multi-select mode. It is:
 *
 *   · Same value set — Mono/0 surface, Mono/Borders ring, Primary/60 accent,
 *     Mono/100 label, 4px radius, 14px Inter. get_variable_defs returns an
 *     identical palette for 17512:82933 and 17512:78179.
 *   · Same job — "pick from a fixed, always-visible set of short labels".
 *   · The only real differences track the CARDINALITY, not the control:
 *     a single-select group is wrapped in one shared box (2px pad, 2px gap,
 *     6px radius) and marks its winner with a white lift (S Drop Shadow);
 *     a multi-select row cannot use a shared box (there is no single winner
 *     to lift), so each chip carries its own 1px ring and the active ones
 *     tint to Primary/0 instead.
 *
 * So the skin difference is a CONSEQUENCE of single-vs-multi, which means one
 * input — multiple — discriminates both, and a second component would be the
 * same 60 lines with two constants swapped. Splitting them would also split
 * the keyboard handling below, which is the part actually worth maintaining.
 *
 * If a boxed MULTI-select or a chip-row SINGLE-select ever ships, that is the
 * moment to add a separate variant input — not before.
 *
 * ## Figma values
 * Single (17512:78179, 344x32): container 32px tall, 1px Mono/Borders
 * (#e1e0e0) on Mono/0, 6px radius, 2px padding, 2px gap. Pills flex to equal
 * width (112px at three across, 169px at two), 28px tall, 4px radius, 14px.
 * Selected: Mono/0 fill, 1.5px Primary/60 (#c96868) ring, S Drop Shadow,
 * Semi Bold. Unselected hover: Mono/10% Black (which is really 2% — see the
 * color.sampark.mono.alpha2 token comment).
 *
 * Multiple (17512:82938, 34x32): 8px gap, no container. Chip 32px tall,
 * min 34px wide, 1px Mono/Borders on Mono/0, 4px radius. Active: Primary/0
 * (#fbf4f4) fill, 1px Primary/60 ring, Primary/60 Semi Bold label.
 *
 * ## Accessibility
 * PrimeNG SelectButton already gives: role="group" on the root, an
 * aria-labelledby passthrough, and one role="button" + aria-pressed per item.
 * Every enabled item is tabbable, which is the correct and self-consistent
 * pattern for a group of toggle buttons.
 *
 * It does NOT give arrow-key navigation. SelectButton ships a
 * changeTabIndexes() helper for exactly that, but nothing in the component
 * ever calls it (primeng 21.2.0), and ToggleButton's own keydown handler
 * covers Enter and Space only. onKeyDown below adds Arrow/Home/End roving so
 * the group behaves like the segmented control it looks like.
 *
 * It also has no aria-label input — only aria-labelledby — so an unlabelled
 * group announces as a bare "group". ariaLabel below fills that in.
 *
 * NOT added: a roving tabindex (one tab stop for the whole group).
 * ToggleButton hardcodes [attr.tabindex] to 0 for every enabled item and
 * SelectButton never forwards its own tabindex input to the items, so it
 * cannot be changed from outside without fighting an OnPush host binding.
 * With role="button"/aria-pressed items this is not a defect — it is how a
 * button bar is expected to behave — so the arrow keys are additive.
 */
@Component({
  selector: 'baps-segmented',
  imports: [SelectButton, FormsModule],
  template: `
    <p-selectbutton
      [options]="options"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [multiple]="multiple"
      [allowEmpty]="allowEmpty"
      [disabled]="disabled"
      [ariaLabelledBy]="ariaLabelledBy"
      [attr.aria-label]="ariaLabel"
      [dt]="dt"
      [(ngModel)]="value"
      (onChange)="onSelectionChange($event)"
    ></p-selectbutton>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Brand-neutral indirection. Every PrimeNG token below is written once
       against these five names; only the names get re-pointed per brand, so
       the geometry never has to be repeated. */
    baps-segmented {
      --baps-seg-surface: var(--color-mybky-mono-0, #ffffff);
      --baps-seg-border: var(--color-mybky-border-default, #e4ecf1);
      --baps-seg-accent: var(--color-mybky-primary-default, #5f78b8);
      --baps-seg-accent-tint: var(--color-mybky-blue-50, #eef0f8);
      --baps-seg-text: var(--color-mybky-text-primary, #181b1d);
      --baps-seg-text-disabled: var(--color-mybky-mono-400, #b6b6af);
    }

    :is(baps-segmented.baps-sampark, .baps-ds-sampark baps-segmented) {
      --baps-seg-surface: var(--color-sampark-mono-0, #ffffff);
      --baps-seg-border: var(--color-sampark-mono-borders, #e1e0e0);
      --baps-seg-accent: var(--color-sampark-primary-60, #c96868);
      --baps-seg-accent-tint: var(--color-sampark-primary-0, #fbf4f4);
      --baps-seg-text: var(--color-sampark-mono-100, #151414);
      --baps-seg-text-disabled: var(--color-sampark-mono-40, #bcb9b9);
    }

    /* ── The pill skin, entirely through PrimeNG's togglebutton tokens ──
       SelectButton renders one p-togglebutton per option, so the pills read
       togglebutton.* — NOT selectbutton.*, whose whole token surface is two
       properties (borderRadius, invalidBorderColor). Those two go through the
       dt input; everything per-pill is declared here as the CSS custom
       properties PrimeNG's own stylesheet resolves, because a dt on
       p-selectbutton can only emit selectbutton-namespaced variables. */
    baps-segmented {
      display: inline-block;

      --p-togglebutton-border-radius: 4px;
      --p-togglebutton-padding: 0;
      --p-togglebutton-gap: 4px;
      --p-togglebutton-font-weight: 500;
      --p-togglebutton-transition-duration: 150ms;

      --p-togglebutton-background: transparent;
      --p-togglebutton-border-color: transparent;
      --p-togglebutton-color: var(--baps-seg-text);

      --p-togglebutton-hover-background: var(--color-sampark-mono-alpha2, rgba(21, 20, 20, 0.02));
      --p-togglebutton-hover-color: var(--baps-seg-text);

      --p-togglebutton-checked-background: var(--baps-seg-surface);
      --p-togglebutton-checked-border-color: var(--baps-seg-accent);
      --p-togglebutton-checked-color: var(--baps-seg-text);

      /* The lift under the selected pill. Figma "S Drop Shadow" is already in
         the ramp as shadow.sampark.s — promoted there by the slider, and the
         same pair MyBKY uses for its switch thumb, so it is brand-neutral. */
      --p-togglebutton-content-padding: 0 8px;
      --p-togglebutton-content-border-radius: 4px;
      --p-togglebutton-content-checked-background: transparent;
      --p-togglebutton-content-checked-shadow: var(
        --shadow-sampark-s,
        0 2px 4px rgba(16, 24, 40, 0.06),
        0 1px 4px rgba(16, 24, 40, 0.12)
      );

      --p-togglebutton-disabled-background: transparent;
      --p-togglebutton-disabled-border-color: transparent;
      --p-togglebutton-disabled-color: var(--baps-seg-text-disabled);

      --p-togglebutton-focus-ring-width: 2px;
      --p-togglebutton-focus-ring-style: solid;
      --p-togglebutton-focus-ring-color: var(--baps-seg-accent);
      --p-togglebutton-focus-ring-offset: -1px;
      --p-togglebutton-focus-ring-shadow: none;
    }

    /* ── Container ──
       selectbutton.border.radius is the ONLY geometry token SelectButton
       exposes, and PrimeNG spends it on the FIRST/LAST pill corners, not on
       the group box. It is set to the pill's 4px through dt; the box's own
       32px height, 2px padding, 2px gap, fill and 1px ring have no token at
       all and can only be CSS. */
    baps-segmented .p-selectbutton {
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      padding: 2px;
      gap: 2px;
      border: 1px solid var(--baps-seg-border);
      border-radius: 6px;
      background: var(--baps-seg-surface);
    }

    /* Equal-width pills. PrimeNG only applies flex:1 under .p-selectbutton-fluid,
       which also forces width:100% on the root — the Figma group is a fixed
       344px, so the two cannot be combined and the flex is restated here.
       font-size is hardcoded to 1rem in togglebutton's base CSS with no
       togglebutton.font.size token to override it, hence the 14px below.
       Base also gives pills inside a selectbutton border-width:1px 1px 1px 0
       to collapse shared edges; these pills are separated by a 2px gap and
       each needs its own ring. */
    baps-segmented .p-selectbutton .p-togglebutton {
      box-sizing: border-box;
      flex: 1 0 0;
      min-width: 28px;
      height: 28px;
      border-width: 1px;
      font-size: 0.875rem;
      line-height: 1.3;
      /* A pill label never wraps. The pill is 28px and the pills share the row
         via flex: 1 0 0, so any label longer than its share breaks — "Ad-hoc"
         split at its hyphen into a 36px two-line label inside a 28px box.
         PrimeNG leaves white-space at its initial "normal". Overflow is
         clipped rather than wrapped: a too-long label is a content problem,
         and a silently taller control is worse than a visibly truncated one. */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* The label span is the element that actually holds the text, and it is a
       flex child of the pill — it needs the same treatment or it re-expands. */
    baps-segmented .p-selectbutton .p-togglebutton .p-togglebutton-label {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Figma weights the selected label up to Semi Bold and thickens its ring
       to 1.5px. togglebutton.font.weight is a single token with no checked
       counterpart, and border WIDTH has no token at any state. */
    baps-segmented .p-selectbutton .p-togglebutton.p-togglebutton-checked {
      border-width: 1.5px;
      font-weight: 600;
    }

    /* ── multiple: the weekday-chip row (17512:82938) ──
       No shared box — with several winners there is nothing to lift — so each
       chip carries its own ring and the active ones tint instead of glowing.
       Everything else is inherited from the single-select block above. */
    baps-segmented.baps-segmented-multiple {
      --p-togglebutton-background: var(--baps-seg-surface);
      --p-togglebutton-border-color: var(--baps-seg-border);
      --p-togglebutton-checked-background: var(--baps-seg-accent-tint);
      --p-togglebutton-checked-color: var(--baps-seg-accent);
      --p-togglebutton-content-checked-shadow: none;
      --p-togglebutton-disabled-border-color: var(--baps-seg-border);
    }

    baps-segmented.baps-segmented-multiple .p-selectbutton {
      height: auto;
      padding: 0;
      gap: 8px;
      border: 0;
      border-radius: 0;
      background: transparent;
      flex-wrap: wrap;
    }

    baps-segmented.baps-segmented-multiple .p-selectbutton .p-togglebutton {
      flex: 0 0 auto;
      min-width: 34px;
      height: 32px;
    }

    /* Chips stay at a 1px ring when active — only the boxed pill thickens. */
    baps-segmented.baps-segmented-multiple .p-selectbutton .p-togglebutton.p-togglebutton-checked {
      border-width: 1px;
    }

    /* ── Dark mode ── */
    .baps-dark baps-segmented {
      --baps-seg-surface: var(--color-mybky-mono-800, #2b2f32);
      --baps-seg-border: var(--color-mybky-mono-600, #565652);
      --baps-seg-text: var(--color-mybky-mono-50, #f8fafb);
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsSegmented),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-segmented-multiple]': 'multiple',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class BapsSegmented implements ControlValueAccessor {
  /** Options to render as pills. Plain strings, or objects with optionLabel/optionValue. */
  @Input() options: unknown[] = [];
  /** Property holding the visible label when options are objects. */
  @Input() optionLabel?: string;
  /** Property holding the bound value when options are objects. */
  @Input() optionValue?: string;
  /** Property marking an individual option disabled. */
  @Input() optionDisabled?: string;
  /**
   * Multi-select. Switches the value to an array AND to the weekday-chip skin
   * — see the class docs for why those are one input and not two.
   */
  @Input() multiple = false;
  /** Allow clicking the selected pill to clear the group. */
  @Input() allowEmpty = true;
  @Input() disabled = false;
  /**
   * Accessible name for the group. PrimeNG only offers aria-labelledby; an
   * unlabelled group otherwise announces as a bare "group".
   */
  @Input() ariaLabel?: string;
  /** Id of an existing element that labels the group. */
  @Input() ariaLabelledBy?: string;
  /** Visual skin. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  value: unknown = null;

  private readonly host = inject(ElementRef<HTMLElement>);
  private onChange: (value: unknown) => void = () => { /* empty */ };
  private onTouched: () => void = () => { /* empty */ };

  /** See SELECTBUTTON_TOKENS. */
  get dt(): object {
    return SELECTBUTTON_TOKENS;
  }

  onSelectionChange(event: SelectButtonChangeEvent): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  /**
   * Arrow / Home / End roving. PrimeNG has the helper for this
   * (SelectButton.changeTabIndexes) but never wires it up, and ToggleButton's
   * own keydown covers Enter and Space only, so without this the group is a
   * plain tab-through list of buttons.
   *
   * Moves focus only — it does not select. With aria-pressed items, selection
   * stays an explicit Enter/Space, which is what a group of toggle buttons
   * should do; auto-select on arrow belongs to a real radiogroup.
   */
  onKeyDown(event: KeyboardEvent): void {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step && event.key !== 'Home' && event.key !== 'End') return;

    const items = Array.from(
      (this.host.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.p-togglebutton:not(.p-disabled)',
      ),
    );
    if (items.length === 0) return;

    let next: number;
    if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = items.length - 1;
    } else {
      const current = items.findIndex((el) => el === document.activeElement);
      if (current === -1) return;
      // Wrap, matching changeTabIndexes' intent and the APG default.
      next = (current + step + items.length) % items.length;
    }

    items[next].focus();
    event.preventDefault();
  }

  writeValue(value: unknown): void {
    this.value = value;
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
