import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from 'primeng/editor';
import type { EditorInitEvent, EditorTextChangeEvent } from 'primeng/types/editor';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-editor: a rich-text field with a formatting toolbar, wrapping PrimeNG
 * Editor (Quill 2).
 *
 * Figma "🟢 Component Library" Web Input Text Area with the Richtext Bar
 * (585:4268, bar 585:5287). One bordered field holds three parts, top to
 * bottom: the text, an optional "n / max" count, and the toolbar.
 *   - toolbar="default": B I U S | size colour | left centre right |
 *     bullets numbers | attach
 *   - toolbar="compact": B I U | size colour | align list | attach, where
 *     align is a dropdown and list is one bulleted-list toggle (Quill has no
 *     icon dropdown for lists).
 * A disabled editor hides the toolbar, as Figma's disabled state does.
 *
 * Requires the optional peer `quill` (^2.0.3). PrimeNG loads it lazily, so
 * apps that never render a baps-editor do not need it installed.
 *
 * The attach button has no Quill format behind it. It emits `attach`, and the
 * app decides what attaching means.
 *
 * ## Usage
 *   <label id="notes-label">Notes</label>
 *   <baps-editor ariaLabelledBy="notes-label" [(ngModel)]="html" [maxLength]="200" (attach)="pickFile()" />
 *
 * The editable area is a contenteditable <div>, which a <label for> cannot
 * name, so it is named with ariaLabelledBy or ariaLabel instead.
 */
@Component({
  selector: 'baps-editor',
  imports: [Editor, FormsModule],
  template: `
    <p-editor
      [(ngModel)]="value"
      [placeholder]="placeholder ?? ''"
      [readonly]="disabled"
      (onTextChange)="onText($event)"
      (onBlur)="onTouched()"
      (onInit)="onInit($event)"
    >
      <ng-template #header>
        @if (toolbar === 'compact') {
          <span class="ql-formats">
            <button type="button" class="ql-bold" aria-label="Bold"></button>
            <button type="button" class="ql-italic" aria-label="Italic"></button>
            <button type="button" class="ql-underline" aria-label="Underline"></button>
          </span>
          <span class="ql-formats">
            <select class="ql-size" aria-label="Font size"></select>
            <select class="ql-color" aria-label="Font colour"></select>
          </span>
          <span class="ql-formats">
            <select class="ql-align" aria-label="Alignment"></select>
            <!-- Quill has no icon picker for lists, so a select would draw an
                 empty label. Compact keeps one bulleted-list toggle instead. -->
            <button type="button" class="ql-list" value="bullet" aria-label="Bulleted list"></button>
          </span>
        } @else {
          <span class="ql-formats">
            <button type="button" class="ql-bold" aria-label="Bold"></button>
            <button type="button" class="ql-italic" aria-label="Italic"></button>
            <button type="button" class="ql-underline" aria-label="Underline"></button>
            <button type="button" class="ql-strike" aria-label="Strikethrough"></button>
          </span>
          <span class="ql-formats">
            <select class="ql-size" aria-label="Font size"></select>
            <select class="ql-color" aria-label="Font colour"></select>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-align" value="" aria-label="Align left"></button>
            <button type="button" class="ql-align" value="center" aria-label="Align centre"></button>
            <button type="button" class="ql-align" value="right" aria-label="Align right"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-list" value="bullet" aria-label="Bulleted list"></button>
            <button type="button" class="ql-list" value="ordered" aria-label="Numbered list"></button>
          </span>
        }
        <span class="ql-formats">
          <button
            type="button"
            class="baps-editor__attach"
            aria-label="Attach file"
            [disabled]="disabled"
            (click)="attach.emit()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M21 11.5 12.5 20a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15.5 7.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </span>
      </ng-template>
    </p-editor>
    @if (maxLength) {
      <span class="baps-editor__count" aria-live="polite">{{ length }} / {{ maxLength }}</span>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/editor/_editor.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsEditor),
      multi: true,
    },
  ],
  host: {
    class: 'baps-editor',
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-editor--invalid]': 'invalid',
    '[class.baps-editor--disabled]': 'disabled',
  },
})
export class BapsEditor implements ControlValueAccessor {
  @Input() placeholder?: string;
  /** Figma's two bars: the full row, or the compact one with dropdowns. */
  @Input() toolbar: 'default' | 'compact' = 'default';
  /** Shows the "n / max" count. Counts characters of text, not of HTML. */
  @Input() maxLength?: number;
  /** Id of the visible label that names the editable area. */
  @Input() ariaLabelledBy?: string;
  /** Accessible name when there is no visible label. */
  @Input() ariaLabel?: string;
  @Input() invalid = false;
  @Input() disabled = false;
  @Input() brand: BapsBrand = injectBapsBrand();
  /** The attach button was pressed. */
  @Output() attach = new EventEmitter<void>();

  value: string | null = null;
  length = 0;

  private onModelChange: (value: string | null) => void = () => {
    /* set by registerOnChange */
  };
  onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  onInit(event: EditorInitEvent): void {
    const root: HTMLElement = event.editor.root;
    root.setAttribute('role', 'textbox');
    root.setAttribute('aria-multiline', 'true');
    if (this.ariaLabelledBy) root.setAttribute('aria-labelledby', this.ariaLabelledBy);
    if (this.ariaLabel) root.setAttribute('aria-label', this.ariaLabel);
    if (this.invalid) root.setAttribute('aria-invalid', 'true');
    this.length = Math.max(0, event.editor.getLength() - 1);
  }

  onText(event: EditorTextChangeEvent): void {
    this.length = (event.textValue ?? '').replace(/\n$/, '').length;
    this.onModelChange(event.htmlValue);
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
