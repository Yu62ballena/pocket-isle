import React from 'react';
import { Archive, Hammer, Layers, Sparkles } from 'lucide-react';
import { CARD_META, MAX_MAYOR_MARKS } from '../game/constants';
import type { Card } from '../game/types';
import { BuildingArt } from './BuildingArt';

interface HandDeckProps {
  hand: Card[];
  deckCount: number;
  storedCard: Card | null;
  mayorMarks: number;
  mayorMode: boolean;
  isTutorial: boolean;
  selectedIndex: number;
  isNight: boolean;
  onSelect: (index: number) => void;
  onSwapStorehouse: () => void;
  onToggleMayorMode: () => void;
}

export const HandDeck: React.FC<HandDeckProps> = ({
  hand,
  deckCount,
  storedCard,
  mayorMarks,
  mayorMode,
  isTutorial,
  selectedIndex,
  isNight,
  onSelect,
  onSwapStorehouse,
  onToggleMayorMode,
}) => {
  const selectedCard = hand[selectedIndex];
  const selectedMeta = selectedCard ? CARD_META[selectedCard.type] : null;
  const totalRemaining = hand.length + deckCount + (storedCard ? 1 : 0);
  const lowCards = totalRemaining <= 4 && !isTutorial;

  return (
    <div
      className={`rounded-3xl p-3.5 sm:p-4 backdrop-blur-md border shadow-xl transition-colors ${
        isNight
          ? 'bg-slate-900/75 border-slate-700/80 text-slate-100'
          : 'bg-white/85 border-white/80 text-slate-800'
      }`}
    >
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">
            {mayorMode
              ? '市長モード：撤去したいマスを選んでね！'
              : '手札から1枚えらんで配置'}
          </span>
          <span className="hidden sm:inline-block rounded-md bg-slate-500/15 px-1.5 py-0.5 text-[10px] font-bold opacity-75">
            1/2/3 • S:キープ • X:市長
          </span>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-display font-extrabold border ${
            lowCards
              ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
              : isNight
                ? 'bg-slate-800 text-sky-300 border-slate-700'
                : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>残り {totalRemaining} 枚</span>
          <span className="opacity-70 text-[10px]">(山札 {deckCount})</span>
        </div>
      </div>

      {/* 3 selectable cards + Storehouse & Mayor Mark controls */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
        {hand.map((card, idx) => {
          const meta = CARD_META[card.type];
          const isSelected = !mayorMode && idx === selectedIndex;
          const isSpecial =
            card.type === 'landmark' ||
            card.type === 'bulldozer' ||
            card.type === 'crystal';
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`relative flex flex-col items-center rounded-2xl p-2 sm:p-2.5 border-2 transition-all duration-150 cursor-pointer text-left ${
                isSelected
                  ? `bg-gradient-to-b ${meta.accentBg} ${meta.accentBorder} -translate-y-1 shadow-lg ring-2 ring-amber-400/80`
                  : isNight
                    ? 'bg-slate-800/70 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:-translate-y-0.5'
              }`}
            >
              <span
                className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0 text-[10px] font-display font-black ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950'
                    : isNight
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {idx + 1}
              </span>

              {isSpecial && (
                <span className="absolute top-1.5 right-1.5 text-fuchsia-500">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              )}

              <div className="w-11 h-11 sm:w-12 sm:h-12 my-0.5">
                <BuildingArt type={card.type} level={1} isNight={isNight} />
              </div>

              <div className="text-xs font-extrabold leading-tight text-center">
                {meta.shortName}
              </div>
              <div className="text-[10px] font-display font-bold opacity-70">
                {card.type === 'bulldozer'
                  ? '更地化'
                  : card.type === 'crystal'
                    ? '万能合体'
                    : `+${meta.baseScores[0]}pt`}
              </div>
            </button>
          );
        })}

        {/* Storehouse (Keep slot - inspired by Triple Town) */}
        <button
          type="button"
          disabled={isTutorial || (hand.length <= 1 && deckCount === 0 && !storedCard)}
          onClick={onSwapStorehouse}
          title="選択中のカードを保管庫と入れ替え (S)"
          className={`col-span-3 sm:col-span-1 relative flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 rounded-2xl p-2 sm:p-2.5 border-2 border-dashed transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            storedCard
              ? isNight
                ? 'bg-indigo-950/70 border-cyan-400/70 hover:border-cyan-300'
                : 'bg-sky-50/90 border-sky-400/80 hover:bg-sky-100/80'
              : isNight
                ? 'bg-slate-800/40 border-slate-600 hover:border-slate-400'
                : 'bg-slate-50/70 border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="hidden sm:inline-block absolute top-1.5 left-1.5 rounded-md bg-slate-500/20 px-1 py-0 text-[9px] font-display font-black opacity-75">
            S
          </span>
          {storedCard ? (
            <>
              <div className="w-9 h-9 sm:w-11 sm:h-11">
                <BuildingArt type={storedCard.type} level={1} isNight={isNight} />
              </div>
              <div className="text-left sm:text-center">
                <div className="text-[11px] font-extrabold leading-tight">
                  キープ：{CARD_META[storedCard.type].shortName}
                </div>
                <div className="text-[9px] font-bold opacity-70">押して入替</div>
              </div>
            </>
          ) : (
            <>
              <Archive className="w-5 h-5 sm:w-6 sm:h-6 opacity-60 sm:my-2" />
              <div className="text-left sm:text-center">
                <div className="text-[11px] font-extrabold leading-tight">
                  保管庫(空)
                </div>
                <div className="text-[9px] font-bold opacity-65">1枚キープ</div>
              </div>
            </>
          )}
        </button>

        {/* Mayor Mark (Emergency clear charge - inspired by SubaraCity) */}
        <button
          type="button"
          disabled={isTutorial || mayorMarks <= 0}
          onClick={onToggleMayorMode}
          title="市長マークで好きな1マスを撤去 (X) — Rank3ごとに+1回復"
          className={`col-span-3 sm:col-span-1 relative flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 rounded-2xl p-2 sm:p-2.5 border-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
            mayorMode
              ? 'bg-gradient-to-b from-orange-500 to-rose-500 text-white border-amber-200 ring-2 ring-orange-400 shadow-lg -translate-y-0.5'
              : isNight
                ? 'bg-slate-800/70 border-orange-500/50 hover:border-orange-400'
                : 'bg-orange-50/80 border-orange-300/80 hover:bg-orange-100/80'
          }`}
        >
          <span
            className={`hidden sm:inline-block absolute top-1.5 left-1.5 rounded-md px-1 py-0 text-[9px] font-display font-black ${
              mayorMode ? 'bg-white/25 text-white' : 'bg-orange-500/15 text-orange-700'
            }`}
          >
            X
          </span>
          <Hammer
            className={`w-5 h-5 sm:w-6 sm:h-6 sm:my-1.5 ${
              mayorMode ? 'text-white animate-bounce' : 'text-orange-500'
            }`}
          />
          <div className="text-left sm:text-center">
            <div className="text-[11px] font-extrabold leading-tight">
              市長マーク
            </div>
            <div className="font-display text-[10px] font-black">
              {mayorMarks} / {MAX_MAYOR_MARKS}
            </div>
          </div>
        </button>
      </div>

      {/* Selected card synergy quick strip */}
      {mayorMode ? (
        <div
          className={`mt-2.5 rounded-2xl px-3 py-2 text-xs font-bold flex items-center justify-between border ${
            isNight
              ? 'bg-orange-950/60 border-orange-500/50 text-orange-200'
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}
        >
          <span>手札を使わず、邪魔な建物や森・丘・池を1マス撤去できるよ！</span>
          <button
            type="button"
            onClick={onToggleMayorMode}
            className="ml-2 shrink-0 rounded-lg bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white cursor-pointer"
          >
            やめる
          </button>
        </div>
      ) : (
        selectedMeta && (
          <div
            className={`mt-2.5 rounded-2xl px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-1.5 border ${
              isNight
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                相性◎
              </span>
              <span className="font-bold">{selectedMeta.likes}</span>
            </div>
            {selectedMeta.dislikes !== 'なし' && (
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-600">
                  注意
                </span>
                <span className="font-bold opacity-85">
                  {selectedMeta.dislikes}
                </span>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
