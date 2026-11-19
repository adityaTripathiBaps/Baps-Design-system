import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  forwardRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

/**
 * Per-brand PrimeNG `datepicker` design tokens, passed through the `dt`
 * input so a single instance can be Sampark on an otherwise-MyBKY page.
 *
 * Deliberately SMALL. The bulk of the calendar skin is already written as
 * CSS custom properties in styles/components/select/_select.scss and
 * _select-sampark.scss, and every rule there carries `!important` — a
 * design token that lands on the same property is dead on arrival. So `dt`
 * is used only for surface that skin does NOT touch:
 *
 *   date.rangeSelectedBackground / rangeSelectedColor  (range interior)
 *   group.borderColor / group.gap                      (multi-month)
 *
 * Both resolve to the same `--datepicker-*` custom properties that
 * _datepicker-range.scss declares, so there is one source of truth for the
 * value and the token/CSS split is invisible at the call site.
 *
 * Tokens checked against @primeuix/themes/types/datepicker and found
 * MISSING for what Figma specifies — these had to be CSS:
 *   - no token for the WEEKDAY row colour beyond `weekDay.*` typography
 *     that the base skin already overrides with !important
 *   - no token distinguishes an in-range day that is also today
 *   - no token paints the cell <td>; `date.rangeSelectedBackground` only
 *     reaches the inner <span>, which sits inside `date.padding`, so a
 *     token-only range renders as separated squares rather than Figma's
 *     continuous band
 */
const DATEPICKER_TOKENS = {
  mybky: {
    date: {
      rangeSelectedBackground: 'var(--datepicker-range-bg)',
      rangeSelectedColor: 'var(--datepicker-range-text)',
    },
    group: {
      borderColor: 'var(--datepicker-group-border, transparent)',
      gap: 'var(--datepicker-group-gap)',
    },
  },
  sampark: {
    date: {
      rangeSelectedBackground: 'var(--datepicker-range-bg)',
      rangeSelectedColor: 'var(--datepicker-range-text)',
    },
    group: {
      borderColor: 'transparent',
      gap: 'var(--datepicker-group-gap)',
    },
  },
} as const;

/**
 * baps-datepicker — date / date-range calendar field.
 *
 * Wraps PrimeNG DatePicker. Supports single date, `selectionMode="range"`
 * and `numberOfMonths` for the dual-month range layout
 * (Figma xc0L2xnREMgjyb5XcKyLIz nodes 17512:78298 / 17512:78300).
 *
 * ## Styling
 * The calendar skin lives in SCSS, split across two files:
 *   - styles/components/select/_select.scss (+ _select-sampark.scss) —
 *     panel, header, weekday row, day cells, month/year grid. Predates
 *     this component; it was written for a raw `p-datepicker`.
 *   - styles/components/datepicker/_datepicker-range.scss — range band,
 *     multi-month layout, and the Figma corrections the older skin
 *     predates.
 *
 * ## Brand scoping
 * `brand="sampark"` stamps TWO host classes:
 *   - `.baps-sampark`, the per-component convention used repo-wide;
 *   - `.baps-ds-sampark`, because the pre-existing calendar skin scopes
 *     itself to `:is(.baps-ds-sampark, baps-SELECT.baps-sampark)`. That
 *     `:is()` list cannot see a `baps-datepicker` host, and _select-sampark.scss
 *     is off-limits, so stamping the page-scope class on the host is what
 *     makes the existing skin reach this component. Nothing but a
 *     datepicker lives inside the host, so the wider scope has nothing
 *     else to affect.
 *
 * ## Accessibility
 * PrimeNG supplies: `role="grid"` on the date table with
 * `role="gridcell"` cells, `role="combobox"` + `aria-haspopup="dialog"` +
 * `aria-expanded` + `aria-controls` on the input, `aria-modal` on the
 * panel, an `aria-live="polite"` region announcing the visible month, a
 * per-day `aria-label` of the full date, and arrow/PageUp/PageDown/Home/
 * End/Enter/Escape keyboard navigation.
 *
 * What it does NOT supply, and this wrapper adds:
 *   - an accessible name — PrimeNG renders `aria-label` only if you pass
 *     one, so `ariaLabel` / `ariaLabelledBy` are surfaced here and
 *     `ariaLabel` falls back to `placeholder` (see `resolvedAriaLabel`).
 *     Without this a bare datepicker is an unnamed combobox.
 *
 * Still open (documented, not solved here — see the report):
 *   - the date grid has no `aria-label`/`aria-labelledby` of its own, so
 *     the month name is announced only through the live region;
 *   - in `selectionMode="range"` nothing announces "start"/"end", and
 *     interior days carry no `aria-selected`.
 */
