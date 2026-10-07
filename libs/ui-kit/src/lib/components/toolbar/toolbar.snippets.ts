import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('toolbar', true);

export const toolbarSnippets: Record<string, SnippetSet> = {
  Playground: {
    custom: `<header class="baps-toolbar">
  <div class="baps-toolbar__start">
    <div class="baps-overlaybadge" data-badge="3" data-severity="danger">
      <button type="button" class="baps-button baps-sampark baps-button--ghost-secondary" aria-label="Region">
        <i class="pi pi-globe" aria-hidden="true"></i>
        <i class="pi pi-chevron-down" style="font-size: 0.65rem;" aria-hidden="true"></i>
      </button>
    </div>
    <h1 class="baps-toolbar__title">Robbinsville</h1>
  </div>
  <div class="baps-toolbar__end">
    <input type="text" class="baps-toolbar__search" placeholder="Search" aria-label="Search" />
    <button type="button" class="baps-button baps-sampark baps-button--primary">
      <i class="pi pi-plus" aria-hidden="true"></i>
      <span class="baps-button__label">Create Project</span>
    </button>
    <div class="baps-overlaybadge" data-badge="3" data-severity="danger">
      <button type="button" class="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Filter">
        <i class="pi pi-filter" aria-hidden="true"></i>
      </button>
    </div>
    <button type="button" class="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Sort">
      <i class="pi pi-sort-alt" aria-hidden="true"></i>
    </button>
  </div>
</header>`,
    react: `${SETUP}

import { BapsToolbar } from '@org/ui-kit-react';

export function Example() {
  return (
    <BapsToolbar
      title="Robbinsville"
      left={
        <div className="baps-overlaybadge" data-badge="3" data-severity="danger">
          <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary" aria-label="Region">
            <i className="pi pi-globe" aria-hidden="true" />
            <i className="pi pi-chevron-down" style={{ fontSize: '0.65rem' }} aria-hidden="true" />
          </button>
        </div>
      }
      right={
        <>
          <input type="text" className="search-input" placeholder="Search" aria-label="Search" />
          <button type="button" className="baps-button baps-sampark baps-button--primary">
            <i className="pi pi-plus" aria-hidden="true" />
            <span className="baps-button__label">Create Project</span>
          </button>
          <div className="baps-overlaybadge" data-badge="3" data-severity="danger">
            <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Filter">
              <i className="pi pi-filter" aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Sort">
            <i className="pi pi-sort-alt" aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}`,
    next: `'use client';

${SETUP}

import { BapsToolbar } from '@org/ui-kit-react';

export default function Example() {
  return (
    <BapsToolbar
      title="Robbinsville"
      left={
        <div className="baps-overlaybadge" data-badge="3" data-severity="danger">
          <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary" aria-label="Region">
            <i className="pi pi-globe" aria-hidden="true" />
            <i className="pi pi-chevron-down" style={{ fontSize: '0.65rem' }} aria-hidden="true" />
          </button>
        </div>
      }
      right={
        <>
          <input type="text" className="search-input" placeholder="Search" aria-label="Search" />
          <button type="button" className="baps-button baps-sampark baps-button--primary">
            <i className="pi pi-plus" aria-hidden="true" />
            <span className="baps-button__label">Create Project</span>
          </button>
          <div className="baps-overlaybadge" data-badge="3" data-severity="danger">
            <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Filter">
              <i className="pi pi-filter" aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Sort">
            <i className="pi pi-sort-alt" aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}`,
    primeng: `<baps-toolbar title="Robbinsville">
  <baps-overlaybadge toolbar-left value="3" severity="danger">
    <baps-button ariaLabel="Region" [text]="true" severity="secondary">
      <i class="pi pi-globe"></i><i class="pi pi-chevron-down" style="font-size: 0.65rem;"></i>
    </baps-button>
  </baps-overlaybadge>

  <input toolbar-right bapsInputText class="search-input" placeholder="Search" aria-label="Search" />
  <baps-button toolbar-right label="Create Project" icon="pi pi-plus" />
  <baps-overlaybadge toolbar-right value="3" severity="danger">
    <baps-button icon="pi pi-filter" ariaLabel="Filter" [text]="true" severity="secondary" />
  </baps-overlaybadge>
  <baps-button toolbar-right icon="pi pi-sort-alt" ariaLabel="Sort" [text]="true" severity="secondary" />
</baps-toolbar>`,
  },

  SearchOnly: {
    custom: `<header class="baps-toolbar">
  <div class="baps-toolbar__start"></div>
  <div class="baps-toolbar__end">
    <input type="text" class="baps-toolbar__search" placeholder="Search karyakars" aria-label="Search karyakars" />
    <button type="button" class="baps-button baps-sampark baps-button--primary">
      <span class="baps-button__label">Save</span>
    </button>
  </div>
</header>`,
    react: `${SETUP}

import { BapsToolbar } from '@org/ui-kit-react';

export function SearchOnly() {
  return (
    <BapsToolbar
      right={
        <>
          <input type="text" className="search-input" placeholder="Search karyakars" aria-label="Search karyakars" />
          <button type="button" className="baps-button baps-sampark baps-button--primary">
            <span className="baps-button__label">Save</span>
          </button>
        </>
      }
    />
  );
}`,
    next: `'use client';

${SETUP}

import { BapsToolbar } from '@org/ui-kit-react';

export default function SearchOnly() {
  return (
    <BapsToolbar
      right={
        <>
          <input type="text" className="search-input" placeholder="Search karyakars" aria-label="Search karyakars" />
          <button type="button" className="baps-button baps-sampark baps-button--primary">
            <span className="baps-button__label">Save</span>
          </button>
        </>
      }
    />
  );
}`,
    primeng: `<baps-toolbar>
  <input toolbar-right bapsInputText class="search-input" placeholder="Search karyakars" aria-label="Search karyakars" />
  <baps-button toolbar-right label="Save" />
</baps-toolbar>`,
  },
};
