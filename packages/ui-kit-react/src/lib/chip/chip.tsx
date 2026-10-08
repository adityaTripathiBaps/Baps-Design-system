'use client';

import {
  createElement,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';

export type BapsChipBrand = 'mybky' | 'sampark';

type ImageProps =
  | { image?: undefined; alt?: never; onImageError?: never }
  | {
      image: string;
      alt: string;
      onImageError?: ReactEventHandler<HTMLImageElement>;
    };

export type BapsChipProps = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'onError'
> &
  ImageProps & {
    label?: ReactNode;
    children?: ReactNode;
    icon?: BapsIconName | ReactElement;
    removable?: boolean;
    removeIcon?: BapsIconName | ReactElement;
    removeLabel?: string;
    disabled?: boolean;
    brand?: BapsChipBrand;
    chipClassName?: string;
    onRemove?: MouseEventHandler<HTMLButtonElement>;
    ref?: Ref<HTMLElement>;
  };

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

const renderIcon = (
  icon: BapsIconName | ReactElement | undefined,
  className: string,
) => {
  if (!icon) return null;
  return (
    <span className={className} aria-hidden="true">
      {typeof icon === 'string' ? (
        <BapsIcon name={icon} size="inherit" />
      ) : (
        icon
      )}
    </span>
  );
};

/** A token-backed selected-value/entity chip with an optional remove action. */
export function BapsChip({
  label,
  children,
  icon,
  image,
  alt,
  onImageError,
  removable = false,
  removeIcon = 'close-circle',
  removeLabel,
  disabled = false,
  brand = 'mybky',
  chipClassName,
  onRemove,
  className,
  ref,
  ...nativeProps
}: BapsChipProps): ReactElement {
  const content = label ?? children;
  const accessibleRemoveLabel =
    removeLabel ??
    (typeof content === 'string' ? `Remove ${content}` : 'Remove item');

  const chip = (
    <div
      className={joinClassNames(
        'p-chip p-component',
        disabled && 'p-disabled',
        chipClassName,
      )}
    >
      {image ? (
        <img src={image} alt={alt} onError={onImageError} />
      ) : (
        renderIcon(icon, 'p-chip-icon')
      )}
      {content !== undefined && content !== null && (
        <span className="p-chip-label">{content}</span>
      )}
      {removable && !disabled && (
        <button
          type="button"
          className="p-chip-remove-icon"
          aria-label={accessibleRemoveLabel}
          onClick={onRemove}
        >
          {typeof removeIcon === 'string' ? (
            <BapsIcon name={removeIcon} size="inherit" />
          ) : (
            removeIcon
          )}
        </button>
      )}
    </div>
  );

  return createElement(
    'baps-chip',
    {
      ...nativeProps,
      ref,
      'data-disabled': disabled ? 'true' : undefined,
      'aria-disabled': disabled || undefined,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        className,
      ),
    },
    chip,
  );
}

BapsChip.displayName = 'BapsChip';
