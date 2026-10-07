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

export type BapsDialogAlign = 'center' | 'start';

export interface BapsDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'align'> {
  visible: boolean;
  onVisibleChange?: (visible: boolean) => void;
  header?: ReactNode;
  brand?: 'mybky' | 'sampark';
  width?: string;
  align?: BapsDialogAlign;
  closable?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  appendTo?: HTMLElement | 'body' | null;
  closeAriaLabel?: string;
  
  // Slots
  media?: ReactNode;
  title?: ReactNode; // Extra title content alongside header
  footer?: ReactNode;
  children?: ReactNode;
}

const joinClassNames = (...names: Array<string | false | null | undefined>): string =>
  names.filter(Boolean).join(' ');

export const BapsDialog = forwardRef<HTMLDialogElement, BapsDialogProps>(
  (
    {
      visible,
      onVisibleChange,
      header,
      brand = 'mybky',
      width = '31.25rem', // 500px
      align = 'center',
      closable = false,
      closeOnEscape = true,
      dismissableMask = false,
      blockScroll = true,
      appendTo = 'body',
      closeAriaLabel = 'Close',
      media,
      title,
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
          dialog.showModal();
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
    }, [visible, blockScroll]);

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
      if (dismissableMask) {
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
          'p-dialog p-component baps-dialog-panel',
          brand === 'sampark' && 'baps-ds-sampark baps-sampark',
          align === 'start' && 'baps-dialog-align-start',
          className
        )}
        style={{
          width,
          padding: 0,
          border: 'none',
          background: 'transparent',
          ...style,
        }}
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        aria-modal="true"
        {...nativeProps}
      >
        <div className="p-dialog-header">
          <div className="baps-dialog__heading">
            {media}
            <div className="baps-dialog__title">
              {header}
              {title}
            </div>
          </div>
          {closable && (
            <div className="p-dialog-header-actions">
              <button
                type="button"
                className="p-dialog-header-icon p-dialog-header-close p-link"
                aria-label={closeAriaLabel}
                onClick={handleClose}
              >
                <span className="p-dialog-header-close-icon pi pi-times" aria-hidden="true"></span>
              </button>
            </div>
          )}
        </div>
        
        <div className="p-dialog-content">
          {children}
        </div>

        <div className="p-dialog-footer">
          {footer}
        </div>
      </dialog>
    );

    const targetElement = appendTo === 'body' ? document.body : (appendTo || document.body);

    return createPortal(
      createElement(
        'baps-dialog',
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
BapsDialog.displayName = 'BapsDialog';
