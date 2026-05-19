import { POEMS, DIRECTIONS, LUCKY_NUMS } from './poems';
import { chance, makeRng, pick } from './rng';
import type { OracleContext, OracleResult, Rarity } from './types';

export function buildSeed(ctx: OracleContext): string {
  const y = ctx.date.getFullYear();
  const m = String(ctx.date.getMonth() + 1).padStart(2, '0');
  const d = String(ctx.date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}:${ctx.fingerprint}`;
}

function rollRarity(rng: () => number): Rarity {
  const r = rng();
  if (r < 0.005) return 'meta';
  if (r < 0.06) return 'rare';
  return 'common';
}

export function generate(seedOrCtx: string | OracleContext): OracleResult {
  const seed = typeof seedOrCtx === 'string' ? seedOrCtx : buildSeed(seedOrCtx);
  const rng = makeRng(seed);
  const rarity = rollRarity(rng);

  let poem;
  if (rarity === 'meta') {
    poem = POEMS.find((p) => p.id === 30) ?? POEMS[POEMS.length - 1];
  } else {
    const pool = POEMS.filter((p) => p.id !== 30);
    poem = pool[Math.floor(rng() * pool.length)];
  }

  // emoji 与诗 1:1 绑定，是签的一部分
  const emoji = poem.emoji;
  const body = poem.lines.join('\n');

  const result: OracleResult = {
    emoji,
    poemId: poem.id,
    body,
    rarity,
    seed,
  };

  if (rarity === 'meta') {
    result.number = '〇';
    result.level = poem.level;
    return result;
  }

  if (chance(rng, 0.8)) {
    result.number = String(1 + Math.floor(rng() * 100));
  }

  if (chance(rng, 0.9)) {
    result.level = poem.level;
  }

  if (poem.do.length > 0 || poem.dont.length > 0) {
    const r = rng();
    const showDo = r < 0.9 && poem.do.length > 0;
    const showDont = (r < 0.7 || r >= 0.9) && poem.dont.length > 0;
    if (showDo) result.do = pick(rng, poem.do);
    if (showDont) result.dont = pick(rng, poem.dont);
  }

  if (chance(rng, 0.3)) result.direction = pick(rng, DIRECTIONS);
  if (chance(rng, 0.3)) result.lucky = pick(rng, LUCKY_NUMS);

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
  const tail: string[] = [];
  if (o.do) tail.push(`宜：${o.do}`);
  if (o.dont) tail.push(`忌：${o.dont}`);
  if (o.direction) tail.push(`方位：${o.direction}`);
  if (o.lucky) tail.push(`数：${o.lucky}`);
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
