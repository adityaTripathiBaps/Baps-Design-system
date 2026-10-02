/**
 * Framework snippets for the File upload docs page.
 *
 * ## Fully standalone, and measured as such
 *
 * The component imports nothing from PrimeNG, and the emitted file-upload.css
 * carries 0 PrimeNG selectors across its 9 rule blocks. Counted across the
 * whole kit, only eleven components are at 0% — alert, avatar, button, card,
 * icon, indicator, internal-navbar, link, navbar, spinner and this one. The
 * rest range from 24% to 100%, and above roughly a third there is no honest
 * raw markup to write.
 *
 * tools/check-standalone.mjs already carries a case for this component,
 * replaying the markup on a bare page with only the kit's CSS.
 *
 * ## Three inputs, three classes on the zone
 *
 *   [invalid]="true"    .baps-file-upload-invalid
 *   [disabled]="true"   .baps-file-upload-disabled
 *   dragOver (internal) .baps-file-upload-dragover
 *
 * `dragOver` is NOT an input — the component sets it from its own dragover
 * and dragleave handlers. Outside Angular you own that boolean, and it is the
 * one piece of state these snippets implement rather than show.
 *
 * ## The zone is the control, not the button
 *
 * The inner button carries `inert`, and that is load-bearing rather than
 * decorative. The zone itself is `role="button"` with `tabindex="0"`; without
 * `inert` the button becomes a second tab stop whose Enter both activates it
 * AND bubbles to the zone, so the picker opens twice. `inert` keeps the visual
 * affordance, drops it from the tab order, and lets clicks fall through.
 *
 * Copy that attribute across. It looks exactly like something a linter would
 * strip as redundant.
 *
 * Disabled needs both halves: the class paints, the `disabled` attribute on
 * the input is what actually stops the picker. A zone that keeps its tabindex
 * is still reachable by keyboard however grey it looks.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('file-upload');

export const fileUploadSnippets: Record<string, SnippetSet> = {
  // Default, invalid and disabled in one column. They differ by a single class
  // and nothing else.
  //
  // Invalid is deliberately quiet — it recolours the ring rather than shouting,
  // so pair it with a message of your own rather than relying on it to carry
  // the error. Disabled takes the attribute on the input as well as the class:
  // the class only paints, and a zone that keeps its tabindex still opens the
  // picker however grey it looks.
  States: {
    primeng: `<div style="display:flex; flex-direction:column; gap:24px; max-width:518px;">
  <baps-file-upload (filesSelected)="onFiles($event)" />
  <baps-file-upload [invalid]="true" (filesSelected)="onFiles($event)" />
  <baps-file-upload [disabled]="true" />
</div>`,
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

const STATES = [{}, { invalid: true }, { disabled: true }];

/* FileUpload from the Playground example already takes both booleans, so the
   three zones differ by one prop and share every handler. */
export function States({ onFiles }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 518 }}>
      {STATES.map((props, i) => (
        <FileUpload key={i} onFiles={onFiles} {...props} />
      ))}
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const STATES = [{}, { invalid: true }, { disabled: true }];

/* FileUpload from the Playground example already takes both booleans, so the
   three zones differ by one prop and share every handler. */
export default function States({ onFiles }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 518 }}>
      {STATES.map((props, i) => (
        <FileUpload key={i} onFiles={onFiles} {...props} />
      ))}
    </div>
  );
}`,
  },

  // The default zone. Everything visible is markup — the icon is an inline SVG
  // the component owns, not a glyph from the BAPS set, so it is copied as-is
  // rather than drawn through baps-icon.
  Playground: {
    primeng: `<baps-file-upload (filesSelected)="onFiles($event)" />`,
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
    react: `${SETUP}

import { useRef, useState } from 'react';

export function FileUpload({ onFiles, accept, multiple = false, invalid = false, disabled = false }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const open = () => !disabled && inputRef.current?.click();
  const take = (list) => onFiles([...list]);

  return (
    <baps-file-upload>
      <div
        className={
          'baps-file-upload-zone' +
          (dragOver ? ' baps-file-upload-dragover' : '') +
          (invalid ? ' baps-file-upload-invalid' : '') +
          (disabled ? ' baps-file-upload-disabled' : '')
        }
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        aria-label="Click to upload or drag and drop"
        onClick={open}
        onKeyDown={(e) => {
          /* Enter and Space both activate a role="button", and Space must be
             prevented or the page scrolls behind the picker. */
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}
        onDragOver={(e) => {
          /* preventDefault on BOTH dragover and drop, or the browser navigates
             to the dropped file instead of handing it over. */
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) take(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => take(e.target.files)}
        />
        <div className="baps-file-upload-ring">
          <div className="baps-file-upload-icon">
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        </div>
        {/* inert, not disabled — see the note at the top of this file. React 19
            types it natively; on 18 pass inert="" so it still reaches the DOM. */}
        <button inert="" type="button" className="baps-button baps-button--secondary baps-button--s">
          <span className="baps-button__label">Upload Image</span>
        </button>
        <p className="baps-file-upload-hint">Click to upload or drag and drop</p>
        <p className="baps-file-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
      </div>
    </baps-file-upload>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' is not optional here: the zone owns a ref, a drag boolean and
   four DOM event handlers. Keep the component client-side and hand the files
   to whatever server action consumes them. */
export { FileUpload as default } from './FileUpload';`,
  },
};
