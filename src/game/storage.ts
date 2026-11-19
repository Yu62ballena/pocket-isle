import type { StoredProgress } from './types';

const STORAGE_KEY = 'pocket_isle_progress_v1';

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
