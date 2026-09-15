import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from 'primeng/api';
import { BapsSplitButton } from './split-button.component';

/**
 * The wrapper exposes a fourth size step, `xlarge`, that PrimeNG's SplitButton
 * has no idea about — its size input stops at 'large'. `primeSize` exists
 * solely to swallow that value and return undefined, letting the 40px box come
 * from the `.baps-splitbutton-xl` host rule instead. Two ways that breaks, both
 * quiet: forward 'xlarge' and PrimeNG stamps an unknown `p-button-xlarge`
 * class that no stylesheet matches (so the button renders at the default
 * height and the xl rule fights a phantom); or over-filter and small/large
 * stop reaching PrimeNG at all, collapsing three sizes into one.
 *
 * Neither is a type error — `size` is the wrapper's own union — and neither
 * throws, so only an explicit assertion on the returned value catches it.
 * The paired host class is asserted alongside, because xlarge is only correct
 * when *both* halves fire: undefined to PrimeNG **and** the class on the host.
 *
 * §40: brand host class at both brands.
 */

// jsdom ships no matchMedia. SplitButton always instantiates a TieredMenu for
// its dropdown, and TieredMenu binds a media listener in ngOnInit — so every
// rendering test in this file throws without a stub. Scoped to this file
// rather than test-setup.ts: no other component in the suite needs it.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

describe('BapsSplitButton primeSize', () => {
  function sized(size?: 'small' | 'large' | 'xlarge'): BapsSplitButton {
    const component = TestBed.createComponent(BapsSplitButton).componentInstance;
    component.size = size;
    return component;
  }

  it('returns undefined for xlarge — PrimeNG would not understand it', () => {
    expect(sized('xlarge').primeSize).toBeUndefined();
  });

  it('passes small straight through', () => {
    expect(sized('small').primeSize).toBe('small');
  });

  it('passes large straight through', () => {
    expect(sized('large').primeSize).toBe('large');
  });

  it('returns undefined when no size is set', () => {
    expect(sized(undefined).primeSize).toBeUndefined();
  });
});

@Component({
  imports: [BapsSplitButton],
  template: `
    <baps-split-button
      label="Save"
      [model]="model"
      [size]="size"
      [brand]="brand"
      [disabled]="disabled"
      (clicked)="clickCount = clickCount + 1"
    />
  `,
})
class Host {
  model: MenuItem[] = [{ label: 'Save as draft' }];
  size?: 'small' | 'large' | 'xlarge';
  brand: 'mybky' | 'sampark' = 'mybky';
  disabled = false;
  clickCount = 0;
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function hostClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
  const fixture = await render(overrides);
  return (fixture.nativeElement as HTMLElement).querySelector('baps-split-button')!.classList;
}

describe('BapsSplitButton xlarge host class', () => {
  it('emits .baps-splitbutton-xl for size="xlarge"', async () => {
    expect((await hostClasses({ size: 'xlarge' })).contains('baps-splitbutton-xl')).toBe(true);
  });

  it.each(['small', 'large', undefined] as const)(
    'emits no xl host class for size=%s',
    async (size) => {
      expect((await hostClasses({ size })).contains('baps-splitbutton-xl')).toBe(false);
    },
  );

  it('does not leak an xlarge size class onto the rendered buttons', async () => {
    // The whole point of primeSize returning undefined: nothing downstream
    // should carry an "xlarge" PrimeNG size class competing with the host rule.
    const fixture = await render({ size: 'xlarge' });
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('.p-button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(button.className).not.toContain('xlarge');
      expect(button.classList.contains('p-button-lg')).toBe(false);
      expect(button.classList.contains('p-button-sm')).toBe(false);
    });
  });

  it('still reaches PrimeNG for the sizes it does support', async () => {
    const small = await render({ size: 'small' });
    expect(
      (small.nativeElement as HTMLElement).querySelector('.p-button')!.classList.contains(
        'p-button-sm',
      ),
    ).toBe(true);

    const large = await render({ size: 'large' });
    expect(
      (large.nativeElement as HTMLElement).querySelector('.p-button')!.classList.contains(
        'p-button-lg',
      ),
    ).toBe(true);
  });
});

describe('BapsSplitButton brand scoping', () => {
  it('emits no host class for the default mybky brand', async () => {
    // Every MyBKY rule is written as `:not(.baps-sampark)`, so the absence of
    // the class is load-bearing, not merely cosmetic.
    expect((await hostClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await hostClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('carries both the sampark and xl classes together', async () => {
    // The 40px Sampark xl rule needs both on the same host.
    const classes = await hostClasses({ brand: 'sampark', size: 'xlarge' });
    expect(classes.contains('baps-sampark')).toBe(true);
    expect(classes.contains('baps-splitbutton-xl')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [BapsSplitButton],
      template: `<baps-split-button label="Save" [brand]="brand()" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-split-button')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});

describe('BapsSplitButton click output', () => {
  it('re-emits the default segment click as `clicked`', async () => {
    const fixture = await render();
    const defaultSegment = (fixture.nativeElement as HTMLElement).querySelector(
      '.p-button',
    ) as HTMLButtonElement;
    defaultSegment.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clickCount).toBe(1);
  });
});
