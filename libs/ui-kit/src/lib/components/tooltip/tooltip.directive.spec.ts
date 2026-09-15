import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tooltip } from 'primeng/tooltip';
import { BapsTooltip } from './tooltip.directive';

/**
 * This directive is the one place in the library that hands PrimeNG a string
 * it has explicitly told PrimeNG not to escape. The rich-card path sets
 * `escape: false` and builds the tooltip body as raw HTML, which Tooltip then
 * drops into the overlay via innerHTML — so `escapeHtml()` is the only thing
 * standing between a consumer-supplied `tooltipTitle` / `bapsTooltip` /
 * `tooltipLinkLabel` and script execution. Those inputs routinely carry data
 * that originated with a user (a member's name, a note, a template title).
 * If someone "simplifies" the interpolation, deletes a `.replace()`, or flips
 * `escape` to a constant, nothing throws, nothing looks wrong in Storybook,
 * and the hole ships silently — hence the explicit per-input, per-character
 * assertions below.
 *
 * The plain-text path has the mirror-image failure mode: it must leave the
 * string alone AND set `escape: true`, so PrimeNG escapes it. Escaping twice
 * would render visible `&amp;` entities; escaping zero times would be the
 * same XSS hole from the other direction. Both halves are pinned.
 *
 * Assertions read the arguments of `Tooltip.setOption()` rather than the
 * directive's own getters: `computedContent` / `computedStyleClass` are
 * private, and setOption is the only channel that actually reaches PrimeNG
 * (see the directive's doc comment on why a plain property write silently
 * no-ops). Spying on it therefore tests the wiring and the content at once.
 */
interface SetOption {
  tooltipLabel?: string;
  escape?: boolean;
  tooltipStyleClass?: string;
}

function createSpy() {
  return jest.spyOn(Tooltip.prototype, 'setOption');
}

let setOption: ReturnType<typeof createSpy>;

beforeEach(() => {
  setOption = createSpy();
});

afterEach(() => {
  setOption.mockRestore();
});

/** The most recent setOption() payload that carried tooltip content. */
function options(): SetOption {
  const calls = setOption.mock.calls as unknown as [SetOption][];
  const call = [...calls].reverse().find((c) => c[0] && 'tooltipLabel' in c[0]);
  if (!call) throw new Error('BapsTooltip never pushed content through setOption()');
  return call[0];
}

