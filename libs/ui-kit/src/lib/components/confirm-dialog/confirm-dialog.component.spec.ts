import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { BapsDialog } from '../dialog/dialog.component';
import { BapsConfirmDialog } from './confirm-dialog.component';
import { BapsConfirmationService } from './confirmation.service';

@Component({
  standalone: true,
  imports: [BapsConfirmDialog],
  template: `
    <baps-confirm-dialog
      [key]="key()"
      [brand]="brand()"
      [baseZIndex]="1200"
      [style]="{ maxWidth: '90vw' }"
      (hide)="seen.push('hide')"
    />
  `,
})
class Host {
  @ViewChild(BapsConfirmDialog) readonly dialog!: BapsConfirmDialog;
  readonly key = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly seen: string[] = [];
}

/**
 * Use autoDetectChanges so Angular manages CD the same way it would in a
 * running app (inside NgZone). The imperative callback can update the dialog
 * between change-detection cycles, so the test lets Angular schedule the same
 * follow-up pass a real event handler receives.
 */
async function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

async function settle(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
}

describe('BapsConfirmDialog', () => {
  it('opens when BapsConfirmationService emits a confirmation', async () => {
    const fixture = await setup();
    const service = TestBed.inject(BapsConfirmationService);

    expect(fixture.componentInstance.dialog.visible).toBe(false);

    let accepted = false;
    service.confirm({
      message: 'Delete this member?',
      header: 'Confirm Deletion',
      accept: () => {
        accepted = true;
      },
    });

    await settle(fixture);

    expect(fixture.componentInstance.dialog.visible).toBe(true);
    expect(fixture.componentInstance.dialog.confirmation?.message).toBe(
      'Delete this member?',
    );

    // Accept action
    fixture.componentInstance.dialog.accept();
    await settle(fixture);

    expect(accepted).toBe(true);
    expect(fixture.componentInstance.dialog.visible).toBe(false);
    expect(fixture.componentInstance.seen).toContain('hide');
  });

  it('rejects and executes reject callback when reject() is called', async () => {
    const fixture = await setup();
    const service = TestBed.inject(BapsConfirmationService);

    let rejected = false;
    service.confirm({
      message: 'Discard changes?',
      reject: () => {
        rejected = true;
      },
    });

    await settle(fixture);
    expect(fixture.componentInstance.dialog.visible).toBe(true);

    fixture.componentInstance.dialog.reject();
    await settle(fixture);

    expect(rejected).toBe(true);
    expect(fixture.componentInstance.dialog.visible).toBe(false);
    expect(fixture.componentInstance.seen).toContain('hide');
  });

  it('rejects when the dialog shell dismisses through Escape', async () => {
    const fixture = await setup();
    const service = TestBed.inject(BapsConfirmationService);
    const shell = fixture.debugElement.query(By.directive(BapsDialog))
      .componentInstance as BapsDialog;
    let rejected = false;

    service.confirm({
      message: 'Dismiss with Escape?',
      reject: () => {
        rejected = true;
      },
    });
    await settle(fixture);

    shell.visibleChange.emit(false);
    await settle(fixture);

    expect(rejected).toBe(true);
    expect(fixture.componentInstance.dialog.visible).toBe(false);
    expect(fixture.componentInstance.seen).toEqual(['hide']);
  });

  it('routes confirmations by key', async () => {
    const fixture = await setup();
    fixture.componentInstance.key.set('custom-key');
    await settle(fixture);

    const service = TestBed.inject(BapsConfirmationService);

    // Mismatched key — should NOT open
    service.confirm({
      key: 'other-key',
      message: 'Different dialog',
    });
    await settle(fixture);
    expect(fixture.componentInstance.dialog.visible).toBe(false);

    // Matching key — SHOULD open
    service.confirm({
      key: 'custom-key',
      message: 'Matched dialog',
    });
    await settle(fixture);
    expect(fixture.componentInstance.dialog.visible).toBe(true);
  });

  it('closes via service.close()', async () => {
    const fixture = await setup();
    const service = TestBed.inject(BapsConfirmationService);

    service.confirm({ message: 'Close me soon' });
    await settle(fixture);
    expect(fixture.componentInstance.dialog.visible).toBe(true);

    service.close();
    await settle(fixture);
    expect(fixture.componentInstance.dialog.visible).toBe(false);
    expect(fixture.componentInstance.seen).toEqual(['hide']);

    service.close();
    await settle(fixture);
    expect(fixture.componentInstance.seen).toEqual(['hide']);
  });

  it('forwards approved panel style and stacking inputs', async () => {
    const fixture = await setup();
    const dialog = fixture.debugElement.query(By.directive(BapsDialog))
      .componentInstance as BapsDialog;

    expect(dialog.baseZIndex).toBe(1200);
    expect(dialog.style).toEqual({ maxWidth: '90vw' });
  });

  it('renders the shell as an alertdialog', async () => {
    const fixture = await setup();
    const dialog = fixture.debugElement.query(By.directive(BapsDialog))
      .componentInstance as BapsDialog;

    expect(dialog.role).toBe('alertdialog');
    // Bound as a property: a static role="alertdialog" attribute also landed
    // on the <baps-dialog> host, a second, nameless "dialog" (axe
    // aria-dialog-name) next to the real PrimeNG panel.
    expect(
      fixture.debugElement.query(By.directive(BapsDialog)).nativeElement.hasAttribute('role'),
    ).toBe(false);
  });

  // The tests run zoneless. The service calls the dialog outside any template
  // event, so without markForCheck its state changed and the view never did:
  // the shell stayed closed while `visible` read true.
  it('renders the shell when the service emits, with no template event', async () => {
    const fixture = await setup();
    TestBed.inject(BapsConfirmationService).confirm({
      message: 'Delete this member?',
      header: 'Confirm Deletion',
    });
    await settle(fixture);
    const inner = fixture.debugElement.query(By.directive(BapsDialog))
      .componentInstance as BapsDialog;
    expect(inner.visible).toBe(true);
    expect(inner.header).toBe('Confirm Deletion');
  });

  it('describes the alertdialog with its message', async () => {
    const fixture = await setup();
    TestBed.inject(BapsConfirmationService).confirm({
      message: 'Delete this member?',
      header: 'Confirm Deletion',
    });
    await settle(fixture);

    // The baps-dialog HOST also carries role="alertdialog" as an attribute;
    // the panel is PrimeNG's .p-dialog element.
    const panel = document.querySelector('.p-dialog[role="alertdialog"]');
    expect(panel).not.toBeNull();
    const id = panel!.getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)!.textContent).toContain('Delete this member?');
  });
});

