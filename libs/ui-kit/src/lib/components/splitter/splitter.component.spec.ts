import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedModule } from 'primeng/api';
import { Splitter } from 'primeng/splitter';
import { BapsSplitter } from './splitter.component';

@Component({
  imports: [BapsSplitter, SharedModule],
  template: `
    <baps-splitter id="a" [brand]="brand()" [panelSizes]="[30, 70]">
      <ng-template pTemplate="panel"><span class="one">One</span></ng-template>
      <ng-template pTemplate="panel"><span class="two">Two</span></ng-template>
    </baps-splitter>
    <baps-splitter id="b" layout="vertical">
      <ng-template #panel><span class="top">Top</span></ng-template>
      <ng-template #panel><span class="bottom">Bottom</span></ng-template>
    </baps-splitter>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function render(configure: (h: Host) => void = () => undefined) {
  const f = TestBed.createComponent(Host);
  configure(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}

describe('BapsSplitter', () => {
  it('hands each pTemplate panel to PrimeNG, in order, with a gutter between', async () => {
    const f = await render();
    const a: HTMLElement = f.nativeElement.querySelector('#a');
    const panels = [...a.querySelectorAll('.p-splitterpanel')].map((p) => p.textContent?.trim());
    expect(panels).toEqual(['One', 'Two']);
    expect(a.querySelectorAll('.p-splitter-gutter').length).toBe(1);
  });

  it('accepts #panel templates too', async () => {
    const f = await render();
    const b: HTMLElement = f.nativeElement.querySelector('#b');
    expect([...b.querySelectorAll('.p-splitterpanel')].map((p) => p.textContent?.trim())).toEqual(['Top', 'Bottom']);
  });

  it("keeps PrimeNG's defaults and marks the Sampark brand", async () => {
    const f = await render((h) => h.brand.set('sampark'));
    const p = f.debugElement.queryAll(By.directive(Splitter))[0].componentInstance as any;
    expect(p.gutterSize).toBe(4);
    expect(p.stateStorage).toBe('session');
    expect(f.nativeElement.querySelector('#a p-splitter').classList).toContain('baps-sampark');
  });
});
