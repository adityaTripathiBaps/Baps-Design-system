import {
  createElement,
  type InputHTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

export type BapsRadioSize = 'small' | 'large';
export type BapsRadioBrand = 'mybky' | 'sampark';
export type BapsRadioVariant = 'outlined' | 'filled';

type BapsRadioNativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'size' | 'type'
>;
type BapsRadioLabelProps =
  { label: string; id: string } | { label?: undefined; id?: string };

export type BapsRadioProps = BapsRadioNativeProps &
  BapsRadioLabelProps & {
    radioSize?: BapsRadioSize;
    brand?: BapsRadioBrand;
    variant?: BapsRadioVariant;
    rootClassName?: string;
    ref?: Ref<HTMLInputElement>;
  };

/** Native radio input that preserves browser grouping and keyboard behavior. */
export function BapsRadio({
  label,
  radioSize = 'small',
  brand = 'mybky',
  variant,
  rootClassName,
  className,
  id,
  checked,
  defaultChecked,
  disabled = false,
  ref,
  ...nativeProps
}: BapsRadioProps): ReactElement {
  const initiallyChecked = checked ?? defaultChecked ?? false;
  const content = (
    <span className="baps-radio-wrapper">
      <span
        className={[
          'p-radiobutton',
          'p-component',
          initiallyChecked && 'p-radiobutton-checked',
          disabled && 'p-disabled',
          variant === 'filled' && 'p-variant-filled',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          {...nativeProps}
          ref={ref}
          id={id}
          type="radio"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          className={['p-radiobutton-input', className]
            .filter(Boolean)
            .join(' ')}
        />
        <span className="p-radiobutton-box" aria-hidden="true">
          <span className="p-radiobutton-icon" />
        </span>
      </span>
      {label && (
        <label
          htmlFor={id}
          className={
            disabled ? 'p-radiobutton-label p-disabled' : 'p-radiobutton-label'
          }
        >
          {label}
        </label>
      )}
    </span>
  );

  return createElement(
    'baps-radio',
    {
      className: [
        brand === 'sampark' && 'baps-sampark',
        radioSize === 'large' && 'baps-radio-lg',
        rootClassName,
      ]
        .filter(Boolean)
        .join(' '),
    },
    content,
  );
}

BapsRadio.displayName = 'BapsRadio';
