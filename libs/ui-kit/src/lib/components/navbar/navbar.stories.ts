import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { moduleMetadata } from '@storybook/angular';
import { BapsNavbar } from './navbar.component';
import { BapsAvatar } from '../avatar/avatar.component';

/**
 * Navbar — the top application bar.
 *
 * The two brands are different bars, not two tints of one:
 *
 * - **MyBKY** — white, 56px, hairline bottom border.
 * - **Sampark** — spm-ui's `app-topbar`: dark (Secondary/100 `#1d1c1b`), **50px**.
 *
 * The 50px Sampark height is a contract with the consuming app's layout math —
 * see the component doc before re-pointing `--navbar-height`.
 *
 * **The chevron is off by default**, because that is what the running app shows:
 * slim-plus hides `.layout-menu-button` at ≥768px, so it only appears on mobile.
 * `[menuButton]` opts it in — see `SamparkMenuStates`.
 */
/**
 * The stacked name/scope block on the right of the live bar is *app* content,
 * not a design-system primitive — the navbar just projects it. Upstream builds
 * it from PrimeFlex utilities (`flex flex-column align-items-end`, `text-sm`,
 * `text-color-secondary`); these stories are not in a PrimeFlex context, so the
 * equivalent is declared once here and shared.
 */
const USER_BLOCK_CSS = `
  <style>
    .sb-navbar-user {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.3;
    }
    .sb-navbar-user__name { font-size: 0.875rem; font-weight: 600; }
    .sb-navbar-user__scope { font-size: 0.75rem; opacity: 0.65; }
  </style>
`;

/** The component's inputs plus the output spies these stories bind. */
type Args = BapsNavbar & Record<'onMenuToggle' | 'onMobileMenuToggle', (event?: unknown) => void>;

const meta: Meta<Args> = {
  title: 'Components/Organisms/Navbar',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-menu-navbar.
  id: 'components-navbar',
  component: BapsNavbar,
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsNavbar, BapsAvatar] })],
  argTypes: {
    menuToggle: { control: false },
    mobileMenuToggle: { control: false },
    brand: { control: 'radio', options: ['mybky', 'sampark'] },
    topbarTheme: { control: 'radio', options: ['indigo', 'light'] },
    menuButton: { control: 'boolean' },
    menuOpen: { control: 'boolean' },
    mobileMenuOpen: { control: 'boolean' },
    title: { control: 'text' },
    version: { control: 'text' },
    logo: { control: 'text' },
  },
  args: {
    topbarTheme: 'indigo',
    title: 'Sampark',
    version: 'v1.1.0',
    menuButton: false,
    menuOpen: false,
    mobileMenuOpen: false,
  },
  render: (args) => ({
    props: { ...args, onMenuToggle: action('menuToggle'), onMobileMenuToggle: action('mobileMenuToggle') },
    template: `
      <baps-navbar
        [brand]="brand"
        [topbarTheme]="topbarTheme"
        [title]="title"
        [version]="version"
        [logo]="logo"
        [menuButton]="menuButton"
        [menuOpen]="menuOpen"
        [mobileMenuOpen]="mobileMenuOpen"
      
        (menuToggle)="onMenuToggle($event)"
        (mobileMenuToggle)="onMobileMenuToggle($event)">
        <span navbar-end class="sb-navbar-user">
          <span class="sb-navbar-user__name">System Admin 8</span>
          <span class="sb-navbar-user__scope">North America</span>
        </span>
        <baps-avatar navbar-end size="m" label="HP"></baps-avatar>
      </baps-navbar>
      ${USER_BLOCK_CSS}
    `,
  }),
};

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

/**
 * The reference render — matched against a screenshot of the running app:
 * dark 50px bar, `Sampark` wordmark + `v1.1.0` badge, and on the right the
 * stacked `System Admin 8` / `North America` block beside a square avatar.
 *
 * No chevron: slim-plus hides `.layout-menu-button` at ≥768px, so the desktop
 * bar has none.
 */
