import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TreeSelect } from 'primeng/treeselect';
import type { TreeNode } from 'primeng/api';
import { BapsTreeSelect } from './tree-select.component';

/**
 * Two things here fail silently rather than throwing, and both are pinned below.
 *
 * The first is the CVA wiring. TreeSelect has no `onChange` output — only
 * `onNodeSelect` / `onNodeUnselect`, which fire per node and miss a clear and a
 * `propagateSelectionDown` cascade. So this wrapper goes through
 * `ngModelChange`. If that regresses to a two-way `[(ngModel)]` on the inner
 * control, the local field still updates and the dropdown still looks correct —
 * but the parent form never learns, so the value silently never submits.
 *
 * The second is the portaled overlay. The panel is appended to `<body>`, outside
 * the host class and any `.baps-ds-sampark` ancestor, so a per-instance Sampark
 * field would render a Sampark trigger above a MyBKY-skinned overlay. TreeSelect
 * has two panel-class inputs and only `panelStyleClass` reaches the overlay.
 */
const TREE: TreeNode[] = [
  { key: 'in', label: 'India', children: [{ key: 'in-amd', label: 'Ahmedabad' }] },
  { key: 'uk', label: 'United Kingdom' },
];

@Component({
  imports: [BapsTreeSelect],
  template: `
    <baps-tree-select
      [brand]="brand"
      [panelStyleClass]="panelStyleClass"
      [options]="options"
    />
  `,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  panelStyleClass?: string;
  options: TreeNode[] = TREE;
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('BapsTreeSelect value accessor', () => {
  it('propagates a model change to the registered callback', () => {
    // The regression guard: this is what a two-way [(ngModel)] would break.
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    const seen: unknown[] = [];
    component.registerOnChange((v: unknown) => seen.push(v));
    component.onValueChange({ key: 'in' });
    expect(seen).toEqual([{ key: 'in' }]);
    expect(component.value).toEqual({ key: 'in' });
  });

  it('marks the control touched on change', () => {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    component.onValueChange(null);
    expect(touched).toBe(true);
  });

  it('propagates a cleared value rather than swallowing it', () => {
    // onNodeUnselect would not fire for a clear — this is why the wiring goes
    // through the model instead of the node outputs.
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    const seen: unknown[] = [];
    component.registerOnChange((v: unknown) => seen.push(v));
    component.onValueChange(null);
    expect(seen).toEqual([null]);
  });

  it('writes an incoming value', () => {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    component.writeValue([{ key: 'uk' }]);
    expect(component.value).toEqual([{ key: 'uk' }]);
  });

  it('honours setDisabledState from the forms API', () => {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('re-emits the filter query', () => {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    const seen: string[] = [];
    component.filterQueryChange.subscribe((q) => seen.push(q));
    component.onTreeSelectFilter({ filter: 'lon' });
    expect(seen).toEqual(['lon']);
  });
});

describe('BapsTreeSelect brand scoping', () => {
  async function hostClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
    const fixture = await render(overrides);
    return (fixture.nativeElement as HTMLElement).querySelector('baps-tree-select')!.classList;
  }

  it('emits no host class for the default mybky brand', async () => {
    expect((await hostClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await hostClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [BapsTreeSelect],
      template: `<baps-tree-select [brand]="brand()" [options]="[]" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-tree-select')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});

describe('BapsTreeSelect portaled overlay scope', () => {
  function scopeFor(brand: 'mybky' | 'sampark', panelStyleClass?: string): string {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    component.brand = brand;
    component.panelStyleClass = panelStyleClass;
    return component.resolvedPanelStyleClass;
  }

  it('adds the page scope for sampark', () => {
    expect(scopeFor('sampark')).toBe('baps-ds-sampark');
  });

  it('adds nothing for mybky', () => {
    expect(scopeFor('mybky')).toBe('');
  });

  it('preserves a consumer class alongside the scope', () => {
    expect(scopeFor('sampark', 'my-panel')).toBe('my-panel baps-ds-sampark');
  });

  it('does not double-stamp when the consumer already opted in', () => {
    expect(scopeFor('sampark', 'baps-ds-sampark')).toBe('baps-ds-sampark');
  });

  it('reaches PrimeNG through panelStyleClass, not panelClass', async () => {
    // TreeSelect has both inputs and only panelStyleClass is merged into the
    // overlay class list, so binding the wrong one is a silent no-op.
    const fixture = await render({ brand: 'sampark' });
    const prime = fixture.debugElement.query(By.directive(TreeSelect)).componentInstance as TreeSelect;
    expect(prime.panelStyleClass).toBe('baps-ds-sampark');
  });
});

describe('BapsTreeSelect defaults', () => {
  it('defaults to single selection, comma display, lenient filtering', () => {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    expect(component.selectionMode).toBe('single');
    expect(component.display).toBe('comma');
    expect(component.filterMode).toBe('lenient');
  });

  it('propagates selection both ways by default, as checkbox mode expects', () => {
    const component = TestBed.createComponent(BapsTreeSelect).componentInstance;
    expect(component.propagateSelectionDown).toBe(true);
    expect(component.propagateSelectionUp).toBe(true);
  });

  it('defaults brand to mybky, like every other brand-switchable component', () => {
    expect(TestBed.createComponent(BapsTreeSelect).componentInstance.brand).toBe('mybky');
  });

  it('leaves size unset so the standard height rule owns it', () => {
    expect(TestBed.createComponent(BapsTreeSelect).componentInstance.size).toBeUndefined();
  });
});
