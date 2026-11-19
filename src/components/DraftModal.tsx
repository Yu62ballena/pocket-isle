import React from 'react';
import { Sparkles } from 'lucide-react';
import { CARD_META } from '../game/constants';
import type { DraftOption } from '../game/types';
import { BuildingArt } from './BuildingArt';

interface DraftModalProps {
  rank: number;
  options: DraftOption[];
  onChoose: (optionId: string) => void;
}

export const DraftModal: React.FC<DraftModalProps> = ({
  rank,
  options,
  onChoose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] bg-white p-5 sm:p-7 shadow-2xl border border-amber-200 animate-toast-in text-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1 text-xs font-display font-black text-white shadow">
            <Sparkles className="w-3.5 h-3.5" />
            RANK {rank} UP!
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
            次の都市計画を1つえらぼう！
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            手札が補充されて、島ぜんたいに強力なパッシブ効果が追加されるよ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChoose(opt.id)}
              className="group relative flex flex-col justify-between rounded-3xl border-2 border-slate-200 bg-slate-50/70 p-4 text-left transition-all duration-200 hover:-translate-y-1.5 hover:border-amber-400 hover:bg-white hover:shadow-xl cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-lg bg-gradient-to-r ${opt.accent} px-2.5 py-0.5 font-display text-[10px] font-black text-white shadow-sm`}
                  >
                    {opt.badge}
                  </span>
                  <span className="font-display text-xs font-black text-emerald-600">
                    +{opt.cards.length} 枚補充
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  {opt.title}
                </h3>
                <p className="mt-0.5 text-xs font-bold text-slate-500 leading-snug">
                  {opt.subtitle}
                </p>

                {/* Passive highlight */}
                <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-200/80 px-3 py-2">
                  <div className="text-[10px] font-extrabold text-amber-700">
                    永続ボーナス
                  </div>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {opt.passiveDescription}
                  </div>
                </div>
              </div>

              {/* Included cards preview */}
              <div className="mt-4">
                <div className="text-[10px] font-extrabold text-slate-400 mb-1.5">
                  追加されるカード
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {opt.cards.map((cardType, i) => (
                    <div
                      key={`${cardType}-${i}`}
                      title={CARD_META[cardType].name}
                      className="flex items-center gap-1 rounded-xl bg-white px-1.5 py-1 border border-slate-200 shadow-xs"
                    >
                      <div className="w-5 h-5">
                        <BuildingArt type={cardType} level={1} />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-700">
                        {CARD_META[cardType].shortName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5 w-full rounded-xl bg-slate-900 py-2 text-center text-xs font-extrabold text-white transition group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500">
                  この計画を採用する
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
