import React from 'react';
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  Undo2,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getThresholdForRank } from '../game/constants';
import type { GameMode } from '../game/types';

interface HudBarProps {
  score: number;
  population: number;
  highScore: number;
  rank: number;
  mode: GameMode;
  seedLabel: string;
  atmosphereLabel: string;
  isNight: boolean;
  undosLeft: number;
  canUndo: boolean;
  muted: boolean;
  onUndo: () => void;
  onRestart: (mode: GameMode) => void;
  onToggleMute: () => void;
  onOpenGuide: () => void;
}

export const HudBar: React.FC<HudBarProps> = ({
  score,
  population,
  highScore,
  rank,
  mode,
  seedLabel,
  atmosphereLabel,
  isNight,
  undosLeft,
  canUndo,
  muted,
  onUndo,
  onRestart,
  onToggleMute,
  onOpenGuide,
}) => {
  const prevThreshold = getThresholdForRank(rank);
  const nextThreshold = getThresholdForRank(rank + 1);
  const span = Math.max(1, nextThreshold - prevThreshold);
  const progress = Math.min(100, Math.max(0, ((score - prevThreshold) / span) * 100));
  const remainingToNext = Math.max(0, nextThreshold - score);

  return (
    <header
      className={`rounded-3xl px-3.5 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md border shadow-lg transition-colors ${
        isNight
          ? 'bg-slate-900/75 border-slate-700/80 text-slate-100'
          : 'bg-white/85 border-white/80 text-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand & mode switch */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500 text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg sm:text-xl font-black tracking-tight leading-none">
                POCKET ISLE
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isNight
                    ? 'bg-indigo-500/30 text-indigo-200'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {atmosphereLabel}
              </span>
            </div>
            <p className="text-[11px] font-bold opacity-65 mt-0.5">
              {mode === 'tutorial'
                ? 'チュートリアル（練習モード）'
                : mode === 'daily'
                  ? `今日の島 (${seedLabel})`
                  : `フリー島 (${seedLabel})`}
            </p>
          </div>
        </div>

        {/* Mode toggle & utility actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            className={`inline-flex rounded-xl p-0.5 border ${
              isNight
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => onRestart('free')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer ${
                mode === 'free'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              フリー
            </button>
            <button
              type="button"
              onClick={() => onRestart('daily')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer ${
                mode === 'daily'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              今日の島
            </button>
            <button
              type="button"
              onClick={() => onRestart('tutorial')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer ${
                mode === 'tutorial'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              チュートリアル
            </button>
          </div>

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="1手戻す (Z)"
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold border transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              isNight
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">戻す</span>
            <span className="font-display">({undosLeft})</span>
          </button>

          <button
            type="button"
            onClick={() => onRestart(mode)}
            title="すぐやり直す (R)"
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold border transition cursor-pointer ${
              isNight
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">やり直す</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            title="遊び方・シナジー表・実績"
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold border transition cursor-pointer ${
              isNight
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">図鑑</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title="サウンド切替 (M)"
            className={`rounded-xl p-1.5 border transition cursor-pointer ${
              isNight
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {/* Score + Rank Progress */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-2.5 sm:gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">
              SCORE
            </div>
            <div className="font-display text-2xl sm:text-3xl font-black leading-none bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-400/25" />
          <div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
              <Users className="w-3 h-3 text-sky-500" />
              人口
            </div>
            <div className="font-display text-lg sm:text-xl font-extrabold leading-none text-sky-500">
              {population.toLocaleString()}
              <span className="text-[11px] font-bold ml-0.5 opacity-80">人</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-400/25" />
          <div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
              <Trophy className="w-3 h-3 text-amber-500" />
              BEST
            </div>
            <div className="font-display text-lg sm:text-xl font-extrabold leading-none opacity-85">
              {Math.max(score, highScore).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-extrabold">
            <span className="flex items-center gap-1.5">
              <span className="rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 font-display text-[11px] font-black text-white shadow-sm">
                RANK {rank}
              </span>
              <span className="opacity-80">次の都市計画ドラフトまで</span>
            </span>
            <span className="font-display text-amber-500 font-black">
              あと {remainingToNext} pt
            </span>
          </div>
          <div
            className={`h-3 w-full overflow-hidden rounded-full ${
              isNight ? 'bg-slate-800' : 'bg-slate-200/90'
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
