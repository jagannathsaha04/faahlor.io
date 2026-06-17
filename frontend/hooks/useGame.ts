import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { api, FaahlorApiError } from '@/lib/api';

function extractErrorMessage(e: unknown): string {
  if (e instanceof FaahlorApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred.';
}

export function useGame() {
  const store = useGameStore();

  const startMatch = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const { matchId } = await api.createMatch();
      const round = await api.getCurrentRound(matchId);
      store.setMatchStarted(matchId);
      store.setCurrentRound(round.roundNumber, round.targetColor);
    } catch (e) {
      store.setError(extractErrorMessage(e));
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const submitRound = useCallback(async () => {
    const { matchId, currentRound, playerColor } = store;
    if (!matchId) return;

    store.setLoading(true);
    store.setError(null);
    try {
      const result = await api.submitRound({
        matchId,
        roundNumber: currentRound,
        hue: playerColor.hue,
        brightness: playerColor.brightness,
      });

      store.setRoundResult({
        roundNumber: currentRound,
        targetColor: result.targetColor,
        submittedColor: result.submittedColor,
        accuracy: result.accuracy,
        score: result.score,
        isMatchComplete: result.isMatchComplete,
        nextRoundNumber: result.nextRoundNumber,
      });
    } catch (e) {
      store.setError(extractErrorMessage(e));
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const advanceAfterRound = useCallback(async () => {
    const { matchId, roundResult } = store;
    if (!matchId || !roundResult) return;

    if (roundResult.isMatchComplete) {
      store.setLoading(true);
      store.setError(null);
      try {
        const summary = await api.getMatchSummary(matchId);
        store.setSummary(summary);
      } catch (e) {
        store.setError(extractErrorMessage(e));
      } finally {
        store.setLoading(false);
      }
    } else if (roundResult.nextRoundNumber != null) {
      store.setLoading(true);
      store.setError(null);
      try {
        const round = await api.getCurrentRound(matchId);
        store.setCurrentRound(round.roundNumber, round.targetColor);
      } catch (e) {
        store.setError(extractErrorMessage(e));
      } finally {
        store.setLoading(false);
      }
    }
  }, [store]);

  const playAgain = useCallback(async () => {
    store.reset();
    store.setLoading(true);
    store.setError(null);
    try {
      const { matchId } = await api.createMatch();
      const round = await api.getCurrentRound(matchId);
      store.setMatchStarted(matchId);
      store.setCurrentRound(round.roundNumber, round.targetColor);
    } catch (e) {
      store.setError(extractErrorMessage(e));
      store.setPhase('idle');
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  return { startMatch, submitRound, advanceAfterRound, playAgain };
}
