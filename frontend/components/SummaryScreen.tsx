'use client';

import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/useGame';
import { AccuracyBar } from './AccuracyBar';
import { ErrorBanner } from './ErrorBanner';
import { hslToCss, formatAccuracy } from '@/lib/color';

const MAX_SCORE = 5000;

export function SummaryScreen() {
  const { summary, error, loading, setError } = useGameStore();
  const { playAgain } = useGame();

  if (!summary) return null;

  const { totalScore, averageAccuracy, rounds } = summary;

  return (
    <main className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <header className="flex flex-col items-center gap-1">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            Match complete
          </p>
          <p
            className="text-6xl font-black font-mono tabular-nums"
            aria-label={`Total score: ${totalScore} out of ${MAX_SCORE}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {totalScore}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            out of {MAX_SCORE} possible
          </p>
        </header>

        <section
          aria-label="Average accuracy"
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <AccuracyBar accuracy={averageAccuracy} />
          <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-secondary)' }}>
            Average accuracy across all 5 rounds
          </p>
        </section>

        <section
          aria-label="Round breakdown"
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="px-5 py-3 text-xs font-semibold tracking-widest uppercase"
            style={{
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            Round breakdown
          </div>
          <ul>
            {rounds.map((round) => {
              const targetCss = hslToCss(round.targetColor);
              const submittedCss = hslToCss(round.submittedColor);
              const barColor =
                round.accuracy >= 80
                  ? '#4ade80'
                  : round.accuracy >= 60
                  ? '#facc15'
                  : '#f87171';

              return (
                <li
                  key={round.roundNumber}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  aria-label={`Round ${round.roundNumber}: accuracy ${formatAccuracy(round.accuracy)}, score ${round.score}`}
                >
                  <span
                    className="text-xs font-mono w-4 shrink-0 tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {round.roundNumber}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg shrink-0"
                    style={{ background: targetCss }}
                    aria-hidden="true"
                    title={`Target: ${targetCss}`}
                  />
                  <div
                    className="w-8 h-8 rounded-lg shrink-0"
                    style={{ background: submittedCss }}
                    aria-hidden="true"
                    title={`Submitted: ${submittedCss}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--border)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${round.accuracy}%`,
                          background: barColor,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-xs font-mono font-bold shrink-0 tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {round.score}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <button
          onClick={playAgain}
          disabled={loading}
          aria-busy={loading}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}
        >
          {loading ? 'Loading…' : 'Play again'}
        </button>
      </div>
    </main>
  );
}
