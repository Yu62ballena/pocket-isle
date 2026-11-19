import {
  BOARD_SIZE,
  BUILDING_SYNERGY,
  calculatePopulation,
  CARD_META,
  DRAFT_POOL,
  getThresholdForRank,
  HAND_SIZE,
  INITIAL_DECK_SIZE,
  MAX_MAYOR_MARKS,
  MAX_UNDOS,
  TERRAIN_META,
  TERRAIN_SYNERGY,
} from './constants';
import {
  createRandomSeedLabel,
  getTodayDateKey,
  hashStringToSeed,
  randomInt,
  shuffleWithRng,
} from './rng';
import { createTutorialGame, TUTORIAL_STEPS } from './tutorial';
import type {
  BuildingType,
  Card,
  CardType,
  DraftOption,
  GameMode,
  GameSnapshot,
  GameState,
  MergeStepPreview,
  PassiveState,
  PlacementPreview,
  Quest,
  QuestKind,
  RunStats,
  SynergyDetail,
  TerrainType,
  Tile,
  TurnEventSummary,
} from './types';

const ORTHO_DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

const ALL_8_DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

const BASE_BUILDING_POOL: BuildingType[] = [
  'house',
  'house',
  'house',
  'park',
  'park',
  'market',
  'market',
  'harbor',
  'harbor',
  'factory',
];

const QUEST_CATALOG: Record<
  QuestKind,
  { title: string; description: string; rewardCards: number; rewardPoints: number }
> = {
  place_pair_house_park: {
    title: '緑のある暮らし',
    description: '民家と公園を隣り合わせにする',
    rewardCards: 2,
    rewardPoints: 14,
  },
  trigger_merge: {
    title: '街の進化！',
    description: '同じ建物3つをつなげて合体(MERGE)させる',
    rewardCards: 2,
    rewardPoints: 18,
  },
  coastal_harbor: {
    title: '海辺の玄関口',
    description: '島の端(海沿い)に港を建てる',
    rewardCards: 2,
    rewardPoints: 14,
  },
  place_market_near_house: {
    title: '商店街のにぎわい',
    description: '民家と市場を隣り合わせにする',
    rewardCards: 2,
    rewardPoints: 14,
  },
  place_factory_near_harbor: {
    title: '物流ライン開通',
    description: '工場と港を隣り合わせにする',
    rewardCards: 2,
    rewardPoints: 16,
  },
  big_turn_22: {
    title: 'ナイス設計！',
    description: '1手の配置で22pt以上を獲得する',
    rewardCards: 2,
    rewardPoints: 16,
  },
  big_turn_40: {
    title: '天才アーキテクト',
    description: '1手の配置で40pt以上を獲得する',
    rewardCards: 3,
    rewardPoints: 25,
  },
  reach_lv3: {
    title: 'ランドスケープ革命',
    description: '合体進化でLv3以上の建物を完成させる',
    rewardCards: 3,
    rewardPoints: 28,
  },
  trigger_chain: {
    title: '奇跡のダブル連鎖',
    description: '1手で2連鎖(CHAIN x2)以上を決める',
    rewardCards: 3,
    rewardPoints: 30,
  },
  place_landmark: {
    title: '街のシンボル',
    description: 'ランドマークを島に建設する',
    rewardCards: 2,
    rewardPoints: 20,
  },
};

export function createInitialPassives(): PassiveState {
  return {
    parkSynergyBonus: 0,
    marketMultiplier: 0,
    factoryPenaltyHalved: false,
    mergeMultiplierBonus: 0,
    mergeFlatBonus: 0,
    allBaseBonus: 0,
    coastalBonusExtra: 0,
    appliedDraftIds: [],
  };
}

export function createInitialStats(): RunStats {
  return {
    turns: 0,
    bestTurnScore: 0,
    maxChain: 0,
    totalMerges: 0,
    maxBuildingLevel: 1,
    questsCompleted: 0,
    buildingCounts: {
      house: 0,
      park: 0,
      market: 0,
      factory: 0,
      harbor: 0,
      landmark: 0,
    },
  };
}

export function cloneBoard(board: Tile[][]): Tile[][] {
  return board.map((row) =>
    row.map((tile) => ({
      ...tile,
      building: tile.building ? { ...tile.building } : null,
    })),
  );
}

function cloneSnapshot(state: GameSnapshot): GameSnapshot {
  return {
    board: cloneBoard(state.board),
    score: state.score,
    population: state.population,
    rank: state.rank,
    hand: state.hand.map((c) => ({ ...c })),
    deck: state.deck.map((c) => ({ ...c })),
    storedCard: state.storedCard ? { ...state.storedCard } : null,
    mayorMarks: state.mayorMarks,
    quests: state.quests.map((q) => ({ ...q })),
    passives: {
      ...state.passives,
      appliedDraftIds: [...state.passives.appliedDraftIds],
    },
    stats: {
      ...state.stats,
      buildingCounts: { ...state.stats.buildingCounts },
    },
    rngState: state.rngState,
    cardSeq: state.cardSeq,
    questSeq: state.questSeq,
  };
}

