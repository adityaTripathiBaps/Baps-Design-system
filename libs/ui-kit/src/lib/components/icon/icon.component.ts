import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
  computed,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { BAPS_ICONS, type BapsIconName } from './icon-set';

/** The named size steps. A raw pixel number is also accepted. */
export type BapsIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<BapsIconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  // 24 is the size the icons are drawn at in Figma — every other step is this
  // artwork scaled, which is why the stroke thins visibly below sm.
  lg: 24,
  xl: 32,
};

/**
 * BAPS Pixel Icons — Figma "Sampark Portal" node 13193:56731.
 *
 * The glyphs are 24x24 stroked outlines whose stroke is `currentColor`, so an
 * icon takes the colour of the text around it. That is deliberate and is why
 * this component has no `brand` input, unlike most of the library: there is
 * nothing brand-specific to switch. Put it inside something maroon and it is
 * maroon; put it in dark mode and it follows the text colour there.
 *
 * Accessibility hinges on one input. An icon with no `label` is decorative and
 * is hidden from assistive technology; an icon WITH a `label` is content and is
 * announced. Getting this wrong in either direction is the common bug: a
 * decorative icon that gets read out, or an icon-only button that announces
 * nothing.
 */
@Component({
  selector: 'baps-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    class="baps-icon__glyph"
    [innerHTML]="svg()"
    [attr.aria-hidden]="label ? null : 'true'"
    [attr.role]="label ? 'img' : null"
    [attr.aria-label]="label || null"
  ></span>`,
  styles: `
    baps-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      /* Set by the size input; the fallback is the lg step, which is the size
         the artwork is actually drawn at. */
      width: var(--baps-icon-size, 24px);
      height: var(--baps-icon-size, 24px);
      color: inherit;
      vertical-align: middle;
    }

    baps-icon .baps-icon__glyph {
      display: block;
      width: 100%;
      height: 100%;
      line-height: 0;
    }

    baps-icon svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  // Matches the rest of the library. It is also load-bearing here: with
  // emulated encapsulation the `baps-icon { … }` rule below compiles to
  // `baps-icon[_ngcontent-x]`, which never matches the host, so the size rule
  // silently does nothing and every icon collapses to zero width.
  encapsulation: ViewEncapsulation.None,
  host: {
    '[style.--baps-icon-size.px]': 'pixels()',
  },
})
export class BapsIcon {
  private readonly sanitizer = inject(DomSanitizer);

  private readonly _name = signal<BapsIconName | null>(null);
  private readonly _size = signal<BapsIconSize | number>('lg');

  /** Which glyph to draw. Unknown names render nothing rather than throwing. */
  @Input({ required: true })
  set name(value: BapsIconName) {
    this._name.set(value);
  }
  get name(): BapsIconName | null {
    return this._name();
  }

  /** A named step, or a pixel number for a one-off size. */
  @Input()
  set size(value: BapsIconSize | number) {
    this._size.set(value);
  }
  get size(): BapsIconSize | number {
    return this._size();
  }

  /**
   * Leave unset for a decorative icon sitting beside its own visible text — it
   * is then hidden from screen readers, which is correct: announcing it would
   * repeat the label. Set it when the icon IS the content, such as an icon-only
   * button, and it is announced instead.
   */
  @Input() label?: string;

  protected readonly pixels = computed(() => {
    const s = this._size();
    return typeof s === 'number' ? s : SIZE_PX[s];
  });

  protected readonly svg = computed<SafeHtml>(() => {
    const key = this._name();
    const body = key ? BAPS_ICONS[key] : undefined;
    if (!body) return '';
    // Assembled as a full <svg> string and injected into a <span> rather than
    // bound onto an <svg> element: innerHTML on an SVG element is parsed in the
    // HTML namespace, which yields elements that never paint. Letting the HTML
    // parser see the <svg> tag itself is what puts the children in the right
    // namespace.
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">${body}</svg>`,
    );
  });
}
