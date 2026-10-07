import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';

export interface InternalNavItem {
  label: string;
  icon?: string;
  iconName?: BapsIconName;
  routerLink?: string | any[];
  command?: () => void;
  disabled?: boolean;
  separator?: boolean;
  badge?: ReactNode;
  notification?: boolean;
  children?: InternalNavItem[];
}

export interface InternalNavRow {
  item: InternalNavItem;
  level: number;
}

export type BapsInternalNavbarBrand = 'mybky' | 'sampark';

export type BapsInternalNavbarProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  items?: InternalNavItem[];
  activeItem?: string;
  title?: ReactNode;
  collapsed?: boolean;
  ariaLabel?: string;
  brand?: BapsInternalNavbarBrand;
  onItemClick?: (item: InternalNavItem) => void;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export function BapsInternalNavbar({
  items = [],
  activeItem,
  title,
  collapsed = false,
  ariaLabel,
  brand = 'mybky',
  onItemClick,
  children,
  className,
  ref,
  ...nativeProps
}: BapsInternalNavbarProps): ReactElement {
  const [expandedItems, setExpandedItems] = useState<Set<InternalNavItem>>(
    new Set(),
  );

  const hasChildren = useCallback((item: InternalNavItem): boolean => {
    return !!item.children?.length;
  }, []);

  const isExpanded = useCallback(
    (item: InternalNavItem): boolean => expandedItems.has(item),
    [expandedItems],
  );

  const hasNesting = useMemo(() => {
    return !collapsed && items.some((i) => !!i.children?.length);
  }, [collapsed, items]);

  const rows = useMemo(() => {
    const out: InternalNavRow[] = [];
    const walk = (list: InternalNavItem[], level: number): void => {
      for (const item of list) {
        out.push({ item, level });
        if (!collapsed && item.children?.length && expandedItems.has(item)) {
          walk(item.children, level + 1);
        }
      }
    };
    walk(items, 0);
    return out;
  }, [items, collapsed, expandedItems]);

  const handleItemClick = (item: InternalNavItem) => {
    if (item.disabled) return;

    if (hasChildren(item)) {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        return next;
      });
    }

    if (item.command) item.command();
    if (onItemClick) onItemClick(item);
  };

  const content = (
    <nav
      className={joinClassNames(
        'baps-internal-nav',
        collapsed && 'baps-internal-nav--collapsed',
        className,
      )}
      aria-label={ariaLabel || 'Section navigation'}
      title={undefined}
    >
      {title && (
        <div className="baps-internal-nav__header">
          <span className="baps-internal-nav__title">{title}</span>
        </div>
      )}
      <ul className="baps-internal-nav__list">
        {rows.map((row, index) => {
          const item = row.item;
          if (item.separator) {
            return <li key={`sep-${index}`} className="baps-internal-nav__separator" />;
          }

          const key = item.label ? `${item.label}-${index}` : `item-${index}`;

          return (
            <li
              key={key}
              className={joinClassNames(
                'baps-internal-nav__item',
                activeItem === item.label && 'baps-internal-nav__item--active',
                item.disabled && 'baps-internal-nav__item--disabled',
              )}
              data-level={row.level || undefined}
              aria-level={hasNesting ? row.level + 1 : undefined}
            >
              <button
                className="baps-internal-nav__link"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                aria-current={activeItem === item.label ? 'page' : undefined}
                aria-label={
                  !collapsed || brand === 'sampark' ? undefined : item.label
                }
                aria-expanded={hasChildren(item) ? isExpanded(item) : undefined}
                type="button"
              >
                <span className="baps-internal-nav__bar" aria-hidden="true" />
                {hasNesting && (
                  <span
                    className={joinClassNames(
                      'baps-internal-nav__chevron',
                      isExpanded(item) && 'baps-internal-nav__chevron--open',
                      !hasChildren(item) && 'baps-internal-nav__chevron--empty',
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3.5 1.5 3.5 3.5-3.5 3.5" />
                    </svg>
                  </span>
                )}
                
                {item.iconName ? (
                  <BapsIcon className="baps-internal-nav__icon" name={item.iconName} />
                ) : item.icon ? (
                  <i
                    className={joinClassNames('baps-internal-nav__icon pi', item.icon)}
                    aria-hidden="true"
                  />
                ) : null}

                {(!collapsed || brand === 'sampark') && (
                  <span className="baps-internal-nav__label">{item.label}</span>
                )}
                {item.badge && !collapsed && (
                  <span className="baps-internal-nav__badge">{item.badge}</span>
                )}
                {item.notification && collapsed && (
                  <span className="baps-internal-nav__status-dot" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="baps-internal-nav__footer">{children}</div>
    </nav>
  );

  return createElement(
    'baps-internal-navbar',
    {
      ref,
      ...nativeProps,
      className: joinClassNames(brand === 'sampark' && 'baps-sampark'),
    },
    content
  );
}

BapsInternalNavbar.displayName = 'BapsInternalNavbar';
