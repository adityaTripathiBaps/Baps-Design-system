import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsAlert } from './alert.component';

/**
 * baps-alert is hand-rolled (it deliberately does not wrap PrimeNG Message),
 * so nothing upstream covers any of it. Three things here fail quietly rather
 * than loudly:
 *
 * - `defaultIcon` is a switch with a fallthrough default. Get a case wrong and
 *   an error alert renders a cheerful tick — no exception, no console warning,
 *   just a wrong signal to the user at the exact moment accuracy matters.
 * - The `icon ?? defaultIcon` precedence is one operator away from ignoring
 *   the consumer's icon entirely.
 * - `closable` gates the only way to dismiss the alert, and `closed` is the
 *   only way a host learns it happened. If the button stops emitting, the
 *   alert simply never goes away and the consumer's handler never runs.
 *
 * §40: brand host class is asserted at both brands — the whole Sampark skin
 * hangs off `.baps-sampark`, and a broken binding is invisible to TypeScript.
 */
@Component({
  imports: [BapsAlert],
  template: `
    <baps-alert
      [severity]="severity"
      [icon]="icon"
      [closable]="closable"
      [brand]="brand"
      [text]="text"
      [title]="title"
      (closed)="closeCount = closeCount + 1"
    />
  `,
})
class Host {
  severity: 'info' | 'success' | 'warning' | 'error' = 'info';
  icon?: string;
  closable = false;
  brand: 'mybky' | 'sampark' = 'mybky';
  text?: string;
  title?: string;
  closeCount = 0;
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function iconClasses(fixture: { nativeElement: unknown }): DOMTokenList {
  const el = fixture.nativeElement as HTMLElement;
  return el.querySelector('.baps-alert__icon i')!.classList;
}

describe('BapsAlert default icon per severity', () => {
  it('renders the tick for success', async () => {
    expect(iconClasses(await render({ severity: 'success' })).contains('pi-check-circle')).toBe(
      true,
    );
  });

  it('renders the triangle for warning', async () => {
    expect(
      iconClasses(await render({ severity: 'warning' })).contains('pi-exclamation-triangle'),
    ).toBe(true);
  });

  it('renders the cross for error', async () => {
    expect(iconClasses(await render({ severity: 'error' })).contains('pi-times-circle')).toBe(true);
  });

  it('renders the info glyph for info', async () => {
    expect(iconClasses(await render({ severity: 'info' })).contains('pi-info-circle')).toBe(true);
  });

  it('falls back to the info glyph for an unrecognised severity', () => {
    // The default branch: a severity added to the union but forgotten here
    // must degrade to info, not to an iconless alert.
    const alert = TestBed.createComponent(BapsAlert).componentInstance;
    alert.severity = 'critical' as BapsAlert['severity'];
    expect(alert.defaultIcon).toBe('pi-info-circle');
  });

  it('lets an explicit icon override the severity default', async () => {
    const classes = iconClasses(await render({ severity: 'error', icon: 'pi-star' }));
    expect(classes.contains('pi-star')).toBe(true);
    expect(classes.contains('pi-times-circle')).toBe(false);
  });

  it('keeps the base pi class alongside the glyph class', async () => {
    // Without `pi` the PrimeIcons font never loads and the glyph is a blank box.
    expect(iconClasses(await render({ severity: 'success' })).contains('pi')).toBe(true);
  });
});

describe('BapsAlert severity modifier class', () => {
  it.each([
    ['info', 'baps-alert--info'],
    ['success', 'baps-alert--success'],
    ['warning', 'baps-alert--warning'],
    ['error', 'baps-alert--error'],
  ] as const)('applies %s -> .%s', async (severity, expected) => {
    const fixture = await render({ severity });
    const alert = (fixture.nativeElement as HTMLElement).querySelector('.baps-alert')!;
    expect(alert.classList.contains(expected)).toBe(true);
  });
});

describe('BapsAlert close behaviour', () => {
  it('renders no close button when closable is false', async () => {
    const fixture = await render({ closable: false });
    expect((fixture.nativeElement as HTMLElement).querySelector('.baps-alert__close')).toBeNull();
  });

  it('renders a labelled close button when closable is true', async () => {
    const fixture = await render({ closable: true });
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.baps-alert__close',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Close');
    // type="button" keeps it from submitting a surrounding form.
    expect(button.type).toBe('button');
  });

  it('emits closed exactly once per click', async () => {
    const fixture = await render({ closable: true });
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.baps-alert__close',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.closeCount).toBe(1);
  });

  it('does not emit closed on its own', async () => {
    const fixture = await render({ closable: true });
    expect(fixture.componentInstance.closeCount).toBe(0);
  });
});

describe('BapsAlert brand scoping', () => {
  it('emits no host class for the default mybky brand', async () => {
    const fixture = await render({ brand: 'mybky' });
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-alert')!;
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    const fixture = await render({ brand: 'sampark' });
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-alert')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    // Zoneless env: a signal, not a property write + detectChanges().
    @Component({
      imports: [BapsAlert],
      template: `<baps-alert [brand]="brand()" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-alert')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});
