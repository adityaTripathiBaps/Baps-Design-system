import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { BapsPopover, type BapsPopoverRef } from '../popover/popover.js';
import { BapsMenuItem } from '../menu-item/menu-item.js';

export interface BapsSplitButtonItem {
  label?: ReactNode;
  icon?: string;
  command?: (event: ReactMouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export interface BapsSplitButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> {
  label?: string;
  icon?: string;
  model?: BapsSplitButtonItem[];
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  size?: 'small' | 'large' | 'xlarge';
  disabled?: boolean;
  menuStyleClass?: string;
  brand?: 'mybky' | 'sampark';
  count?: number | string | null;
  countLabel?: string;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

const joinClassNames = (...names: Array<string | false | null | undefined>): string =>
  names.filter(Boolean).join(' ');

export const BapsSplitButton = forwardRef<HTMLDivElement, BapsSplitButtonProps>(
  (
    {
      label,
      icon,
      model = [],
      severity,
      size,
      disabled = false,
      menuStyleClass,
      brand = 'mybky',
      count,
      countLabel,
      onClick,
      className,
      ...nativeProps
    },
    ref
  ) => {
    const popoverRef = useRef<BapsPopoverRef>(null);

    const hasCount = count !== null && count !== undefined && count !== '';

    const handleDropdownClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      popoverRef.current?.toggle(event);
    };

    const handleItemClick = (item: BapsSplitButtonItem, event: ReactMouseEvent<HTMLElement>) => {
      if (item.disabled) return;
      if (item.command) {
        item.command(event);
      }
      popoverRef.current?.hide();
    };

    const buttonClassNames = joinClassNames(
      'p-button p-component',
      severity && `p-button-${severity}`,
      size === 'small' && 'p-button-sm',
      size === 'large' && 'p-button-lg'
    );

    const primaryContent = hasCount ? (
      <>
        {icon && <span className={icon} aria-hidden="true"></span>}
        {label && <span className="p-button-label">{label}</span>}
        <span className="baps-splitbutton-count" aria-label={countLabel}>{count}</span>
      </>
    ) : (
      <>
        {icon && <span className={joinClassNames('p-button-icon p-button-icon-left', icon)} aria-hidden="true"></span>}
        {label && <span className="p-button-label">{label}</span>}
      </>
    );

    const content = (
      <div
        className={joinClassNames(
          'p-splitbutton p-component',
          className
        )}
        {...nativeProps}
      >
        <button
          type="button"
          className={buttonClassNames}
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
        >
          {primaryContent}
        </button>
        <button
          type="button"
          className={joinClassNames(buttonClassNames, 'p-splitbutton-dropdown')}
          disabled={disabled}
          onClick={handleDropdownClick}
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="More Options"
        >
          <span className="p-button-icon pi pi-chevron-down" aria-hidden="true"></span>
        </button>

        <BapsPopover ref={popoverRef} className={menuStyleClass} brand={brand}>
          <div role="menu" style={{ display: 'flex', flexDirection: 'column' }}>
            {model.map((item, index) => (
              <BapsMenuItem
                key={index}
                title={item.label}
                {...(item.icon === undefined ? {} : { icon: item.icon })}
                media={item.icon ? 'icon' : 'none'}
                {...(item.disabled === undefined
                  ? {}
                  : { disabled: item.disabled })}
                brand={brand}
                onActivated={(e?: unknown) => {
                  // In React, onActivated doesn't pass event directly yet but we can mock it
                  handleItemClick(item, e as ReactMouseEvent<HTMLElement>);
                }}
              />
            ))}
          </div>
        </BapsPopover>
      </div>
    );

    return createElement(
      'baps-split-button',
      {
        ref,
        className: joinClassNames(
          brand === 'sampark' && 'baps-ds-sampark baps-sampark',
          size === 'xlarge' && 'baps-splitbutton-xl'
        ),
      },
      content
    );
  }
);
BapsSplitButton.displayName = 'BapsSplitButton';
