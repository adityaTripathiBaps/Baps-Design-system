/*
 * Route B: no Custom tab.
 *
 * Measured: 9 rule blocks, all 9 touching PrimeNG selectors, and the
 * active indicator is positioned at runtime.
 *
 *
 * The React component emits the same class names, so a consuming app that
 * loads the kit's CSS gets the full look.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('tabs', true);

export const tabsSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

import {
  BapsTabs,
  BapsTabList,
  BapsTab,
  BapsTabPanels,
  BapsTabPanel
} from '@org/ui-kit-react';

export function Default() {
  return (
    <BapsTabs defaultValue="0">
      <BapsTabList>
        <BapsTab value="0">General</BapsTab>
        <BapsTab value="1">Members</BapsTab>
        <BapsTab value="2" disabled>Settings</BapsTab>
      </BapsTabList>
      <BapsTabPanels>
        <BapsTabPanel value="0">
          <p>General content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="1">
          <p>Members content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="2">
          <p>Settings content.</p>
        </BapsTabPanel>
      </BapsTabPanels>
    </BapsTabs>
  );
}`,
    next: `'use client';

${SETUP}

import {
  BapsTabs,
  BapsTabList,
  BapsTab,
  BapsTabPanels,
  BapsTabPanel
} from '@org/ui-kit-react';

export default function Default() {
  return (
    <BapsTabs defaultValue="0">
      <BapsTabList>
        <BapsTab value="0">General</BapsTab>
        <BapsTab value="1">Members</BapsTab>
        <BapsTab value="2" disabled>Settings</BapsTab>
      </BapsTabList>
      <BapsTabPanels>
        <BapsTabPanel value="0">
          <p>General content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="1">
          <p>Members content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="2">
          <p>Settings content.</p>
        </BapsTabPanel>
      </BapsTabPanels>
    </BapsTabs>
  );
}`,
    primeng: `<p-tabs value="0" bapsTabs brand="sampark">
  <p-tablist>
    <p-tab value="0">General</p-tab>
    <p-tab value="1">Members</p-tab>
    <p-tab value="2" [disabled]="true">Settings</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="0">
      <p>General content.</p>
    </p-tabpanel>
    <p-tabpanel value="1">
      <p>Members content.</p>
    </p-tabpanel>
    <p-tabpanel value="2">
      <p>Settings content.</p>
    </p-tabpanel>
  </p-tabpanels>
</p-tabs>`,
  },

  // A tab that exists but cannot be reached. Disabled rather than removed,
  // because the reader has to be able to see that Receipts is a thing this
  // screen has — it is just not available yet.
  WithDisabled: {
    react: `${SETUP}

import { BapsTabs, BapsTabList, BapsTab, BapsTabPanels, BapsTabPanel } from '@org/ui-kit-react';

export function WithDisabled({ value, onValueChange }) {
  return (
    <BapsTabs value={value} onValueChange={onValueChange} brand="sampark">
      <BapsTabList>
        <BapsTab value="0">Registrations</BapsTab>
        <BapsTab value="1">Attendance</BapsTab>
        {/* Still rendered and still announced, as "Receipts, dimmed" —
            dropping it would hide that the screen has one at all. */}
        <BapsTab value="2" disabled>Receipts</BapsTab>
      </BapsTabList>
      <BapsTabPanels>
        <BapsTabPanel value="0">Registration list</BapsTabPanel>
        <BapsTabPanel value="1">Attendance sheet</BapsTabPanel>
        <BapsTabPanel value="2">Receipts</BapsTabPanel>
      </BapsTabPanels>
    </BapsTabs>
  );
}`,
    next: `'use client';

${SETUP}

import { BapsTabs, BapsTabList, BapsTab, BapsTabPanels, BapsTabPanel } from '@org/ui-kit-react';

/* 'use client': the selected tab is state and the strip is keyboard-driven,
   so this cannot be a server component. */
