import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsDialog, BapsDialogAlign } from './dialog.component';

/**
 * The wrapper's whole job is what happens at the PrimeNG boundary plus the two
 * things PrimeNG does not do, and every failure mode there is silent.
 *
 * **Two-way `visible`.** `onVisibleChange` writes PrimeNG's close back onto
 * the accessor *and* re-emits it. Drop either half and the dialog still opens
 * — it just never tells the consumer it closed, so `[(visible)]` desyncs and
 * the next open is a no-op. Same shape as `baps-drawer`'s.
 *
 * **Focus restoration.** PrimeNG captures nothing on open and calls nothing on
 * close, so the caret lands on `<body>`. The `visible` accessor does it, and
 * the only way to catch a regression is to actually check `activeElement`
 * after a close.
 *
 * **`aria-labelledby`.** PrimeNG writes the id onto its own title span and
 * drops it the moment a header template exists — which this wrapper always
 * supplies. If the template stops re-claiming the id off the template
 * context, every dialog silently becomes an unlabelled one; nothing throws.
 *
 * **Template forwarding.** PrimeNG finds header/footer with `@ContentChild`,
 * which resolves against the *declaration* tree, so a consumer's
 * `<ng-template pTemplate="footer">` written inside `<baps-dialog>` would
 * never be found. Same class of boundary bug `components/template-forwarding.spec.ts`
 * covers for listbox/table, asserted the same way: the projected node has to
 * land inside PrimeNG's own region, not just somewhere in the DOM.
 *
 * **Brand.** The panel is portaled to `<body>`, so neither the host class nor
 * a `.baps-ds-sampark` ancestor reaches it — the scope class has to ride on
 * PrimeNG's `styleClass`, and it must not eat a consumer's own class.
 */
@Component({
  imports: [BapsDialog],
  template: `
    <button type="button" class="trigger" (click)="visible.set(true)">Open</button>

    <baps-dialog
      [(visible)]="visible"
      [brand]="brand()"
      [align]="align()"
      [actionsAlign]="actionsAlign()"
      [styleClass]="styleClass()"
      [closable]="closable()"
      header="Cancel Document Upload"
    >
      <img dialog-media class="my-media" alt="" />
      <p class="my-body">You are about to cancel the current upload.</p>
      <div dialog-footer><button type="button" class="my-cancel">Continue</button></div>
    </baps-dialog>
  `,
})
class Host {
  readonly visible = signal(true);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly align = signal<BapsDialogAlign>('center');
  readonly actionsAlign = signal<'center' | 'end'>('center');
  readonly styleClass = signal<string | undefined>(undefined);
  readonly closable = signal(false);
}

type Overrides = Partial<{
  brand: 'mybky' | 'sampark';
  align: BapsDialogAlign;
  actionsAlign: 'center' | 'end';
  styleClass: string;
  closable: boolean;
  visible: boolean;
}>;

