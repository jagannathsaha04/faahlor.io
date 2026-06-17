import { create } from 'zustand';
import { HslColor, RoundSummary } from '@/lib/api';
import { defaultPlayerColor } from '@/lib/color';

export type GamePhase = 'idle' | 'playing' | 'round-result' | 'summary';

export interface RoundResult {
  roundNumber: number;
  targetColor: HslColor;
  submittedColor: HslColor;
  accuracy: number;
  score: number;
  isMatchComplete: boolean;
  nextRoundNumber: number | null;
}

interface GameState {
  // Phase
  phase: GamePhase;

  // Match
  matchId: string | null;

  // Current round
  currentRound: number;
  targetColor: HslColor | null;

  // Player input — saturation always 1.0, only hue + brightness are controllable
  playerColor: HslColor;

  // Result from the last submitted round
  roundResult: RoundResult | null;

  // Summary (available after all 5 rounds)
  summary: {
    matchId: string;
    totalScore: number;
    averageAccuracy: number;
    rounds: RoundSummary[];
  } | null;

  // Async state
  loading: boolean;
  error: string | null;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setMatchStarted: (matchId: string) => void;
  setCurrentRound: (roundNumber: number, targetColor: HslColor) => void;
  setPlayerHue: (hue: number) => void;
  setPlayerBrightness: (brightness: number) => void;
  setRoundResult: (result: RoundResult) => void;
  setSummary: (summary: NonNullable<GameState['summary']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Pick<
  GameState,
  'phase' | 'matchId' | 'currentRound' | 'targetColor' | 'playerColor' | 'roundResult' | 'summary' | 'loading' | 'error'
> = {
  phase: 'idle',
  matchId: null,
  currentRound: 1,
  targetColor: null,
  playerColor: defaultPlayerColor(),
  roundResult: null,
  summary: null,
  loading: false,
  error: null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setMatchStarted: (matchId) =>
    set({ matchId, phase: 'playing', error: null }),

  setCurrentRound: (currentRound, targetColor) =>
    set({
      currentRound,
      targetColor,
      playerColor: defaultPlayerColor(),
      roundResult: null,
      phase: 'playing',
    }),

  setPlayerHue: (hue) =>
    set((state) => ({ playerColor: { ...state.playerColor, hue } })),

  setPlayerBrightness: (brightness) =>
    set((state) => ({ playerColor: { ...state.playerColor, brightness } })),

  setRoundResult: (roundResult) =>
    set({ roundResult, phase: 'round-result' }),

  setSummary: (summary) =>
    set({ summary, phase: 'summary' }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState, playerColor: defaultPlayerColor() }),
}));
