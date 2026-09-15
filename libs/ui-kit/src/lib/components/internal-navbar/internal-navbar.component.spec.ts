import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BapsInternalNavbar, InternalNavItem } from './internal-navbar.component';

/**
 * `baps-internal-navbar` is hand-rolled — no PrimeNG underneath — so nothing
 * here is covered upstream. Three things are pinned:
 *
 * 1. **The collapsed accessible name.** Under `brand="mybky"` the collapsed
 *    rail removes the label span from the DOM entirely (it is an `@if`, not a
 *    `display: none`), leaving an icon-only button whose accessible name is
 *    the empty string — every item announced as just "button". The fix was
 *    the conditional `[attr.aria-label]`, whose condition is a double negative
 *    (`!collapsed || brand === 'sampark' ? null : item.label`) that is very
 *    easy to invert while refactoring. Silent when broken: the buttons still
 *    render, still click, still look right.
 *
 * 2. **`itemClick` is the entire contract.** The component renders plain
 *    `<button>`s and never navigates; `routerLink` on `InternalNavItem` is
 *    inert data handed back to the consumer. Turning it into a real
 *    RouterLink would break every consumer's click handler at once.
 *
 * 3. **Separators are not buttons.** `{ separator: true }` must produce a
 *    presentational `<li>` with no focusable child, or keyboard users tab
 *    through empty rows.
 *
 * Note on the docs: `patterns/app-shell.mdx` claims "`itemClick` fires for
 * disabled items too". It does not — `onItemClick` guards, and the rendered
 * button is natively `[disabled]` as well. Both are asserted below so the
 * real behaviour is the tested one.
 */
const ITEMS: InternalNavItem[] = [
  { label: 'Dashboard', icon: 'pi-home', routerLink: '/dashboard' },
  { label: 'Members', icon: 'pi-users', badge: 3 },
  { separator: true, label: 'sep-1' },
  { label: 'Archived', icon: 'pi-box', disabled: true },
];

@Component({
  imports: [BapsInternalNavbar],
  template: `
    <baps-internal-navbar
      [items]="items()"
      [activeItem]="activeItem()"
      [collapsed]="collapsed()"
      [brand]="brand()"
      (itemClick)="clicked.push($event)"
    />
  `,
})
class Host {
  // Signals, not plain properties: the test env is zoneless, so mutating a
  // plain field and forcing detectChanges() trips NG0100 rather than
  // exercising a runtime input change the way a consuming app would.
  readonly items = signal<InternalNavItem[]>(ITEMS);
  readonly activeItem = signal<string | undefined>('Dashboard');
  readonly collapsed = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly clicked: InternalNavItem[] = [];
}

interface Overrides {
  items?: InternalNavItem[];
  activeItem?: string;
  collapsed?: boolean;
  brand?: 'mybky' | 'sampark';
}

