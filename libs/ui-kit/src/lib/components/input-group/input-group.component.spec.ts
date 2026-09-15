import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InputText } from 'primeng/inputtext';
import { BapsInputGroup } from './input-group.component';

@Component({
  imports: [BapsInputGroup, InputText],
  template: `
    <baps-input-group [brand]="brand" [prefix]="prefix" [suffix]="suffix">
      <input pInputText aria-label="Days" />
    </baps-input-group>
  `,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  prefix?: string = 'min';
  suffix?: string = 'day/s';
}

async function render(setup: (h: Host) => void = () => { /* empty */ }) {
  const fixture = TestBed.createComponent(Host);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function addons(fixture: { nativeElement: unknown }) {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('p-inputgroup-addon'),
  );
}

describe('BapsInputGroup', () => {
  it('renders leading and trailing text addons around the projected field', async () => {
    const fixture = await render();
    const rendered = addons(fixture);

    expect(rendered.map((el) => el.textContent?.trim())).toEqual(['min', 'day/s']);
    expect((fixture.nativeElement as HTMLElement).querySelector('input')).toBeTruthy();
  });

  it('omits an addon that was not given', async () => {
    const suffixOnly = await render((h) => (h.prefix = undefined));
    expect(addons(suffixOnly).map((el) => el.textContent?.trim())).toEqual(['day/s']);

    const bare = await render((h) => {
      h.prefix = undefined;
      h.suffix = undefined;
    });
    expect(addons(bare)).toHaveLength(0);
  });

  /**
   * The addons carry the unit and the bound ("min", "day/s"), so they must be
   * readable — but never announced as interactive. PrimeNG's addon is a plain
   * element, so this asserts nothing has crept in that would change that.
   */
  it('renders addons as non-interactive static text', async () => {
    const fixture = await render();
    for (const el of addons(fixture)) {
      expect(el.getAttribute('role')).toBeNull();
      expect(el.getAttribute('tabindex')).toBeNull();
      expect(el.getAttribute('aria-hidden')).toBeNull();
      expect(el.querySelector('button, a, input')).toBeNull();
    }
  });

  it('applies the baps-sampark host class only for brand="sampark"', async () => {
    const mybky = await render();
    expect(
      (mybky.nativeElement as HTMLElement)
        .querySelector('baps-input-group')!
        .classList.contains('baps-sampark'),
    ).toBe(false);

    const sampark = await render((h) => (h.brand = 'sampark'));
    expect(
      (sampark.nativeElement as HTMLElement)
        .querySelector('baps-input-group')!
        .classList.contains('baps-sampark'),
    ).toBe(true);
  });

  /**
   * All six inputgroup.addon.* tokens are used — that is the whole token
   * surface, and anything the component styles in CSS has no token at all.
   * [dt] is also re-read every change detection, so the object must be stable
   * or PrimeNG regenerates its scoped stylesheet every cycle.
   */
  it('exposes the full addon token set as a stable object', () => {
    const component = TestBed.createComponent(BapsInputGroup).componentInstance;
    const dt = component.dt as { addon: Record<string, string> };

    expect(Object.keys(dt.addon).sort()).toEqual([
      'background',
      'borderColor',
      'borderRadius',
      'color',
      'minWidth',
      'padding',
    ]);
    expect(component.dt).toBe(component.dt);
  });
});
