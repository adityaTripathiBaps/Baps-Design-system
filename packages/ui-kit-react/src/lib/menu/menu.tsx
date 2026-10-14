import {
  createElement,
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
  visible?: boolean;
  icon?: string;
  styleClass?: string;
  routerLink?: string;
  items?: MenuItem[];
  command?: (event: {
    originalEvent: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>;
    item: MenuItem;
  }) => void;
  disabled?: boolean;
}

type BapsMenuToggleEvent = ReactMouseEvent<HTMLElement> | Event;

export interface BapsMenuRef {
  toggle: (event: BapsMenuToggleEvent) => void;
}

export interface BapsMenuProps {
  model?: MenuItem[];
  popup?: boolean;
  appendTo?: HTMLElement | 'body' | null;
  brand?: 'mybky' | 'sampark';
  styleClass?: string;
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
      brand = 'mybky',
      styleClass,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(!popup);
    const [style, setStyle] = useState<{
      left: number;
      top: number;
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
        top: targetRect.bottom + scrollTop,
      };
    };

    const show = (event: BapsMenuToggleEvent) => {
      const eventTarget = event.currentTarget ?? event.target;
      if (!(eventTarget instanceof HTMLElement)) return;

      const target = eventTarget;
      targetRef.current = target;

      setStyle(calculatePosition(target));

      setVisible(true);
    };

    const hide = () => {
      if (popup) {
        setVisible(false);
      }
      targetRef.current = null;
    };

    const toggle = (event: BapsMenuToggleEvent) => {
      if (visible && popup) {
        hide();
      } else {
        show(event);
      }
    };

    useImperativeHandle(ref, () => ({ toggle }));

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
              key={item.label || `item-${idx}`}
              className={joinClassNames(
                'p-menu-item',
                item.disabled && 'p-disabled',
                item.styleClass,
              )}
              role="none"
            >
              <div className="p-menu-item-content">
                <a
                  href={item.routerLink || '#'}
                  className="p-menu-item-link"
                  role="menuitem"
                  tabIndex={item.disabled ? -1 : 0}
                  aria-disabled={item.disabled ? true : undefined}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                      return;
                    }
                    if (!item.routerLink) {
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
          styleClass,
        )}
        style={{
          ...(popup ? { ...style, position: 'absolute' } : {}),
        }}
        role="menu"
        aria-label="Menu"
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
