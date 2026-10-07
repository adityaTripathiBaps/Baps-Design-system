import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';

export interface BapsPopoverRef {
  toggle: (event: ReactMouseEvent<HTMLElement> | Event) => void;
  show: (event: ReactMouseEvent<HTMLElement> | Event) => void;
  hide: () => void;
}

export interface BapsPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  dismissable?: boolean;
  focusOnShow?: boolean;
  ariaLabel?: string;
  appendTo?: HTMLElement | 'body' | null;
  autoZIndex?: boolean;
  baseZIndex?: number;
  brand?: 'mybky' | 'sampark';
  onShow?: () => void;
  onHide?: () => void;
  children?: ReactNode;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export const BapsPopover = forwardRef<BapsPopoverRef, BapsPopoverProps>(
  (
    {
      dismissable = true,
      focusOnShow = true,
      ariaLabel,
      appendTo = 'body',
      autoZIndex = true,
      baseZIndex = 0,
      brand = 'mybky',
      onShow,
      onHide,
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const [style, setStyle] = useState<{ left: number; top: number; zIndex?: number; transformOrigin?: string }>({ left: 0, top: 0 });
    const popoverRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLElement | null>(null);

    const calculatePosition = (target: HTMLElement) => {
      const targetRect = target.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      return {
        left: targetRect.left + scrollLeft,
        top: targetRect.bottom + scrollTop + 4, // 4px gap
        transformOrigin: 'top center'
      };
    };

    const show = (event: ReactMouseEvent<HTMLElement> | Event) => {
      const e = event as any;
      const target = (e.currentTarget || e.target) as HTMLElement;
      targetRef.current = target;
      
      setStyle({
        ...calculatePosition(target),
        ...(autoZIndex ? { zIndex: baseZIndex + 1000 } : {})
      });
      
      setVisible(true);
      onShow?.();
    };

    const hide = () => {
      setVisible(false);
      targetRef.current = null;
      onHide?.();
    };

    const toggle = (event: ReactMouseEvent<HTMLElement> | Event) => {
      if (visible) {
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
      if (!visible || !dismissable) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(event.target as Node) &&
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
        if (visible && targetRef.current) {
          setStyle(prev => ({
            ...prev,
            ...calculatePosition(targetRef.current!)
          }));
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true); // capture scroll

      if (focusOnShow && popoverRef.current) {
        popoverRef.current.focus();
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    }, [visible, dismissable, focusOnShow]);

    if (!visible) return null;

    const content = (
      <div
        ref={popoverRef}
        className={joinClassNames(
          'p-popover p-component p-connected-overlay-enter-done',
          brand === 'sampark' && 'baps-popover-sampark',
          className
        )}
        style={{
          ...style,
          position: 'absolute',
        }}
        aria-label={ariaLabel}
        role="dialog"
        tabIndex={-1}
        {...nativeProps}
      >
        <div className="p-popover-content">
          {children}
        </div>
      </div>
    );

    const targetElement = appendTo === 'body' ? document.body : (appendTo || document.body);

    return createPortal(
      createElement(
        'baps-popover',
        { className: joinClassNames(brand === 'sampark' && 'baps-ds-sampark') },
        content
      ),
      targetElement
    );
  }
);
BapsPopover.displayName = 'BapsPopover';
