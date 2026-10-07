import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useState,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
} from 'react';
import { createPortal } from 'react-dom';

export interface BapsTooltipProps extends HTMLAttributes<HTMLDivElement> {
  content?: string;
  tooltipTitle?: string;
  tooltipLinkLabel?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  brand?: 'mybky' | 'sampark';
  children: ReactNode;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

export const BapsTooltip = forwardRef<HTMLDivElement, BapsTooltipProps>(
  (
    {
      content,
      tooltipTitle,
      tooltipLinkLabel,
      tooltipPosition = 'top',
      brand = 'mybky',
      className,
      children,
      ...nativeProps
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const [style, setStyle] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
    const targetRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const isRich = !!tooltipTitle;

    const calculatePosition = (target: HTMLElement, tooltipEl: HTMLElement) => {
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      let left = 0;
      let top = 0;

      switch (tooltipPosition) {
        case 'top':
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          top = targetRect.top - tooltipRect.height - 4;
          break;
        case 'bottom':
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          top = targetRect.bottom + 4;
          break;
        case 'left':
          left = targetRect.left - tooltipRect.width - 4;
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          break;
        case 'right':
          left = targetRect.right + 4;
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          break;
      }

      return {
        left: left + scrollLeft,
        top: top + scrollTop
      };
    };

    const show = () => {
      setVisible(true);
    };

    const hide = () => {
      setVisible(false);
    };

    useEffect(() => {
      if (visible && targetRef.current && tooltipRef.current) {
        setStyle(calculatePosition(targetRef.current, tooltipRef.current));
      }
    }, [visible, tooltipPosition]);

    const handleMouseEnter = () => show();
    const handleMouseLeave = () => hide();
    const handleFocus = () => show();
    const handleBlur = () => hide();

    const triggerProps = {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };

    const triggerElement = isValidElement(children)
      ? cloneElement(children as any, {
          ...triggerProps,
          ref: (node: HTMLElement) => {
            targetRef.current = node;
            const originalRef = (children as any).ref;
            if (typeof originalRef === 'function') {
              originalRef(node);
            } else if (originalRef) {
              originalRef.current = node;
            }
          }
        })
      : (
          <span
            ref={targetRef as any}
            {...triggerProps}
            style={{ display: 'inline-block' }}
          >
            {children}
          </span>
        );

    const tooltipContent = (
      <div
        ref={(node) => {
          tooltipRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={joinClassNames(
          'p-tooltip p-component p-tooltip-active',
          `p-tooltip-${tooltipPosition}`,
          isRich && brand === 'sampark' && 'baps-tooltip-rich',
          className
        )}
        style={{
          ...style,
          position: 'absolute',
          zIndex: 1000,
        }}
        role="tooltip"
        {...nativeProps}
      >
        <div className="p-tooltip-arrow"></div>
        <div className="p-tooltip-text">
          {isRich ? (
            <>
              {tooltipTitle && <span className="baps-tooltip-title">{tooltipTitle}</span>}
              {content && <span className="baps-tooltip-text">{content}</span>}
              {tooltipLinkLabel && (
                <span className="baps-tooltip-link">
                  {tooltipLinkLabel} <span className="baps-tooltip-link-arrow">&#8594;</span>
                </span>
              )}
            </>
          ) : (
            content
          )}
        </div>
      </div>
    );

    return (
      <>
        {triggerElement}
        {visible && createPortal(
          createElement(
            'baps-tooltip',
            { className: joinClassNames(brand === 'sampark' && 'baps-ds-sampark') },
            tooltipContent
          ),
          document.body
        )}
      </>
    );
  }
);
BapsTooltip.displayName = 'BapsTooltip';
