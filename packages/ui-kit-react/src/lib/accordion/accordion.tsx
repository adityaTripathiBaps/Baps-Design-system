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

export type AccordionValue = string | number | (string | number)[];

export interface BapsAccordionContextValue {
  value: AccordionValue;
  multiple: boolean;
  onValueChange: (value: AccordionValue) => void;
}

const BapsAccordionContext = createContext<BapsAccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(BapsAccordionContext);
  if (!context) {
    throw new Error('Accordion components must be rendered within a BapsAccordion');
  }
  return context;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

// --- Root ---

export interface BapsAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  brand?: 'mybky' | 'sampark';
  multiple?: boolean;
  children: ReactNode;
}

export const BapsAccordion = forwardRef<HTMLDivElement, BapsAccordionProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      brand = 'mybky',
      multiple = false,
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const initialValue = defaultValue ?? (multiple ? [] : '');
    const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
    
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = useCallback(
      (newValue: AccordionValue) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    const contextValue = useMemo(
      () => ({ value: currentValue, multiple, onValueChange: handleValueChange }),
      [currentValue, multiple, handleValueChange]
    );

    return (
      <BapsAccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={joinClassNames(
            'p-accordion p-component',
            brand === 'sampark' && 'baps-sampark',
            className
          )}
          data-pc-name="accordion"
          data-pc-section="root"
          {...nativeProps}
        >
          {children}
        </div>
      </BapsAccordionContext.Provider>
    );
  }
);
BapsAccordion.displayName = 'BapsAccordion';

// --- Panel ---

export interface BapsAccordionPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string | number;
  label: ReactNode;
  count?: ReactNode;
  disabled?: boolean;
  clearable?: boolean;
  divider?: boolean;
  onClear?: () => void;
  children?: ReactNode;
}

export const BapsAccordionPanel = forwardRef<HTMLDivElement, BapsAccordionPanelProps>(
  (
    {
      value,
      label,
      count,
      disabled = false,
      clearable = false,
      divider = true,
      onClear,
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const { value: activeValue, multiple, onValueChange } = useAccordionContext();
    
    const isActive = multiple 
      ? Array.isArray(activeValue) && activeValue.includes(value)
      : activeValue === value;

    const toggle = () => {
      if (disabled) return;
      
      if (multiple) {
        const arr = Array.isArray(activeValue) ? [...activeValue] : (activeValue ? [activeValue] : []);
        const index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        } else {
          arr.push(value);
        }
        onValueChange(arr);
      } else {
        onValueChange(isActive ? '' : value);
      }
    };

    const hasCount = count !== undefined && count !== null;
    const showClear = clearable && hasCount && Number(count) > 0;

    return (
      <div
        ref={ref}
        className={joinClassNames(
          'p-accordionpanel',
          disabled && 'p-disabled',
          className
        )}
        data-p-active={isActive}
        data-pc-name="accordionpanel"
        {...nativeProps}
      >
        <button
          type="button"
          className={joinClassNames(
            'p-accordionheader',
            isActive && 'p-accordionheader-active'
          )}
          aria-expanded={isActive}
          disabled={disabled}
          onClick={toggle}
          data-pc-section="header"
          data-p-active={isActive}
        >
          {hasCount && (
            <span className="baps-accordion-count" aria-hidden="true">{count}</span>
          )}
          <span className="baps-accordion-label">{label}</span>
          
          {showClear && (
            <button
              type="button"
              className="baps-accordion-clear"
              aria-label={`Clear ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
            >
              <i className="pi pi-times-circle" aria-hidden="true"></i>
            </button>
          )}
          
          <i 
            className={joinClassNames(
              'pi', 
              isActive ? 'pi-chevron-down' : 'pi-chevron-right'
            )} 
            aria-hidden="true" 
          />
        </button>
        
        {isActive && (
          <div className="p-accordioncontent" data-pc-section="content">
            <div className="p-accordioncontent-content">
              <div className="baps-accordion-body">
                {divider && <span className="baps-accordion-divider" />}
                {children}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
BapsAccordionPanel.displayName = 'BapsAccordionPanel';
