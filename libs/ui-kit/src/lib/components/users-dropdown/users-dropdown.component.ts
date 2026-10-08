import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { BapsInputText } from '../form-field/directives/input-text.directive';
import { BapsMenuItem } from '../menu-item/menu-item.component';

export interface BapsUserOption {
  value: unknown;
  title: string;
  subtitle?: string;
  avatarLabel?: string;
  avatarIcon?: string;
  disabled?: boolean;
  group?: string;
}

export interface BapsUserGroup {
  label?: string;
  items: BapsUserOption[];
}

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
        <svg
          class="ud__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      @if (open) {
        <div
          class="ud__panel"
          role="listbox"
          [attr.aria-multiselectable]="
            selectionMode === 'checkbox' ? true : null
          "
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
                <div
                  class="ud__group"
                  role="group"
                  [attr.aria-label]="g.label || null"
                >
                  @if (g.label) {
                    <div class="ud__group-title" aria-hidden="true">
                      {{ g.label }}
                    </div>
                  }
                  @for (u of g.items; track $index) {
                    <baps-menu-item
                      media="avatar"
                      [brand]="brand"
                      [control]="menuItemControl"
                      [checked]="isSelected(u)"
                      [avatarLabel]="u.avatarLabel"
                      [avatarIcon]="u.avatarIcon"
                      [title]="u.title"
                      [subtitle]="u.subtitle"
                      [selected]="
                        selectionMode === 'single' && u.value === value
                      "
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
  styleUrls: ['../../styles/components/users-dropdown/_users-dropdown.scss'],
  host: {
    '[class.baps-mybky]': "brand === 'mybky'",
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsUsersDropdown {
  @Input() users: BapsUserOption[] = [];
  @Input() placeholder = 'Select user';
  @Input() searchPlaceholder = 'Search';
  @Input() value: unknown;
  @Input() selectionMode: 'single' | 'checkbox' | 'radio' = 'single';
  @Input() values: unknown[] = [];
  @Input() maxHeight = '320px';
  @Input() disabled = false;
  @Input() open = false;
  @Input() searchValue = '';
  @Input() brand: 'mybky' | 'sampark' = 'sampark';
  @Output() valueChange = new EventEmitter<unknown>();
  @Output() valuesChange = new EventEmitter<unknown[]>();
  @Output() openChange = new EventEmitter<boolean>();
  @Output() searchChange = new EventEmitter<string>();

  private readonly host = inject(ElementRef);

  get selected(): BapsUserOption | undefined {
    return this.users.find((user) => user.value === this.value);
  }

  get menuItemControl(): 'none' | 'checkbox' | 'radio' {
    return this.selectionMode === 'single' ? 'none' : this.selectionMode;
  }

  get hasSelection(): boolean {
    return this.selectionMode === 'checkbox'
      ? this.values.length > 0
      : !!this.selected;
  }

  get triggerLabel(): string {
    if (this.selectionMode === 'checkbox') {
      return this.values.length
        ? `${this.values.length} selected`
        : this.placeholder;
    }
    return this.selected?.title || this.placeholder;
  }

  isSelected(user: BapsUserOption): boolean {
    return this.selectionMode === 'checkbox'
      ? this.values.includes(user.value)
      : user.value === this.value;
  }

  get groups(): BapsUserGroup[] {
    const byLabel = new Map<string | undefined, BapsUserGroup>();
    const result: BapsUserGroup[] = [];
    for (const user of this.filtered) {
      let group = byLabel.get(user.group);
      if (!group) {
        group = { label: user.group, items: [] };
        byLabel.set(user.group, group);
        result.push(group);
      }
      group.items.push(user);
    }
    return result;
  }

  get filtered(): BapsUserOption[] {
    const query = this.searchValue.trim().toLowerCase();
    if (!query) return this.users;
    return this.users.filter(
      (user) =>
        user.title.toLowerCase().includes(query) ||
        (user.subtitle?.toLowerCase().includes(query) ?? false),
    );
  }

  toggle(): void {
    if (!this.disabled) this.setOpen(!this.open);
  }

  select(user: BapsUserOption): void {
    if (user.disabled) return;
    if (this.selectionMode === 'checkbox') {
      this.values = this.values.includes(user.value)
        ? this.values.filter((value) => value !== user.value)
        : [...this.values, user.value];
      this.valuesChange.emit(this.values);
      return;
    }
    this.value = user.value;
    this.valueChange.emit(user.value);
    if (this.selectionMode === 'single') this.setOpen(false);
  }

  onSearchInput(value: string): void {
    this.searchValue = value;
    this.searchChange.emit(value);
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
    if (this.open && !this.host.nativeElement.contains(event.target))
      this.setOpen(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.setOpen(false);
  }
}