function generateBoard(rngStart: number): { board: Tile[][]; nextState: number } {
  let rng = rngStart;
  const board: Tile[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const isCoastal =
        r === 0 || r === BOARD_SIZE - 1 || c === 0 || c === BOARD_SIZE - 1;
      row.push({
        row: r,
        col: c,
        terrain: 'grass',
        isCoastal,
        building: null,
      });
    }
    board.push(row);
  }

  // Natural landmarks give each island a fresh spatial puzzle immediately
  const features: TerrainType[] = [
    'forest',
    'forest',
    'forest',
    'pond',
    'pond',
    'hill',
    'hill',
  ];

  // Prefer interior tiles for ponds/hills slightly so coastlines stay open for harbors
  const coords: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      coords.push({ r, c });
    }
  }
  const shuffled = shuffleWithRng(coords, rng);
  rng = shuffled.nextState;

  let idx = 0;
  for (const terrain of features) {
    while (idx < shuffled.items.length) {
      const { r, c } = shuffled.items[idx++];
      if (board[r][c].terrain === 'grass') {
        board[r][c].terrain = terrain;
        break;
      }
    }
  }

  return { board, nextState: rng };
}

function buildInitialDeck(
  rngStart: number,
  cardSeqStart: number,
): { deck: Card[]; nextState: number; nextCardSeq: number } {
  let rng = rngStart;
  let seq = cardSeqStart;
  // Balanced opening guaranteed to allow early merges & synergies
  const types: CardType[] = [
    'house',
    'house',
    'house',
    'house',
    'house',
    'park',
    'park',
    'park',
    'park',
    'market',
    'market',
    'market',
    'market',
    'harbor',
    'harbor',
    'harbor',
    'factory',
    'factory',
    'factory',
    'house',
  ];
  while (types.length < INITIAL_DECK_SIZE) {
    const pick = randomInt(rng, BASE_BUILDING_POOL.length);
    rng = pick.nextState;
    types.push(BASE_BUILDING_POOL[pick.value]);
  }
  const shuffled = shuffleWithRng(types, rng);
  rng = shuffled.nextState;

  const deck: Card[] = shuffled.items.map((type) => ({
    id: `c-${seq++}`,
    type,
  }));

  return { deck, nextState: rng, nextCardSeq: seq };
}

function pickQuest(
  rank: number,
  existingKinds: QuestKind[],
  rngStart: number,
  questSeq: number,
): { quest: Quest; nextState: number; nextQuestSeq: number } {
  const earlyKinds: QuestKind[] = [
    'place_pair_house_park',
    'coastal_harbor',
    'place_market_near_house',
    'trigger_merge',
    'big_turn_22',
    'place_factory_near_harbor',
  ];
  const advancedKinds: QuestKind[] = [
    ...earlyKinds,
    'big_turn_40',
    'reach_lv3',
    'trigger_chain',
  ];
  const pool = (rank >= 3 ? advancedKinds : earlyKinds).filter(
    (k) => !existingKinds.includes(k),
  );
  const candidates = pool.length > 0 ? pool : earlyKinds;
  const pick = randomInt(rngStart, candidates.length);
  const kind = candidates[pick.value];
  const meta = QUEST_CATALOG[kind];
  return {
    quest: {
      id: `q-${questSeq}`,
      kind,
      ...meta,
    },
    nextState: pick.nextState,
    nextQuestSeq: questSeq + 1,
  };
}

export function createNewGame(mode: GameMode, customSeedLabel?: string): GameState {
  if (mode === 'tutorial') {
    return createTutorialGame();
  }
  const seedLabel =
    customSeedLabel ??
    (mode === 'daily' ? `DAILY-${getTodayDateKey()}` : createRandomSeedLabel());
  let rng = hashStringToSeed(seedLabel);

  const boardRes = generateBoard(rng);
  rng = boardRes.nextState;

  const deckRes = buildInitialDeck(rng, 1);
  rng = deckRes.nextState;
  const cardSeq = deckRes.nextCardSeq;

  const hand = deckRes.deck.slice(0, HAND_SIZE);
  const deck = deckRes.deck.slice(HAND_SIZE);

  let questSeq = 1;
  const q1 = pickQuest(1, [], rng, questSeq);
  rng = q1.nextState;
  questSeq = q1.nextQuestSeq;

  const q2 = pickQuest(1, [q1.quest.kind], rng, questSeq);
  rng = q2.nextState;
  questSeq = q2.nextQuestSeq;

  return {
    mode,
    seedLabel,
    board: boardRes.board,
    score: 0,
    population: 0,
    rank: 1,
    hand,
    deck,
    storedCard: null,
    mayorMarks: 1,
    quests: [q1.quest, q2.quest],
    passives: createInitialPassives(),
    stats: createInitialStats(),
    rngState: rng,
    cardSeq,
    questSeq,
    selectedHandIndex: 0,
    mayorMode: false,
    pendingDraft: null,
    isGameOver: false,
    gameOverReason: null,
    undosLeft: MAX_UNDOS,
    history: [],
    lastTurnEvent: null,
  };
}

