import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, HAND_SIZE, INITIAL_DECK_SIZE } from './constants';
import {
  applyDraftChoice,
  applyPlacement,
  createInitialPassives,
  createNewGame,
  evaluatePlacement,
  swapWithStorehouse,
  undoLastTurn,
  useMayorMark,
} from './engine';
import { TUTORIAL_STEPS } from './tutorial';
import type { Tile } from './types';

function makeEmptyGrassBoard(): Tile[][] {
  return Array.from({ length: BOARD_SIZE }, (_, r) =>
    Array.from({ length: BOARD_SIZE }, (_, c) => ({
      row: r,
      col: c,
      terrain: 'grass' as const,
      isCoastal: r === 0 || r === BOARD_SIZE - 1 || c === 0 || c === BOARD_SIZE - 1,
      building: null,
    })),
  );
}

describe('POCKET ISLE core engine', () => {
  it('initializes deterministic daily games identically', () => {
    const g1 = createNewGame('daily', 'DAILY-2026-11-19');
    const g2 = createNewGame('daily', 'DAILY-2026-11-19');

    expect(g1.hand.length).toBe(HAND_SIZE);
    expect(g1.hand.length + g1.deck.length).toBe(INITIAL_DECK_SIZE);
    expect(g1.board).toEqual(g2.board);
    expect(g1.hand.map((c) => c.type)).toEqual(g2.hand.map((c) => c.type));
  });

  it('computes adjacency synergies and coastal harbor bonus accurately', () => {
    const board = makeEmptyGrassBoard();
    board[0][1].building = { type: 'market', level: 1 };
    board[1][0].building = { type: 'factory', level: 1 };

    const preview = evaluatePlacement(board, 0, 0, 'harbor', createInitialPassives());
    expect(preview.valid).toBe(true);
    expect(preview.coastalBonus).toBe(8);
    expect(preview.synergyScore).toBe(10); // market +5, factory +5
    expect(preview.totalScore).toBe(5 + 10 + 8);
  });

  it('triggers 3-tile merge and chained multi-level evolution', () => {
    const board = makeEmptyGrassBoard();
    // Two Lv1 houses adjacent to (2,2)
    board[2][1].building = { type: 'house', level: 1 };
    board[2][3].building = { type: 'house', level: 1 };
    // Two Lv2 houses adjacent to (2,2) -> triggers CHAIN x2 into Lv3!
    board[1][2].building = { type: 'house', level: 2 };
    board[3][2].building = { type: 'house', level: 2 };

    const preview = evaluatePlacement(board, 2, 2, 'house', createInitialPassives());
    expect(preview.valid).toBe(true);
    expect(preview.chainCount).toBe(2);
    expect(preview.resultingLevel).toBe(3);
    expect(preview.mergeSteps).toHaveLength(2);
    expect(preview.totalScore).toBeGreaterThan(60);
  });

  it('applies placement, clears merged tiles, and supports undo', () => {
    let state = createNewGame('free', 'TEST-SEED');
    state = {
      ...state,
      board: makeEmptyGrassBoard(),
      hand: [
        { id: 'c-1', type: 'house' },
        { id: 'c-2', type: 'park' },
        { id: 'c-3', type: 'market' },
      ],
      selectedHandIndex: 0,
    };
    state.board[2][1].building = { type: 'house', level: 1 };
    state.board[2][3].building = { type: 'house', level: 1 };

    const after = applyPlacement(state, 2, 2);
    expect(after.board[2][2].building).toEqual({ type: 'house', level: 2 });
    expect(after.board[2][1].building).toBeNull();
    expect(after.board[2][3].building).toBeNull();
    expect(after.lastTurnEvent?.chainCount).toBe(1);

    const undone = undoLastTurn(after);
    expect(undone.board[2][2].building).toBeNull();
    expect(undone.board[2][1].building).toEqual({ type: 'house', level: 1 });
    expect(undone.undosLeft).toBe(state.undosLeft - 1);
  });

  it('triggers rank-up draft and applies chosen passive + cards', () => {
    let state = createNewGame('free', 'DRAFT-SEED');
    state = {
      ...state,
      board: makeEmptyGrassBoard(),
      score: 42,
      hand: [{ id: 'c-1', type: 'landmark' }],
      deck: [],
      selectedHandIndex: 0,
    };

    const leveled = applyPlacement(state, 2, 2);
    expect(leveled.rank).toBeGreaterThanOrEqual(2);
    expect(leveled.pendingDraft).not.toBeNull();
    expect(leveled.pendingDraft?.length).toBe(3);

    const chosenId = leveled.pendingDraft![0].id;
    const afterDraft = applyDraftChoice(leveled, chosenId);
    expect(afterDraft.pendingDraft).toBeNull();
    expect(afterDraft.hand.length).toBe(HAND_SIZE);
    expect(afterDraft.passives.appliedDraftIds).toContain(chosenId);
  });

  it('allows bulldozer to clear terrain or buildings and disallows empty grass', () => {
    const board = makeEmptyGrassBoard();
    board[1][1].terrain = 'hill';
    expect(evaluatePlacement(board, 0, 0, 'bulldozer', createInitialPassives()).valid).toBe(false);
    expect(evaluatePlacement(board, 1, 1, 'bulldozer', createInitialPassives()).valid).toBe(true);
  });

  it('completes all 4 tutorial steps smoothly without getting stuck', () => {
    let state = createNewGame('tutorial');
    expect(state.mode).toBe('tutorial');
    expect(state.tutorialCompleted).toBe(false);

    for (const step of TUTORIAL_STEPS) {
      expect(state.hand[state.selectedHandIndex]?.type).toBe(step.requiredCardType);
      state = applyPlacement(state, step.targetRow, step.targetCol);
    }

    expect(state.tutorialCompleted).toBe(true);
    expect(state.score).toBeGreaterThan(0);
    expect(state.stats.totalMerges).toBeGreaterThanOrEqual(1);
  });

  it('morphs wildcard crystal into highest mergeable neighbor and evolves Lv3 -> Lv4', () => {
    const board = makeEmptyGrassBoard();
    board[2][1].building = { type: 'house', level: 3 };
    board[2][3].building = { type: 'house', level: 3 };

    const preview = evaluatePlacement(board, 2, 2, 'crystal', createInitialPassives());
    expect(preview.valid).toBe(true);
    expect(preview.crystalTargetType).toBe('house');
    expect(preview.resultingLevel).toBe(4);
    expect(preview.chainCount).toBe(1);
  });

  it('supports storehouse stashing/swapping and mayor mark clearing', () => {
    let state = createNewGame('free', 'TOOL-SEED');
    const firstCard = state.hand[0];
    state = swapWithStorehouse(state);
    expect(state.storedCard?.id).toBe(firstCard.id);
    expect(state.hand[0].id).not.toBe(firstCard.id);

    // Swap back
    state = swapWithStorehouse(state);
    expect(state.hand[0].id).toBe(firstCard.id);

    // Place a building and clear it with mayor mark
    state = {
      ...state,
      board: makeEmptyGrassBoard(),
      mayorMarks: 1,
    };
    state.board[1][1].building = { type: 'factory', level: 2 };
    const cleared = useMayorMark(state, 1, 1);
    expect(cleared.board[1][1].building).toBeNull();
    expect(cleared.mayorMarks).toBe(0);
    expect(cleared.population).toBe(0);
  });
});
