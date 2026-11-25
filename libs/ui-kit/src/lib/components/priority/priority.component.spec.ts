import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsPriority, type BapsPriorityLevel } from './priority.component';

@Component({
  imports: [BapsPriority],
  template: `<baps-priority [level]="level()" [interactive]="interactive()" [label]="label()" />`,
})
class Host {
  readonly level = signal<BapsPriorityLevel>('high');
  readonly interactive = signal(false);
  readonly label = signal<string | undefined>(undefined);
}

async function render(init: (h: Host) => void = () => undefined) {
  const fixture = TestBed.createComponent(Host);
  init(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture.nativeElement.querySelector('baps-priority') as HTMLElement;
}

describe('BapsPriority', () => {
  it('draws each level with its own class, glyph and default name', async () => {
    const seen = new Set<string>();
    for (const level of ['high', 'medium', 'low', 'none'] as const) {
      const el = await render((h) => h.level.set(level));
      expect(el.classList).toContain(`baps-priority--${level}`);
      expect(el.getAttribute('role')).toBe('img');
      expect(el.getAttribute('aria-label')).toBe(
        { high: 'High priority', medium: 'Medium priority', low: 'Low priority', none: 'No priority' }[level],
      );
      const d = el.querySelector('svg path')?.getAttribute('d') ?? '';
      expect(d).not.toBe('');
      seen.add(d);
      TestBed.resetTestingModule();
    }
    expect(seen.size).toBe(4);
  });

  it('takes a custom label and marks the interactive state', async () => {
    const el = await render((h) => {
      h.label.set('Urgent');
      h.interactive.set(true);
    });
    expect(el.getAttribute('aria-label')).toBe('Urgent');
    expect(el.classList).toContain('baps-priority--interactive');
  });
});
