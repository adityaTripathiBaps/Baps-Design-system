import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Message } from 'primeng/message';

import { BapsFloatLabel } from './float-label.component';
import { BapsIconField } from './icon-field.component';
import { BapsInputIcon } from './input-icon.component';
import { BapsMessage } from './message.component';

/**
 * One spec for the four form-field wrappers, because they are four versions
 * of the same five-line component and splitting them would be four copies of
 * this file's preamble.
 *
 * All four are pure pass-throughs with no brand, no host class and no logic.
 * There is nothing clever to assert — which is the point: the only way they
 * fail is an input that stops reaching PrimeNG, or projected content that
 * lands outside the wrapper and so is not styled as a field at all. Both are
 * invisible in a review, because the markup still renders.
 *
 * Two of them do differ from the other two in one respect, and it is the
 * kind of detail that gets "tidied" away:
 *
 * - `baps-iconfield` coerces `styleClass` to `''` (`styleClass ?? ''`),
 *   because PrimeNG concatenates it into a class attribute and `undefined`
 *   would render the literal text "undefined" as a class name.
 * - `baps-floatlabel` binds `[class]` rather than `[styleClass]`, because
 *   PrimeNG's FloatLabel has no styleClass input.
 */
async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: { whenStable: () => Promise<unknown>; detectChanges: () => void }) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

const instanceOf = <T>(
  fixture: { debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } | null } },
  type: new (...args: never[]) => T,
) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof type)
    ?.componentInstance as T;

describe('BapsFloatLabel', () => {
  @Component({
    standalone: true,
    imports: [BapsFloatLabel],
    template: `
      <baps-floatlabel [style]="style()" [styleClass]="styleClass()">
        <!-- Associated for real: a float label IS the field's label, so an
             unattached one would make the test pass on markup no consumer
             should copy. -->
        <input id="float-name" />
        <label for="float-name">Name</label>
      </baps-floatlabel>
    `,
  })
  class Host {
    readonly style = signal<Record<string, string | number> | undefined>(undefined);
    readonly styleClass = signal<string | undefined>(undefined);
  }

  it('projects its field and label inside the PrimeNG float label', async () => {
    const fixture = await render(Host);
    const floatLabel = fixture.nativeElement.querySelector('p-floatlabel');
    // Outside it, the label never floats — the whole component is the
    // positioning relationship between these two elements.
    expect(floatLabel.querySelector('input')).not.toBeNull();
    expect(floatLabel.querySelector('label')).not.toBeNull();
  });

  it('forwards style, and styleClass through [class] rather than styleClass', async () => {
    const fixture = await render(Host);
    fixture.componentInstance.style.set({ width: '100%' });
    fixture.componentInstance.styleClass.set('dense');
    await apply(fixture);

    // Measured: PrimeNG v21's FloatLabel declares ONE input, 'variant'. It
    // has neither style nor styleClass, so both of these bindings fall
    // through to the host element itself — which is why the component binds
    // [class] and not [styleClass], and why this reads the element.
    expect(
      (fixture.nativeElement.querySelector('p-floatlabel') as HTMLElement).style
        .width,
    ).toBe('100%');
    // PrimeNG's FloatLabel has no styleClass input, so the class has to go
    // on the element directly.
    expect(
      fixture.nativeElement.querySelector('p-floatlabel').classList,
    ).toContain('dense');
  });
});

describe('BapsIconField', () => {
  @Component({
    standalone: true,
    imports: [BapsIconField],
    template: `
      <baps-iconfield
        [iconPosition]="iconPosition()"
        [style]="style()"
        [styleClass]="styleClass()"
      >
        <input />
      </baps-iconfield>
    `,
  })
  class Host {
    readonly iconPosition = signal<'left' | 'right'>('left');
    readonly style = signal<Record<string, string | number> | undefined>(undefined);
    readonly styleClass = signal<string | undefined>(undefined);
  }

  it('defaults the icon to the left', async () => {
    const fixture = await render(Host);
    expect(instanceOf(fixture, IconField).iconPosition).toBe('left');
  });

  it('forwards iconPosition and style', async () => {
    const fixture = await render(Host);
    fixture.componentInstance.iconPosition.set('right');
    fixture.componentInstance.style.set({ width: '12rem' });
    await apply(fixture);

    expect(instanceOf(fixture, IconField).iconPosition).toBe('right');
    // IconField declares hostName, iconPosition and styleClass — no style —
    // so [style] lands on the host element.
    expect(
      (fixture.nativeElement.querySelector('p-iconfield') as HTMLElement).style
        .width,
    ).toBe('12rem');
  });

  it('sends the empty string rather than undefined for an unset styleClass', async () => {
    const fixture = await render(Host);
    // PrimeNG concatenates this into a class attribute, so undefined would
    // render the literal text "undefined" as a class name.
    expect(instanceOf(fixture, IconField).styleClass).toBe('');
  });

  it('passes a caller styleClass straight through', async () => {
    const fixture = await render(Host);
    fixture.componentInstance.styleClass.set('dense');
    await apply(fixture);
    expect(instanceOf(fixture, IconField).styleClass).toBe('dense');
  });

  it('projects the input inside the field', async () => {
    const fixture = await render(Host);
    expect(
      fixture.nativeElement.querySelector('p-iconfield input'),
    ).not.toBeNull();
  });
});

