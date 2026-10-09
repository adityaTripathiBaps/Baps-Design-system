import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  BapsUsersDropdown,
  type BapsUserOption,
} from './users-dropdown.component';

/**
 * `baps-users-dropdown` renders no PrimeNG and holds its own open state,
 * search, grouping and selection. Three modes share one component —
 * `single`, `checkbox`, `radio` — and almost every getter branches on which,
 * so the ways it breaks are "the wrong mode's behaviour", not an error.
 */
const USERS: BapsUserOption[] = [
  { value: 1, title: 'Amit Patel', subtitle: 'amit@example.com', group: 'Leads' },
  { value: 2, title: 'Bhavna Shah', subtitle: 'bhavna@example.com', group: 'Leads' },
  { value: 3, title: 'Chirag Desai', subtitle: 'chirag@example.com', group: 'Karyakars' },
  { value: 4, title: 'Deepa Joshi', group: 'Karyakars', disabled: true },
];

@Component({
  standalone: true,
  imports: [BapsUsersDropdown],
  template: `
    <baps-users-dropdown
      [users]="users()"
      [placeholder]="placeholder()"
      [value]="value()"
      [values]="values()"
      [selectionMode]="selectionMode()"
      [disabled]="disabled()"
      [open]="open()"
      [searchValue]="searchValue()"
      [brand]="brand()"
      (valueChange)="seen.push(['valueChange', $event])"
      (valuesChange)="seen.push(['valuesChange', $event])"
      (openChange)="seen.push(['openChange', $event])"
      (searchChange)="seen.push(['searchChange', $event])"
    />
  `,
})
class Host {
  readonly users = signal<BapsUserOption[]>(USERS);
  readonly placeholder = signal('Select user');
  readonly value = signal<unknown>(undefined);
  readonly values = signal<unknown[]>([]);
  readonly selectionMode = signal<'single' | 'checkbox' | 'radio'>('single');
  readonly disabled = signal(false);
  readonly open = signal(false);
  readonly searchValue = signal('');
  readonly brand = signal<'mybky' | 'sampark'>('sampark');
  readonly seen: Array<[string, unknown]> = [];
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

const cmp = (fixture: { debugElement: { children: Array<{ componentInstance: unknown }> } }) =>
  fixture.debugElement.children[0].componentInstance as BapsUsersDropdown;

describe('BapsUsersDropdown', () => {
  describe('filtered', () => {
    it('returns the original array untouched when there is no query', async () => {
      const fixture = await setup();
      // Identity, not a copy: a fresh array every read would re-run the
      // @for track on every change-detection pass.
      expect(cmp(fixture).filtered).toBe(USERS);
    });

    it('matches on title and on subtitle, case-insensitively', async () => {
      const fixture = await setup();
      const component = cmp(fixture);

      component.searchValue = 'bhav';
      expect(component.filtered.map((u) => u.value)).toEqual([2]);

      // The subtitle is the email, which is what people actually search by.
      component.searchValue = 'CHIRAG@EXAMPLE';
      expect(component.filtered.map((u) => u.value)).toEqual([3]);
    });

    it('ignores surrounding whitespace', async () => {
      const fixture = await setup();
      cmp(fixture).searchValue = '  amit  ';
      expect(cmp(fixture).filtered.map((u) => u.value)).toEqual([1]);
    });

    it('survives a user with no subtitle', async () => {
      const fixture = await setup();
      cmp(fixture).searchValue = 'deepa';
      // Deepa has no subtitle; the optional chain must not throw or drop her.
      expect(cmp(fixture).filtered.map((u) => u.value)).toEqual([4]);
    });

    it('returns nothing rather than everything for a query that matches none', async () => {
      const fixture = await setup();
      cmp(fixture).searchValue = 'zzz';
      expect(cmp(fixture).filtered).toEqual([]);
    });
  });

  describe('groups', () => {
    it('groups the filtered users, keeping first-seen order', async () => {
      const fixture = await setup();
      expect(cmp(fixture).groups.map((g) => g.label)).toEqual([
        'Leads',
        'Karyakars',
      ]);
      expect(cmp(fixture).groups[0].items.map((u) => u.value)).toEqual([1, 2]);
    });

    it('groups what the search left, not the whole list', async () => {
      const fixture = await setup();
      cmp(fixture).searchValue = 'chirag';
      const groups = cmp(fixture).groups;
      // A heading for a group the search emptied is a heading with nothing
      // under it.
      expect(groups).toHaveLength(1);
      expect(groups[0].label).toBe('Karyakars');
    });

    it('keeps ungrouped users together under no label', async () => {
      const fixture = await setup();
      cmp(fixture).users = [
        { value: 9, title: 'No group' },
        { value: 10, title: 'Also none' },
      ];
      const groups = cmp(fixture).groups;
      expect(groups).toHaveLength(1);
      expect(groups[0].label).toBeUndefined();
      expect(groups[0].items).toHaveLength(2);
    });
  });

  describe('triggerLabel', () => {
    it('shows the placeholder until something is chosen', async () => {
      const fixture = await setup();
      expect(cmp(fixture).triggerLabel).toBe('Select user');
      expect(cmp(fixture).hasSelection).toBe(false);
    });

    it('shows the chosen title in single mode', async () => {
      const fixture = await setup();
      fixture.componentInstance.value.set(2);
      await apply(fixture);
      expect(cmp(fixture).triggerLabel).toBe('Bhavna Shah');
      expect(cmp(fixture).hasSelection).toBe(true);
    });

    it('counts instead of naming in checkbox mode', async () => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set('checkbox');
      fixture.componentInstance.values.set([1, 3]);
      await apply(fixture);
      // Naming them would overflow the trigger as soon as there are three.
      expect(cmp(fixture).triggerLabel).toBe('2 selected');
      expect(cmp(fixture).hasSelection).toBe(true);
    });

    it('falls back to the placeholder when checkbox mode has nothing', async () => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set('checkbox');
      await apply(fixture);
      expect(cmp(fixture).triggerLabel).toBe('Select user');
      expect(cmp(fixture).hasSelection).toBe(false);
    });
  });

