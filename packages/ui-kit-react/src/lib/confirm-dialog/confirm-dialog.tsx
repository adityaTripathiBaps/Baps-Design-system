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
  acceptSeverity?:
    'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';
  rejectSeverity?:
    'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';
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
  baseZIndex?: number;
  onAccept?: () => void;
  onReject?: () => void;
  onHide?: () => void;
}

type BapsConfirmSeverity = NonNullable<BapsConfirmOptions['acceptSeverity']>;
type BapsConfirmButtonAppearance =
  | { brand: 'mybky'; severity: BapsButtonSeverity }
  | { brand: 'sampark'; severity: 'primary' | 'secondary' };

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

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
  baseZIndex = 0,
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
    className,
  );

  const mapSeverity = (sev: BapsConfirmSeverity): BapsButtonSeverity => {
    if (
      sev === 'danger' ||
      sev === 'warn' ||
      sev === 'secondary' ||
      sev === 'primary'
    ) {
      return sev;
    }
    return 'primary';
  };

  const buttonAppearance = (
    severity: BapsConfirmSeverity,
  ): BapsConfirmButtonAppearance => {
    if (brand === 'sampark') {
      return {
        brand,
        severity: severity === 'secondary' ? 'secondary' : 'primary',
      };
    }

    return { brand, severity: mapSeverity(severity) };
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
      style={{ ...style, zIndex: baseZIndex }}
      aria-label={
        ariaLabel || (typeof header === 'string' ? header : 'Confirmation')
      }
      media={
        icon ? (
          <div className="baps-confirm-dialog__icon-wrapper">
            <i
              className={joinClassNames(icon, 'baps-confirm-dialog__icon')}
              aria-hidden="true"
            />
          </div>
        ) : undefined
      }
      footer={
        <div className="baps-confirm-dialog__actions">
          {rejectVisible && (
            <BapsButton
              label={rejectLabel}
              {...(rejectIcon
                ? {
                    icon: <i className={rejectIcon} aria-hidden="true" />,
                  }
                : {})}
              {...buttonAppearance(rejectSeverity)}
              outlined
              className={rejectButtonStyleClass}
              onClick={handleReject}
            />
          )}
          {acceptVisible && (
            <BapsButton
              label={acceptLabel}
              {...(acceptIcon
                ? {
                    icon: <i className={acceptIcon} aria-hidden="true" />,
                  }
                : {})}
              {...buttonAppearance(acceptSeverity)}
              className={acceptButtonStyleClass}
              onClick={handleAccept}
            />
          )}
        </div>
      }
    >
      {message && <p className="baps-confirm-dialog__message">{message}</p>}
    </BapsDialog>
  );
};

/* ── Context & Hook ──────────────────────────────────────────────────────── */

type ConfirmResolver = (confirmed: boolean) => void;

interface ActiveConfirmation extends BapsConfirmOptions {
  id: number;
  resolve: ConfirmResolver;
}

export interface ConfirmContextValue {
  confirm: (options: BapsConfirmOptions) => Promise<boolean>;
  close: () => void;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

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
    const current = activeRef.current;
    if (current) {
      activeRef.current = null;
      current.resolve(false);
      setActive(null);
    }
  }, []);

  const requestConfirm = useCallback(
    (options: BapsConfirmOptions): Promise<boolean> => {
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
        activeRef.current = entry;
        setActive(entry);
      });
    },
    [],
  );

  const handleAccept = useCallback(() => {
    const current = activeRef.current;
    if (current) {
      activeRef.current = null;
      current.resolve(true);
      setActive(null);
    }
  }, []);

  const handleReject = useCallback(() => {
    const current = activeRef.current;
    if (current) {
      activeRef.current = null;
      current.resolve(false);
      setActive(null);
    }
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm: requestConfirm, close }}>
      {children}
      {active && (
        <BapsConfirmDialog
          visible={true}
          brand={brand}
          appendTo={appendTo}
          {...active}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a BapsConfirmProvider');
  }

  return context;
}
