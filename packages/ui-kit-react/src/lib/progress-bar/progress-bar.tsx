import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsProgressBarMode = 'determinate' | 'indeterminate';
export type BapsProgressBarSeverity = 'success' | 'info' | 'warning' | 'error';
export type BapsProgressBarBrand = 'mybky' | 'sampark';

export interface BapsProgressBarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  value?: number;
  mode?: BapsProgressBarMode;
  showValue?: boolean;
  unit?: string;
  severity?: BapsProgressBarSeverity;
  valueLabel?: ReactNode;
  valueClassName?: string;
  brand?: BapsProgressBarBrand;
  ref?: Ref<HTMLElement>;
}

/** Linear progress indicator using the shared BAPS/PrimeNG-compatible DOM contract. */
export function BapsProgressBar({
  value = 0,
  mode = 'determinate',
  showValue = false,
  unit = '%',
  severity,
  valueLabel,
  valueClassName,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsProgressBarProps): ReactElement {
  const isDeterminate = mode === 'determinate';
  const normalizedValue = Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : 0;
  const valueStyle: CSSProperties | undefined = isDeterminate
    ? { width: `${normalizedValue}%` }
    : undefined;

  const progress = (
    <div
      className={['p-progressbar', 'p-component', `p-progressbar-${mode}`].join(
        ' ',
      )}
      aria-hidden="true"
    >
      <div
        className={['p-progressbar-value', valueClassName]
          .filter(Boolean)
          .join(' ')}
        style={valueStyle}
      >
        {isDeterminate && showValue && normalizedValue !== 0 && (
          <div className="p-progressbar-label">
            {valueLabel ?? `${normalizedValue}${unit}`}
          </div>
        )}
      </div>
    </div>
  );

  return createElement(
    'baps-progressbar',
    {
      ...nativeProps,
      ref,
      role: 'progressbar',
      'aria-valuemin': isDeterminate ? 0 : undefined,
      'aria-valuemax': isDeterminate ? 100 : undefined,
      'aria-valuenow': isDeterminate ? normalizedValue : undefined,
      className:
        [
          brand === 'sampark' && 'baps-sampark',
          showValue && 'baps-progressbar-has-value',
          severity && `baps-progressbar-${severity}`,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    progress,
  );
}

BapsProgressBar.displayName = 'BapsProgressBar';
