import { Component, Input } from '@angular/core';
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
})
export class BapsMessage {
  @Input() severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  @Input() text?: string;
  @Input() icon?: string;
  @Input() variant?: 'outlined' | 'text' | 'simple';
  @Input() size?: 'small' | 'large';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
}
