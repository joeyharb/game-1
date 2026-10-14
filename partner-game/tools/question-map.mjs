// Generate question_map.md from src/content.js: every item, its mission, track and source.
// node question-map.mjs   (run again after editing the content)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const sandbox = { window: {} }; vm.runInNewContext(readFileSync(join(here, '../src/content.js'), 'utf8'), sandbox);
const C = sandbox.window.CONTENT;
const TRACKS = ['SNFI', 'WASH'];
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
const textOf = (o) => {
  if (o.covers) return `Hub ${o.id}: covers ${o.covers}`;
  if (o.place && o.hh) return `Request card: ${o.place}, ${o.hh} households, ${o.kit}, assessed ${o.assessed}`;
  if (o.label && o.time) return `${o.label} (${o.time})`;
  if (o.kind === 'path' || o.kind === 'side') return `Site station: ${o.label}`;
  return o.prompt || o.text || o.title || o.label || o.ask || o.ok || o.why || '';
};
const rows = [];

function add(M, id, kind, o, ref, trk) {
  let answer = '', crit = new Set();
  if (o.critical) crit.add(o.critical);
  if (Array.isArray(o.options)) {
    const right = o.options.filter((x) => x.correct).map((x) => x.text);
    answer = right.join(' / ');
    o.options.forEach((x) => { if (x.critical) crit.add(x.critical); });
  } else if ('good' in o || /^(D|P)-/.test(id)) answer = o.good ? 'Belongs (take it)' : 'Does not belong (leave it)';
  else if ('ok' in o && typeof o.ok === 'boolean') answer = o.ok ? 'Right piece' : 'Wrong piece';
  else if (o.ok && o.bad) answer = o.ok;
  else if (o.place && o.hub) answer = `Hub: ${o.hub}`;
  else if (o.kind === 'path') answer = `Place it: step ${o.order} of the flow`;
  else if (o.kind) answer = /^X-/.test(id) ? 'Leave it out' : 'Place it';
  else if (/^X-/.test(id)) answer = 'Leave it out';
  if (o._answer) answer = o._answer;
  rows.push({ mission: M ? `M${M.number} ${M.title}` : 'All', id, kind, track: trk, text: clean(textOf(o)), answer: clean(answer), crit: [...crit].join(', '), ref: clean(o.ref || ref || '') });
}

function walk(M, node, path, ref, trk) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { const k = path[path.length - 1]; node.forEach((x, i) => walk(M, x, path.concat(String(i)), ref, TRACKS.includes(k) ? k : trk)); return; }
  const here = node.ref || ref;
  let t = trk;
  if (node.track) t = node.track;
  if (node.notTrack) t = TRACKS.filter((x) => x !== node.notTrack).join(', ');
  const key = path[path.length - 1];
  if (TRACKS.includes(key)) t = key;
  // finale scenarios: each node is one item
  if (node.nodes && node.start) {
    Object.keys(node.nodes).forEach((k) => add(M, `${node.id}.${k}`, `Final emergency: ${node.title}`, node.nodes[k], here, t));
    return;
  }
  const inArray = /^\d+$/.test(key || '');
  const isItem = (node.options && (node.prompt || node.text)) || ((node.text || node.prompt || node.label || node.covers || node.place) && here && (inArray || node.id)) ||
                 (node.why && node.ref) || (node.text && node.ref) || (node.ok && node.bad && node.ref);
  if (isItem && path.length > 1) {
    const id = node.id || path.slice(1).filter((x) => !/^\d+$/.test(x)).join('.') + (path.some((x) => /^\d+$/.test(x)) ? '#' + path.filter((x) => /^\d+$/.test(x)).map((n) => Number(n) + 1).join('.') : '');
    add(M, id, path[1], node, here, t);
    if (node.options) return;
  }
  Object.keys(node).forEach((k) => {
    if (k === 'options' || typeof node[k] !== 'object') return;
    // households: the source and right answer come from the outcome for their kind
    if (k === 'households' && node.outcomes) {
      node[k].forEach((h) => { const o = node.outcomes[h.kind] || {}; add(M, h.id, 'households', Object.assign({}, h, { _answer: o.ok, critical: o.critical }), o.ref, t); });
      return;
    }
    // kit check: the item that does not belong, per track
    if (k === 'intruders') {
      Object.keys(node[k]).forEach((tk) => node[k][tk].forEach((it, i) => add(M, `kit.${tk}.${i + 1}`, 'Kit check', { text: `Odd one out in a ${tk} kit: ${it}`, _answer: 'Spot it before signing' }, (node.ok || {}).ref, tk)));
      return;
    }
    // request form slots: one row per piece, per track
    if (k === 'slots') {
      node[k].forEach((sl) => Object.keys(sl.pieces).forEach((tk) => sl.pieces[tk].forEach((pc, i) =>
        add(M, `${sl.id}.${tk === 'ALL' ? 'both' : tk}.${i + 1}`, `Form slot: ${sl.label}`, Object.assign({}, pc, { _answer: pc.ok ? 'Right piece' : 'Wrong piece' }), pc.ref || sl.ref, tk === 'ALL' ? t : tk))));
      return;
    }
    // a list may take its source from a sibling "<name>Ref" (or "<singular>Ref")
    walk(M, node[k], path.concat(k), node[k + 'Ref'] || node[k.replace(/s$/, '') + 'Ref'] || here, t);
  });
}