async function setup(overrides: Overrides = {}) {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  if (overrides.brand) host.brand.set(overrides.brand);
  if (overrides.align) host.align.set(overrides.align);
  if (overrides.actionsAlign) host.actionsAlign.set(overrides.actionsAlign);
  if (overrides.styleClass) host.styleClass.set(overrides.styleClass);
  if (overrides.closable !== undefined) host.closable.set(overrides.closable);
  if (overrides.visible !== undefined) host.visible.set(overrides.visible);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

// The panel is portaled — PrimeNG renders it outside this component's own
// subtree — so everything is queried off document.body, never
// fixture.nativeElement.
const panel = () => document.querySelector('.p-dialog');

describe('BapsDialog', () => {
  describe('visible two-way binding', () => {
    it('renders the panel when visible starts true', async () => {
      await setup();
      expect(panel()).not.toBeNull();
      expect(document.querySelector('.baps-dialog__title')!.textContent).toContain(
        'Cancel Document Upload',
      );
    });

    it('does not render a panel while visible is false', async () => {
      await setup({ visible: false });
      expect(panel()).toBeNull();
    });

    it('writes PrimeNG close back onto the consumer binding', async () => {
      const fixture = await setup({ closable: true });
      // Unlike p-drawer, dialog puts `p-dialog-close-button` on the <button>
      // p-button renders, not on the <p-button> host.
      document.querySelector<HTMLButtonElement>('button.p-dialog-close-button')!.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.visible()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('marks the panel as a modal dialog', async () => {
      await setup();
      expect(panel()!.getAttribute('role')).toBe('dialog');
      expect(panel()!.getAttribute('aria-modal')).toBe('true');
    });

    it('points aria-labelledby at the wrapper own title element', async () => {
      // The regression this guards: PrimeNG only stamps the label id onto the
      // title span it renders ITSELF, and stops rendering that span as soon as
      // a header template exists — which this wrapper always supplies. The id
      // has to be taken back off the template context, or aria-labelledby
      // resolves to nothing.
      await setup();
      const labelId = panel()!.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      const label = document.getElementById(labelId!);
      expect(label).not.toBeNull();
      expect(label!.classList.contains('baps-dialog__title')).toBe(true);
      expect(label!.textContent).toContain('Cancel Document Upload');
    });

    it('restores focus to the element that opened it', async () => {
      // PrimeNG does none of this: it captures no opener and calls no focus()
      // on close, so without the wrapper the caret lands on <body>.
      const fixture = await setup({ visible: false });
      const trigger = fixture.nativeElement.querySelector('.trigger') as HTMLButtonElement;
      document.body.appendChild(fixture.nativeElement);
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      trigger.click();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(panel()).not.toBeNull();

      fixture.componentInstance.visible.set(false);
      await fixture.whenStable();
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger);
    });

    it('does not render a close button by default', async () => {
      // None of the five Figma shells has one; the footer Cancel is the
      // dismiss affordance, and it is a 150px target rather than 32px.
      await setup();
      expect(document.querySelector('.p-dialog-close-button')).toBeNull();
    });
  });

  describe('ng-template forwarding across the PrimeNG boundary', () => {
    it('lands [dialog-media] and the title inside PrimeNG .p-dialog-header', async () => {
      await setup();
      const header = document.querySelector('.p-dialog-header')!;
      expect(header.querySelector('.my-media')).not.toBeNull();
      expect(header.querySelector('.baps-dialog__title')).not.toBeNull();
      // Body content must NOT have leaked into the header slot.
      expect(header.querySelector('.my-body')).toBeNull();
    });

    it('lands [dialog-footer] inside PrimeNG .p-dialog-footer', async () => {
      await setup();
      const footer = document.querySelector('.p-dialog-footer');
      expect(footer).not.toBeNull();
      expect(footer!.querySelector('.my-cancel')!.textContent).toContain('Continue');
    });

    it('puts default-slot content in the content region, not header or footer', async () => {
      await setup();
      expect(document.querySelector('.p-dialog-content')!.querySelector('.my-body')).not.toBeNull();
    });
  });

  describe('panel classes (portal scoping and layout)', () => {
    it('always stamps the styling hook onto the portaled panel', async () => {
      await setup();
      expect(panel()!.classList.contains('baps-dialog-panel')).toBe(true);
    });

    it('adds baps-ds-sampark to the portaled panel for sampark only', async () => {
      await setup({ brand: 'sampark' });
      expect(panel()!.classList.contains('baps-ds-sampark')).toBe(true);
    });

    it('adds no scope class to the panel for mybky', async () => {
      await setup();
      expect(panel()!.classList.contains('baps-ds-sampark')).toBe(false);
    });

    it('preserves a consumer styleClass alongside the scope class', async () => {
      await setup({ brand: 'sampark', styleClass: 'my-panel' });
      const classList = panel()!.classList;
      expect(classList.contains('my-panel')).toBe(true);
      expect(classList.contains('baps-ds-sampark')).toBe(true);
    });

    it('emits the baps-sampark host class only for sampark', async () => {
      const fixture = await setup();
      const host = (fixture.nativeElement as HTMLElement).querySelector('baps-dialog')!;
      expect(host.classList.contains('baps-sampark')).toBe(false);
      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });

    it('defaults to the centred Figma layout and opts out per instance', async () => {
      await setup();
      expect(panel()!.classList.contains('baps-dialog-align-start')).toBe(false);
      expect(panel()!.classList.contains('baps-dialog-actions-end')).toBe(false);
    });

    it('flags the larger form-modal layout on the panel', async () => {
      await setup({ align: 'start', actionsAlign: 'end' });
      expect(panel()!.classList.contains('baps-dialog-align-start')).toBe(true);
      expect(panel()!.classList.contains('baps-dialog-actions-end')).toBe(true);
    });
  });
});
