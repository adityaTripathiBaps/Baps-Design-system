import {
  createElement,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';

export interface MenuItem {
  label?: string;
  icon?: string;
  command?: (event: {
    originalEvent: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>;
    item: MenuItem;
  }) => void;
  url?: string;
  items?: MenuItem[];
  expanded?: boolean;
  disabled?: boolean;
  visible?: boolean;
  target?: string;
  separator?: boolean;
  styleClass?: string;
  badge?: string;
  title?: string;
  id?: string;
  ariaLabel?: string;
}

export interface BapsMenuRef {
  toggle: (event: ReactMouseEvent<HTMLElement> | Event) => void;
  show: (event: ReactMouseEvent<HTMLElement> | Event) => void;
  hide: () => void;
}

export interface BapsMenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  model?: MenuItem[];
  popup?: boolean;
  appendTo?: HTMLElement | 'body' | null;
  autoZIndex?: boolean;
  baseZIndex?: number;
  brand?: 'mybky' | 'sampark';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  onShow?: () => void;
  onHide?: () => void;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export const BapsMenu = forwardRef<BapsMenuRef, BapsMenuProps>(
  (
    {
      model = [],
      popup = false,
      appendTo = 'body',
      autoZIndex = true,
      baseZIndex = 0,
      brand = 'mybky',
      ariaLabel,
      ariaLabelledBy,
      onShow,
      onHide,
      className,
      ...nativeProps
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(!popup);
    const [style, setStyle] = useState<{
      left: number;
      top: number;
      zIndex?: number;
    }>({ left: 0, top: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLElement | null>(null);

    const calculatePosition = (target: HTMLElement) => {
      const targetRect = target.getBoundingClientRect();
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      return {
        left: targetRect.left + scrollLeft,
        top: targetRect.bottom + scrollTop + 4,
      };
    };

    const show = (event: ReactMouseEvent<HTMLElement> | Event) => {
      const e = event as unknown as { currentTarget?: HTMLElement; target?: HTMLElement };
      const target = (e.currentTarget || e.target) as HTMLElement;
      targetRef.current = target;

      setStyle({
        ...calculatePosition(target),
        ...(autoZIndex ? { zIndex: baseZIndex + 1000 } : {}),
      });

      setVisible(true);
      onShow?.();
    };

    const hide = () => {
      if (popup) {
        setVisible(false);
      }
      targetRef.current = null;
      onHide?.();
    };

    const toggle = (event: ReactMouseEvent<HTMLElement> | Event) => {
      if (visible && popup) {
        hide();
      } else {
        show(event);
      }
    };

    useImperativeHandle(ref, () => ({
      toggle,
      show,
      hide,
    }));

    useEffect(() => {
      if (!popup || !visible) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          targetRef.current &&
          !targetRef.current.contains(event.target as Node)
        ) {
          hide();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          hide();
        }
      };

      const handleResize = () => {
        const target = targetRef.current;
        if (visible && target) {
          setStyle((prev) => ({
            ...prev,
            ...calculatePosition(target),
          }));
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    }, [popup, visible]);

    if (popup && !visible) return null;

    const renderItems = (items: MenuItem[]) =>
      items
        .filter((item) => item.visible !== false)
        .map((item, idx) => {
          if (item.separator) {
            return (
              <li
                key={`sep-${idx}`}
                className="p-menu-separator"
                role="separator"
              />
            );
          }

          if (item.items && item.items.length > 0) {
            return (
              <li key={`sub-${item.label || idx}`} role="none">
                <div className="p-menu-submenu-item" role="none">
                  <span className="p-menu-submenu-label">{item.label}</span>
                </div>
                <ul className="p-menu-list" role="none">
                  {renderItems(item.items)}
                </ul>
              </li>
            );
          }

          return (
            <li
              key={item.id || item.label || `item-${idx}`}
              className={joinClassNames(
                'p-menu-item',
                item.disabled && 'p-disabled',
                item.styleClass,
              )}
              role="none"
            >
              <div className="p-menu-item-content">
                <a
                  href={item.url || '#'}
                  target={item.target}
                  className="p-menu-item-link"
                  role="menuitem"
                  tabIndex={item.disabled ? -1 : 0}
                  aria-disabled={item.disabled ? true : undefined}
                  aria-label={item.ariaLabel}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                      return;
                    }
                    if (!item.url) {
                      e.preventDefault();
                    }
                    item.command?.({ originalEvent: e, item });
                    if (popup) {
                      hide();
                    }
                  }}
                >
                  {item.icon && (
                    <span
                      className={joinClassNames('p-menu-item-icon', item.icon)}
                      aria-hidden="true"
                    />
                  )}
                  <span className="p-menu-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="p-menu-item-badge">{item.badge}</span>
                  )}
                </a>
              </div>
            </li>
          );
        });

    const menuContent = (
      <div
        ref={menuRef}
        className={joinClassNames(
          'p-menu p-component',
          popup && 'p-menu-overlay',
          brand === 'sampark' && 'baps-menu-sampark',
          className,
        )}
        style={{
          ...(popup ? { ...style, position: 'absolute' } : {}),
        }}
        role="menu"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...nativeProps}
      >
        <ul className="p-menu-list" role="none">
          {renderItems(model)}
        </ul>
      </div>
    );

    if (!popup) {
      return createElement(
        'baps-menu',
        { className: joinClassNames(brand === 'sampark' && 'baps-ds-sampark') },
        menuContent,
      );
    }

    const targetElement =
      appendTo === 'body' ? document.body : appendTo || document.body;

    return createPortal(
      createElement(
        'baps-menu',
        { className: joinClassNames(brand === 'sampark' && 'baps-ds-sampark') },
        menuContent,
      ),
      targetElement,
    );
  },
);

BapsMenu.displayName = 'BapsMenu';
