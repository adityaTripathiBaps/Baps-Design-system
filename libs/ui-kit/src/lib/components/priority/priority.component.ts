import { Component, Input, ViewEncapsulation, computed, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

export type BapsPriorityLevel = 'high' | 'medium' | 'low' | 'none';

/**
 * Figma "🟢 Component Library" Icon page, Priority set (5959:99251). Glyphs
 * are Figma's own paths on the 24x24 box, filled with currentColor.
 */
const GLYPHS: Record<BapsPriorityLevel, string> = {
  high: '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M19.6092 12.2229C19.3589 12.4248 19.0195 12.5382 18.6656 12.5382C18.3116 12.5382 17.9722 12.4248 17.7219 12.2229L11.9919 7.59955L6.26197 12.2229C6.01024 12.4191 5.67309 12.5277 5.32313 12.5252C4.97317 12.5228 4.6384 12.4095 4.39093 12.2098C4.14346 12.0101 4.00309 11.74 4.00005 11.4576C3.99701 11.1753 4.13154 10.9032 4.37467 10.7001L11.0483 5.31532C11.2986 5.11342 11.638 5 11.9919 5C12.3459 5 12.6853 5.11342 12.9356 5.31532L19.6092 10.7001C19.8594 10.9021 20 11.176 20 11.4615C20 11.7471 19.8594 12.021 19.6092 12.2229ZM19.6092 18.6847C19.3589 18.8866 19.0195 19 18.6656 19C18.3116 19 17.9722 18.8866 17.7219 18.6847L11.9919 14.0613L6.26197 18.6847C6.01024 18.8809 5.67309 18.9894 5.32313 18.987C4.97317 18.9845 4.6384 18.8712 4.39093 18.6716C4.14346 18.4719 4.00309 18.2018 4.00005 17.9194C3.99701 17.637 4.13154 17.365 4.37467 17.1619L11.0483 11.7771C11.2986 11.5752 11.638 11.4618 11.9919 11.4618C12.3459 11.4618 12.6853 11.5752 12.9356 11.7771L19.6092 17.1619C19.8594 17.3638 20 17.6377 20 17.9233C20 18.2088 19.8594 18.4827 19.6092 18.6847Z"/>',
  medium: '<path fill="currentColor" d="M5.14286 14.619C4.51071 14.619 4 15.151 4 15.8095C4 16.468 4.51071 17 5.14286 17H18.8571C19.4893 17 20 16.468 20 15.8095C20 15.151 19.4893 14.619 18.8571 14.619H5.14286ZM5.14286 7C4.51071 7 4 7.53199 4 8.19048C4 8.84896 4.51071 9.38095 5.14286 9.38095H18.8571C19.4893 9.38095 20 8.84896 20 8.19048C20 7.53199 19.4893 7 18.8571 7H5.14286Z"/>',
  low: '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M19.6092 11.7771C19.3589 11.5752 19.0195 11.4618 18.6656 11.4618C18.3116 11.4618 17.9722 11.5752 17.7219 11.7771L11.9919 16.4005L6.26197 11.7771C6.01024 11.5809 5.67309 11.4723 5.32313 11.4748C4.97317 11.4773 4.6384 11.5905 4.39093 11.7902C4.14346 11.9899 4.00309 12.26 4.00005 12.5424C3.99701 12.8247 4.13154 13.0968 4.37467 13.2999L11.0483 18.6847C11.2986 18.8866 11.638 19 11.9919 19C12.3459 19 12.6853 18.8866 12.9356 18.6847L19.6092 13.2999C19.8594 13.0979 20 12.8241 20 12.5385C20 12.2529 19.8594 11.979 19.6092 11.7771ZM19.6092 5.31532C19.3589 5.11342 19.0195 5 18.6656 5C18.3116 5 17.9722 5.11342 17.7219 5.31532L11.9919 9.9387L6.26197 5.31532C6.01024 5.11914 5.67309 5.01059 5.32313 5.01304C4.97317 5.0155 4.6384 5.12876 4.39093 5.32844C4.14346 5.52811 4.00309 5.79823 4.00005 6.0806C3.99701 6.36298 4.13154 6.63502 4.37467 6.83814L11.0483 12.2229C11.2986 12.4248 11.638 12.5382 11.9919 12.5382C12.3459 12.5382 12.6853 12.4248 12.9356 12.2229L19.6092 6.83814C19.8594 6.63618 20 6.3623 20 6.07673C20 5.79116 19.8594 5.51728 19.6092 5.31532Z"/>',
  none: '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M12 6.08696C8.73432 6.08696 6.08696 8.73432 6.08696 12C6.08696 15.2657 8.73432 17.913 12 17.913C15.2657 17.913 17.913 15.2657 17.913 12C17.913 8.73432 15.2657 6.08696 12 6.08696ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z"/>',
};

const LABELS: Record<BapsPriorityLevel, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
  none: 'No priority',
};

/**
 * baps-priority: the 24px priority mark from the "🟢 Component Library"
 * Icon page (5959:99251): High ⇈, Medium =, Low ⇊, None ○.
 *
 * Each level has its own status colour. On hover the mark turns into a
 * filled 4px-radius square with a white glyph, as in Figma's Hover row.
 * Hover only shows when `interactive` is set (for example, when the mark
 * opens a priority picker), so a read-only table cell does not look
 * clickable.
 *
 * The mark is announced as an image with "High priority" etc.; pass `label`
 * to change the text.
 *
 * ## Usage
 *   <baps-priority level="high" />
 */
@Component({
  selector: 'baps-priority',
  template: `<span class="baps-priority__glyph" [innerHTML]="svg()"></span>`,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/priority/_priority.scss'],
  host: {
    role: 'img',
    '[attr.aria-label]': 'label ?? defaultLabel()',
    class: 'baps-priority',
    '[class.baps-priority--high]': "_level() === 'high'",
    '[class.baps-priority--medium]': "_level() === 'medium'",
    '[class.baps-priority--low]': "_level() === 'low'",
    '[class.baps-priority--none]': "_level() === 'none'",
    '[class.baps-priority--interactive]': 'interactive',
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsPriority {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly _level = signal<BapsPriorityLevel>('none');

  /** Which mark to draw (Figma property "Priority"). */
  @Input() set level(value: BapsPriorityLevel) {
    this._level.set(value ?? 'none');
  }
  get level(): BapsPriorityLevel {
    return this._level();
  }
  /** Accessible name; defaults to "High priority" etc. */
  @Input() label?: string;
  /** Show Figma's hover state (filled square). Off for read-only marks. */
  @Input() interactive = false;
  @Input() brand: BapsBrand = injectBapsBrand();

  protected readonly defaultLabel = computed(() => LABELS[this._level()]);
  protected readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">${GLYPHS[this._level()]}</svg>`,
    ),
  );
}
