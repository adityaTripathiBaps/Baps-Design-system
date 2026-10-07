import {
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';

export type BapsButtonBrand = 'mybky' | 'sampark';
export type BapsButtonSize = 'small' | 'medium' | 'large' | 'xlarge';
export type BapsButtonSeverity = 'primary' | 'secondary' | 'danger' | 'warn';
export type BapsButtonVariant = 'solid' | 'ghost' | 'link';
export type BapsButtonIconPosition = 'left' | 'right';

type BapsButtonAppearanceProps =
  | {
      brand?: 'mybky';
      severity?: BapsButtonSeverity;
      variant?: 'solid';
    }
  | {
      brand?: 'mybky';
      severity?: 'primary' | 'secondary';
      variant: 'ghost';
    }
  | {
      brand: 'sampark';
      severity?: 'primary' | 'secondary';
      variant?: 'solid' | 'ghost';
    }
  | {
      brand: 'sampark';
      severity?: 'primary';
      variant: 'link';
    };

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children' | 'type'
>;

type AccessibleContent =
  | {
      label: ReactNode;
      children?: ReactNode;
      'aria-label'?: string;
    }
  | {
      label?: undefined;
      children: ReactNode;
      'aria-label'?: string;
    }
  | {
      label?: undefined;
      children?: undefined;
      'aria-label': string;
    };

export type BapsButtonProps = NativeButtonProps &
  AccessibleContent & {
    /** Defaults to button so the component never submits a form accidentally. */
    type?: 'button' | 'submit' | 'reset';
    size?: BapsButtonSize;
    icon?: BapsIconName | ReactElement;
    iconPosition?: BapsButtonIconPosition;
    loading?: boolean;
    loadingIndicator?: ReactElement;
    ref?: Ref<HTMLButtonElement>;
  } & BapsButtonAppearanceProps;

const BUTTON_ICON_SIZE: Readonly<Record<BapsButtonSize, number>> = {
  small: 16,
  medium: 18,
  large: 20,
  xlarge: 24,
};

const SIZE_CLASS: Readonly<Partial<Record<BapsButtonSize, string>>> = {
  small: 'baps-button--s',
  large: 'baps-button--l',
  xlarge: 'baps-button--xl',
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

const appearanceClass = (
  severity: BapsButtonSeverity,
  variant: BapsButtonVariant,
): string => {
  if (variant === 'link') return 'baps-button--link';
  if (variant === 'ghost') {
    const ghostSeverity = severity === 'secondary' ? 'secondary' : 'primary';
    return `baps-button--ghost-${ghostSeverity}`;
  }
  return `baps-button--${severity}`;
};

/**
 * Native-button React implementation using the canonical standalone BAPS
 * button classes. Native semantics supply focus, Enter/Space activation and
 * correctly typed React refs/events without any framework runtime adapter.
 */
export function BapsButton({
  type = 'button',
  brand = 'mybky',
  severity = 'primary',
  variant = 'solid',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  loadingIndicator,
  label,
  children,
  disabled = false,
  className,
  ref,
  ...nativeProps
}: BapsButtonProps): ReactElement {
  const content = label ?? children;
  const iconOnly = content === undefined || content === null;
  const resolvedIcon = loading ? (
    (loadingIndicator ?? (
      <BapsIcon name="loading" size={BUTTON_ICON_SIZE[size]} />
    ))
  ) : typeof icon === 'string' ? (
    <BapsIcon name={icon} size={BUTTON_ICON_SIZE[size]} />
  ) : (
    icon
  );
  const iconBefore = iconPosition === 'left';

  return (
    <button
      {...nativeProps}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={joinClassNames(
        'baps-button',
        brand === 'sampark' && 'baps-sampark',
        appearanceClass(severity, variant),
        SIZE_CLASS[size],
        iconOnly && 'baps-button--icon-only',
        loading && 'baps-button--loading',
        className,
      )}
    >
      {iconBefore && resolvedIcon}
      {!iconOnly && <span className="baps-button__label">{content}</span>}
      {!iconBefore && resolvedIcon}
    </button>
  );
}

BapsButton.displayName = 'BapsButton';
