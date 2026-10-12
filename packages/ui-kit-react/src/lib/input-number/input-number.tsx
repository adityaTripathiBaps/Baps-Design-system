'use client';

import {
  createElement,
  type ChangeEvent,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  useState,
} from 'react';

import { BapsIcon } from '../icon/icon.js';

export type BapsInputNumberBrand = 'mybky' | 'sampark';
export type BapsInputNumberSize = 'small' | 'large';
export type BapsInputNumberMode = 'decimal' | 'currency';

type BapsInputNumberNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'defaultValue' | 'onInput'
>;

export type BapsInputNumberProps = BapsInputNumberNativeProps & {
  value?: number | null;
  defaultValue?: number | null;
  showButtons?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  maxFractionDigits?: number;
  inputStyleClass?: string;
  styleClass?: string;
  useGrouping?: boolean;
  mode?: BapsInputNumberMode;
  placeholder?: string;
  disabled?: boolean;
  size?: BapsInputNumberSize;
  brand?: BapsInputNumberBrand;
  onInput?: (detail: {
    originalEvent:
      ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>;
    value: number | null;
    formattedValue: string;
  }) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

function normaliseValue(
  value: number | null,
  min: number | undefined,
  max: number | undefined,
  maxFractionDigits: number | undefined,
): number | null {
  if (value == null || Number.isNaN(value)) return null;

  let next = value;
  if (min != null) next = Math.max(min, next);
  if (max != null) next = Math.min(max, next);
  if (maxFractionDigits != null) {
    const factor = 10 ** maxFractionDigits;
    next = Math.round((next + Number.EPSILON) * factor) / factor;
  }
  return next;
}

function formatValue(
  value: number | null,
  useGrouping: boolean,
  maxFractionDigits: number | undefined,
): string {
  if (value == null) return '';
  return new Intl.NumberFormat(undefined, {
    useGrouping,
    ...(maxFractionDigits == null
      ? {}
      : { maximumFractionDigits: maxFractionDigits }),
  }).format(value);
}

function parseValue(value: string): number | null {
  const numeric = Number(value.replace(/[^0-9+-.]/g, ''));
  return value.trim() === '' || Number.isNaN(numeric) ? null : numeric;
}

/** Native React spinbutton using the same BAPS field and spinner-button skin. */
export function BapsInputNumber({
  value: controlledValue,
  defaultValue = null,
  showButtons = true,
  min,
  max,
  maxLength,
  maxFractionDigits,
  inputStyleClass,
  styleClass,
  useGrouping = true,
  mode = 'decimal',
  placeholder,
  disabled = false,
  size,
  brand = 'mybky',
  onInput,
  onBlur,
  className,
  ...nativeProps
}: BapsInputNumberProps): ReactElement {
  const [internalValue, setInternalValue] = useState<number | null>(() =>
    normaliseValue(defaultValue, min, max, maxFractionDigits),
  );
  const currentValue = normaliseValue(
    controlledValue === undefined ? internalValue : controlledValue,
    min,
    max,
    maxFractionDigits,
  );
  const formattedValue = formatValue(
    currentValue,
    useGrouping,
    maxFractionDigits,
  );

  const commit = (
    nextValue: number | null,
    originalEvent:
      ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>,
  ) => {
    const next = normaliseValue(nextValue, min, max, maxFractionDigits);
    if (controlledValue === undefined) setInternalValue(next);
    onInput?.({
      originalEvent,
      value: next,
      formattedValue: formatValue(next, useGrouping, maxFractionDigits),
    });
  };

  const atMaximum = currentValue != null && max != null && currentValue >= max;
  const atMinimum = currentValue != null && min != null && currentValue <= min;

  return createElement(
    'baps-input-number',
    {
      ...nativeProps,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        className,
      ),
      'data-mode': mode,
    },
    <span className="baps-input-number__control">
      <span
        className={joinClassNames(
          'p-inputnumber p-component p-inputwrapper',
          currentValue != null && 'p-inputwrapper-filled p-filled',
          disabled && 'p-disabled',
          styleClass,
        )}
      >
        <input
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue ?? undefined}
          value={formattedValue}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          className={joinClassNames(
            'p-inputtext p-component p-inputnumber-input',
            size === 'small' && 'p-inputtext-sm',
            size === 'large' && 'p-inputtext-lg',
            inputStyleClass,
          )}
          onChange={(event) =>
            commit(parseValue(event.currentTarget.value), event)
          }
          onBlur={onBlur}
        />
      </span>

      {showButtons && (
        <span className="baps-input-number__buttons">
          <button
            type="button"
            className="baps-input-number__button baps-input-number__button--increment"
            aria-label="Increase value"
            disabled={disabled || atMaximum}
            onClick={(event) => commit((currentValue ?? 0) + 1, event)}
          >
            <BapsIcon name="plus" size="xs" />
          </button>
          <button
            type="button"
            className="baps-input-number__button baps-input-number__button--decrement"
            aria-label="Decrease value"
            disabled={disabled || atMinimum}
            onClick={(event) => commit((currentValue ?? 0) - 1, event)}
          >
            <BapsIcon name="minus" size="xs" />
          </button>
        </span>
      )}
    </span>,
  );
}

BapsInputNumber.displayName = 'BapsInputNumber';