@Component({
  imports: [BapsTooltip],
  template: `
    <button
      type="button"
      [bapsTooltip]="bapsTooltip"
      [tooltipTitle]="tooltipTitle"
      [tooltipLinkLabel]="tooltipLinkLabel"
      [tooltipStyleClass]="tooltipStyleClass"
      [brand]="brand"
    >
      Trigger
    </button>
  `,
})
class Host {
  bapsTooltip?: string = 'Supporting text';
  tooltipTitle?: string;
  tooltipLinkLabel?: string;
  tooltipStyleClass?: string;
  brand: 'mybky' | 'sampark' = 'mybky';
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('BapsTooltip plain-text path', () => {
  it('passes the text through untouched and asks PrimeNG to escape it', async () => {
    await render({ bapsTooltip: 'Save changes' });
    expect(options().tooltipLabel).toBe('Save changes');
    expect(options().escape).toBe(true);
  });

  it('does NOT pre-escape — double-escaping would render literal entities', async () => {
    // escape:true means PrimeNG uses textContent; escaping here too would show
    // the user "Tom &amp; Jerry" on screen.
    await render({ bapsTooltip: 'Tom & Jerry <b>' });
    expect(options().tooltipLabel).toBe('Tom & Jerry <b>');
    expect(options().escape).toBe(true);
  });

  it('keeps escape:true for a script payload rather than emitting raw HTML', async () => {
    // The safety of the plain path rests entirely on this flag.
    await render({ bapsTooltip: '<script>alert(1)</script>' });
    expect(options().escape).toBe(true);
  });

  it('sends an empty string, not undefined, when no text is supplied', async () => {
    await render({ bapsTooltip: undefined, tooltipStyleClass: 'x' });
    expect(options().tooltipLabel).toBe('');
  });

  it('stays on the plain path when only a link label is set (no title)', async () => {
    // isRich keys off tooltipTitle alone — a link label without a title must
    // not silently switch the directive into unescaped HTML mode.
    await render({ bapsTooltip: 'Body', tooltipLinkLabel: 'Learn more' });
    expect(options().escape).toBe(true);
    expect(options().tooltipLabel).toBe('Body');
  });
});

describe('BapsTooltip rich-card path (unescaped HTML)', () => {
  it('switches escape off — the reason every input below must be escaped', async () => {
    await render({ tooltipTitle: 'Title' });
    expect(options().escape).toBe(false);
  });

  it('escapes < and > in tooltipTitle so a script tag cannot be injected', async () => {
    await render({ tooltipTitle: '<script>alert(1)</script>', bapsTooltip: undefined });
    expect(options().tooltipLabel).toBe(
      '<span class="baps-tooltip-title">&lt;script&gt;alert(1)&lt;/script&gt;</span>',
    );
    expect(options().tooltipLabel).not.toContain('<script>');
  });

  it('escapes < and > in bapsTooltip (the card body)', async () => {
    await render({ tooltipTitle: 'T', bapsTooltip: '<img src=x onerror=alert(1)>' });
    expect(options().tooltipLabel).toContain(
      '<span class="baps-tooltip-text">&lt;img src=x onerror=alert(1)&gt;</span>',
    );
    expect(options().tooltipLabel).not.toContain('<img');
  });

  it('escapes < and > in tooltipLinkLabel', async () => {
    await render({ tooltipTitle: 'T', tooltipLinkLabel: '<svg onload=alert(1)>' });
    expect(options().tooltipLabel).toContain('&lt;svg onload=alert(1)&gt;');
    expect(options().tooltipLabel).not.toContain('<svg');
  });

  it('escapes double quotes in every input so none can break out of an attribute', async () => {
    await render({
      tooltipTitle: 'a"b',
      bapsTooltip: 'c"d',
      tooltipLinkLabel: 'e"f',
    });
    const html = options().tooltipLabel!;
    expect(html).toContain('a&quot;b');
    expect(html).toContain('c&quot;d');
    expect(html).toContain('e&quot;f');
    expect(html).not.toContain('a"b');
  });

  it('escapes & — and does it first, so entities are not double-encoded wrong', async () => {
    // Order matters: replacing < before & would turn "<" into "&lt;" and then
    // into "&amp;lt;". Feeding an already-entity-looking string proves the
    // ampersand pass runs first and only once.
    await render({ tooltipTitle: 'R&D', bapsTooltip: '&lt;b&gt;' });
    const html = options().tooltipLabel!;
    expect(html).toContain('R&amp;D');
    expect(html).toContain('&amp;lt;b&amp;gt;');
  });

  it('assembles title + text + link in that order', async () => {
    await render({ tooltipTitle: 'Title', bapsTooltip: 'Body', tooltipLinkLabel: 'More' });
    expect(options().tooltipLabel).toBe(
      '<span class="baps-tooltip-title">Title</span>' +
        '<span class="baps-tooltip-text">Body</span>' +
        '<span class="baps-tooltip-link">More <span class="baps-tooltip-link-arrow">&#8594;</span></span>',
    );
  });

  it('omits the text span entirely when there is no body', async () => {
    await render({ tooltipTitle: 'Title', bapsTooltip: undefined });
    expect(options().tooltipLabel).not.toContain('baps-tooltip-text');
  });

  it('omits the link span entirely when there is no link label', async () => {
    await render({ tooltipTitle: 'Title', bapsTooltip: 'Body' });
    expect(options().tooltipLabel).not.toContain('baps-tooltip-link');
  });
});

describe('BapsTooltip style class', () => {
  it('adds baps-tooltip-sampark only when the card is rich AND the brand is sampark', async () => {
    await render({ tooltipTitle: 'Title', brand: 'sampark' });
    expect(options().tooltipStyleClass).toBe('baps-tooltip-sampark');
  });

  it('adds nothing for a rich card under mybky (no MyBKY card design exists)', async () => {
    await render({ tooltipTitle: 'Title', brand: 'mybky' });
    expect(options().tooltipStyleClass).toBe('');
  });

  it('adds nothing for plain text under sampark', async () => {
    await render({ bapsTooltip: 'Plain', brand: 'sampark' });
    expect(options().tooltipStyleClass).toBe('');
  });

  it('keeps a consumer class alongside the sampark card class', async () => {
    await render({ tooltipTitle: 'T', brand: 'sampark', tooltipStyleClass: 'wide' });
    expect(options().tooltipStyleClass).toBe('wide baps-tooltip-sampark');
  });

  it('passes a consumer class through alone under mybky', async () => {
    await render({ tooltipTitle: 'T', brand: 'mybky', tooltipStyleClass: 'wide' });
    expect(options().tooltipStyleClass).toBe('wide');
  });
});

describe('BapsTooltip runtime updates', () => {
  it('re-pushes content through setOption when an input changes at runtime', async () => {
    // Signal host: the test env is zoneless, so mutating a plain property and
    // forcing detectChanges() trips NG0100 instead of testing anything. This
    // also guards the wiring the directive's doc comment warns about — a
    // stale tooltipLabel makes show() a silent no-op on every hover.
    @Component({
      imports: [BapsTooltip],
      template: `<button type="button" [bapsTooltip]="text()" [brand]="brand()">x</button>`,
    })
    class SignalHost {
      readonly text = signal('First');
      readonly brand = signal<'mybky' | 'sampark'>('mybky');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    expect(options().tooltipLabel).toBe('First');

    fixture.componentInstance.text.set('Second');
    await fixture.whenStable();
    expect(options().tooltipLabel).toBe('Second');
  });

  it('switches into the unescaped rich path only once a title arrives', async () => {
    @Component({
      imports: [BapsTooltip],
      template: `<button type="button" bapsTooltip="Body" [tooltipTitle]="title()">x</button>`,
    })
    class SignalHost {
      readonly title = signal<string | undefined>(undefined);
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    expect(options().escape).toBe(true);

    fixture.componentInstance.title.set('Now rich');
    await fixture.whenStable();
    expect(options().escape).toBe(false);
    expect(options().tooltipLabel).toContain('baps-tooltip-title');
  });
});
