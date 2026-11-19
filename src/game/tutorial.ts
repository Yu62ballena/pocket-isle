import { BOARD_SIZE } from './constants';
import type { Card, GameState, Quest, Tile } from './types';
import { createInitialPassives, createInitialStats } from './engine';

export interface TutorialStepGuide {
  step: number;
  totalSteps: number;
  title: string;
  instruction: string;
  targetRow: number;
  targetCol: number;
  requiredCardType: Card['type'];
}

export const TUTORIAL_STEPS: TutorialStepGuide[] = [
  {
    step: 1,
    totalSteps: 4,
    title: '① 隣り合わせでスコアUP！',
    instruction:
      '「民家」を公園と森のあいだ（光っているマス）に置いてみよう。相性がいいと緑の線でつながってボーナスが入るよ！',
    targetRow: 2,
    targetCol: 2,
    requiredCardType: 'house',
  },
  {
    step: 2,
    totalSteps: 4,
    title: '② 海沿いボーナス＆リクエスト達成！',
    instruction:
      '「港」を島の端（≈ マークのマス）に置いてみよう。海沿い+8ptに加えて、右の「住民リクエスト」達成で手札が補充されるよ！',
    targetRow: 0,
    targetCol: 3,
    requiredCardType: 'harbor',
  },
  {
    step: 3,
    totalSteps: 4,
    title: '③ 同じ建物3つで合体進化(MERGE)！',
    instruction:
      '光っているマスに「民家」を置くと、同じ民家3つがつながって Lv2 に合体進化！マスが空くから島が広く使えるよ。',
    targetRow: 2,
    targetCol: 3,
    requiredCardType: 'house',
  },
  {
    step: 4,
    totalSteps: 4,
    title: '④ 仕上げの商業コンボ！',
    instruction:
      '最後に「市場」を民家と港の近くに置いてみよう！高得点が出ると街ランクが上がって、新しい遊びが広がるよ。',
    targetRow: 1,
    targetCol: 3,
    requiredCardType: 'market',
  },
];

export function createTutorialGame(): GameState {
  const board: Tile[][] = Array.from({ length: BOARD_SIZE }, (_, r) =>
    Array.from({ length: BOARD_SIZE }, (_, c) => ({
      row: r,
      col: c,
      terrain: 'grass' as const,
      isCoastal: r === 0 || r === BOARD_SIZE - 1 || c === 0 || c === BOARD_SIZE - 1,
      building: null,
    })),
  );

  // Pre-placed setup so every tutorial concept shines immediately
  board[2][1].building = { type: 'park', level: 1 };
  board[1][2].terrain = 'forest';
  board[3][3].building = { type: 'house', level: 1 };
  board[1][4].terrain = 'pond';

  const hand: Card[] = [
    { id: 'tut-1', type: 'house' },
    { id: 'tut-2', type: 'harbor' },
    { id: 'tut-3', type: 'house' },
  ];

  const deck: Card[] = [{ id: 'tut-4', type: 'market' }];

  const quests: Quest[] = [
    {
      id: 'tut-q1',
      kind: 'coastal_harbor',
      title: '海辺の玄関口',
      description: '島の端(海沿い)に港を建てる',
      rewardCards: 1,
      rewardPoints: 14,
    },
    {
      id: 'tut-q2',
      kind: 'trigger_merge',
      title: '街の進化！',
      description: '同じ建物3つをつなげて合体(MERGE)させる',
      rewardCards: 1,
      rewardPoints: 18,
    },
  ];

  return {
    mode: 'tutorial',
    seedLabel: 'TUTORIAL',
    board,
    score: 0,
    rank: 1,
    hand,
    deck,
    quests,
    passives: createInitialPassives(),
    stats: createInitialStats(),
    rngState: 12345,
    cardSeq: 100,
    questSeq: 10,
    selectedHandIndex: 0,
    pendingDraft: null,
    isGameOver: false,
    gameOverReason: null,
    undosLeft: 0,
    history: [],
    lastTurnEvent: null,
    tutorialStep: 0,
    tutorialCompleted: false,
  };
}
