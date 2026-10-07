import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../../..');
const reactDist = resolve(workspaceRoot, 'packages/ui-kit-react/dist');
const sharedStyles = resolve(workspaceRoot, 'dist/libs/ui-kit/styles');

const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const javascript = walk(reactDist).filter((path) => path.endsWith('.js'));
for (const path of javascript) {
  const source = readFileSync(path, 'utf8');
  if (/from ['"](?:@angular|primeng)/.test(source)) {
    throw new Error(`[ui-kit-react] framework runtime import found in ${path}`);
  }
}

for (const name of [
  'index.css',
  'icon.css',
  'button.css',
  'link.css',
  'avatar.css',
  'badge.css',
  'indicator.css',
  'tag.css',
  'alert.css',
  'card.css',
  'checkbox.css',
  'divider.css',
  'form-field.css',
  'input.css',
  'input-group.css',
  'progress-bar.css',
  'radio.css',
  'segmented.css',
  'skeleton.css',
  'spinner.css',
  'toggle-switch.css',
]) {
  const reactCss = readFileSync(resolve(reactDist, 'styles', name), 'utf8');
  const canonicalCss = readFileSync(resolve(sharedStyles, name), 'utf8');
  if (reactCss !== canonicalCss) {
    throw new Error(`[ui-kit-react] styles/${name} drifted from @org/ui-kit`);
  }
}

const badgeCss = readFileSync(resolve(reactDist, 'styles/badge.css'), 'utf8');
for (const marker of [
  'baps-badge .p-badge',
  '.baps-dark',
  '.baps-ds-sampark baps-badge',
  '.p-overlay-badge > baps-badge',
]) {
  if (!badgeCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared badge CSS is missing ${marker}`);
  }
}

const bundle = readFileSync(resolve(reactDist, 'styles/index.css'), 'utf8');
for (const marker of ['var(--', '.baps-dark', '.baps-ds-sampark']) {
  if (!bundle.includes(marker)) {
    throw new Error(`[ui-kit-react] shared CSS is missing ${marker}`);
  }
}

const avatarCss = readFileSync(resolve(reactDist, 'styles/avatar.css'), 'utf8');
for (const marker of [
  '.baps-avatar-html.baps-sampark.baps-avatar-html--primary',
  '.baps-dark .baps-avatar-html',
  '.baps-avatar-group',
  '--avatar-group-overlap-',
  '--avatar-sampark-status-dot-',
]) {
  if (!avatarCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared avatar CSS is missing ${marker}`);
  }
}

const alertCss = readFileSync(resolve(reactDist, 'styles/alert.css'), 'utf8');
for (const marker of [
  'baps-alert .baps-alert',
  '.baps-alert-card',
  '.baps-ds-sampark baps-alert',
  '.baps-dark baps-alert',
]) {
  if (!alertCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared alert CSS is missing ${marker}`);
  }
}

const cardCss = readFileSync(resolve(reactDist, 'styles/card.css'), 'utf8');
for (const marker of [
  'baps-card .baps-card__header',
  'baps-card.baps-card-interactive:focus-visible',
  '.baps-ds-sampark baps-card',
  '.baps-dark baps-card',
]) {
  if (!cardCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared card CSS is missing ${marker}`);
  }
}

const dividerCss = readFileSync(
  resolve(reactDist, 'styles/divider.css'),
  'utf8',
);
for (const marker of [
  'baps-divider .p-divider-horizontal',
  'baps-divider[data-size=compact]',
  '.baps-ds-sampark baps-divider',
  '.baps-dark',
  '--divider-mybky-border-color',
]) {
  if (!dividerCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared divider CSS is missing ${marker}`);
  }
}

const checkboxCss = readFileSync(
  resolve(reactDist, 'styles/checkbox.css'),
  'utf8',
);
for (const marker of [
  'baps-checkbox .p-checkbox-input',
  '.p-checkbox-indeterminate',
  '.baps-ds-sampark baps-checkbox',
  '.baps-dark baps-checkbox',
  ':focus-visible',
]) {
  if (!checkboxCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared checkbox CSS is missing ${marker}`);
  }
}

