import React from 'react';
import { Award, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { DRAFT_POOL } from '../game/constants';
import type { PassiveState, Quest } from '../game/types';

interface QuestPanelProps {
  quests: Quest[];
  passives: PassiveState;
  bestTurnScore: number;
  maxChain: number;
  isNight: boolean;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({
  quests,
  passives,
  bestTurnScore,
  maxChain,
  isNight,
}) => {
  const passiveBadges = passives.appliedDraftIds
    .map((id) => DRAFT_POOL.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <aside className="flex flex-col gap-2.5">
      {/* Resident Quests */}
      <section
        className={`rounded-3xl p-3.5 backdrop-blur-md border shadow-lg transition-colors ${
          isNight
            ? 'bg-slate-900/75 border-slate-700/80 text-slate-100'
            : 'bg-white/85 border-white/80 text-slate-800'
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
            <Target className="w-4 h-4 text-emerald-500" />
            住民のリクエスト
          </h2>
          <span className="text-[10px] font-bold opacity-65">達成で手札補充！</span>
        </div>

        <div className="space-y-1.5">
          {quests.map((q) => (
            <div
              key={q.id}
              className={`rounded-2xl px-3 py-2 border transition ${
                isNight
                  ? 'bg-slate-800/80 border-slate-700'
                  : 'bg-gradient-to-br from-emerald-50/80 to-sky-50/70 border-emerald-200/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold">{q.title}</div>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                    {q.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-lg bg-emerald-500 px-1.5 py-0.5 font-display text-[10px] font-black text-white shadow-sm">
                    +{q.rewardCards}枚
                  </span>
                  <div className="font-display text-[10px] font-extrabold text-amber-500 mt-0.5">
                    +{q.rewardPoints}pt
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Roguelike Passives */}
      <section
        className={`rounded-3xl p-4 backdrop-blur-md border shadow-lg transition-colors ${
          isNight
            ? 'bg-slate-900/75 border-slate-700/80 text-slate-100'
            : 'bg-white/85 border-white/80 text-slate-800'
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            発動中の都市計画
          </h2>
          <span className="font-display text-xs font-black text-amber-500">
            {passiveBadges.length}
          </span>
        </div>

        {passiveBadges.length === 0 ? (
          <p className="text-xs opacity-65 leading-relaxed">
            ランク2になると3択の「都市計画ドラフト」が解放！毎回ちがう街ビルドを組もう。
          </p>
        ) : (
          <div className="space-y-1.5">
            {passiveBadges.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className={`flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-xs border ${
                  isNight
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-amber-50/70 border-amber-200/70'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">{item.title}</span>
                  <span className="block text-[11px] opacity-75">
                    {item.passiveDescription}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live Run Mini Stats */}
      <section
        className={`rounded-3xl p-3.5 backdrop-blur-md border shadow-lg grid grid-cols-2 gap-2 ${
          isNight
            ? 'bg-slate-900/75 border-slate-700/80 text-slate-100'
            : 'bg-white/85 border-white/80 text-slate-800'
        }`}
      >
        <div
          className={`rounded-2xl p-2.5 text-center ${
            isNight ? 'bg-slate-800/80' : 'bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold opacity-65">
            <Award className="w-3 h-3 text-amber-500" />
            ベスト1手
          </div>
          <div className="font-display text-lg font-black text-emerald-500">
            +{bestTurnScore}
          </div>
        </div>
        <div
          className={`rounded-2xl p-2.5 text-center ${
            isNight ? 'bg-slate-800/80' : 'bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold opacity-65">最大連鎖</div>
          <div className="font-display text-lg font-black text-fuchsia-500">
            {maxChain > 0 ? `×${maxChain}` : '-'}
          </div>
        </div>
      </section>
    </aside>
  );
};
