import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'primeng/api';
import { BapsPanel } from './panel.component';

@Component({
  imports: [BapsPanel, SharedModule],
  template: `<baps-panel [brand]="brand()" header="Robbinsville" [toggleable]="true" [(collapsed)]="folded">
    <ng-template pTemplate="footer"><span class="foot">Updated</span></ng-template>
    <p class="body">Body</p>
  </baps-panel>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  folded = false;
}

describe('BapsPanel', () => {
  it('shows the header, projects the content and hands the footer template to PrimeNG', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.p-panel-title').textContent).toBe('Robbinsville');
    expect(f.nativeElement.querySelector('.p-panel-content .body').textContent).toBe('Body');
    expect(f.nativeElement.querySelector('.p-panel-footer .foot').textContent).toBe('Updated');
  });

  it('two-way binds collapsed from the toggle button', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    (f.nativeElement.querySelector('.p-panel-header button') as HTMLElement).click();
    f.detectChanges();
    expect(f.componentInstance.folded).toBe(true);
  });

  it('marks the Sampark brand on the PrimeNG panel', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-panel').classList).toContain('baps-sampark');
  });
});
