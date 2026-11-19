/**
 * Deterministic PRNG (Mulberry32) so Free Play and Daily Island seeds are reproducible.
 */
export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function nextRandom(state: number): { value: number; nextState: number } {
  let t = (state + 0x6d2b79f5) | 0;
  const nextState = t >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}

export function randomInt(
  state: number,
  maxExclusive: number,
): { value: number; nextState: number } {
  const { value, nextState } = nextRandom(state);
  return { value: Math.floor(value * maxExclusive), nextState };
}

export function shuffleWithRng<T>(
  items: T[],
  state: number,
): { items: T[]; nextState: number } {
  const copy = [...items];
  let rng = state;
  for (let i = copy.length - 1; i > 0; i--) {
    const r = randomInt(rng, i + 1);
    rng = r.nextState;
    const tmp = copy[i];
    copy[i] = copy[r.value];
    copy[r.value] = tmp;
  }
  return { items: copy, nextState: rng };
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createRandomSeedLabel(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'ISLE-';
  for (let i = 0; i < 4; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
