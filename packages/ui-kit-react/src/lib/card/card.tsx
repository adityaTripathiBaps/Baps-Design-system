import {
  createElement,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsCardPadding = 'default' | 'compact' | 'none';
export type BapsCardBrand = 'mybky' | 'sampark';

type CardNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'onClick' | 'title'
>;

type CardInteraction =
  | {
      interactive: true;
      onClick: MouseEventHandler<HTMLElement>;
    }
  | {
      interactive?: false;
      onClick?: MouseEventHandler<HTMLElement>;
    };

export type BapsCardProps = CardNativeProps &
  CardInteraction & {
    children?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    padding?: BapsCardPadding;
    divided?: boolean;
    raised?: boolean;
    brand?: BapsCardBrand;
    ref?: Ref<HTMLElement>;
  };

const titleSlot = { 'card-title': '' };
const subtitleSlot = { 'card-subtitle': '' };
const actionsSlot = { 'card-actions': '' };
const footerSlot = { 'card-footer': '' };

/** Token-backed content card with optional header slots and keyboard activation. */
export function BapsCard({
  children,
  title,
  subtitle,
  actions,
  footer,
  padding = 'default',
  divided = false,
  raised = false,
  interactive = false,
  brand = 'mybky',
  onClick,
  onKeyDown,
  role,
  tabIndex,
  className,
  ref,
  ...nativeProps
}: BapsCardProps): ReactElement {
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  const header = (
    <div className="baps-card__header">
      {title !== undefined && title !== null && (
        <div {...titleSlot}>{title}</div>
      )}
      {subtitle !== undefined && subtitle !== null && (
        <div {...subtitleSlot}>{subtitle}</div>
      )}
      {actions !== undefined && actions !== null && (
        <div {...actionsSlot}>{actions}</div>
      )}
    </div>
  );

  const body = <div className="baps-card__body">{children}</div>;
  const cardFooter = (
    <div className="baps-card__footer">
      {footer !== undefined && footer !== null && (
        <div {...footerSlot}>{footer}</div>
      )}
    </div>
  );

  return createElement(
    'baps-card',
    {
      ...nativeProps,
      ref,
      role: interactive ? 'button' : role,
      tabIndex: interactive ? 0 : tabIndex,
      onClick,
      onKeyDown: interactive ? handleKeyDown : onKeyDown,
      className:
        [
          padding === 'compact' && 'baps-card-compact',
          padding === 'none' && 'baps-card-flush',
          divided && 'baps-card-divided',
          raised && 'baps-card-raised',
          interactive && 'baps-card-interactive',
          brand === 'sampark' && 'baps-sampark',
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    header,
    body,
    cardFooter,
  );
}

BapsCard.displayName = 'BapsCard';
