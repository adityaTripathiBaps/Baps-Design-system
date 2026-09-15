import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SAMPARK_AVATAR_TOKENS } from '../../theme/sampark.theme';
import { BapsAvatar, BapsAvatarSize } from './avatar.component';
import { BapsAvatarGroup } from './avatar-group.component';

/**
 * `BapsAvatarSize` accepts nine values but PrimeNG's `size` input accepts
 * three, and the gap is bridged twice: legacy `normal`/`large`/`xlarge` alias
 * onto the Figma steps, then the Figma steps split between PrimeNG's size
 * input (l/xl) and host CSS classes (xs/s/2xl). Every square of that grid is
 * a place a size can silently land on the wrong renderer — a wrong host class
 * means the CSS rule never matches and the avatar renders at the default 36px
 * with no error anywhere, and a bad `primeSize` would hand PrimeNG a value it
 * does not know. Neither is visible to the compiler, so the mapping is
 * enumerated exhaustively below.
 *
 * `dt` is the other silent one: it is the entire mechanism by which the
 * Sampark token block reaches the avatar. Returning it under mybky would
 * repaint every MyBKY avatar maroon; returning undefined under sampark leaves
 * the Sampark avatar wearing the MyBKY preset with Sampark borders bolted on.
 *
 * §40: host class and dt are both checked at mybky and sampark.
 */
function avatar(size: BapsAvatarSize): BapsAvatar {
  const component = TestBed.createComponent(BapsAvatar).componentInstance;
  component.size = size;
  return component;
}

describe('BapsAvatar size mapping', () => {
  it.each([
    ['xs', 'normal'],
    ['s', 'normal'],
    ['m', 'normal'],
    ['l', 'large'],
    ['xl', 'xlarge'],
    ['2xl', 'normal'],
  ] as const)('maps figma size %s to PrimeNG %s', (size, expected) => {
    expect(avatar(size).primeSize).toBe(expected);
  });

  it.each([
    ['normal', 'normal'],
    ['large', 'large'],
    ['xlarge', 'xlarge'],
  ] as const)('keeps legacy PrimeNG size %s working (-> %s)', (size, expected) => {
    expect(avatar(size).primeSize).toBe(expected);
  });

  it.each([
    ['normal', 'm'],
    ['large', 'l'],
    ['xlarge', 'xl'],
  ] as const)('aliases legacy %s onto figma step %s', (size, expected) => {
    expect(avatar(size).figmaSize).toBe(expected);
  });

  it('leaves 2xl on PrimeNG "normal" because the box comes from host CSS', () => {
    // 2xl is 80px, far past PrimeNG's xlarge. Handing PrimeNG a size it does
    // not have would be worse than leaving it at normal and letting the
    // .baps-avatar-2xl rule win, which is what this asserts.
    expect(avatar('2xl').primeSize).toBe('normal');
    expect(avatar('2xl').figmaSize).toBe('2xl');
  });

  it('defaults to the m step', () => {
    const component = TestBed.createComponent(BapsAvatar).componentInstance;
    expect(component.size).toBe('m');
    expect(component.figmaSize).toBe('m');
    expect(component.primeSize).toBe('normal');
  });
});

describe('BapsAvatar dt token scoping', () => {
  it('returns the Sampark token block for brand="sampark"', () => {
    const component = TestBed.createComponent(BapsAvatar).componentInstance;
    component.brand = 'sampark';
    expect(component.dt).toBe(SAMPARK_AVATAR_TOKENS);
  });

  it('returns undefined for the mybky brand so the global preset applies', () => {
    const component = TestBed.createComponent(BapsAvatar).componentInstance;
    expect(component.brand).toBe('mybky');
    expect(component.dt).toBeUndefined();
  });
});

@Component({
  imports: [BapsAvatar],
  template: `<baps-avatar [size]="size" [brand]="brand" [variant]="variant" [statusDot]="statusDot" [iconBadge]="iconBadge" />`,
})
class Host {
  size: BapsAvatarSize = 'm';
  brand: 'mybky' | 'sampark' = 'mybky';
  variant: 'primary' | 'secondary' | 'warning' = 'primary';
  statusDot = false;
  iconBadge = false;
}

