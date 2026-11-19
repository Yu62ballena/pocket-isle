import React from 'react';
import { CalendarDays, RotateCcw, Shuffle, Sparkles, Trophy } from 'lucide-react';
import { getCityTitle, getThresholdForRank } from '../game/constants';
import type { GameMode, GameState } from '../game/types';

interface GameOverModalProps {
  state: GameState;
  highScore: number;
  isNewBest: boolean;
  onRestart: (mode: GameMode) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  highScore,
  isNewBest,
  onRestart,
}) => {
  const { title, subtitle } = getCityTitle(
    state.stats.buildingCounts,
    state.rank,
    state.stats.maxChain,
  );
  const nextThreshold = getThresholdForRank(state.rank + 1);
  const gapToNext = Math.max(0, nextThreshold - state.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-6 sm:p-7 shadow-2xl border-2 border-amber-200 animate-toast-in text-slate-800">
        {/* Postcard header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
            {state.gameOverReason === 'board_full'
              ? '島ぜんたいが建物でいっぱいに！'
              : '手札を使い切ったよ！'}
          </div>

          {isNewBest && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-3 py-1 text-xs font-display font-black text-white shadow ml-2">
              <Sparkles className="w-3.5 h-3.5" />
              NEW BEST!
            </div>
          )}

          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-500">
            {subtitle}
          </p>
        </div>

        {/* Big score showcase */}
        <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 p-4 border border-emerald-200/70 text-center">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            FINAL SCORE
          </div>
          <div className="font-display text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
            {state.score.toLocaleString()}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2.5 text-xs font-extrabold text-slate-600">
            <span>RANK {state.rank}</span>
            <span>•</span>
            <span className="text-sky-600">
              人口 {state.population.toLocaleString()}人
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              BEST {Math.max(state.score, highScore).toLocaleString()}
            </span>
          </div>

          {/* "So close!" hook to drive one more try */}
          {gapToNext > 0 && (
            <div className="mt-3 rounded-xl bg-white/85 px-3 py-1.5 text-xs font-extrabold text-amber-700 border border-amber-200">
              次の RANK {state.rank + 1} まで、あとたった{' '}
              <span className="font-display text-sm font-black text-rose-500">
                {gapToNext} pt
              </span>{' '}
              だったよ！
            </div>
          )}
        </div>

        {/* Run Stats Grid */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-500">手数</div>
            <div className="font-display text-lg font-black text-slate-800">
              {state.stats.turns}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-500">最高1手</div>
            <div className="font-display text-lg font-black text-emerald-600">
              +{state.stats.bestTurnScore}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-500">合体数</div>
            <div className="font-display text-lg font-black text-amber-600">
              {state.stats.totalMerges}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-500">最大Lv</div>
            <div className="font-display text-lg font-black text-fuchsia-600">
              Lv{state.stats.maxBuildingLevel}
            </div>
          </div>
        </div>

        {/* Instant Restart CTA */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onRestart(state.mode)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 px-4 text-sm font-black text-white shadow-lg hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            もう1回つくる！
          </button>

          <button
            type="button"
            onClick={() =>
              onRestart(state.mode === 'free' ? 'daily' : 'free')
            }
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3.5 px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            {state.mode === 'free' ? (
              <>
                <CalendarDays className="w-4 h-4 text-amber-500" />
                今日の島へ
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4 text-emerald-500" />
                フリー島へ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
