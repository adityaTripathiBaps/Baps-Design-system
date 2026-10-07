import {
  createElement,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';

export type BapsAlertSeverity = 'info' | 'success' | 'warning' | 'error';
export type BapsAlertBrand = 'mybky' | 'sampark';
export type BapsAlertAppearance = 'inline' | 'card';

type NativeAlertProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'>;

export interface BapsAlertProps extends NativeAlertProps {
  severity?: BapsAlertSeverity;
  text?: ReactNode;
  children?: ReactNode;
  title?: ReactNode;
  icon?: BapsIconName | ReactElement;
  closable?: boolean;
  closeLabel?: string;
  onClose?: MouseEventHandler<HTMLButtonElement>;
  brand?: BapsAlertBrand;
  appearance?: BapsAlertAppearance;
  timestamp?: ReactNode;
  avatarLabel?: ReactNode;
  progress?: number;
  progressLabel?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onPrimaryAction?: MouseEventHandler<HTMLButtonElement>;
  onSecondaryAction?: MouseEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLElement>;
}

const defaultIcon: Readonly<Record<BapsAlertSeverity, BapsIconName>> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'shield-warning',
  error: 'close-circle',
};

const renderIcon = (icon: BapsIconName | ReactElement, className: string) => (
  <span className={className} aria-hidden={true}>
    {typeof icon === 'string' ? <BapsIcon name={icon} size="inherit" /> : icon}
  </span>
);

/** Shared-CSS React alert matching the Angular inline and notification-card skins. */
export function BapsAlert({
  severity = 'info',
  text,
  children,
  title,
  icon,
  closable = false,
  closeLabel = 'Close',
  onClose,
  brand = 'mybky',
  appearance = 'inline',
  timestamp,
  avatarLabel,
  progress,
  progressLabel,
  primaryAction,
  secondaryAction,
  onPrimaryAction,
  onSecondaryAction,
  className,
  ref,
  ...nativeProps
}: BapsAlertProps): ReactElement {
  const resolvedIcon = icon ?? defaultIcon[severity];
  const content = text ?? children;
  const clampedProgress = Math.min(100, Math.max(0, progress ?? 0));

  return createElement(
    'baps-alert',
    {
      ...nativeProps,
      ref,
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    appearance === 'card' ? (
      <div
        className={`baps-alert-card baps-alert-card--${severity}`}
        role="status"
      >
        <span className="baps-alert-card__leading">
          {avatarLabel !== undefined && avatarLabel !== null ? (
            <span className="baps-alert-card__avatar" aria-hidden={true}>
              {avatarLabel}
            </span>
          ) : (
            renderIcon(resolvedIcon, 'baps-alert-card__icon')
          )}
        </span>

        <div className="baps-alert-card__body">
          <div className="baps-alert-card__header">
            {(title || timestamp) && (
              <div className="baps-alert-card__title-row">
                {title && (
                  <span className="baps-alert-card__title">{title}</span>
                )}
                {timestamp && (
                  <span className="baps-alert-card__time">{timestamp}</span>
                )}
              </div>
            )}
            {closable && (
              <button
                type="button"
                className="baps-alert-card__close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <BapsIcon name="list-close" size="inherit" />
              </button>
            )}
            {content !== undefined && content !== null && (
              <span className="baps-alert-card__text">{content}</span>
            )}
          </div>

          {progress !== undefined && progress !== null && (
            <div className="baps-alert-card__progress">
              <div
                className="baps-alert-card__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clampedProgress}
                aria-label={progressLabel || 'Progress'}
              >
                <span
                  className="baps-alert-card__progress-fill"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>
              {progressLabel && (
                <span className="baps-alert-card__progress-label">
                  {progressLabel}
                </span>
              )}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="baps-alert-card__actions">
              {primaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--primary"
                  onClick={onPrimaryAction}
                >
                  {primaryAction}
                </button>
              )}
              {secondaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--secondary"
                  onClick={onSecondaryAction}
                >
                  {secondaryAction}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    ) : (
      <div
        className={[
          'baps-alert',
          `baps-alert--${severity}`,
          closable && 'baps-alert--closable',
        ]
          .filter(Boolean)
          .join(' ')}
        role="alert"
      >
        <span className="baps-alert__bar" aria-hidden={true} />
        {renderIcon(resolvedIcon, 'baps-alert__icon')}
        <span className="baps-alert__content">
          {title && <span className="baps-alert__title">{title}</span>}
          <span className="baps-alert__text">
            {children}
            {text}
          </span>
        </span>
        {closable && (
          <button
            type="button"
            className="baps-alert__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <BapsIcon name="list-close" size="inherit" />
          </button>
        )}
      </div>
    ),
  );
}

BapsAlert.displayName = 'BapsAlert';
