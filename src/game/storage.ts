import type { GameState, StoredProgress } from './types';

const STORAGE_KEY = 'pocket_isle_progress_v1';
const ACTIVE_GAME_KEY = 'pocket_isle_active_run_v1';

const DEFAULT_PROGRESS: StoredProgress = {
  highScoreFree: 0,
  highScoreDaily: {},
  totalRuns: 0,
  bestRank: 1,
  unlockedAchievements: [],
  muted: false,
};

export function loadProgress(): StoredProgress {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      highScoreFree: parsed.highScoreFree ?? 0,
      highScoreDaily: parsed.highScoreDaily ?? {},
      totalRuns: parsed.totalRuns ?? 0,
      bestRank: parsed.bestRank ?? 1,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: StoredProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function saveActiveGame(state: GameState): void {
  if (typeof window === 'undefined') return;
  if (state.mode === 'tutorial' || state.isGameOver) {
    clearActiveGame();
    return;
  }
  try {
    window.localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function loadActiveGame(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (
      !parsed ||
      !Array.isArray(parsed.board) ||
      !Array.isArray(parsed.hand) ||
      parsed.mode === 'tutorial' ||
      parsed.isGameOver
    ) {
      return null;
    }
    return {
      ...parsed,
      storedCard: parsed.storedCard ?? null,
      mayorMarks: typeof parsed.mayorMarks === 'number' ? parsed.mayorMarks : 1,
      population: typeof parsed.population === 'number' ? parsed.population : 0,
      mayorMode: false,
      lastTurnEvent: null,
    };
  } catch {
    return null;
  }
}

export function clearActiveGame(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACTIVE_GAME_KEY);
  } catch {
    // ignore
  }
}
