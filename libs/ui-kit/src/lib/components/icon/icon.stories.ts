import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, computed, signal } from '@angular/core';
import { BapsIcon } from './icon.component';
import { BAPS_ALL_ICON_NAMES, type BapsIconName } from './icon-set';

/**
 * Host for the searchable icon gallery.
 *
 * A host component rather than a template-only story: the filter text and the
 * per-tile "Copied" flash are STATE, and a template with no class behind it
 * cannot hold either.
 *
 * clipboard.writeText is promise-based and can reject — a page served over
 * plain http, or a browser withholding the permission. The flash is therefore
 * set in BOTH branches: a tile that silently does nothing is worse than one
 * that flashes when the clipboard refused, and the name is on the tile to read
 * either way.
 */
@Component({
  selector: 'baps-icon-gallery',
  imports: [BapsIcon],
  template: `
    <div class="ig">
      <label class="ig__search">
        <baps-icon name="search-2" size="sm" />
        <input
          type="search"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          placeholder="Search an icon"
          aria-label="Search icons by name"
        />
        <span class="ig__count">{{ shown().length }} / {{ total }}</span>
      </label>

      @if (shown().length) {
        <div class="ig__grid">
          @for (n of shown(); track n) {
            <button
              type="button"
              class="ig__tile"
              [class.ig__tile--copied]="copied() === n"
              [attr.aria-label]="'Copy ' + n"
              (click)="copy(n)"
            >
              @if (copied() === n) {
                <baps-icon name="check" size="lg" />
                <code>Copied</code>
              } @else {
                <baps-icon [name]="n" size="lg" />
                <code>{{ n }}</code>
              }
            </button>
          }
        </div>
      } @else {
        <p class="ig__empty">No icon matches that name.</p>
      }
    </div>
  `,
  styles: `
    .ig { display: flex; flex-direction: column; gap: 1rem; }

    .ig__search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 0.75rem;
      height: 2.75rem;
      border: 1px solid #e4ecf1;
      border-radius: 8px;
      background: #fff;
      color: #6f777d;
    }
    .ig__search:focus-within { border-color: #5f78b8; }
    .ig__search input {
      flex: 1 1 auto;
      min-width: 0;
      border: 0;
      outline: none;
      background: none;
      font: inherit;
      font-size: 0.875rem;
      color: #181b1d;
    }
    .ig__count { font-size: 0.75rem; font-variant-numeric: tabular-nums; white-space: nowrap; }

    .ig__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
    }

    .ig__tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 5.5rem;
      padding: 0.75rem 0.5rem;
      border: 1px solid #e4ecf1;
      border-radius: 8px;
      background: #fff;
      color: #181b1d;
      font: inherit;
      cursor: pointer;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    .ig__tile code {
      font-size: 0.6875rem;
      color: #6f777d;
      text-align: center;
      overflow-wrap: anywhere;
    }

    /* Only the GLYPH scales on hover, never the tile. A tile that grew would
       reflow the grid under the cursor and the pointer would land on a
       different icon than the one it was over. */
    .ig__tile baps-icon { transition: transform 140ms cubic-bezier(0.16, 1, 0.3, 1); }
    .ig__tile:hover { border-color: #9fadd9; box-shadow: 0 2px 6px rgba(16, 24, 40, 0.08); }
    .ig__tile:hover baps-icon { transform: scale(1.45); }
    .ig__tile:focus-visible { outline: 2px solid #5f78b8; outline-offset: 2px; }

    .ig__tile--copied {
      border-color: #089152;
      color: #089152;
      background: #f1f9f4;
    }
    .ig__tile--copied code { color: #089152; }
    .ig__tile--copied baps-icon { transform: none; }

    .ig__empty { font-size: 0.875rem; color: #6f777d; }

    @media (prefers-reduced-motion: reduce) {
      .ig__tile baps-icon { transition: none; }
      .ig__tile:hover baps-icon { transform: none; }
    }
  `,
})
class IconGallery {
  protected readonly total = BAPS_ALL_ICON_NAMES.length;
  protected readonly query = signal('');
  protected readonly copied = signal<BapsIconName | null>(null);

  protected readonly shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? BAPS_ALL_ICON_NAMES.filter((n) => n.includes(q)) : BAPS_ALL_ICON_NAMES;
  });

  private timer?: ReturnType<typeof setTimeout>;

  protected copy(name: BapsIconName): void {
    const flash = () => {
      this.copied.set(name);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(null), 1200);
    };
    const write = navigator.clipboard?.writeText(name);
    if (write) write.then(flash, flash);
    else flash();
  }
}

const meta: Meta<BapsIcon> = {
  title: 'Components/Atoms/Icon',
  // Pinned so the categorised title does not move the docs URL.
  id: 'components-icon',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    // Design tab — the Figma frame this component implements.
    // Harvested from icon.mdx, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/%F0%9F%9F%A2-Sampark-Portal?node-id=13193-56731' },
  },
  component: BapsIcon,
  decorators: [moduleMetadata({ imports: [BapsIcon, IconGallery] })],
  argTypes: {
    name: { control: 'select', options: BAPS_ALL_ICON_NAMES },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    label: { control: 'text' },
  },
  args: {
    name: 'notification',
    size: 'lg',
  },
};
export default meta;

type Story = StoryObj<BapsIcon>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:flex-end; gap:1.5rem;">
        @for (s of sizes; track s) {
          <div style="display:flex; flex-direction:column; align-items:center; gap:.5rem;">
            <baps-icon name="notification" [size]="s" />
            <span style="font-size:12px; color:#6f777d;">{{ s }}</span>
          </div>
        }
      </div>
    `,
    props: { sizes: ['xs', 'sm', 'md', 'lg', 'xl'] },
  }),
};

export const InheritsColour: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:2rem; align-items:center;">
        <span style="color:#c96868; display:inline-flex; align-items:center; gap:.4rem;">
          <baps-icon name="trash" size="md" /> Sampark maroon
        </span>
        <span style="color:#5f78b8; display:inline-flex; align-items:center; gap:.4rem;">
          <baps-icon name="info-circle" size="md" /> MyBKY blue
        </span>
        <span style="color:#089152; display:inline-flex; align-items:center; gap:.4rem;">
          <baps-icon name="check-circle" size="md" /> Success
        </span>
      </div>
    `,
  }),
};

/**
 * The whole set, searchable. Type to filter by name, hover to enlarge a glyph,
 * click a tile to copy its name to the clipboard.
 *
 * A host component rather than a template-only story: the filter and the
 * per-tile "Copied" flash are STATE, and a template with no class behind it
 * cannot hold either. Search matches on the name only — the names are the API,
 * so that is the thing worth finding.
 */
export const Library: Story = {
  render: () => ({ template: `<baps-icon-gallery />` }),
};

export const Labelled: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:1.5rem; align-items:center;">
        <button type="button" aria-label="Delete" style="display:inline-flex; padding:.5rem; border:1px solid #e4ecf1; border-radius:6px; background:none; cursor:pointer;">
          <baps-icon name="trash" size="md" label="Delete" />
        </button>
        <span style="display:inline-flex; align-items:center; gap:.4rem;">
          <baps-icon name="user" size="md" /> Decorative — hidden from screen readers
        </span>
      </div>
    `,
  }),
};
