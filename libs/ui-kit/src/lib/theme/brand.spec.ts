import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsAvatar } from '../components/avatar/avatar.component';
import { BapsButton } from '../components/button/button.component';
import { BapsInputText } from '../components/form-field/directives/input-text.directive';
import { BapsPaginator } from '../components/pagination/pagination.component';
import {
  BAPS_BRAND,
  BapsBrand,
  injectBapsBrand,
  provideBapsBrand,
} from './brand';

/**
 * `provideBapsBrand` sets the default for every kit `brand` input.
 *
 * Pinned:
 * 1. No provider → `mybky`, so MyBKY apps are unchanged.
 * 2. Provider → `sampark` on tags with no `brand` attribute, for a host-class
 *    component, a TS-branch component (avatar shape), a directive and the
 *    signal-backed paginator.
 * 3. An explicit `brand` attribute still wins over the provider.
 */
@Component({
  standalone: true,
  imports: [BapsButton, BapsAvatar, BapsInputText, BapsPaginator],
  template: `
    <baps-button id="plain" label="Save" />
    <baps-button id="explicit" label="Save" brand="mybky" />
    <baps-avatar id="avatar" label="AB" />
    <input id="field" bapsInputText />
    <baps-paginator id="pager" [totalRecords]="50" />
  `,
})
class HostComponent {}

function render(brand?: BapsBrand): HTMLElement {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: brand ? [provideBapsBrand(brand)] : [],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const q = (root: HTMLElement, id: string) =>
  root.querySelector(`#${id}`) as HTMLElement;

describe('provideBapsBrand', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('provides the value under BAPS_BRAND', () => {
    TestBed.configureTestingModule({
      providers: [provideBapsBrand('sampark')],
    });
    expect(TestBed.inject(BAPS_BRAND)).toBe('sampark');
  });

  it('injectBapsBrand falls back to mybky without a provider', () => {
    expect(TestBed.runInInjectionContext(() => injectBapsBrand())).toBe(
      'mybky',
    );
  });

  it('leaves every component on MyBKY when no provider is set', () => {
    const root = render();
    for (const id of ['plain', 'explicit', 'field', 'pager']) {
      expect(q(root, id).classList).not.toContain('baps-sampark');
    }
    const avatar = TestBed.createComponent(BapsAvatar).componentInstance;
    expect(avatar.computedShape).toBe('circle');
  });

  it('makes untagged components Sampark when the provider says so', () => {
    const root = render('sampark');
    expect(q(root, 'plain').classList).toContain('baps-sampark');
    expect(q(root, 'field').classList).toContain('baps-sampark');
    expect(q(root, 'pager').classList).toContain('baps-sampark');
    const avatar = TestBed.createComponent(BapsAvatar).componentInstance;
    expect(avatar.computedShape).toBe('square');
  });

  it('lets an explicit brand attribute override the provider', () => {
    const root = render('sampark');
    expect(q(root, 'explicit').classList).not.toContain('baps-sampark');
  });
});
