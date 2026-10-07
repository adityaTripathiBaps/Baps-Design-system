import {
  type HTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  forwardRef,
} from 'react';

export interface BapsTabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const BapsTabsContext = createContext<BapsTabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(BapsTabsContext);
  if (!context) {
    throw new Error('Tabs components must be rendered within a BapsTabs');
  }
  return context;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

// --- Root ---

export interface BapsTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  brand?: 'mybky' | 'sampark';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export const BapsTabs = forwardRef<HTMLDivElement, BapsTabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      brand = 'mybky',
      size,
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue ?? ''
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    const contextValue = useMemo(
      () => ({ value: currentValue, onValueChange: handleValueChange }),
      [currentValue, handleValueChange]
    );

    return (
      <BapsTabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={joinClassNames(
            'p-tabs p-component',
            brand === 'sampark' && 'baps-sampark',
            size === 'small' && 'baps-tabs-sm',
            size === 'medium' && 'baps-tabs-md',
            size === 'large' && 'baps-tabs-lg',
            className
          )}
          data-pc-name="tabs"
          data-pc-section="root"
          {...nativeProps}
        >
          {children}
        </div>
      </BapsTabsContext.Provider>
    );
  }
);
BapsTabs.displayName = 'BapsTabs';

// --- TabList ---

export interface BapsTabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const BapsTabList = forwardRef<HTMLDivElement, BapsTabListProps>(
  ({ className, children, ...nativeProps }, ref) => {
    return (
      <div
        ref={ref}
        className={joinClassNames('p-tablist', className)}
        data-pc-name="tablist"
        data-pc-section="root"
        {...nativeProps}
      >
        <div className="p-tablist-content">
          <div className="p-tablist-tab-list" role="tablist">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
BapsTabList.displayName = 'BapsTabList';

// --- Tab ---

export interface BapsTabProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export const BapsTab = forwardRef<HTMLButtonElement, BapsTabProps>(
  ({ value, disabled, className, children, ...nativeProps }, ref) => {
    const { value: activeValue, onValueChange } = useTabsContext();
    const isActive = activeValue === value;

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        className={joinClassNames(
          'p-tab',
          isActive && 'p-tab-active',
          className
        )}
        aria-selected={isActive}
        disabled={disabled}
        data-pc-name="tab"
        data-p-active={isActive}
        data-p-disabled={disabled}
        onClick={(e) => {
          if (!disabled) {
            onValueChange(value);
          }
          if (nativeProps.onClick) {
            nativeProps.onClick(e);
          }
        }}
        {...nativeProps}
      >
        {children}
      </button>
    );
  }
);
BapsTab.displayName = 'BapsTab';

// --- TabPanels ---

export interface BapsTabPanelsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const BapsTabPanels = forwardRef<HTMLDivElement, BapsTabPanelsProps>(
  ({ className, children, ...nativeProps }, ref) => {
    return (
      <div
        ref={ref}
        className={joinClassNames('p-tabpanels', className)}
        data-pc-name="tabpanels"
        data-pc-section="root"
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
);
BapsTabPanels.displayName = 'BapsTabPanels';

// --- TabPanel ---

export interface BapsTabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export const BapsTabPanel = forwardRef<HTMLDivElement, BapsTabPanelProps>(
  ({ value, className, children, ...nativeProps }, ref) => {
    const { value: activeValue } = useTabsContext();
    const isActive = activeValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={joinClassNames('p-tabpanel', className)}
        data-pc-name="tabpanel"
        data-p-active={true}
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
);
BapsTabPanel.displayName = 'BapsTabPanel';
