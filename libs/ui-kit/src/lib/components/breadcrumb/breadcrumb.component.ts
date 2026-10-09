import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
// `import type` is required: Storybook's webpack build runs with
// emitDecoratorMetadata + isolatedModules, and a value import referenced by a
// decorated signature (`@Input() home?: MenuItem`) is TS1272 there.
import type { MenuItem } from 'primeng/api';

/**
 * baps-breadcrumb — navigation breadcrumb trail.
 *
 * Wraps PrimeNG Breadcrumb. Sampark skin: '/' separator, 12px muted
 * text, maroon active link, no background.
 */
@Component({
  selector: 'baps-breadcrumb',
  imports: [Breadcrumb],
  template: `
    <p-breadcrumb
      [model]="model"
      [home]="home"
      [style]="style"
      [styleClass]="styleClass"
    ></p-breadcrumb>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* ── Sampark breadcrumb ── */
    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb {
      background: transparent;
      border: none;
      padding: 0;
      font-size: 0.75rem;
      border-radius: 0;
    }

    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-list {
      gap: 0.25rem;
    }

    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-item-link {
      color: var(--color-sampark-text-muted, #9f9c9c);
      font-weight: 400;
      text-decoration: none;
      transition: color 120ms ease;
    }

    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-item-link:hover {
      color: var(--color-sampark-primary-default, #c96868);
      text-decoration: underline;
    }

    /* Active / last item — bold and dark */
    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-item:last-child .p-breadcrumb-item-link {
      color: var(--color-sampark-text-primary, #151414);
      font-weight: 500;
      pointer-events: none;
    }

    /* Separator: slash */
    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-separator {
      color: var(--color-sampark-text-muted, #9f9c9c);
      margin: 0 0.125rem;
    }

    /* Home icon */
    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-home-icon {
      color: var(--color-sampark-text-muted, #9f9c9c);
      font-size: 0.875rem;
    }

    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-home-icon:hover {
      color: var(--color-sampark-primary-default, #c96868);
    }

    :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-item-link:focus-visible {
      outline: 2px solid var(--color-sampark-primary-default, #c96868);
      outline-offset: 2px;
      border-radius: 2px;
    }

    /* ── Dark mode ── */
    .baps-dark :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-item-link {
      color: var(--color-mybky-mono-400, #b6b6af);
    }
    .baps-dark :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-item:last-child .p-breadcrumb-item-link {
      color: var(--color-mybky-mono-50, #f8fafb);
    }
    .baps-dark :is(baps-breadcrumb.baps-sampark, .baps-ds-sampark baps-breadcrumb) .p-breadcrumb-separator {
      color: var(--color-mybky-mono-500, #6f777d);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsBreadcrumb implements AfterViewChecked {
  /** Array of MenuItem objects defining the breadcrumb trail. */
  @Input() model: MenuItem[] = [];
  /** Home/root item (typically with icon: 'pi pi-home'). */
  @Input() home?: MenuItem;
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  private readonly host = inject(ElementRef<HTMLElement>);

  /** The link currently carrying the mark, so the common case costs nothing. */
  private marked?: Element;

  /**
   * Mark the last crumb `aria-current="page"`.
   *
   * The last crumb IS the page you are on. Without this a screen reader
   * reads the trail as a row of ordinary links and never says which one is
   * here — the Sampark skin makes it obvious to a sighted reader (bold, dark,
   * pointer-events: none) and carries nothing for anyone else. React's
   * BapsBreadcrumb has always set it; this is Angular catching up.
   *
   * Done from the DOM rather than from a template, because PrimeNG offers no
   * hook that knows which item is last: `itemTemplate`'s context is
   * `{ $implicit: MenuItem }` with no index, and a `pt.itemLink` function
   * receives only `{ instance, parent }`. Supplying a full `itemTemplate`
   * would mean re-implementing PrimeNG's own routerLink/url/icon/label
   * rendering AND would override any template the consumer passes — a much
   * larger change than one attribute is worth.
   */
  ngAfterViewChecked(): void {
    const links = this.host.nativeElement.querySelectorAll(
      '.p-breadcrumb-item-link',
    );
    const last = links.item(links.length - 1) ?? undefined;
    if (last === this.marked) return;

    this.marked?.removeAttribute('aria-current');
    last?.setAttribute('aria-current', 'page');
    this.marked = last;
  }
}
