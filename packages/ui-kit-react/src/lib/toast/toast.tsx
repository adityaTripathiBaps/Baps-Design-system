import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';

export type BapsToastSeverity = 'success' | 'info' | 'warn' | 'error';
export type BapsToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center';

export interface BapsToastMessage {
  id?: string;
  severity?: BapsToastSeverity;
  summary?: ReactNode;
  detail?: ReactNode;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

interface ToastContextType {
  show: (message: BapsToastMessage | BapsToastMessage[]) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider or BapsToast component must be rendered');
  }
  return context;
}

export interface BapsToastProps {
  position?: BapsToastPosition;
  brand?: 'mybky' | 'sampark';
  baseZIndex?: number;
  autoZIndex?: boolean;
  children?: ReactNode; // If used as a provider wrapper
}

const joinClassNames = (...names: Array<string | false | null | undefined>): string =>
  names.filter(Boolean).join(' ');

let toastIdCounter = 0;

export function BapsToastProvider({
  position = 'top-right',
  brand = 'mybky',
  baseZIndex = 0,
  autoZIndex = true,
  children
}: BapsToastProps) {
  const [messages, setMessages] = useState<(BapsToastMessage & { id: string })[]>([]);

  const show = useCallback((messageOrMessages: BapsToastMessage | BapsToastMessage[]) => {
    const newMessages = Array.isArray(messageOrMessages) ? messageOrMessages : [messageOrMessages];
    
    setMessages(prev => [
      ...prev,
      ...newMessages.map(msg => ({
        ...msg,
        id: msg.id || `toast-${toastIdCounter++}`,
      }))
    ]);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const contextValue = { show, clear };

  const toastContainer = (
    <div
      className={joinClassNames(
        'p-toast p-component p-toast-top-right',
        `p-toast-${position}`,
        brand === 'sampark' && 'baps-toast-sampark baps-ds-sampark'
      )}
      style={{ zIndex: autoZIndex ? baseZIndex + 1000 : baseZIndex }}
    >
      {messages.map((msg) => (
        <ToastItem
          key={msg.id}
          message={msg}
          onRemove={() => removeMessage(msg.id)}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined' && createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
}

// Global reference for standalone <BapsToast /> usage without provider
export const Toast = BapsToastProvider;

function ToastItem({
  message,
  onRemove,
}: {
  message: BapsToastMessage & { id: string };
  onRemove: () => void;
}) {
  const { severity = 'info', summary, detail, life = 3000, sticky = false, closable = true } = message;

  useEffect(() => {
    if (sticky) return;
    const timer = setTimeout(() => {
      onRemove();
    }, life);
    return () => clearTimeout(timer);
  }, [sticky, life, onRemove]);

  let icon = 'pi pi-info-circle';
  if (severity === 'success') icon = 'pi pi-check';
  if (severity === 'warn') icon = 'pi pi-exclamation-triangle';
  if (severity === 'error') icon = 'pi pi-times-circle';

  return (
    <div
      className={joinClassNames(
        'p-toast-message',
        `p-toast-message-${severity}`
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-toast-message-content">
        <span className={joinClassNames('p-toast-message-icon', icon)} aria-hidden="true"></span>
        <div className="p-toast-message-text">
          {summary && <div className="p-toast-summary">{summary}</div>}
          {detail && <div className="p-toast-detail">{detail}</div>}
        </div>
        {closable && (
          <button
            type="button"
            className="p-toast-icon-close p-link"
            onClick={onRemove}
            aria-label="Close"
          >
            <span className="p-toast-icon-close-icon pi pi-times" aria-hidden="true"></span>
          </button>
        )}
      </div>
    </div>
  );
}
