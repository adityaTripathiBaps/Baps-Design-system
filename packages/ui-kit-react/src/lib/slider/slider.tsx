'use client';

import {
  createElement,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
  type SyntheticEvent,
} from 'react';

export type BapsSliderBrand = 'mybky' | 'sampark';
export type BapsSliderOrientation = 'horizontal' | 'vertical';
export type BapsSliderRange = readonly [number, number];

type NativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'defaultValue' | 'onChange'
>;

type AccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

type BaseProps = NativeProps &
  AccessibleName & {
    min?: number;
    max?: number;
    step?: number;
    orientation?: BapsSliderOrientation;
    disabled?: boolean;
    showValueTooltip?: boolean;
    brand?: BapsSliderBrand;
    name?: string;
    getFormValue?: (value: number) => string;
    trackClassName?: string;
    ref?: Ref<HTMLElement>;
  };

type SingleProps = BaseProps & {
  range?: false;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number, event: SyntheticEvent<HTMLElement>) => void;
  ariaLabels?: never;
};

type RangeProps = BaseProps & {
  range: true;
  value?: BapsSliderRange;
  defaultValue?: BapsSliderRange;
  onValueChange?: (
    value: BapsSliderRange,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
  ariaLabels?: readonly [string, string];
};

export type BapsSliderProps = SingleProps | RangeProps;

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const decimalPlaces = (value: number): number => {
  const text = String(value);
  return text.includes('.') ? text.length - text.indexOf('.') - 1 : 0;
};

/** Clamps and aligns a candidate value to the component's step contract. */
export function normaliseSliderValue(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  if (!Number.isFinite(value)) return min;
  const safeStep = step > 0 ? step : 1;
  const stepped = min + Math.round((value - min) / safeStep) * safeStep;
  const precision = Math.max(decimalPlaces(min), decimalPlaces(safeStep));
  return Number(clamp(stepped, min, max).toFixed(precision));
}

const percent = (value: number, min: number, max: number): number =>
  max <= min ? 0 : ((clamp(value, min, max) - min) / (max - min)) * 100;

export function BapsSlider({
  range = false,
  value: controlledValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  disabled = false,
  showValueTooltip = false,
  brand = 'mybky',
  name,
  getFormValue = String,
  trackClassName,
  ariaLabel,
  ariaLabelledBy,
  ariaLabels,
  className,
  ref,
  ...nativeProps
}: BapsSliderProps): ReactElement {
  const fallback: number | BapsSliderRange = range
    ? [min, max]
    : normaliseSliderValue(
        typeof defaultValue === 'number' ? defaultValue : min,
        min,
        max,
        step,
      );
  const [internalValue, setInternalValue] = useState<number | BapsSliderRange>(
    defaultValue ?? fallback,
  );
  const rawValue =
    controlledValue === undefined ? internalValue : controlledValue;
  const values: BapsSliderRange = range
    ? [
        normaliseSliderValue(
          Array.isArray(rawValue) ? (rawValue[0] ?? min) : min,
          min,
          max,
          step,
        ),
        normaliseSliderValue(
          Array.isArray(rawValue) ? (rawValue[1] ?? max) : max,
          min,
          max,
          step,
        ),
      ]
    : [
        normaliseSliderValue(
          typeof rawValue === 'number' ? rawValue : min,
          min,
          max,
          step,
        ),
        max,
      ];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingIndex = useRef<number | null>(null);
  const startPercent = range ? percent(values[0], min, max) : 0;
  const endPercent = percent(range ? values[1] : values[0], min, max);

  const commit = (
    handleIndex: number,
    candidate: number,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (disabled) return;
    const nextNumber = normaliseSliderValue(candidate, min, max, step);
    const next: number | BapsSliderRange = range
      ? handleIndex === 0
        ? [Math.min(nextNumber, values[1]), values[1]]
        : [values[0], Math.max(nextNumber, values[0])]
      : nextNumber;
    if (controlledValue === undefined) setInternalValue(next);
    const callback = onValueChange as
      | ((
          nextValue: number | BapsSliderRange,
          sourceEvent: SyntheticEvent<HTMLElement>,
        ) => void)
      | undefined;
    callback?.(next, event);
  };

  const valueFromPointer = (event: PointerEvent<HTMLElement>): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return min;
    const ratio =
      orientation === 'horizontal'
        ? (event.clientX - rect.left) / rect.width
        : (rect.bottom - event.clientY) / rect.height;
    return min + clamp(ratio, 0, 1) * (max - min);
  };

  const nearestHandle = (candidate: number): number =>
    !range || Math.abs(candidate - values[0]) <= Math.abs(candidate - values[1])
      ? 0
      : 1;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    const candidate = valueFromPointer(event);
    const index = nearestHandle(candidate);
    draggingIndex.current = index;
    event.currentTarget.setPointerCapture(event.pointerId);
    commit(index, candidate, event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (draggingIndex.current === null || disabled) return;
    commit(draggingIndex.current, valueFromPointer(event), event);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLSpanElement>,
    index: number,
  ) => {
    const current = values[index] ?? min;
    let next: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
      next = current + step;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = current - step;
    } else if (event.key === 'PageUp') next = current + step * 10;
    else if (event.key === 'PageDown') next = current - step * 10;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    if (next !== undefined) {
      event.preventDefault();
      commit(index, next, event);
    }
  };

  const handles = range ? values : ([values[0]] as const);
  const track = (
    <div
      ref={trackRef}
      className={joinClassNames(
        'p-slider p-component',
        orientation === 'horizontal'
          ? 'p-slider-horizontal'
          : 'p-slider-vertical',
        disabled && 'p-disabled',
        trackClassName,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        draggingIndex.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        draggingIndex.current = null;
      }}
    >
      <span
        className="p-slider-range"
        style={
          orientation === 'horizontal'
            ? {
                insetInlineStart: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
              }
            : {
                bottom: `${startPercent}%`,
                height: `${endPercent - startPercent}%`,
              }
        }
      />
      {handles.map((handleValue, index) => {
        const position = percent(handleValue, min, max);
        const label =
          ariaLabels?.[index] ??
          (range
            ? `${ariaLabel ?? 'Value'} ${index === 0 ? 'minimum' : 'maximum'}`
            : ariaLabel);
        return (
          <span
            key={index}
            role="slider"
            tabIndex={disabled ? undefined : 0}
            className="p-slider-handle"
            style={
              orientation === 'horizontal'
                ? { insetInlineStart: `${position}%` }
                : { bottom: `${position}%` }
            }
            aria-label={label}
            aria-labelledby={ariaLabelledBy}
            aria-valuemin={range && index === 1 ? values[0] : min}
            aria-valuemax={range && index === 0 ? values[1] : max}
            aria-valuenow={handleValue}
            aria-orientation={orientation}
            aria-disabled={disabled || undefined}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        );
      })}
    </div>
  );

  return createElement(
    'baps-slider',
    {
      ...nativeProps,
      ref,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        showValueTooltip &&
          orientation === 'horizontal' &&
          'baps-slider-has-tooltip',
        className,
      ),
    },
    track,
    showValueTooltip && orientation === 'horizontal'
      ? handles.map((handleValue, index) => (
          <span
            className="baps-slider-tooltip"
            aria-hidden="true"
            key={index}
            style={{ insetInlineStart: `${percent(handleValue, min, max)}%` }}
          >
            {handleValue}
          </span>
        ))
      : null,
    name
      ? handles.map((handleValue, index) => (
          <input
            key={index}
            type="hidden"
            name={range ? `${name}[${index}]` : name}
            value={getFormValue(handleValue)}
          />
        ))
      : null,
  );
}

BapsSlider.displayName = 'BapsSlider';
