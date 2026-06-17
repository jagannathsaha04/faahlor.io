'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/useGame';
import { ColorSwatch } from './ColorSwatch';
import { HueSlider } from './HueSlider';
import { BrightnessSlider } from './BrightnessSlider';
import { ErrorBanner } from './ErrorBanner';

const TOTAL_ROUNDS = 5;
const REVEAL_TIME = 3;

export function GameScreen() {
  const {
    currentRound,
    targetColor,
    playerColor,
    loading,
    error,
    setPlayerHue,
    setPlayerBrightness,
    setError,
  } = useGameStore();

  const { submitRound } = useGame();

  const [showTarget, setShowTarget] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(REVEAL_TIME);

  useEffect(() => {
    setShowTarget(true);
    setSecondsLeft(REVEAL_TIME);

    const countdown = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const hideTimer = setTimeout(() => {
      setShowTarget(false);
    }, REVEAL_TIME * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(hideTimer);
    };
  }, [currentRound]);

  if (!targetColor) return null;

  return (
    <main className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Round Progress */}
        <header>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Round
            </span>

            <span
              className="text-sm font-bold font-mono"
              aria-label={`Round ${currentRound} of ${TOTAL_ROUNDS}`}
              style={{ color: 'var(--text-primary)' }}
            >
              {currentRound} / {TOTAL_ROUNDS}
            </span>
          </div>

          <div
            className="flex gap-1.5"
            role="list"
            aria-label="Round progress"
          >
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
              const state =
                i < currentRound - 1
                  ? 'done'
                  : i === currentRound - 1
                  ? 'active'
                  : 'pending';

              return (
                <div
                  key={i}
                  role="listitem"
                  aria-label={
                    state === 'done'
                      ? `Round ${i + 1}: complete`
                      : state === 'active'
                      ? `Round ${i + 1}: current`
                      : `Round ${i + 1}: upcoming`
                  }
                  className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background:
                      state === 'done'
                        ? 'var(--accent)'
                        : state === 'active'
                        ? 'white'
                        : 'var(--border)',
                  }}
                />
              );
            })}
          </div>
        </header>

        {/* Countdown */}
        {showTarget && (
          <div className="text-center">
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              Memorize the color...
            </p>

            <p
              className="text-2xl font-bold font-mono"
              style={{ color: 'var(--text-primary)' }}
            >
              {secondsLeft}
            </p>
          </div>
        )}

        {/* Color Area */}
        <section
          aria-label="Color comparison"
          className="grid grid-cols-2 gap-4"
        >
          {showTarget ? (
            <>
              <ColorSwatch color={targetColor} label="Memorize" />

              <div className="flex flex-col gap-2">
                <div
                  className="w-full h-36 md:h-48 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Locked
                  </span>
                </div>

                <p
                  className="text-center text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Your Color
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <div
                  className="w-full h-36 md:h-48 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Hidden
                  </span>
                </div>

                <p
                  className="text-center text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Target
                </p>
              </div>

              <ColorSwatch color={playerColor} label="Your Color" />
            </>
          )}
        </section>

        {/* Controls */}
        <section
          aria-label="Color controls"
          className="rounded-2xl p-5 flex flex-col gap-5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <HueSlider
            value={playerColor.hue}
            onChange={setPlayerHue}
            disabled={loading || showTarget}
          />

          <BrightnessSlider
            value={playerColor.brightness}
            hue={playerColor.hue}
            onChange={setPlayerBrightness}
            disabled={loading || showTarget}
          />
        </section>

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <button
          onClick={submitRound}
          disabled={loading || showTarget}
          aria-busy={loading}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}
        >
          {loading
            ? 'Submitting…'
            : showTarget
            ? 'Memorize...'
            : 'Submit'}
        </button>
      </div>
    </main>
  );
}