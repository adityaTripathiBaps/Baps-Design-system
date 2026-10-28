import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Message } from 'primeng/message';

@Component({
  selector: 'baps-message',
  imports: [Message],
  template: `
    <p-message
      [severity]="severity"
      [text]="text"
      [icon]="icon"
      [variant]="variant"
      [size]="size"
      [style]="style"
      [styleClass]="styleClass"
    >
      <ng-content></ng-content>
    </p-message>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/form-field/_message-sampark.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsMessage {
  @Input() severity?:
    'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  @Input() text?: string;
  @Input() icon?: string;
  @Input() variant?: 'outlined' | 'text' | 'simple';
  @Input() size?: 'small' | 'large';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  /**
   * Sampark skin without a page scope. `brand="sampark"` was silently
   * ignored before (the input did not exist), so a Sampark app with no root
   * class rendered the MyBKY message.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