describe('BapsInputIcon', () => {
  @Component({
    standalone: true,
    imports: [BapsInputIcon],
    template: `
      <baps-inputicon [styleClass]="styleClass()" [style]="style()">
        <i class="pi pi-search"></i>
      </baps-inputicon>
    `,
  })
  class Host {
    readonly styleClass = signal<string | undefined>(undefined);
    readonly style = signal<Record<string, string | number> | undefined>(undefined);
  }

  it('projects the glyph inside the PrimeNG input icon', async () => {
    const fixture = await render(Host);
    // The icon's absolute position is relative to this wrapper; outside it
    // the glyph sits beside the field instead of inside it.
    expect(
      fixture.nativeElement.querySelector('p-inputicon .pi-search'),
    ).not.toBeNull();
  });

  it('forwards styleClass and style', async () => {
    const fixture = await render(Host);
    fixture.componentInstance.styleClass.set('leading');
    fixture.componentInstance.style.set({ top: '50%' });
    await apply(fixture);

    expect(instanceOf(fixture, InputIcon).styleClass).toBe('leading');
    // Same again: InputIcon has no style input, so this is the element's.
    expect(
      (fixture.nativeElement.querySelector('p-inputicon') as HTMLElement).style
        .top,
    ).toBe('50%');
  });
});

describe('BapsMessage', () => {
  @Component({
    standalone: true,
    imports: [BapsMessage],
    template: `
      <baps-message
        [severity]="severity()"
        [text]="text()"
        [icon]="icon()"
        [variant]="variant()"
        [size]="size()"
        [style]="style()"
        [styleClass]="styleClass()"
      >
        {{ projected() }}
      </baps-message>
    `,
  })
  class Host {
    readonly severity = signal<
      'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined
    >(undefined);
    readonly text = signal<string | undefined>(undefined);
    readonly icon = signal<string | undefined>(undefined);
    readonly variant = signal<'outlined' | 'text' | 'simple' | undefined>(undefined);
    readonly size = signal<'small' | 'large' | undefined>(undefined);
    readonly style = signal<Record<string, string | number> | undefined>(undefined);
    readonly styleClass = signal<string | undefined>(undefined);
    readonly projected = signal('');
  }

  it('forwards every input to PrimeNG', async () => {
    const fixture = await render(Host);
    fixture.componentInstance.severity.set('error');
    fixture.componentInstance.text.set('Sync failed');
    fixture.componentInstance.icon.set('pi pi-times-circle');
    fixture.componentInstance.variant.set('outlined');
    fixture.componentInstance.size.set('small');
    fixture.componentInstance.style.set({ margin: '0' });
    fixture.componentInstance.styleClass.set('dense');
    await apply(fixture);

    const message = instanceOf(fixture, Message);
    expect(message.severity).toBe('error');
    expect(message.text).toBe('Sync failed');
    expect(message.icon).toBe('pi pi-times-circle');
    expect(message.variant).toBe('outlined');
    expect(message.size).toBe('small');
    expect(message.style).toEqual({ margin: '0' });
    expect(message.styleClass).toBe('dense');
  });

  it('leaves every input unset by default, so PrimeNG picks its own', async () => {
    const fixture = await render(Host);
    const message = instanceOf(fixture, Message);
    // Substituting a default here would quietly override the preset for
    // every consumer that passes nothing.
    expect(message.text).toBeUndefined();
    expect(message.icon).toBeUndefined();
    expect(message.variant).toBeUndefined();
    expect(message.size).toBeUndefined();
  });

  it('projects content alongside the text input', async () => {
    const fixture = await render(Host);
    fixture.componentInstance.projected.set('Retrying in the background.');
    await apply(fixture);
    expect(fixture.nativeElement.textContent).toContain(
      'Retrying in the background.',
    );
  });
});
