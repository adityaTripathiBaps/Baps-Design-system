import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BapsSelect } from './select.component';

/**
 * Regression guard for a bug that shipped silently: `select.component.ts`
 * bound the `.baps-sampark` host class from `brand` and its doc comment
 * advertised "per-instance brand scoping", but `_select-sampark.scss` only
 * ever declared `.baps-ds-sampark` rules. Nothing matched the host class, so
 * `brand="sampark"` was a complete no-op — the trigger rendered the MyBKY
 * skin (36px, 99px pill radius, full width) instead of Sampark's (32px, 4px
 * radius, fit-content).
 *
 * Nothing about that was detectable from TypeScript: the input existed, the
 * class was applied, no error was thrown. Only the CSS was missing a selector.
 * These tests pin the two things the wrapper is actually responsible for —
 * emitting the host class, and getting the Sampark scope onto the portaled
 * overlay. The CSS-side match itself was verified in a real browser.
 */
@Component({
  imports: [BapsSelect],
  template: `<baps-select [brand]="brand" [panelStyleClass]="panelStyleClass" [options]="[]" />`,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  panelStyleClass?: string;
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('BapsSelect brand scoping', () => {
  it('emits no host class for the default mybky brand', async () => {
    const fixture = await render();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-select')!;
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });

  it('emits the .baps-sampark host class for brand="sampark"', async () => {
    // The class the SCSS scope root keys off. Without it the Sampark skin
    // cannot apply per-instance at all.
    const fixture = await render({ brand: 'sampark' });
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-select')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    // Signal-based host: the test env is zoneless, so mutating a plain
    // property and forcing detectChanges() trips NG0100 rather than testing
    // anything real. A signal schedules change detection the way a consuming
    // app actually would.
    @Component({
      imports: [BapsSelect],
      template: `<baps-select [brand]="brand()" [options]="[]" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-select')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });

  describe('portaled overlay scope', () => {
    // The option panel appends to <body>, escaping both the host class and any
    // .baps-ds-sampark ancestor — so the scope class has to ride on the panel.
    function panelClassOf(fixture: Awaited<ReturnType<typeof render>>): string {
      return (
        fixture.debugElement.query(By.directive(BapsSelect))
          .componentInstance as BapsSelect
      ).resolvedPanelStyleClass;
    }

    it('adds baps-ds-sampark to the panel for brand="sampark"', async () => {
      expect(panelClassOf(await render({ brand: 'sampark' }))).toBe('baps-ds-sampark');
    });

    it('adds nothing for the mybky brand', async () => {
      expect(panelClassOf(await render())).toBe('');
    });

    it('preserves a consumer panelStyleClass alongside the scope class', async () => {
      const fixture = await render({ brand: 'sampark', panelStyleClass: 'my-panel' });
      expect(panelClassOf(fixture)).toBe('my-panel baps-ds-sampark');
    });

    it('passes a consumer panelStyleClass through untouched under mybky', async () => {
      const fixture = await render({ panelStyleClass: 'my-panel' });
      expect(panelClassOf(fixture)).toBe('my-panel');
    });

    it('does not double-append when the consumer already set the scope class', async () => {
      const fixture = await render({ brand: 'sampark', panelStyleClass: 'baps-ds-sampark' });
      expect(panelClassOf(fixture)).toBe('baps-ds-sampark');
    });
  });
});
