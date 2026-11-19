import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { CARD_META } from '../game/constants';
import type { Card } from '../game/types';
import { BuildingArt } from './BuildingArt';

interface HandDeckProps {
  hand: Card[];
  deckCount: number;
  selectedIndex: number;
  isNight: boolean;
  onSelect: (index: number) => void;
}

export const HandDeck: React.FC<HandDeckProps> = ({
  hand,
  deckCount,
  selectedIndex,
  isNight,
  onSelect,
}) => {
  const selectedCard = hand[selectedIndex];
  const selectedMeta = selectedCard ? CARD_META[selectedCard.type] : null;
  const totalRemaining = hand.length + deckCount;
  const lowCards = totalRemaining <= 4;

  return (
    <div
      className={`rounded-3xl p-3.5 sm:p-4 backdrop-blur-md border shadow-xl transition-colors ${
        isNight
          ? 'bg-slate-900/75 border-slate-700/80 text-slate-100'
          : 'bg-white/85 border-white/80 text-slate-800'
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">
            手札から1枚えらんで配置
          </span>
          <span className="hidden sm:inline-block rounded-md bg-slate-500/15 px-1.5 py-0.5 text-[10px] font-bold opacity-75">
            キー 1 / 2 / 3
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

      {/* 3 selectable cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {hand.map((card, idx) => {
          const meta = CARD_META[card.type];
          const isSelected = idx === selectedIndex;
          const isSpecial =
            card.type === 'landmark' || card.type === 'bulldozer';
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`relative flex flex-col items-center rounded-2xl p-2 sm:p-3 border-2 transition-all duration-150 cursor-pointer text-left ${
                isSelected
                  ? `bg-gradient-to-b ${meta.accentBg} ${meta.accentBorder} -translate-y-1 shadow-lg ring-2 ring-amber-400/80`
                  : isNight
                    ? 'bg-slate-800/70 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:-translate-y-0.5'
              }`}
            >
              <span
                className={`absolute top-1.5 left-2 rounded-md px-1.5 py-0 text-[10px] font-display font-black ${
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

              <div className="w-12 h-12 sm:w-14 sm:h-14 my-0.5">
                <BuildingArt type={card.type} level={1} isNight={isNight} />
              </div>

              <div className="text-xs sm:text-sm font-extrabold leading-tight">
                {meta.name}
              </div>
              <div className="text-[10px] font-display font-bold opacity-70">
                {card.type === 'bulldozer'
                  ? '更地にする'
                  : `基礎 +${meta.baseScores[0]}pt`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected card synergy quick strip */}
      {selectedMeta && (
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
      )}
    </div>
  );
};
