import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';

import { BapsButton } from '../../components/button/button.component';
import { BapsTag } from '../../components/tag/tag.component';
import { BapsBadge } from '../../components/badge/badge.component';
import { BapsAvatar } from '../../components/avatar/avatar.component';
import { BapsAvatarGroup } from '../../components/avatar/avatar-group.component';
import { BapsInputText } from '../../components/form-field/directives/input-text.directive';
import { BapsToggleSwitch } from '../../components/toggle-switch/toggle-switch.component';
import { BapsCheckbox } from '../../components/checkbox/checkbox.component';
import { BapsSlider } from '../../components/slider/slider.component';
import { BapsProgressBar } from '../../components/progress-bar/progress-bar.component';
import { BapsCard } from '../../components/card/card.component';

/**
 * The "Components" panel of the Theme Preview page.
 *
 * 21st.dev's theme sheet shows one fixed set of controls — buttons, badges, an
 * input, a switch, a checkbox, sliders, avatars — so two themes can be compared
 * on identical content. This is that set, built from the real `baps-*`
 * components rather than pictures of them. The Theme Preview page loads it in
 * a frame per theme (brand from the `designSystem` global, dark mode from the
 * `.baps-dark` class), so what you judge is exactly what an app renders.
 *
 * No `brand` is passed anywhere: the page scope decides, as in a real app
 * (storybook.md: "Pass no brand in a generic story").
 *
 * The sidebar hides this story (manager.tsx) so the page stays a single leaf;
 * it is still in index.json, so the visual suite covers it like any story.
 */
const meta: Meta = {
  title: 'Foundations/Theme Preview',
  // Pinned so the docs URL and the visual baseline key cannot move.
  id: 'foundations-theme-preview',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        BapsButton,
        BapsTag,
        BapsBadge,
        BapsAvatar,
        BapsAvatarGroup,
        BapsInputText,
        BapsToggleSwitch,
        BapsCheckbox,
        BapsSlider,
        BapsProgressBar,
        BapsCard,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

/* Section label: the PrimeNG muted text colour, so it follows brand and mode
   with the components around it. Spacing is token-driven. */
const label =
  'margin:0 0 var(--space-3, 0.75rem); font-size:0.6875rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--p-text-muted-color);';
const row =
  'display:flex; flex-wrap:wrap; align-items:center; gap:var(--space-3, 0.75rem);';

export const Components: Story = {
  name: 'Components',
  render: () => ({
    props: { notify: true, remind: true, volume: 40 },
    template: `
      <div style="display:grid; gap:var(--space-8, 2rem); padding:var(--space-6, 1.5rem); color:var(--p-text-color); background:var(--p-content-background);">
        <section>
          <p style="${label}">Buttons</p>
          <div style="${row}">
            <baps-button label="Register" severity="primary" />
            <baps-button label="Save draft" severity="secondary" />
            <baps-button label="Export" severity="secondary" [outlined]="true" />
            <baps-button label="Cancel" severity="secondary" [text]="true" />
            <baps-button label="Delete" severity="danger" />
          </div>
        </section>

        <section>
          <p style="${label}">Tags, badges and avatars</p>
          <div style="${row} justify-content:space-between;">
            <div style="${row}">
              <baps-tag value="Active" severity="success" />
              <baps-tag value="Pending" severity="warn" />
              <baps-tag value="Closed" severity="danger" />
              <baps-tag value="Draft" severity="secondary" />
              <baps-badge value="8" />
            </div>
            <baps-avatargroup>
              <baps-avatar label="ND" shape="circle" />
              <baps-avatar label="PS" shape="circle" />
              <baps-avatar label="KM" shape="circle" />
            </baps-avatargroup>
          </div>
        </section>

        <section>
          <p style="${label}">Form controls</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(14rem, 1fr)); gap:var(--space-6, 1.5rem); align-items:center;">
            <div style="display:grid; gap:var(--space-2, 0.5rem);">
              <label for="tp-email">Email</label>
              <input id="tp-email" bapsInputText placeholder="you@baps.dev" />
            </div>
            <div style="display:grid; gap:var(--space-3, 0.75rem);">
              <baps-toggleswitch inputId="tp-notify" label="Event reminders" [(ngModel)]="notify" />
              <baps-checkbox inputId="tp-remind" label="Email me a receipt" [binary]="true" [(ngModel)]="remind" />
            </div>
            <div style="display:grid; gap:var(--space-4, 1rem);">
              <baps-slider ariaLabel="Volume" [(ngModel)]="volume" />
              <baps-progressbar [value]="62" />
            </div>
          </div>
        </section>

        <section>
          <p style="${label}">Cards</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(14rem, 1fr)); gap:var(--space-4, 1rem);">
            <baps-card>
              <p style="margin:0; color:var(--p-text-muted-color);">Registered members</p>
              <p style="margin:0; font-size:1.75rem; font-weight:600;">15,231</p>
              <p style="margin:0; color:var(--p-text-muted-color);">+20.1% from last month</p>
            </baps-card>
            <baps-card>
              <p style="margin:0; color:var(--p-text-muted-color);">Donations this month</p>
              <p style="margin:0; font-size:1.75rem; font-weight:600;">₹ 2,45,100</p>
              <p style="margin:0; color:var(--p-text-muted-color);">Annadan Seva and Mandir Nirman</p>
            </baps-card>
          </div>
        </section>
      </div>
    `,
  }),
};
