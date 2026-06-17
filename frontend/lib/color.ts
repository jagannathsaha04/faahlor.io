import { HslColor } from './api';

/**
 * Convert an HSL color to a CSS hsl() string.
 * brightness is stored as 0–1, CSS expects 0–100%.
 * saturation is stored as 0–1, CSS expects 0–100%.
 */
export function hslToCss(color: HslColor): string {
  const s = (color.saturation * 100).toFixed(1);
  const l = (color.brightness * 100).toFixed(1);
  return `hsl(${color.hue.toFixed(1)}, ${s}%, ${l}%)`;
}

/**
 * Returns the default starting color for the player slider controls.
 * Mid-hue, full saturation, mid-brightness.
 */
export function defaultPlayerColor(): HslColor {
  return { hue: 180, saturation: 1.0, brightness: 0.5 };
}

/**
 * Clamp a number to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Format a decimal 0–100 as a percentage string with one decimal place.
 */
export function formatAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(1)}%`;
}

/**
 * Validate a hue value (0–360).
 */
export function isValidHue(hue: number): boolean {
  return hue >= 0 && hue <= 360;
}

/**
 * Validate a brightness value (0–1).
 */
export function isValidBrightness(brightness: number): boolean {
  return brightness >= 0 && brightness <= 1;
}
