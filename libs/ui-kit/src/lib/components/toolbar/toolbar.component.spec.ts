import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsToolbar } from './toolbar.component';

/**
 * `baps-toolbar` has one input and two projection slots, and almost all of
 * its substance is CSS. What the spec can hold is the structure that CSS
 * depends on, which is exactly the part a template edit can break silently.
 *
 * - **The slots must land in PrimeNG's real start and end elements.** Every
 *   rule in the component is anchored to `.p-toolbar-start` /
 *   `.p-toolbar-end` — the flex ratios that stop the right cluster being
 *   squeezed onto a second line. Content projected into the wrong half still
 *   renders; it just wraps.
 *
 * - **The title only exists when it is given.** An empty `<h1>` in the start
 *   slot takes part in the flex layout and pushes the left content along.
 */
@Component({
  standalone: true,
  imports: [BapsToolbar],
  template: `
    <baps-toolbar [title]="title()">
      <span toolbar-left>Left content</span>
      <span toolbar-right>Right content</span>
    </baps-toolbar>
  `,
})
class Host {
  readonly title = signal<string | undefined>(undefined);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

const zone = (fixture: { nativeElement: HTMLElement }, which: 'start' | 'end') =>
  fixture.nativeElement.querySelector(`.p-toolbar-${which}`) as HTMLElement;

describe('BapsToolbar', () => {
  describe('title', () => {
    it('renders no heading at all when no title is given', async () => {
      const fixture = await setup();
      // An empty <h1> is still a flex item and still shifts the left
      // content, so absent has to mean absent.
      expect(fixture.nativeElement.querySelector('h1')).toBeNull();
    });

    it('renders the title as a heading in the start zone', async () => {
      const fixture = await setup();
      fixture.componentInstance.title.set('Registrations');
      await apply(fixture);

      const heading = fixture.nativeElement.querySelector(
        'h1.page-toolbar-title',
      ) as HTMLElement;
      expect(heading.textContent?.trim()).toBe('Registrations');
      expect(zone(fixture, 'start').contains(heading)).toBe(true);
    });

    it('renders the title AFTER any toolbar-left content', async () => {
      const fixture = await setup();
      fixture.componentInstance.title.set('Registrations');
      await apply(fixture);

      // Measured, and worth pinning because the input's own doc comment used
      // to claim the opposite: the slot is projected first, the heading
      // second. Swapping them reorders every toolbar in the app at once.
      const text = zone(fixture, 'start').textContent ?? '';
      expect(text.indexOf('Left content')).toBeGreaterThanOrEqual(0);
      expect(text.indexOf('Left content')).toBeLessThan(
        text.indexOf('Registrations'),
      );
    });
  });

  describe('slots', () => {
    it('projects toolbar-left into the start zone only', async () => {
      const fixture = await setup();
      expect(zone(fixture, 'start').textContent).toContain('Left content');
      expect(zone(fixture, 'end').textContent).not.toContain('Left content');
    });

    it('projects toolbar-right into the end zone only', async () => {
      const fixture = await setup();
      // The end zone is flex:none; content that lands in start instead gets
      // squeezed by start's flex:1 and wraps.
      expect(zone(fixture, 'end').textContent).toContain('Right content');
      expect(zone(fixture, 'start').textContent).not.toContain('Right content');
    });

    it('renders both PrimeNG zones even with nothing projected', async () => {
      @Component({
        standalone: true,
        imports: [BapsToolbar],
        template: `<baps-toolbar />`,
      })
      class Bare {}

      const fixture = TestBed.createComponent(Bare);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.p-toolbar-start')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.p-toolbar-end')).not.toBeNull();
    });
  });
});
