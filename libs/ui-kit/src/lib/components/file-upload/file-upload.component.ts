import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BapsButton } from '../button/button.component';

/**
 * baps-file-upload — click-or-drag dropzone (Sampark Portal "Web File Upload",
 * Figma node 13197:87830).
 *
 * Deliberately NOT a PrimeNG FileUpload wrapper: the Figma spec is a plain
 * dropzone (icon + button + hint), while p-fileupload ships a toolbar/list UI
 * that would need more CSS to erase than this component costs. Selection and
 * drag-drop use the native file input; consumers receive the File list via
 * (filesSelected) and own upload/validation.
 *
 * State colors ride the shared --input-* tokens from _input.scss /
 * _input-sampark.scss, so the zone follows whichever design-system scope and
 * dark mode the page is in, like every other form control.
 */
@Component({
  selector: 'baps-file-upload',
  imports: [BapsButton],
  template: `
    <div
      class="baps-file-upload-zone"
      [class.baps-file-upload-dragover]="dragOver"
      [class.baps-file-upload-invalid]="invalid"
      [class.baps-file-upload-disabled]="disabled"
      role="button"
      [attr.aria-label]="hint"
      [attr.aria-disabled]="disabled || null"
      [attr.tabindex]="disabled ? null : 0"
      (click)="open()"
      (keydown.enter)="open()"
      (keydown.space)="$event.preventDefault(); open()"
      (dragover)="onDragOver($event)"
      (dragleave)="dragOver = false"
      (drop)="onDrop($event)"
    >
      <input
        #fileInput
        type="file"
        hidden
        [accept]="accept"
        [multiple]="multiple"
        [disabled]="disabled"
        (change)="onChange($event)"
      />
      <div class="baps-file-upload-ring">
        <div class="baps-file-upload-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>
      <!-- inert: the zone itself is the control (role=button, tab stop). Without
           this the inner button is a second tab stop whose Enter both clicks it
           and bubbles to the zone, opening the picker twice. inert keeps the
           visual affordance, drops it from the tab order, and lets clicks fall
           through to the zone. -->
      <baps-button inert [label]="buttonLabel" severity="secondary" size="small" [brand]="brand" [disabled]="disabled"></baps-button>
      <p class="baps-file-upload-hint">{{ hint }}</p>
      @if (description) {
        <p class="baps-file-upload-hint">{{ description }}</p>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-file-upload {
      display: block;
    }

    baps-file-upload .baps-file-upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 2rem 1.5rem;
      background: var(--input-bg-default, #ffffff);
      border: 1px solid var(--input-border-default, #e1e0e0);
      border-radius: var(--radius-sampark-default, 0.25rem);
      cursor: pointer;
      transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
    }

    baps-file-upload .baps-file-upload-zone:hover:not(.baps-file-upload-disabled):not(.baps-file-upload-invalid),
    baps-file-upload .baps-file-upload-zone.baps-file-upload-dragover:not(.baps-file-upload-disabled):not(.baps-file-upload-invalid) {
      border-color: var(--input-border-hover, #94928f);
    }

    baps-file-upload .baps-file-upload-zone:focus-within:not(.baps-file-upload-invalid) {
      border-color: var(--input-border-hover, #94928f);
      box-shadow: 0 0 0 3px var(--input-shadow-focused, #f2f1f0);
    }

    baps-file-upload .baps-file-upload-zone.baps-file-upload-invalid {
      border-color: var(--input-border-error, #ea151a);
    }

    baps-file-upload .baps-file-upload-zone.baps-file-upload-invalid:focus-within,
    baps-file-upload .baps-file-upload-zone.baps-file-upload-invalid.baps-file-upload-dragover {
      box-shadow: 0 0 0 3px var(--input-shadow-error, #ffe5e5);
    }

    baps-file-upload .baps-file-upload-zone.baps-file-upload-disabled {
      background: var(--input-bg-disabled, #f8f7f7);
      cursor: not-allowed;
    }

    /* Concentric rings around the image glyph, per the Figma spec. */
    baps-file-upload .baps-file-upload-ring {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 50%;
      border: 1px solid var(--color-sampark-mono-20, #f3f2f2);
      display: grid;
      place-items: center;
      margin-bottom: 0.5rem;
    }

    baps-file-upload .baps-file-upload-icon {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
      border: 1px solid var(--input-border-default, #e1e0e0);
      display: grid;
      place-items: center;
      color: var(--input-text-ghost, #595656);
    }

    baps-file-upload .baps-file-upload-hint {
      margin: 0;
      font-size: 0.75rem;
      line-height: 1.3;
      color: var(--input-text-placeholder, #9f9c9c);
      text-align: center;
    }

    baps-file-upload .baps-file-upload-hint:first-of-type {
      margin-top: 0.25rem;
    }
  `,
})
export class BapsFileUpload {
  /** Native accept filter, e.g. "image/*" or ".svg,.png". */
  @Input() accept?: string;
  @Input() multiple = false;
  @Input() disabled = false;
  /** Error state — red border + red focus ring, per the Figma spec. */
  @Input() invalid = false;
  @Input() buttonLabel = 'Upload Image';
  @Input() hint = 'Click to upload or drag and drop';
  @Input() description = 'SVG, PNG, JPG or GIF (max. 800×400px)';
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /** Emits the chosen files on picker selection or drop. */
  @Output() filesSelected = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  dragOver = false;

  open(): void {
    if (!this.disabled) {
      this.fileInput.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = !this.disabled;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (this.disabled) return;
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      this.filesSelected.emit(this.multiple ? files : files.slice(0, 1));
    }
  }

  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) {
      this.filesSelected.emit(files);
    }
    input.value = '';
  }
}
