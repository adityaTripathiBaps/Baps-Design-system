/*
 * Route B: no Custom tab.
 *
 * ChipsInput owns stateful keyboard entry, separator parsing, chip removal and
 * form propagation. Raw markup would duplicate that behavior instead of
 * demonstrating the reusable component.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('chips-input', false, '@org/ui-kit-react/styles')}

import { useState } from 'react';
import { BapsChipsInput } from '@org/ui-kit-react';`;

const example = (name: string, initial: string, props = '') => ({
  react: `${SETUP}

export function ${name}() {
  const [skills, setSkills] = useState(${initial});
  return <div><span>Skills</span> <BapsChipsInput value={skills} onChange={setSkills} placeholder="Add a skill" ${props} /></div>;
}`,
  next: `'use client';

${SETUP}

export default function ${name}() {
  const [skills, setSkills] = useState(${initial});
  return <div><span>Skills</span> <BapsChipsInput value={skills} onChange={setSkills} placeholder="Add a skill" ${props} /></div>;
}`,
});

export const chipsInputSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<span id="skills-label">Skills</span>
  <baps-chips-input
    aria-labelledby="skills-label"
    [(ngModel)]="skills"
    placeholder="Add a skill"
    separator=","
  />`,
    react: example('SkillsInput', "['Angular']", 'separator=","').react,
    next: example('SkillsInput', "['Angular']", 'separator=","').next,
  },
  CustomSeparator: {
    primeng: `<span id="skills-label">Skills</span>
<baps-chips-input aria-labelledby="skills-label" [(ngModel)]="skills" separator=";" />`,
    react: example('SeparatedSkillsInput', "['Angular']", 'separator=";"')
      .react,
    next: example('SeparatedSkillsInput', "['Angular']", 'separator=";"').next,
  },
  Disabled: {
    primeng: `<span id="skills-label">Skills</span>
<baps-chips-input aria-labelledby="skills-label" [(ngModel)]="skills" [disabled]="true" />`,
    react: example('DisabledSkillsInput', "['Angular']", 'disabled').react,
    next: example('DisabledSkillsInput', "['Angular']", 'disabled').next,
  },
  Brands: {
    primeng: `<span id="mybky-skills-label">MyBKY skills</span>
<baps-chips-input aria-labelledby="mybky-skills-label" [(ngModel)]="mybkySkills" />
<span id="sampark-skills-label">Sampark skills</span>
<baps-chips-input aria-labelledby="sampark-skills-label" brand="sampark" [(ngModel)]="samparkSkills" />`,
    react: example('SamparkSkillsInput', "['React']", 'brand="sampark"').react,
    next: example('SamparkSkillsInput', "['React']", 'brand="sampark"').next,
  },
  Dark: {
    primeng: `<div class="baps-dark">
  <span id="mybky-dark-skills-label">MyBKY skills</span>
  <baps-chips-input aria-labelledby="mybky-dark-skills-label" [(ngModel)]="mybkySkills" />
</div>
<div class="baps-dark baps-ds-sampark">
  <span id="sampark-dark-skills-label">Sampark skills</span>
  <baps-chips-input aria-labelledby="sampark-dark-skills-label" brand="sampark" [(ngModel)]="samparkSkills" />
</div>`,
    react: example('DarkSamparkSkillsInput', "['React']", 'brand="sampark"')
      .react,
    next: example('DarkSamparkSkillsInput', "['React']", 'brand="sampark"')
      .next,
  },
};
