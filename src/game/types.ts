export type TerrainType = 'grass' | 'forest' | 'pond' | 'hill';

export type BuildingType =
  | 'house'
  | 'park'
  | 'market'
  | 'factory'
  | 'harbor'
  | 'landmark';

export type CardType = BuildingType | 'bulldozer';

export type GameMode = 'free' | 'daily';

export type AtmosphereId = 'morning' | 'day' | 'sunset' | 'night';

export interface BuildingInstance {
  type: BuildingType;
  level: 1 | 2 | 3 | 4;
}

export interface Tile {
  row: number;
  col: number;
  terrain: TerrainType;
  isCoastal: boolean;
  building: BuildingInstance | null;
}

export interface Card {
  id: string;
  type: CardType;
}

export interface SynergyDetail {
  sourceRow: number;
  sourceCol: number;
  delta: number;
  label: string;
}

export interface MergeStepPreview {
  level: 2 | 3 | 4;
  buildingType: BuildingType;
  consumedCoords: Array<{ row: number; col: number }>;
  bonus: number;
}

export interface PlacementPreview {
  valid: boolean;
  row: number;
  col: number;
  cardType: CardType;
  baseScore: number;
  synergyScore: number;
  coastalBonus: number;
  mergeScore: number;
  chainCount: number;
  multiplier: number;
  totalScore: number;
  synergies: SynergyDetail[];
  mergeSteps: MergeStepPreview[];
  resultingLevel?: 1 | 2 | 3 | 4;
}

export interface PassiveState {
  parkSynergyBonus: number;
  marketMultiplier: number; // e.g. 0.25 means +25%
  factoryPenaltyHalved: boolean;
  mergeMultiplierBonus: number;
  mergeFlatBonus: number;
  allBaseBonus: number;
  coastalBonusExtra: number;
  appliedDraftIds: string[];
}

export interface DraftOption {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  badge: string;
  cards: CardType[];
  passiveDescription: string;
  effectKey:
    | 'eco_living'
    | 'bustling_market'
    | 'coastal_industry'
    | 'grand_landmark'
    | 'urban_renewal'
    | 'waterfront'
    | 'chain_master';
}

export type QuestKind =
  | 'place_pair_house_park'
  | 'trigger_merge'
  | 'coastal_harbor'
  | 'big_turn_22'
  | 'big_turn_40'
  | 'reach_lv3'
  | 'trigger_chain'
  | 'place_market_near_house'
  | 'place_factory_near_harbor'
  | 'place_landmark';

export interface Quest {
  id: string;
  kind: QuestKind;
  title: string;
  description: string;
  rewardCards: number;
  rewardPoints: number;
}

export interface TurnEventSummary {
  turnNumber: number;
  row: number;
  col: number;
  cardType: CardType;
  totalScore: number;
  chainCount: number;
  mergedToLevel: number | null;
  synergyCount: number;
  completedQuests: Quest[];
  leveledUpTo: number | null;
  unlockedAchievements: string[];
  affectedNeighbors: Array<{ row: number; col: number; delta: number }>;
}

export interface RunStats {
  turns: number;
  bestTurnScore: number;
  maxChain: number;
  totalMerges: number;
  maxBuildingLevel: number;
  questsCompleted: number;
  buildingCounts: Record<BuildingType, number>;
}

export interface GameSnapshot {
  board: Tile[][];
  score: number;
  rank: number;
  hand: Card[];
  deck: Card[];
  quests: Quest[];
  passives: PassiveState;
  stats: RunStats;
  rngState: number;
  cardSeq: number;
  questSeq: number;
}

export interface GameState extends GameSnapshot {
  mode: GameMode;
  seedLabel: string;
  selectedHandIndex: number;
  pendingDraft: DraftOption[] | null;
  isGameOver: boolean;
  gameOverReason: 'no_cards' | 'board_full' | null;
  undosLeft: number;
  history: GameSnapshot[];
  lastTurnEvent: TurnEventSummary | null;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export interface StoredProgress {
  highScoreFree: number;
  highScoreDaily: Record<string, number>;
  totalRuns: number;
  bestRank: number;
  unlockedAchievements: string[];
  muted: boolean;
}
