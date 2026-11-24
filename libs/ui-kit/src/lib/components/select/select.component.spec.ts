import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { Select } from 'primeng/select';
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

@Component({
  imports: [BapsSelect, FormsModule, SharedModule],
  template: `
    <baps-select [options]="options" optionLabel="name" optionValue="code" [toggleOnClick]="toggle" [(ngModel)]="value">
      <ng-template pTemplate="item" let-option><b class="custom-item">{{ option.name }}</b></ng-template>
    </baps-select>
  `,
})
class TemplateHost {
  options = [
    { name: 'Region', code: 'R' },
    { name: 'Centre', code: 'C' },
  ];
  toggle = false;
  value: string | null = 'R';
}

describe('BapsSelect PrimeNG pass-through (AT-042/043)', () => {
  async function renderTemplateHost(toggle = false) {
    const fixture = TestBed.createComponent(TemplateHost);
    fixture.componentInstance.toggle = toggle;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('forwards a consumer pTemplate="item" to the inner p-select', async () => {
    const fixture = await renderTemplateHost();
    const inner = fixture.debugElement.query(By.directive(Select)).componentInstance as unknown as {
      _itemTemplate?: unknown;
    };
    expect(inner._itemTemplate).toBeTruthy();
  });

  it('leaves the PrimeNG defaults in place when no new input is set', async () => {
    const fixture = await renderTemplateHost();
    const inner = fixture.debugElement.query(By.directive(Select)).componentInstance;
    expect(inner.loading).toBe(false);
    expect(inner.lazy).toBe(false);
    expect(inner.virtualScroll).toBe(false);
    expect(inner.scrollHeight).toBe('200px');
  });

  it('toggleOnClick cycles to the next option instead of opening the panel', async () => {
    const fixture = await renderTemplateHost(true);
    const wrapper = fixture.debugElement.query(By.directive(BapsSelect)).componentInstance as BapsSelect;
    wrapper.onSelectClick();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('C');
    wrapper.onSelectClick();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('R');
  });

  it('cleared emits the value the field held', async () => {
    const fixture = await renderTemplateHost();
    const wrapper = fixture.debugElement.query(By.directive(BapsSelect)).componentInstance as BapsSelect;
    const seen: unknown[] = [];
    wrapper.cleared.subscribe((v) => seen.push(v));
    wrapper.onSelectChange({ value: null }); // PrimeNG's clear() emits onChange(null) first
    wrapper.onSelectClear();
    expect(seen).toEqual(['R']);
  });

  it('does nothing on click when toggleOnClick is off', async () => {
    const fixture = await renderTemplateHost(false);
    const wrapper = fixture.debugElement.query(By.directive(BapsSelect)).componentInstance as BapsSelect;
    wrapper.onSelectClick();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('R');
  });
});

@Component({
  imports: [BapsSelect, ReactiveFormsModule],
  template: `
    <baps-select [brand]="brand" [options]="['a', 'b']" [formControl]="ctrl" />
  `,
})
class InvalidHost {
  brand: 'mybky' | 'sampark' = 'sampark';
  ctrl = new FormControl<string | null>(null, Validators.required);
}

describe('BapsSelect invalid state', () => {
  function render(brand: 'mybky' | 'sampark') {
    const fixture = TestBed.createComponent(InvalidHost);
    fixture.componentInstance.brand = brand;
    fixture.detectChanges();
    const select = () => fixture.nativeElement.querySelector('p-select') as HTMLElement;
    return { fixture, select };
  }

  it('a Sampark field shows p-invalid once its invalid control is touched', () => {
    const { fixture, select } = render('sampark');
    expect(select().classList).not.toContain('p-invalid');
    fixture.componentInstance.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(select().classList).toContain('p-invalid');
  });

  it('leaves MyBKY on PrimeNG default', () => {
    const { fixture, select } = render('mybky');
    fixture.componentInstance.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(select().classList).not.toContain('p-invalid');
  });
});

describe('BapsSelect touched state (AT-065)', () => {
  it('blur marks touched', () => {
    const fixture = TestBed.createComponent(InvalidHost);
    fixture.detectChanges();
    const ctrl = fixture.componentInstance.ctrl;
    expect(ctrl.touched).toBe(false);
    fixture.debugElement.query(By.directive(Select)).componentInstance.onBlur.emit(new Event('blur'));
    expect(ctrl.touched).toBe(true);
  });
});

describe('BapsSelect autofocus (PrimeNG 21 left a DOM autofocus attribute)', () => {
  it('renders no autofocus attribute unless asked', async () => {
    const fixture = TestBed.createComponent(BapsSelect);
    fixture.componentRef.setInput('options', [{ label: 'A', value: 'a' }]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[autofocus]')).toBeNull();
  });
});

describe('BapsSelect autoOptionFocus default (SPM dev opens with the first row focused, T-32)', () => {
  const inner = (f: { debugElement: { query: (p: unknown) => { componentInstance: { autoOptionFocus: boolean } } } }) =>
    f.debugElement.query(By.directive(Select)).componentInstance;

  it('is on for Sampark and off for MyBKY when unset', async () => {
    expect(inner(await render({ brand: 'sampark' })).autoOptionFocus).toBe(true);
    expect(inner(await render({ brand: 'mybky' })).autoOptionFocus).toBe(false);
  });
});