export function canPlaceCard(
  board: Tile[][],
  row: number,
  col: number,
  cardType: CardType,
): boolean {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
  const tile = board[row][col];
  if (cardType === 'bulldozer') {
    return tile.building !== null || tile.terrain !== 'grass';
  }
  return tile.terrain === 'grass' && tile.building === null;
}

function findConnectedSameBuildings(
  board: Tile[][],
  startRow: number,
  startCol: number,
): Array<{ row: number; col: number }> {
  const origin = board[startRow][startCol].building;
  if (!origin) return [];
  const visited = new Set<string>();
  const queue: Array<{ row: number; col: number }> = [{ row: startRow, col: startCol }];
  const group: Array<{ row: number; col: number }> = [];
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    group.push(cur);
    for (const [dr, dc] of ORTHO_DIRS) {
      const nr = cur.row + dr;
      const nc = cur.col + dc;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      const nb = board[nr][nc].building;
      if (nb && nb.type === origin.type && nb.level === origin.level) {
        visited.add(key);
        queue.push({ row: nr, col: nc });
      }
    }
  }
  return group;
}

export function evaluatePlacement(
  board: Tile[][],
  row: number,
  col: number,
  cardType: CardType,
  passives: PassiveState,
): PlacementPreview {
  if (!canPlaceCard(board, row, col, cardType)) {
    return {
      valid: false,
      row,
      col,
      cardType,
      baseScore: 0,
      synergyScore: 0,
      coastalBonus: 0,
      mergeScore: 0,
      chainCount: 0,
      multiplier: 1,
      totalScore: 0,
      synergies: [],
      mergeSteps: [],
    };
  }

  if (cardType === 'bulldozer') {
    return {
      valid: true,
      row,
      col,
      cardType,
      baseScore: 5,
      synergyScore: 0,
      coastalBonus: 0,
      mergeScore: 0,
      chainCount: 0,
      multiplier: 1,
      totalScore: 5,
      synergies: [],
      mergeSteps: [],
    };
  }

  // Wildcard Crystal: automatically morphs into the highest-value mergeable neighbor match (even Lv2->Lv3 or Lv3->Lv4!)
  if (cardType === 'crystal') {
    let bestPreview: PlacementPreview | null = null;
    const seenCandidates = new Set<string>();

    for (const [dr, dc] of ORTHO_DIRS) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
      const nb = board[nr][nc].building;
      if (!nb || !CARD_META[nb.type].mergeable || nb.level >= 4) continue;

      const candKey = `${nb.type}:${nb.level}`;
      if (seenCandidates.has(candKey)) continue;
      seenCandidates.add(candKey);

      const sim = cloneBoard(board);
      sim[row][col].building = { type: nb.type, level: nb.level };
      const initialGroup = findConnectedSameBuildings(sim, row, col);
      if (initialGroup.length < 3) continue;

      const mergeSteps: MergeStepPreview[] = [];
      let mergeScore = 0;
      let curLv: 1 | 2 | 3 | 4 = nb.level;
      while (curLv < 4) {
        const group = findConnectedSameBuildings(sim, row, col);
        if (group.length < 3) break;
        const nextLv = (curLv + 1) as 2 | 3 | 4;
        const consumed = group.filter((g) => !(g.row === row && g.col === col));
        for (const c of consumed) {
          sim[c.row][c.col].building = null;
        }
        sim[row][col].building = { type: nb.type, level: nextLv };
        const extraTilesBonus = (group.length - 3) * 8;
        const stepBonus =
          Math.round(CARD_META[nb.type].baseScores[nextLv - 1] * 0.85) +
          passives.mergeFlatBonus +
          extraTilesBonus;
        mergeScore += stepBonus;
        mergeSteps.push({
          level: nextLv,
          buildingType: nb.type,
          consumedCoords: consumed,
          bonus: stepBonus,
        });
        curLv = nextLv;
      }

      const chainCount = mergeSteps.length;
      const baseScore = 12 + passives.allBaseBonus;
      const baseMult =
        chainCount === 1 ? 1.45 : chainCount === 2 ? 2.2 : chainCount === 3 ? 3.2 : 4.2;
      const multiplier = Number((baseMult + passives.mergeMultiplierBonus).toFixed(2));
      const totalScore = Math.round((baseScore + mergeScore) * multiplier);

      const candidate: PlacementPreview = {
        valid: true,
        row,
        col,
        cardType: 'crystal',
        baseScore,
        synergyScore: 0,
        coastalBonus: 0,
        mergeScore,
        chainCount,
        multiplier,
        totalScore,
        synergies: [],
        mergeSteps,
        resultingLevel: curLv,
        crystalTargetType: nb.type,
      };

      if (
        !bestPreview ||
        (candidate.resultingLevel ?? 1) > (bestPreview.resultingLevel ?? 1) ||
        ((candidate.resultingLevel ?? 1) === (bestPreview.resultingLevel ?? 1) &&
          candidate.totalScore > bestPreview.totalScore)
      ) {
        bestPreview = candidate;
      }
    }

    if (bestPreview) {
      return bestPreview;
    }

    // Fallback: if no 2+ matching neighbors, crystal acts as a shining mini-landmark
    const fallback = evaluatePlacement(board, row, col, 'landmark', passives);
    return {
      ...fallback,
      cardType: 'crystal',
      baseScore: 12 + passives.allBaseBonus,
      totalScore: Math.max(12, fallback.totalScore - 8),
      crystalTargetType: 'landmark',
      resultingLevel: 1,
    };
  }

  const buildingType: BuildingType = cardType;
  const tile = board[row][col];
  const baseScore = CARD_META[buildingType].baseScores[0] + passives.allBaseBonus;
  const dirs = buildingType === 'landmark' ? ALL_8_DIRS : ORTHO_DIRS;
  const synergies: SynergyDetail[] = [];
  let synergyScore = 0;

  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
    const neighbor = board[nr][nc];

    if (neighbor.building) {
      let delta = BUILDING_SYNERGY[buildingType][neighbor.building.type] ?? 0;
      if (delta !== 0) {
        // Upgraded neighbors amplify positive synergies
        if (delta > 0 && neighbor.building.level > 1) {
          delta += (neighbor.building.level - 1) * 2;
        }
        // Eco passive boosts park synergies
        if (
          delta > 0 &&
          passives.parkSynergyBonus > 0 &&
          (buildingType === 'park' || neighbor.building.type === 'park')
        ) {
          delta += passives.parkSynergyBonus;
        }
        // Clean factory (Lv3+) or industrial passive halves factory penalties
        const involvesFactory =
          buildingType === 'factory' || neighbor.building.type === 'factory';
        const cleanFactory =
          neighbor.building.type === 'factory' && neighbor.building.level >= 3;
        if (delta < 0 && involvesFactory && (passives.factoryPenaltyHalved || cleanFactory)) {
          delta = Math.ceil(delta / 2);
        }

        synergyScore += delta;
        synergies.push({
          sourceRow: nr,
          sourceCol: nc,
          delta,
          label: CARD_META[neighbor.building.type].shortName,
        });
      }
    } else if (neighbor.terrain !== 'grass') {
      let delta = TERRAIN_SYNERGY[buildingType][neighbor.terrain] ?? 0;
      if (delta > 0 && passives.parkSynergyBonus > 0 && buildingType === 'park') {
        delta += passives.parkSynergyBonus;
      }
      if (delta !== 0) {
        synergyScore += delta;
        synergies.push({
          sourceRow: nr,
          sourceCol: nc,
          delta,
          label: TERRAIN_META[neighbor.terrain].name,
        });
      }
    }
  }

  let coastalBonus = 0;
  if (buildingType === 'harbor' && tile.isCoastal) {
    coastalBonus = 8 + passives.coastalBonusExtra;
  }

  // Simulate merge & chain reactions on a cloned board
  const simBoard = cloneBoard(board);
  simBoard[row][col].building = { type: buildingType, level: 1 };

  const mergeSteps: MergeStepPreview[] = [];
  let mergeScore = 0;
  let currentLevel: 1 | 2 | 3 | 4 = 1;

  if (CARD_META[buildingType].mergeable) {
    while (currentLevel < 4) {
      const group = findConnectedSameBuildings(simBoard, row, col);
      if (group.length < 3) break;

      const nextLevel = (currentLevel + 1) as 2 | 3 | 4;
      const consumed = group.filter((g) => !(g.row === row && g.col === col));
      for (const c of consumed) {
        simBoard[c.row][c.col].building = null;
      }
      simBoard[row][col].building = { type: buildingType, level: nextLevel };

      const extraTilesBonus = (group.length - 3) * 8;
      const stepBonus =
        Math.round(CARD_META[buildingType].baseScores[nextLevel - 1] * 0.75) +
        passives.mergeFlatBonus +
        extraTilesBonus;

      mergeScore += stepBonus;
      mergeSteps.push({
        level: nextLevel,
        buildingType,
        consumedCoords: consumed,
        bonus: stepBonus,
      });
      currentLevel = nextLevel;
    }
  }

  const chainCount = mergeSteps.length;
  let raw = Math.max(1, baseScore + synergyScore + coastalBonus);
  if (buildingType === 'market' && passives.marketMultiplier > 0) {
    raw = Math.round(raw * (1 + passives.marketMultiplier));
  }

  let multiplier = 1;
  if (chainCount > 0) {
    const baseMult =
      chainCount === 1 ? 1.35 : chainCount === 2 ? 2.0 : chainCount === 3 ? 3.0 : 4.0;
    multiplier = Number((baseMult + passives.mergeMultiplierBonus).toFixed(2));
  }

  const totalScore = Math.round((raw + mergeScore) * multiplier);

  return {
    valid: true,
    row,
    col,
    cardType,
    baseScore,
    synergyScore,
    coastalBonus,
    mergeScore,
    chainCount,
    multiplier,
    totalScore,
    synergies,
    mergeSteps,
    resultingLevel: currentLevel,
  };
}