const progressBarCss = readFileSync(
  resolve(reactDist, 'styles/progress-bar.css'),
  'utf8',
);
for (const marker of [
  'baps-progressbar .p-progressbar',
  '.p-progressbar-indeterminate',
  '.baps-ds-sampark baps-progressbar',
  '.baps-dark baps-progressbar',
  '--progress-bar-mybky-track-height',
]) {
  if (!progressBarCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared progress bar CSS is missing ${marker}`,
    );
  }
}

const radioCss = readFileSync(resolve(reactDist, 'styles/radio.css'), 'utf8');
for (const marker of [
  'baps-radio .p-radiobutton-input',
  '.p-radiobutton-icon',
  '.baps-ds-sampark baps-radio',
  '.baps-dark baps-radio',
  ':focus-visible',
]) {
  if (!radioCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared radio CSS is missing ${marker}`);
  }
}

const segmentedCss = readFileSync(
  resolve(reactDist, 'styles/segmented.css'),
  'utf8',
);
for (const marker of [
  'baps-segmented .p-selectbutton',
  '.p-togglebutton-checked',
  '.baps-segmented-multiple',
  '.baps-ds-sampark baps-segmented',
  '.baps-dark baps-segmented',
  ':focus-visible',
  'prefers-reduced-motion',
]) {
  if (!segmentedCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared segmented CSS is missing ${marker}`);
  }
}

const formFieldCss = readFileSync(
  resolve(reactDist, 'styles/form-field.css'),
  'utf8',
);
for (const marker of [
  'baps-floatlabel .p-floatlabel',
  'baps-iconfield .p-iconfield',
  'baps-message .p-message',
  '.baps-ds-sampark baps-message',
  '.baps-dark baps-message',
]) {
  if (!formFieldCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared form field CSS is missing ${marker}`,
    );
  }
}

const inputCss = readFileSync(resolve(reactDist, 'styles/input.css'), 'utf8');
for (const marker of [
  '.p-inputtext',
  '.p-floatlabel',
  'p-iconfield',
  'textarea.p-textarea',
  '.baps-ds-sampark',
  'body.baps-dark',
]) {
  if (!inputCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared input CSS is missing ${marker}`);
  }
}

const inputGroupCss = readFileSync(
  resolve(reactDist, 'styles/input-group.css'),
  'utf8',
);
for (const marker of [
  'baps-input-group .p-inputgroup',
  '.p-inputgroupaddon',
  ':focus-within',
  '.baps-ds-sampark baps-input-group',
  '.baps-dark baps-input-group',
  '--input-group-addon-padding-x',
]) {
  if (!inputGroupCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared input group CSS is missing ${marker}`,
    );
  }
}

const spinnerCss = readFileSync(
  resolve(reactDist, 'styles/spinner.css'),
  'utf8',
);
for (const marker of [
  'baps-spinner .baps-spinner-svg',
  '.baps-spinner-indeterminate',
  '.baps-ds-sampark baps-spinner',
  '.baps-dark baps-spinner',
  'prefers-reduced-motion',
]) {
  if (!spinnerCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared spinner CSS is missing ${marker}`);
  }
}

const skeletonCss = readFileSync(
  resolve(reactDist, 'styles/skeleton.css'),
  'utf8',
);
for (const marker of [
  'baps-skeleton .p-skeleton',
  '.p-skeleton-circle',
  '.baps-ds-sampark baps-skeleton',
  '.baps-dark baps-skeleton',
  'prefers-reduced-motion',
  '--skeleton-mybky-background',
]) {
  if (!skeletonCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared skeleton CSS is missing ${marker}`);
  }
}

const toggleSwitchCss = readFileSync(
  resolve(reactDist, 'styles/toggle-switch.css'),
  'utf8',
);
for (const marker of [
  '.baps-toggle-switch__input',
  '.baps-toggle-switch--xs',
  '.baps-toggle-switch--sm',
  '.baps-toggle-switch--lg',
  '.baps-toggle-switch.baps-sampark',
  '.baps-ds-sampark',
  ':focus-visible',
]) {
  if (!toggleSwitchCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared toggle switch CSS is missing ${marker}`,
    );
  }
}

const iconRegistry = readFileSync(
  resolve(
    workspaceRoot,
    'dist/libs/ui-kit/esm2022/lib/components/icon/icon-set.js',
  ),
  'utf8',
);
if (/@angular|primeng/.test(iconRegistry)) {
  throw new Error(
    '[ui-kit-react] icon data subpath imports a framework runtime',
  );
}

console.log(
  `[ui-kit-react] verified ${javascript.length} JS files, canonical CSS, both brands/dark scope, and Angular-free icon data`,
);
