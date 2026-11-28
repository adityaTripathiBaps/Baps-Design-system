import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScrollPanel } from 'primeng/scrollpanel';
import { BapsScrollPanel } from './scroll-panel.component';

@Component({
  imports: [BapsScrollPanel],
  template: `<baps-scrollpanel #sp [brand]="brand()" [step]="20" style="height: 100px"><p class="body">Body</p></baps-scrollpanel>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  @ViewChild('sp') sp!: BapsScrollPanel;
}

describe('BapsScrollPanel', () => {
  it('projects the content and forwards step', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.p-scrollpanel-content .body').textContent).toBe('Body');
    expect((f.debugElement.query(By.directive(ScrollPanel)).componentInstance as any).step).toBe(20);
  });

  it("calls PrimeNG's scrollTop and refresh", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const p = f.debugElement.query(By.directive(ScrollPanel)).componentInstance as ScrollPanel;
    const top = jest.spyOn(p, 'scrollTop').mockImplementation(() => undefined);
    const refresh = jest.spyOn(p, 'refresh').mockImplementation(() => undefined);
    f.componentInstance.sp.scrollTop(220);
    f.componentInstance.sp.refresh();
    expect(top).toHaveBeenCalledWith(220);
    expect(refresh).toHaveBeenCalled();
  });

  it('marks the Sampark brand on the PrimeNG scroll panel', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-scrollpanel').classList).toContain('baps-sampark');
  });
});
