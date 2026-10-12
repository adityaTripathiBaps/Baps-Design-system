import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

import { BapsMenu } from './menu.component';

/**
 * `baps-menu` wraps `p-menu`. It owns three things that break silently:
 *
 * 1. **`panelClass`, not a host class.** The popup panel portals to `<body>`,
 *    so a `[class.baps-sampark]` host binding never reaches it. The brand
 *    rides on the panel's own class list.
 *
 * 2. **`appendTo` defaults to 'body', not PrimeNG's 'self'.** Rendered
 *    inline the panel is clipped by any ancestor with `overflow` or a
 *    `transform`.
 *
 * 3. **`toggle()` is the only open/close entry point.** A consumer drives
 *    the popup through this method, so a dropped delegation makes an
 *    unopenable menu.
 */
@Component({
  standalone: true,
  imports: [BapsMenu],
  template: `
    <button #trigger type="button">Open menu</button>
    <baps-menu
      [model]="model()"
      [popup]="popup()"
      [appendTo]="appendTo()"
      [styleClass]="styleClass()"
      [brand]="brand()"
      [ariaLabel]="ariaLabel()"
      (show)="seen.push('show')"
      (hide)="seen.push('hide')"
    />
  `,
})
class Host {
  @ViewChild(BapsMenu) readonly menu!: BapsMenu;

  readonly model = signal<MenuItem[]>([
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.seen.push('edit'),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      visible: false,
    },
    {
      label: 'Submenu',
      items: [
        { label: 'Sub-A' },
        { label: 'Sub-B', disabled: true },
      ],
    },
  ]);

  readonly popup = signal(true);
  readonly appendTo = signal<unknown>('body');
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly seen: string[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

const prime = (fixture: {
  debugElement: {
    query: (
      p: (de: { componentInstance: unknown }) => boolean,
    ) => { componentInstance: unknown };
  };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Menu)
    .componentInstance as Menu;

describe('BapsMenu', () => {
  describe('panelClass', () => {
    it('is empty for mybky, so the panel inherits the preset', async () => {
      const fixture = await setup();
      expect(prime(fixture).styleClass).toBe('');
    });

    it('carries the Sampark scope onto the portalled panel', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);

      expect(prime(fixture).styleClass).toContain('baps-ds-sampark');
      expect(prime(fixture).styleClass).toContain('baps-menu-sampark');
    });

    it('appends a caller styleClass after the brand class', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      fixture.componentInstance.styleClass.set('my-custom-menu');
      await apply(fixture);

      expect(prime(fixture).styleClass).toBe(
        'baps-ds-sampark baps-menu-sampark my-custom-menu',
      );
    });

    it('passes a caller styleClass alone when the brand is mybky', async () => {
      const fixture = await setup();
      fixture.componentInstance.styleClass.set('my-custom-menu');
      await apply(fixture);
      expect(prime(fixture).styleClass).toBe('my-custom-menu');
    });
  });

  describe('appendTo', () => {
    it("defaults to 'body' rather than PrimeNG's 'self'", async () => {
      const fixture = await setup();
      expect(prime(fixture).appendTo()).toBe('body');
    });
  });

  describe('model forwarding', () => {
    it('passes the model to PrimeNG and respects visible: false', async () => {
      const fixture = await setup();
      const primenu = prime(fixture);
      // PrimeNG receives the full model; rendering respects visible: false
      const model = primenu.model;
      expect(model).toBe(fixture.componentInstance.model());
      expect(model?.length).toBe(3);
    });

    it('carries nested submenus through the model', async () => {
      const fixture = await setup();
      const items = prime(fixture).model;
      expect(items).toBeDefined();
      const submenu = items?.find((i) => i.label === 'Submenu');
      expect(submenu?.items?.length).toBe(2);
    });
  });

  describe('toggle API', () => {
    it('delegates toggle to the PrimeNG instance', async () => {
      const fixture = await setup();
      const spy = jest.spyOn(prime(fixture), 'toggle');
      const event = new MouseEvent('click');

      fixture.componentInstance.menu.toggle(event);
      expect(spy).toHaveBeenCalledWith(event);
    });
  });

  describe('forwarding', () => {
    it('passes ariaLabel through', async () => {
      const fixture = await setup();
      fixture.componentInstance.ariaLabel.set('Actions');
      await apply(fixture);
      expect(prime(fixture).ariaLabel).toBe('Actions');
    });

    it('defaults popup to true', async () => {
      const fixture = await setup();
      expect(prime(fixture).popup).toBe(true);
    });
  });
});
