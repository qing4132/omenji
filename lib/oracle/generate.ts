import { POEMS, DIRECTIONS, LUCKY_NUMS, GLOBAL_DO, GLOBAL_DONT } from './poems';
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

  // 签号 = 诗在签谱里的固定编号（与诗绑定，不随机）
  result.number = String(poem.id);

  // 吉凶等级 = 诗本身决定的核心信息，必显示
  result.level = poem.level;

  // 宜/忌：固定各 2 个 = 1 个贴题（诗自带）+ 1 个野生（全局池）
  // 野生项会过滤掉诗的 dont（对于宜）/ do（对于忌），
  // 保证不会明显与诗反着
  if (poem.do.length > 0) {
    const themed = pick(rng, poem.do);
    const blocked = new Set<string>([themed, ...poem.dont]);
    const wildPool = GLOBAL_DO.filter((w) => !blocked.has(w));
    const wild = pick(rng, wildPool);
    result.do = [themed, wild];
  }
  if (poem.dont.length > 0) {
    const themed = pick(rng, poem.dont);
    const blocked = new Set<string>([themed, ...poem.do]);
    const wildPool = GLOBAL_DONT.filter((w) => !blocked.has(w));
    const wild = pick(rng, wildPool);
    result.dont = [themed, wild];
  }

  // 方位/数字：必显示
  result.direction = pick(rng, DIRECTIONS);
  result.lucky = pick(rng, LUCKY_NUMS);

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
  if (o.do) tail.push(`宜：${o.do.join('、')}`);
  if (o.dont) tail.push(`忌：${o.dont.join('、')}`);
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
