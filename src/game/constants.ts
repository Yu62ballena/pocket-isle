import type {
  AchievementDef,
  AtmosphereId,
  BuildingType,
  CardType,
  DraftOption,
  TerrainType,
  Tile,
} from './types';

export const BOARD_SIZE = 6;
export const HAND_SIZE = 3;
export const INITIAL_DECK_SIZE = 20;
export const MAX_UNDOS = 3;
export const MAX_MAYOR_MARKS = 3;

export interface CardMeta {
  type: CardType;
  name: string;
  shortName: string;
  levelNames: [string, string, string, string];
  baseScores: [number, number, number, number];
  accentBg: string;
  accentBorder: string;
  accentText: string;
  summary: string;
  likes: string;
  dislikes: string;
  mergeable: boolean;
}

export const CARD_META: Record<CardType, CardMeta> = {
  house: {
    type: 'house',
    name: '民家',
    shortName: '民家',
    levelNames: ['コテージ', 'タウンハウス', 'マンション', 'スカイタワー'],
    baseScores: [4, 12, 30, 70],
    accentBg: 'from-rose-500/20 to-orange-400/20',
    accentBorder: 'border-rose-400/60',
    accentText: 'text-rose-700',
    summary: '街の主役。公園や市場のそばでグングン成長！',
    likes: '公園+5 / 市場+4 / 森+3 / 池+3',
    dislikes: '工場-5',
    mergeable: true,
  },
  park: {
    type: 'park',
    name: '公園',
    shortName: '公園',
    levelNames: ['さくら広場', '大公園', '植物園', 'エデン庭園'],
    baseScores: [3, 10, 26, 60],
    accentBg: 'from-emerald-500/20 to-teal-400/20',
    accentBorder: 'border-emerald-400/60',
    accentText: 'text-emerald-700',
    summary: 'みんなを笑顔にする緑のオアシス。',
    likes: '池+5 / 民家+4 / 森+4 / 市場+2',
    dislikes: '工場-4',
    mergeable: true,
  },
  market: {
    type: 'market',
    name: '市場',
    shortName: '市場',
    levelNames: ['にぎわい屋台', '商店街', 'デパート', 'グランドモール'],
    baseScores: [5, 14, 34, 75],
    accentBg: 'from-amber-500/20 to-yellow-400/20',
    accentBorder: 'border-amber-400/60',
    accentText: 'text-amber-700',
    summary: '港・民家・工場をつなぐ商業ハブ。高得点狙いの要！',
    likes: '港+6 / 民家+5 / 工場+4 / 公園+2',
    dislikes: '市場同士-2（3つ揃えて合体させよう！）',
    mergeable: true,
  },
  factory: {
    type: 'factory',
    name: '工場',
    shortName: '工場',
    levelNames: ['レンガ工房', '精密工場', 'ハイテク拠点', '未来プラント'],
    baseScores: [7, 18, 42, 90],
    accentBg: 'from-slate-500/25 to-indigo-400/20',
    accentBorder: 'border-slate-400/70',
    accentText: 'text-slate-700',
    summary: '基礎点トップ！丘や港と組めば爆伸び。住宅街とは離して配置。',
    likes: '港+6 / 丘+5 / 市場+4 / 工場+3',
    dislikes: '民家-4 / 公園-4（Lv3+は半減）',
    mergeable: true,
  },
  harbor: {
    type: 'harbor',
    name: '港',
    shortName: '港',
    levelNames: ['小さな桟橋', '漁港', '貿易港', 'マリーナシティ'],
    baseScores: [5, 14, 34, 75],
    accentBg: 'from-sky-500/20 to-cyan-400/20',
    accentBorder: 'border-sky-400/60',
    accentText: 'text-sky-700',
    summary: '海沿い（島の端）に置くだけで+8pt！交易の要。',
    likes: '海沿い+8 / 市場+5 / 工場+5 / 池+5',
    dislikes: 'なし（内陸より海辺が◎）',
    mergeable: true,
  },
  landmark: {
    type: 'landmark',
    name: 'ランドマーク',
    shortName: '名所',
    levelNames: ['光の時計台', '光の時計台', '光の時計台', '光の時計台'],
    baseScores: [20, 20, 20, 20],
    accentBg: 'from-fuchsia-500/25 to-amber-400/25',
    accentBorder: 'border-fuchsia-400/70',
    accentText: 'text-fuchsia-700',
    summary: '周囲8マスすべての建物から+4ptを集める切り札！',
    likes: '周囲8マスの全建物 各+4',
    dislikes: 'なし',
    mergeable: false,
  },
  bulldozer: {
    type: 'bulldozer',
    name: '整地ツール',
    shortName: '整地',
    levelNames: ['ブルドーザー', 'ブルドーザー', 'ブルドーザー', 'ブルドーザー'],
    baseScores: [5, 5, 5, 5],
    accentBg: 'from-orange-500/25 to-red-400/20',
    accentBorder: 'border-orange-400/70',
    accentText: 'text-orange-700',
    summary: '邪魔な建物や地形を更地に戻す！大連鎖の仕込みに◎',
    likes: '既設の建物・森・池・丘に使用可能',
    dislikes: '更地には使えない',
    mergeable: false,
  },
  crystal: {
    type: 'crystal',
    name: '虹のクリスタル',
    shortName: 'クリスタル',
    levelNames: ['虹のクリスタル', '虹のクリスタル', '虹のクリスタル', '虹のクリスタル'],
    baseScores: [12, 12, 12, 12],
    accentBg: 'from-cyan-400/25 via-fuchsia-400/25 to-amber-300/25',
    accentBorder: 'border-cyan-400/80',
    accentText: 'text-cyan-700',
    summary: '万能ワイルドカード！隣接する同種2つ以上と合体して一気に進化させる！',
    likes: 'どの建物の2つ揃いにも合体可能（Lv2→Lv3、Lv3→Lv4の切り札！）',
    dislikes: '合体できる隣がないと基礎点のみ',
    mergeable: false,
  },
};

