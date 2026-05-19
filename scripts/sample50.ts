import { formatOracle, generate } from '../lib/oracle/generate';

const n = Number(process.argv[2] ?? 50);
for (let i = 0; i < n; i++) {
  const seed = `sample-${i}-${Math.random().toString(36).slice(2, 8)}`;
  const o = generate(seed);
  console.log('────────────────────────────────');
  console.log(formatOracle(o));
}
console.log('────────────────────────────────');
console.log(`共 ${n} 支。`);
