import { useGameStore } from '@/store/gameStore';
import { defaultPlayerColor } from '@/lib/color';

// Reset store between tests
beforeEach(() => {
  useGameStore.getState().reset();
});

describe('gameStore initial state', () => {
  it('starts in idle phase', () => {
    expect(useGameStore.getState().phase).toBe('idle');
  });

  it('has no matchId', () => {
    expect(useGameStore.getState().matchId).toBeNull();
  });

  it('has default player color', () => {
    const { playerColor } = useGameStore.getState();
    expect(playerColor.hue).toBe(180);
    expect(playerColor.saturation).toBe(1.0);
    expect(playerColor.brightness).toBe(0.5);
  });

  it('has no error', () => {
    expect(useGameStore.getState().error).toBeNull();
  });
});

describe('setMatchStarted', () => {
  it('sets matchId and phase to playing', () => {
    useGameStore.getState().setMatchStarted('test-uuid');
    const state = useGameStore.getState();
    expect(state.matchId).toBe('test-uuid');
    expect(state.phase).toBe('playing');
    expect(state.error).toBeNull();
  });
});

describe('setCurrentRound', () => {
  it('updates round number and target color', () => {
    const targetColor = { hue: 200, saturation: 1.0, brightness: 0.6 };
    useGameStore.getState().setCurrentRound(2, targetColor);
    const state = useGameStore.getState();
    expect(state.currentRound).toBe(2);
    expect(state.targetColor).toEqual(targetColor);
  });

  it('resets player color to default', () => {
    // First change player color
    useGameStore.getState().setPlayerHue(300);
    // Then set a new round
    useGameStore.getState().setCurrentRound(3, { hue: 100, saturation: 1.0, brightness: 0.5 });
    expect(useGameStore.getState().playerColor.hue).toBe(defaultPlayerColor().hue);
  });

  it('sets phase to playing', () => {
    useGameStore.getState().setCurrentRound(1, { hue: 0, saturation: 1.0, brightness: 0.5 });
    expect(useGameStore.getState().phase).toBe('playing');
  });
});

describe('setPlayerHue', () => {
  it('updates only hue, keeps other fields', () => {
    useGameStore.getState().setPlayerHue(90);
    const { playerColor } = useGameStore.getState();
    expect(playerColor.hue).toBe(90);
    expect(playerColor.saturation).toBe(1.0);
    expect(playerColor.brightness).toBe(0.5);
  });
});

describe('setPlayerBrightness', () => {
  it('updates only brightness, keeps other fields', () => {
    useGameStore.getState().setPlayerBrightness(0.3);
    const { playerColor } = useGameStore.getState();
    expect(playerColor.brightness).toBe(0.3);
    expect(playerColor.saturation).toBe(1.0);
    expect(playerColor.hue).toBe(180);
  });
});

describe('setRoundResult', () => {
  it('sets roundResult and phase to round-result', () => {
    const result = {
      roundNumber: 1,
      targetColor: { hue: 100, saturation: 1.0, brightness: 0.5 },
      submittedColor: { hue: 110, saturation: 1.0, brightness: 0.5 },
      accuracy: 92.1,
      score: 921,
      isMatchComplete: false,
      nextRoundNumber: 2,
    };
    useGameStore.getState().setRoundResult(result);
    const state = useGameStore.getState();
    expect(state.roundResult).toEqual(result);
    expect(state.phase).toBe('round-result');
  });
});

describe('setSummary', () => {
  it('sets summary and phase to summary', () => {
    const summary = {
      matchId: 'uuid-123',
      totalScore: 4200,
      averageAccuracy: 84.0,
      rounds: [],
    };
    useGameStore.getState().setSummary(summary);
    const state = useGameStore.getState();
    expect(state.summary).toEqual(summary);
    expect(state.phase).toBe('summary');
  });
});

describe('setLoading', () => {
  it('toggles loading state', () => {
    useGameStore.getState().setLoading(true);
    expect(useGameStore.getState().loading).toBe(true);
    useGameStore.getState().setLoading(false);
    expect(useGameStore.getState().loading).toBe(false);
  });
});

describe('setError', () => {
  it('sets and clears error', () => {
    useGameStore.getState().setError('Something went wrong');
    expect(useGameStore.getState().error).toBe('Something went wrong');
    useGameStore.getState().setError(null);
    expect(useGameStore.getState().error).toBeNull();
  });
});

describe('reset', () => {
  it('returns to initial state', () => {
    useGameStore.getState().setMatchStarted('some-uuid');
    useGameStore.getState().setPlayerHue(300);
    useGameStore.getState().setError('error');
    useGameStore.getState().reset();

    const state = useGameStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.matchId).toBeNull();
    expect(state.error).toBeNull();
    expect(state.playerColor.hue).toBe(180);
  });
});
