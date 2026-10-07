import {
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';

export type BapsTagBrand = 'mybky' | 'sampark';
export type BapsTagSeverity =
  'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
export type BapsTagSize = 'xs' | 's' | 'm' | 'l';

type ActionProps =
  | {
      action?: false;
      actionLabel?: never;
      actionIcon?: never;
      onAction?: never;
    }
  | {
      action: true;
      actionLabel: string;
      actionIcon?: BapsIconName | ReactElement;
      onAction?: MouseEventHandler<HTMLButtonElement>;
    };

export type BapsTagProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> &
  ActionProps & {
    value?: ReactNode;
    children?: ReactNode;
    severity?: BapsTagSeverity;
    rounded?: boolean;
    icon?: BapsIconName | ReactElement;
    chevron?: boolean;
    size?: BapsTagSize;
    disabled?: boolean;
    brand?: BapsTagBrand;
    ref?: Ref<HTMLSpanElement>;
  };

const severityClass = (severity: BapsTagSeverity | undefined) => {
  if (severity === 'contrast') return 'baps-tag--primary';
  if (severity === 'warn') return 'baps-tag--warning';
  if (severity === 'danger') return 'baps-tag--error';
  return severity ? `baps-tag--${severity}` : 'baps-tag--grey';
};

const renderIcon = (
  icon: BapsIconName | ReactElement | undefined,
  className: string,
) => {
  if (!icon) return null;
  return (
    <span className={className} aria-hidden={true}>
      {typeof icon === 'string' ? <BapsIcon name={icon} /> : icon}
    </span>
  );
};

/** Token-backed React tag with a native optional trailing action button. */
export function BapsTag({
  value,
  children,
  severity,
  rounded = false,
  icon,
  chevron = false,
  action = false,
  actionLabel,
  actionIcon,
  onAction,
  size = 's',
  disabled = false,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsTagProps): ReactElement {
  const content = value ?? children;
  const iconOnly = content === undefined || content === null;

  return (
    <span
      {...nativeProps}
      ref={ref}
      aria-disabled={disabled || undefined}
      className={[
        'baps-tag',
        severityClass(severity),
        size !== 's' && `baps-tag--${size}`,
        brand === 'sampark' && 'baps-sampark',
        rounded && 'baps-tag--rounded',
        disabled && 'baps-tag--disabled',
        iconOnly && 'baps-tag--icon-only',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {renderIcon(icon, 'baps-tag__icon')}
      {!iconOnly && <span className="baps-tag__label">{content}</span>}
      {chevron && (
        <span className="baps-tag-chevron" aria-hidden={true}>
          <BapsIcon name="arrow-down" />
        </span>
      )}
      {action && (
        <button
          type="button"
          className="baps-tag-action"
          aria-label={actionLabel}
          disabled={disabled}
          onClick={onAction}
        >
          {renderIcon(
            actionIcon ?? 'corner-arrow-up-right',
            'baps-tag-action__icon',
          )}
        </button>
      )}
    </span>
  );
}

BapsTag.displayName = 'BapsTag';
