import type { Skeleton } from './types';

// 句式骨架池：让相邻两支签长得不像。
export const SKELETONS: readonly Skeleton[] = [
  {
    id: 'judgement',
    weight: 10,
    render: (s) => `是${s.slot('imagery')}，也是${s.slot('imagery')}。`,
  },
  {
    id: 'rhetorical',
    weight: 8,
    render: (s) => `${s.slot('abstract')}又如何？${s.slot('modernPain')}又如何？`,
  },
  {
    id: 'ancient',
    weight: 8,
    render: (s) =>
      `${s.slot('imagery')}者，${s.slot('adj')}也。${s.slot('verb')}之，则${s.slot('abstract')}至。`,
  },
  {
    id: 'weather',
    weight: 9,
    render: (s) =>
      `今日${s.slot('abstract')}转${s.slot('abstract')}，局部有${s.slot('modernPain')}。`,
  },
  {
    id: 'manual',
    weight: 7,
    render: (s) =>
      `使用前请${s.slot('doItem')}。出现${s.slot('modernPain')}属正常现象。`,
  },
  {
    id: 'equation',
    weight: 6,
    render: (s) =>
      `${s.slot('imagery')} + ${s.slot('modernPain')} = ${s.slot('abstract')}，其中${s.slot('abstract')}不可解。`,
  },
  {
    id: 'recipe',
    weight: 6,
    render: (s) =>
      `取${s.slot('imagery')}一两，配${s.slot('abstract')}少许，冷藏至${s.slot('time')}。`,
  },
  {
    id: 'news',
    weight: 7,
    render: (s) =>
      `据悉，${s.slot('imagery')}已于${s.slot('time')}${s.slot('verb')}。当事人表示无可奉告。`,
  },
  {
    id: 'lyric',
    weight: 8,
    render: (s) => `${s.slot('place')}的${s.slot('imagery')}，没人在听。`,
  },
  {
    id: 'pure-imagery',
    weight: 9,
    render: (s) =>
      `${s.slot('imagery')}。${s.slot('place')}。${s.slot('imagery')}。`,
  },
  {
    id: 'dialogue',
    weight: 7,
    render: (s) => `问：${s.slot('modernPain')}？\n答：${s.slot('verb')}。`,
  },
  {
    id: 'oracle-classic',
    weight: 6,
    render: (s) =>
      `${s.slot('imagery')}临${s.slot('direction')}位，主${s.slot('abstract')}。`,
  },
  {
    id: 'observation',
    weight: 8,
    render: (s) =>
      `${s.slot('place')}的人都在${s.slot('action')}。你也可以。`,
  },
  {
    id: 'imperative',
    weight: 7,
    render: (s) => `别${s.slot('verb')}了。`,
  },
  {
    id: 'two-line',
    weight: 7,
    render: (s) =>
      `${s.slot('time')}的${s.slot('imagery')}，\n比${s.slot('time')}的${s.slot('imagery')}更${s.slot('adj')}。`,
  },
  {
    id: 'warning',
    weight: 5,
    render: (s) =>
      `警告：${s.slot('modernPain')}可能${s.slot('verb')}。建议${s.slot('doItem')}。`,
  },
  {
    id: 'fortune-cookie',
    weight: 6,
    render: (s) => `一个${s.slot('adj')}的${s.slot('imagery')}正在向你靠近。`,
  },
  {
    id: 'koan',
    weight: 5,
    render: (s) =>
      `${s.slot('imagery')}问${s.slot('imagery')}：${s.slot('verb')}吗？${s.slot('imagery')}说：${s.slot('verb')}。`,
  },
  {
    id: 'tiny',
    weight: 4,
    rarity: 'uncommon',
    render: (s) => `${s.slot('verb')}。`,
  },
  {
    id: 'one-char',
    weight: 2,
    rarity: 'uncommon',
    render: (s) => `${s.slot('adj')}。`,
  },
  {
    id: 'blank',
    weight: 1,
    rarity: 'uncommon',
    render: () => `。`,
  },
];