export const Sampark: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="baps-ds-sampark">
        <baps-navbar brand="sampark" title="Sampark" version="v1.1.0">
          <span navbar-end class="sb-navbar-user">
            <span class="sb-navbar-user__name">System Admin 8</span>
            <span class="sb-navbar-user__scope">North America</span>
          </span>
          <baps-avatar navbar-end brand="sampark" size="m" label="HP"></baps-avatar>
        </baps-navbar>
      </div>
      ${USER_BLOCK_CSS}
    `,
  }),
};

/**
 * `topbarTheme="light"` — the bar as it renders at `localhost:4200`: white,
 * maroon wordmark, dark text.
 *
 * ⚠️ Reconstructed from a screenshot, not from stylesheet source. The written
 * spec documents only the indigo theme, whose `--header-menu-bg` is `#1d1c1b`
 * with a `var(--white)` wordmark. The exact maroon is eyeballed against the
 * Sampark palette — reconcile before relying on it.
 */
export const SamparkLightTopbar: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="baps-ds-sampark">
        <baps-navbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0">
          <span navbar-end class="sb-navbar-user">
            <span class="sb-navbar-user__name">System Admin 8</span>
            <span class="sb-navbar-user__scope">North America</span>
          </span>
          <baps-avatar navbar-end brand="sampark" size="m" label="HP"></baps-avatar>
        </baps-navbar>
      </div>
      ${USER_BLOCK_CSS}
    `,
  }),
};

/** indigo vs light, same geometry — only the colour axis differs. */
export const SamparkTopbarThemes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="baps-ds-sampark" style="display:flex;flex-direction:column;gap:1.5rem;">
        <baps-navbar brand="sampark" topbarTheme="indigo" title="Sampark" version="v1.1.0" [menuButton]="true"></baps-navbar>
        <baps-navbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" [menuButton]="true"></baps-navbar>
      </div>
    `,
  }),
};

/**
 * Chevron rotation. `menuOpen` only drives the icon — the sidebar is the
 * consumer's state, pushed back through `(menuToggle)`.
 */
export const SamparkMenuStates: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="baps-ds-sampark" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <baps-navbar brand="sampark" title="Sampark" [menuButton]="true" [menuOpen]="false"></baps-navbar>
        <baps-navbar brand="sampark" title="Sampark" [menuButton]="true" [menuOpen]="true"></baps-navbar>
      </div>
    `,
  }),
};

/**
 * **Narrow the browser below 768px to see this story do anything.**
 *
 * The mobile rules are a `@media (max-width: 767px)` query — matching
 * spm-ui's `_responsive.scss` and the rest of the app's chrome — so they key
 * off the *viewport*, not this frame. A fixed-width wrapper here would look
 * like a mobile simulation while actually rendering the desktop bar.
 * Simulating it properly needs `@storybook/addon-viewport`, which this
 * workspace does not install.
 *
 * Below the breakpoint: the start block grows to 4rem full-width, the chevron
 * rejoins the flow, and the actions row collapses behind the mobile button —
 * shown here already expanded via `mobileMenuOpen`.
 */
export const SamparkMobile: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="baps-ds-sampark">
        <baps-navbar brand="sampark" title="Sampark" version="DEV" [menuButton]="true" [mobileMenuOpen]="true">
          <button navbar-end type="button" aria-label="Notifications">
            <i class="pi pi-bell"></i>
          </button>
          <button navbar-end type="button" aria-label="Settings">
            <i class="pi pi-cog"></i>
          </button>
        </baps-navbar>
      </div>
    `,
  }),
};

/** The MyBKY bar: white, 56px, no chevron. */
export const MyBky: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <baps-navbar brand="mybky" title="Member Database">
        <button navbar-end type="button" aria-label="Notifications"
                style="border:none;background:transparent;cursor:pointer;">
          <i class="pi pi-bell"></i>
        </button>
      </baps-navbar>
    `,
  }),
};
