import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tabs, TabsModule } from 'primeng/tabs';

import { BapsTabs } from './tabs.directive';

/**
 * `bapsTabs` is a directive, not a wrapper, and that is the whole point of
 * it: the previous `<baps-tabs>` component re-declared `value` as a plain
 * `@Input()`, which shadowed PrimeNG's `value`/`valueChange` pair and made
 * `[(value)]` an NG8007 compile error. A directive adds classes and takes
 * nothing away, so two-way binding keeps working.
 *
 * That is the first thing pinned here, because it is the regression this
 * design exists to prevent and it would come back the moment someone
 * "tidied" the directive into a component again.
 *
 * The second is that **size is only a host class**, never a directive-only
 * hook: a page-wide `.baps-ds-sampark` strip carries no directive at all and
 * sets `.baps-tabs-md` on `p-tabs` by hand, so the stylesheet must key off
 * the class rather than off an attribute the directive would own.
 */
@Component({
  standalone: true,
  imports: [TabsModule, BapsTabs],
  template: `
    <p-tabs bapsTabs [(value)]="value" [brand]="brand()" [size]="size()">
      <p-tablist>
        <p-tab value="0">General</p-tab>
        <p-tab value="1">Members</p-tab>
      </p-tablist>
      <p-tabpanels>
        <p-tabpanel value="0">General content</p-tabpanel>
        <p-tabpanel value="1">Members content</p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
})
class Host {
  value = '0';
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly size = signal<'small' | 'medium' | 'large' | undefined>(undefined);
}

/**
 * The initial value is applied BEFORE the first change-detection pass. Writing a
 * two-way bound field on an already-settled fixture and forcing another pass
 * trips NG0100 in dev mode, because the binding has already read it this
 * cycle — a harness artifact, not a component bug.
 */
async function setup(initial?: string) {
  const fixture = TestBed.createComponent(Host);
  if (initial !== undefined) fixture.componentInstance.value = initial;
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

const tabsEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('p-tabs') as HTMLElement;

const tabButtons = (fixture: { nativeElement: HTMLElement }) =>
  [...fixture.nativeElement.querySelectorAll('[role="tab"]')] as HTMLElement[];

describe('BapsTabs (bapsTabs directive)', () => {
  describe('two-way value', () => {
    it("leaves PrimeNG's own value/valueChange pair intact", async () => {
      const fixture = await setup();
      const prime = fixture.debugElement.query(
        (de) => de.componentInstance instanceof Tabs,
      ).componentInstance as Tabs;

      // The whole reason this is a directive: a wrapper component that
      // re-declared `value` shadowed this pair and broke [(value)].
      expect(prime.value()).toBe('0');

      tabButtons(fixture)[1].click();
      await apply(fixture);

      expect(fixture.componentInstance.value).toBe('1');
    });

    it('follows the host when the value is driven from outside', async () => {
      const fixture = await setup('1');

      expect(tabButtons(fixture)[1].getAttribute('aria-selected')).toBe('true');
      expect(tabButtons(fixture)[0].getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      expect(tabsEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      expect(tabsEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('size', () => {
    it('adds no size class when size is unset', async () => {
      const fixture = await setup();
      // Opt-in rather than defaulted: none of the three Figma steps matches
      // the historic box, so defaulting would shift every existing strip.
      const classes = [...tabsEl(fixture).classList];
      expect(classes.filter((c) => /^baps-tabs-(sm|md|lg)$/.test(c))).toEqual([]);
    });

    it.each([
      ['small', 'baps-tabs-sm'],
      ['medium', 'baps-tabs-md'],
      ['large', 'baps-tabs-lg'],
    ] as const)('maps %s to %s', async (size, expected) => {
      const fixture = await setup();
      fixture.componentInstance.size.set(size);
      await apply(fixture);
      expect(tabsEl(fixture).classList).toContain(expected);
    });

    it('swaps one size class for another rather than accumulating them', async () => {
      const fixture = await setup();
      fixture.componentInstance.size.set('small');
      await apply(fixture);
      fixture.componentInstance.size.set('large');
      await apply(fixture);

      expect(tabsEl(fixture).classList).toContain('baps-tabs-lg');
      expect(tabsEl(fixture).classList).not.toContain('baps-tabs-sm');
    });
  });

  describe('selector', () => {
    it('applies to p-tabs only through the bapsTabs attribute', async () => {
      @Component({
        standalone: true,
        imports: [TabsModule],
        template: `
          <p-tabs value="0">
            <p-tablist><p-tab value="0">General</p-tab></p-tablist>
          </p-tabs>
        `,
      })
      class Bare {}

      const fixture = TestBed.createComponent(Bare);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      // A page-wide .baps-ds-sampark strip carries no directive, so the
      // skin has to work from the scope class alone — the directive must
      // not be the only way in.
      const el = fixture.nativeElement.querySelector('p-tabs') as HTMLElement;
      expect(el.classList).not.toContain('baps-sampark');
    });
  });
});
