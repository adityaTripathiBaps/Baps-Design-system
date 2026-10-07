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
import { BapsIcon, type BapsIconName } from '../icon/icon.js';
import { BapsOverlayBadge } from '../badge/overlay-badge.js';

export type StepperValue = string | number;

export interface BapsStepperContextValue {
  value: StepperValue;
  linear: boolean;
  onValueChange: (value: StepperValue) => void;
  brand: 'mybky' | 'sampark';
  railPosition: 'top' | 'bottom';
  id: string;
}

const BapsStepperContext = createContext<BapsStepperContextValue | null>(null);

function useStepperContext() {
  const context = useContext(BapsStepperContext);
  if (!context) {
    throw new Error('Stepper components must be rendered within a BapsStepper');
  }
  return context;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

// Generate a simple unique ID for accessibility ties if none provided
let nextId = 0;
function useId(providedId?: string) {
  const [id] = useState(() => providedId || `baps-stepper-${nextId++}`);
  return id;
}

// --- Root ---

export interface BapsStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: StepperValue;
  defaultValue?: StepperValue;
  onValueChange?: (value: StepperValue) => void;
  brand?: 'mybky' | 'sampark';
  linear?: boolean;
  railPosition?: 'top' | 'bottom';
  children: ReactNode;
}

export const BapsStepper = forwardRef<HTMLDivElement, BapsStepperProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      brand = 'mybky',
      linear = false,
      railPosition = 'top',
      id: providedId,
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const id = useId(providedId);
    const initialValue = defaultValue ?? '';
    const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
    
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = useCallback(
      (newValue: StepperValue) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    const contextValue = useMemo(
      () => ({ 
        value: currentValue, 
        linear, 
        onValueChange: handleValueChange,
        brand,
        railPosition,
        id
      }),
      [currentValue, linear, handleValueChange, brand, railPosition, id]
    );

    return (
      <BapsStepperContext.Provider value={contextValue}>
        <div
          ref={ref}
          id={id}
          className={joinClassNames(
            'p-stepper p-component',
            brand === 'sampark' && 'baps-sampark',
            linear && 'p-stepper-linear',
            className
          )}
          data-pc-name="stepper"
          data-pc-section="root"
          {...nativeProps}
        >
          {children}
        </div>
      </BapsStepperContext.Provider>
    );
  }
);
BapsStepper.displayName = 'BapsStepper';

// --- StepList ---

export interface BapsStepListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const BapsStepList = forwardRef<HTMLDivElement, BapsStepListProps>(
  ({ className, children, ...nativeProps }, ref) => {
    return (
      <div 
        ref={ref}
        className={joinClassNames('baps-stepper-rail-wrap', className)}
        {...nativeProps}
      >
        <ul className="p-stepper-nav" role="tablist" data-pc-section="nav">
          {children}
        </ul>
      </div>
    );
  }
);
BapsStepList.displayName = 'BapsStepList';

// --- Step ---

export interface BapsStepProps extends Omit<HTMLAttributes<HTMLLIElement>, 'value'> {
  value: StepperValue;
  label?: string;
  icon?: BapsIconName;
  status?: 'completed' | 'in-progress' | 'invalid';
  required?: boolean;
  locked?: boolean;
  disabled?: boolean;
  index?: number;
}

export const BapsStep = forwardRef<HTMLLIElement, BapsStepProps>(
  (
    {
      value,
      label,
      icon,
      status,
      required = false,
      locked = false,
      disabled = false,
      index, // For numbered steps
      className,
      ...nativeProps
    },
    ref
  ) => {
    const { value: activeValue, linear, onValueChange, id } = useStepperContext();
    
    const isActive = activeValue === value;
    const isCompleted = status === 'completed';
    const isLocked = locked || (linear && !isActive && !isCompleted); // Basic linear logic
    const isDisabled = disabled || isLocked;

    const handleClick = () => {
      if (!isDisabled) {
        onValueChange(value);
      }
    };

    const getBtnClass = () => {
      const parts = ['baps-step__btn'];
      if (isActive) parts.push('baps-step__btn--active');
      else if (status) parts.push('baps-step__btn--' + status);
      if (locked) parts.push('baps-step__btn--locked');
      return parts.join(' ');
    };

    // If icon is provided, render BAPS custom step rail shape
    if (icon) {
      return (
        <li
          ref={ref}
          className={joinClassNames('p-stepper-action', isActive && 'p-highlight', className)}
          role="presentation"
          {...nativeProps}
        >
          <button
            type="button"
            className="p-stepper-action"
            style={{ display: 'none' }} // Hide native prime button in custom mode? Wait, Angular just stamped custom content in ng-template
          ></button>
          
          <span className="baps-step__connector"></span>
          <span className="baps-step">
            <span className="baps-step__icon-wrap">
              <BapsOverlayBadge
                severity="danger"
                badgeSize="small"
                badgeDisabled={!required}
              >
                <button
                  type="button"
                  role="tab"
                  className={getBtnClass()}
                  disabled={isLocked}
                  id={`${id}_step_${value}`}
                  aria-controls={`${id}_steppanel_${value}`}
                  aria-selected={isActive}
                  aria-label={label}
                  aria-current={isActive ? 'step' : undefined}
                  onClick={handleClick}
                >
                  <BapsIcon
                    className="baps-step__icon"
                    name={icon}
                    size={isActive ? 32 : 24}
                  />
                </button>
              </BapsOverlayBadge>
            </span>
            <span className="baps-step__label">{label}</span>
          </span>
          <span className="baps-step__connector"></span>
        </li>
      );
    }

    // Standard prime numbered step
    return (
      <li
        ref={ref}
        className={joinClassNames(
          'p-stepper-action',
          isActive && 'p-highlight',
          isCompleted && 'p-stepper-completed',
          className
        )}
        role="presentation"
        {...nativeProps}
      >
        <button
          type="button"
          role="tab"
          className="p-stepper-action"
          disabled={isDisabled}
          id={`${id}_step_${value}`}
          aria-controls={`${id}_steppanel_${value}`}
          aria-selected={isActive}
          aria-current={isActive ? 'step' : undefined}
          onClick={handleClick}
        >
          <span className="p-stepper-number">{index !== undefined ? index : value}</span>
          <span className="p-stepper-title">
            {label}
            {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
          </span>
        </button>
      </li>
    );
  }
);
BapsStep.displayName = 'BapsStep';

// --- StepPanels ---

export interface BapsStepPanelsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const BapsStepPanels = forwardRef<HTMLDivElement, BapsStepPanelsProps>(
  ({ className, children, ...nativeProps }, ref) => {
    return (
      <div 
        ref={ref}
        className={joinClassNames('p-stepper-panels', className)}
        data-pc-section="panels"
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
);
BapsStepPanels.displayName = 'BapsStepPanels';

// --- StepPanel ---

export interface BapsStepPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'value'> {
  value: StepperValue;
  children: ReactNode;
}

export const BapsStepPanel = forwardRef<HTMLDivElement, BapsStepPanelProps>(
  ({ value, className, children, ...nativeProps }, ref) => {
    const { value: activeValue, id } = useStepperContext();
    const isActive = activeValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        className={joinClassNames('p-stepper-panel', className)}
        role="tabpanel"
        id={`${id}_steppanel_${value}`}
        aria-labelledby={`${id}_step_${value}`}
        data-pc-name="steppanel"
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
);
BapsStepPanel.displayName = 'BapsStepPanel';
