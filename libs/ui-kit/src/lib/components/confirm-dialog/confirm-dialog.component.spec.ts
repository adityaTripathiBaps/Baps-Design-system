import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { BapsConfirmDialog } from './confirm-dialog.component';
import { BapsConfirmationService } from './confirmation.service';

@Component({
  standalone: true,
  imports: [BapsConfirmDialog],
  template: `
    <baps-confirm-dialog
      [key]="key()"
      [brand]="brand()"
      (hide)="seen.push('hide')"
      (acceptEvent)="seen.push('accept')"
      (rejectEvent)="seen.push('reject')"
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
 * running app (inside NgZone). Manual detectChanges + an imperative Subject
 * that fires between CD cycles triggers NG0100 in dev mode — a false positive
 * that does not occur in production.
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
    expect(fixture.componentInstance.seen).toContain('accept');
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
    expect(fixture.componentInstance.seen).toContain('reject');
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
  });

  it('supports PrimeNG ConfirmationService interoperability', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ConfirmationService, BapsConfirmationService],
    });

    const fixture = await setup();
    const primeService = TestBed.inject(ConfirmationService);

    let accepted = false;
    primeService.confirm({
      message: 'PrimeNG confirmation',
      accept: () => {
        accepted = true;
      },
    });

    await settle(fixture);
    expect(fixture.componentInstance.dialog.visible).toBe(true);

    fixture.componentInstance.dialog.accept();
    await settle(fixture);
    expect(accepted).toBe(true);
    expect(fixture.componentInstance.dialog.visible).toBe(false);
  });
});
