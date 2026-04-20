/**
 * Category colors: each category renders with a hue-based chip/swatch
 * (cool neutral chroma, single hue per category). The backend stores
 * categories as free-form strings, so we need a deterministic string -> hue
 * mapping.
 *
 * Known-category hints the design used:
 *   Tools 38   · Kitchen 170   · Electronics 225
 *   Books 290  · Outdoor 140   · Craft 340      · Pantry 60
 */

const KNOWN_HUES: Record<string, number> = {
  tools: 38,
  kitchen: 170,
  electronics: 225,
  tech: 225,
  books: 290,
  outdoor: 140,
  garden: 140,
  craft: 340,
  crafts: 340,
  pantry: 60,
  food: 60,
  clothing: 320,
  clothes: 320,
  office: 210,
  toys: 20,
};

/**
 * Deterministic category -> hue in [0, 360). Known categories get curated
 * hues; unknown ones hash into the wheel so colors stay stable across renders.
 */
export function getCategoryHue(category: string): number {
  const key = (category || '').trim().toLowerCase();
  if (!key) return 0;
  if (key in KNOWN_HUES) return KNOWN_HUES[key];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Soft pastel swatch background for a category thumbnail. */
export function categorySwatch(category: string, dark = false): string {
  const h = getCategoryHue(category);
  return dark ? `oklch(0.42 0.06 ${h})` : `oklch(0.92 0.04 ${h})`;
}

/** Readable ink color on the matching swatch. */
export function categoryInk(category: string, dark = false): string {
  const h = getCategoryHue(category);
  return dark ? `oklch(0.85 0.08 ${h})` : `oklch(0.45 0.08 ${h})`;
}

/** Small dot color used in chips alongside the category name. */
export function categoryDot(category: string): string {
  return `oklch(0.72 0.12 ${getCategoryHue(category)})`;
}
