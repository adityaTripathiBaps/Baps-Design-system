import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type CSSProperties,
  type FC,
} from 'react';
import { BapsDialog } from '../dialog/dialog.js';
import { BapsButton, type BapsButtonSeverity } from '../button/button.js';

export interface BapsConfirmOptions {
  key?: string;
  header?: ReactNode;
  message?: ReactNode;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptIcon?: string;
  rejectIcon?: string;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
  acceptSeverity?: 'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';
  rejectSeverity?: 'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  closable?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  styleClass?: string;
  ariaLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

export interface BapsConfirmDialogProps extends BapsConfirmOptions {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  brand?: 'mybky' | 'sampark';
  appendTo?: HTMLElement | 'body' | null;
  className?: string;
  style?: CSSProperties;
  onAccept?: () => void;
  onReject?: () => void;
  onHide?: () => void;
}

const joinClassNames = (...names: Array<string | false | null | undefined>): string =>
  names.filter(Boolean).join(' ');

/**
 * BapsConfirmDialog — modal confirmation dialog component.
 *
 * Wraps BapsDialog with standardized icon, message, and accept/reject action layout.
 */
export const BapsConfirmDialog: FC<BapsConfirmDialogProps> = ({
  visible = false,
  onVisibleChange,
  header,
  message,
  icon,
  acceptLabel = 'Yes',
  rejectLabel = 'No',
  acceptIcon,
  rejectIcon,
  acceptVisible = true,
  rejectVisible = true,
  acceptSeverity = 'danger',
  rejectSeverity = 'secondary',
  acceptButtonStyleClass,
  rejectButtonStyleClass,
  closable = false,
  closeOnEscape = true,
  dismissableMask = false,
  blockScroll = true,
  appendTo = 'body',
  brand = 'mybky',
  ariaLabel,
  className,
  styleClass,
  style,
  onAccept,
  onReject,
  onHide,
  accept,
  reject,
}) => {
  const handleAccept = () => {
    accept?.();
    onAccept?.();
    onVisibleChange?.(false);
    onHide?.();
  };

  const handleReject = () => {
    reject?.();
    onReject?.();
    onVisibleChange?.(false);
    onHide?.();
  };

  const handleVisibleChange = (next: boolean) => {
    if (!next && visible) {
      handleReject();
    } else {
      onVisibleChange?.(next);
    }
  };

  const panelClassName = joinClassNames(
    'p-confirmdialog',
    brand === 'sampark' && 'baps-ds-sampark baps-confirm-dialog-sampark',
    styleClass,
    className
  );

  const mapSeverity = (
    sev: 'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info'
  ): BapsButtonSeverity => {
    if (sev === 'danger' || sev === 'warn' || sev === 'secondary' || sev === 'primary') {
      return sev;
    }
    return 'primary';
  };

  return (
    <BapsDialog
      visible={visible}
      onVisibleChange={handleVisibleChange}
      header={header}
      brand={brand}
      closable={closable}
      closeOnEscape={closeOnEscape}
      dismissableMask={dismissableMask}
      blockScroll={blockScroll}
      appendTo={appendTo}
      className={panelClassName}
      style={style}
      aria-label={ariaLabel || (typeof header === 'string' ? header : 'Confirmation')}
      media={
        icon ? (
          <div className="baps-confirm-dialog__icon-wrapper">
            <i className={joinClassNames(icon, 'baps-confirm-dialog__icon')} aria-hidden="true" />
          </div>
        ) : undefined
      }
      footer={
        <div className="baps-confirm-dialog__actions">
          {rejectVisible && (
            <BapsButton
              label={rejectLabel}
              severity={mapSeverity(rejectSeverity) as any}
              outlined
              brand={brand as any}
              className={rejectButtonStyleClass}
              onClick={handleReject}
            />
          )}
          {acceptVisible && (
            <BapsButton
              label={acceptLabel}
              severity={mapSeverity(acceptSeverity) as any}
              brand={brand as any}
              className={acceptButtonStyleClass}
              onClick={handleAccept}
            />
          )}
        </div>
      }
    >
      {message && (
        <p className="baps-confirm-dialog__message">
          {message}
        </p>
      )}
    </BapsDialog>
  );
};

/* ── Context & Hook ──────────────────────────────────────────────────────── */

type ConfirmResolver = (confirmed: boolean) => void;

interface ActiveConfirmation extends BapsConfirmOptions {
  id: number;
  resolve: ConfirmResolver;
}

export interface ConfirmFn {
  (options: BapsConfirmOptions): Promise<boolean>;
  confirm: (options: BapsConfirmOptions) => Promise<boolean>;
  close: () => void;
}

interface ConfirmContextType {
  requestConfirm: (options: BapsConfirmOptions) => Promise<boolean>;
  close: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export interface BapsConfirmProviderProps {
  children?: ReactNode;
  brand?: 'mybky' | 'sampark';
  appendTo?: HTMLElement | 'body' | null;
}

let confirmSeq = 0;

export function BapsConfirmProvider({
  children,
  brand = 'mybky',
  appendTo = 'body',
}: BapsConfirmProviderProps) {
  const [active, setActive] = useState<ActiveConfirmation | null>(null);
  const activeRef = useRef<ActiveConfirmation | null>(null);
  activeRef.current = active;

  const close = useCallback(() => {
    if (activeRef.current) {
      activeRef.current.resolve(false);
      setActive(null);
    }
  }, []);

  const requestConfirm = useCallback((options: BapsConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      // If a confirmation is already pending, reject it with false
      if (activeRef.current) {
        activeRef.current.resolve(false);
      }
      const entry: ActiveConfirmation = {
        ...options,
        id: ++confirmSeq,
        resolve: (val: boolean) => {
          resolve(val);
        },
      };
      setActive(entry);
    });
  }, []);

  const handleAccept = useCallback(() => {
    if (active) {
      active.accept?.();
      active.resolve(true);
      setActive(null);
    }
  }, [active]);

  const handleReject = useCallback(() => {
    if (active) {
      active.reject?.();
      active.resolve(false);
      setActive(null);
    }
  }, [active]);

  return (
    <ConfirmContext.Provider value={{ requestConfirm, close }}>
      {children}
      {active && (
        <BapsConfirmDialog
          visible={true}
          brand={brand}
          appendTo={appendTo}
          {...active}
          onAccept={handleAccept}
          onReject={handleReject}
          onHide={handleReject}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a BapsConfirmProvider');
  }

  const fn = ((options: BapsConfirmOptions) =>
    context.requestConfirm(options)) as ConfirmFn;

  fn.confirm = (options: BapsConfirmOptions) => context.requestConfirm(options);
  fn.close = () => context.close();

  return fn;
}
