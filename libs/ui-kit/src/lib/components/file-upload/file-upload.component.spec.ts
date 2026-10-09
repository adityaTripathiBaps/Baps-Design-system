import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsFileUpload } from './file-upload.component';

/**
 * `baps-file-upload` renders no PrimeNG. It is a drop zone built out of a
 * `<div>` plus a hidden `<input type="file">`, which means every control
 * affordance is hand-made and every way it breaks is silent.
 */
@Component({
  standalone: true,
  imports: [BapsFileUpload],
  template: `
    <baps-file-upload
      [accept]="accept()"
      [multiple]="multiple()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [brand]="brand()"
      (filesSelected)="picked = $event"
    />
  `,
})
class Host {
  readonly accept = signal<string | undefined>(undefined);
  readonly multiple = signal(false);
  readonly disabled = signal(false);
  readonly invalid = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  picked: File[] | null = null;
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

const zone = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('.baps-file-upload-zone') as HTMLElement;

const input = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;

const file = (name: string) => new File(['x'], name, { type: 'image/png' });

/**
 * jsdom has no DragEvent and no DataTransfer, so a drop is assembled by
 * hand: a cancelable bubbling Event with the one property the component
 * reads. Anything richer would be testing the mock.
 */
function drag(type: 'dragover' | 'drop', files: File[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  return event;
}

/** `input.files` is read-only, and a test cannot build a real FileList. */
function setFiles(el: HTMLInputElement, files: File[]): void {
  Object.defineProperty(el, 'files', { value: files, configurable: true });
}

describe('BapsFileUpload', () => {
  describe('the zone is the control', () => {
    it('is a named, reachable button', async () => {
      const fixture = await setup();
      const el = zone(fixture);
      // A div is not a control until it says it is one and can be focused.
      expect(el.getAttribute('role')).toBe('button');
      expect(el.getAttribute('aria-label')).toBe(
        'Click to upload or drag and drop',
      );
      expect(el.getAttribute('tabindex')).toBe('0');
    });

    it('keeps the inner button out of the tab order with inert', async () => {
      const fixture = await setup();
      const button = fixture.nativeElement.querySelector(
        'baps-button',
      ) as HTMLElement;
      // Without inert the button is a second tab stop whose Enter both
      // activates it and bubbles to the zone, opening the picker twice.
      expect(button.hasAttribute('inert')).toBe(true);
    });

    it('opens the hidden picker on click', async () => {
      const fixture = await setup();
      const spy = jest.spyOn(input(fixture), 'click');
      zone(fixture).click();
      // Once, not twice. The input lives INSIDE the zone, so the click
      // open() synthesises on it bubbles straight back to the zone's own
      // handler and re-enters open(). Browsers happen to swallow the second
      // picker through a click-in-progress flag, which is why this never
      // showed; the input stops its own click propagating so it does not
      // depend on that.
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('opens on Enter, and on Space without scrolling the page', async () => {
      const fixture = await setup();
      const spy = jest.spyOn(input(fixture), 'click');

      zone(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      const space = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      zone(fixture).dispatchEvent(space);

      expect(spy).toHaveBeenCalledTimes(2);
      // On a focusable div Space scrolls; choosing the zone by keyboard
      // would otherwise jump the page as well as open the picker.
      expect(space.defaultPrevented).toBe(true);
    });
  });

  describe('disabled', () => {
    it('leaves the tab order and says it is disabled', async () => {
      const fixture = await setup();
      expect(zone(fixture).hasAttribute('aria-disabled')).toBe(false);

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      expect(zone(fixture).getAttribute('aria-disabled')).toBe('true');
      // null, not "-1": a dead zone should not be a focus stop at all.
      expect(zone(fixture).hasAttribute('tabindex')).toBe(false);
      expect(zone(fixture).classList).toContain('baps-file-upload-disabled');
    });

    it('opens nothing by click or key', async () => {
      const fixture = await setup();
      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      const spy = jest.spyOn(input(fixture), 'click');
      zone(fixture).click();
      zone(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      // The handler guards as well as the attribute: `disabled` on the
      // hidden input would not stop the zone's own click.
      expect(spy).not.toHaveBeenCalled();
    });

    it('also disables the hidden input', async () => {
      const fixture = await setup();
      fixture.componentInstance.disabled.set(true);
      await apply(fixture);
      expect(input(fixture).disabled).toBe(true);
    });
  });

  describe('drag and drop', () => {
    it('marks the zone on dragover and takes the mark off on dragleave', async () => {
      const fixture = await setup();
      zone(fixture).dispatchEvent(drag('dragover'));
      await apply(fixture);
      expect(zone(fixture).classList).toContain('baps-file-upload-dragover');

      zone(fixture).dispatchEvent(new Event('dragleave', { bubbles: true }));
      await apply(fixture);
      expect(zone(fixture).classList).not.toContain('baps-file-upload-dragover');
    });

    it('prevents the default dragover, or the browser navigates to the file', async () => {
      const fixture = await setup();
      const event = drag('dragover');
      zone(fixture).dispatchEvent(event);
      // Without this the drop never reaches the handler at all — the page
      // is replaced by the dropped file.
      expect(event.defaultPrevented).toBe(true);
    });

    it('never marks the zone while disabled', async () => {
      const fixture = await setup();
      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      zone(fixture).dispatchEvent(drag('dragover'));
      await apply(fixture);
      expect(zone(fixture).classList).not.toContain('baps-file-upload-dragover');
    });

    it('emits the dropped file and clears the mark', async () => {
      const fixture = await setup();
      zone(fixture).dispatchEvent(drag('dragover'));
      await apply(fixture);

      const event = drag('drop', [file('a.png')]);
      zone(fixture).dispatchEvent(event);
      await apply(fixture);

      expect(event.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.picked?.map((f) => f.name)).toEqual([
        'a.png',
      ]);
      expect(zone(fixture).classList).not.toContain('baps-file-upload-dragover');
    });

    it('keeps only the first file when multiple is off', async () => {
      const fixture = await setup();
      zone(fixture).dispatchEvent(drag('drop', [file('a.png'), file('b.png')]));
      await apply(fixture);

      // A drop ignores the input's `multiple`, so the component has to do
      // the trimming — otherwise a single-file field silently takes two.
      expect(fixture.componentInstance.picked?.map((f) => f.name)).toEqual([
        'a.png',
      ]);
    });

    it('keeps every file when multiple is on', async () => {
      const fixture = await setup();
      fixture.componentInstance.multiple.set(true);
      await apply(fixture);

      zone(fixture).dispatchEvent(drag('drop', [file('a.png'), file('b.png')]));
      await apply(fixture);
      expect(fixture.componentInstance.picked?.map((f) => f.name)).toEqual([
        'a.png',
        'b.png',
      ]);
    });

    it('emits nothing for an empty drop, or a drop while disabled', async () => {
      const fixture = await setup();
      zone(fixture).dispatchEvent(drag('drop', []));
      await apply(fixture);
      expect(fixture.componentInstance.picked).toBeNull();

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);
      zone(fixture).dispatchEvent(drag('drop', [file('a.png')]));
      await apply(fixture);
      expect(fixture.componentInstance.picked).toBeNull();
    });
  });

  describe('picker selection', () => {
    it('emits the chosen files and resets the input', async () => {
      const fixture = await setup();
      const el = input(fixture);
      setFiles(el, [file('a.png')]);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await apply(fixture);

      expect(fixture.componentInstance.picked?.map((f) => f.name)).toEqual([
        'a.png',
      ]);
      // Reset, or choosing the SAME file twice in a row fires no change
      // event the second time and the upload silently does nothing.
      expect(el.value).toBe('');
    });

    it('emits nothing when the picker is dismissed', async () => {
      const fixture = await setup();
      const el = input(fixture);
      setFiles(el, []);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await apply(fixture);
      expect(fixture.componentInstance.picked).toBeNull();
    });
  });

  describe('invalid', () => {
    it('adds the invalid class only when set', async () => {
      const fixture = await setup();
      expect(zone(fixture).classList).not.toContain('baps-file-upload-invalid');

      fixture.componentInstance.invalid.set(true);
      await apply(fixture);
      expect(zone(fixture).classList).toContain('baps-file-upload-invalid');
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      const host = fixture.nativeElement.querySelector(
        'baps-file-upload',
      ) as HTMLElement;
      expect(host.classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      expect(host.classList).toContain('baps-sampark');
    });
  });
});
