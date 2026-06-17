import { hslToCss, defaultPlayerColor, clamp, formatAccuracy, isValidHue, isValidBrightness } from '@/lib/color';

describe('hslToCss', () => {
  it('converts full saturation mid brightness correctly', () => {
    expect(hslToCss({ hue: 120, saturation: 1.0, brightness: 0.5 }))
      .toBe('hsl(120.0, 100.0%, 50.0%)');
  });

  it('converts zero hue correctly', () => {
    expect(hslToCss({ hue: 0, saturation: 1.0, brightness: 0.5 }))
      .toBe('hsl(0.0, 100.0%, 50.0%)');
  });

  it('converts max hue correctly', () => {
    expect(hslToCss({ hue: 360, saturation: 1.0, brightness: 0.75 }))
      .toBe('hsl(360.0, 100.0%, 75.0%)');
  });

  it('converts fractional values with correct decimal places', () => {
    const result = hslToCss({ hue: 123.4, saturation: 0.85, brightness: 0.333 });
    expect(result).toContain('123.4');
    expect(result).toContain('33.3%'); // 0.333 * 100 = 33.3
  });
});

describe('defaultPlayerColor', () => {
  it('returns hue 180', () => {
    expect(defaultPlayerColor().hue).toBe(180);
  });

  it('returns saturation 1.0', () => {
    expect(defaultPlayerColor().saturation).toBe(1.0);
  });

  it('returns brightness 0.5', () => {
    expect(defaultPlayerColor().brightness).toBe(0.5);
  });
});

describe('clamp', () => {
  it('clamps below minimum', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(200, 0, 100)).toBe(100);
  });

  it('passes through values in range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('handles edge values', () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

describe('formatAccuracy', () => {
  it('formats 100 correctly', () => {
    expect(formatAccuracy(100)).toBe('100.0%');
  });

  it('formats 0 correctly', () => {
    expect(formatAccuracy(0)).toBe('0.0%');
  });

  it('formats decimal correctly', () => {
    expect(formatAccuracy(92.5)).toBe('92.5%');
  });

  it('rounds to one decimal', () => {
    expect(formatAccuracy(92.456)).toBe('92.5%');
  });
});

describe('isValidHue', () => {
  it('accepts 0', () => expect(isValidHue(0)).toBe(true));
  it('accepts 180', () => expect(isValidHue(180)).toBe(true));
  it('accepts 360', () => expect(isValidHue(360)).toBe(true));
  it('rejects -1', () => expect(isValidHue(-1)).toBe(false));
  it('rejects 361', () => expect(isValidHue(361)).toBe(false));
});

describe('isValidBrightness', () => {
  it('accepts 0', () => expect(isValidBrightness(0)).toBe(true));
  it('accepts 0.5', () => expect(isValidBrightness(0.5)).toBe(true));
  it('accepts 1', () => expect(isValidBrightness(1)).toBe(true));
  it('rejects -0.01', () => expect(isValidBrightness(-0.01)).toBe(false));
  it('rejects 1.01', () => expect(isValidBrightness(1.01)).toBe(false));
});
