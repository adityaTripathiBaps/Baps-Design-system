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
  'chip.css',
  'datepicker.css',
  'indicator.css',
  'tag.css',
  'alert.css',
  'card.css',
  'checkbox.css',
  'divider.css',
  'form-field.css',
  'input.css',
  'input-group.css',
  'file-upload.css',
  'menu-item.css',
  'pagination.css',
  'progress-bar.css',
  'radio.css',
  'segmented.css',
  'select.css',
  'listbox.css',
  'slider.css',
  'skeleton.css',
  'spinner.css',
  'toggle-switch.css',
  'users-dropdown.css',
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
  '.baps-avatar-html--primary.baps-sampark',
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

const selectCss = readFileSync(resolve(reactDist, 'styles/select.css'), 'utf8');
for (const marker of [
  '.p-select',
  '.p-multiselect',
  '.p-treeselect',
  'baps-select.baps-sampark',
  'baps-multi-select.baps-sampark',
  'baps-tree-select.baps-sampark',
  '.baps-selection-clear',
  '.p-tree-node-toggle-button',
]) {
  if (!selectCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared select CSS is missing ${marker}`);
  }
}

const listboxCss = readFileSync(
  resolve(reactDist, 'styles/listbox.css'),
  'utf8',
);
for (const marker of [
  'baps-listbox .p-listbox',
  '.p-listbox-option-selected',
  'baps-listbox.baps-sampark',
  '.baps-dark baps-listbox',
  '--listbox-bg-selected',
]) {
  if (!listboxCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared listbox CSS is missing ${marker}`);
  }
}

const chipCss = readFileSync(resolve(reactDist, 'styles/chip.css'), 'utf8');
for (const marker of [
  'baps-chip .p-chip',
  'baps-chip.baps-sampark',
  '.baps-dark baps-chip',
  '.p-chip-remove-icon:focus-visible',
]) {
  if (!chipCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared chip CSS is missing ${marker}`);
  }
}

const datepickerCss = readFileSync(
  resolve(reactDist, 'styles/datepicker.css'),
  'utf8',
);
for (const marker of [
  'p-datepicker .p-datepicker-input-group',
  '.p-datepicker-panel',
  '.baps-ds-sampark',
  'body.baps-dark',
  '.p-datepicker-day:focus-visible',
]) {
  if (!datepickerCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared datepicker CSS is missing ${marker}`,
    );
  }
}

const fileUploadCss = readFileSync(
  resolve(reactDist, 'styles/file-upload.css'),
  'utf8',
);
for (const marker of [
  'baps-file-upload .baps-file-upload-zone',
  '.baps-file-upload-invalid',
  '.baps-file-upload-disabled',
  ':focus-within',
  'var(--input-bg-default',
]) {
  if (!fileUploadCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared file upload CSS is missing ${marker}`,
    );
  }
}

const menuItemCss = readFileSync(
  resolve(reactDist, 'styles/menu-item.css'),
  'utf8',
);
for (const marker of [
  'baps-menu-item .menu-item',
  'baps-menu-item.baps-mybky',
  '.menu-item:focus-visible',
  '.baps-dark baps-menu-item',
]) {
  if (!menuItemCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared menu item CSS is missing ${marker}`);
  }
}

const sliderCss = readFileSync(resolve(reactDist, 'styles/slider.css'), 'utf8');
for (const marker of [
  'baps-slider .p-slider',
  '.p-slider-handle:focus-visible',
  '.baps-ds-sampark baps-slider',
  '.baps-dark baps-slider',
]) {
  if (!sliderCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared slider CSS is missing ${marker}`);
  }
}

const usersDropdownCss = readFileSync(
  resolve(reactDist, 'styles/users-dropdown.css'),
  'utf8',
);
for (const marker of [
  'baps-users-dropdown .ud__trigger',
  '.baps-users-dropdown-panel',
  'baps-users-dropdown.baps-mybky',
  '.ud__trigger:focus-visible',
  '.baps-dark',
]) {
  if (!usersDropdownCss.includes(marker)) {
    throw new Error(
      `[ui-kit-react] shared users dropdown CSS is missing ${marker}`,
    );
  }
}

const paginationCss = readFileSync(
  resolve(reactDist, 'styles/pagination.css'),
  'utf8',
);
for (const marker of [
  '.baps-paginator__page--active',
  ':focus-visible',
  '.baps-ds-sampark',
  '.baps-dark',
  'var(--color-mybky-dark-surface-hover)',
]) {
  if (!paginationCss.includes(marker)) {
    throw new Error(`[ui-kit-react] shared pagination CSS is missing ${marker}`);
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
