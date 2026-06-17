'use client';

import { useGame } from '@/hooks/useGame';
import { useGameStore } from '@/store/gameStore';
import { ErrorBanner } from './ErrorBanner';

export function WelcomeScreen() {
  const { startMatch } = useGame();
  const { error, loading, setError } = useGameStore();

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-10">

        <header className="flex flex-col items-center gap-5">
          <div className="flex gap-3" aria-hidden="true">
            {[15, 135, 260].map((hue) => (
              <div
                key={hue}
                className="w-10 h-10 rounded-full"
                style={{
                  background: `hsl(${hue}, 100%, 55%)`,
                  boxShadow: `0 0 20px hsl(${hue}, 100%, 55%)55`,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1
              className="text-5xl font-black tracking-tight"
              style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
            >
              Faahlor
            </h1>
            <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              How good is your eye for color?
            </p>
          </div>
        </header>

        <section
          aria-label="Game instructions"
          className="w-full rounded-2xl p-5 flex flex-col gap-3 text-sm leading-relaxed"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            You'll be shown a{' '}
            <strong style={{ color: 'var(--text-primary)' }}>target color</strong>.
            Adjust the hue and brightness sliders to match it as closely as you can.
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Each match is{' '}
            <strong style={{ color: 'var(--text-primary)' }}>5 rounds</strong>.
            A perfect match scores{' '}
            <strong style={{ color: 'var(--text-primary)' }}>1000 points</strong>.
          </p>
        </section>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <button
          onClick={startMatch}
          disabled={loading}
          aria-busy={loading}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 0 30px var(--accent-glow)',

          }}
        >
          {loading ? 'Starting…' : 'Start Match'}
        </button>
      </div>
    </main>
  );
}
