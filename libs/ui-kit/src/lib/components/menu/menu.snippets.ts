/*
 * Route B: no Custom tab.
 *
 * Menu relies on portalling, positioning against trigger events, and dynamic
 * submenu grouping that belongs in the component implementation.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('menu', true, '@org/ui-kit-react/styles')}

import { useRef } from 'react';
import { BapsMenu, BapsButton, type BapsMenuRef, type MenuItem } from '@org/ui-kit-react';`;

export const menuSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-button label="Open Menu" (click)="menu.toggle($event)" />
<baps-menu #menu [model]="items" [popup]="true" />`,
    react: `${SETUP}

const items: MenuItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

export function DefaultMenu() {
  const menuRef = useRef<BapsMenuRef>(null);

  return (
    <div>
      <BapsButton label="Open Menu" onClick={(e) => menuRef.current?.toggle(e)} />
      <BapsMenu ref={menuRef} model={items} popup />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const items: MenuItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

export default function DefaultMenu() {
  const menuRef = useRef<BapsMenuRef>(null);

  return (
    <div>
      <BapsButton label="Open Menu" onClick={(e) => menuRef.current?.toggle(e)} />
      <BapsMenu ref={menuRef} model={items} popup />
    </div>
  );
}`,
  },

  Submenus: {
    primeng: `<baps-button label="User Menu" (click)="menu.toggle($event)" />
<baps-menu #menu [model]="groupedItems" [popup]="true" />`,
    react: `${SETUP}

const groupedItems: MenuItem[] = [
  {
    label: 'Actions',
    items: [
      { label: 'Edit profile', icon: 'pi pi-user' },
      { label: 'Duplicate', icon: 'pi pi-copy' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', icon: 'pi pi-cog' },
      { label: 'Sign out', icon: 'pi pi-sign-out' },
    ],
  },
];

export function SubmenuDemo() {
  const menuRef = useRef<BapsMenuRef>(null);

  return (
    <div>
      <BapsButton label="User Menu" onClick={(e) => menuRef.current?.toggle(e)} />
      <BapsMenu ref={menuRef} model={groupedItems} popup />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const groupedItems: MenuItem[] = [
  {
    label: 'Actions',
    items: [
      { label: 'Edit profile', icon: 'pi pi-user' },
      { label: 'Duplicate', icon: 'pi pi-copy' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', icon: 'pi pi-cog' },
      { label: 'Sign out', icon: 'pi pi-sign-out' },
    ],
  },
];

export default function SubmenuDemo() {
  const menuRef = useRef<BapsMenuRef>(null);

  return (
    <div>
      <BapsButton label="User Menu" onClick={(e) => menuRef.current?.toggle(e)} />
      <BapsMenu ref={menuRef} model={groupedItems} popup />
    </div>
  );
}`,
  },

  Inline: {
    primeng: `<baps-menu [model]="items" [popup]="false" />`,
    react: `${SETUP}

const items: MenuItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

export function InlineMenu() {
  return <BapsMenu model={items} popup={false} />;
}`,
    next: `'use client';

${SETUP}

const items: MenuItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

export default function InlineMenu() {
  return <BapsMenu model={items} popup={false} />;
}`,
  },

  Sampark: {
    primeng: `<baps-button label="Sampark Menu" brand="sampark" (click)="menu.toggle($event)" />
<baps-menu #menu [model]="items" [popup]="true" brand="sampark" />`,
    react: `${SETUP}

const items: MenuItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

export function SamparkMenu() {
  const menuRef = useRef<BapsMenuRef>(null);

  return (
    <div className="baps-ds-sampark">
      <BapsButton label="Sampark Menu" brand="sampark" onClick={(e) => menuRef.current?.toggle(e)} />
      <BapsMenu ref={menuRef} model={items} popup brand="sampark" />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const items: MenuItem[] = [
  { label: 'Edit profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Sign out', icon: 'pi pi-sign-out' },
];

export default function SamparkMenu() {
  const menuRef = useRef<BapsMenuRef>(null);

  return (
    <div className="baps-ds-sampark">
      <BapsButton label="Sampark Menu" brand="sampark" onClick={(e) => menuRef.current?.toggle(e)} />
      <BapsMenu ref={menuRef} model={items} popup brand="sampark" />
    </div>
  );
}`,
  },
};
