# Table, Panel, Dropdown & Filter Style Guide

BAPS Events UI / MyBKY project ke sabhi Tables, Panels, Dropdowns (Select / MultiSelect), Filters, aur SplitButton ke liye complete, unified design style guide niche detailed documented hai.

Yeh project ke global design system (`libs/ui-lib`) aur canonical rules (`.agents/rules/table-panel.md`) ke exact tokens aur classes par based hai.

## 📑 Table of Contents

1. [Shared Visual Language & Design Tokens](#1-shared-visual-language--design-tokens)
2. [List Page Shell (`.app-page`)](#2-list-page-shell-app-page)
3. [Table (`p-table` & `p-treeTable`) Style Guide](#3-table-p-table--p-treetable-style-guide)
4. [Panels & Overlays (`p-popover`, Drawers & Menus)](#4-panels--overlays-p-popover-drawers--menus)
5. [Dropdowns — `p-select` & `p-multiselect`](#5-dropdowns--p-select--p-multiselect)
6. [Filters UI & Architecture](#6-filters-ui--architecture)
7. [SplitButton (`p-splitbutton`) Style Guide](#7-splitbutton-p-splitbutton-style-guide)
8. [Pre-Merge Verification Checklist](#8-pre-merge-verification-checklist)

---

## 1. Shared Visual Language & Design Tokens

Project ke har list surface (table rows, dropdown items, popover options, filter checkboxes) par ek uniform rule lagta hai:

| State | Dropdown / Popover / Filter Option | Table Row |
| :--- | :--- | :--- |
| **Default** | `var(--card-background)`, text `var(--high-contrast-text-color)` (14px / 400) | `var(--card-background)` |
| **Hover** | `var(--p-primary-50)` bg + 3px left accent bar `var(--p-primary-600)` | `var(--perm-row-hover-bg)` (#fbfcfd, no accent bar) |
| **Selected** | Same as hover (`var(--p-primary-50)` + 3px left bar) | Selected row highlight |
| **Disabled** | `cursor: not-allowed`, background `--perm-row-alt-bg` | `.row--inactive` (`--perm-row-alt-bg`) |
| **Focus** | 2px `var(--p-primary-300)` outline, offset -2px | 2px `var(--p-primary-300)` outline, offset -2px |

### Global Dimension & Radius Rules
*   **Control Height:** 36px (2.25rem) — Inputs, buttons, `p-select`, `p-multiselect`, split button.
*   **Control Radius:** Pill 9999px (har input, select, button aur splitbutton pill shape hai).
*   **Overlay Panel Radius:** 1rem (16px) for Dropdowns, MultiSelect, Popovers, Sort overlay.
*   **Drawer Radius:** 2rem (32px) floating shell with 12px edge spacing and `blur(25px)` backdrop.
*   **Option Row Heights:**
    *   48px — `p-select` & `p-multiselect` options
    *   40px — `p-listbox`, sort radio options
    *   36px — `ui-filter-panel` checkboxes
*   **Panel Search Header:** Grey bar `var(--auth-background)` (#E4ECF1 Mono/20) + 8px padding + white pill input, placeholder "Search", no icon inside.

---

## 2. List Page Shell (`.app-page`)

Sabhi table screens ko standard `.app-page` shell use karna mandatory hai:

```html
<ng-container *transloco="let t">
  <div class="app-page">
    <header class="app-page__header">
      <div class="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <h1 class="app-page__title w-full lg:w-auto lg:flex-none">{{ t('feature.title') }}</h1>
        <!-- Toolbar Sequence: Search → Action / SplitButton → Sort → Filter -->
        <div class="flex flex-1 min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <ui-search-field
            class="w-full sm:flex-none sm:min-w-[10rem] sm:max-w-[21.875rem]"
            [value]="searchTerm()"
            (valueChange)="searchTerm.set($event)"
            (debouncedSearch)="onSearchDebounced()"
            fieldClass="w-full"
            inputClass="w-full"
            [placeholder]="t('common.search')"
            [ariaLabel]="t('feature.searchPlaceholder')"
          />
          <div class="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
            <!-- Primary Action (p-button ya p-splitbutton) -->
            <p-splitbutton
              *hasPermission="AppPermission.EventCreate"
              [label]="t('events.addEvent')"
              icon="pi pi-plus"
              [model]="addEventMenuItems"
              (onClick)="onAddPrimary()"
              menuStyleClass="bkyms-split-menu"
              appendTo="body"
            />
            <!-- Filter Panel Trigger -->
            <ui-filter-panel
              [groups]="filterGroups()"
              [value]="filterValue()"
              (applied)="onFiltersApplied($event)"
              (filtersCleared)="onFiltersCleared()"
            />
          </div>
        </div>
      </div>
    </header>
    @if (error()) {
      <div class="app-page__alert" role="alert" aria-live="assertive">{{ error() }}</div>
    }
    <!-- Table scroll zone -->
    <div class="app-page__body">
      <p-table …>…</p-table>
    </div>
    <!-- Paginator footer -->
    <footer class="app-page__footer">
      <ui-paginator
        [first]="currentFirst()"
        [rows]="pageSize"
        [totalRecords]="totalRecords()"
        [rowsPerPageOptions]="[10, 20, 50]"
        (pageChange)="onPaginatorChange($event)"
      />
    </footer>
  </div>
</ng-container>
```

> **Toolbar Order Rule:** Hamesha Left-to-Right order follow karein: Search → Primary Action (Button / SplitButton) → Sort → Filter. Icon-only buttons hamesha last me aate hain.

---

## 3. Table (`p-table` & `p-treeTable`) Style Guide

**Source file:** `_datatable.scss` & `_table-header.scss`

### 3.1 Mandatory Table Attributes

```html
<p-table
  [value]="rows()"
  [lazy]="true"                     <!-- Server-side data load -->
  [loading]="loading()"             <!-- Hamesha bind karein (skeleton/overlay) -->
  [paginator]="false"               <!-- HAMESHA false; pagination <ui-paginator> me hogi -->
  [rows]="pageSize"
  sortMode="multiple"               <!-- ya "single" -->
  [multiSortMeta]="multiSortMeta()"
  (onLazyLoad)="onLazyLoad($event)"
  [scrollable]="true"
  scrollHeight="flex"               <!-- Desktop par flex scroll -->
  dataKey="id"
  [attr.aria-label]="t('feature.title')"
>
```

### 3.2 Sortable Column Header Markup

Har sortable column me exact `sort-icon-group` markup hona chahiye:

```html
<th scope="col" class="col-name" pSortableColumn="displayName">
  {{ t('feature.name') }}
  <span class="sort-icon-group">
    <ng-icon name="tableSortDefault" class="sort-icon sort-icon--default" size="1.125rem" />
    <ng-icon name="tableSortAscending" class="sort-icon sort-icon--asc" size="1.125rem" />
    <ng-icon name="tableSortDescending" class="sort-icon sort-icon--desc" size="1.125rem" />
    <p-sortIcon field="displayName" /> <!-- Required inside: provides multi-sort count badge -->
  </span>
</th>
```

*   **Non-sortable column:** Simple `<th scope="col">{{ label }}</th>`.
*   **Centered column:** Class `th-center` add karein.
*   **Tree Table:** Same sort icon group, wrapped inside `<div class="col-header-content">` with `ttSortableColumn` + `<p-treeTableSortIcon>`.

### 3.3 Table Row & Cell Helpers

| Feature / Need | Template Markup | Description |
| :--- | :--- | :--- |
| **Clickable Row** | `<tr class="row--clickable" (click)="open(row)">` | Pointer cursor opt-in hai. |
| **Inactive Row** | `<tr class="row--inactive">` | `--perm-row-alt-bg` greyed background. |
| **Lead Cell (Avatar + Text)** | `<td><div class="cell-lead gap-2">…</div></td>` | Vertical centering ke liye full height flex. |
| **Secondary Subtext** | `<td class="cell-secondary">` | 14px, muted secondary color. |
| **Status Center Column** | `<td class="cell-status">` | Centered status dot/pill. Click stop propagation if interactive. |
| **Pill Tags Row** | `<div class="app-pill-row"><span class="app-pill app-pill--sm">…</span></div>` | Cells nowrap rahenge; pill wrap nahi hoga. |
| **Empty Value Dash** | `<span class="text-sm text-[var(--text-color-muted)]">-</span>` | Blank text ke jagah standard dash. |
| **Row Actions** | `<p-button severity="secondary" [text]="true" icon="pi pi-pencil" pTooltip="..." />` | Kebab menu ke liye `<p-menu [popup]="true" appendTo="body">`. |

### 3.4 Column Widths Specification

Feature SCSS me table override allow sirf column widths ke liye hoti hai:

```html
<ng-template pTemplate="colgroup">
  <colgroup>
    <col class="col-checkbox" />
    <col class="col-name" />
    <col class="col-role" />
    <col class="col-actions" />
  </colgroup>
</ng-template>
```

### 3.5 Table Empty State

Har table me `emptymessage` template mandatory hai:

```html
<ng-template pTemplate="emptymessage">
  <tr>
    <td [attr.colspan]="columnCount">
      <div class="dash-section-empty">
        <ng-icon name="events-no-action-mapped" class="dash-section-empty__icon" />
        <p class="dash-section-empty__title">{{ t('feature.empty') }}</p>
        <p class="dash-section-empty__desc">{{ t('feature.emptyHint') }}</p>
      </div>
    </td>
  </tr>
</ng-template>
```

### 3.6 Pagination — `<ui-paginator>`

*   Kabhi bhi `<p-paginator>` ya `[paginator]="true"` use na karein.
*   Always `<ui-paginator>` from `@bkyms/ui-lib`.
*   **State Preservation Rule:** Refresh, drawer close ya save hone par current search, sort, filter aur page retain rahega. Filter ya search change hone par `currentFirst.set(0)` reset karein.

---

## 4. Panels & Overlays (`p-popover`, Drawers & Menus)

**Source file:** `_popover.scss` & `_drawer.scss`

> ⚠️ **CRITICAL RULE:** Har panel, popover, multiselect overlay, select overlay aur menu par `appendTo="body"` lagana mandatory hai taaki parent container ya drawer ka `overflow: hidden` unhe clip na kare.

### 4.1 Search-Plus-List Picker Popover (`p-popover`)

Actions, Roles, Locations, Members pick karne ke liye standard pattern:

```html
<p-popover #op appendTo="body" styleClass="my-picker-overlay">
  <!-- Search Header -->
  <div class="my-picker-overlay__header my-picker-overlay__header--search-only">
    <ui-search-field
      class="my-picker-overlay__search"
      [uncontrolled]="true"
      [resetKey]="resetKey()"
      [icon]="''"
      (debouncedSearch)="query.set($event)"
      [placeholder]="t('common.search')"
    />
  </div>
  <!-- Scrollable List Area -->
  <div
    class="my-picker-overlay__list-wrap"
    [class.my-picker-overlay__list-wrap--fetching]="loading()"
  >
    <div class="my-picker-overlay__list" role="listbox">
      @for (item of items(); track item.id) {
        <div
          class="my-picker-overlay__item"
          [class.my-picker-overlay__item--selected]="isSel(item)"
          role="option"
          [attr.aria-selected]="isSel(item)"
          tabindex="0"
          (click)="toggle(item)"
          (keydown.enter)="toggle(item)"
        >
          <p-checkbox [binary]="true" [ngModel]="isSel(item)" />
          <span class="my-picker-overlay__item-name">{{ item.name }}</span>
        </div>
      } @empty {
        <div class="my-picker-overlay__empty">{{ t('common.noResults') }}</div>
      }
    </div>
    <!-- Loading State Overlay -->
    @if (loading()) {
      <div class="my-picker-overlay__list-loading">
        <i class="pi pi-spin pi-spinner"></i>
        <span>{{ t('common.loading') }}</span>
      </div>
    }
  </div>
  <!-- Optional Footer -->
  <div class="my-picker-overlay__footer">
    <p-button severity="secondary" [text]="true" [label]="t('common.cancel')" (onClick)="op.hide()" />
    <p-button [label]="t('common.apply')" (onClick)="onApply(); op.hide()" />
  </div>
</p-popover>
```

### 4.2 Floating Drawer Shell (`p-drawer`)

Side drawers (Filters, Create forms, Edit detail):

```html
<p-drawer
  [(visible)]="drawerVisible"
  position="right"
  [pt]="{ root: { class: 'app-drawer' } }"
  [style]="{ width: 'min(32rem, calc(100vw - 1.5rem))' }"
  [showCloseIcon]="false"
  [closeOnEscape]="false"
  [dismissible]="false"
>
  <ng-template pTemplate="header">
    <div class="drawer-form__header">
      <h2 class="p-drawer-title">{{ t('feature.drawerTitle') }}</h2>
      <div class="drawer-form__header-actions">
        <p-button severity="secondary" [text]="true" [label]="t('common.cancel')" (onClick)="close()" />
        <p-button [label]="t('common.save')" (onClick)="save()" [loading]="saving()" />
        <p-button severity="secondary" icon="pi pi-times" (onClick)="close()" />
      </div>
    </div>
  </ng-template>
  <div class="drawer-form__body">
    <!-- Form Content -->
  </div>
</p-drawer>
```

*   **Shell Features:** 12px outer gap, 2rem (32px) border-radius, 2rem padding, backdrop blur 25px.

---

## 5. Dropdowns — `p-select` & `p-multiselect`

**Source file:** `_select.scss`

Dono components ka base pill identical hai: 36px (2.25rem) height, 9999px border-radius, 14px text, 10px chevron in 28px hover circle.

### 5.1 Single Select (`p-select`)

```html
<p-select
  inputId="status-select"
  [options]="statusOptions()"
  optionLabel="label"
  optionValue="value"
  [placeholder]="t('feature.selectStatus')"
  styleClass="w-full"
  appendTo="body"               <!-- Mandatory -->
  [filter]="statusOptions().length > 8"
  filterPlaceholder="Search"    <!-- lowercase 'h' -->
  [showClear]="true"
/>
```

### 5.2 MultiSelect (`p-multiselect`)

```html
<p-multiselect
  inputId="roles-select"
  filterPlaceHolder="Search"    <!-- CAPITAL 'H' in p-multiselect (PrimeNG API) -->
  [resetFilterOnHide]="true"
  [options]="roleOptions()"
  optionLabel="label"
  optionValue="value"
  display="chip"                <!-- HAMESHA chip display -->
  [placeholder]="t('feature.selectRoles')"
  styleClass="w-full"
  [showClear]="true"
  appendTo="body"               <!-- Mandatory -->
>
  <ng-template pTemplate="selectedItems" let-selected>
    @if (selected?.length) {
      <span class="ms-chips" appChipOverflow>
        @for (item of selected; track item.value) {
          <p-chip [label]="item.label" data-chip styleClass="ms-chip" />
        }
        <span class="ms-chip ms-chip--overflow" data-chip-overflow hidden></span>
      </span>
    }
  </ng-template>
</p-multiselect>
```

**MultiSelect Key Rules:**
1.  Hamesha `display="chip"` + `appChipOverflow` directive use karein taaki chips single line me fit hon aur excess +N pill me convert hon.
2.  `data-chip` attribute har chip par aur `data-chip-overflow` counter span par lagna jaruri hai.
3.  PrimeNG attribute casing yaad rakhein:
    *   `p-select`: `filterPlaceholder="Search"` (lowercase h)
    *   `p-multiselect`: `filterPlaceHolder="Search"` (capital H)
4.  **Dropdown Panel me:**
    *   Row 1: Grey search header (order -1)
    *   Row 2: 48px "Select All" checkbox (order 0)
    *   Options: 48px fixed height with 3px left primary accent bar on hover/selected.

---

## 6. Filters UI & Architecture

**Source file:** `filter-panel.component.ts` & `_event-shared.scss`

### 6.1 Filter Drawer — `<ui-filter-panel>` (Default for Table Screens)

Table list screens par categorical filters ke liye default standard component:

*   **Trigger Button:** 36×36 circle secondary icon button (`solarFilterLinear`).
*   **Active Badge:** `p-overlaybadge` severity="danger" selected filter groups count show karta hai.
*   **Drawer Panels:** Collapsible accordion sections jisme 40px count bubbles hote hain.
*   **Options Grid:** 2-column checkbox grid (36px height).
*   **Date Range:** `p-datepicker` selectionMode="range" dateFormat="dd M, yy".
*   **Draft State:** User jab tak "Apply" par click nahi karta, tab tak live grid par filters apply nahi hote. Cancel/Close draft ko discard kar deta hai.

```typescript
// Component Setup:
readonly filterGroups = computed<FilterGroup[]>(() => [
  { key: 'status', label: this.t.translate('common.status'), options: this.statusOptions() },
  { key: 'category', label: this.t.translate('events.category'), options: this.categoryOptions() }
]);

onFiltersApplied(value: FilterValue): void {
  this.filterValue.set(value);
  this.currentFirst.set(0); // Reset page to 0
  this.loadList();          // Preserves current search & sort
}

onFiltersCleared(): void {
  this.filterValue.set({});
  this.currentFirst.set(0);
  this.loadList();
}
```

### 6.2 Active Filter Chips Bar (Collapsible Bar Below Toolbar)

User ko applied filters dekhne aur individual chip remove karne ke liye:

```html
<div class="filter-bar-wrap" [class.filter-bar-wrap--collapsed]="!hasActiveFilters()">
  <div class="filter-bar">
    <ng-icon name="solarFilterLinear" class="filter-bar__icon" />
    <div class="filter-bar__chips">
      @for (chip of activeChips(); track chip.key) {
        <span class="filter-chip">
          <span class="filter-chip__title">{{ chip.label }}</span>
          <button
            type="button"
            class="filter-chip__close"
            (click)="removeChip(chip)"
            [attr.aria-label]="'Remove ' + chip.label"
          >
            ×
          </button>
        </span>
      }
    </div>
    <button type="button" class="clear-all-btn" (click)="onFiltersCleared()">
      {{ t('filterPanel.clearAll') }}
    </button>
  </div>
</div>
```

**Show/Hide Transition CSS (Grid Row Pattern — Clips free, dropdown safe):**

```scss
.filter-bar-wrap {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition: grid-template-rows 0.22s ease, opacity 0.18s ease;
  &--collapsed {
    grid-template-rows: 0fr;
    opacity: 0;
    pointer-events: none;
  }
}

.filter-bar {
  min-height: 0; // Required for grid row collapse
  // Never add overflow: hidden here (dropdowns must escape)
}
```

---

## 7. SplitButton (`p-splitbutton`) Style Guide

**Source file:** `_split-button.scss`

Jab ek primary action aur 1 se 4 related secondary actions hon (e.g., "Add Event" + "Create Cluster Event"), tab `p-splitbutton` use hota hai.

### 7.1 Template & TypeScript Wiring

```html
<p-splitbutton
  *hasPermission="AppPermission.EventCreate"
  [label]="t('events.addEvent')"
  icon="pi pi-plus"
  [model]="addEventMenuItems"
  (onClick)="onPrimaryClick()"
  menuStyleClass="bkyms-split-menu"   <!-- MANDATORY: Themed overlay menu -->
  appendTo="body"                     <!-- MANDATORY: Prevents clipping -->
  [disabled]="saving()"
/>
```

```typescript
readonly addEventMenuItems: MenuItem[] = [
  {
    label: this.t.translate('events.createCluster'),
    icon: 'events-create-cluster',
    command: () => this.createClusterEvent(),
    // Individual item permission gating
    visible: this.authService.hasPermission(AppPermission.ClusterCreate)
  }
];
```

### 7.2 Variants & Tokens Matrix

| Variant | Configuration | Appearance (Default) | Hover State | Divider (Trigger Left Border) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Default (no severity) | 135° Gradient `#5F7888` → `#384871`, White text | Reverse gradient `#384871` → `#5F7888` on hovered half | 1px solid `var(--split-btn-primary-divider)` (#9FADD9 Primary/40) |
| **Secondary** | `severity="secondary"` | White bg, 1px solid `#E4ECF1` border, `#181B1D` text | `#E4ECF1` (Mono/20) on hovered half | 1px solid `var(--split-btn-secondary-divider)` (#E4ECF1) |
| **Disabled** | `[disabled]="true"` | Primary: 10% opacity, border `#E4ECF1`, text `#9F9C9C`. Secondary: `#F8FAFB` bg | No hover change (not-allowed, pointer-events: none) | 1px solid `var(--split-btn-disabled-divider)` (#E4ECF1) |

> **Independent Hover Behavior:** Main button (left half) aur Trigger chevron (right half) independently hover hote hain. Agar user left part hover karta hai, to sirf left part reverse gradient leta hai; right trigger hover karne par right part reverse gradient leta hai.

### 7.3 Sizes Matrix

| Size | Code Binding | Container Height | Typography / Font Size |
| :--- | :--- | :--- | :--- |
| **S (Small)** | `size="small"` | 32px (2rem) | 14px (0.875rem / Semi Bold) |
| **M (Default)** | (default) | 36px (2.25rem) | 14px (0.875rem / Semi Bold) |
| **L (Large)** | `size="large"` | 36px (2.25rem) | 16px (1rem / Semi Bold) |
| **XL (Extra Large)** | `styleClass="p-splitbutton-xl"` | 42px (2.625rem) | 16px (1rem) |

### 7.4 Internal Padding & Radius Specifications

*   **Outer Pill Container:** `border-radius: 99px; overflow: hidden;`
*   **Main Button Half:** Padding: Top 8px, Right 16px, Bottom 8px, Left 16px. Gap: 4px.
*   **Trigger Chevron Half:** Padding: Top 8px, Right 16px, Bottom 8px, Left 12px (Figma confirmed). Gap: 4px.

### 7.5 Dropdown Menu Panel (`.bkyms-split-menu`)

*   `min-width: 13rem; border-radius: 0.75rem; background: var(--event-overlay-bg);`
*   **Border:** `1px solid var(--event-overlay-border);`
*   **Dual Drop Shadow:** `var(--event-overlay-shadow);`
*   **Option Items:** 14px/500, padding 0.625rem 0.875rem, gap 0.625rem, border-radius 0.5rem.
*   **Item Hover:** `var(--p-surface-100)`.
*   **Custom SVG Icon Support:** SVG mask rule jaise `.events-create-cluster` color `currentColor` inherit karta hai.

### 7.6 Mobile Responsiveness (≤480px)

Jab screen width `<= 480px` hoti hai, tab SplitButton ka text label automatically hide ho jata hai:

```scss
@media (max-width: 480px) {
  .p-splitbutton .p-splitbutton-button .p-button-label {
    display: none;
  }
}
```

> **Rule:** Isliye SplitButton par hamesha icon specify karein (`icon="pi pi-plus"` ya custom icon), taaki mobile view par icon + chevron render ho sake.

---

## 8. Pre-Merge Verification Checklist

Kisi bhi Table, Dropdown, Panel, Filter ya SplitButton ko commit/merge karne se pehle ye verify karein:

- [ ] **Page Shell:** `.app-page` shell used; Header toolbar order: Search → Action/SplitButton → Sort → Filter.
- [ ] **Table Attributes:** `[loading]`, `scrollHeight="flex"`, `[paginator]="false"` present.
- [ ] **Pagination:** `<ui-paginator>` used inside `.app-page__footer` (never `<p-paginator>`).
- [ ] **Sort Icons:** Har sortable `th` me `sort-icon-group` markup with `<p-sortIcon>` inside.
- [ ] **Empty State:** `pTemplate="emptymessage"` with `.dash-section-empty` present.
- [ ] **Overlay Attachment:** Har `p-select`, `p-multiselect`, `p-popover`, `p-menu`, aur `p-splitbutton` par `appendTo="body"` laga hai.
- [ ] **MultiSelect Settings:** `filterPlaceHolder="Search"` (capital H), `[resetFilterOnHide]="true"`, `display="chip"` + `appChipOverflow`.
- [ ] **Filter Grid:** Filters apply/clear hone par `currentFirst.set(0)` reset hota hai aur existing search/sort preserve rehta hai.
- [ ] **SplitButton Settings:** `menuStyleClass="bkyms-split-menu"` aur `appendTo="body"` added; mobile ≤480px par icon available hai.
- [ ] **Zero Hex Colors:** Feature SCSS me koi hardcoded hex colors ya `::ng-deep` nahi hain; tokens `var(--p-*)` ya `_light.scss` se liye gaye hain.
- [ ] **Translations & Tests:** Sabhi labels Transloco ke through hain aur co-located `.spec.ts` unit tests updated hain.