  describe('open and close', () => {
    it('toggles, reporting each change once', async () => {
      const fixture = await setup();
      const component = cmp(fixture);

      component.toggle();
      expect(component.open).toBe(true);
      component.toggle();
      expect(component.open).toBe(false);

      expect(fixture.componentInstance.seen).toContainEqual(['openChange', true]);
      expect(fixture.componentInstance.seen).toContainEqual(['openChange', false]);
    });

    it('reports nothing when the state would not change', async () => {
      const fixture = await setup();
      // setOpen returns early on a no-op; without that guard, Escape on an
      // already-closed menu emits a close every time it is pressed.
      cmp(fixture).onEscape();
      expect(fixture.componentInstance.seen).toEqual([]);
    });

    it('does not open while disabled', async () => {
      const fixture = await setup();
      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      cmp(fixture).toggle();
      expect(cmp(fixture).open).toBe(false);
      expect(fixture.componentInstance.seen).toEqual([]);
    });

    it('clears the search on close, and says so', async () => {
      const fixture = await setup();
      const component = cmp(fixture);
      component.toggle();
      component.onSearchInput('amit');
      expect(component.searchValue).toBe('amit');

      component.toggle();
      // Reopening onto the previous query would show a filtered list with
      // an empty-looking search box.
      expect(component.searchValue).toBe('');
      expect(fixture.componentInstance.seen).toContainEqual(['searchChange', '']);
    });

    it('does not clear the search on open', async () => {
      const fixture = await setup();
      const component = cmp(fixture);
      component.onSearchInput('amit');
      component.toggle();
      expect(component.searchValue).toBe('amit');
    });
  });

  describe('dismissal', () => {
    it('closes on a click outside, and ignores one inside', async () => {
      const fixture = await setup();
      const component = cmp(fixture);
      component.toggle();
      await apply(fixture);

      const inside = fixture.nativeElement.querySelector(
        'baps-users-dropdown',
      ) as HTMLElement;
      component.onDocumentClick({ target: inside });
      expect(component.open).toBe(true);

      component.onDocumentClick({ target: document.body });
      expect(component.open).toBe(false);
    });

    it('ignores an outside click while already closed', async () => {
      const fixture = await setup();
      cmp(fixture).onDocumentClick({ target: document.body });
      expect(fixture.componentInstance.seen).toEqual([]);
    });

    it('closes on Escape', async () => {
      const fixture = await setup();
      const component = cmp(fixture);
      component.toggle();
      await apply(fixture);

      component.onEscape();
      expect(component.open).toBe(false);
    });
  });

  describe('search', () => {
    it('stores and reports what was typed', async () => {
      const fixture = await setup();
      cmp(fixture).onSearchInput('bhav');
      expect(cmp(fixture).searchValue).toBe('bhav');
      expect(fixture.componentInstance.seen).toContainEqual([
        'searchChange',
        'bhav',
      ]);
    });
  });

