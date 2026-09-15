import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsProgressBar } from './progress-bar.component';

/**
 * There is almost no TypeScript in this component — the entire brand and
 * severity mechanism *is* the host class map, and every one of those classes
 * is the left-hand side of a CSS rule that exists only in this file's
 * `styles`. That makes the failure mode uniquely quiet: drop or rename a
 * binding and the bar still renders, still animates, still reports the right
 * value — it just silently reverts to the default blue MyBKY fill. No error,
 * no missing element, nothing a smoke test would notice.
 *
 * `baps-progressbar-has-value` is the one with teeth beyond colour: its rule
 * is what grows the 8px track to 20px so the label fits. Lose the class and
 * the percentage is clipped by PrimeNG's `overflow: hidden` at every width
 * under both brands — the exact bug the component's own comment records.
 *
 * §40: both brands asserted.
 */
@Component({
  imports: [BapsProgressBar],
  template: `
    <baps-progressbar
      [value]="value"
      [showValue]="showValue"
      [severity]="severity"
      [brand]="brand"
      [styleClass]="styleClass"
    />
  `,
})
class Host {
  value = 40;
  showValue = false;
  severity?: 'success' | 'info' | 'warning' | 'error';
  brand: 'mybky' | 'sampark' = 'mybky';
  styleClass?: string;
}

async function hostClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return (fixture.nativeElement as HTMLElement).querySelector('baps-progressbar')!.classList;
}

const SEVERITY_CLASSES = [
  'baps-progressbar-success',
  'baps-progressbar-info',
  'baps-progressbar-warning',
  'baps-progressbar-error',
];

describe('BapsProgressBar label sizing class', () => {
  it('adds baps-progressbar-has-value when showValue is on', async () => {
    // Without this the 10px label is clipped by the 8px track.
    expect((await hostClasses({ showValue: true })).contains('baps-progressbar-has-value')).toBe(
      true,
    );
  });

  it('leaves the thin bar untouched when showValue is off', async () => {
    expect((await hostClasses({ showValue: false })).contains('baps-progressbar-has-value')).toBe(
      false,
    );
  });

  it('toggles the class when showValue flips at runtime', async () => {
    @Component({
      imports: [BapsProgressBar],
      template: `<baps-progressbar [value]="50" [showValue]="showValue()" />`,
    })
    class SignalHost {
      readonly showValue = signal(false);
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-progressbar')!;
    expect(host.classList.contains('baps-progressbar-has-value')).toBe(false);

    fixture.componentInstance.showValue.set(true);
    await fixture.whenStable();
    expect(host.classList.contains('baps-progressbar-has-value')).toBe(true);
  });
});

describe('BapsProgressBar severity classes', () => {
  it.each([
    ['success', 'baps-progressbar-success'],
    ['info', 'baps-progressbar-info'],
    ['warning', 'baps-progressbar-warning'],
    ['error', 'baps-progressbar-error'],
  ] as const)('emits severity %s -> .%s', async (severity, expected) => {
    const classes = await hostClasses({ severity });
    expect(classes.contains(expected)).toBe(true);
    // Exactly one severity class — overlapping fills would be a coin toss
    // decided by source order in the stylesheet.
    expect(SEVERITY_CLASSES.filter((c) => classes.contains(c))).toEqual([expected]);
  });

  it('emits no severity class when severity is unset (default blue/maroon fill)', async () => {
    const classes = await hostClasses({ severity: undefined });
    expect(SEVERITY_CLASSES.some((c) => classes.contains(c))).toBe(false);
  });
});

describe('BapsProgressBar brand scoping', () => {
  it('emits no host class for the default mybky brand', async () => {
    expect((await hostClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await hostClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('keeps the severity class alongside the brand class (the rules compose)', async () => {
    // Every Sampark severity rule is
    // `:is(.baps-sampark, …) .baps-progressbar-<sev>` — both classes have to
    // be on the same host or the Sampark severity fill never applies.
    const classes = await hostClasses({ brand: 'sampark', severity: 'error' });
    expect(classes.contains('baps-sampark')).toBe(true);
    expect(classes.contains('baps-progressbar-error')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [BapsProgressBar],
      template: `<baps-progressbar [value]="50" [brand]="brand()" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-progressbar')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});

describe('BapsProgressBar styleClass passthrough', () => {
  it('normalises an unset styleClass to an empty string', () => {
    // PrimeNG's styleClass is typed string | undefined but the wrapper
    // guarantees a string so the binding never renders "undefined".
    const component = TestBed.createComponent(BapsProgressBar).componentInstance;
    expect(component.computedStyleClass).toBe('');
  });

  it('passes a consumer styleClass through untouched', () => {
    const component = TestBed.createComponent(BapsProgressBar).componentInstance;
    component.styleClass = 'my-bar';
    expect(component.computedStyleClass).toBe('my-bar');
  });
});