function hasAnyValidMove(board: Tile[][], hand: Card[]): boolean {
  for (const card of hand) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlaceCard(board, r, c, card.type)) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkQuestCompleted(
  quest: Quest,
  boardAfter: Tile[][],
  preview: PlacementPreview,
): boolean {
  const { row, col, cardType } = preview;
  if (cardType === 'bulldozer') return false;

  const hasOrthogonalNeighbor = (targetType: BuildingType) =>
    ORTHO_DIRS.some(([dr, dc]) => {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return false;
      return boardAfter[nr][nc].building?.type === targetType;
    });

  switch (quest.kind) {
    case 'place_pair_house_park':
      return (
        (cardType === 'house' && hasOrthogonalNeighbor('park')) ||
        (cardType === 'park' && hasOrthogonalNeighbor('house'))
      );
    case 'place_market_near_house':
      return (
        (cardType === 'market' && hasOrthogonalNeighbor('house')) ||
        (cardType === 'house' && hasOrthogonalNeighbor('market'))
      );
    case 'place_factory_near_harbor':
      return (
        (cardType === 'factory' && hasOrthogonalNeighbor('harbor')) ||
        (cardType === 'harbor' && hasOrthogonalNeighbor('factory'))
      );
    case 'coastal_harbor':
      return cardType === 'harbor' && boardAfter[row][col].isCoastal;
    case 'trigger_merge':
      return preview.chainCount >= 1;
    case 'trigger_chain':
      return preview.chainCount >= 2;
    case 'big_turn_22':
      return preview.totalScore >= 22;
    case 'big_turn_40':
      return preview.totalScore >= 40;
    case 'reach_lv3':
      return (preview.resultingLevel ?? 1) >= 3;
    case 'place_landmark':
      return cardType === 'landmark';
    default:
      return false;
  }
}

