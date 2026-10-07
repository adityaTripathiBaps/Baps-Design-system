import {
  createElement,
  type DialogHTMLAttributes,
  type ReactNode,
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';
import { BapsButton } from '../button/button.js';

export type BapsDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface BapsDrawerProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title'> {
  visible: boolean;
  onVisibleChange?: (visible: boolean) => void;
  header?: string;
  brand?: 'mybky' | 'sampark';
  position?: BapsDrawerPosition;
  modal?: boolean;
  dismissible?: boolean;
  closable?: boolean;
  blockScroll?: boolean;
  closeOnEscape?: boolean;
  fullScreen?: boolean;
  appendTo?: HTMLElement | 'body' | null;
  ariaCloseLabel?: string;
  
  // Slots
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

const joinClassNames = (...names: Array<string | false | null | undefined>): string =>
  names.filter(Boolean).join(' ');

export const BapsDrawer = forwardRef<HTMLDialogElement, BapsDrawerProps>(
  (
    {
      visible,
      onVisibleChange,
      header,
      brand = 'mybky',
      position = 'left',
      modal = true,
      dismissible = true,
      closable = true,
      blockScroll = false,
      closeOnEscape = true,
      fullScreen = false,
      appendTo = 'body',
      ariaCloseLabel = 'Close',
      actions,
      footer,
      children,
      className,
      style,
      ...nativeProps
    },
    ref
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const activeElementRef = useRef<HTMLElement | null>(null);

    useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement);

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (visible) {
        if (!dialog.open) {
          activeElementRef.current = document.activeElement as HTMLElement;
          if (modal) {
            dialog.showModal();
          } else {
            dialog.show();
          }
          if (blockScroll) {
            document.body.style.overflow = 'hidden';
          }
        }
      } else {
        if (dialog.open) {
          dialog.close();
          if (blockScroll) {
            document.body.style.overflow = '';
          }
          if (activeElementRef.current) {
            activeElementRef.current.focus();
            activeElementRef.current = null;
          }
        }
      }

      return () => {
        if (blockScroll) {
          document.body.style.overflow = '';
        }
      };
    }, [visible, modal, blockScroll]);

    const handleClose = () => {
      onVisibleChange?.(false);
    };

    const handleCancel = (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (closeOnEscape) {
        handleClose();
      }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      if (dismissible && modal) {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          handleClose();
        }
      }
    };

    if (!visible && !dialogRef.current?.open) {
      return null;
    }

    const content = (
      <dialog
        ref={dialogRef}
        className={joinClassNames(
          'p-drawer p-component',
          `p-drawer-${position}`,
          fullScreen && 'p-drawer-full',
          brand === 'sampark' && 'baps-ds-sampark baps-sampark',
          className
        )}
        style={{
          padding: 0,
          border: 'none',
          background: 'transparent',
          ...style,
        }}
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        aria-modal={modal ? 'true' : undefined}
        {...nativeProps}
      >
        <div className="p-drawer-header">
          {actions && <div className="baps-drawer-actions">{actions}</div>}
          {closable && (
            <BapsButton
              className="baps-drawer-close"
              variant="ghost"
              icon={<i className="pi pi-times" aria-hidden="true"></i>}
              severity="secondary"
              aria-label={ariaCloseLabel}
              brand={brand as any}
              onClick={handleClose}
              autoFocus
            />
          )}
          {header && <div className="p-drawer-title">{header}</div>}
        </div>
        
        <div className="p-drawer-content">
          {children}
        </div>

        {footer && (
          <div className="p-drawer-footer">
            {footer}
          </div>
        )}
      </dialog>
    );

    const targetElement = appendTo === 'body' ? document.body : (appendTo || document.body);

    return createPortal(
      createElement(
        'baps-drawer',
        {
          className: joinClassNames(brand === 'sampark' && 'baps-ds-sampark'),
          style: { display: 'contents' }
        },
        content
      ),
      targetElement
    );
  }
);
BapsDrawer.displayName = 'BapsDrawer';
