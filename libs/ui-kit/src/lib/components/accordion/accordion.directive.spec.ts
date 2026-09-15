import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { BapsAccordion } from './accordion.directive';

/**
 * Two things are pinned here, and the first is the reason this is a directive
 * at all.
 *
 * **It renders.** `baps-accordion` / `baps-accordion-panel` wrapper components
 * were written first and threw `NG0201: No provider found for _Accordion` the
 * moment a test rendered — `AccordionPanel` resolves its parent through the
 * element-injector *declaration* chain, which never passes through the
 * `p-accordion` inside a wrapper's own view. The first test below is a
 * regression guard against anyone reintroducing that wrapper: it asserts a
 * panel and its content actually render, which is exactly what failed before.
 *
 * **The brand class is emitted.** Every Sampark rule in `_accordion.scss` is
 * scoped to `:is(p-accordion.baps-sampark, .baps-ds-sampark p-accordion)`. If
 * the host class stops being applied, a per-instance Sampark accordion silently
 * falls back to the MyBKY palette — no error, right geometry, wrong colours.
 * That is the same class of silent failure that shipped in `baps-select`.
 */
@Component({
  imports: [Accordion, AccordionPanel, AccordionHeader, AccordionContent, BapsAccordion],
  template: `
    <p-accordion bapsAccordion [brand]="brand" [multiple]="multiple" [value]="value">
      <p-accordion-panel value="a">
        <p-accordion-header>
          <span class="baps-accordion-count" aria-hidden="true">4</span>
          <span class="baps-accordion-label">Status</span>
        </p-accordion-header>
        <p-accordion-content>
          <div class="baps-accordion-body">
            <span class="baps-accordion-divider"></span>
            <span class="projected">Body</span>
          </div>
        </p-accordion-content>
      </p-accordion-panel>
    </p-accordion>
  `,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  multiple = false;
  value: string | number | string[] | number[] | null = 'a';
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function el(fixture: { nativeElement: unknown }): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

describe('bapsAccordion renders on genuine PrimeNG markup', () => {
  it('renders a panel without throwing NG0201', async () => {
    // The whole reason this is a directive. A wrapper component threw here.
    const root = el(await render());
    expect(root.querySelector('.p-accordion')).not.toBeNull();
    expect(root.querySelector('.p-accordionpanel')).not.toBeNull();
  });

  it('renders the header with the count badge and label', async () => {
    const root = el(await render());
    expect(root.querySelector('.p-accordionheader')).not.toBeNull();
    expect(root.querySelector('.baps-accordion-count')!.textContent!.trim()).toBe('4');
    expect(root.querySelector('.baps-accordion-label')!.textContent!.trim()).toBe('Status');
  });

  it('projects the open panel content', async () => {
    expect(el(await render({ value: 'a' })).querySelector('.baps-accordion-body .projected')).not.toBeNull();
  });

  it('keeps PrimeNG toggle icon rather than a hand-rolled chevron', async () => {
    // PrimeNG owns the rotation and the aria-expanded wiring; replacing the
    // glyph would mean reimplementing both.
    expect(el(await render()).querySelector('.p-accordionheader-toggle-icon')).not.toBeNull();
  });

  it('hides the count badge from the accessibility tree', async () => {
    // The tally duplicates what the content already says, and the header
    // button's accessible name should be the label alone.
    const badge = el(await render()).querySelector('.baps-accordion-count')!;
    expect(badge.getAttribute('aria-hidden')).toBe('true');
  });
});

/**
 * The open state is forced in CSS, keyed to `data-p-active='true'` on the
 * content, because PrimeNG 21.1.3 never lifts the collapsed inline styles its
 * own `p-motion` writes — a panel is logically open but 0px tall. Full
 * reasoning is in `_accordion.scss`.
 *
 * jsdom has no layout, so these cannot assert the resulting height; that was
 * verified in a browser (89px open, matching the Figma frame, 32px closed,
 * stable across repeated toggles). What they CAN pin is the hook the CSS
 * selector depends on. If PrimeNG ever renames or drops `data-p-active`, the
 * override stops matching and every panel silently renders shut again — these
 * tests fail instead.
 */
describe('bapsAccordion open-state hook', () => {
  it('marks the open panel content with data-p-active="true"', async () => {
    const content = el(await render({ value: 'a' })).querySelector('.p-accordioncontent')!;
    expect(content.getAttribute('data-p-active')).toBe('true');
  });

  it('renders the p-motion element the override targets', async () => {
    const motion = el(await render({ value: 'a' })).querySelector(
      '.p-accordioncontent[data-p-active="true"] .p-motion',
    );
    expect(motion).not.toBeNull();
  });

  it('reports the open panel to assistive tech', async () => {
    const header = el(await render({ value: 'a' })).querySelector('.p-accordionheader')!;
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('bapsAccordion brand scoping', () => {
  async function accordionClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
    const fixture = await render(overrides);
    return el(fixture).querySelector('p-accordion')!.classList;
  }

  it('emits no host class for the default mybky brand', async () => {
    expect((await accordionClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await accordionClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('defaults brand to mybky, like every other brand-switchable component', () => {
    // Asserted on the directive itself, since a bare default has no host to read.
    @Component({
      imports: [Accordion, BapsAccordion],
      template: `<p-accordion bapsAccordion></p-accordion>`,
    })
    class BareHost {}

    const fixture = TestBed.createComponent(BareHost);
    const directive = fixture.debugElement.children[0].injector.get(BapsAccordion);
    expect(directive.brand).toBe('mybky');
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [Accordion, AccordionPanel, AccordionHeader, BapsAccordion],
      template: `
        <p-accordion bapsAccordion [brand]="brand()">
          <p-accordion-panel value="a">
            <p-accordion-header>
              <span class="baps-accordion-label">A</span>
            </p-accordion-header>
          </p-accordion-panel>
        </p-accordion>
      `,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const accordion = (fixture.nativeElement as HTMLElement).querySelector('p-accordion')!;
    expect(accordion.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(accordion.classList.contains('baps-sampark')).toBe(false);
  });

  it('leaves PrimeNG inputs alone — the directive only adds a class', async () => {
    // The directive deliberately re-declares nothing. Re-declaring a PrimeNG
    // input is what broke two-way binding on the old BapsTabs wrapper.
    const fixture = await render({ multiple: true, brand: 'sampark' });
    const accordion = fixture.debugElement.children[0].componentInstance as Accordion;
    expect(accordion.multiple()).toBe(true);
  });
});