function pickDraftOptions(rngStart: number): {
  options: DraftOption[];
  nextState: number;
} {
  const shuffled = shuffleWithRng(DRAFT_POOL, rngStart);
  return {
    options: shuffled.items.slice(0, 3),
    nextState: shuffled.nextState,
  };
}

function computeUnlockedAchievements(
  score: number,
  rank: number,
  stats: RunStats,
  alreadyUnlocked: string[],
): string[] {
  const newly: string[] = [];
  const check = (id: string, cond: boolean) => {
    if (cond && !alreadyUnlocked.includes(id)) {
      newly.push(id);
    }
  };
  check('first_merge', stats.totalMerges >= 1);
  check('chain_reaction', stats.maxChain >= 2);
  check('sky_high', stats.maxBuildingLevel >= 3);
  check('ultimate_lv4', stats.maxBuildingLevel >= 4);
  check('big_shot_50', stats.bestTurnScore >= 50);
  check('golden_hour', rank >= 5);
  check('starlight_city', rank >= 7);
  check('score_800', score >= 800);
  return newly;
}

export function applyPlacement(
  state: GameState,
  row: number,
  col: number,
  alreadyUnlockedAchievements: string[] = [],
): GameState {
  if (state.isGameOver || state.pendingDraft || state.tutorialCompleted) return state;
  const selectedCard = state.hand[state.selectedHandIndex];
  if (!selectedCard) return state;

  if (state.mode === 'tutorial') {
    const tutStep = TUTORIAL_STEPS[state.tutorialStep ?? 0];
    if (
      !tutStep ||
      selectedCard.type !== tutStep.requiredCardType ||
      row !== tutStep.targetRow ||
      col !== tutStep.targetCol
    ) {
      return state;
    }
  }

  const preview = evaluatePlacement(
    state.board,
    row,
    col,
    selectedCard.type,
    state.passives,
  );
  if (!preview.valid) return state;

  // Save snapshot for Undo before mutating
  const snapshot = cloneSnapshot(state);
  const nextHistory = [...state.history, snapshot].slice(-MAX_UNDOS);

  const nextBoard = cloneBoard(state.board);
  let rng = state.rngState;
  let cardSeq = state.cardSeq;
  let questSeq = state.questSeq;

  if (selectedCard.type === 'bulldozer') {
    nextBoard[row][col].building = null;
    nextBoard[row][col].terrain = 'grass';
  } else if (selectedCard.type === 'crystal') {
    const targetType: BuildingType = preview.crystalTargetType ?? 'landmark';
    nextBoard[row][col].building = {
      type: targetType,
      level: 1,
    };
    for (const step of preview.mergeSteps) {
      for (const c of step.consumedCoords) {
        nextBoard[c.row][c.col].building = null;
      }
      nextBoard[row][col].building = {
        type: step.buildingType,
        level: step.level,
      };
    }
  } else {
    nextBoard[row][col].building = {
      type: selectedCard.type,
      level: 1,
    };
    for (const step of preview.mergeSteps) {
      for (const c of step.consumedCoords) {
        nextBoard[c.row][c.col].building = null;
      }
      nextBoard[row][col].building = {
        type: step.buildingType,
        level: step.level,
      };
    }
  }

  // Remove used card from hand
  const nextHand = state.hand.filter((_, i) => i !== state.selectedHandIndex);
  const nextDeck = [...state.deck];
  let nextStoredCard = state.storedCard ? { ...state.storedCard } : null;

  // Update stats
  const nextStats: RunStats = {
    ...state.stats,
    turns: state.stats.turns + 1,
    bestTurnScore: Math.max(state.stats.bestTurnScore, preview.totalScore),
    maxChain: Math.max(state.stats.maxChain, preview.chainCount),
    totalMerges: state.stats.totalMerges + preview.chainCount,
    maxBuildingLevel: Math.max(
      state.stats.maxBuildingLevel,
      preview.resultingLevel ?? 1,
    ),
    buildingCounts: { ...state.stats.buildingCounts },
  };
  if (selectedCard.type === 'crystal') {
    const resolvedType = preview.crystalTargetType ?? 'landmark';
    nextStats.buildingCounts[resolvedType] += 1;
  } else if (selectedCard.type !== 'bulldozer') {
    nextStats.buildingCounts[selectedCard.type] += 1;
  }

  let nextScore = state.score + preview.totalScore;

  // Evaluate quests
  const completedQuests: Quest[] = [];
  const remainingQuests: Quest[] = [];
  for (const q of state.quests) {
    if (checkQuestCompleted(q, nextBoard, preview)) {
      completedQuests.push(q);
      nextScore += q.rewardPoints;
      nextStats.questsCompleted += 1;
      for (let i = 0; i < q.rewardCards; i++) {
        const pick = randomInt(rng, BASE_BUILDING_POOL.length);
        rng = pick.nextState;
        nextDeck.unshift({
          id: `c-${cardSeq++}`,
          type: BASE_BUILDING_POOL[pick.value],
        });
      }
    } else {
      remainingQuests.push(q);
    }
  }

  // Refill hand from deck (and auto-pull from storehouse if both hand & deck are empty)
  while (nextHand.length < HAND_SIZE && nextDeck.length > 0) {
    nextHand.push(nextDeck.shift()!);
  }
  if (nextHand.length === 0 && nextStoredCard) {
    nextHand.push(nextStoredCard);
    nextStoredCard = null;
  }

  // Compute rank progression & Mayor Mark refill every 3 ranks (Rank 3, 6, 9...)
  let nextRank = state.rank;
  while (nextScore >= getThresholdForRank(nextRank + 1)) {
    nextRank += 1;
  }
  const leveledUpTo = nextRank > state.rank ? nextRank : null;
  const mayorMarksEarned =
    state.mode === 'tutorial'
      ? 0
      : Math.max(0, Math.floor(nextRank / 3) - Math.floor(state.rank / 3));
  const nextMayorMarks = Math.min(
    MAX_MAYOR_MARKS,
    state.mayorMarks + mayorMarksEarned,
  );
  const nextPopulation = calculatePopulation(nextBoard);

  // Refill completed quests
  const nextQuests = [...remainingQuests];
  while (nextQuests.length < 2) {
    const existingKinds = nextQuests.map((q) => q.kind);
    const picked = pickQuest(nextRank, existingKinds, rng, questSeq);
    rng = picked.nextState;
    questSeq = picked.nextQuestSeq;
    nextQuests.push(picked.quest);
  }

  // Trigger roguelike draft on rank-up (skip during tutorial)
  let pendingDraft: DraftOption[] | null = null;
  if (leveledUpTo !== null && state.mode !== 'tutorial') {
    const draftRes = pickDraftOptions(rng);
    rng = draftRes.nextState;
    pendingDraft = draftRes.options;
  }

  const nextTutorialStep =
    state.mode === 'tutorial' ? (state.tutorialStep ?? 0) + 1 : undefined;
  const tutorialCompleted =
    state.mode === 'tutorial'
      ? (nextTutorialStep ?? 0) >= TUTORIAL_STEPS.length
      : undefined;

  const unlockedAchievements =
    state.mode === 'tutorial'
      ? []
      : computeUnlockedAchievements(
          nextScore,
          nextRank,
          nextStats,
          alreadyUnlockedAchievements,
        );

  // Check game over only if no draft is waiting (and not in tutorial)
  let isGameOver = false;
  let gameOverReason: GameState['gameOverReason'] = null;
  if (!pendingDraft && state.mode !== 'tutorial') {
    if (nextHand.length === 0) {
      isGameOver = true;
      gameOverReason = 'no_cards';
    } else if (
      !hasAnyValidMove(nextBoard, nextHand) &&
      (!nextStoredCard || !hasAnyValidMove(nextBoard, [nextStoredCard])) &&
      nextMayorMarks === 0
    ) {
      isGameOver = true;
      gameOverReason = 'board_full';
    }
  }

  let nextSelectedIndex = Math.min(
    state.selectedHandIndex,
    Math.max(0, nextHand.length - 1),
  );
  if (state.mode === 'tutorial' && !tutorialCompleted && nextTutorialStep !== undefined) {
    const nextGuide = TUTORIAL_STEPS[nextTutorialStep];
    if (nextGuide) {
      const matchIdx = nextHand.findIndex((c) => c.type === nextGuide.requiredCardType);
      if (matchIdx !== -1) {
        nextSelectedIndex = matchIdx;
      }
    }
  }

  const lastTurnEvent: TurnEventSummary = {
    turnNumber: nextStats.turns,
    row,
    col,
    cardType: selectedCard.type,
    totalScore: preview.totalScore,
    chainCount: preview.chainCount,
    mergedToLevel: preview.chainCount > 0 ? (preview.resultingLevel ?? null) : null,
    synergyCount: preview.synergies.filter((s) => s.delta > 0).length,
    completedQuests,
    leveledUpTo,
    unlockedAchievements,
    affectedNeighbors: preview.synergies.map((s) => ({
      row: s.sourceRow,
      col: s.sourceCol,
      delta: s.delta,
    })),
  };

  return {
    ...state,
    board: nextBoard,
    score: nextScore,
    population: nextPopulation,
    rank: nextRank,
    hand: nextHand,
    deck: nextDeck,
    storedCard: nextStoredCard,
    mayorMarks: nextMayorMarks,
    quests: nextQuests,
    stats: nextStats,
    rngState: rng,
    cardSeq,
    questSeq,
    selectedHandIndex: nextSelectedIndex,
    mayorMode: false,
    pendingDraft,
    isGameOver,
    gameOverReason,
    history: nextHistory,
    lastTurnEvent,
    tutorialStep: nextTutorialStep,
    tutorialCompleted,
  };
}

