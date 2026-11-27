import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsIftaLabel } from './ifta-label.component';

@Component({
  imports: [BapsIftaLabel],
  template: `<baps-iftalabel [brand]="brand()" styleClass="extra">
    <input id="u" />
    <label for="u">Username</label>
  </baps-iftalabel>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

describe('BapsIftaLabel', () => {
  it('projects the field and its label into p-iftalabel', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const root = f.nativeElement.querySelector('p-iftalabel');
    expect(root.classList).toContain('extra');
    expect(root.querySelector('input#u')).toBeTruthy();
    expect(root.querySelector('label[for="u"]').textContent).toBe('Username');
  });

  it('marks the Sampark brand on the host', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('baps-iftalabel').classList).toContain('baps-sampark');
  });
});
