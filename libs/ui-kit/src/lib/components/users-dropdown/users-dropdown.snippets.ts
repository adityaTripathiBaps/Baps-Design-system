import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('users-dropdown', false, '@org/ui-kit-react/styles')}

import { BapsUsersDropdown } from '@org/ui-kit-react';

const users = [
  { value: 1, title: 'Asha Patel', subtitle: 'Volunteer', avatarLabel: 'AP', group: 'Volunteers' },
  { value: 2, title: 'Ravi Shah', subtitle: 'Coordinator', avatarLabel: 'RS', group: 'Coordinators' },
];`;

const next = (source: string) =>
  `'use client';\n\n${source.replace(
    'export function Example()',
    'export default function Example()',
  )}`;

const example = (props: string) => `${SETUP}

export function Example() {
  return <BapsUsersDropdown ariaLabel="Member" users={users} ${props} />;
}`;

export const usersDropdownSnippets: Record<string, SnippetSet> = {
  Playground: {
    react: example('placeholder="Select member"'),
    next: next(example('placeholder="Select member"')),
    primeng: `<baps-users-dropdown aria-label="Member" [users]="users" [(value)]="selected" />`,
  },
  OpenPanel: {
    react: example('defaultOpen'),
    next: next(example('defaultOpen')),
    primeng: `<baps-users-dropdown aria-label="Member" [users]="users" [open]="true" />`,
  },
  Groups: {
    react: example('defaultOpen'),
    next: next(example('defaultOpen')),
    primeng: `<baps-users-dropdown aria-label="Member" [users]="groupedUsers" [open]="true" />`,
  },
  MultiSelect: {
    react: example('selectionMode="checkbox" defaultValues={[1]} defaultOpen'),
    next: next(
      example('selectionMode="checkbox" defaultValues={[1]} defaultOpen'),
    ),
    primeng: `<baps-users-dropdown aria-label="Members" selectionMode="checkbox" [users]="users" [(values)]="selected" />`,
  },
  RadioSelect: {
    react: example('selectionMode="radio" defaultValue={1} defaultOpen'),
    next: next(example('selectionMode="radio" defaultValue={1} defaultOpen')),
    primeng: `<baps-users-dropdown aria-label="Member" selectionMode="radio" [users]="users" [(value)]="selected" />`,
  },
  States: {
    react: example('defaultValue={1} disabled'),
    next: next(example('defaultValue={1} disabled')),
    primeng: `<baps-users-dropdown aria-label="Member" [users]="users" [value]="1" [disabled]="true" />`,
  },
};