export const TERRAIN_META: Record<
  TerrainType,
  { name: string; hint: string }
> = {
  grass: { name: '草原', hint: '建物を自由に配置できる' },
  forest: { name: '森', hint: '民家+3 / 公園+4 の自然ボーナス' },
  pond: { name: '池', hint: '公園+5 / 港+5 / 民家+3 の水辺ボーナス' },
  hill: { name: '丘', hint: '工場+5 の資源ボーナス' },
};

/**
 * Synergy matrix: when placing `placed` adjacent (orthogonal) to an existing building `neighbor`.
 */
export const BUILDING_SYNERGY: Record<
  BuildingType,
  Partial<Record<BuildingType, number>>
> = {
  house: {
    park: 5,
    market: 4,
    house: 2,
    factory: -5,
    landmark: 4,
  },
  park: {
    house: 4,
    market: 2,
    park: 2,
    factory: -4,
    landmark: 4,
  },
  market: {
    harbor: 6,
    house: 5,
    factory: 4,
    park: 2,
    market: -2,
    landmark: 4,
  },
  factory: {
    harbor: 6,
    market: 4,
    factory: 3,
    house: -4,
    park: -4,
    landmark: 4,
  },
  harbor: {
    market: 5,
    factory: 5,
    park: 2,
    harbor: 2,
    landmark: 4,
  },
  landmark: {
    house: 4,
    park: 4,
    market: 4,
    factory: 4,
    harbor: 4,
    landmark: 8,
  },
};

export const TERRAIN_SYNERGY: Record<
  BuildingType,
  Partial<Record<TerrainType, number>>
> = {
  house: { forest: 3, pond: 3 },
  park: { pond: 5, forest: 4 },
  market: { pond: 2 },
  factory: { hill: 5 },
  harbor: { pond: 5 },
  landmark: { forest: 3, pond: 3, hill: 3 },
};

export const RANK_THRESHOLDS = [
  0, // Rank 1
  45, // Rank 2
  110, // Rank 3
  200, // Rank 4
  320, // Rank 5
  470, // Rank 6
  660, // Rank 7
  890, // Rank 8
  1170, // Rank 9
  1500, // Rank 10
  1900, // Rank 11
  2350, // Rank 12
];

export function getThresholdForRank(rank: number): number {
  if (rank <= 1) return 0;
  const idx = rank - 1;
  if (idx < RANK_THRESHOLDS.length) {
    return RANK_THRESHOLDS[idx];
  }
  const extra = idx - (RANK_THRESHOLDS.length - 1);
  return RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1] + extra * 520;
}

