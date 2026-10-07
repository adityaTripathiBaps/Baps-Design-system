import {
  createElement,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { BapsIcon } from '../icon/icon.js';

export type BapsCheckboxSize = 'small' | 'large';
export type BapsCheckboxBrand = 'mybky' | 'sampark';
export type BapsCheckboxVariant = 'outlined' | 'filled';

type BapsCheckboxNativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'size' | 'type'
>;

type BapsCheckboxLabelProps =
  { label: string; id: string } | { label?: undefined; id?: string };

export type BapsCheckboxProps = BapsCheckboxNativeProps &
  BapsCheckboxLabelProps & {
    checkboxSize?: BapsCheckboxSize;
    brand?: BapsCheckboxBrand;
    variant?: BapsCheckboxVariant;
    indeterminate?: boolean;
    readOnly?: boolean;
    rootClassName?: string;
    ref?: Ref<HTMLInputElement>;
  };

/** Native checkbox input with BAPS visual states and mixed-state semantics. */
export function BapsCheckbox({
  label,
  checkboxSize = 'small',
  brand = 'mybky',
  variant,
  indeterminate = false,
  readOnly = false,
  rootClassName,
  className,
  id,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  onClick,
  ref,
  ...nativeProps
}: BapsCheckboxProps): ReactElement {
  const initiallyChecked = checked ?? defaultChecked ?? false;
  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (readOnly) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!readOnly) onChange?.(event);
  };

  const content = (
    <span className="baps-checkbox-wrapper">
      <span
        className={[
          'p-checkbox',
          'p-component',
          initiallyChecked && 'p-checkbox-checked',
          indeterminate && 'p-checkbox-indeterminate',
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
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          readOnly={readOnly}
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-readonly={readOnly || undefined}
          onClick={handleClick}
          onChange={handleChange}
          className={['p-checkbox-input', className].filter(Boolean).join(' ')}
        />
        <span className="p-checkbox-box" aria-hidden="true">
          <BapsIcon
            name="check"
            size="inherit"
            className="p-checkbox-icon p-checkbox-icon-check"
          />
          <BapsIcon
            name="minus"
            size="inherit"
            className="p-checkbox-icon p-checkbox-icon-minus"
          />
        </span>
      </span>
      {label && (
        <label
          htmlFor={id}
          className={
            disabled ? 'p-checkbox-label p-disabled' : 'p-checkbox-label'
          }
        >
          {label}
        </label>
      )}
    </span>
  );

  return createElement(
    'baps-checkbox',
    {
      className: [
        brand === 'sampark' && 'baps-sampark',
        checkboxSize === 'large' && 'baps-checkbox-lg',
        rootClassName,
      ]
        .filter(Boolean)
        .join(' '),
    },
    content,
  );
}

BapsCheckbox.displayName = 'BapsCheckbox';
