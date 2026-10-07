import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsNavbarBrand = 'mybky' | 'sampark';
export type BapsNavbarTopbarTheme = 'indigo' | 'light';

export type BapsNavbarProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  logo?: string;
  title?: ReactNode;
  version?: ReactNode;
  ariaLabel?: string;
  brand?: BapsNavbarBrand;
  topbarTheme?: BapsNavbarTopbarTheme;
  menuButton?: boolean;
  menuOpen?: boolean;
  onMenuToggle?: (open: boolean) => void;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: (open: boolean) => void;
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export function BapsNavbar({
  logo,
  title,
  version,
  ariaLabel,
  brand = 'mybky',
  topbarTheme = 'indigo',
  menuButton = false,
  menuOpen = false,
  onMenuToggle,
  mobileMenuOpen = false,
  onMobileMenuToggle,
  start,
  center,
  end,
  children,
  className,
  ref,
  ...nativeProps
}: BapsNavbarProps): ReactElement {
  const content = (
    <nav
      className={joinClassNames(
        'baps-navbar',
        className,
      )}
      aria-label={ariaLabel || 'Main navigation'}
    >
      <div className="baps-navbar__start">
        {logo && (
          <span className="baps-navbar__logo" aria-hidden="true">
            <img src={logo} alt={(typeof title === 'string' ? title : '') || 'Logo'} className="baps-navbar__logo-img" />
          </span>
        )}
        {title && <span className="baps-navbar__title">{title}</span>}
        {version && <span className="baps-navbar__version">{version}</span>}
        {start}

        {menuButton && (
          <button
            type="button"
            className="baps-navbar__menu-button"
            aria-label={menuOpen ? 'Collapse menu' : 'Expand menu'}
            aria-expanded={menuOpen}
            onClick={() => onMenuToggle?.(!menuOpen)}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      <div className="baps-navbar__center">{center}</div>

      <div className="baps-navbar__end">
        {end}
        {children}
      </div>

      {/* Mobile only (<=767px): toggles the actions row */}
      <button
        type="button"
        className="baps-navbar__mobile-button"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        onClick={() => onMobileMenuToggle?.(!mobileMenuOpen)}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </nav>
  );

  return createElement(
    'baps-navbar',
    {
      ref,
      ...nativeProps,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        topbarTheme === 'light' && 'baps-navbar-topbar-light',
        menuOpen && 'baps-navbar-menu-open',
        mobileMenuOpen && 'baps-navbar-mobile-open',
      ),
    },
    content
  );
}

BapsNavbar.displayName = 'BapsNavbar';
