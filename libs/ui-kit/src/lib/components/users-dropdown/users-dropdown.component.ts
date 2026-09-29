import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { BapsInputText } from '../form-field/directives/input-text.directive';
import { BapsMenuItem } from '../menu-item/menu-item.component';

/** One option in the Users Dropdown list. */
export interface BapsUserOption {
  value: unknown;
  title: string;
  subtitle?: string;
  /** Initials for the rose avatar box. */
  avatarLabel?: string;
  /** PrimeNG icon class for the neutral avatar box (e.g. 'pi-envelope'). */
  avatarIcon?: string;
  disabled?: boolean;
  /**
   * Optional section this user belongs to (Figma "♻️ Base User Item Group",
   * 13197:88606 — "Patients", "Doctors", …). Options sharing a group render
   * under one uppercase header; options without one render header-less, which
   * is what every pre-grouping consumer gets.
   */
  group?: string;
}

/** A run of options sharing one `group` label. Built by `BapsUsersDropdown.groups`. */
export interface BapsUserGroup {
  label?: string;
  items: BapsUserOption[];
}

/**
 * baps-users-dropdown — the Sampark Portal "Users Dropdown" (Figma 13197-89016).
 *
 * A select-style dropdown: a trigger field (same field language as the FormField
 * Sampark dropdowns) that opens a floating panel of searchable user rows
 * (baps-menu-item, avatar + name/role). Data-driven via `users`; the panel's
 * search filters by title/subtitle client-side. Selecting a row sets `value`,
 * fires `valueChange`, and closes.
 *
 * Panel chrome carries the soft dropdown shadow (CLAUDE.md: shadows only on
 * floating elements). Colours map to the Sampark palette; everything flows
 * through the --users-dropdown-* variables. Sizes estimated from the Figma
 * frames — reconcile against Dev Mode.
 */