export function getAtmosphereForRank(rank: number): {
  id: AtmosphereId;
  label: string;
  tagline: string;
  bgClass: string;
  seaClass: string;
  isNight: boolean;
} {
  if (rank <= 2) {
    return {
      id: 'morning',
      label: 'さわやかな朝',
      tagline: 'MORNING BREEZE',
      bgClass: 'from-sky-100 via-cyan-50 to-emerald-50 text-slate-800',
      seaClass: 'from-sky-400 via-cyan-400 to-teal-400',
      isNight: false,
    };
  }
  if (rank <= 4) {
    return {
      id: 'day',
      label: 'きらめく昼',
      tagline: 'SUNLIT DAY',
      bgClass: 'from-blue-100 via-sky-50 to-amber-50 text-slate-800',
      seaClass: 'from-blue-500 via-sky-400 to-cyan-400',
      isNight: false,
    };
  }
  if (rank <= 6) {
    return {
      id: 'sunset',
      label: '黄金の夕暮れ',
      tagline: 'GOLDEN HOUR',
      bgClass: 'from-orange-200 via-rose-100 to-amber-100 text-slate-900',
      seaClass: 'from-indigo-500 via-rose-400 to-amber-400',
      isNight: false,
    };
  }
  return {
    id: 'night',
    label: '星降る夜景',
    tagline: 'STARLIGHT NEON',
    bgClass: 'from-slate-950 via-indigo-950 to-slate-900 text-slate-100',
    seaClass: 'from-slate-900 via-indigo-900 to-cyan-950',
    isNight: true,
  };
}

export const DRAFT_POOL: DraftOption[] = [
  {
    id: 'eco_living',
    title: 'エコ住宅計画',
    subtitle: '緑と暮らしが響き合う癒しの街',
    accent: 'from-emerald-500 to-teal-500',
    badge: 'ECO',
    cards: ['house', 'house', 'house', 'park', 'park', 'park'],
    passiveDescription: '公園が絡む隣接ボーナス +2',
    effectKey: 'eco_living',
  },
  {
    id: 'bustling_market',
    title: 'にぎわい商業圏',
    subtitle: '商店街からグランドモールへ一気に稼ぐ',
    accent: 'from-amber-500 to-orange-500',
    badge: 'TRADE',
    cards: ['market', 'market', 'market', 'house', 'house', 'harbor'],
    passiveDescription: '市場を置いたときの合計スコア +25%',
    effectKey: 'bustling_market',
  },
  {
    id: 'coastal_industry',
    title: '臨海工業ベルト',
    subtitle: '港と工場の黄金コンビでハイスコア量産',
    accent: 'from-slate-600 to-indigo-600',
    badge: 'POWER',
    cards: ['factory', 'factory', 'factory', 'harbor', 'harbor', 'market'],
    passiveDescription: '工場のマイナス影響を半減',
    effectKey: 'coastal_industry',
  },
  {
    id: 'chain_master',
    title: '大連鎖マスター',
    subtitle: '虹のクリスタル＆同種合体でLv4と大連鎖を狙う',
    accent: 'from-violet-500 to-amber-500',
    badge: 'COMBO',
    cards: ['crystal', 'house', 'house', 'park', 'market', 'market'],
    passiveDescription: '合体進化するたびに追加ボーナス +12pt',
    effectKey: 'chain_master',
  },
  {
    id: 'grand_landmark',
    title: '観光ランドマーク',
    subtitle: '名所とクリスタルで一気に街を格上げ',
    accent: 'from-fuchsia-500 to-pink-500',
    badge: 'SPECIAL',
    cards: ['landmark', 'crystal', 'park', 'house', 'market'],
    passiveDescription: '合体進化(MERGE)の倍率 +0.25',
    effectKey: 'grand_landmark',
  },
  {
    id: 'urban_renewal',
    title: '都市再開発プラン',
    subtitle: '整地ツールで詰まりを解消し街を再設計',
    accent: 'from-orange-500 to-rose-500',
    badge: 'REBUILD',
    cards: ['bulldozer', 'house', 'market', 'park', 'harbor', 'factory'],
    passiveDescription: 'すべての建物の基礎点 +2',
    effectKey: 'urban_renewal',
  },
  {
    id: 'waterfront',
    title: 'ウォーターフロント',
    subtitle: '島の海岸線ぜんぶを絶景マリーナに',
    accent: 'from-sky-500 to-cyan-500',
    badge: 'SEA',
    cards: ['harbor', 'harbor', 'harbor', 'park', 'market', 'house'],
    passiveDescription: '港の海沿いボーナス さらに +4',
    effectKey: 'waterfront',
  },
];