export default function WithDisabled({ value, onValueChange }) {
  return (
    <BapsTabs value={value} onValueChange={onValueChange} brand="sampark">
      <BapsTabList>
        <BapsTab value="0">Registrations</BapsTab>
        <BapsTab value="1">Attendance</BapsTab>
        <BapsTab value="2" disabled>Receipts</BapsTab>
      </BapsTabList>
      <BapsTabPanels>
        <BapsTabPanel value="0">Registration list</BapsTabPanel>
        <BapsTabPanel value="1">Attendance sheet</BapsTabPanel>
        <BapsTabPanel value="2">Receipts</BapsTabPanel>
      </BapsTabPanels>
    </BapsTabs>
  );
}`,
    primeng: `<p-tabs bapsTabs brand="sampark" [(value)]="value">
  <p-tablist>
    <p-tab value="0">Registrations</p-tab>
    <p-tab value="1">Attendance</p-tab>
    <p-tab value="2" [disabled]="true">Receipts</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="0">Registration list</p-tabpanel>
    <p-tabpanel value="1">Attendance sheet</p-tabpanel>
    <p-tabpanel value="2">Receipts</p-tabpanel>
  </p-tabpanels>
</p-tabs>`,
  },

  // No per-component brand at all: the page-wide scope carries it.
  PageWideScopeOnly: {
    react: `${SETUP}

import { BapsTabs, BapsTabList, BapsTab, BapsTabPanels, BapsTabPanel } from '@org/ui-kit-react';

/* No brand prop on the strip. Anything inside an element carrying
   .baps-ds-sampark reads the Sampark tokens, so a whole page or a whole
   route can be branded in one place instead of prop by prop. Remove the
   wrapper class and these tabs fall back to the preset. */
export function Page() {
  return (
    <div className="baps-ds-sampark">
      <BapsTabs defaultValue="0">
        <BapsTabList>
          <BapsTab value="0">Header I</BapsTab>
          <BapsTab value="1">Header II</BapsTab>
        </BapsTabList>
        <BapsTabPanels>
          <BapsTabPanel value="0">Content I</BapsTabPanel>
          <BapsTabPanel value="1">Content II</BapsTabPanel>
        </BapsTabPanels>
      </BapsTabs>
    </div>
  );
}`,
    next: `${SETUP}

import { BapsTabs, BapsTabList, BapsTab, BapsTabPanels, BapsTabPanel } from '@org/ui-kit-react';

/* The scope is a class, so the layout that applies it stays a server
   component — only the strip below it needs 'use client'. Put it on <body>
   in app/layout.tsx to brand every route at once. */
export default function Layout({ children }) {
  return (
    <div className="baps-ds-sampark">
      {children}
    </div>
  );
}`,
    primeng: `<!-- Inside an element with .baps-ds-sampark; no bapsTabs directive. -->
<p-tabs [(value)]="value">
  <p-tablist>
    <p-tab value="0">Header I</p-tab>
    <p-tab value="1">Header II</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="0">Content I</p-tabpanel>
    <p-tabpanel value="1">Content II</p-tabpanel>
  </p-tabpanels>
</p-tabs>`,
  },

  // The three Figma steps. Sampark-only, and not a cosmetic detail: the size
  // classes live in _tabs-sampark.scss, so under MyBKY all three collapse
  // onto the preset box and the prop looks broken rather than unsupported.
  Sizes: {
    react: `${SETUP}

import { BapsTabs, BapsTabList, BapsTab } from '@org/ui-kit-react';

// S 28px / 12px text, M 32px / 14px, L 42px / 16px for mobile. Omitting
// size keeps the historic 14px box, which is deliberately none of the three.
export function Sizes() {
  return ['small', 'medium', 'large'].map((size) => (
    <BapsTabs key={size} brand="sampark" size={size} defaultValue="0">
      <BapsTabList>
        <BapsTab value="0">Header I</BapsTab>
        <BapsTab value="1">Header II</BapsTab>
        <BapsTab value="2" disabled>Header III</BapsTab>
      </BapsTabList>
    </BapsTabs>
  ));
}`,
    next: `'use client';

${SETUP}

import { BapsTabs, BapsTabList, BapsTab } from '@org/ui-kit-react';

export default function Sizes() {
  return ['small', 'medium', 'large'].map((size) => (
    <BapsTabs key={size} brand="sampark" size={size} defaultValue="0">
      <BapsTabList>
        <BapsTab value="0">Header I</BapsTab>
        <BapsTab value="1">Header II</BapsTab>
        <BapsTab value="2" disabled>Header III</BapsTab>
      </BapsTabList>
    </BapsTabs>
  ));
}`,
    primeng: `<p-tabs bapsTabs brand="sampark" size="small" value="0">
  <p-tablist>
    <p-tab value="0">Header I</p-tab>
    <p-tab value="1">Header II</p-tab>
    <p-tab value="2" [disabled]="true">Header III</p-tab>
  </p-tablist>
</p-tabs>

<!-- size="medium" and size="large" are the other two steps. -->`,
  },
};
