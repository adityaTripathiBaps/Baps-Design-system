import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Divider } from 'primeng/divider';

import { BapsDivider } from './divider.component';

/**
 * `baps-divider` forwards four inputs to `p-divider` and adds two host
 * bindings of its own. PrimeNG's own layout and alignment are covered
 * upstream; what is pinned here is the pair this wrapper owns.
 *
 * **`size="compact"` is a `data-size` attribute, not a class.** The whole
 * toolbar separator — a 1x16px rule instead of PrimeNG's block divider that
 * takes its height from the row and adds 1rem of block padding either side —
 * hangs off `baps-divider[data-size='compact']`. Lose the attribute and the
 * separator silently reverts to a rule as tall as the toolbar, with 40px of
 * footprint for a 17px mark.
 */
@Component({
  standalone: true,
  imports: [BapsDivider],
  template: `
    <baps-divider
      [layout]="layout()"
      [type]="type()"
      [align]="align()"
      [styleClass]="styleClass()"
      [size]="size()"
      [brand]="brand()"
    />
  `,
})
class Host {
  readonly layout = signal<'horizontal' | 'vertical'>('horizontal');
  readonly type = signal<'solid' | 'dashed' | 'dotted'>('solid');
  readonly align = signal<
    'left' | 'center' | 'right' | 'top' | 'bottom' | undefined
  >(undefined);
  readonly styleClass = signal<string | undefined>(undefined);
  readonly size = signal<'default' | 'compact'>('default');
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
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

const hostEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('baps-divider') as HTMLElement;

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Divider)
    .componentInstance as Divider;

describe('BapsDivider', () => {
  describe('size', () => {
    it('always writes data-size, including at the default', async () => {
      const fixture = await setup();
      // Not conditional: the stylesheet selects on the attribute's VALUE, so
      // "default" has to be present and say so.
      expect(hostEl(fixture).getAttribute('data-size')).toBe('default');
    });

    it('switches to compact, which is what the toolbar rule keys off', async () => {
      const fixture = await setup();
      fixture.componentInstance.size.set('compact');
      await apply(fixture);
      expect(hostEl(fixture).getAttribute('data-size')).toBe('compact');
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('forwarding', () => {
    it('passes layout, type and align through to PrimeNG', async () => {
      const fixture = await setup();
      fixture.componentInstance.layout.set('vertical');
      fixture.componentInstance.type.set('dashed');
      fixture.componentInstance.align.set('center');
      await apply(fixture);

      const divider = prime(fixture);
      expect(divider.layout).toBe('vertical');
      expect(divider.type).toBe('dashed');
      expect(divider.align).toBe('center');
    });

    it('passes styleClass through unchanged', async () => {
      const fixture = await setup();
      fixture.componentInstance.styleClass.set('dense');
      await apply(fixture);
      expect(prime(fixture).styleClass).toBe('dense');
    });

    it('defaults to a solid horizontal rule', async () => {
      const fixture = await setup();
      const divider = prime(fixture);
      expect(divider.layout).toBe('horizontal');
      expect(divider.type).toBe('solid');
    });
  });
});
