'use client';

import { formatAccuracy } from '@/lib/color';

interface Props {
  accuracy: number;
}

function getColor(acc: number): string {
  if (acc >= 90) return '#4ade80'; // green
  if (acc >= 70) return '#facc15'; // yellow
  if (acc >= 50) return '#fb923c'; // orange
  return '#f87171';               // red
}

export function AccuracyBar({ accuracy }: Props) {
  const color = getColor(accuracy);
  const pct = Math.min(100, Math.max(0, accuracy));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Accuracy
        </span>
        <span className="text-sm font-bold font-mono" style={{ color }}>
          {formatAccuracy(accuracy)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Accuracy: ${formatAccuracy(accuracy)}`}
        className="h-2 rounded-full w-full overflow-hidden"
        style={{ background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}
