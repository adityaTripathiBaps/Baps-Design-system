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
};
