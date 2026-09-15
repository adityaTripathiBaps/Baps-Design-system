import { TestBed } from '@angular/core/testing';
import { BapsBadge } from './badge.component';
import { SAMPARK_BADGE_TOKENS } from '../../theme/sampark.theme';

/**
 * The `dt` getter is the entire brand-switching mechanism for this
 * component — no host class, no scoped CSS, just a PrimeNG design-token
 * object swapped per instance. A typo in the brand check here silently
 * ships every badge in the Sampark radius/size scale, or vice versa, with
 * no visual signal in a code review.
 */
describe('BapsBadge', () => {
  it('has no dt override for the default mybky brand — inherits the global preset', () => {
    const component = TestBed.createComponent(BapsBadge).componentInstance;
    expect(component.brand).toBe('mybky');
    expect(component.dt).toBeUndefined();
  });

  it('returns SAMPARK_BADGE_TOKENS when brand is sampark', () => {
    const component = TestBed.createComponent(BapsBadge).componentInstance;
    component.brand = 'sampark';
    expect(component.dt).toBe(SAMPARK_BADGE_TOKENS);
  });

  it('switches back to undefined if brand is reassigned to mybky', () => {
    const component = TestBed.createComponent(BapsBadge).componentInstance;
    component.brand = 'sampark';
    component.brand = 'mybky';
    expect(component.dt).toBeUndefined();
  });
});
