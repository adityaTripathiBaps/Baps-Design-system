'use client';

import {
  createElement,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsSegmentedBrand = 'mybky' | 'sampark';

export interface BapsSegmentedOption<Value = string> {
  label: ReactNode;
  value: Value;
  disabled?: boolean;
}

type BapsSegmentedNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'defaultValue' | 'onChange'
>;
type BapsSegmentedAccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };
type BapsSegmentedBaseProps<Value> = BapsSegmentedNativeProps &
  BapsSegmentedAccessibleName & {
    options: readonly (Value | BapsSegmentedOption<Value>)[];
    allowEmpty?: boolean;
    disabled?: boolean;
    brand?: BapsSegmentedBrand;
    groupClassName?: string;
    ref?: Ref<HTMLElement>;
  };

type BapsSegmentedSingleProps<Value> = BapsSegmentedBaseProps<Value> & {
  multiple?: false;
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (
    value: Value | null,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
};

type BapsSegmentedMultipleProps<Value> = BapsSegmentedBaseProps<Value> & {
  multiple: true;
  value?: readonly Value[];
  defaultValue?: readonly Value[];
  onValueChange?: (
    value: readonly Value[],
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
};

export type BapsSegmentedProps<Value = string> =
  BapsSegmentedSingleProps<Value> | BapsSegmentedMultipleProps<Value>;

type Selection<Value> = Value | readonly Value[] | null;

function isOption<Value>(
  option: Value | BapsSegmentedOption<Value>,
): option is BapsSegmentedOption<Value> {
  return (
    typeof option === 'object' &&
    option !== null &&
    'label' in option &&
    'value' in option
  );
}

/** Pure state transition used by the component and its interaction tests. */
export function getNextSegmentedValue<Value>(
  current: Selection<Value>,
  option: Value,
  multiple: boolean,
  allowEmpty: boolean,
): Selection<Value> {
  if (multiple) {
    const values = Array.isArray(current) ? current : [];
    const selected = values.some((value) => Object.is(value, option));
    if (selected) {
      if (!allowEmpty && values.length === 1) return values;
      return values.filter((value) => !Object.is(value, option));
    }
    return [...values, option];
  }

  if (Object.is(current, option)) return allowEmpty ? null : current;
  return option;
}

/** Moves focus between enabled segment buttons for Arrow/Home/End keys. */
export function moveSegmentedFocus(group: HTMLElement, key: string): boolean {
  const step =
    key === 'ArrowRight' || key === 'ArrowDown'
      ? 1
      : key === 'ArrowLeft' || key === 'ArrowUp'
        ? -1
        : 0;
  if (!step && key !== 'Home' && key !== 'End') return false;

  const items = Array.from(
    group.querySelectorAll<HTMLButtonElement>('.p-togglebutton:not(:disabled)'),
  );
  if (items.length === 0) return false;

  let next: number;
  if (key === 'Home') next = 0;
  else if (key === 'End') next = items.length - 1;
  else {
    const current = items.findIndex(
      (item) => item === group.ownerDocument.activeElement,
    );
    if (current === -1) return false;
    next = (current + step + items.length) % items.length;
  }

  const nextItem = items[next];
  if (!nextItem) return false;
  nextItem.focus();
  return true;
}

/** Typed controlled/uncontrolled segmented button group with native buttons. */
export function BapsSegmented<Value = string>(
  props: BapsSegmentedProps<Value>,
): ReactElement {
  const {
    options,
    multiple = false,
    allowEmpty = true,
    disabled = false,
    brand = 'mybky',
    ariaLabel,
    ariaLabelledBy,
    groupClassName,
    className,
    onKeyDown,
    ref,
    ...nativeProps
  } = props;
  const controlledValue = props.value as Selection<Value> | undefined;
  const [internalValue, setInternalValue] = useState<Selection<Value>>(
    () =>
      (props.defaultValue as Selection<Value> | undefined) ??
      (multiple ? [] : null),
  );
  const selection =
    controlledValue === undefined ? internalValue : controlledValue;
  const onValueChange = props.onValueChange as
    | ((value: Selection<Value>, event: MouseEvent<HTMLButtonElement>) => void)
    | undefined;

  const isSelected = (optionValue: Value) =>
    multiple
      ? Array.isArray(selection) &&
        selection.some((value) => Object.is(value, optionValue))
      : Object.is(selection, optionValue);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (moveSegmentedFocus(event.currentTarget, event.key)) {
      event.preventDefault();
    }
    onKeyDown?.(event);
  };

  return createElement(
    'baps-segmented',
    {
      ...nativeProps,
      ref,
      className: [
        brand === 'sampark' && 'baps-sampark',
        multiple && 'baps-segmented-multiple',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      onKeyDown: handleKeyDown,
    },
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      className={['p-selectbutton', 'p-component', groupClassName]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((rawOption, index) => {
        const option = isOption(rawOption)
          ? rawOption
          : { label: String(rawOption), value: rawOption };
        const selected = isSelected(option.value);
        const optionDisabled = disabled || Boolean(option.disabled);

        return (
          <button
            key={`${String(option.value)}-${index}`}
            type="button"
            disabled={optionDisabled}
            aria-pressed={selected}
            className={[
              'p-togglebutton',
              'p-component',
              selected && 'p-togglebutton-checked',
              optionDisabled && 'p-disabled',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              const next = getNextSegmentedValue(
                selection,
                option.value,
                multiple,
                allowEmpty,
              );
              if (controlledValue === undefined) setInternalValue(next);
              onValueChange?.(next, event);
            }}
          >
            <span className="p-togglebutton-content">
              <span className="p-togglebutton-label">{option.label}</span>
            </span>
          </button>
        );
      })}
    </div>,
  );
}

BapsSegmented.displayName = 'BapsSegmented';
