'use client';

interface Props {
  value: number;
  hue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function BrightnessSlider({ value, hue, onChange, disabled = false }: Props) {
  const dark = `hsl(${hue.toFixed(1)}, 100%, 15%)`;
  const mid = `hsl(${hue.toFixed(1)}, 100%, 50%)`;
  const light = `hsl(${hue.toFixed(1)}, 100%, 85%)`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor="brightness-slider"
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Brightness
        </label>
        <output
          htmlFor="brightness-slider"
          className="text-sm font-mono tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {(value * 100).toFixed(0)}%
        </output>
      </div>
      <input
        id="brightness-slider"
        type="range"
        min="0.1"
        max="0.9"
        step="0.005"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-track w-full"
        style={{
          background: `linear-gradient(to right, ${dark}, ${mid}, ${light})`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        aria-label={`Brightness: ${(value * 100).toFixed(0)} percent`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
      />
    </div>
  );
}
