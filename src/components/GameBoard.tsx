import React, { useMemo } from 'react';
import { BOARD_SIZE, CARD_META, TERRAIN_META } from '../game/constants';
import type {
  CardType,
  PlacementPreview,
  Tile,
  TurnEventSummary,
} from '../game/types';
import { BuildingArt, TerrainArt } from './BuildingArt';

interface GameBoardProps {
  board: Tile[][];
  selectedCardType: CardType | null;
  mayorMode: boolean;
  hoveredCoord: { row: number; col: number } | null;
  touchArmedCoord: { row: number; col: number } | null;
  preview: PlacementPreview | null;
  lastTurnEvent: TurnEventSummary | null;
  isNight: boolean;
  seaClass: string;
  shaking: boolean;
  tutorialTarget?: { row: number; col: number } | null;
  onHover: (coord: { row: number; col: number } | null) => void;
  onTileTap: (row: number, col: number, isTouch: boolean) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedCardType,
  mayorMode,
  hoveredCoord,
  touchArmedCoord,
  preview,
  lastTurnEvent,
  isNight,
  seaClass,
  shaking,
  tutorialTarget,
  onHover,
  onTileTap,
}) => {
  const synergyMap = useMemo(() => {
    const map = new Map<string, number>();
    if (preview?.valid) {
      for (const s of preview.synergies) {
        map.set(`${s.sourceRow},${s.sourceCol}`, s.delta);
      }
    }
    return map;
  }, [preview]);

  const mergeConsumedSet = useMemo(() => {
    const set = new Set<string>();
    if (preview?.valid) {
      for (const step of preview.mergeSteps) {
        for (const c of step.consumedCoords) {
          set.add(`${c.row},${c.col}`);
        }
      }
    }
    return set;
  }, [preview]);

  const recentAffectedSet = useMemo(() => {
    const set = new Set<string>();
    if (lastTurnEvent) {
      for (const n of lastTurnEvent.affectedNeighbors) {
        set.add(`${n.row},${n.col}`);
      }
    }
    return set;
  }, [lastTurnEvent]);

  const tileCenterPercent = (idx: number) => ((idx + 0.5) / BOARD_SIZE) * 100;

  return (
    <div
      className={`relative rounded-[28px] p-3 sm:p-4 bg-gradient-to-br ${seaClass} shadow-[0_20px_50px_rgba(15,23,42,0.28)] border border-white/30 transition-all duration-700 select-none ${
        shaking ? 'animate-board-shake' : ''
      }`}
    >
      {/* Decorative ocean ripples */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="animate-wave-drift absolute top-3 left-6 h-1.5 w-16 rounded-full bg-white/30" />
        <div className="animate-wave-drift absolute bottom-4 right-8 h-1.5 w-20 rounded-full bg-white/25" />
        <div className="animate-wave-drift absolute top-1/2 left-2 h-1 w-10 rounded-full bg-white/20" />
      </div>

      {/* Island shoreline frame with 3D thickness */}
      <div className="relative rounded-[22px] bg-amber-200/90 p-2 sm:p-2.5 shadow-[0_8px_0_rgba(180,83,9,0.38),inset_0_2px_4px_rgba(255,255,255,0.75)] border border-amber-100">
        <div
          className="relative grid grid-cols-6 gap-1.5 sm:gap-2 aspect-square"
          onMouseLeave={() => onHover(null)}
        >
          {/* Synergy connection lines SVG overlay */}
          {preview?.valid && preview.synergies.length > 0 && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            >
              {preview.synergies.map((s) => {
                const x1 = tileCenterPercent(preview.col);
                const y1 = tileCenterPercent(preview.row);
                const x2 = tileCenterPercent(s.sourceCol);
                const y2 = tileCenterPercent(s.sourceRow);
                const positive = s.delta > 0;
                return (
                  <line
                    key={`${s.sourceRow}-${s.sourceCol}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={positive ? '#10b981' : '#f43f5e'}
                    strokeWidth="1.2"
                    strokeDasharray={positive ? '2.2 1.4' : '1.4 1.4'}
                    strokeLinecap="round"
                    opacity="0.92"
                  />
                );
              })}
            </svg>
          )}

          {board.map((row) =>
            row.map((tile) => {
              const key = `${tile.row},${tile.col}`;
              const isHovered =
                hoveredCoord?.row === tile.row && hoveredCoord?.col === tile.col;
              const isTouchArmed =
                touchArmedCoord?.row === tile.row &&
                touchArmedCoord?.col === tile.col;
              const isMayorTargetable =
                mayorMode && (tile.building !== null || tile.terrain !== 'grass');
              const isValidTarget = !mayorMode && isHovered && preview?.valid;
              const isInvalidHover = !mayorMode && isHovered && preview && !preview.valid;
              const synergyDelta = synergyMap.get(key);
              const isMergeSource = mergeConsumedSet.has(key);
              const isJustPlaced =
                lastTurnEvent?.row === tile.row &&
                lastTurnEvent?.col === tile.col;
              const isRecentNeighbor = recentAffectedSet.has(key);
              const isTutorialTarget =
                tutorialTarget?.row === tile.row &&
                tutorialTarget?.col === tile.col;
              const isCoastalHint =
                selectedCardType === 'harbor' &&
                tile.isCoastal &&
                tile.terrain === 'grass' &&
                !tile.building &&
                !isHovered;

              const baseTileStyle = isNight
                ? tile.isCoastal
                  ? 'bg-emerald-950/85 border-cyan-500/35'
                  : 'bg-slate-800/90 border-slate-700/80'
                : tile.isCoastal
                  ? 'bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-50 border-emerald-300/80'
                  : 'bg-gradient-to-br from-emerald-50 to-lime-100/90 border-emerald-200/90';

              return (
                <button
                  key={key}
                  type="button"
                  onMouseEnter={() => onHover({ row: tile.row, col: tile.col })}
                  onFocus={() => onHover({ row: tile.row, col: tile.col })}
                  onPointerUp={(e) => {
                    if (e.pointerType === 'touch') {
                      e.preventDefault();
                      onTileTap(tile.row, tile.col, true);
                    }
                  }}
                  onClick={(e) => {
                    // Touch devices are already handled cleanly in onPointerUp with 2-step confirmation
                    if (e.detail === 0 || (e.nativeEvent as PointerEvent).pointerType !== 'touch') {
                      onTileTap(tile.row, tile.col, false);
                    }
                  }}
                  title={
                    tile.building
                      ? `${CARD_META[tile.building.type].levelNames[tile.building.level - 1]} (Lv${tile.building.level})`
                      : `${TERRAIN_META[tile.terrain].name} — ${TERRAIN_META[tile.terrain].hint}`
                  }
                  className={`group relative aspect-square rounded-xl sm:rounded-2xl border-2 transition-all duration-150 flex items-center justify-center overflow-visible focus:outline-none ${baseTileStyle} ${
                    isMayorTargetable
                      ? isHovered
                        ? 'z-30 -translate-y-0.5 border-orange-500 ring-2 ring-orange-400 cursor-pointer'
                        : 'border-orange-400/70 border-dashed cursor-pointer'
                      : isTutorialTarget
                        ? 'z-30 border-sky-400 ring-4 ring-sky-300/80 animate-pulse cursor-pointer'
                        : isValidTarget
                          ? preview.chainCount > 0
                            ? 'z-30 -translate-y-0.5 border-amber-400 animate-pulse-gold cursor-pointer'
                            : 'z-30 -translate-y-0.5 border-emerald-400 ring-2 ring-emerald-300/70 shadow-lg cursor-pointer'
                          : isInvalidHover
                            ? 'border-rose-400/80 opacity-80 cursor-not-allowed'
                            : isMergeSource
                              ? 'z-20 border-amber-400 animate-pulse-gold'
                              : synergyDelta !== undefined
                                ? synergyDelta > 0
                                  ? 'z-20 border-emerald-400 ring-2 ring-emerald-300/60'
                                  : 'z-20 border-rose-400 ring-2 ring-rose-300/60'
                                : isCoastalHint
                                  ? 'border-sky-400/80 ring-1 ring-sky-300/60 cursor-pointer'
                                  : 'hover:brightness-105 cursor-pointer shadow-[inset_0_-3px_0_rgba(15,23,42,0.08)]'
                  }`}
                >
                  {/* Mayor Mode hover badge */}
                  {isMayorTargetable && isHovered && (
                    <span className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-display font-black text-white shadow-md">
                      {isTouchArmed ? 'もう1回で撤去' : '市長撤去'}
                    </span>
                  )}
                  {/* Tutorial Target Marker */}
                  {isTutorialTarget && !isHovered && (
                    <span className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-display font-black text-white shadow-md animate-bounce">
                      ここ！
                    </span>
                  )}
                  {/* Subtle coastal wave dot indicator for empty coastal tiles */}
                  {tile.isCoastal && !tile.building && tile.terrain === 'grass' && (
                    <span
                      className={`pointer-events-none absolute top-1 left-1.5 text-[9px] font-bold opacity-55 ${
                        isNight ? 'text-cyan-300' : 'text-sky-600'
                      }`}
                    >
                      ≈
                    </span>
                  )}

                  {/* Natural terrain art */}
                  {!tile.building && tile.terrain !== 'grass' && (
                    <div className="w-[82%] h-[82%] pointer-events-none">
                      <TerrainArt terrain={tile.terrain} />
                    </div>
                  )}

                  {/* Placed building */}
                  {tile.building && (
                    <div
                      key={
                        isJustPlaced
                          ? `placed-${lastTurnEvent?.turnNumber}`
                          : isRecentNeighbor
                            ? `ripple-${lastTurnEvent?.turnNumber}`
                            : 'idle'
                      }
                      className={`w-[88%] h-[88%] pointer-events-none ${
                        isJustPlaced
                          ? lastTurnEvent?.chainCount
                            ? 'animate-merge-burst'
                            : 'animate-pop-place'
                          : isRecentNeighbor
                            ? 'animate-neighbor-ripple'
                            : ''
                      }`}
                    >
                      <BuildingArt
                        type={tile.building.type}
                        level={tile.building.level}
                        isNight={isNight}
                      />
                    </div>
                  )}

                  {/* Building level badge */}
                  {tile.building && tile.building.type !== 'landmark' && (
                    <span
                      className={`pointer-events-none absolute bottom-0.5 right-1 rounded-md px-1 py-0 text-[9px] sm:text-[10px] font-display font-extrabold leading-tight shadow-sm ${
                        tile.building.level >= 4
                          ? 'bg-gradient-to-r from-amber-400 to-fuchsia-500 text-white'
                          : tile.building.level === 3
                            ? 'bg-amber-400 text-slate-900'
                            : tile.building.level === 2
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-900/65 text-white'
                      }`}
                    >
                      Lv{tile.building.level}
                    </span>
                  )}

                  {/* Hover Ghost Preview */}
                  {isValidTarget && selectedCardType && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="w-[82%] h-[82%] opacity-75 scale-105 transition-transform">
                        <BuildingArt
                          type={preview.crystalTargetType ?? selectedCardType}
                          level={preview.resultingLevel ?? 1}
                          isNight={isNight}
                        />
                      </div>
                      {/* Live score prediction bubble */}
                      <div
                        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] sm:text-xs font-display font-black shadow-lg border ${
                          preview.chainCount >= 2
                            ? 'bg-gradient-to-r from-fuchsia-500 via-amber-400 to-rose-500 text-white border-white'
                            : preview.chainCount === 1
                              ? 'bg-amber-400 text-slate-950 border-amber-100'
                              : preview.totalScore >= 18
                                ? 'bg-emerald-500 text-white border-emerald-200'
                                : 'bg-slate-900 text-white border-white/30'
                        }`}
                      >
                        {isTouchArmed ? 'もう1回で決定 ' : ''}
                        {preview.chainCount >= 2
                          ? `CHAIN×${preview.chainCount} +${preview.totalScore}`
                          : preview.chainCount === 1
                            ? `MERGE! +${preview.totalScore}`
                            : selectedCardType === 'bulldozer'
                              ? `整地 +${preview.totalScore}`
                              : `+${preview.totalScore}`}
                      </div>
                    </div>
                  )}

                  {/* Synergy neighbor floating delta badge */}
                  {synergyDelta !== undefined && (
                    <span
                      className={`pointer-events-none absolute -top-2.5 right-0 z-30 rounded-full px-1.5 py-0.5 text-[10px] font-display font-black shadow-md ${
                        synergyDelta > 0
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {synergyDelta > 0 ? `+${synergyDelta}` : synergyDelta}
                    </span>
                  )}

                  {/* Merge source indicator */}
                  {isMergeSource && (
                    <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 rounded-full bg-amber-400 px-1.5 py-0 text-[9px] font-display font-black text-slate-950 shadow">
                      合体!
                    </span>
                  )}

                  {/* Floating Score Pop after actual placement */}
                  {isJustPlaced && lastTurnEvent && (
                    <div
                      key={`float-${lastTurnEvent.turnNumber}`}
                      className="pointer-events-none absolute top-0 left-1/2 z-40 animate-float-up whitespace-nowrap"
                    >
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-display text-xs sm:text-sm font-black shadow-xl ${
                          lastTurnEvent.chainCount >= 2
                            ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-white'
                            : lastTurnEvent.chainCount === 1
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {lastTurnEvent.chainCount >= 2
                          ? `CHAIN×${lastTurnEvent.chainCount}! +${lastTurnEvent.totalScore}`
                          : lastTurnEvent.chainCount === 1
                            ? `EVOLVE Lv${lastTurnEvent.mergedToLevel}! +${lastTurnEvent.totalScore}`
                            : `+${lastTurnEvent.totalScore}`}
                      </span>
                    </div>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Bottom subtle hint strip */}
      <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-bold text-white/90 drop-shadow-sm">
        <span>≈ 島の端は海沿いボーナス対象（港 +8pt）</span>
        <span>同種3つ隣接で合体進化！</span>
      </div>
    </div>
  );
};