  describe('brand', () => {
    it('always carries exactly one brand class', async () => {
      const fixture = await setup();
      const host = fixture.nativeElement.querySelector(
        'baps-users-dropdown',
      ) as HTMLElement;
      // Unlike every other component here, mybky is a class too rather than
      // the absence of one — and sampark is the DEFAULT. Both halves have
      // to flip together or an element ends up with both or neither.
      expect(host.classList).toContain('baps-sampark');
      expect(host.classList).not.toContain('baps-mybky');

      fixture.componentInstance.brand.set('mybky');
      await apply(fixture);
      expect(host.classList).toContain('baps-mybky');
      expect(host.classList).not.toContain('baps-sampark');
    });
  });

  describe('select', () => {
    it('sets the value, reports it, and closes in single mode', async () => {
      const fixture = await setup();
      const component = cmp(fixture);
      component.toggle();
      await apply(fixture);

      component.select(USERS[1]);
      await apply(fixture);

      expect(component.value).toBe(2);
      expect(fixture.componentInstance.seen).toContainEqual(['valueChange', 2]);
      // Single mode is done after one pick; leaving it open means the next
      // click lands on a list the user thought was gone.
      expect(component.open).toBe(false);
    });

    it('stays open in radio mode, which is a choice the user may change', async () => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set('radio');
      await apply(fixture);

      const component = cmp(fixture);
      component.toggle();
      await apply(fixture);
      component.select(USERS[1]);
      await apply(fixture);

      expect(component.value).toBe(2);
      expect(component.open).toBe(true);
    });

    it('adds then removes in checkbox mode, and never closes', async () => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set('checkbox');
      await apply(fixture);

      const component = cmp(fixture);
      component.toggle();
      await apply(fixture);

      component.select(USERS[0]);
      component.select(USERS[2]);
      expect(component.values).toEqual([1, 3]);

      component.select(USERS[0]);
      expect(component.values).toEqual([3]);
      expect(component.open).toBe(true);
    });

    it('replaces the array in checkbox mode rather than mutating it', async () => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set('checkbox');
      await apply(fixture);

      const component = cmp(fixture);
      const before = component.values;
      component.select(USERS[0]);
      // A mutated array is the same reference, so a parent bound with
      // OnPush never sees the change.
      expect(component.values).not.toBe(before);
      expect(fixture.componentInstance.seen).toContainEqual([
        'valuesChange',
        [1],
      ]);
    });

    it('emits valuesChange, not valueChange, in checkbox mode', async () => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set('checkbox');
      await apply(fixture);

      cmp(fixture).select(USERS[0]);
      const names = fixture.componentInstance.seen.map(([n]) => n);
      expect(names).toContain('valuesChange');
      expect(names).not.toContain('valueChange');
    });

    it('ignores a disabled user in every mode', async () => {
      const fixture = await setup();
      cmp(fixture).select(USERS[3]);
      expect(cmp(fixture).value).toBeUndefined();
      expect(fixture.componentInstance.seen).toEqual([]);

      fixture.componentInstance.selectionMode.set('checkbox');
      await apply(fixture);
      cmp(fixture).select(USERS[3]);
      expect(cmp(fixture).values).toEqual([]);
      expect(fixture.componentInstance.seen).toEqual([]);
    });
  });

  describe('isSelected', () => {
    it('reads the single value, or the array in checkbox mode', async () => {
      const fixture = await setup();
      fixture.componentInstance.value.set(2);
      await apply(fixture);
      expect(cmp(fixture).isSelected(USERS[1])).toBe(true);
      expect(cmp(fixture).isSelected(USERS[0])).toBe(false);

      fixture.componentInstance.selectionMode.set('checkbox');
      fixture.componentInstance.values.set([1]);
      await apply(fixture);
      // The single `value` is still 2 here, and must be ignored — reading
      // the wrong one ticks a row nobody chose.
      expect(cmp(fixture).isSelected(USERS[0])).toBe(true);
      expect(cmp(fixture).isSelected(USERS[1])).toBe(false);
    });
  });

  describe('menuItemControl', () => {
    it.each([
      ['single', 'none'],
      ['checkbox', 'checkbox'],
      ['radio', 'radio'],
    ] as const)('maps %s to %s', async (mode, expected) => {
      const fixture = await setup();
      fixture.componentInstance.selectionMode.set(mode);
      await apply(fixture);
      // 'single' draws no control at all — a lone radio the user cannot
      // clear reads as a stuck control.
      expect(cmp(fixture).menuItemControl).toBe(expected);
    });
  });
});
