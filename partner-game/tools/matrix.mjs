// Full test matrix: every mission x track x size x graphics, plus a critical run per mission.
// node matrix.mjs [--jobs 4] [--shots dir]   Writes a summary table to stdout.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const jobs = Number(arg('jobs', '4')), shots = arg('shots', '');
const runs = [];
for (const m of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'])
  for (const track of ['SNFI', 'WASH']) for (const size of ['phone', 'laptop']) for (const gfx of ['high', 'low', '2d'])
    runs.push({ m, track, size, gfx, mode: 'perfect' });
for (const m of ['M1', 'M2', 'M4', 'M5', 'M6', 'M7']) runs.push({ m, track: 'SNFI', size: 'laptop', gfx: 'low', mode: 'critical' });
for (const m of ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']) runs.push({ m, track: 'WASH', size: 'phone', gfx: 'low', mode: 'mistakes' });

function one(r) {
  return new Promise((res) => {
    const script = r.m === 'M6' ? 'playtest.mjs' : 'autoplay.mjs';
    const a = [script, '--size', r.size, '--gfx', r.gfx, '--track', r.track, '--mode', r.mode, '--tag', `${r.m}-${r.size}-${r.gfx}-${r.track}-${r.mode}`];
    if (r.m !== 'M6') a.push('--mission', r.m); else a.push('--timescale', '2');
    if (shots) a.push('--shots', shots);
    const t0 = Date.now(); let out = '';
    const p = spawn('node', a, { cwd: here }); p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
    p.on('close', (code) => {
      const lines = out.trim().split('\n');
      let result = '';
      if (r.m === 'M6') { const st = out.match(/status: '(\w+)'/), sc = out.match(/score: (\d+)/), c = out.match(/correct: (\d+),\s*total: (\d+)/), sr = out.match(/stars: (\d)/); result = st ? `${st[1]} score ${sc && sc[1]} ${c ? c[1] + '/' + c[2] : ''} stars ${sr && sr[1]}` : ''; }
      else { const l = lines.find((x) => x.includes('→')); result = l ? l.split('→ ')[1] : ''; }
      const err = (lines.find((x) => x.startsWith('errors:')) || 'errors: ?').replace('errors: ', '');
      if (code !== 0 && shots) { mkdirSync(join(shots, 'fail-logs'), { recursive: true }); writeFileSync(join(shots, 'fail-logs', `${r.m}-${r.size}-${r.gfx}-${r.track}-${r.mode}.log`), out); }
      res({ ...r, code, secs: Math.round((Date.now() - t0) / 1000), result: result || lines.slice(-3).join(' ').slice(0, 160), errors: err });
    });
  });
}
const only = arg('only', ''); if (only) { const keep = only.split(','); for (let i = runs.length - 1; i >= 0; i--) { const r = runs[i]; if (!keep.includes(`${r.m}-${r.size}-${r.gfx}-${r.track}-${r.mode}`) && !keep.includes(r.m)) runs.splice(i, 1); } }
const results = []; let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => { while (next < runs.length) { const r = runs[next++]; const x = await one(r); results.push(x); console.error(`${results.length}/${runs.length} ${x.m} ${x.track} ${x.size} ${x.gfx} ${x.mode}: ${x.code === 0 ? 'OK' : 'FAIL'} ${x.result} (${x.secs}s)`); } }));
results.sort((a, b) => runs.indexOf(runs.find((r) => r.m === a.m && r.track === a.track && r.size === a.size && r.gfx === a.gfx && r.mode === a.mode)) - runs.indexOf(runs.find((r) => r.m === b.m && r.track === b.track && r.size === b.size && r.gfx === b.gfx && r.mode === b.mode)));
console.log('| Mission | Track | Size | Graphics | Mode | Result | Errors | Exit |');
console.log('|---|---|---|---|---|---|---|---|');
for (const x of results) console.log(`| ${x.m} | ${x.track} | ${x.size} | ${x.gfx} | ${x.mode} | ${x.result.replace(/\|/g, '/')} | ${x.errors} | ${x.code} |`);
const fails = results.filter((x) => x.code !== 0);
console.log(`\n${results.length} runs, ${fails.length} failed.`);
