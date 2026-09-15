import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';

// Deterministic per-instance id, matching baps-checkbox — Math.random() here
// would break SSR hydration, and `label [for]` needs an id that actually
// exists, so `inputId` can no longer be left undefined.
let nextSwitchId = 0;

@Component({
  selector: 'baps-toggleswitch',
  imports: [ToggleSwitch, FormsModule],
  template: `
    <div class="baps-switch-wrapper">
      <p-toggleswitch
        [(ngModel)]="value"
        [disabled]="disabled"
        [readonly]="readonly"
        [inputId]="inputId"
        (onChange)="onModelChange($event.checked)"
      ></p-toggleswitch>
      @if (label) {
        <label [for]="inputId" class="p-toggleswitch-label" [class.p-disabled]="disabled">{{ label }}</label>
      }
    </div>
  `,
  // Size/brand geometry lives in the global skins keyed off the host classes
  // below: _switch.scss (MyBKY sm/lg) and _switch-sampark.scss (Sampark).
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsToggleSwitch),
      multi: true,
    },
  ],
  host: {
    '[class.baps-switch-xs]': "size === 'xs'",
    '[class.baps-switch-sm]': "size === 'sm'",
    '[class.baps-switch-lg]': "size === 'lg'",
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsToggleSwitch implements ControlValueAccessor {
  /**
   * Trailing text. Every variant in Figma node 13197:89115 "Switch" is
   * `track + "Placeholder Text"`, so the label is the norm, not the
   * exception. Mirrors `baps-checkbox`: real `<label [for]>` bound to the
   * rendered input, so clicking the text toggles and screen readers get a
   * name. Omit it and the DOM is a bare switch as before.
   */
  @Input() label?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() inputId = `baps-switch-${nextSwitchId++}`;
  /**
   * MyBKY (events-ui --switch-*): sm 28×16 / md 36×20 (default) / lg 40×24;
   * xs renders the sm box. Sampark (spm-ui switchsize): xs 28×16 / sm 32×20 /
   * md 36×22 (default) / lg 40×24.
   */
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  /**
   * Sampark renders spm-ui's square switch (_switch-sampark.scss): 3–4px track
   * radius, inset track shadow. Also applied page-wide by .baps-ds-sampark.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  value = false;

  onModelChange: any = () => { /* empty */ };
  onModelTouched: any = () => { /* empty */ };

  writeValue(value: any): void {
    this.value = !!value;
  }
  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
