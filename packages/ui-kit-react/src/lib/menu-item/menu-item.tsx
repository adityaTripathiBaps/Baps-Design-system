import {
  createElement,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
} from 'react';
import { BapsAvatar } from '../avatar/avatar.js';

export interface BapsMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  control?: 'none' | 'checkbox' | 'radio';
  checked?: boolean;
  media?: 'none' | 'icon' | 'avatar';
  icon?: string;
  avatarLabel?: string;
  avatarIcon?: string;
  severity?: 'default' | 'danger';
  selected?: boolean;
  disabled?: boolean;
  brand?: 'mybky' | 'sampark';
  onActivated?: () => void;
  children?: ReactNode;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export const BapsMenuItem = forwardRef<HTMLDivElement, BapsMenuItemProps>(
  (
    {
      title,
      subtitle,
      control = 'none',
      checked = false,
      media = 'none',
      icon,
      avatarLabel,
      avatarIcon,
      severity = 'default',
      selected = false,
      disabled = false,
      brand = 'mybky',
      onActivated,
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const role = control === 'checkbox' 
      ? 'menuitemcheckbox' 
      : control === 'radio' 
        ? 'menuitemradio' 
        : 'menuitem';
    
    const ariaChecked = control === 'checkbox' || control === 'radio' ? checked : undefined;

    const handleActivate = () => {
      if (disabled) return;
      onActivated?.();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        handleActivate();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleActivate();
      }
      
      if (nativeProps.onKeyDown) {
        nativeProps.onKeyDown(e);
      }
    };

    const content = (
      <div
        className={joinClassNames(
          'menu-item',
          selected && 'menu-item--selected',
          severity === 'danger' && 'menu-item--danger',
          disabled && 'menu-item--disabled',
          !!subtitle && 'menu-item--two-line',
          className
        )}
        role={role}
        aria-checked={ariaChecked}
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? undefined : 0}
        onClick={(e) => {
          handleActivate();
          if (nativeProps.onClick) nativeProps.onClick(e);
        }}
        onKeyDown={handleKeyDown}
        {...nativeProps}
      >
        <span className="menu-item__bar" aria-hidden="true"></span>

        {control === 'checkbox' && (
          <span
            className={joinClassNames('menu-item__control menu-item__control--check', checked && 'is-checked')}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
        {control === 'radio' && (
          <span
            className={joinClassNames('menu-item__control menu-item__control--radio', checked && 'is-checked')}
            aria-hidden="true"
          ></span>
        )}

        {media === 'icon' && (
          icon ? (
            <i className={`menu-item__icon pi ${icon}`} aria-hidden="true"></i>
          ) : (
            <svg
              className="menu-item__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          )
        )}
        {media === 'avatar' && (
          <BapsAvatar
            className="menu-item__avatar"
            brand={brand}
            size="s"
            variant={avatarIcon ? 'secondary' : 'primary'}
            {...((avatarIcon ? { 'aria-hidden': true } : { label: avatarLabel }) as any)}
          >
            {avatarIcon === 'pi-envelope' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            )}
            {avatarIcon === 'pi-user' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            )}
          </BapsAvatar>
        )}

        <span className="menu-item__text">
          <span className="menu-item__title">
            {title}
            {children}
          </span>
          {subtitle && (
            <span className="menu-item__subtitle">{subtitle}</span>
          )}
        </span>
      </div>
    );

    return createElement(
      'baps-menu-item',
      {
        ref,
        className: joinClassNames(brand === 'mybky' && 'baps-mybky'),
      },
      content
    );
  }
);
BapsMenuItem.displayName = 'BapsMenuItem';
