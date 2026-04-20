import { describe, it, expect } from 'vitest';
import {
  getCategoryHue,
  categorySwatch,
  categoryInk,
  categoryDot,
} from './categoryColor';

describe('getCategoryHue', () => {
  it('returns curated hue for known categories', () => {
    expect(getCategoryHue('Tools')).toBe(38);
    expect(getCategoryHue('Kitchen')).toBe(170);
    expect(getCategoryHue('Electronics')).toBe(225);
    expect(getCategoryHue('Books')).toBe(290);
    expect(getCategoryHue('Outdoor')).toBe(140);
    expect(getCategoryHue('Craft')).toBe(340);
    expect(getCategoryHue('Pantry')).toBe(60);
  });

  it('is case- and whitespace-insensitive', () => {
    expect(getCategoryHue('TOOLS')).toBe(38);
    expect(getCategoryHue('tools')).toBe(38);
    expect(getCategoryHue('  Tools  ')).toBe(38);
  });

  it('maps synonym categories to the same hue', () => {
    expect(getCategoryHue('tech')).toBe(getCategoryHue('electronics'));
    expect(getCategoryHue('garden')).toBe(getCategoryHue('outdoor'));
    expect(getCategoryHue('clothes')).toBe(getCategoryHue('clothing'));
  });

  it('returns 0 for empty or whitespace-only input', () => {
    expect(getCategoryHue('')).toBe(0);
    expect(getCategoryHue('   ')).toBe(0);
  });

  it('hashes unknown categories into 0..359', () => {
    const h = getCategoryHue('zzz-made-up-category');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });

  it('is deterministic for unknown categories', () => {
    const a = getCategoryHue('cryptocurrency');
    const b = getCategoryHue('cryptocurrency');
    expect(a).toBe(b);
  });

  it('produces distinct hues for similar unknown categories', () => {
    const a = getCategoryHue('Widgets-A');
    const b = getCategoryHue('Widgets-B');
    expect(a).not.toBe(b);
  });
});

describe('categorySwatch / categoryInk / categoryDot', () => {
  it('returns oklch strings that embed the category hue', () => {
    const swatch = categorySwatch('Tools');
    expect(swatch).toContain('oklch(');
    expect(swatch).toContain(' 38)');
  });

  it('returns different swatch values for light vs dark mode', () => {
    expect(categorySwatch('Tools', false)).not.toBe(categorySwatch('Tools', true));
    expect(categoryInk('Tools', false)).not.toBe(categoryInk('Tools', true));
  });

  it('categoryDot encodes the hue', () => {
    expect(categoryDot('Kitchen')).toContain(' 170)');
  });
});
