import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Chip } from 'primeng/chip';

/** A compact selected-value, filter or entity label. */
@Component({
  selector: 'baps-chip',
  imports: [Chip],
  template: `
    <p-chip
      [label]="label"
      [icon]="icon"
      [image]="image"
      [alt]="alt"
      [removable]="removable && !disabled"
      [removeIcon]="removeIcon"
      [styleClass]="resolvedClass"
      (onRemove)="remove.emit($event)"
      (onImageError)="imageError.emit($event)"
    >
      <ng-content></ng-content>
    </p-chip>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/chip/_chip.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[attr.data-disabled]': 'disabled ? true : null',
  },
})
export class BapsChip {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() image?: string;
  @Input() alt?: string;
  @Input() removable = false;
  @Input() removeIcon?: string;
  @Input() styleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() disabled = false;

  protected get resolvedClass(): string | undefined {
    return this.styleClass;
  }

  @Output() remove = new EventEmitter<MouseEvent>();
  @Output() imageError = new EventEmitter<Event>();
}
