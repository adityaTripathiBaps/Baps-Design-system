import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'primeng/api';
import { BapsListbox } from './listbox/listbox.component';
import { BapsTable } from './table/table.component';

/**
 * baps-listbox and baps-table forward a consumer's <ng-template pTemplate="…">
 * down to the PrimeNG component by re-declaring one ng-template per entry of
 * their own @ContentChildren(PrimeTemplate) query.
 *
 * That re-declaration lives inside `@for` / `@if` blocks, so the query has to
 * keep finding templates that are themselves declared in an embedded view. The
 * failure mode is silent — the consumer's template is simply ignored and the
 * default rendering shows instead — so it gets a test rather than a comment.
 */

@Component({
  imports: [BapsListbox, SharedModule],
  template: `
    <baps-listbox [options]="options" optionLabel="label">
      <ng-template pTemplate="item" let-option>
        <span class="custom-option">custom:{{ option.label }}</span>
      </ng-template>
    </baps-listbox>
  `,
})
class ListboxHost {
  options = [{ label: 'Alpha' }, { label: 'Beta' }];
}

@Component({
  imports: [BapsTable, SharedModule],
  template: `
    <baps-table [value]="rows">
      <ng-template pTemplate="body" let-row>
        <tr>
          <td class="custom-cell">custom:{{ row.name }}</td>
        </tr>
      </ng-template>
    </baps-table>
  `,
})
class TableHost {
  rows = [{ name: 'Alpha' }, { name: 'Beta' }];
}

describe('pTemplate forwarding through @for / @if blocks', () => {
  it('baps-listbox renders the consumer item template', async () => {
    const fixture = TestBed.createComponent(ListboxHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.custom-option').length).toBe(2);
    expect(el.textContent).toContain('custom:Alpha');
    // The built-in fallback must not render alongside the custom one.
    expect(el.querySelector('.baps-listbox-default-label')).toBeNull();
  });

  it('baps-table renders the consumer body template', async () => {
    const fixture = TestBed.createComponent(TableHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.custom-cell').length).toBe(2);
    expect(el.textContent).toContain('custom:Beta');
  });
});
