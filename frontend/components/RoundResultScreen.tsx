'use client';

import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/useGame';
import { ColorSwatch } from './ColorSwatch';
import { AccuracyBar } from './AccuracyBar';
import { ErrorBanner } from './ErrorBanner';

const TOTAL_ROUNDS = 5;

export function RoundResultScreen() {
  const { roundResult, currentRound, error, loading, setError } = useGameStore();
  const { advanceAfterRound } = useGame();

  if (!roundResult) return null;

  const { targetColor, submittedColor, accuracy, score, isMatchComplete } = roundResult;
  const isLastRound = currentRound === TOTAL_ROUNDS;
  const scoreColor = score >= 800 ? '#4ade80' : score >= 600 ? '#facc15' : 'var(--text-primary)';

  return (
    <main className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <header className="flex flex-col items-center gap-1">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            Round {currentRound} result
          </p>
          <p
            className="text-5xl font-black font-mono tabular-nums"
            aria-label={`Score: ${score} points`}
            style={{ color: scoreColor }}
          >
            +{score}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            points
          </p>
        </header>

        <section aria-label="Color comparison" className="grid grid-cols-2 gap-4">
          <ColorSwatch color={targetColor} label="Target" />
          <ColorSwatch color={submittedColor} label="Your answer" />
        </section>

        <section
          aria-label="Round accuracy"
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <AccuracyBar accuracy={accuracy} />
        </section>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <button
          onClick={advanceAfterRound}
          disabled={loading}
          aria-busy={loading}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}
        >
          {loading
            ? 'Loading…'
            : isLastRound || isMatchComplete
            ? 'See final score'
            : 'Next round'}
        </button>
      </div>
    </main>
  );
}
