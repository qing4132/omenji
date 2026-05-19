export type Level = '上上' | '上' | '中' | '下' | '下下' | '空';

export type Rarity = 'common' | 'rare' | 'meta';

export type PRNG = () => number;

export type Poem = {
  id: number;
  lines: [string, string, string, string];
  emojis: readonly string[];
  theme?: string;
};

export type OracleResult = {
  emoji: string;
  poemId: number;
  body: string;
  number?: string;
  level?: Level;
  do?: string;
  dont?: string;
  direction?: string;
  lucky?: string;
  rarity: Rarity;
  seed: string;
};

export type OracleContext = {
  date: Date;
  fingerprint: string;
};