async function hostClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return (fixture.nativeElement as HTMLElement).querySelector('baps-avatar')!.classList;
}

describe('BapsAvatar host classes', () => {
  it.each([
    ['xs', 'baps-avatar-xs'],
    ['s', 'baps-avatar-s'],
    ['xl', 'baps-avatar-xl'],
    ['2xl', 'baps-avatar-2xl'],
  ] as const)('emits %s -> .%s', async (size, expected) => {
    expect((await hostClasses({ size })).contains(expected)).toBe(true);
  });

  it.each(['m', 'l'] as const)('emits no size class for %s (PrimeNG owns the box)', async (size) => {
    const classes = await hostClasses({ size });
    expect(
      ['baps-avatar-xs', 'baps-avatar-s', 'baps-avatar-xl', 'baps-avatar-2xl'].some((c) =>
        classes.contains(c),
      ),
    ).toBe(false);
  });

  it('emits .baps-avatar-xl for the legacy xlarge alias too', async () => {
    // The alias has to survive all the way to the host class, not just to
    // primeSize — the xl radius/icon-slot rules key off the class.
    expect((await hostClasses({ size: 'xlarge' })).contains('baps-avatar-xl')).toBe(true);
  });

  it.each([
    ['secondary', 'baps-avatar-secondary'],
    ['warning', 'baps-avatar-warning'],
  ] as const)('emits variant %s -> .%s', async (variant, expected) => {
    expect((await hostClasses({ variant })).contains(expected)).toBe(true);
  });

  it('emits no variant class for primary (it is the base skin)', async () => {
    const classes = await hostClasses({ variant: 'primary' });
    expect(classes.contains('baps-avatar-secondary')).toBe(false);
    expect(classes.contains('baps-avatar-warning')).toBe(false);
  });

  it('emits the status-dot and icon-badge classes only when requested', async () => {
    expect((await hostClasses()).contains('baps-avatar-dot')).toBe(false);
    expect((await hostClasses({ statusDot: true })).contains('baps-avatar-dot')).toBe(true);
    expect((await hostClasses()).contains('baps-avatar-icon-badge')).toBe(false);
    expect((await hostClasses({ iconBadge: true })).contains('baps-avatar-icon-badge')).toBe(true);
  });
});

describe('BapsAvatar brand scoping', () => {
  it('emits no host class for the default mybky brand', async () => {
    expect((await hostClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await hostClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [BapsAvatar],
      template: `<baps-avatar [brand]="brand()" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-avatar')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});

describe('BapsAvatarGroup overlap', () => {
  /**
   * The overlap is a per-size constant taken off the Figma sheets
   * (Sampark 13197:90488, MyBKY 22465:98596), not a ratio of the box. A
   * quarter-of-box formula matches xs and l and is wrong at the other four,
   * so this pins the actual table.
   */
  const cases: [string, number][] = [
    ['xs', 6],
    ['s', 10],
    ['m', 10],
    ['l', 12],
    ['xl', 16],
    ['2xl', 20],
  ];

  for (const [size, px] of cases) {
    it(`uses ${px}px at size ${size}`, () => {
      const group = new BapsAvatarGroup();
      group.size = size as never;
      expect((group as unknown as { overlapPx: number }).overlapPx).toBe(px);
    });
  }

  it('maps the legacy PrimeNG size names onto the Figma steps', () => {
    const group = new BapsAvatarGroup();
    const overlap = () => (group as unknown as { overlapPx: number }).overlapPx;

    group.size = 'normal';
    expect(overlap()).toBe(10); // m
    group.size = 'large';
    expect(overlap()).toBe(12); // l
    group.size = 'xlarge';
    expect(overlap()).toBe(16); // xl
  });

  it('defaults to the m step', () => {
    expect((new BapsAvatarGroup() as unknown as { overlapPx: number }).overlapPx).toBe(10);
  });
});
