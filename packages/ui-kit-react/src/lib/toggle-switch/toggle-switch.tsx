import {
  createElement,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';

export type BapsToggleSwitchSize = 'xs' | 'sm' | 'md' | 'lg';
export type BapsToggleSwitchBrand = 'mybky' | 'sampark';

type BapsToggleSwitchNativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'readOnly' | 'role' | 'size' | 'type'
>;
type BapsToggleSwitchLabelProps =
  { label: string; id: string } | { label?: undefined; id?: string };

export type BapsToggleSwitchProps = BapsToggleSwitchNativeProps &
  BapsToggleSwitchLabelProps & {
    toggleSize?: BapsToggleSwitchSize;
    brand?: BapsToggleSwitchBrand;
    readOnly?: boolean;
    rootClassName?: string;
    ref?: Ref<HTMLInputElement>;
  };

/** Native checkbox switch using the shared BAPS track and thumb skin. */
export function BapsToggleSwitch({
  label,
  toggleSize = 'md',
  brand = 'mybky',
  readOnly = false,
  rootClassName,
  className,
  id,
  disabled = false,
  onClick,
  onChange,
  ref,
  ...nativeProps
}: BapsToggleSwitchProps): ReactElement {
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

  return createElement(
    'baps-toggleswitch',
    {
      className: rootClassName,
    },
    <span className="baps-switch-wrapper">
      <span
        className={[
          'baps-toggle-switch',
          brand === 'sampark' && 'baps-sampark',
          toggleSize !== 'md' && `baps-toggle-switch--${toggleSize}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          {...nativeProps}
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          className={['baps-toggle-switch__input', className]
            .filter(Boolean)
            .join(' ')}
          onClick={handleClick}
          onChange={handleChange}
        />
        <span className="baps-toggle-switch__track" aria-hidden="true">
          <span className="baps-toggle-switch__thumb" />
        </span>
      </span>
      {label && (
        <label
          htmlFor={id}
          className={
            disabled
              ? 'p-toggleswitch-label p-disabled'
              : 'p-toggleswitch-label'
          }
        >
          {label}
        </label>
      )}
    </span>,
  );
}

BapsToggleSwitch.displayName = 'BapsToggleSwitch';