async function setup(overrides: Overrides = {}) {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  if (overrides.items) host.items.set(overrides.items);
  if (overrides.activeItem !== undefined) host.activeItem.set(overrides.activeItem);
  if (overrides.collapsed !== undefined) host.collapsed.set(overrides.collapsed);
  if (overrides.brand) host.brand.set(overrides.brand);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function links(el: HTMLElement): HTMLButtonElement[] {
  return [...el.querySelectorAll<HTMLButtonElement>('.baps-internal-nav__link')];
}

describe('BapsInternalNavbar', () => {
  describe('itemClick', () => {
    it('emits the clicked item object', async () => {
      const fixture = await setup();
      links(fixture.nativeElement)[1].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.clicked.map((i) => i.label)).toEqual(['Members']);
    });

    it('runs an item command as well as emitting', async () => {
      const command = jest.fn();
      const fixture = await setup({ items: [{ label: 'Run', command }] });
      links(fixture.nativeElement)[0].click();
      await fixture.whenStable();
      expect(command).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.clicked.map((i) => i.label)).toEqual(['Run']);
    });

    it('does not emit for a disabled item, even when invoked directly', async () => {
      // The rendered button is natively [disabled], so a click is a no-op…
      const fixture = await setup();
      const disabledButton = links(fixture.nativeElement)[2]; // 'Archived'
      expect(disabledButton.disabled).toBe(true);
      disabledButton.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.clicked).toEqual([]);

      // …and the handler guards independently, so a programmatic call is a
      // no-op too. app-shell.mdx says the opposite; the code is the truth.
      const nav = fixture.debugElement.query(By.directive(BapsInternalNavbar))
        .componentInstance as BapsInternalNavbar;
      nav.onItemClick({ label: 'Archived', disabled: true });
      expect(fixture.componentInstance.clicked).toEqual([]);
    });

    it('never renders a RouterLink — routerLink stays inert data', async () => {
      const fixture = await setup();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('a')).toBeNull();
      expect(el.querySelector('[href]')).toBeNull();
      links(el)[0].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.clicked[0].routerLink).toBe('/dashboard');
    });
  });

  describe('active highlighting', () => {
    it('marks only the matching item active and gives it aria-current', async () => {
      const fixture = await setup();
      const el = fixture.nativeElement as HTMLElement;
      const active = el.querySelectorAll('.baps-internal-nav__item--active');
      expect(active.length).toBe(1);
      expect(active[0].textContent).toContain('Dashboard');
      expect(links(el)[0].getAttribute('aria-current')).toBe('page');
      expect(links(el)[1].getAttribute('aria-current')).toBeNull();
    });

    it('moves the highlight when activeItem changes at runtime', async () => {
      const fixture = await setup();
      fixture.componentInstance.activeItem.set('Members');
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      expect(links(el)[0].getAttribute('aria-current')).toBeNull();
      expect(links(el)[1].getAttribute('aria-current')).toBe('page');
    });

    it('highlights nothing when activeItem matches no item', async () => {
      const fixture = await setup({ activeItem: 'Nope' });
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.baps-internal-nav__item--active').length).toBe(0);
    });
  });

  describe('separators', () => {
    it('render as a presentational li with no focusable child', async () => {
      const fixture = await setup();
      const el = fixture.nativeElement as HTMLElement;
      const separators = el.querySelectorAll('.baps-internal-nav__separator');
      expect(separators.length).toBe(1);
      expect(separators[0].querySelector('button')).toBeNull();
      // 4 items, one of them a separator -> 3 buttons.
      expect(links(el).length).toBe(3);
    });
  });

  describe('collapsed accessible name (a11y regression)', () => {
    it('mybky + collapsed: label span is gone, so aria-label carries the name', async () => {
      const fixture = await setup({ collapsed: true });
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.baps-internal-nav__label')).toBeNull();
      expect(links(el).map((b) => b.getAttribute('aria-label'))).toEqual([
        'Dashboard',
        'Members',
        'Archived',
      ]);
    });

    it('sampark + collapsed: label span stays, so no overriding aria-label', async () => {
      // The Sampark rail is icon-over-label — the visible caption is the
      // accessible name, and an aria-label would silently replace it.
      const fixture = await setup({ collapsed: true, brand: 'sampark' });
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.baps-internal-nav__label').length).toBe(3);
      expect(links(el).every((b) => b.getAttribute('aria-label') === null)).toBe(true);
    });

    it('expanded: no aria-label and a visible label under either brand', async () => {
      for (const brand of ['mybky', 'sampark'] as const) {
        const fixture = await setup({ brand });
        const el = fixture.nativeElement as HTMLElement;
        expect(links(el).every((b) => b.getAttribute('aria-label') === null)).toBe(true);
        expect(el.querySelectorAll('.baps-internal-nav__label').length).toBe(3);
      }
    });

    it('adds and removes aria-label as collapsed toggles at runtime', async () => {
      const fixture = await setup();
      const el = fixture.nativeElement as HTMLElement;
      expect(links(el)[0].getAttribute('aria-label')).toBeNull();
      fixture.componentInstance.collapsed.set(true);
      await fixture.whenStable();
      expect(links(el)[0].getAttribute('aria-label')).toBe('Dashboard');
      fixture.componentInstance.collapsed.set(false);
      await fixture.whenStable();
      expect(links(el)[0].getAttribute('aria-label')).toBeNull();
    });
  });

  describe('nested levels', () => {
    // `children` was declared on InternalNavItem long before the template read
    // it — a dead API that advertised nesting it did not deliver. These pin
    // both halves of the fix: that nesting works, and that a flat menu (every
    // consumer that predates it) renders exactly as it did before.
    const NESTED: InternalNavItem[] = [
      {
        label: 'Events',
        children: [
          { label: 'Seminars', children: [{ label: 'Regional' }] },
          { label: 'Workshops' },
        ],
      },
      { label: 'Settings' },
    ];

    function labels(el: HTMLElement): string[] {
      return links(el).map((b) => b.textContent?.trim() ?? '');
    }

    it('renders only top-level items until a parent is expanded', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined });
      const el = fixture.nativeElement as HTMLElement;
      expect(labels(el)).toEqual(['Events', 'Settings']);
    });

    it('expands one level per click and collapses again', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined });
      const el = fixture.nativeElement as HTMLElement;

      links(el)[0].click(); // Events
      await fixture.whenStable();
      expect(labels(el)).toEqual(['Events', 'Seminars', 'Workshops', 'Settings']);

      links(el)[1].click(); // Seminars
      await fixture.whenStable();
      expect(labels(el)).toEqual(['Events', 'Seminars', 'Regional', 'Workshops', 'Settings']);

      links(el)[0].click(); // collapse Events — the whole subtree goes with it
      await fixture.whenStable();
      expect(labels(el)).toEqual(['Events', 'Settings']);
    });

    it('still emits itemClick for a parent — expanding is not instead of clicking', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined });
      links(fixture.nativeElement)[0].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.clicked.map((i) => i.label)).toEqual(['Events']);
    });

    it('tags each row with its depth (18px-per-level indent hook)', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined });
      const el = fixture.nativeElement as HTMLElement;
      links(el)[0].click();
      await fixture.whenStable();
      links(el)[1].click();
      await fixture.whenStable();

      const rows = [...el.querySelectorAll('.baps-internal-nav__item')];
      expect(rows.map((r) => r.getAttribute('data-level'))).toEqual([
        null, // Events    — level 0 renders no attribute at all
        '1', // Seminars
        '2', // Regional
        '1', // Workshops
        null, // Settings
      ]);
    });

    it('carries aria-expanded on parents only, and aria-level on every row', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined });
      const el = fixture.nativeElement as HTMLElement;

      expect(links(el).map((b) => b.getAttribute('aria-expanded'))).toEqual(['false', null]);

      links(el)[0].click();
      await fixture.whenStable();
      expect(links(el).map((b) => b.getAttribute('aria-expanded'))).toEqual([
        'true', // Events
        'false', // Seminars — a parent, still closed
        null, // Workshops — a leaf, so no aria-expanded at all
        null, // Settings
      ]);

      const rows = [...el.querySelectorAll('.baps-internal-nav__item')];
      expect(rows.map((r) => r.getAttribute('aria-level'))).toEqual(['1', '2', '2', '1']);
    });

    it('gives leaves an empty chevron slot so labels stay aligned', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined });
      const el = fixture.nativeElement as HTMLElement;
      // Both rows get a slot; only the leaf's is the hidden variant.
      expect(el.querySelectorAll('.baps-internal-nav__chevron').length).toBe(2);
      expect(el.querySelectorAll('.baps-internal-nav__chevron--empty').length).toBe(1);
    });

    it('leaves a flat menu byte-identical: no chevron slot, no aria-level', async () => {
      const fixture = await setup(); // the flat ITEMS fixture
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.baps-internal-nav__chevron')).toBeNull();
      expect(el.querySelector('[aria-level]')).toBeNull();
      expect(el.querySelector('[data-level]')).toBeNull();
      expect(links(el).every((b) => b.getAttribute('aria-expanded') === null)).toBe(true);
    });

    it('never nests while collapsed, and keeps the aria-label fix intact there', async () => {
      const fixture = await setup({ items: NESTED, activeItem: undefined, collapsed: true });
      const el = fixture.nativeElement as HTMLElement;

      links(el)[0].click(); // clicking a parent cannot expand a 56px rail
      await fixture.whenStable();
      expect(links(el).length).toBe(2);
      expect(el.querySelector('.baps-internal-nav__chevron')).toBeNull();
      // The collapsed-label a11y fix still applies to nested data.
      expect(links(el).map((b) => b.getAttribute('aria-label'))).toEqual(['Events', 'Settings']);
    });
  });

  describe('brand host class (§40)', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      const host = (fixture.nativeElement as HTMLElement).querySelector('baps-internal-navbar')!;
      expect(host.classList.contains('baps-sampark')).toBe(false);
      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });
  });
});