@Component({
  selector: 'baps-datepicker',
  imports: [DatePicker, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-datepicker
      [autofocus]="autofocus"
      [(ngModel)]="value"
      [selectionMode]="selectionMode"
      [numberOfMonths]="numberOfMonths"
      [view]="view"
      [dateFormat]="dateFormat"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonlyInput]="readonlyInput"
      [inline]="inline"
      [showIcon]="showIcon"
      [iconDisplay]="iconDisplay"
      [showButtonBar]="showButtonBar"
      [timeOnly]="timeOnly"
      [showTime]="showTime"
      [hourFormat]="hourFormat"
      [hideOnDateTimeSelect]="hideOnDateTimeSelect"
      [keepInvalid]="keepInvalid"
      [showClear]="showClear"
      [showOtherMonths]="showOtherMonths"
      [selectOtherMonths]="selectOtherMonths"
      [minDate]="minDate!"
      [maxDate]="maxDate!"
      [defaultDate]="defaultDate!"
      [disabledDates]="disabledDates!"
      [disabledDays]="disabledDays!"
      [appendTo]="appendTo"
      [styleClass]="styleClass!"
      [inputStyleClass]="inputStyleClass!"
      [panelStyleClass]="resolvedPanelStyleClass"
      [inputId]="inputId!"
      [ariaLabel]="resolvedAriaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [dt]="dt"
      (onSelect)="onDateSelect($event)"
      (onShow)="shown.emit($event)"
      (onClose)="panelClose.emit($event)"
      (onClear)="onDateClear()"
    >
      <!-- pTemplate forwarding, as baps-select does: PrimeNG never sees a
           template projected through this host, so each slot is re-declared
           with the context DatePicker passes it. -->
      @if (tpl('inputicon'); as t) {
        <ng-template pTemplate="inputicon" let-clickCallBack="clickCallBack">
          <ng-container *ngTemplateOutlet="t; context: { clickCallBack: clickCallBack }" />
        </ng-template>
      }
      @if (tpl('date'); as t) {
        <ng-template pTemplate="date" let-date>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: date }" />
        </ng-template>
      }
      @if (tpl('disabledDate'); as t) {
        <ng-template pTemplate="disabledDate" let-date>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: date }" />
        </ng-template>
      }
      @if (tpl('decade'); as t) {
        <ng-template pTemplate="decade" let-years>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: years }" />
        </ng-template>
      }
      @if (tpl('header'); as t) {
        <ng-template pTemplate="header"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('footer'); as t) {
        <ng-template pTemplate="footer"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('triggericon'); as t) {
        <ng-template pTemplate="triggericon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      <ng-content></ng-content>
    </p-datepicker>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-datepicker {
      display: block;
    }

    /* An inline datepicker rendered NOTHING. Workaround for the same PrimeNG
       21.1.3 motion defect the accordion hit (traced in _accordion.scss):
       PrimeNG routes even the inline panel through
       <p-motion name="p-anchored-overlay">, which is born with an inline
       display: none and only sheds it in the enter transition. That transition
       never runs, so the panel stayed hidden and inline="true" produced an
       empty 1108x32 wrapper with no calendar in it.

       An inline datepicker has no trigger and nothing to open — its panel IS
       the component, so it should never have been behind an overlay animation
       in the first place. Keying off the panel's own
       p-datepicker-panel-inline class leaves the popup case completely alone,
       where the hide/show behaviour is wanted and works. display: contents
       drops the motion wrapper's box so the panel lays out in its place;
       !important is required because the display: none is an inline style.

       Remove when PrimeNG stops animating the inline panel, or fixes the
       transition. */
    baps-datepicker .p-motion:has(> .p-datepicker-panel-inline) {
      display: contents !important;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsDatepicker),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-ds-sampark]': "brand === 'sampark'",
    '[class.baps-datepicker-time-only]': 'timeOnly',
  },
})
export class BapsDatepicker implements ControlValueAccessor {
  /**
   * 'single' yields a Date, 'range' a [start, end] tuple (end is null
   * until the second click), 'multiple' an array of Dates.
   */
  @Input() selectionMode: 'single' | 'multiple' | 'range' = 'single';
  /** 2 gives the side-by-side dual-month range layout from Figma. */
  @Input() numberOfMonths = 1;
  @Input() view: 'date' | 'month' | 'year' = 'date';
  @Input() dateFormat?: string;
  @Input() placeholder?: string;
  @Input() disabled = false;
  /**
   * Focus on first render (PrimeNG autofocus). Default false. PrimeNG 21 leaves
   * a DOM autofocus attribute whenever its input is undefined, and the browser
   * then focuses that element on page load (spm: topbar / paginator selects).
   */
  @Input() autofocus = false;
  @Input() readonlyInput = false;
  /** Render the calendar in the page instead of an overlay. */
  @Input() inline = false;
  @Input() showIcon = false;
  @Input() iconDisplay: 'input' | 'button' = 'button';
  /** PrimeNG's Today / Clear footer. Hidden in the Figma frames. */
  @Input() showButtonBar = false;
  /** Time picker only, no calendar (PrimeNG timeOnly). Default off. */
  @Input() timeOnly = false;
  /** Adds the time picker under the calendar (PrimeNG showTime). Default off. */
  @Input() showTime = false;
  /** 12 or 24 hour clock for the time picker; PrimeNG default 24. */
  @Input() hourFormat: '12' | '24' = '24';
  /** Closes the panel once a date and time are picked; PrimeNG default on. */
  @Input() hideOnDateTimeSelect = true;
  /** Keeps a typed value PrimeNG cannot parse instead of clearing it; PrimeNG default off. */
  @Input() keepInvalid = false;

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  /** A consumer pTemplate of the given type (inputicon, date, header, footer, ...). */
  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }
  @Input() showClear = false;
  @Input() showOtherMonths = true;
  @Input() selectOtherMonths = false;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  /** Month the panel opens on while the field is empty (PrimeNG `defaultDate`). */
  @Input() defaultDate?: Date;
  @Input() disabledDates?: Date[];
  @Input() disabledDays?: number[];
  @Input() appendTo: any = 'body';
  @Input() styleClass?: string;
  @Input() inputStyleClass?: string;
  @Input() panelStyleClass?: string;
  @Input() inputId?: string;
  /** Accessible name for the input when there is no visible `<label for>`. */
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  @Output() dateSelect = new EventEmitter<Date>();
  @Output() panelClose = new EventEmitter<HTMLElement>();
  /** The panel opened (PrimeNG `onShow`), e.g. to adjust the inner picker on open. */
  @Output() shown = new EventEmitter<unknown>();

  /**
   * The inner PrimeNG DatePicker, for consumers that must reach its API (month/year
   * navigation, `currentMonth`) from a `shown` handler. Read-only; undefined until
   * the view initialises.
   */
  @ViewChild(DatePicker) readonly datePicker?: DatePicker;

  value: any = null;

  private onChangeFn: (value: any) => void = () => { /* empty */ };
  private onTouchedFn: () => void = () => { /* empty */ };

  /**
   * A datepicker input is a combobox; an unnamed combobox is the single
   * most common a11y failure on this control. PrimeNG passes `ariaLabel`
   * straight through and emits nothing when it is undefined, so fall back
   * to the placeholder, which is the only other user-visible description
   * the field is guaranteed to have.
   */
  get resolvedAriaLabel(): string | undefined {
    return this.ariaLabel ?? this.placeholder;
  }

  /**
   * The panel is portaled to `<body>` (PrimeNG's default `appendTo`), so it
   * escapes the `baps-datepicker.baps-sampark` HOST class — the host is not one
   * of its ancestors any more. Stamping the scope class onto the panel is what
   * survives the portal, identical to `baps-select.resolvedPanelStyleClass`.
   *
   * It does NOT escape the page-wide scope. An earlier version of this comment
   * said it escaped "any `.baps-ds-sampark` ancestor", and that is wrong:
   * `preview-head.html` puts the class on `<html>` and the Storybook decorator
   * puts it on `<body>`, and a panel appended to `<body>` is inside both. So the
   * page-wide case is already covered by the descendant half of
   * `_select-sampark.scss`'s `:is(.baps-ds-sampark, …)` scope. Measured, after
   * the wrong version of this comment led to a redundant fix being written and
   * reverted — see docs/portalled-panel-plan.md.
   *
   * What this getter actually buys is the PER-INSTANCE case, and there it is
   * load-bearing. That `:is()` block declares CSS custom properties which
   * inherit downward; with `brand="sampark"` they are declared on the host, and
   * the portaled panel is not below the host. Putting the class on the panel
   * makes the panel its own scope root, so the properties are declared there
   * instead. Measured on `datepicker--overlay` with the page scope OFF: the
   * panel resolves `--select-overlay-border` to `#bcb9b9` and a 4px radius.
   */
  get resolvedPanelStyleClass(): string {
    const consumer = this.panelStyleClass ?? '';
    if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
    return `${consumer} baps-ds-sampark`.trim();
  }

  get dt(): object {
    return DATEPICKER_TOKENS[this.brand];
  }

  onDateSelect(date: Date): void {
    // In range/multiple mode ngModel already holds the accumulated
    // value by the time onSelect fires; `date` is only the day clicked.
    this.onChangeFn(this.value);
    this.onTouchedFn();
    this.dateSelect.emit(date);
  }

  onDateClear(): void {
    this.value = null;
    this.onChangeFn(null);
    this.onTouchedFn();
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
