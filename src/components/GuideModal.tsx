import React, { useState } from 'react';
import { Award, BookOpen, X } from 'lucide-react';
import { ACHIEVEMENTS, CARD_META } from '../game/constants';
import type { CardType } from '../game/types';
import { BuildingArt } from './BuildingArt';

interface GuideModalProps {
  unlockedAchievements: string[];
  totalRuns: number;
  bestRank: number;
  onClose: () => void;
}

const ORDERED_CARDS: CardType[] = [
  'house',
  'park',
  'market',
  'harbor',
  'factory',
  'landmark',
  'crystal',
  'bulldozer',
];

export const GuideModal: React.FC<GuideModalProps> = ({
  unlockedAchievements,
  totalRuns,
  bestRank,
  onClose,
}) => {
  const [tab, setTab] = useState<'guide' | 'achievements'>('guide');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[32px] bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-toast-in text-slate-800 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('guide')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                tab === 'guide'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              建物・シナジー図鑑
            </button>
            <button
              type="button"
              onClick={() => setTab('achievements')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                tab === 'achievements'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              実績 ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto pr-1 space-y-3">
          {tab === 'guide' ? (
            <>
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 p-3.5 border border-emerald-200/70 text-xs leading-relaxed space-y-1">
                <div className="font-black text-emerald-800">
                  ハイスコアのコツ（3ステップ）
                </div>
                <p>
                  1. <strong>ホバーで予測チェック</strong>：置く前に光の線と合計点が見えるよ。
                </p>
                <p>
                  2. <strong>同種3つで合体進化(MERGE)</strong>：同じ建物3つをつなげるとLvアップして盤面もスッキリ空く！さらに連鎖(CHAIN)で倍率ドカン！
                </p>
                <p>
                  3. <strong>リクエスト＆ランクUPで手札補充</strong>：山札が尽きる前にどんどん延命しよう！
                </p>
                <p>
                  4. <strong>保管庫(S)＆市長マーク(X)</strong>：今は使わないカードを1枚キープしたり、詰まったマスを市長マークで撤去して大連鎖を仕込めるよ！
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ORDERED_CARDS.map((type) => {
                  const meta = CARD_META[type];
                  return (
                    <div
                      key={type}
                      className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <div className="w-12 h-12 shrink-0">
                        <BuildingArt type={type} level={1} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black">{meta.name}</span>
                          <span className="rounded bg-slate-200 px-1.5 py-0 text-[10px] font-display font-bold">
                            +{meta.baseScores[0]}pt
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {meta.summary}
                        </p>
                        <div className="mt-1 text-[10px] font-bold text-emerald-700">
                          ◎ {meta.likes}
                        </div>
                        {meta.dislikes !== 'なし' && (
                          <div className="text-[10px] font-bold text-rose-600">
                            △ {meta.dislikes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-200 text-xs font-extrabold text-slate-600">
                <span>累計プレイ回数：{totalRuns}回</span>
                <span>到達ベストランク：RANK {bestRank}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                        unlocked
                          ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-55 grayscale'
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-xs border border-slate-100">
                        {ach.emoji}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {ach.title}
                        </div>
                        <div className="text-[11px] text-slate-600 leading-snug">
                          {ach.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
