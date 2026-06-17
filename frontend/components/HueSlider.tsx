'use client';

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function HueSlider({ value, onChange, disabled = false }: Props) {
  const gradient = [
    'hsl(0,100%,50%)',
    'hsl(30,100%,50%)',
    'hsl(60,100%,50%)',
    'hsl(90,100%,50%)',
    'hsl(120,100%,50%)',
    'hsl(150,100%,50%)',
    'hsl(180,100%,50%)',
    'hsl(210,100%,50%)',
    'hsl(240,100%,50%)',
    'hsl(270,100%,50%)',
    'hsl(300,100%,50%)',
    'hsl(330,100%,50%)',
    'hsl(360,100%,50%)',
  ].join(', ');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor="hue-slider"
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Hue
        </label>
        <output
          htmlFor="hue-slider"
          className="text-sm font-mono tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {value.toFixed(0)}°
        </output>
      </div>
      <input
        id="hue-slider"
        type="range"
        min="0"
        max="360"
        step="0.5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-track w-full"
        style={{
          background: `linear-gradient(to right, ${gradient})`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        aria-label={`Hue: ${value.toFixed(0)} degrees`}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={value}
      />
    </div>
  );
}
