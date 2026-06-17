'use client';

import { HslColor } from '@/lib/api';
import { hslToCss } from '@/lib/color';

interface Props {
  color: HslColor;
  label: string;
  size?: 'sm' | 'lg';
}

export function ColorSwatch({ color, label, size = 'lg' }: Props) {
  const css = hslToCss(color);
  const heightClass = size === 'lg' ? 'h-36 md:h-48' : 'h-20 md:h-28';

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`${label}: hue ${color.hue.toFixed(0)} degrees, brightness ${(color.brightness * 100).toFixed(0)} percent`}
        className={`w-full ${heightClass} rounded-2xl transition-colors duration-150`}
        style={{
          backgroundColor: css,
          boxShadow: `0 0 40px ${css}44`,
        }}
      />
      <p
        className="text-center text-xs font-semibold tracking-widest uppercase"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </p>
    </div>
  );
}
