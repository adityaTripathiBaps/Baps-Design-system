import { type InputHTMLAttributes, type ReactElement, type Ref } from 'react';

export type BapsInputSize = 'small' | 'large';
export type BapsInputVariant = 'outlined' | 'filled' | 'ghost';

export interface BapsInputTextProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  pSize?: BapsInputSize;
  variant?: BapsInputVariant;
  invalid?: boolean;
  fluid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/** Native text input with the canonical BAPS InputText state classes. */
export function BapsInputText({
  pSize,
  variant = 'outlined',
  invalid = false,
  fluid = false,
  className,
  ref,
  'aria-invalid': ariaInvalid,
  ...nativeProps
}: BapsInputTextProps): ReactElement {
  return (
    <input
      {...nativeProps}
      ref={ref}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      className={[
        'p-inputtext',
        'p-component',
        pSize && `p-inputtext-${pSize === 'small' ? 'sm' : 'lg'}`,
        variant === 'filled' && 'p-variant-filled',
        variant === 'ghost' && 'p-inputtext-ghost',
        invalid && 'p-invalid',
        fluid && 'p-fluid',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

BapsInputText.displayName = 'BapsInputText';
