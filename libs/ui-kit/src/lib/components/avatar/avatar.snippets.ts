export interface AvatarSnippetSet {
  htmlcss?: string;
}

const MYBKY_SETUP = `<!-- Load the generated token stylesheet in the page head. -->
<link rel="stylesheet" href="/assets/tokens.css">

<!-- In the consuming app's global Sass entry (compile with Sass):
@use '<repo>/libs/ui-kit/src/lib/styles/layout/fonts';
@use '<repo>/libs/ui-kit/src/lib/styles/layout/common';
@use '<repo>/libs/ui-kit/src/lib/styles/components/avatar/avatar';

The Avatar stylesheet is source-only and is not published as a CSS package yet.
Use the shared partial above; do not copy or recreate its styles.

Apply the same app typography as the Angular page if it is not already set:
html {
  font-family: var(--font-family);
  font-feature-settings: var(--font-feature-settings);
}
-->`;

export const avatarSnippets: Record<string, AvatarSnippetSet> = {
  Playground: {
    htmlcss: `${MYBKY_SETUP}

<!-- page.html: MyBKY primary avatar; keep the full name available to assistive technology. -->
<span
  class="baps-avatar-html baps-avatar-html--m baps-avatar-html--circle"
  role="img"
  aria-label="Aditya Tripathi"
>AT</span>`,
  },
  Types: {
    htmlcss: `${MYBKY_SETUP}

<!-- page.html: initials, decorative icon beside a labeled name, and a meaningful image. -->
<span
  class="baps-avatar-html baps-avatar-html--m baps-avatar-html--circle"
  role="img"
  aria-label="Aditya Tripathi"
>AT</span>

<span
  class="baps-avatar-html baps-avatar-html--m baps-avatar-html--circle"
  aria-hidden="true"
>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
       stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
</span>
<span>Aditya Tripathi</span>

<span class="baps-avatar-html baps-avatar-html--m baps-avatar-html--circle">
  <img src="/assets/users/aditya.png" alt="Aditya Tripathi">
</span>`,
  },
};
