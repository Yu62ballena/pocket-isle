import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { DraftModal } from './components/DraftModal';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { GuideModal } from './components/GuideModal';
import { HandDeck } from './components/HandDeck';
import { HudBar } from './components/HudBar';
import { QuestPanel } from './components/QuestPanel';
import { ACHIEVEMENTS, getAtmosphereForRank } from './game/constants';
import {
  applyDraftChoice,
  applyMayorMark,
  applyPlacement,
  createNewGame,
  evaluatePlacement,
  swapWithStorehouse,
  undoLastTurn,
} from './game/engine';
import { getTodayDateKey } from './game/rng';
import { sound } from './game/sound';
import {
  clearActiveGame,
  loadActiveGame,
  loadProgress,
  saveActiveGame,
  saveProgress,
} from './game/storage';
import { TUTORIAL_STEPS } from './game/tutorial';
import type { GameMode, GameState, StoredProgress } from './game/types';

interface ToastItem {
  id: string;
  text: string;
  tone: 'emerald' | 'amber' | 'fuchsia';
}

export function App() {
  const [progress, setProgress] = useState<StoredProgress>(() => {
    const loaded = loadProgress();
    sound.setMuted(loaded.muted);
    return loaded;
  });

  const [game, setGame] = useState<GameState>(() => {
    const saved = loadActiveGame();
    return saved ?? createNewGame('free');
  });
  const [hoveredCoord, setHoveredCoord] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [touchArmedCoord, setTouchArmedCoord] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isNewBestRun, setIsNewBestRun] = useState(false);

  const shakeTimerRef = useRef<number | null>(null);

  // Auto-save active run so players can resume anytime after closing/reloading
  useEffect(() => {
    saveActiveGame(game);
  }, [game]);

  const pushToast = useCallback(
    (text: string, tone: ToastItem['tone'] = 'emerald') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2800);
    },
    [],
  );

  const triggerShake = useCallback(() => {
    setShaking(false);
    if (shakeTimerRef.current) {
      window.clearTimeout(shakeTimerRef.current);
    }
    window.requestAnimationFrame(() => {
      setShaking(true);
      shakeTimerRef.current = window.setTimeout(() => setShaking(false), 300);
    });
  }, []);

  const atmosphere = useMemo(() => getAtmosphereForRank(game.rank), [game.rank]);

  const currentHighScore = useMemo(() => {
    if (game.mode === 'tutorial') return 0;
    if (game.mode === 'daily') {
      return progress.highScoreDaily[getTodayDateKey()] ?? 0;
    }
    return progress.highScoreFree;
  }, [game.mode, progress]);

  const activeTutorialGuide = useMemo(() => {
    if (game.mode !== 'tutorial' || game.tutorialCompleted) return null;
    return TUTORIAL_STEPS[game.tutorialStep ?? 0] ?? null;
  }, [game.mode, game.tutorialCompleted, game.tutorialStep]);

  const selectedCard = game.hand[game.selectedHandIndex] ?? null;

  const preview = useMemo(() => {
    if (!hoveredCoord || !selectedCard || game.isGameOver || game.pendingDraft) {
      return null;
    }
    if (
      activeTutorialGuide &&
      (hoveredCoord.row !== activeTutorialGuide.targetRow ||
        hoveredCoord.col !== activeTutorialGuide.targetCol ||
        selectedCard.type !== activeTutorialGuide.requiredCardType)
    ) {
      return null;
    }
    return evaluatePlacement(
      game.board,
      hoveredCoord.row,
      hoveredCoord.col,
      selectedCard.type,
      game.passives,
    );
  }, [
    activeTutorialGuide,
    game.board,
    game.isGameOver,
    game.passives,
    game.pendingDraft,
    hoveredCoord,
    selectedCard,
  ]);

  const persistProgress = useCallback((updater: (prev: StoredProgress) => StoredProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const handleSelectCard = useCallback(
    (index: number) => {
      if (activeTutorialGuide) {
        const clicked = game.hand[index];
        if (clicked && clicked.type !== activeTutorialGuide.requiredCardType) {
          pushToast('チュートリアル中は光っているガイドの手順で進めてね！', 'amber');
          return;
        }
      }
      sound.playCardSelect();
      setTouchArmedCoord(null);
      setGame((prev) => ({
        ...prev,
        mayorMode: false,
        selectedHandIndex: Math.min(index, Math.max(0, prev.hand.length - 1)),
      }));
    },
    [activeTutorialGuide, game.hand, pushToast],
  );

  const handleSwapStorehouse = useCallback(() => {
    if (game.mode === 'tutorial' || game.isGameOver || game.pendingDraft) return;
    const next = swapWithStorehouse(game);
    if (next === game) return;
    sound.playCardSelect();
    setTouchArmedCoord(null);
    setGame(next);
    pushToast(
      game.storedCard
        ? '保管庫のカードと入れ替えたよ！'
        : 'カードを保管庫にキープしたよ！',
      'amber',
    );
  }, [game, pushToast]);

  const handleToggleMayorMode = useCallback(() => {
    if (game.mode === 'tutorial' || game.mayorMarks <= 0) return;
    sound.playCardSelect();
    setTouchArmedCoord(null);
    setGame((prev) => ({ ...prev, mayorMode: !prev.mayorMode }));
  }, [game.mayorMarks, game.mode]);

  const handleRestart = useCallback(
    (mode: GameMode) => {
      sound.playCardSelect();
      clearActiveGame();
      setIsNewBestRun(false);
      setHoveredCoord(null);
      setTouchArmedCoord(null);
      setGame(createNewGame(mode));
      pushToast(
        mode === 'tutorial'
          ? 'チュートリアル開始！光るマスに置いてみよう'
          : mode === 'daily'
            ? '今日の島に挑戦スタート！'
            : 'あたらしい島を生成したよ！',
        'emerald',
      );
    },
    [pushToast],
  );

  const handleToggleMute = useCallback(() => {
    persistProgress((prev) => {
      const muted = !prev.muted;
      sound.setMuted(muted);
      return { ...prev, muted };
    });
  }, [persistProgress]);

  const handleUndo = useCallback(() => {
    if (game.undosLeft <= 0 || game.history.length === 0) return;
    sound.playUndo();
    setGame((prev) => undoLastTurn(prev));
    pushToast('1手まえに戻したよ', 'amber');
  }, [game.history.length, game.undosLeft, pushToast]);

  const handlePlace = useCallback(
    (row: number, col: number) => {
      if (game.isGameOver || game.pendingDraft) return;
      const card = game.hand[game.selectedHandIndex];
      if (!card) return;

      const check = evaluatePlacement(game.board, row, col, card.type, game.passives);
      if (!check.valid) return;

      const next = applyPlacement(game, row, col, progress.unlockedAchievements);
      setGame(next);

      const ev = next.lastTurnEvent;
      if (!ev) return;

      // Audio & tactile juice
      if (card.type === 'bulldozer') {
        sound.playBulldoze();
      } else if (ev.chainCount > 0) {
        sound.playMerge(ev.chainCount, ev.mergedToLevel ?? 2);
        triggerShake();
        void confetti({
          particleCount: ev.chainCount >= 2 ? 75 : 32,
          spread: ev.chainCount >= 2 ? 80 : 52,
          origin: { y: 0.55 },
          colors: ['#fbbf24', '#34d399', '#38bdf8', '#f472b6'],
        });
      } else {
        sound.playPlace(ev.synergyCount, ev.synergyCount === 0 && check.synergyScore < 0);
      }

      // Quest completion feedback
      if (ev.completedQuests.length > 0) {
        window.setTimeout(() => sound.playQuestComplete(), 160);
        for (const q of ev.completedQuests) {
          pushToast(
            `リクエスト達成「${q.title}」 +${q.rewardCards}枚 / +${q.rewardPoints}pt`,
            'emerald',
          );
        }
      }

      // Rank up feedback
      if (ev.leveledUpTo !== null) {
        window.setTimeout(() => sound.playRankUp(), 220);
        void confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.4 },
        });
      }

      // Achievements
      if (ev.unlockedAchievements.length > 0) {
        for (const id of ev.unlockedAchievements) {
          const def = ACHIEVEMENTS.find((a) => a.id === id);
          if (def) {
            pushToast(`実績解除 ${def.emoji} ${def.title}`, 'fuchsia');
          }
        }
      }

      // Persist best score / achievements / run count (skip during tutorial)
      if (next.mode !== 'tutorial') {
        const todayKey = getTodayDateKey();
        const prevBest =
          next.mode === 'daily'
            ? (progress.highScoreDaily[todayKey] ?? 0)
            : progress.highScoreFree;
        if (next.score > prevBest && next.score > 0) {
          setIsNewBestRun(true);
        }

        persistProgress((prev) => {
          const nextDaily = { ...prev.highScoreDaily };
          let nextFree = prev.highScoreFree;
          if (next.mode === 'daily') {
            nextDaily[todayKey] = Math.max(nextDaily[todayKey] ?? 0, next.score);
          } else {
            nextFree = Math.max(nextFree, next.score);
          }

          const mergedAchievements = Array.from(
            new Set([...prev.unlockedAchievements, ...ev.unlockedAchievements]),
          );

          return {
            ...prev,
            highScoreFree: nextFree,
            highScoreDaily: nextDaily,
            bestRank: Math.max(prev.bestRank, next.rank),
            totalRuns: next.isGameOver ? prev.totalRuns + 1 : prev.totalRuns,
            unlockedAchievements: mergedAchievements,
          };
        });
      } else if (next.tutorialCompleted) {
        window.setTimeout(() => sound.playRankUp(), 200);
        void confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.45 },
        });
      }

      if (next.isGameOver) {
        window.setTimeout(() => sound.playGameOver(), 280);
      }
    },
    [game, persistProgress, progress, pushToast, triggerShake],
  );

  const handleChooseDraft = useCallback(
    (optionId: string) => {
      sound.playQuestComplete();
      setGame((prev) => {
        const next = applyDraftChoice(prev, optionId);
        if (next.isGameOver) {
          persistProgress((p) => ({ ...p, totalRuns: p.totalRuns + 1 }));
          window.setTimeout(() => sound.playGameOver(), 250);
        }
        return next;
      });
      pushToast('あたらしい都市計画を採用したよ！', 'amber');
    },
    [persistProgress, pushToast],
  );

  const handleTileTap = useCallback(
    (row: number, col: number, isTouch: boolean) => {
      if (game.isGameOver || game.pendingDraft) return;

      // Touch 2-step confirmation to eliminate accidental mis-taps on mobile
      if (isTouch) {
        const alreadyArmed =
          touchArmedCoord?.row === row && touchArmedCoord?.col === col;
        if (!alreadyArmed) {
          setHoveredCoord({ row, col });
          setTouchArmedCoord({ row, col });
          sound.playHoverTick();
          return;
        }
      }

      setTouchArmedCoord(null);

      // Mayor Mark emergency clear mode
      if (game.mayorMode) {
        const cleared = applyMayorMark(game, row, col);
        if (cleared !== game) {
          sound.playBulldoze();
          setGame(cleared);
          pushToast('市長マークで更地にしたよ！', 'amber');
        }
        return;
      }

      handlePlace(row, col);
    },
    [game, handlePlace, pushToast, touchArmedCoord],
  );

  // Keyboard shortcuts: 1/2/3 card select, S storehouse, X mayor mode, Z undo, R restart, M mute
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (guideOpen || game.pendingDraft || game.isGameOver) return;
      if (e.key === '1' && game.hand.length >= 1) handleSelectCard(0);
      if (e.key === '2' && game.hand.length >= 2) handleSelectCard(1);
      if (e.key === '3' && game.hand.length >= 3) handleSelectCard(2);
      if (e.key === 's' || e.key === 'S') handleSwapStorehouse();
      if (e.key === 'x' || e.key === 'X') handleToggleMayorMode();
      if ((e.key === 'z' || e.key === 'Z') && !e.metaKey && !e.ctrlKey) {
        handleUndo();
      }
      if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey) {
        handleRestart(game.mode);
      }
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    game.hand.length,
    game.isGameOver,
    game.mode,
    game.pendingDraft,
    guideOpen,
    handleRestart,
    handleSelectCard,
    handleSwapStorehouse,
    handleToggleMayorMode,
    handleToggleMute,
    handleUndo,
  ]);

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br ${atmosphere.bgClass} transition-colors duration-1000 relative overflow-x-hidden`}
    >
      {/* Night starfield layer */}
      {atmosphere.isNight && (
        <div
          className="pointer-events-none fixed inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 14% 18%, #fef08a, transparent), radial-gradient(1.5px 1.5px at 78% 12%, #e0f2fe, transparent), radial-gradient(2px 2px at 42% 9%, #ffffff, transparent), radial-gradient(1.5px 1.5px at 88% 36%, #fde047, transparent), radial-gradient(1.5px 1.5px at 22% 48%, #bae6fd, transparent)',
          }}
        />
      )}

      {/* Floating Toasts */}
      <div className="pointer-events-none fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 w-[92vw] max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white shadow-xl border border-white/25 ${
              t.tone === 'fuchsia'
                ? 'bg-gradient-to-r from-fuchsia-600 to-amber-500'
                : t.tone === 'amber'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="relative z-10 mx-auto max-w-5xl px-3 sm:px-5 py-4 sm:py-6 flex flex-col gap-4">
        <HudBar
          score={game.score}
          population={game.population}
          highScore={currentHighScore}
          rank={game.rank}
          mode={game.mode}
          seedLabel={game.seedLabel}
          atmosphereLabel={atmosphere.label}
          isNight={atmosphere.isNight}
          undosLeft={game.undosLeft}
          canUndo={game.undosLeft > 0 && game.history.length > 0 && !game.pendingDraft}
          muted={progress.muted}
          onUndo={handleUndo}
          onRestart={handleRestart}
          onToggleMute={handleToggleMute}
          onOpenGuide={() => setGuideOpen(true)}
        />

        <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-4 items-start">
          {/* Left: Tutorial Guide (if active) + Island Board + Live Breakdown + Hand Deck */}
          <div className="flex flex-col gap-3.5">
            {activeTutorialGuide && (
              <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-500 p-3.5 sm:p-4 text-white shadow-lg border border-white/30 animate-toast-in">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5 font-display text-[11px] font-black">
                    STEP {activeTutorialGuide.step} / {activeTutorialGuide.totalSteps}
                  </span>
                  <span className="text-[11px] font-bold opacity-90">
                    光っている「ここ！」マスをクリック
                  </span>
                </div>
                <div className="mt-1.5 text-sm sm:text-base font-black">
                  {activeTutorialGuide.title}
                </div>
                <p className="mt-0.5 text-xs font-bold text-white/95 leading-relaxed">
                  {activeTutorialGuide.instruction}
                </p>
              </div>
            )}

            <GameBoard
              board={game.board}
              selectedCardType={selectedCard?.type ?? null}
              mayorMode={game.mayorMode}
              hoveredCoord={hoveredCoord}
              touchArmedCoord={touchArmedCoord}
              preview={preview}
              lastTurnEvent={game.lastTurnEvent}
              isNight={atmosphere.isNight}
              seaClass={atmosphere.seaClass}
              shaking={shaking}
              tutorialTarget={
                activeTutorialGuide
                  ? {
                      row: activeTutorialGuide.targetRow,
                      col: activeTutorialGuide.targetCol,
                    }
                  : null
              }
              onHover={setHoveredCoord}
              onTileTap={handleTileTap}
            />

            {/* Live score breakdown strip for instant readability */}
            <div
              className={`min-h-[38px] rounded-2xl px-3.5 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 border transition-colors ${
                atmosphere.isNight
                  ? 'bg-slate-900/70 border-slate-700/80 text-slate-200'
                  : 'bg-white/75 border-white/80 text-slate-700'
              }`}
            >
              {preview?.valid ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-500/15 px-2 py-0.5 font-display">
                      基礎 +{preview.baseScore}
                    </span>
                    {preview.synergyScore !== 0 && (
                      <span
                        className={`rounded-md px-2 py-0.5 font-display ${
                          preview.synergyScore > 0
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-rose-500/15 text-rose-600'
                        }`}
                      >
                        隣接 {preview.synergyScore > 0 ? `+${preview.synergyScore}` : preview.synergyScore}
                      </span>
                    )}
                    {preview.coastalBonus > 0 && (
                      <span className="rounded-md bg-sky-500/15 text-sky-600 px-2 py-0.5 font-display">
                        海沿い +{preview.coastalBonus}
                      </span>
                    )}
                    {preview.mergeScore > 0 && (
                      <span className="rounded-md bg-amber-400/25 text-amber-600 px-2 py-0.5 font-display font-black">
                        合体 +{preview.mergeScore} (×{preview.multiplier})
                      </span>
                    )}
                  </div>
                  <span className="font-display text-sm font-black text-emerald-500">
                    合計 +{preview.totalScore} pt
                  </span>
                </>
              ) : (
                <span className="opacity-70">
                  島の上のマスにカーソルを合わせると、獲得スコアと隣接シナジーがリアルタイムで見えるよ
                </span>
              )}
            </div>

            <HandDeck
              hand={game.hand}
              deckCount={game.deck.length}
              storedCard={game.storedCard}
              mayorMarks={game.mayorMarks}
              mayorMode={game.mayorMode}
              isTutorial={game.mode === 'tutorial'}
              selectedIndex={game.selectedHandIndex}
              isNight={atmosphere.isNight}
              onSelect={handleSelectCard}
              onSwapStorehouse={handleSwapStorehouse}
              onToggleMayorMode={handleToggleMayorMode}
            />
          </div>

          {/* Right: Resident Quests, Active Draft Passives, Stats */}
          <QuestPanel
            quests={game.quests}
            passives={game.passives}
            bestTurnScore={game.stats.bestTurnScore}
            maxChain={game.stats.maxChain}
            isNight={atmosphere.isNight}
          />
        </main>
      </div>

      {/* Roguelike Draft Modal */}
      {game.pendingDraft && (
        <DraftModal
          rank={game.rank}
          options={game.pendingDraft}
          onChoose={handleChooseDraft}
        />
      )}

      {/* Game Over Postcard Modal */}
      {game.isGameOver && (
        <GameOverModal
          state={game}
          highScore={currentHighScore}
          isNewBest={isNewBestRun}
          onRestart={handleRestart}
        />
      )}

      {/* Tutorial Completed Modal */}
      {game.tutorialCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 sm:p-7 shadow-2xl border-2 border-emerald-200 animate-toast-in text-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-3.5 py-1 text-xs font-display font-black text-white shadow">
              TUTORIAL CLEAR!
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              バッチリ！ルールマスターだね！
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
              「隣接シナジー」「海沿いボーナス」「3つ合体進化」「リクエスト達成」の4つを覚えれば、あとはもう思う存分コンボを狙うだけ！
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => handleRestart('free')}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 px-4 text-sm font-black text-white shadow-lg hover:brightness-105 transition cursor-pointer"
              >
                フリー島で本番スタート！
              </button>
              <button
                type="button"
                onClick={() => handleRestart('daily')}
                className="rounded-2xl bg-amber-100 py-3.5 px-4 text-xs font-extrabold text-amber-800 hover:bg-amber-200 transition cursor-pointer"
              >
                今日の島へ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Building & Achievements Guide Modal */}
      {guideOpen && (
        <GuideModal
          unlockedAchievements={progress.unlockedAchievements}
          totalRuns={progress.totalRuns}
          bestRank={progress.bestRank}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