const POPULATION_TABLE: Record<BuildingType, [number, number, number, number]> = {
  house: [120, 480, 1600, 6500],
  park: [40, 150, 500, 1800],
  market: [80, 320, 1100, 4200],
  factory: [60, 240, 850, 3200],
  harbor: [70, 280, 950, 3600],
  landmark: [1500, 1500, 1500, 1500],
};

export function calculatePopulation(board: Tile[][]): number {
  let total = 0;
  for (const row of board) {
    for (const tile of row) {
      if (tile.building) {
        total += POPULATION_TABLE[tile.building.type][tile.building.level - 1];
      }
    }
  }
  return total;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_merge',
    title: 'はじめての合体進化',
    description: '同じ建物3つをつなげてLv2へ進化させた',
    emoji: '✨',
  },
  {
    id: 'chain_reaction',
    title: '脳汁チェーン！',
    description: '1手で2連鎖以上の合体コンボを決めた',
    emoji: '⚡',
  },
  {
    id: 'sky_high',
    title: 'ランドマーク級の高さ',
    description: 'Lv3以上の建物を完成させた',
    emoji: '🏙️',
  },
  {
    id: 'ultimate_lv4',
    title: '奇跡のLv4モニュメント',
    description: '最大ランクLv4の建物を誕生させた',
    emoji: '👑',
  },
  {
    id: 'big_shot_50',
    title: '一撃50ptオーバー',
    description: '1手の配置で50ポイント以上を叩き出した',
    emoji: '💥',
  },
  {
    id: 'golden_hour',
    title: '黄金の夕暮れ',
    description: '街ランク5に到達した',
    emoji: '🌅',
  },
  {
    id: 'starlight_city',
    title: '眠らない夜景都市',
    description: '街ランク7に到達して夜景を解放した',
    emoji: '🌃',
  },
  {
    id: 'score_800',
    title: '伝説の島クリエイター',
    description: '1プレイで800スコア以上を達成した',
    emoji: '🏆',
  },
];

export function getCityTitle(
  counts: Record<BuildingType, number>,
  rank: number,
  maxChain: number,
): { title: string; subtitle: string } {
  if (rank >= 7) {
    return {
      title: '星降る奇跡のメトロポリス',
      subtitle: '夜空まで光り輝く、誰もが憧れる理想郷',
    };
  }
  if (maxChain >= 2) {
    return {
      title: '連鎖きらめく建築アート島',
      subtitle: '緻密な配置が鮮やかなコンボを生んだ名設計',
    };
  }
  const entries = (Object.entries(counts) as Array<[BuildingType, number]>).sort(
    (a, b) => b[1] - a[1],
  );
  const top = entries[0]?.[0] ?? 'house';
  switch (top) {
    case 'park':
      return {
        title: '桜と風そよぐエコ・ガーデン',
        subtitle: '自然のぬくもりに包まれた癒しのアイランド',
      };
    case 'market':
      return {
        title: '笑顔あふれる黄金の商業島',
        subtitle: '朝から晩まで活気が絶えないにぎわいの街',
      };
    case 'harbor':
      return {
        title: '潮風かおる貿易マリーナ',
        subtitle: '海と街がひとつになった絶景の港町',
      };
    case 'factory':
      return {
        title: '未来を拓くクラフト工業都市',
        subtitle: '力強いものづくりが息づくハイテクアイランド',
      };
    case 'landmark':
      return {
        title: '夢と光の観光リゾート島',
        subtitle: '象徴的な名所が人々を惹きつける特別な街',
      };
    default:
      return {
        title: 'あたたかい灯りのホームタウン',
        subtitle: '暮らしやすさ抜群の愛される小さな街',
      };
  }
}
