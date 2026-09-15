import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BapsSegmented } from './segmented.component';

@Component({
  imports: [BapsSegmented, FormsModule],
  template: `
    <baps-segmented
      [brand]="brand"
      [multiple]="multiple"
      ariaLabel="Frequency"
      [options]="options"
      [(ngModel)]="value"
    ></baps-segmented>
  `,
})
class Host {
  options: unknown[] = ['Once', 'Repeat', 'Ad-hoc'];
  value: unknown = 'Once';
  brand: 'mybky' | 'sampark' = 'mybky';
  multiple = false;
}

async function render(setup: (h: Host) => void = () => { /* empty */ }) {
  const fixture = TestBed.createComponent(Host);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('BapsSegmented', () => {
  describe('ControlValueAccessor', () => {
    it('writeValue sets the value PrimeNG binds to', () => {
      const component = TestBed.createComponent(BapsSegmented).componentInstance;
      component.writeValue('Repeat');
      expect(component.value).toBe('Repeat');
    });

    it('onSelectionChange forwards the new value and marks touched', () => {
      const component = TestBed.createComponent(BapsSegmented).componentInstance;
      const onChange = jest.fn();
      const onTouched = jest.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component.onSelectionChange({ originalEvent: new Event('click'), value: 'Repeat' });

      expect(component.value).toBe('Repeat');
      expect(onChange).toHaveBeenCalledWith('Repeat');
      expect(onTouched).toHaveBeenCalledTimes(1);
    });

    it('setDisabledState toggles the disabled input', () => {
      const component = TestBed.createComponent(BapsSegmented).componentInstance;
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });

    it('reflects a bound ngModel value on render', async () => {
      const fixture = await render((h) => (h.value = 'Ad-hoc'));
      const segmented = fixture.debugElement.children[0].componentInstance as BapsSegmented;
      expect(segmented.value).toBe('Ad-hoc');
    });
  });

  describe('accessibility', () => {
    /**
     * PrimeNG gives role="group" but has no aria-label input — only
     * aria-labelledby — so without this binding the group announces as a bare
     * "group".
     */
    it('puts ariaLabel on the element PrimeNG marks role="group"', async () => {
      const fixture = await render();
      const group = (fixture.nativeElement as HTMLElement).querySelector('p-selectbutton')!;
      expect(group.getAttribute('role')).toBe('group');
      expect(group.getAttribute('aria-label')).toBe('Frequency');
    });

    /**
     * The whole reason onKeyDown exists: SelectButton ships changeTabIndexes()
     * for arrow roving but never calls it, and ToggleButton's own keydown
     * handles Enter and Space only.
     */
    it('moves focus with ArrowRight and wraps at the end', async () => {
      const fixture = await render();
      const host = fixture.nativeElement as HTMLElement;
      const items = host.querySelectorAll<HTMLElement>('.p-togglebutton');
      expect(items.length).toBe(3);

      items[0].focus();
      const segmented = fixture.debugElement.children[0].componentInstance as BapsSegmented;

      segmented.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(document.activeElement).toBe(items[1]);

      segmented.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(document.activeElement).toBe(items[2]);

      segmented.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(document.activeElement).toBe(items[0]);
    });

    it('ArrowLeft steps back and Home/End jump to the edges', async () => {
      const fixture = await render();
      const items = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.p-togglebutton',
      );
      const segmented = fixture.debugElement.children[0].componentInstance as BapsSegmented;

      items[1].focus();
      segmented.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(document.activeElement).toBe(items[0]);

      segmented.onKeyDown(new KeyboardEvent('keydown', { key: 'End' }));
      expect(document.activeElement).toBe(items[2]);

      segmented.onKeyDown(new KeyboardEvent('keydown', { key: 'Home' }));
      expect(document.activeElement).toBe(items[0]);
    });

    it('leaves keys it does not own alone', async () => {
      const fixture = await render();
      const items = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.p-togglebutton',
      );
      const segmented = fixture.debugElement.children[0].componentInstance as BapsSegmented;

      items[0].focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
      segmented.onKeyDown(event);

      expect(document.activeElement).toBe(items[0]);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('brand and mode host classes', () => {
    it('applies baps-sampark only for brand="sampark"', async () => {
      const fixture = await render((h) => (h.brand = 'sampark'));
      const el = (fixture.nativeElement as HTMLElement).querySelector('baps-segmented')!;
      expect(el.classList.contains('baps-sampark')).toBe(true);
    });

    /**
     * The weekday chip is this component with multiple=true, not a second
     * component — the chip skin hangs off this one class.
     */
    it('applies baps-segmented-multiple only in multi-select mode', async () => {
      const single = await render();
      expect(
        (single.nativeElement as HTMLElement)
          .querySelector('baps-segmented')!
          .classList.contains('baps-segmented-multiple'),
      ).toBe(false);

      const multi = await render((h) => {
        h.multiple = true;
        h.value = ['Once'];
      });
      expect(
        (multi.nativeElement as HTMLElement)
          .querySelector('baps-segmented')!
          .classList.contains('baps-segmented-multiple'),
      ).toBe(true);
    });
  });

  /**
   * [dt] is re-read on every change detection; a fresh object each time makes
   * PrimeNG regenerate its scoped stylesheet every cycle.
   */
  it('returns a stable dt object across reads', () => {
    const component = TestBed.createComponent(BapsSegmented).componentInstance;
    expect(component.dt).toBe(component.dt);
  });
});
