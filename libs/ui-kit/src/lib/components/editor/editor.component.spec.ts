import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BapsEditor } from './editor.component';

/**
 * The wrapper's own surface: which toolbar it draws, the "n / max" count, the
 * state classes the skin keys off, the attach output, and the value carried
 * back to the form. Quill itself is PrimeNG's concern and is not exercised.
 *
 * Expected noise: PrimeNG's lazy `import('quill')` fails under Jest (Quill
 * ships ESM that Jest does not transform), and PrimeNG logs "Cannot use
 * import statement outside a module" instead of throwing. Nothing here
 * depends on Quill having loaded; Storybook covers the live editor.
 */
@Component({
  imports: [BapsEditor, ReactiveFormsModule],
  template: `<baps-editor [formControl]="control" [toolbar]="toolbar()" [maxLength]="max()" [invalid]="invalid()" (attach)="attached = attached + 1" />`,
})
class Host {
  readonly control = new FormControl<string | null>(null);
  readonly toolbar = signal<'default' | 'compact'>('default');
  readonly max = signal<number | undefined>(200);
  readonly invalid = signal(false);
  attached = 0;
}

async function setup(init: (h: Host) => void = () => undefined): Promise<ComponentFixture<Host>> {
  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  init(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const el = (f: ComponentFixture<Host>): HTMLElement => f.nativeElement.querySelector('baps-editor');
const editor = (f: ComponentFixture<Host>): BapsEditor =>
  f.debugElement.query((d) => d.componentInstance instanceof BapsEditor).componentInstance;
const labels = (f: ComponentFixture<Host>): string[] =>
  Array.from(el(f).querySelectorAll<HTMLElement>('.p-editor-toolbar [aria-label]')).map((b) => b.getAttribute('aria-label') ?? '');

describe('BapsEditor', () => {
  it('draws the full Figma bar by default', async () => {
    const f = await setup();
    expect(labels(f)).toEqual([
      'Bold', 'Italic', 'Underline', 'Strikethrough',
      'Font size', 'Font colour',
      'Align left', 'Align centre', 'Align right',
      'Bulleted list', 'Numbered list',
      'Attach file',
    ]);
  });

  it('draws the compact bar', async () => {
    const f = await setup((h) => h.toolbar.set('compact'));
    expect(labels(f)).toEqual([
      'Bold', 'Italic', 'Underline', 'Font size', 'Font colour', 'Alignment', 'Bulleted list', 'Attach file',
    ]);
  });

  it('counts text, not HTML, and hides the count without maxLength', async () => {
    const f = await setup();
    editor(f).onText({ htmlValue: '<p><b>Hello</b></p>', textValue: 'Hello\n', delta: null, source: 'user' });
    f.detectChanges();
    expect(el(f).querySelector('.baps-editor__count')?.textContent?.trim()).toBe('5 / 200');
    expect(f.componentInstance.control.value).toBe('<p><b>Hello</b></p>');

    f.componentInstance.max.set(undefined);
    f.detectChanges();
    expect(el(f).querySelector('.baps-editor__count')).toBeNull();
  });

  it('sets the state classes the skin keys off', async () => {
    const f = await setup((h) => {
      h.invalid.set(true);
      h.control.disable();
    });
    expect(el(f).classList).toContain('baps-editor--invalid');
    expect(el(f).classList).toContain('baps-editor--disabled');
  });

  it('emits attach from the attach button', async () => {
    const f = await setup();
    el(f).querySelector<HTMLButtonElement>('.baps-editor__attach')?.click();
    expect(f.componentInstance.attached).toBe(1);
  });
});
