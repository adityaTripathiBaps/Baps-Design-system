import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsTag } from './tag.component';

/**
 * A tag renders fine no matter which of these bindings breaks — that is the
 * problem. Every size step, the disabled treatment and the whole Sampark skin
 * are CSS rules keyed off host classes emitted from here; if a class stops
 * being emitted the chip quietly falls back to the base S (22px) MyBKY chip
 * with no error, no layout crash and nothing a render check would flag. The
 * `disabled` class is the sharpest one: it also carries `pointer-events: none`
 * and suppresses the hover ring, so losing it turns a disabled chip back into
 * an interactive-looking one.
 *
 * Severity is asserted through the class PrimeNG stamps on `.p-tag`, because
 * that class is what every border/hover-ring rule in this component's styles
 * selects on — the assertion is on our binding reaching it, not on PrimeNG.
 *
 * §40: brand host class at both brands.
 */
@Component({
  imports: [BapsTag],
  template: `
    <baps-tag
      [value]="value"
      [size]="size"
      [severity]="severity"
      [disabled]="disabled"
      [brand]="brand"
    />
  `,
})
class Host {
  value = 'Active';
  size: 'xs' | 's' | 'm' | 'l' = 's';
  severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  disabled = false;
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

async function hostClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
  const fixture = await render(overrides);
  return (fixture.nativeElement as HTMLElement).querySelector('baps-tag')!.classList;
}

const SIZE_CLASSES = ['baps-tag-xs', 'baps-tag-m', 'baps-tag-l'];

describe('BapsTag size classes', () => {
  it.each([
    ['xs', 'baps-tag-xs'],
    ['m', 'baps-tag-m'],
    ['l', 'baps-tag-l'],
  ] as const)('emits size %s -> .%s', async (size, expected) => {
    const classes = await hostClasses({ size });
    expect(classes.contains(expected)).toBe(true);
    // One size class at a time: two would leave the height to source order.
    expect(SIZE_CLASSES.filter((c) => classes.contains(c))).toEqual([expected]);
  });

  it('emits no size class for the default s step (the base rule owns it)', async () => {
    const classes = await hostClasses({ size: 's' });
    expect(SIZE_CLASSES.some((c) => classes.contains(c))).toBe(false);
  });

  it('defaults to s when size is not set', () => {
    const component = TestBed.createComponent(BapsTag).componentInstance;
    expect(component.size).toBe('s');
  });
});

describe('BapsTag disabled state', () => {
  it('emits .baps-tag-disabled when disabled', async () => {
    // Also gates `pointer-events: none` and the `:not()` hover-ring guard.
    expect((await hostClasses({ disabled: true })).contains('baps-tag-disabled')).toBe(true);
  });

  it('emits nothing when enabled', async () => {
    expect((await hostClasses({ disabled: false })).contains('baps-tag-disabled')).toBe(false);
  });
});

describe('BapsTag severity passthrough', () => {
  async function tagClasses(
    severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast',
  ): Promise<DOMTokenList> {
    const fixture = await render({ severity });
    return (fixture.nativeElement as HTMLElement).querySelector('.p-tag')!.classList;
  }

  it.each([
    ['secondary', 'p-tag-secondary'],
    ['success', 'p-tag-success'],
    ['info', 'p-tag-info'],
    ['warn', 'p-tag-warn'],
    ['danger', 'p-tag-danger'],
    ['contrast', 'p-tag-contrast'],
  ] as const)('forwards severity %s so the .%s border rule can match', async (severity, cls) => {
    expect((await tagClasses(severity)).contains(cls)).toBe(true);
  });

  it('forwards no severity by default — the grey Figma chip', async () => {
    const classes = await tagClasses(undefined);
    expect(
      ['p-tag-secondary', 'p-tag-success', 'p-tag-info', 'p-tag-warn', 'p-tag-danger', 'p-tag-contrast'].some(
        (c) => classes.contains(c),
      ),
    ).toBe(false);
  });

  it('renders the value into the label', async () => {
    const fixture = await render({ value: 'Pending' });
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.p-tag-label')!.textContent!.trim(),
    ).toBe('Pending');
  });
});

