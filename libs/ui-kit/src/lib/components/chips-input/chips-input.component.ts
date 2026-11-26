import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';

import { BapsChip } from '../chip/chip.component';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/** A free-text, multi-value field that renders each committed value as a chip. */
@Component({
  selector: 'baps-chips-input',
  imports: [AutoComplete, BapsChip, FormsModule],
  template: `
    <div class="baps-chips-input__control" [class.p-disabled]="disabled">
      @for (item of value; track item) {
        <baps-chip
          [label]="item"
          [brand]="brand"
          [disabled]="disabled"
          [removable]="!disabled"
          (remove)="removeValue(item)"
        />
      }
      <p-autocomplete
        #autocomplete
        [(ngModel)]="value"
        [multiple]="true"
        [typeahead]="false"
        [suggestions]="suggestions"
        [placeholder]="placeholder"
        [ariaLabel]="accessibleLabel"
        [ariaLabelledBy]="accessibleLabelledBy"
        [disabled]="disabled"
        [separator]="separator"
        (ngModelChange)="handleValueChange($event)"
        (onBlur)="markTouched()"
      />
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/chips-input/_chips-input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsChipsInput),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-chips-input-sm]': "size === 'small'",
    '[class.baps-chips-input-lg]': "size === 'large'",
  },
})
export class BapsChipsInput implements ControlValueAccessor, AfterViewInit {
  /** A value written from code has no template event behind it to schedule a render. */
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() size?: 'small' | 'large';
  @Input() brand: BapsBrand = injectBapsBrand();
  @Input() separator?: string;

  value: string[] = [];
  protected readonly suggestions: string[] = [];
  @ViewChild('autocomplete', { read: ElementRef })
  private autocompleteHost?: ElementRef<HTMLElement>;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  protected get accessibleLabel(): string | undefined {
    return this.accessibleLabelledBy
      ? undefined
      : this.placeholder?.trim() || 'Chips input';
  }

  protected get accessibleLabelledBy(): string | undefined {
    return this.host.nativeElement.getAttribute('aria-labelledby') || undefined;
  }

  private onChange: (value: string[]) => void = () => {
    /* empty */
  };
  private onTouched: () => void = () => {
    /* empty */
  };

  ngAfterViewInit(): void {
    const listbox = this.autocompleteHost?.nativeElement.querySelector(
      '.p-autocomplete-input-multiple',
    );
    if (!listbox) return;

    this.renderer.setAttribute(listbox, 'role', 'group');
    this.renderer.removeAttribute(listbox, 'aria-orientation');
    const inputItem = listbox.querySelector('.p-autocomplete-input-chip');
    if (inputItem)
      this.renderer.setAttribute(inputItem, 'role', 'presentation');

    if (this.accessibleLabelledBy) {
      this.renderer.setAttribute(
        listbox,
        'aria-labelledby',
        this.accessibleLabelledBy,
      );
    } else if (this.accessibleLabel) {
      this.renderer.setAttribute(listbox, 'aria-label', this.accessibleLabel);
    }
  }

  handleValueChange(value: string[] | null | undefined): void {
    const next = this.normalise(value);
    this.value = next;
    this.onChange(next);
  }

  removeValue(item: string): void {
    if (this.disabled) return;

    const index = this.value.indexOf(item);
    if (index === -1) return;

    const next = this.value.filter((_, valueIndex) => valueIndex !== index);
    this.value = next;
    this.onChange(next);
    this.onTouched();
  }

  markTouched(): void {
    this.onTouched();
  }

  writeValue(value: string[] | null | undefined): void {
    this.cdr.markForCheck();
    this.value = this.normalise(value);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cdr.markForCheck();
    this.disabled = isDisabled;
  }

  private normalise(value: string[] | null | undefined): string[] {
    return Array.isArray(value) ? [...value] : [];
  }
}
