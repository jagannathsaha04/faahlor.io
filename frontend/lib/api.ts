const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface HslColor {
  hue: number;
  saturation: number;
  brightness: number;
}

// POST /api/matches
export interface CreateMatchResponse {
  matchId: string;
}

// GET /api/matches/{id}/round/current
export interface CurrentRoundResponse {
  matchId: string;
  roundNumber: number;
  targetColor: HslColor;
}

// POST /api/rounds/submit
export interface SubmitRoundRequest {
  matchId: string;
  roundNumber: number;
  hue: number;
  brightness: number;
}

export interface SubmitRoundResponse {
  accuracy: number;
  score: number;
  targetColor: HslColor;
  submittedColor: HslColor;
  isMatchComplete: boolean;
  nextRoundNumber: number | null;
}

// GET /api/matches/{id}/summary
export interface RoundSummary {
  roundNumber: number;
  targetColor: HslColor;
  submittedColor: HslColor;
  accuracy: number;
  score: number;
}

export interface MatchSummaryResponse {
  matchId: string;
  totalScore: number;
  averageAccuracy: number;
  rounds: RoundSummary[];
}

export interface ApiError {
  code: string;
  message: string;
}

export class FaahlorApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FaahlorApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new FaahlorApiError('NETWORK_ERROR', 'Could not reach the server. Check your connection.', 0);
  }

  if (!res.ok) {
    let err: Partial<ApiError> = {};
    try {
      err = await res.json();
    } catch {
      // ignore parse failure
    }
    throw new FaahlorApiError(
      err.code ?? 'REQUEST_FAILED',
      err.message ?? `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

export const api = {
  createMatch: (): Promise<CreateMatchResponse> =>
    request('/matches', { method: 'POST' }),

  getCurrentRound: (matchId: string): Promise<CurrentRoundResponse> =>
    request(`/matches/${matchId}/round/current`),

  submitRound: (body: SubmitRoundRequest): Promise<SubmitRoundResponse> =>
    request('/rounds/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMatchSummary: (matchId: string): Promise<MatchSummaryResponse> =>
    request(`/matches/${matchId}/summary`),
};