@Component({
  selector: 'baps-users-dropdown',
  imports: [BapsInputText, BapsMenuItem],
  template: `
    <div class="ud" [class.ud--open]="open" [class.ud--disabled]="disabled">
      <button
        type="button"
        class="ud__trigger"
        [class.ud__trigger--placeholder]="!hasSelection"
        [disabled]="disabled"
        (click)="toggle()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open"
      >
        <span class="ud__trigger-label">{{ triggerLabel }}</span>
        <svg class="ud__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      @if (open) {
        <div
          class="ud__panel"
          role="listbox"
          [attr.aria-multiselectable]="selectionMode === 'checkbox' ? true : null"
        >
          <div class="ud__search">
            <input
              bapsInputText
              [fluid]="true"
              type="text"
              [placeholder]="searchPlaceholder"
              [value]="searchValue"
              (input)="onSearchInput($any($event.target).value)"
              [attr.aria-label]="searchPlaceholder"
            />
          </div>
          <div class="ud__list" [style.max-height]="maxHeight">
            @if (users && users.length > 0) {
              @for (g of groups; track g.label ?? $index) {
                <div class="ud__group" role="group" [attr.aria-label]="g.label || null">
                  @if (g.label) {
                    <div class="ud__group-title" aria-hidden="true">{{ g.label }}</div>
                  }
                  @for (u of g.items; track $index) {
                    <baps-menu-item
                      media="avatar"
                      [control]="menuItemControl"
                      [checked]="isSelected(u)"
                      [avatarLabel]="u.avatarLabel"
                      [avatarIcon]="u.avatarIcon"
                      [title]="u.title"
                      [subtitle]="u.subtitle"
                      [selected]="selectionMode === 'single' && u.value === value"
                      [disabled]="!!u.disabled"
                      (activated)="select(u)"
                    ></baps-menu-item>
                  }
                </div>
              } @empty {
                <div class="ud__empty">No results</div>
              }
            } @else {
              <ng-content></ng-content>
            }
          </div>
        </div>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-users-dropdown {
      --users-dropdown-width: 340px;
      --users-dropdown-radius: 12px;
      --users-dropdown-field-radius: 4px;
      --users-dropdown-field-height: 40px;
      --users-dropdown-bg: var(--color-sampark-mono-0, #ffffff);
      --users-dropdown-border: var(--color-sampark-border-default, #e1e0e0);
      --users-dropdown-border-hover: var(--color-sampark-border-hover, #94928f);
      --users-dropdown-text: var(--color-sampark-text-primary, #151414);
      --users-dropdown-placeholder: var(--color-sampark-text-placeholder, #979493);
      --users-dropdown-shadow: 0 8px 24px rgba(21, 20, 20, 0.12);
      display: inline-block;
    }

    baps-users-dropdown .ud {
      position: relative;
      display: inline-block;
      width: var(--users-dropdown-width);
      max-width: 100%;
      font-family: inherit;
      font-size: 14px;
    }

    /* Trigger field — mirrors the Sampark select/input field. */
    baps-users-dropdown .ud__trigger {
      box-sizing: border-box;
      width: 100%;
      height: var(--users-dropdown-field-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 12px;
      border: 1px solid var(--users-dropdown-border);
      border-radius: var(--users-dropdown-field-radius);
      background: var(--users-dropdown-bg);
      color: var(--users-dropdown-text);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    baps-users-dropdown .ud__trigger:hover:not(:disabled) { border-color: var(--users-dropdown-border-hover); }
    baps-users-dropdown .ud--open .ud__trigger { border-color: var(--users-dropdown-border-hover); }
    baps-users-dropdown .ud__trigger:focus-visible { outline: none; border-color: var(--users-dropdown-border-hover); box-shadow: 0 0 0 3px var(--color-sampark-secondary-0, #f2f1f0); }
    baps-users-dropdown .ud__trigger--placeholder .ud__trigger-label { color: var(--users-dropdown-placeholder); }
    baps-users-dropdown .ud--disabled .ud__trigger { cursor: not-allowed; background: var(--color-sampark-secondary-0, #f8f7f7); color: var(--users-dropdown-placeholder); }
    baps-users-dropdown .ud__trigger-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    baps-users-dropdown .ud__chevron { flex: none; width: 18px; height: 18px; color: var(--color-sampark-text-secondary, #595656); transition: transform 150ms ease; }
    baps-users-dropdown .ud--open .ud__chevron { transform: rotate(180deg); }

    /* Floating panel. */
    baps-users-dropdown .ud__panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 60;
      display: flex;
      flex-direction: column;
      background: var(--users-dropdown-bg);
      border: 1px solid var(--users-dropdown-border);
      border-radius: var(--users-dropdown-radius);
      box-shadow: var(--users-dropdown-shadow);
      overflow: hidden;
    }
    baps-users-dropdown .ud__search { padding: 12px; border-bottom: 1px solid var(--users-dropdown-border); }
    baps-users-dropdown .ud__list { overflow-y: auto; padding: 4px 0; }
    baps-users-dropdown .ud__list hr,
    baps-users-dropdown .users-dropdown-divider { border: none; border-top: 1px solid var(--users-dropdown-border); margin: 4px 0; }
    baps-users-dropdown .ud__empty { padding: 16px; text-align: center; color: var(--users-dropdown-placeholder); font-size: 13px; }

    /* Group section — Figma "♻️ Base User Item Group" (13197:88606).
       "Item Group" is py 8px; "Title Container" is a 24px row, px 12px,
       12px/600 uppercase at 0.6px tracking in Mono/60 (#9f9c9c, our
       --color-sampark-mono-60 / text-muted alias). A group with no label
       renders no header and no extra padding, so an ungrouped list keeps
       exactly the spacing it had before groups existed. */
    baps-users-dropdown .ud__group:has(.ud__group-title) { padding: 8px 0; }
    baps-users-dropdown .ud__group-title {
      display: flex;
      align-items: center;
      height: 24px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--color-sampark-text-muted, #9f9c9c);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Dark mode — Sampark has no dark palette yet; borrow the mybky mono darks. */
    .baps-dark baps-users-dropdown {
      --users-dropdown-bg: var(--color-mybky-mono-900, #181b1d);
      --users-dropdown-border: var(--color-mybky-mono-700, #3d4144);
      --users-dropdown-border-hover: var(--color-mybky-mono-500, #6f777d);
      --users-dropdown-text: var(--color-mybky-mono-50, #f8fafb);
      --users-dropdown-placeholder: var(--color-mybky-mono-400, #b6b6af);
      --users-dropdown-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    /* The light block above is authored in Sampark's palette (this is a
       Sampark-first component), so the MyBKY dark values alone left a
       Sampark-scoped instance on its light surface — a #f8f7f7 trigger with
       muted ink on it, 1.91:1. */
    .baps-dark :is(baps-users-dropdown.baps-sampark, .baps-ds-sampark baps-users-dropdown) {
      --users-dropdown-bg: var(--color-sampark-dark-surface-card, #2c2c2a);
      --users-dropdown-border: var(--color-sampark-dark-border-divider, #4a4947);
      --users-dropdown-border-hover: var(--color-sampark-dark-border-control, #94928f);
      --users-dropdown-text: var(--color-sampark-dark-text-primary, #f8f7f7);
      --users-dropdown-placeholder: var(--color-sampark-dark-text-muted, #b7b6b3);
    }
  `,
})
export class BapsUsersDropdown {
  /** Options rendered in the panel. */
  @Input() users: BapsUserOption[] = [];

