/*
 * Route B: no Custom tab.
 *
 * This component's stylesheet is a DELTA over the rules PrimeNG generates at
 * runtime from the preset — it restyles PrimeNG's own class names rather than
 * defining the whole look. Raw markup would pick up the delta and none of the
 * base, so it would render wrong while looking plausible. That is worse than
 * having no Custom tab, so there is none.
 *
 * The React component emits the same class names, so a consuming app that
 * loads the kit's CSS gets both layers.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('input-group', false, '@org/ui-kit-react/styles')}

import { BapsInputGroup, BapsInputText } from '@org/ui-kit-react';`;

const examples = (
  name: string,
  jsx: string,
): Pick<SnippetSet, 'react' | 'next'> => ({
  react: `${SETUP}

export function ${name}() {
  return ${jsx};
}`,
  next: `${SETUP}

export default function ${name}() {
  return ${jsx};
}`,
});

export const inputGroupSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-input-group prefix="min" suffix="day/s">
  <input bapsInputText type="number" aria-label="Minimum days" />
</baps-input-group>`,
    ...examples(
      'DefaultInputGroup',
      `<BapsInputGroup prefix="min" suffix="day/s">
      <BapsInputText type="number" aria-label="Minimum days" />
    </BapsInputGroup>`,
    ),
  },
  SuffixOnly: {
    primeng: `<baps-input-group suffix="kg">
  <input bapsInputText type="number" aria-label="Weight" />
</baps-input-group>`,
    ...examples(
      'SuffixInputGroup',
      `<BapsInputGroup suffix="kg">
      <BapsInputText type="number" aria-label="Weight" />
    </BapsInputGroup>`,
    ),
  },
  ProjectedAddons: {
    primeng: `<baps-input-group prefix="Unused fallback" suffix="Unused fallback">
  <i input-group-prefix class="pi pi-search" aria-hidden="true"></i>
  <input bapsInputText aria-label="Member search" />
  <span input-group-suffix>name</span>
</baps-input-group>`,
    ...examples(
      'ProjectedInputGroupAddons',
      `<BapsInputGroup
      prefix="Unused fallback"
      suffix="Unused fallback"
      prefixContent={<i className="pi pi-search" aria-hidden="true" />}
      suffixContent={<span>name</span>}
    >
      <BapsInputText aria-label="Member search" />
    </BapsInputGroup>`,
    ),
  },
  MinMaxRow: {
    primeng: `<baps-input-group prefix="min"><input bapsInputText type="number" aria-label="Minimum" /></baps-input-group>
<baps-input-group prefix="max"><input bapsInputText type="number" aria-label="Maximum" /></baps-input-group>`,
    ...examples(
      'MinMaxInputGroups',
      `<>
      <BapsInputGroup prefix="min"><BapsInputText type="number" aria-label="Minimum" /></BapsInputGroup>
      <BapsInputGroup prefix="max"><BapsInputText type="number" aria-label="Maximum" /></BapsInputGroup>
    </>`,
    ),
  },
  Brands: {
    primeng: `<baps-input-group brand="sampark" prefix="min" suffix="day/s">
  <input bapsInputText type="number" aria-label="Minimum days" />
</baps-input-group>`,
    ...examples(
      'InputGroupBrands',
      `<>
      <BapsInputGroup prefix="min" suffix="day/s"><BapsInputText type="number" aria-label="MyBKY minimum days" /></BapsInputGroup>
      <BapsInputGroup brand="sampark" prefix="min" suffix="day/s"><BapsInputText type="number" aria-label="Sampark minimum days" /></BapsInputGroup>
    </>`,
    ),
  },
  /* Angular only: the stretch / chromeless / joined-button rules key off the
     Angular baps-input-number host, which the React component does not render. */
  WithInputNumber: {
    primeng: `<baps-input-group brand="sampark" prefix="min" suffix="days">
  <baps-input-number brand="sampark" [(ngModel)]="count" [showButtons]="true" [min]="1" [max]="100" />
</baps-input-group>
<baps-input-group brand="sampark" prefix="max" suffix="days">
  <baps-input-number brand="sampark" [(ngModel)]="locked" [showButtons]="false" [disabled]="true" />
</baps-input-group>`,
  },
  SamparkBarePInputGroup: {
    primeng: `<p-inputgroup>
  <input pInputText type="number" aria-label="Days" [(ngModel)]="days" />
  <p-inputgroup-addon>Day/s</p-inputgroup-addon>
</p-inputgroup>`,
  },
};
