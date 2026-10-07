import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 14;

export type BapsSpinnerSize = 'small' | 'large';
export type BapsSpinnerBrand = 'mybky' | 'sampark';

export interface BapsSpinnerProps extends HTMLAttributes<HTMLElement> {
  value?: number;
  size?: BapsSpinnerSize;
  ariaLabel?: string;
  brand?: BapsSpinnerBrand;
  ref?: Ref<HTMLElement>;
}

/** Circular determinate or indeterminate loader using the canonical shared spinner CSS. */
export function BapsSpinner({
  value,
  size = 'large',
  ariaLabel = 'Loading',
  brand = 'mybky',
  className,
  ref,
  'aria-label': nativeAriaLabel,
  ...nativeProps
}: BapsSpinnerProps): ReactElement {
  const isDeterminate = value !== undefined && Number.isFinite(value);
  const normalizedValue = isDeterminate
    ? Math.min(100, Math.max(0, value ?? 0))
    : 0;
  const dashArray = isDeterminate
    ? `${CIRCUMFERENCE}`
    : `${CIRCUMFERENCE / 4} ${CIRCUMFERENCE}`;
  const dashOffset = isDeterminate
    ? (CIRCUMFERENCE * (100 - normalizedValue)) / 100
    : 0;

  const graphic = (
    <svg
      className="baps-spinner-svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
      <circle
        className="baps-spinner-arc"
        cx="16"
        cy="16"
        r="14"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );

  return createElement(
    'baps-spinner',
    {
      ...nativeProps,
      ref,
      role: isDeterminate ? 'progressbar' : 'status',
      'aria-label': nativeAriaLabel ?? ariaLabel,
      'aria-valuemin': isDeterminate ? 0 : undefined,
      'aria-valuemax': isDeterminate ? 100 : undefined,
      'aria-valuenow': isDeterminate ? normalizedValue : undefined,
      className:
        [
          brand === 'sampark' && 'baps-sampark',
          size === 'small' && 'baps-spinner-small',
          !isDeterminate && 'baps-spinner-indeterminate',
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    graphic,
  );
}

BapsSpinner.displayName = 'BapsSpinner';
