import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('tabs', true);

export const tabsSnippets: Record<string, SnippetSet> = {
  Default: {
    custom: `<div class="p-tabs p-component" data-pc-name="tabs" data-pc-section="root">
  <div class="p-tablist" data-pc-name="tablist" data-pc-section="root">
    <div class="p-tablist-content">
      <div class="p-tablist-tab-list" role="tablist">
        <button class="p-tab p-tab-active" role="tab" aria-selected="true" data-pc-name="tab" data-p-active="true">General</button>
        <button class="p-tab" role="tab" aria-selected="false" data-pc-name="tab" data-p-active="false">Members</button>
        <button class="p-tab" role="tab" aria-selected="false" disabled data-pc-name="tab" data-p-active="false" data-p-disabled="true">Settings</button>
      </div>
    </div>
  </div>
  <div class="p-tabpanels" data-pc-name="tabpanels" data-pc-section="root">
    <div class="p-tabpanel" role="tabpanel" data-pc-name="tabpanel" data-p-active="true">
      <p class="m-0">General content.</p>
    </div>
  </div>
</div>`,
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
          <p className="m-0">General content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="1">
          <p className="m-0">Members content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="2">
          <p className="m-0">Settings content.</p>
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
          <p className="m-0">General content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="1">
          <p className="m-0">Members content.</p>
        </BapsTabPanel>
        <BapsTabPanel value="2">
          <p className="m-0">Settings content.</p>
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
      <p class="m-0">General content.</p>
    </p-tabpanel>
    <p-tabpanel value="1">
      <p class="m-0">Members content.</p>
    </p-tabpanel>
    <p-tabpanel value="2">
      <p class="m-0">Settings content.</p>
    </p-tabpanel>
  </p-tabpanels>
</p-tabs>`,
  },
};
