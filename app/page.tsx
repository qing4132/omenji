'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { generate, buildSeed } from '@/lib/oracle/generate';
import type { OracleResult } from '@/lib/oracle/types';

const FP_KEY = 'omenji.fp';
const DAILY_KEY = 'omenji.daily';
const REROLL_KEY = 'omenji.reroll';

function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr';
  let fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type Phase = 'idle' | 'shaking' | 'revealing' | 'done';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [oracle, setOracle] = useState<OracleResult | null>(null);
  const [typed, setTyped] = useState('');
  const [rerollTaps, setRerollTaps] = useState(0);
  const holdStartRef = useRef<number | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(DAILY_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as { day: string; oracle: OracleResult };
      if (parsed.day !== todayKey()) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOracle(parsed.oracle);
      setTyped(parsed.oracle.body);
      setPhase('done');
    } catch {}
  }, []);

  const draw = useCallback(() => {
    const fp = getOrCreateFingerprint();
    const reroll = Number(localStorage.getItem(REROLL_KEY) ?? '0');
    const seed = buildSeed({
      date: new Date(),
      fingerprint: fp + (reroll ? `#${reroll}` : ''),
    });
    const o = generate(seed);
    setOracle(o);
    setTyped('');
    setPhase('revealing');
    localStorage.setItem(DAILY_KEY, JSON.stringify({ day: todayKey(), oracle: o }));

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    let i = 0;
    typingTimerRef.current = setInterval(() => {
      i++;
      setTyped(o.body.slice(0, i));
      if (i >= o.body.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setPhase('done');
      }
    }, 140);
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (phase !== 'idle') return;
      e.preventDefault();
      holdStartRef.current = Date.now();
      setPhase('shaking');
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (phase !== 'shaking') return;
      e.preventDefault();
      const held = Date.now() - (holdStartRef.current ?? Date.now());
      holdStartRef.current = null;
      if (held < 250) {
        setPhase('idle');
        return;
      }
      draw();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [phase, draw]);

  const startShake = () => {
    if (phase !== 'idle') return;
    setPhase('shaking');
    holdStartRef.current = Date.now();
  };
  const endShake = () => {
    if (phase !== 'shaking') return;
    const held = Date.now() - (holdStartRef.current ?? Date.now());
    holdStartRef.current = null;
    if (held < 250) {
      setPhase('idle');
      return;
    }
    draw();
  };

  const handleReroll = () => {
    setRerollTaps((n) => {
      const next = n + 1;
      if (next >= 3) {
        const cur = Number(localStorage.getItem(REROLL_KEY) ?? '0');
        localStorage.setItem(REROLL_KEY, String(cur + 1));
        localStorage.removeItem(DAILY_KEY);
        setOracle(null);
        setTyped('');
        setPhase('idle');
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#f5f2ec] px-6 py-10 text-zinc-900 dark:bg-[#0e0d0a] dark:text-zinc-100">
      <header className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-widest">签出 · Omenji</h1>
        <p className="mt-1 text-xs tracking-wider text-zinc-500">
          摇一摇，掉出今天的签
        </p>
      </header>

      <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center">
        {phase === 'idle' && !oracle && (
          <button
            onMouseDown={startShake}
            onMouseUp={endShake}
            onMouseLeave={endShake}
            onTouchStart={(e) => {
              e.preventDefault();
              startShake();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              endShake();
            }}
            className="group flex h-64 w-44 select-none flex-col items-center justify-center rounded-full border border-zinc-400/40 bg-gradient-to-b from-amber-50 to-amber-100 shadow-inner transition-transform active:scale-95 dark:from-zinc-800 dark:to-zinc-900"
          >
            <span className="text-5xl">🪄</span>
            <span className="mt-4 text-sm tracking-widest text-zinc-600 dark:text-zinc-400">
              按住摇签
            </span>
            <span className="mt-1 text-[10px] tracking-wider text-zinc-400">
              桌面端：按住空格
            </span>
          </button>
        )}

        {phase === 'shaking' && (
          <div className="flex h-64 w-44 animate-[shake_0.25s_ease-in-out_infinite] flex-col items-center justify-center rounded-full border border-zinc-400/40 bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner dark:from-zinc-700 dark:to-zinc-800">
            <span className="text-5xl">🎋</span>
            <span className="mt-4 text-sm tracking-widest text-zinc-700 dark:text-zinc-300">
              摇…摇…摇…
            </span>
          </div>
        )}

        {(phase === 'revealing' || phase === 'done') && oracle && (
          <div className="flex w-full flex-col items-center gap-4 px-2 py-6">
            <div className="animate-[pop_0.6s_ease-out] text-7xl">{oracle.emoji}</div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
              {oracle.number && <span>第 {oracle.number} 签</span>}
              {oracle.level && (
                <span className="rounded-full border border-zinc-400/50 px-2 py-0.5">
                  {oracle.level}签
                </span>
              )}
              {oracle.rarity !== 'common' && (
                <span className="rounded-full border border-amber-500/60 px-2 py-0.5 text-amber-600">
                  {oracle.rarity}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-center font-serif text-2xl leading-loose tracking-[0.2em] text-zinc-800 dark:text-zinc-100">
              {typed}
              {phase === 'revealing' && (
                <span className="ml-0.5 inline-block w-2 animate-pulse">▍</span>
              )}
            </p>
            {phase === 'done' &&
              (oracle.do || oracle.dont || oracle.direction || oracle.lucky) && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {oracle.do && <div>宜　{oracle.do}</div>}
                  {oracle.dont && <div>忌　{oracle.dont}</div>}
                  {oracle.direction && <div>方位　{oracle.direction}</div>}
                  {oracle.lucky && <div>数　{oracle.lucky}</div>}
                </div>
              )}
          </div>
        )}
      </main>

      <footer className="w-full max-w-md text-center text-xs text-zinc-400">
        {phase === 'done' && oracle && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleReroll}
              className="text-zinc-500 underline-offset-4 hover:underline"
            >
              {rerollTaps === 0 && '今日已签。诚心不足，需净手三次。'}
              {rerollTaps === 1 && '一次。'}
              {rerollTaps === 2 && '两次。'}
            </button>
            <p className="text-[10px] tracking-widest text-zinc-400">
              {todayKey()} · 一天一签
            </p>
          </div>
        )}
        {phase !== 'done' && (
          <p className="text-[10px] tracking-widest text-zinc-400">
            omen + emoji · 不是命理工具
          </p>
        )}
      </footer>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25%      { transform: translate(-4px, -2px) rotate(-3deg); }
          50%      { transform: translate(4px, 2px) rotate(3deg); }
          75%      { transform: translate(-3px, 3px) rotate(-2deg); }
        }
        @keyframes pop {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
