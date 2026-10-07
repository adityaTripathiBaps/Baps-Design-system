import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = `${setupFor('badge', false, '@org/ui-kit-react/styles')}

import { BapsBadge, BapsButton, BapsOverlayBadge } from '@org/ui-kit-react';`;

export const badgeSnippets: Record<string, SnippetSet> = {
  Playground: {
    react: `${SETUP}

export function Playground() {
  return (
    <BapsBadge value={8} />
  );
}`,
    next: `${SETUP}

export default function Playground() {
  return (
    <BapsBadge value={8} />
  );
}`,
  },
  Severities: {
    react: `${SETUP}

export function Severities() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <BapsBadge value={8} />
      <BapsBadge value={8} severity="secondary" />
      <BapsBadge value={8} severity="success" />
      <BapsBadge value={8} severity="info" />
      <BapsBadge value={8} severity="warn" />
      <BapsBadge value={8} severity="danger" />
      <BapsBadge value={8} severity="contrast" />
    </div>
  );
}`,
    next: `${SETUP}

export default function Severities() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <BapsBadge value={8} />
      <BapsBadge value={8} severity="secondary" />
      <BapsBadge value={8} severity="success" />
      <BapsBadge value={8} severity="info" />
      <BapsBadge value={8} severity="warn" />
      <BapsBadge value={8} severity="danger" />
      <BapsBadge value={8} severity="contrast" />
    </div>
  );
}`,
  },
  Sizes: {
    react: `${SETUP}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <BapsBadge value={8} badgeSize="small" />
      <BapsBadge value={8} />
      <BapsBadge value={8} badgeSize="large" />
      <BapsBadge value={8} badgeSize="xlarge" />
    </div>
  );
}`,
    next: `${SETUP}

export default function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <BapsBadge value={8} badgeSize="small" />
      <BapsBadge value={8} />
      <BapsBadge value={8} badgeSize="large" />
      <BapsBadge value={8} badgeSize="xlarge" />
    </div>
  );
}`,
  },
  Sampark: {
    react: `${SETUP}

export function Sampark() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <BapsBadge value={8} brand="sampark" />
      <BapsBadge value={8} severity="success" brand="sampark" />
      <BapsBadge value={8} severity="danger" brand="sampark" />
      <BapsBadge value={8} badgeSize="small" brand="sampark" />
      <BapsBadge value={8} badgeSize="large" brand="sampark" />
    </div>
  );
}`,
    next: `${SETUP}

export default function Sampark() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <BapsBadge value={8} brand="sampark" />
      <BapsBadge value={8} severity="success" brand="sampark" />
      <BapsBadge value={8} severity="danger" brand="sampark" />
      <BapsBadge value={8} badgeSize="small" brand="sampark" />
      <BapsBadge value={8} badgeSize="large" brand="sampark" />
    </div>
  );
}`,
  },
  SamparkTypes: {
    react: `${SETUP}

export function SamparkTypes() {
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <BapsBadge value={8} brand="sampark" type="notification" />
        <BapsBadge value={8} brand="sampark" type="counts" />
        <BapsBadge value={8} brand="sampark" type="disable" />
        <BapsBadge value="99+" brand="sampark" type="notification" />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        <BapsBadge value={8} brand="sampark" type="notification" badgeSize="small" />
        <BapsBadge value={8} brand="sampark" type="notification" />
        <BapsBadge value={8} brand="sampark" type="notification" badgeSize="large" />
        <BapsBadge value={8} brand="sampark" type="notification" badgeSize="xlarge" />
      </div>
    </>
  );
}`,
    next: `${SETUP}

export default function SamparkTypes() {
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <BapsBadge value={8} brand="sampark" type="notification" />
        <BapsBadge value={8} brand="sampark" type="counts" />
        <BapsBadge value={8} brand="sampark" type="disable" />
        <BapsBadge value="99+" brand="sampark" type="notification" />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        <BapsBadge value={8} brand="sampark" type="notification" badgeSize="small" />
        <BapsBadge value={8} brand="sampark" type="notification" />
        <BapsBadge value={8} brand="sampark" type="notification" badgeSize="large" />
        <BapsBadge value={8} brand="sampark" type="notification" badgeSize="xlarge" />
      </div>
    </>
  );
}`,
  },
  DotAndOverlay: {
    react: `${SETUP}

export function DotAndOverlay() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <BapsBadge severity="success" aria-hidden />
      <BapsBadge severity="danger" aria-hidden />
      <BapsOverlayBadge value={4} severity="danger" badgeAriaLabel="4 notifications">
        <BapsButton icon="notification" variant="ghost" aria-label="Notifications" />
      </BapsOverlayBadge>
      <BapsOverlayBadge severity="success" badgeAriaLabel="New messages">
        <BapsButton icon="info-circle" variant="ghost" aria-label="Messages" />
      </BapsOverlayBadge>
    </div>
  );
}`,
    next: `${SETUP}

export default function DotAndOverlay() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <BapsBadge severity="success" aria-hidden />
      <BapsBadge severity="danger" aria-hidden />
      <BapsOverlayBadge value={4} severity="danger" badgeAriaLabel="4 notifications">
        <BapsButton icon="notification" variant="ghost" aria-label="Notifications" />
      </BapsOverlayBadge>
      <BapsOverlayBadge severity="success" badgeAriaLabel="New messages">
        <BapsButton icon="info-circle" variant="ghost" aria-label="Messages" />
      </BapsOverlayBadge>
    </div>
  );
}`,
  },
};
