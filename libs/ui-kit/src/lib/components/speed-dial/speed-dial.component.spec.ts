import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MenuItem } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { BapsSpeedDial } from './speed-dial.component';

@Component({
  imports: [BapsSpeedDial],
  template: `<baps-speed-dial [model]="items" [(visible)]="open" type="circle" [radius]="80" />`,
})
class Host {
  readonly items: MenuItem[] = [{ label: 'Add', icon: 'pi pi-plus' }, { label: 'Delete', icon: 'pi pi-trash' }];
  readonly open = signal(false);
}

async function render() {
  const f = TestBed.createComponent(Host);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}
const prime = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(SpeedDial)).componentInstance as any;

describe('BapsSpeedDial', () => {
  it('forwards the layout and keeps PrimeNG defaults for the rest', async () => {
    const p = prime(await render());
    expect(p.type).toBe('circle');
    expect(p.radius).toBe(80);
    expect(p.direction).toBe('up');
    expect(p.transitionDelay).toBe(30);
    expect(p.hideOnClickOutside).toBe(true);
  });

  it('renders one action per item', async () => {
    const f = await render();
    expect(f.nativeElement.querySelectorAll('.p-speeddial-item').length).toBe(2);
  });

  it('two-way binds visible', async () => {
    const f = await render();
    (f.debugElement.query(By.directive(BapsSpeedDial)).componentInstance as any).onVisible(true);
    expect(f.componentInstance.open()).toBe(true);
  });
});
