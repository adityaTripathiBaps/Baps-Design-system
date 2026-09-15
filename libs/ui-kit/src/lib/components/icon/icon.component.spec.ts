import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BapsIcon } from './icon.component';
import { BAPS_ICONS, BAPS_ICON_NAMES } from './icon-set';

describe('BapsIcon', () => {
  let fixture: ComponentFixture<BapsIcon>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BapsIcon] }).compileComponents();
    fixture = TestBed.createComponent(BapsIcon);
    host = fixture.nativeElement as HTMLElement;
  });

  const render = (props: Partial<BapsIcon>) => {
    Object.assign(fixture.componentInstance, props);
    fixture.detectChanges();
  };

  it('renders the glyph as real SVG, not HTML-namespaced elements', () => {
    render({ name: 'notification' });
    const svg = host.querySelector('svg');
    expect(svg).toBeTruthy();
    // The namespace is the whole reason the markup goes through a <span>:
    // innerHTML on an <svg> element produces elements that never paint.
    expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg?.querySelector('path')).toBeTruthy();
  });

  it('draws every icon in the set without throwing', () => {
    for (const name of BAPS_ICON_NAMES) {
      render({ name });
      expect(host.querySelector('svg path, svg g')).toBeTruthy();
    }
  });

  it('renders nothing for an unknown name instead of throwing', () => {
    render({ name: 'not-a-real-icon' as never });
    expect(host.querySelector('svg')).toBeNull();
  });

  it('maps the named size steps to pixels', () => {
    render({ name: 'user', size: 'xs' });
    expect(host.style.getPropertyValue('--baps-icon-size')).toBe('12px');
    render({ name: 'user', size: 'xl' });
    expect(host.style.getPropertyValue('--baps-icon-size')).toBe('32px');
  });

  it('accepts a raw pixel size', () => {
    render({ name: 'user', size: 44 });
    expect(host.style.getPropertyValue('--baps-icon-size')).toBe('44px');
  });

  it('hides a decorative icon from assistive technology', () => {
    render({ name: 'user' });
    const glyph = host.querySelector('.baps-icon__glyph');
    expect(glyph?.getAttribute('aria-hidden')).toBe('true');
    expect(glyph?.getAttribute('role')).toBeNull();
  });

  it('announces an icon that carries a label', () => {
    render({ name: 'trash', label: 'Delete' });
    const glyph = host.querySelector('.baps-icon__glyph');
    expect(glyph?.getAttribute('role')).toBe('img');
    expect(glyph?.getAttribute('aria-label')).toBe('Delete');
    expect(glyph?.getAttribute('aria-hidden')).toBeNull();
  });

  it('ships no hard-coded stroke colour, so icons inherit currentColor', () => {
    for (const [name, body] of Object.entries(BAPS_ICONS)) {
      expect(`${name}: ${body}`).not.toMatch(/#151414/i);
    }
  });

  it('carries no leftover sheet chrome from the Figma export', () => {
    for (const [name, body] of Object.entries(BAPS_ICONS)) {
      // The export wraps each icon in the whole 1210x14041 sheet plus a dark
      // backdrop; either surviving would paint a block over the page.
      expect(`${name}: ${body}`).not.toMatch(/#313131|width="1210"/);
    }
  });
});
