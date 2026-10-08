import { Component, Input, ViewEncapsulation, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Slider } from 'primeng/slider';
import { SAMPARK_SLIDER_TOKENS } from '../../theme/sampark.theme';

@Component({
  selector: 'baps-slider',
  imports: [Slider, FormsModule],
  template: `
    <p-slider
      [(ngModel)]="value"
      [min]="min"
      [max]="max"
      [step]="step"
      [range]="range"
      [orientation]="orientation"
      [disabled]="disabled"
      [style]="style"
      [styleClass]="styleClass"
      [ariaLabel]="ariaLabel"
      [ariaLabelledBy]="ariaLabelledBy"
      [dt]="dt"
      (onChange)="onSliderChange($event)"
    ></p-slider>
    @for (v of tooltipValues; track $index) {
      <span
        class="baps-slider-tooltip"
        [style.left.%]="percent(v)"
        aria-hidden="true"
        >{{ v }}</span
      >
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/slider/_slider.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsSlider),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-slider-has-tooltip]': 'tooltipValues.length > 0',
  },
})
export class BapsSlider implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() range = false;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() disabled = false;
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() showValueTooltip = false;

  value: any = 0;

  get tooltipValues(): number[] {
    if (!this.showValueTooltip || this.orientation !== 'horizontal') return [];
    return this.range ? (this.value ?? []) : [this.value ?? this.min];
  }

  percent(value: number): number {
    const span = this.max - this.min;
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((value - this.min) / span) * 100));
  }

  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_SLIDER_TOKENS : undefined;
  }

  private onChange: (value: any) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  onSliderChange(event: { value?: number; values?: number[] }): void {
    this.value = this.range ? event.values : event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value ?? (this.range ? [this.min, this.max] : this.min);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