/**
 * The chevron is decorative, but the trailing action is a control: it has to
 * be a real button with a name and it has to emit, or a chip that looks
 * dismissible silently does nothing. Both default OFF — the existing visual
 * baseline depends on neither rendering unasked.
 */
describe('BapsTag chevron and trailing action', () => {
  @Component({
    imports: [BapsTag],
    template: `
      <baps-tag
        [value]="value"
        [chevron]="chevron"
        [action]="action"
        [actionLabel]="actionLabel"
        [disabled]="disabled"
        (actionClick)="clicks = clicks + 1"
      />
    `,
  })
  class ActionHost {
    value: string | undefined = 'Active';
    chevron = false;
    action = false;
    actionLabel: string | undefined = undefined;
    disabled = false;
    clicks = 0;
  }

  async function renderAction(overrides: Partial<ActionHost> = {}) {
    const fixture = TestBed.createComponent(ActionHost);
    Object.assign(fixture.componentInstance, overrides);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders neither by default', async () => {
    const el = (await renderAction()).nativeElement as HTMLElement;
    expect(el.querySelector('.baps-tag-chevron')).toBeNull();
    expect(el.querySelector('.baps-tag-action')).toBeNull();
  });

  it('renders the chevron as decoration, hidden from the a11y tree', async () => {
    const chevron = ((await renderAction({ chevron: true })).nativeElement as HTMLElement).querySelector(
      '.baps-tag-chevron',
    )!;
    expect(chevron.getAttribute('aria-hidden')).toBe('true');
    expect(chevron.tagName).toBe('SPAN');
  });

  it('renders the trailing action as a real button, not a span', async () => {
    const button = ((await renderAction({ action: true })).nativeElement as HTMLElement).querySelector(
      '.baps-tag-action',
    ) as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    // type=button: inside a form, a bare button submits it.
    expect(button.type).toBe('button');
  });

  it('names the trailing action from actionLabel', async () => {
    const button = (
      (await renderAction({ action: true, actionLabel: 'Open Active' })).nativeElement as HTMLElement
    ).querySelector('.baps-tag-action')!;
    expect(button.getAttribute('aria-label')).toBe('Open Active');
  });

  it('leaves the trailing action unnamed when actionLabel is omitted', async () => {
    // Deliberate: actionLabel has NO default. Figma names this frame "Badge
    // Hover Action" and draws an open-arrow, so there is no honest generic
    // name to fall back on — "Remove" (the old default) actively described
    // the wrong action. This test pins the absence so nobody reintroduces a
    // misleading default; the burden is on the call site to say what it does.
    const button = ((await renderAction({ action: true })).nativeElement as HTMLElement).querySelector(
      '.baps-tag-action',
    )!;
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  it('emits actionClick on click', async () => {
    const fixture = await renderAction({ action: true });
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.baps-tag-action')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('disables the trailing action with the chip', async () => {
    const fixture = await renderAction({ action: true, disabled: true });
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.baps-tag-action')!;
    expect(button.disabled).toBe(true);
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toBe(0);
  });

  it('emits .baps-tag-icon-only only when there is no value', async () => {
    // Drives the square 20/22/28 icon box; with a label it must not apply.
    const withText = (await renderAction()).nativeElement as HTMLElement;
    expect(withText.querySelector('baps-tag')!.classList.contains('baps-tag-icon-only')).toBe(false);
    const iconOnly = (await renderAction({ value: undefined })).nativeElement as HTMLElement;
    expect(iconOnly.querySelector('baps-tag')!.classList.contains('baps-tag-icon-only')).toBe(true);
  });
});

describe('BapsTag brand scoping', () => {
  it('emits no host class for the default mybky brand', async () => {
    expect((await hostClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await hostClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('carries the brand class alongside size and disabled', async () => {
    // The Sampark size rules are scoped under the brand class, so all three
    // have to coexist on one host for a disabled large Sampark chip to render.
    const classes = await hostClasses({ brand: 'sampark', size: 'l', disabled: true });
    expect(classes.contains('baps-sampark')).toBe(true);
    expect(classes.contains('baps-tag-l')).toBe(true);
    expect(classes.contains('baps-tag-disabled')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [BapsTag],
      template: `<baps-tag [brand]="brand()" value="Active" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-tag')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});
