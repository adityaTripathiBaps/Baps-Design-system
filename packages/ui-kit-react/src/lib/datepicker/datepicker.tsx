'use client';

import {
  createElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { BapsIcon } from '../icon/icon.js';
import {
  type BapsPortalTarget,
  useAnchoredOverlay,
} from '../internal/overlay.js';

export type BapsDatepickerBrand = 'mybky' | 'sampark';
export type BapsDatepickerView = 'date' | 'month' | 'year';
export type BapsDateRange = readonly [Date | null, Date | null];
export type BapsDatepickerValue = Date | readonly Date[] | BapsDateRange | null;

type NativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'defaultValue'
  | 'onChange'
  | 'onSelect'
>;

type AccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

type BaseProps = NativeProps &
  AccessibleName & {
    numberOfMonths?: number;
    view?: BapsDatepickerView;
    dateFormat?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    inline?: boolean;
    showIcon?: boolean;
    iconDisplay?: 'input' | 'button';
    showButtonBar?: boolean;
    showClear?: boolean;
    showOtherMonths?: boolean;
    selectOtherMonths?: boolean;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: readonly Date[];
    disabledDays?: readonly number[];
    appendTo?: BapsPortalTarget;
    inputId?: string;
    name?: string;
    required?: boolean;
    invalid?: boolean;
    brand?: BapsDatepickerBrand;
    inputClassName?: string;
    panelClassName?: string;
    onDateSelect?: (date: Date, event: SyntheticEvent<HTMLElement>) => void;
    onOpenChange?: (open: boolean) => void;
    onPanelClose?: () => void;
    inputRef?: Ref<HTMLInputElement>;
    ref?: Ref<HTMLElement>;
  };

type SingleProps = BaseProps & {
  selectionMode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (
    value: Date | null,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

type MultipleProps = BaseProps & {
  selectionMode: 'multiple';
  value?: readonly Date[];
  defaultValue?: readonly Date[];
  onValueChange?: (
    value: readonly Date[],
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

type RangeProps = BaseProps & {
  selectionMode: 'range';
  value?: BapsDateRange;
  defaultValue?: BapsDateRange;
  onValueChange?: (
    value: BapsDateRange,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

export type BapsDatepickerProps = SingleProps | MultipleProps | RangeProps;

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

const normaliseDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const addMonths = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const dateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const sameDay = (left: Date | null | undefined, right: Date): boolean =>
  !!left && dateKey(left) === dateKey(right);

const compareDays = (left: Date, right: Date): number =>
  normaliseDate(left).getTime() - normaliseDate(right).getTime();

const firstDate = (value: BapsDatepickerValue): Date | undefined => {
  if (value instanceof Date) return value;
  if (!Array.isArray(value)) return undefined;
  return value.find((item): item is Date => item instanceof Date);
};

const defaultForMode = (
  mode: 'single' | 'multiple' | 'range',
): BapsDatepickerValue =>
  mode === 'multiple' ? [] : mode === 'range' ? [null, null] : null;

/** Pure date-selection transition used by the runtime and interaction tests. */
export function getNextDatepickerValue(
  mode: 'single' | 'multiple' | 'range',
  current: BapsDatepickerValue,
  selected: Date,
): { value: BapsDatepickerValue; complete: boolean } {
  const date = normaliseDate(selected);
  if (mode === 'multiple') {
    const dates = Array.isArray(current)
      ? current.filter((item): item is Date => item instanceof Date)
      : [];
    return {
      value: dates.some((item) => sameDay(item, date))
        ? dates.filter((item) => !sameDay(item, date))
        : [...dates, date],
      complete: false,
    };
  }
  if (mode === 'range') {
    const range = Array.isArray(current) ? current : [null, null];
    const start = range[0] instanceof Date ? range[0] : null;
    const end = range[1] instanceof Date ? range[1] : null;
    if (!start || end) return { value: [date, null], complete: false };
    return {
      value: compareDays(date, start) < 0 ? [date, start] : [start, date],
      complete: true,
    };
  }
  return { value: date, complete: true };
}

/** Prime-compatible display formatting for the documented date formats. */
export function formatBapsDate(date: Date, pattern = 'mm/dd/yy'): string {
  const values: Record<string, string> = {
    dd: String(date.getDate()).padStart(2, '0'),
    d: String(date.getDate()),
    mm: String(date.getMonth() + 1).padStart(2, '0'),
    m: String(date.getMonth() + 1),
    yy: String(date.getFullYear()),
    y: String(date.getFullYear()).slice(-2),
  };
  return pattern.replace(/dd|mm|yy|d|m|y/g, (token) => values[token] ?? token);
}

function displayValue(value: BapsDatepickerValue, pattern?: string): string {
  if (value instanceof Date) return formatBapsDate(value, pattern);
  if (!Array.isArray(value)) return '';
  const dates = value.filter((item): item is Date => item instanceof Date);
  if (dates.length === 0) return '';
  const separator = value.length === 2 ? ' - ' : ', ';
  return dates.map((date) => formatBapsDate(date, pattern)).join(separator);
}

function parseInputDate(value: string): Date | null {
  const parts = value.trim().match(/^(\d{1,4})\D(\d{1,2})\D(\d{1,4})$/);
  if (!parts) return null;
  const [, first = '', second = '', third = ''] = parts;
  const yearFirst = first.length === 4;
  const year = Number(
    yearFirst ? first : third.length === 2 ? `20${third}` : third,
  );
  const month = Number(yearFirst ? second : first);
  const day = Number(yearFirst ? third : second);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
    ? parsed
    : null;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export function BapsDatepicker({
  selectionMode = 'single',
  value: controlledValue,
  defaultValue,
  onValueChange,
  numberOfMonths = 1,
  view = 'date',
  dateFormat,
  placeholder,
  disabled = false,
  readOnly = false,
  inline = false,
  showIcon = false,
  iconDisplay = 'button',
  showButtonBar = false,
  showClear = false,
  showOtherMonths = true,
  selectOtherMonths = false,
  minDate,
  maxDate,
  disabledDates = [],
  disabledDays = [],
  appendTo = 'body',
  inputId,
  name,
  required = false,
  invalid = false,
  brand = 'mybky',
  inputClassName,
  panelClassName,
  onDateSelect,
  onOpenChange,
  onPanelClose,
  inputRef,
  ariaLabel,
  ariaLabelledBy,
  className,
  ref,
  ...nativeProps
}: BapsDatepickerProps): ReactElement {
  const generatedId = useId();
  const resolvedInputId = inputId ?? `${generatedId}-input`;
  const panelId = `${generatedId}-panel`;
  const initialValue = defaultValue ?? defaultForMode(selectionMode);
  const [internalValue, setInternalValue] =
    useState<BapsDatepickerValue>(initialValue);
  const value =
    controlledValue === undefined
      ? internalValue
      : (controlledValue as BapsDatepickerValue);
  const initialDate = firstDate(value) ?? normaliseDate(new Date());
  const [viewDate, setViewDate] = useState(() => startOfMonth(initialDate));
  const [displayView, setDisplayView] = useState<BapsDatepickerView>(view);
  const [focusedDate, setFocusedDate] = useState(() => initialDate);
  const [open, setOpen] = useState(inline);
  const [inputFocused, setInputFocused] = useState(false);
  const [draft, setDraft] = useState(() => displayValue(value, dateFormat));
  const triggerRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const overlay = useAnchoredOverlay({
    open: open && !inline,
    setOpen,
    triggerRef,
    overlayRef: panelRef,
    appendTo,
    onOpenChange: (next) => {
      onOpenChange?.(next);
      if (!next) onPanelClose?.();
    },
  });

  useEffect(() => {
    if (!inputFocused) setDraft(displayValue(value, dateFormat));
  }, [dateFormat, inputFocused, value]);

  useEffect(() => {
    if (!(open || inline)) return;
    const target = panelRef.current?.querySelector<HTMLButtonElement>(
      `[data-date="${dateKey(focusedDate)}"]`,
    );
    target?.focus();
  }, [focusedDate, inline, open, viewDate]);

  const isDisabledDate = (date: Date): boolean =>
    (!!minDate && compareDays(date, minDate) < 0) ||
    (!!maxDate && compareDays(date, maxDate) > 0) ||
    disabledDays.includes(date.getDay()) ||
    disabledDates.some((item) => sameDay(item, date));

  const isSelected = (date: Date): boolean => {
    if (value instanceof Date) return sameDay(value, date);
    if (!Array.isArray(value)) return false;
    return value.some((item) => item instanceof Date && sameDay(item, date));
  };

  const isRangeMiddle = (date: Date): boolean => {
    if (selectionMode !== 'range' || !Array.isArray(value)) return false;
    const start = value[0];
    const end = value[1];
    return (
      start instanceof Date &&
      end instanceof Date &&
      compareDays(date, start) > 0 &&
      compareDays(date, end) < 0
    );
  };

  const emitValue = (
    next: BapsDatepickerValue,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (controlledValue === undefined) setInternalValue(next);
    const callback = onValueChange as
      | ((
          nextValue: BapsDatepickerValue,
          sourceEvent: SyntheticEvent<HTMLElement>,
        ) => void)
      | undefined;
    callback?.(next, event);
  };

  const closePanel = (restoreFocus = false) => {
    if (inline) return;
    overlay.dismiss(restoreFocus);
  };

  const openPanel = () => {
    if (disabled || inline) return;
    setOpen(true);
    onOpenChange?.(true);
    const selected = firstDate(value);
    if (selected) {
      setViewDate(startOfMonth(selected));
      setFocusedDate(selected);
    }
  };

  const selectDate = (selected: Date, event: SyntheticEvent<HTMLElement>) => {
    if (disabled || isDisabledDate(selected)) return;
    const date = normaliseDate(selected);
    const { value: next, complete } = getNextDatepickerValue(
      selectionMode,
      value,
      date,
    );
    emitValue(next, event);
    setDraft(displayValue(next, dateFormat));
    setFocusedDate(date);
    onDateSelect?.(date, event);
    if (complete) closePanel();
  };

  const clearValue = (event: SyntheticEvent<HTMLElement>) => {
    const next = defaultForMode(selectionMode);
    emitValue(next, event);
    setDraft('');
  };

  const moveFocus = (date: Date) => {
    if (isDisabledDate(date)) return;
    setFocusedDate(date);
    const monthStart = startOfMonth(date);
    const lastVisibleMonth = addMonths(
      viewDate,
      Math.max(1, numberOfMonths) - 1,
    );
    if (compareDays(monthStart, viewDate) < 0) setViewDate(monthStart);
    else if (compareDays(monthStart, lastVisibleMonth) > 0) {
      setViewDate(addMonths(monthStart, 1 - Math.max(1, numberOfMonths)));
    }
  };

  const handleDayKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    date: Date,
  ) => {
    let next: Date | undefined;
    if (event.key === 'ArrowLeft') next = addDays(date, -1);
    else if (event.key === 'ArrowRight') next = addDays(date, 1);
    else if (event.key === 'ArrowUp') next = addDays(date, -7);
    else if (event.key === 'ArrowDown') next = addDays(date, 7);
    else if (event.key === 'Home') next = addDays(date, -date.getDay());
    else if (event.key === 'End') next = addDays(date, 6 - date.getDay());
    else if (event.key === 'PageUp') next = addMonths(date, -1);
    else if (event.key === 'PageDown') next = addMonths(date, 1);
    else if (event.key === 'Escape') {
      event.preventDefault();
      closePanel(true);
      return;
    }
    if (next) {
      event.preventDefault();
      moveFocus(next);
    }
  };

  const monthPanels = useMemo(
    () =>
      Array.from({ length: Math.max(1, numberOfMonths) }, (_, index) =>
        addMonths(viewDate, index),
      ),
    [numberOfMonths, viewDate],
  );

  const renderDatePanel = (month: Date, monthIndex: number): ReactElement => {
    const gridStart = addDays(month, -month.getDay());
    const days = Array.from({ length: 42 }, (_, index) =>
      addDays(gridStart, index),
    );
    return (
      <div className="p-datepicker-group" key={dateKey(month)}>
        <div className="p-datepicker-header">
          <button
            type="button"
            className="p-datepicker-prev-button"
            aria-label="Previous month"
            hidden={monthIndex !== 0}
            onClick={() => setViewDate((current) => addMonths(current, -1))}
          >
            <BapsIcon name="angle-left" size="inherit" />
          </button>
          <div className="p-datepicker-title" aria-live="polite">
            <button
              type="button"
              className="p-datepicker-select-month"
              onClick={() => setDisplayView('month')}
            >
              {MONTHS[month.getMonth()]}
            </button>
            <button
              type="button"
              className="p-datepicker-select-year"
              onClick={() => setDisplayView('year')}
            >
              {month.getFullYear()}
            </button>
          </div>
          <button
            type="button"
            className="p-datepicker-next-button"
            aria-label="Next month"
            hidden={monthIndex !== monthPanels.length - 1}
            onClick={() => setViewDate((current) => addMonths(current, 1))}
          >
            <BapsIcon name="angle-right" size="inherit" />
          </button>
        </div>
        <table
          className="p-datepicker-calendar"
          role="grid"
          aria-label={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
        >
          <thead>
            <tr>
              {WEEKDAYS.map((weekday) => (
                <th scope="col" key={weekday}>
                  <span className="p-datepicker-weekday">{weekday}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, row) => (
              <tr key={row}>
                {days.slice(row * 7, row * 7 + 7).map((date) => {
                  const otherMonth = date.getMonth() !== month.getMonth();
                  const unavailable =
                    isDisabledDate(date) || (otherMonth && !selectOtherMonths);
                  const selected = isSelected(date);
                  const rangeMiddle = isRangeMiddle(date);
                  const today = sameDay(new Date(), date);
                  return (
                    <td
                      className={joinClassNames(
                        'p-datepicker-day-cell',
                        otherMonth && 'p-datepicker-other-month',
                      )}
                      role="gridcell"
                      aria-selected={selected || rangeMiddle}
                      key={dateKey(date)}
                    >
                      {otherMonth && !showOtherMonths ? null : (
                        <button
                          type="button"
                          className={joinClassNames(
                            'p-datepicker-day',
                            otherMonth && 'p-datepicker-other-month',
                            selected && 'p-datepicker-day-selected',
                            rangeMiddle && 'p-datepicker-day-selected-range',
                            today && 'p-datepicker-today',
                            unavailable && 'p-disabled',
                          )}
                          data-date={dateKey(date)}
                          disabled={unavailable}
                          tabIndex={sameDay(focusedDate, date) ? 0 : -1}
                          aria-label={date.toLocaleDateString(undefined, {
                            dateStyle: 'full',
                          })}
                          aria-current={today ? 'date' : undefined}
                          onClick={(event) => selectDate(date, event)}
                          onKeyDown={(event) => handleDayKeyDown(event, date)}
                        >
                          {date.getDate()}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonthView = (): ReactElement => (
    <div className="p-datepicker-group">
      <div className="p-datepicker-header">
        <button
          type="button"
          className="p-datepicker-prev-button"
          aria-label="Previous year"
          onClick={() => setViewDate((current) => addMonths(current, -12))}
        >
          <BapsIcon name="angle-left" size="inherit" />
        </button>
        <div className="p-datepicker-title">
          <button
            type="button"
            className="p-datepicker-select-year"
            onClick={() => setDisplayView('year')}
          >
            {viewDate.getFullYear()}
          </button>
        </div>
        <button
          type="button"
          className="p-datepicker-next-button"
          aria-label="Next year"
          onClick={() => setViewDate((current) => addMonths(current, 12))}
        >
          <BapsIcon name="angle-right" size="inherit" />
        </button>
      </div>
      <div
        className="p-datepicker-month-view"
        role="grid"
        aria-label="Choose month"
      >
        {MONTHS.map((month, index) => {
          const date = new Date(viewDate.getFullYear(), index, 1);
          const selected =
            firstDate(value)?.getMonth() === index &&
            firstDate(value)?.getFullYear() === viewDate.getFullYear();
          return (
            <button
              type="button"
              role="gridcell"
              aria-selected={selected}
              className={joinClassNames(
                'p-datepicker-month',
                selected && 'p-datepicker-month-selected',
              )}
              key={month}
              onClick={(event) => {
                setViewDate(date);
                if (view === 'month') selectDate(date, event);
                else setDisplayView('date');
              }}
            >
              {month.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderYearView = (): ReactElement => {
    const start = Math.floor(viewDate.getFullYear() / 12) * 12;
    return (
      <div className="p-datepicker-group">
        <div className="p-datepicker-header">
          <button
            type="button"
            className="p-datepicker-prev-button"
            aria-label="Previous years"
            onClick={() => setViewDate((current) => addMonths(current, -144))}
          >
            <BapsIcon name="angle-left" size="inherit" />
          </button>
          <div className="p-datepicker-title" aria-live="polite">
            {start} - {start + 11}
          </div>
          <button
            type="button"
            className="p-datepicker-next-button"
            aria-label="Next years"
            onClick={() => setViewDate((current) => addMonths(current, 144))}
          >
            <BapsIcon name="angle-right" size="inherit" />
          </button>
        </div>
        <div
          className="p-datepicker-year-view"
          role="grid"
          aria-label="Choose year"
        >
          {Array.from({ length: 12 }, (_, index) => start + index).map(
            (year) => {
              const selected = firstDate(value)?.getFullYear() === year;
              return (
                <button
                  type="button"
                  role="gridcell"
                  aria-selected={selected}
                  className={joinClassNames(
                    'p-datepicker-year',
                    selected && 'p-datepicker-year-selected',
                  )}
                  key={year}
                  onClick={(event) => {
                    const date = new Date(year, viewDate.getMonth(), 1);
                    setViewDate(startOfMonth(date));
                    if (view === 'year') selectDate(date, event);
                    else setDisplayView(view === 'month' ? 'month' : 'date');
                  }}
                >
                  {year}
                </button>
              );
            },
          )}
        </div>
      </div>
    );
  };

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-label="Choose date"
      className={joinClassNames(
        'p-datepicker-panel p-component',
        inline && 'p-datepicker-panel-inline',
        brand === 'sampark' && 'baps-ds-sampark',
        panelClassName,
      )}
      style={inline ? undefined : overlay.positionStyle}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closePanel(true);
        }
      }}
    >
      <div className="p-datepicker-calendar-container">
        {displayView === 'date'
          ? monthPanels.map(renderDatePanel)
          : displayView === 'month'
            ? renderMonthView()
            : renderYearView()}
      </div>
      {showButtonBar && (
        <div className="p-datepicker-buttonbar">
          <button
            type="button"
            className="p-datepicker-today-button"
            onClick={(event) => selectDate(normaliseDate(new Date()), event)}
          >
            Today
          </button>
          <button
            type="button"
            className="p-datepicker-clear-button"
            onClick={clearValue}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.currentTarget.value);
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    setInputFocused(false);
    if (selectionMode !== 'single' || readOnly) return;
    if (!draft.trim()) {
      clearValue(event);
      return;
    }
    const parsed = parseInputDate(draft);
    if (parsed && !isDisabledDate(parsed)) selectDate(parsed, event);
    else setDraft(displayValue(value, dateFormat));
  };

  const trigger = inline ? null : (
    <div className="p-datepicker-input-group">
      {iconDisplay === 'input' && showIcon && (
        <span className="p-datepicker-input-icon" aria-hidden="true">
          <BapsIcon name="calendar" size="inherit" />
        </span>
      )}
      <input
        ref={(node) => {
          triggerRef.current = node;
          assignRef(inputRef, node);
        }}
        id={resolvedInputId}
        name={name}
        type="text"
        className={joinClassNames(
          'p-inputtext p-component p-datepicker-input',
          invalid && 'p-invalid',
          inputClassName,
        )}
        value={draft}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly || selectionMode !== 'single'}
        required={required}
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        onChange={handleInputChange}
        onFocus={() => setInputFocused(true)}
        onBlur={handleInputBlur}
        onClick={openPanel}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter') {
            event.preventDefault();
            openPanel();
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            closePanel(true);
          }
        }}
      />
      {showClear && displayValue(value, dateFormat) && !disabled && (
        <button
          type="button"
          className="p-datepicker-clear-icon baps-selection-clear"
          aria-label="Clear date"
          onClick={clearValue}
        >
          <BapsIcon name="close-circle" size="inherit" />
        </button>
      )}
      {showIcon && iconDisplay === 'button' && (
        <button
          type="button"
          className="p-datepicker-dropdown"
          aria-label={open ? 'Close calendar' : 'Open calendar'}
          aria-controls={panelId}
          aria-expanded={open}
          disabled={disabled}
          onClick={() => (open ? closePanel() : openPanel())}
        >
          <BapsIcon name="calendar" size="inherit" />
        </button>
      )}
    </div>
  );

  const root = createElement(
    'p-datepicker',
    {
      className: joinClassNames(
        'p-datepicker p-component p-inputwrapper',
        open && !inline && 'p-inputwrapper-focus',
        disabled && 'p-disabled',
      ),
    },
    trigger,
    inline ? panel : null,
  );

  return createElement(
    'baps-datepicker',
    {
      ...nativeProps,
      ref,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark baps-ds-sampark',
        className,
      ),
    },
    root,
    !inline && open && overlay.portalTarget
      ? createPortal(panel, overlay.portalTarget)
      : null,
  );
}

BapsDatepicker.displayName = 'BapsDatepicker';