export function applyDraftChoice(state: GameState, optionId: string): GameState {
  if (!state.pendingDraft) return state;
  const chosen = state.pendingDraft.find((o) => o.id === optionId);
  if (!chosen) return state;

  let rng = state.rngState;
  let cardSeq = state.cardSeq;

  const nextPassives: PassiveState = {
    ...state.passives,
    appliedDraftIds: [...state.passives.appliedDraftIds, chosen.id],
  };

  switch (chosen.effectKey) {
    case 'eco_living':
      nextPassives.parkSynergyBonus += 2;
      break;
    case 'bustling_market':
      nextPassives.marketMultiplier += 0.25;
      break;
    case 'coastal_industry':
      nextPassives.factoryPenaltyHalved = true;
      break;
    case 'grand_landmark':
      nextPassives.mergeMultiplierBonus += 0.25;
      break;
    case 'urban_renewal':
      nextPassives.allBaseBonus += 2;
      break;
    case 'waterfront':
      nextPassives.coastalBonusExtra += 4;
      break;
    case 'chain_master':
      nextPassives.mergeFlatBonus += 12;
      break;
  }

  const newCards: Card[] = chosen.cards.map((type) => ({
    id: `c-${cardSeq++}`,
    type,
  }));

  // Guarantee special cards (landmark / bulldozer / crystal) show up near the front so players feel them right away
  const specials = newCards.filter(
    (c) => c.type === 'landmark' || c.type === 'bulldozer' || c.type === 'crystal',
  );
  const regulars = newCards.filter(
    (c) => c.type !== 'landmark' && c.type !== 'bulldozer' && c.type !== 'crystal',
  );
  const shuffledCombined = shuffleWithRng([...state.deck, ...regulars], rng);
  rng = shuffledCombined.nextState;

  const nextDeck = [...specials, ...shuffledCombined.items];
  const nextHand = [...state.hand];
  while (nextHand.length < HAND_SIZE && nextDeck.length > 0) {
    nextHand.push(nextDeck.shift()!);
  }

  // If the board is completely full and no card in hand can be placed, check game over
  let isGameOver = false;
  let gameOverReason: GameState['gameOverReason'] = null;
  if (nextHand.length === 0) {
    isGameOver = true;
    gameOverReason = 'no_cards';
  } else if (
    !hasAnyValidMove(state.board, nextHand) &&
    (!state.storedCard || !hasAnyValidMove(state.board, [state.storedCard])) &&
    state.mayorMarks === 0
  ) {
    isGameOver = true;
    gameOverReason = 'board_full';
  }

  return {
    ...state,
    hand: nextHand,
    deck: nextDeck,
    passives: nextPassives,
    rngState: rng,
    cardSeq,
    pendingDraft: null,
    selectedHandIndex: Math.min(state.selectedHandIndex, Math.max(0, nextHand.length - 1)),
    isGameOver,
    gameOverReason,
  };
}

