import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedModule } from 'primeng/api';
import { PickList } from 'primeng/picklist';
import { BapsPickList } from './pick-list.component';

@Component({
  imports: [BapsPickList, SharedModule],
  template: `<baps-picklist [brand]="brand()" [(source)]="source" [(target)]="target" dataKey="id" sourceHeader="Available" targetHeader="Assigned">
    <ng-template pTemplate="item" let-k><span class="k">{{ k.name }}</span></ng-template>
  </baps-picklist>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  source = [{ id: 1, name: 'Hari' }, { id: 2, name: 'Mira' }];
  target: { id: number; name: string }[] = [];
}

async function render(configure: (h: Host) => void = () => undefined) {
  const f = TestBed.createComponent(Host);
  configure(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}

describe('BapsPickList', () => {
  it('hands the item template to PrimeNG and shows both headers', async () => {
    const f = await render();
    const headers = [...f.nativeElement.querySelectorAll('.p-listbox-header')].map((e: Element) => e.textContent?.trim());
    expect(headers).toEqual(['Available', 'Assigned']);
    expect([...f.nativeElement.querySelectorAll('.k')].map((e: Element) => e.textContent)).toEqual(['Hari', 'Mira']);
  });

  it("keeps PrimeNG's defaults for unset inputs", async () => {
    const p = (await render()).debugElement.query(By.directive(PickList)).componentInstance as any;
    expect(p.breakpoint).toBe('960px');
    expect(p.scrollHeight).toBe('14rem');
    expect(p.showSourceControls).toBe(true);
  });

  it('marks the Sampark brand on the PrimeNG picklist', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    expect(f.nativeElement.querySelector('p-picklist').classList).toContain('baps-sampark');
  });

  it('two-way binds target when items move', async () => {
    const f = await render();
    (f.debugElement.query(By.directive(BapsPickList)).componentInstance as any).onTarget([{ id: 1, name: 'Hari' }]);
    expect(f.componentInstance.target.map((x) => x.name)).toEqual(['Hari']);
  });
});
