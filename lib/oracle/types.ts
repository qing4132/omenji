export type Level = '上上' | '上' | '中' | '下' | '下下' | '无';

export type Rarity = 'common' | 'uncommon' | 'hidden' | 'sequence' | 'meta';

export type OracleResult = {
  emoji: string;
  number?: string;
  level?: Level;
  body: string;
  note?: string;
  do?: string;
  dont?: string;
  direction?: string;
  lucky?: string;
  rarity: Rarity;
  skeletonId: string;
  seed: string;
};

export type PRNG = () => number;

export type SlotPicker = {
  rng: PRNG;
  pick: <T>(arr: readonly T[]) => T;
  pickN: <T>(arr: readonly T[], n: number) => T[];
  chance: (p: number) => boolean;
  slot: (key: SlotKey) => string;
};

export type SlotKey =
  | 'imagery'      // 意象名词：旧伞 / 便利店 / 月亮
  | 'action'       // 动作：沉默 / 翻身 / 出走
  | 'abstract'     // 抽象：福报 / 班味 / 业力
  | 'modernPain'   // 当代具体：花呗 / 周报 / 早高峰
  | 'place'        // 地点：屋檐 / 地铁 / 工位
  | 'verb'         // 动词：等 / 退 / 散
  | 'adj'          // 形容：湿 / 钝 / 空
  | 'doItem'       // 宜
  | 'dontItem'     // 忌
  | 'direction'    // 方位
  | 'time';        // 时间状语

export type Skeleton = {
  id: string;
  weight: number;
  rarity?: Rarity;
  render: (s: SlotPicker) => string;
};

export type OracleContext = {
  date: Date;
  fingerprint: string;
};