export function swapWithStorehouse(state: GameState): GameState {
  if (state.isGameOver || state.pendingDraft || state.mode === 'tutorial') {
    return state;
  }
  const selected = state.hand[state.selectedHandIndex];
  if (!selected) return state;

  const nextHand = [...state.hand];
  const nextDeck = [...state.deck];
  let nextStored: Card | null = state.storedCard ? { ...state.storedCard } : null;

  if (nextStored) {
    // Swap selected hand card with stored card
    nextHand[state.selectedHandIndex] = nextStored;
    nextStored = selected;
  } else {
    // Stash selected card only if we have another card to play (either in deck or hand)
    if (nextHand.length <= 1 && nextDeck.length === 0) {
      return state;
    }
    nextStored = selected;
    nextHand.splice(state.selectedHandIndex, 1);
    if (nextDeck.length > 0) {
      nextHand.splice(state.selectedHandIndex, 0, nextDeck.shift()!);
    }
  }

  return {
    ...state,
    hand: nextHand,
    deck: nextDeck,
    storedCard: nextStored,
    mayorMode: false,
    selectedHandIndex: Math.min(state.selectedHandIndex, Math.max(0, nextHand.length - 1)),
  };
}

export function useMayorMark(
  state: GameState,
  row: number,
  col: number,
): GameState {
  if (
    state.isGameOver ||
    state.pendingDraft ||
    state.mode === 'tutorial' ||
    state.mayorMarks <= 0
  ) {
    return state;
  }
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return state;
  const tile = state.board[row][col];
  if (!tile.building && tile.terrain === 'grass') return state;

  const snapshot = cloneSnapshot(state);
  const nextHistory = [...state.history, snapshot].slice(-MAX_UNDOS);

  const nextBoard = cloneBoard(state.board);
  nextBoard[row][col].building = null;
  nextBoard[row][col].terrain = 'grass';

  return {
    ...state,
    board: nextBoard,
    population: calculatePopulation(nextBoard),
    mayorMarks: state.mayorMarks - 1,
    mayorMode: false,
    history: nextHistory,
    lastTurnEvent: null,
  };
}

export function undoLastTurn(state: GameState): GameState {
  if (state.undosLeft <= 0 || state.history.length === 0) return state;
  const previous = state.history[state.history.length - 1];
  const remainingHistory = state.history.slice(0, -1);

  return {
    ...state,
    ...cloneSnapshot(previous),
    mayorMode: false,
    pendingDraft: null,
    isGameOver: false,
    gameOverReason: null,
    undosLeft: state.undosLeft - 1,
    history: remainingHistory,
    selectedHandIndex: Math.min(
      state.selectedHandIndex,
      Math.max(0, previous.hand.length - 1),
    ),
    lastTurnEvent: null,
  };
}
