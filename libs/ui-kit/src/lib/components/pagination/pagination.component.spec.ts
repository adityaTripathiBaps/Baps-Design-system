import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BapsPageEvent, BapsPaginator } from './pagination.component';

/**
 * Everything here is hand-rolled TS, not a PrimeNG passthrough (see the
 * component's own "Why this is not a PrimeNG wrapper" doc) — the page-link
 * truncation, the anchor-preserving rows-per-page change, and the jump-to-
 * page parser are all first-party logic with no upstream test coverage of
 * their own, unlike every other component in this library.
 */
@Component({
  imports: [BapsPaginator],
  template: `
    <baps-paginator
      [totalRecords]="totalRecords"
      [rows]="rows"
      [first]="first"
      [rowsPerPageOptions]="rowsPerPageOptions"
      [showFirstLastIcon]="showFirstLastIcon"
      [showJumpToPage]="showJumpToPage"
      [showCurrentPageReport]="showCurrentPageReport"
      (pageChange)="lastEvent = $event"
    />
  `,
})
class Host {
  totalRecords = 250;
  rows = 20;
  first = 0;
  rowsPerPageOptions?: number[];
  showFirstLastIcon = true;
  showJumpToPage = false;
  showCurrentPageReport = true;
  lastEvent?: BapsPageEvent;
}

async function setup(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function pageLabels(el: HTMLElement): string[] {
  return [...el.querySelectorAll('.baps-paginator__page, .baps-paginator__gap')].map((n) =>
    n.textContent!.trim(),
  );
}

describe('BapsPaginator', () => {
  it('keeps first two, last two and current neighbours, eliding the rest', async () => {
    // 250 records / 20 rows = 13 pages. Page 1 (first=0): 1 2 … 12 13.
    const fixture = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(pageLabels(el)).toEqual(['1', '2', '...', '12', '13']);
  });

  it('shows every page when nothing needs eliding', async () => {
    const fixture = await setup({ totalRecords: 60, rows: 20 }); // 3 pages
    const el = fixture.nativeElement as HTMLElement;
    expect(pageLabels(el)).toEqual(['1', '2', '3']);
  });

  it('opens ellipsis on both sides in the middle of a long list', async () => {
    // 13 pages, first=240 -> page index 12 (last page). Use a mid value instead.
    const fixture = await setup({ first: 120 }); // page 7 of 13 (rows=20)
    const el = fixture.nativeElement as HTMLElement;
    expect(pageLabels(el)).toEqual(['1', '2', '...', '6', '7', '8', '...', '12', '13']);
  });

  it('marks the current page active and gives it aria-current', async () => {
    const fixture = await setup();
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('.baps-paginator__page--active') as HTMLButtonElement;
    expect(active.textContent!.trim()).toBe('1');
    expect(active.getAttribute('aria-current')).toBe('page');
  });

  it('disables Previous/First on page one and Next/Last on the final page', async () => {
    const first = await setup();
    const elFirst = first.nativeElement as HTMLElement;
    const [firstBtn, prevBtn] = elFirst.querySelectorAll('.baps-paginator__nav');
    expect((firstBtn as HTMLButtonElement).disabled).toBe(true);
    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);

    const last = await setup({ first: 240 }); // last page (13th) of 13
    const elLast = last.nativeElement as HTMLElement;
    const navButtons = elLast.querySelectorAll('.baps-paginator__nav');
    const nextBtn = navButtons[navButtons.length - 2] as HTMLButtonElement;
    const lastBtn = navButtons[navButtons.length - 1] as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
    expect(lastBtn.disabled).toBe(true);
  });

  it('emits pageChange with the full BapsPageEvent shape on nav click', async () => {
    const fixture = await setup();
    const el = fixture.nativeElement as HTMLElement;
    const pageTwo = [...el.querySelectorAll('.baps-paginator__page')].find(
      (b) => b.textContent!.trim() === '2',
    ) as HTMLButtonElement;
    pageTwo.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.lastEvent).toEqual({
      first: 20,
      rows: 20,
      page: 1,
      pageCount: 13,
    });
  });

  it('does not emit when clicking the already-current page (no-op guard)', async () => {
    const fixture = await setup();
    fixture.componentInstance.lastEvent = undefined;
    const el = fixture.nativeElement as HTMLElement;
    const pageOne = [...el.querySelectorAll('.baps-paginator__page')].find(
      (b) => b.textContent!.trim() === '1',
    ) as HTMLButtonElement;
    pageOne.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.lastEvent).toBeUndefined();
  });

  it('keeps the current record in view when rows-per-page changes (anchor preserved)', async () => {
    // On page 3 (first=40, rows=20); switching to rows=50 should not reset to
    // page 1 — it should land on the page that still contains record #40.
    // Driven through the component API directly: the rows-per-page control
    // is a real p-select overlay, out of scope for this test.
    const fixture = await setup({ first: 40, rowsPerPageOptions: [10, 20, 50, 100] });
    const paginator = fixture.debugElement.query(By.directive(BapsPaginator))
      .componentInstance as unknown as { onRowsChange: (rows: number) => void };
    paginator.onRowsChange(50);
    await fixture.whenStable();

    expect(fixture.componentInstance.lastEvent).toEqual({
      first: 0, // floor(40 / 50) * 50
      rows: 50,
      page: 0,
      pageCount: 5,
    });
  });

  it('formats the current-page report with all placeholders', async () => {
    const fixture = await setup({ first: 20 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.baps-paginator__report')!.textContent!.trim()).toBe(
      'Showing 21-40 of 250',
    );
  });

  it('reports "0 of 0" without throwing when there are no records', async () => {
    const fixture = await setup({ totalRecords: 0, first: 0 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.baps-paginator__report')!.textContent!.trim()).toBe(
      'Showing 0-0 of 0',
    );
  });

  it('commits a typed jump-to-page value via Enter', async () => {
    const fixture = await setup({ showJumpToPage: true });
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.baps-paginator__jump-input') as HTMLInputElement;
    input.value = '5';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.lastEvent?.page).toBe(4); // zero-based
  });

  it('ignores a non-numeric jump value instead of navigating to NaN', async () => {
    const fixture = await setup({ showJumpToPage: true });
    fixture.componentInstance.lastEvent = undefined;
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.baps-paginator__jump-input') as HTMLInputElement;
    input.value = 'abc';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.lastEvent).toBeUndefined();
  });

  it('clamps a jump value past the last page to the last page', async () => {
    const fixture = await setup({ showJumpToPage: true });
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.baps-paginator__jump-input') as HTMLInputElement;
    input.value = '999';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.lastEvent?.page).toBe(12); // last of 13 pages
  });

  it('applies the baps-sampark host class only for brand="sampark"', async () => {
    @Component({
      imports: [BapsPaginator],
      template: `<baps-paginator brand="sampark" [totalRecords]="10" [rows]="10" />`,
    })
    class SamparkHost {}

    const fixture = TestBed.createComponent(SamparkHost);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    const el = (fixture.nativeElement as HTMLElement).querySelector('baps-paginator')!;
    expect(el.classList.contains('baps-sampark')).toBe(true);
  });
});