@Component({
  imports: [BapsConfirmDialog, SharedModule],
  template: `
    <baps-confirm-dialog source="primeng" key="app">
      <ng-template pTemplate="message" let-c><span class="custom-msg">{{ c?.message }}</span></ng-template>
      <ng-template pTemplate="footer" let-c let-reject="reject">
        <button type="button" class="custom-reject" (click)="reject()">{{ c?.rejectLabel }}</button>
      </ng-template>
    </baps-confirm-dialog>
  `,
})
class PrimeSourceHost {}

describe('BapsConfirmDialog source="primeng" and templates', () => {
  it('opens from PrimeNG ConfirmationService, renders the forwarded templates and closes on close()', async () => {
    TestBed.configureTestingModule({ providers: [ConfirmationService] });
    const fixture = TestBed.createComponent(PrimeSourceHost);
    fixture.detectChanges();
    const svc = TestBed.inject(ConfirmationService);
    let rejected = 0;
    svc.confirm({ key: 'app', message: 'Save changes?', rejectLabel: 'No', reject: () => rejected++ });
    fixture.detectChanges();
    await fixture.whenStable();
    const dlg = fixture.debugElement.query(By.directive(BapsConfirmDialog)).componentInstance as BapsConfirmDialog;
    expect(dlg.visible).toBe(true);
    const doc = document.body;
    expect(doc.querySelector('.custom-msg')?.textContent).toBe('Save changes?');
    (doc.querySelector('.custom-reject') as HTMLButtonElement).click();
    expect(rejected).toBe(1);
    expect(dlg.visible).toBe(false);
    svc.confirm({ key: 'app', message: 'Again' });
    fixture.detectChanges();
    expect(dlg.visible).toBe(true);
    svc.close();
    expect(dlg.visible).toBe(false);
  });

  it('defaults the accept button to primary for PrimeNG confirmations', () => {
    TestBed.configureTestingModule({ imports: [BapsConfirmDialog], providers: [ConfirmationService] });
    const fixture = TestBed.createComponent(BapsConfirmDialog);
    fixture.componentRef.setInput('source', 'primeng');
    fixture.detectChanges();
    TestBed.inject(ConfirmationService).confirm({ message: 'x' });
    expect((fixture.componentInstance as unknown as { activeAcceptSeverity: string }).activeAcceptSeverity).toBe('primary');
  });

  it('ignores PrimeNG ConfirmationService by default', () => {
    TestBed.configureTestingModule({ imports: [BapsConfirmDialog], providers: [ConfirmationService] });
    const fixture = TestBed.createComponent(BapsConfirmDialog);
    fixture.detectChanges();
    TestBed.inject(ConfirmationService).confirm({ message: 'x' });
    expect(fixture.componentInstance.visible).toBe(false);
  });
});
