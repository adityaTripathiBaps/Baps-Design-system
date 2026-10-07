import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
  Fragment,
} from 'react';

export interface BreadcrumbItem {
  label?: string;
  icon?: string;
  url?: string;
  command?: () => void;
  /** For Next.js/React Router link components */
  template?: ReactElement;
}

export interface BapsBreadcrumbProps extends HTMLAttributes<HTMLElement> {
  model?: BreadcrumbItem[];
  home?: BreadcrumbItem;
  brand?: 'mybky' | 'sampark';
  ref?: Ref<HTMLElement>;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export function BapsBreadcrumb({
  model = [],
  home,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsBreadcrumbProps): ReactElement {
  // PrimeNG renders home followed by a separator if there are other items
  const allItems = [];
  if (home) {
    allItems.push(home);
  }
  allItems.push(...model);

  const content = (
    <nav className={joinClassNames('p-breadcrumb p-component', className)}>
      <ol className="p-breadcrumb-list">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          let itemContent = null;
          if (item.template) {
            itemContent = item.template;
          } else if (item.url || item.command) {
            itemContent = (
              <a
                className="p-breadcrumb-item-link"
                href={item.url}
                onClick={(e) => {
                  if (item.command) {
                    e.preventDefault();
                    item.command();
                  }
                }}
              >
                {item.icon && (
                  <span className={joinClassNames(
                    'p-breadcrumb-home-icon',
                    item.icon
                  )} aria-hidden="true"></span>
                )}
                {item.label && <span className="p-breadcrumb-item-label">{item.label}</span>}
              </a>
            );
          } else {
            itemContent = (
              <span className="p-breadcrumb-item-link">
                {item.icon && (
                  <span className={joinClassNames(
                    'p-breadcrumb-home-icon',
                    item.icon
                  )} aria-hidden="true"></span>
                )}
                {item.label && <span className="p-breadcrumb-item-label">{item.label}</span>}
              </span>
            );
          }

          return (
            <Fragment key={index}>
              <li className="p-breadcrumb-item">{itemContent}</li>
              {!isLast && (
                <li className="p-breadcrumb-separator">
                  <span className="pi pi-chevron-right" aria-hidden="true"></span>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );

  return createElement(
    'baps-breadcrumb',
    {
      ref,
      ...nativeProps,
      className: joinClassNames(brand === 'sampark' && 'baps-sampark'),
    },
    content
  );
}

BapsBreadcrumb.displayName = 'BapsBreadcrumb';