  /** Trigger placeholder when nothing is selected. */
  @Input() placeholder = 'Select user';

  /** Search field placeholder. */
  @Input() searchPlaceholder = 'Search';

  /** Currently selected option value (poor-man two-way with valueChange). */
  @Input() value: unknown;

  /**
   * How rows are picked — Figma "♻️ Base User Item Group" Type dimension
   * (13197:88606): Member/Icon vs Member Check/Icon Check vs Member
   * Radio/Icon Radio.
   *
   * - `single`   — today's behaviour: no control, picking a row closes the panel.
   * - `checkbox` — multi-select via `values` / `valuesChange`; panel stays open.
   * - `radio`    — single-select via `value`, shown with a radio; panel stays
   *                open, because a radio list is something you scan and revise.
   *
   * The control itself is baps-menu-item's existing `control` input; this only
   * decides which value to pass it.
   */
  @Input() selectionMode: 'single' | 'checkbox' | 'radio' = 'single';

  /** Selected values for `selectionMode="checkbox"` (poor-man two-way with valuesChange). */
  @Input() values: unknown[] = [];

  /** Max height of the scrollable list before it scrolls. */
  @Input() maxHeight = '320px';

  @Input() disabled = false;

  /** Force the panel open (e.g. to document the panel design). */
  @Input() open = false;

  /** Current search query input value. */
  @Input() searchValue = '';

  @Output() valueChange = new EventEmitter<unknown>();
  @Output() valuesChange = new EventEmitter<unknown[]>();
  @Output() openChange = new EventEmitter<boolean>();
  @Output() searchChange = new EventEmitter<string>();

  // ElementRef untyped — the ui-kit tsconfig omits the DOM lib, so HTMLElement/
  // MouseEvent/Node aren't in scope; nativeElement is `any`, which is all we need.
  private readonly host = inject(ElementRef);

  get selected(): BapsUserOption | undefined {
    return this.users.find((u) => u.value === this.value);
  }

  /** `'none'` for single-select, otherwise baps-menu-item's own control name. */
  get menuItemControl(): 'none' | 'checkbox' | 'radio' {
    return this.selectionMode === 'single' ? 'none' : this.selectionMode;
  }

  get hasSelection(): boolean {
    return this.selectionMode === 'checkbox' ? this.values.length > 0 : !!this.selected;
  }

  get triggerLabel(): string {
    if (this.selectionMode === 'checkbox') {
      return this.values.length ? `${this.values.length} selected` : this.placeholder;
    }
    return this.selected?.title || this.placeholder;
  }

  isSelected(u: BapsUserOption): boolean {
    return this.selectionMode === 'checkbox'
      ? this.values.includes(u.value)
      : u.value === this.value;
  }

  /**
   * `filtered` bucketed by `group`, first-appearance order. Non-adjacent
   * options sharing a label land in the same bucket, so a header never
   * repeats — and an ungrouped list collapses to one label-less group,
   * which renders as a bare run of rows exactly as before.
   */
  get groups(): BapsUserGroup[] {
    const byLabel = new Map<string | undefined, BapsUserGroup>();
    const out: BapsUserGroup[] = [];
    for (const u of this.filtered) {
      let group = byLabel.get(u.group);
      if (!group) {
        group = { label: u.group, items: [] };
        byLabel.set(u.group, group);
        out.push(group);
      }
      group.items.push(u);
    }
    return out;
  }

  get filtered(): BapsUserOption[] {
    const q = this.searchValue.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        (u.subtitle?.toLowerCase().includes(q) ?? false),
    );
  }

  toggle(): void {
    if (this.disabled) return;
    this.setOpen(!this.open);
  }

  select(u: BapsUserOption): void {
    if (u.disabled) return;
    if (this.selectionMode === 'checkbox') {
      this.values = this.values.includes(u.value)
        ? this.values.filter((v) => v !== u.value)
        : [...this.values, u.value];
      this.valuesChange.emit(this.values);
      return; // multi-select: the panel stays open so more rows can be ticked
    }
    this.value = u.value;
    this.valueChange.emit(u.value);
    if (this.selectionMode === 'single') this.setOpen(false);
  }

  onSearchInput(val: string): void {
    this.searchValue = val;
    this.searchChange.emit(val);
  }

  private setOpen(next: boolean): void {
    if (this.open === next) return;
    this.open = next;
    if (!next) {
      this.searchValue = '';
      this.searchChange.emit('');
    }
    this.openChange.emit(next);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: { target: unknown }): void {
    if (this.open && !this.host.nativeElement.contains(event.target)) {
      this.setOpen(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.setOpen(false);
  }
}
