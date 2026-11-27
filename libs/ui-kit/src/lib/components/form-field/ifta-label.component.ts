import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';
import { IftaLabel } from 'primeng/iftalabel';

/**
 * baps-iftalabel — "infield top aligned" label: the label sits inside the
 * field, above the value. Wraps PrimeNG IftaLabel (primeng.dev/iftalabel);
 * project an input (or select, datepicker, …) and its `<label for>`.
 */
@Component({
  selector: 'baps-iftalabel',
  imports: [IftaLabel],
  template: `
    <p-iftalabel [style]="style" [class]="styleClass">
      <ng-content></ng-content>
    </p-iftalabel>
  `,
  encapsulation: ViewEncapsulation.None,
  /* PrimeNG's ifta rules sit in @layer primeng and lose to the kit's
     !important input skin (fixed 36/32px height, 6px block padding), which put
     the label over the value. Re-applied here with PrimeNG's own
     --p-iftalabel-* tokens; the label lines up with the field's text
     (MyBKY 0.875rem, Sampark 0.5rem: _input.scss / _input-sampark.scss). */
  styles: `
    baps-iftalabel .p-iftalabel {
      display: block;
    }
    baps-iftalabel .p-iftalabel.p-iftalabel :is(.p-inputtext, .p-select, .p-multiselect, .p-treeselect, .p-cascadeselect, .p-autocomplete, .p-datepicker, .p-inputnumber) {
      height: auto !important;
      min-height: 0 !important;
    }
    baps-iftalabel .p-iftalabel.p-iftalabel :is(.p-inputtext, .p-select-label, .p-multiselect-label, .p-treeselect-label, .p-cascadeselect-label) {
      padding-block-start: var(--p-iftalabel-input-padding-top) !important;
      padding-block-end: var(--p-iftalabel-input-padding-bottom) !important;
    }
    baps-iftalabel .p-iftalabel > label {
      inset-inline-start: 0.875rem;
      z-index: 1;
    }
    :is(baps-iftalabel.baps-sampark, .baps-ds-sampark baps-iftalabel) .p-iftalabel > label {
      inset-inline-start: 0.5rem;
    }
  `,
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsIftaLabel {
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();
}
