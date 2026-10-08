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
    react: example(),
    next: next(example()),
    primeng: `<baps-file-upload accept="image/*" (filesSelected)="onFiles($event)" />`,
  },
  States: {
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
