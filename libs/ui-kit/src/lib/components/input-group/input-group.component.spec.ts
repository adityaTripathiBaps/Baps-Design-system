import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { BapsInputNumber } from '../input-number/input-number.component';
import { BapsInputGroup } from './input-group.component';

@Component({
  imports: [BapsInputGroup, InputText],
  template: `
    <baps-input-group [brand]="brand" [prefix]="prefix" [suffix]="suffix">
      @if (projectPrefix) {
        <i input-group-prefix class="pi pi-search" aria-hidden="true"></i>
      }
      <input pInputText aria-label="Days" />
      @if (projectSuffix) {
        <span input-group-suffix>kg</span>
      }
    </baps-input-group>
  `,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  prefix?: string = 'min';
  suffix?: string = 'day/s';
  projectPrefix = false;
  projectSuffix = false;
}

async function render(
  setup: (h: Host) => void = () => {
    /* empty */
  },
) {
  const fixture = TestBed.createComponent(Host);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function addons(fixture: { nativeElement: unknown }) {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll(
      'p-inputgroup-addon',
    ),
  );
}

function populatedAddons(fixture: { nativeElement: unknown }) {
  return addons(fixture).filter((el) => {
    const content = el.querySelector('.baps-input-group__addon-content');
    const fallback = el.querySelector('.baps-input-group__addon-fallback');
    return Boolean(
      content?.childElementCount || content?.textContent?.trim() || fallback,
    );
  });
}

describe('BapsInputGroup', () => {
  it('renders leading and trailing text addons around the projected field', async () => {
    const fixture = await render();
    const rendered = populatedAddons(fixture);

    expect(rendered.map((el) => el.textContent?.trim())).toEqual([
      'min',
      'day/s',
    ]);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input'),
    ).toBeTruthy();
  });

  it('omits an addon that was not given', async () => {
    const suffixOnly = await render((h) => (h.prefix = undefined));
    expect(
      populatedAddons(suffixOnly).map((el) => el.textContent?.trim()),
    ).toEqual(['day/s']);

    const bare = await render((h) => {
      h.prefix = undefined;
      h.suffix = undefined;
    });
    expect(populatedAddons(bare)).toHaveLength(0);
  });

  it('renders projected content inside the matching PrimeNG addon', async () => {
    const fixture = await render((h) => {
      h.prefix = undefined;
      h.suffix = undefined;
      h.projectPrefix = true;
      h.projectSuffix = true;
    });
    const [prefix, suffix] = populatedAddons(fixture);

    expect(prefix.querySelector('[input-group-prefix]')).toBeTruthy();
    expect(prefix.querySelector('i')?.classList).toContain('pi-search');
    expect(suffix.querySelector('[input-group-suffix]')?.textContent).toBe(
      'kg',
    );
  });

  it('gives projected content precedence over the matching string input', async () => {
    const fixture = await render((h) => {
      h.projectPrefix = true;
      h.projectSuffix = true;
    });
    const [prefix, suffix] = populatedAddons(fixture);

    expect(prefix.querySelector('[input-group-prefix]')).toBeTruthy();
    expect(
      prefix.querySelector('.baps-input-group__addon-content')
        ?.childElementCount,
    ).toBe(1);
    expect(
      prefix.querySelector('.baps-input-group__addon-fallback')?.textContent,
    ).toBe('min');
    expect(suffix.querySelector('[input-group-suffix]')?.textContent).toBe(
      'kg',
    );
    expect(
      suffix.querySelector('.baps-input-group__addon-content')
        ?.childElementCount,
    ).toBe(1);
    expect(
      suffix.querySelector('.baps-input-group__addon-fallback')?.textContent,
    ).toBe('day/s');
  });

  /**
   * The addons carry the unit and the bound ("min", "day/s"), so they must be
   * readable — but never announced as interactive. PrimeNG's addon is a plain
   * element, so this asserts nothing has crept in that would change that.
   */
  it('renders addons as non-interactive static text', async () => {
    const fixture = await render();
    for (const el of populatedAddons(fixture)) {
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

  it('renders baps-input-number inside baps-input-group cleanly with addons (IGIN)', async () => {
    @Component({
      imports: [BapsInputGroup, BapsInputNumber, FormsModule],
      template: `
        <baps-input-group prefix="min" suffix="days" brand="sampark">
          <baps-input-number
            brand="sampark"
            [(ngModel)]="val"
            [showButtons]="true"
          />
        </baps-input-group>
      `,
    })
    class InputNumberHost {
      val = 5;
    }

    const fixture = TestBed.createComponent(InputNumberHost);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const inputNumber = root.querySelector('baps-input-number');
    expect(inputNumber).toBeTruthy();
    expect(inputNumber?.querySelector('input')).toBeTruthy();
    expect(
      inputNumber?.querySelector('.baps-input-number__buttons'),
    ).toBeTruthy();

    const addonsList = root.querySelectorAll('p-inputgroup-addon');
    expect(addonsList.length).toBe(2);
    expect(addonsList[0].textContent?.trim()).toBe('min');
    expect(addonsList[1].textContent?.trim()).toBe('days');
  });
});
