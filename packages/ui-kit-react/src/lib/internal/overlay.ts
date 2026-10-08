'use client';

import {
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

export type BapsPortalTarget = HTMLElement | 'body' | null;

export interface BapsAnchoredOverlayOptions {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  triggerRef: RefObject<HTMLElement | null>;
  overlayRef: RefObject<HTMLElement | null>;
  appendTo: BapsPortalTarget;
  onOpenChange?: (open: boolean) => void;
}

export interface BapsAnchoredOverlayResult {
  portalTarget: HTMLElement | null;
  positionStyle: CSSProperties;
  dismiss: (restoreFocus?: boolean) => void;
}

/**
 * Shared structural overlay behaviour for the React selection components.
 * Visual values stay in the canonical DS CSS; the inline values here are only
 * viewport coordinates measured from the live trigger.
 */
export function useAnchoredOverlay({
  open,
  setOpen,
  triggerRef,
  overlayRef,
  appendTo,
  onOpenChange,
}: BapsAnchoredOverlayOptions): BapsAnchoredOverlayResult {
  const [positionStyle, setPositionStyle] = useState<CSSProperties>({});

  const dismiss = (restoreFocus = false) => {
    setOpen(false);
    onOpenChange?.(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPositionStyle({
        position: 'absolute',
        insetInlineStart: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        minWidth: rect.width,
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        !triggerRef.current?.contains(target) &&
        !overlayRef.current?.contains(target)
      ) {
        dismiss();
      }
    };

    updatePosition();
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, overlayRef, triggerRef]);

  const portalTarget =
    typeof document === 'undefined'
      ? null
      : appendTo === 'body' || appendTo === null
        ? document.body
        : appendTo;

  return { portalTarget, positionStyle, dismiss };
}
