import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('file-upload', false, '@org/ui-kit-react/styles')}

import { BapsFileUpload } from '@org/ui-kit-react';`;

const next = (source: string) =>
  `'use client';\n\n${source.replace(
    'export function Example()',
    'export default function Example()',
  )}`;

const example = (props = '') => `${SETUP}

export function Example() {
  return (
    <BapsFileUpload
      ariaLabel="Upload image"
      accept="image/*"
      onFilesSelected={(files) => console.log(files)}
      ${props}
    />
  );
}`;

export const fileUploadSnippets: Record<string, SnippetSet> = {
  Playground: {
    custom: `<baps-file-upload>
  <div
    class="baps-file-upload-zone"
    role="button"
    aria-label="Click to upload or drag and drop"
    tabindex="0"
  >
    <input type="file" hidden />
    <div class="baps-file-upload-ring">
      <div class="baps-file-upload-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    </div>
    <!-- inert, not disabled: the ZONE is the control. Without inert the inner
         button is a second tab stop whose Enter both clicks it and bubbles to
         the zone, opening the picker twice. -->
    <button inert type="button" class="baps-button baps-button--secondary baps-button--s">
      <span class="baps-button__label">Upload Image</span>
    </button>
    <p class="baps-file-upload-hint">Click to upload or drag and drop</p>
    <p class="baps-file-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
  </div>
</baps-file-upload>`,
    react: example(),
    next: next(example()),
    primeng: `<baps-file-upload accept="image/*" (filesSelected)="onFiles($event)" />`,
  },
  States: {
    custom: `<div style="display:flex; flex-direction:column; gap:24px; max-width:518px;">
  <baps-file-upload>
    <div
      class="baps-file-upload-zone"
      role="button"
      aria-label="Click to upload or drag and drop"
      tabindex="0"
    >
      <input type="file" hidden />
      <div class="baps-file-upload-ring">
        <div class="baps-file-upload-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>
      <!-- inert, not disabled: the ZONE is the control. Without inert the inner
           button is a second tab stop whose Enter both clicks it and bubbles to
           the zone, opening the picker twice. -->
      <button inert type="button" class="baps-button baps-button--secondary baps-button--s">
        <span class="baps-button__label">Upload Image</span>
      </button>
      <p class="baps-file-upload-hint">Click to upload or drag and drop</p>
      <p class="baps-file-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
    </div>
  </baps-file-upload>
  <baps-file-upload>
    <div
      class="baps-file-upload-zone baps-file-upload-invalid"
      role="button"
      aria-label="Click to upload or drag and drop"
      tabindex="0"
    >
      <input type="file" hidden />
      <div class="baps-file-upload-ring">
        <div class="baps-file-upload-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>
      <!-- inert, not disabled: the ZONE is the control. Without inert the inner
           button is a second tab stop whose Enter both clicks it and bubbles to
           the zone, opening the picker twice. -->
      <button inert type="button" class="baps-button baps-button--secondary baps-button--s">
        <span class="baps-button__label">Upload Image</span>
      </button>
      <p class="baps-file-upload-hint">Click to upload or drag and drop</p>
      <p class="baps-file-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
    </div>
  </baps-file-upload>
  <baps-file-upload>
    <div
      class="baps-file-upload-zone baps-file-upload-disabled"
      role="button"
      aria-label="Click to upload or drag and drop"
      aria-disabled="true"
    >
      <input type="file" hidden disabled />
      <div class="baps-file-upload-ring">
        <div class="baps-file-upload-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>
      <!-- inert, not disabled: the ZONE is the control. Without inert the inner
           button is a second tab stop whose Enter both clicks it and bubbles to
           the zone, opening the picker twice. -->
      <button inert type="button" class="baps-button baps-button--secondary baps-button--s" disabled>
        <span class="baps-button__label">Upload Image</span>
      </button>
      <p class="baps-file-upload-hint">Click to upload or drag and drop</p>
      <p class="baps-file-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
    </div>
  </baps-file-upload>
</div>`,
    react: `${SETUP}

export function Example() {
  return (
    <>
      <BapsFileUpload ariaLabel="Upload image" />
      <BapsFileUpload ariaLabel="Upload invalid image" invalid />
      <BapsFileUpload ariaLabel="Upload disabled" disabled />
    </>
  );
}`,
    next: next(`${SETUP}

export function Example() {
  return (
    <>
      <BapsFileUpload ariaLabel="Upload image" />
      <BapsFileUpload ariaLabel="Upload invalid image" invalid />
      <BapsFileUpload ariaLabel="Upload disabled" disabled />
    </>
  );
}`),
    primeng: `<baps-file-upload />
<baps-file-upload [invalid]="true" />
<baps-file-upload [disabled]="true" />`,
  },
};
