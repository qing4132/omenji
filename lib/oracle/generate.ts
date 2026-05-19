import { GOLDENS } from './goldens';
import { EMOJIS, RARE_EMOJIS } from './emoji';
import { SKELETONS } from './skeletons';
import { SLOTS } from './slots';
import { chance, makeRng, pick, weightedPick } from './rng';
import type {
  OracleContext,
  OracleResult,
  PRNG,
  Rarity,
  SlotKey,
  SlotPicker,
} from './types';

const LEVELS = ['上上', '上', '中', '下', '下下', '无'] as const;

function makePicker(rng: PRNG): SlotPicker {
  return {
    rng,
    pick: <T,>(arr: readonly T[]) => pick(rng, arr),
    pickN: <T,>(arr: readonly T[], n: number) => {
      const pool = [...arr];
      const out: T[] = [];
      for (let i = 0; i < n && pool.length > 0; i++) {
        const idx = Math.floor(rng() * pool.length);
        out.push(pool.splice(idx, 1)[0]);
      }
      return out;
    },
    chance: (p: number) => chance(rng, p),
    slot: (key: SlotKey) => pick(rng, SLOTS[key]),
  };
}

function rollRarity(rng: PRNG): Rarity {
  const r = rng();
  if (r < 0.001) return 'meta';
  if (r < 0.006) return 'sequence';
  if (r < 0.026) return 'hidden';
  if (r < 0.096) return 'uncommon';
  return 'common';
}

export function buildSeed(ctx: OracleContext): string {
  const y = ctx.date.getFullYear();
  const m = String(ctx.date.getMonth() + 1).padStart(2, '0');
  const d = String(ctx.date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}:${ctx.fingerprint}`;
}

export function generate(seedOrCtx: string | OracleContext): OracleResult {
  const seed = typeof seedOrCtx === 'string' ? seedOrCtx : buildSeed(seedOrCtx);
  const rng = makeRng(seed);
  const s = makePicker(rng);
  const rarity = rollRarity(rng);

  // Meta sign: 元签
  if (rarity === 'meta') {
    return {
      emoji: pick(rng, RARE_EMOJIS),
      body: '此签无文。',
      rarity,
      skeletonId: 'meta',
      seed,
    };
  }

  // Body: 30% goldens / 65% skeleton / 5% goldens+skeleton 混合（按需）
  let body: string;
  let skeletonId: string;
  const bodyRoll = rng();
  if (bodyRoll < 0.3) {
    body = pick(rng, GOLDENS);
    skeletonId = 'golden';
  } else {
    // 罕见档优先抽 uncommon 骨架
    const pool =
      rarity === 'uncommon' || rarity === 'hidden'
        ? SKELETONS.filter((k) => k.rarity === 'uncommon')
        : SKELETONS.filter((k) => !k.rarity || k.rarity === 'common');
    const sk = weightedPick(rng, pool.length ? pool : SKELETONS);
    body = sk.render(s);
    skeletonId = sk.id;
  }

  // Emoji 独立采样；rare 档偶尔用 RARE_EMOJIS
  const emoji =
    rarity !== 'common' && chance(rng, 0.3)
      ? pick(rng, RARE_EMOJIS)
      : pick(rng, EMOJIS);

  // 每个槽位独立出现概率
  const result: OracleResult = {
    emoji,
    body,
    rarity,
    skeletonId,
    seed,
  };

  if (chance(rng, 0.45)) result.number = String(1 + Math.floor(rng() * 100));
  if (chance(rng, 0.55)) result.level = pick(rng, LEVELS);
  if (chance(rng, 0.5)) result.do = s.slot('doItem');
  if (chance(rng, 0.5)) result.dont = s.slot('dontItem');
  if (chance(rng, 0.35)) result.direction = s.slot('direction');
  if (chance(rng, 0.35)) {
    result.lucky = String(1 + Math.floor(rng() * 99));
  }
  if (chance(rng, 0.25)) {
    // 小字注解：用另一个骨架
    const noteSk = weightedPick(
      rng,
      SKELETONS.filter((k) => !k.rarity)
    );
    result.note = noteSk.render(s);
  }

  return result;
}

export function formatOracle(o: OracleResult): string {
  const lines: string[] = [];
  const head = [o.emoji];
  if (o.number) head.push(`第 ${o.number} 签`);
  if (o.level) head.push(`【${o.level}签】`);
  lines.push(head.join('  '));
  lines.push('');
  lines.push(o.body);
  if (o.note) lines.push(`  — ${o.note}`);
  const tail: string[] = [];
  if (o.do) tail.push(`宜：${o.do}`);
  if (o.dont) tail.push(`忌：${o.dont}`);
  if (o.direction) tail.push(`方位：${o.direction}`);
  if (o.lucky) tail.push(`数字：${o.lucky}`);
  if (tail.length) {
    lines.push('');
    lines.push(tail.join('　'));
  }
  if (o.rarity !== 'common') {
    lines.push('');
    lines.push(`（${o.rarity}）`);
  }
  return lines.join('\n');
}