C.missions.forEach((M) => walk(M, M, [M.id], M.ref || '', 'Both'));

const out = [];
out.push('# Question map: Last Mile Heroes', '');
out.push('Every item in the game, with its mission, track and source section. Generated from `src/content.js` by `tools/question-map.mjs`: run `node tools/question-map.mjs` after editing the content, do not edit this file by hand.', '');
out.push(`Game version ${C.meta.version}. ${rows.length} items in ${C.missions.length} missions, plus ${Object.keys(C.criticalRules).length} critical rules.`, '');
out.push('**Sources**: SOP = IOM South Sudan Core Pipeline Operations SOP (Draft 1, Sept 2026), the main source. AG = CP Distribution Agreement 2026 (partner clauses). A1 to A7 = agreement annexes. WS = WASH Cluster Core Pipeline SOP (Jan 2026). IN/234 = IOM policy on PSEA. Full list in `SOURCES.md`.', '');
out.push('**Track**: Both = shown on both tracks. SNFI or WASH = shown on that track only. Items in a pool (events, documents, households, scenarios, calls) are drawn at random each run, so a single run shows only some of them.', '');
out.push('## Track facts', '', 'Used across the missions: the kits, the report and its deadline.', '', '| Track | Cluster | Kits | Report and deadline | Source |', '|---|---|---|---|---|');
TRACKS.forEach((tk) => { const T = C.tracks[tk]; out.push(`| ${tk} | ${clean(T.cluster)} | ${T.kits.map((k) => `**${clean(k.name)}**: ${clean(k.items.join(', '))} (${clean(k.ref)})`).join('<br>')} | ${clean(T.report)}, within ${clean(T.reportDeadline)} | ${clean(T.reportRef)} |`); });
out.push('');
out.push('## Critical rules', '', '| Rule | Title | Rule text | Source |', '|---|---|---|---|');
Object.keys(C.criticalRules).forEach((k) => { const r = C.criticalRules[k]; out.push(`| ${k} | ${clean(r.title)} | ${clean(r.rule)} | ${clean(r.ref)} |`); });
C.missions.forEach((M) => {
  const R = rows.filter((r) => r.mission === `M${M.number} ${M.title}`);
  out.push('', `## Mission ${M.number}: ${M.title}`, '', `${clean(M.topic)}. Critical rules in play: ${(M.rulesInPlay || []).join(', ') || 'none'}. ${R.length} items.`, '');
  out.push('| ID | Part | Track | What the player sees | Right answer | Critical | Source |', '|---|---|---|---|---|---|---|');
  R.forEach((r) => out.push(`| ${r.id} | ${clean(r.kind)} | ${r.track} | ${r.text} | ${r.answer} | ${r.crit} | ${r.ref} |`));
});
const missing = rows.filter((r) => !r.ref);
out.push('', '## Check', '', missing.length ? `**${missing.length} items have no source:** ${missing.map((r) => r.id).join(', ')}` : 'Every item has a source.', '');
writeFileSync(join(here, '../question_map.md'), out.join('\n'));
console.log(`question_map.md: ${rows.length} items; without source: ${missing.length}`);
missing.forEach((r) => console.log('  no source:', r.mission, r.id));
